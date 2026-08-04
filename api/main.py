from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import os
import sys
import subprocess
from functools import wraps

# Ensuring the project root is in sys.path
project_root = os.getcwd()
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- Global Supabase Client ---
_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        # Import inside to avoid circular dependency if any
        from api.supabase_builder import get_supabase_client as init_client
        _supabase_client = init_client()
    return _supabase_client

# --- Dependency Injection Decorator ---
def with_supabase(f):
    """
    Decorator to inject a synchronous Supabase client into the route function.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        supabase = get_supabase()
        return f(supabase, *args, **kwargs)
    return decorated_function

def fetch_metrics(supabase, entity_name):
    """
    Helper to fetch metrics using an injected client.
    """
    try:
        response = supabase.table("metrics").select("*").eq("entity_name", entity_name).execute()
        metrics_dict = {}
        for row in response.data:
            metrics_dict[row['metric_type'].lower()] = row['data']
        return metrics_dict
    except Exception as e:
        print(f"Error fetching metrics for {entity_name}: {e}")
        return None

# --- ROUTES ---

@app.route('/api/', methods=['GET'])
def root():
    return jsonify({'message': 'Welcome to SarvSynth API', 'status': 'OK'}), 200

@app.route('/api/patients', methods=['GET'])
@with_supabase
def get_patients(supabase):
    """Return patients from Supabase"""
    try:
        limit = request.args.get('limit', default=100, type=int)
        response = supabase.table("patients").select("*").limit(limit).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve patients: {str(e)}'}), 500

@app.route('/api/generate_data/', methods=['GET'])
def generate_data():
    """Trigger data generation script (either local or via GitHub Actions if configured)"""
    try:
        num_patients = request.args.get('num_patients', type=int)

        if num_patients is None or num_patients <= 0:
            raise ValueError("num_patients must be a positive integer")

        state = request.args.get('state', default=None, type=str)
        if not state or state.strip() == "":
            state = "Massachusetts"
        
        # Determine execution mode: GitHub Action, local testing, or disallowed
        github_token = os.getenv("GITHUB_TOKEN")
        github_repo = os.getenv("GITHUB_REPOSITORY")
        github_ref = os.getenv("GITHUB_REF", "main")
        local_mode = os.getenv("LOCAL_MODE", "false").lower() == "true"

        if github_token and github_repo:
            # GitHub Action dispatch flow (unchanged)
            import urllib.request
            import json
            
            workflow_filename = "data_pipeline.yml"
            url = f"https://api.github.com/repos/{github_repo}/actions/workflows/{workflow_filename}/dispatches"
            
            payload = {
                "ref": github_ref,
                "inputs": {
                    "num_patients": str(num_patients),
                    "region": state if state else "Massachusetts"
                }
            }
            
            def stream_github():
                try:
                    yield "data: [SYSTEM] Preparing to dispatch GitHub Action...\n\n"
                    data = json.dumps(payload).encode('utf-8')
                    req = urllib.request.Request(
                        url,
                        data=data,
                        headers={
                            "Accept": "application/vnd.github+json",
                            "Authorization": f"Bearer {github_token}",
                            "X-GitHub-Api-Version": "2022-11-28",
                            "User-Agent": "SarvSynth-App",
                            "Content-Type": "application/json"
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(req) as response:
                        if response.status == 204:
                            yield f"data: GitHub Action successfully triggered: Generating {num_patients} patients in {state} region asynchronously on GitHub runners.\n\n"
                            yield "data: [SUCCESS] GitHub Action triggered successfully!\n\n"
                        else:
                            yield f"data: [ERROR] Failed to trigger GitHub Action: {response.status} {response.reason}\n\n"
                except Exception as github_err:
                    yield f"data: [ERROR] GitHub Actions Dispatch failed: {str(github_err)}\n\n"
            
            return Response(stream_github(), content_type='text/event-stream', headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            })
        elif local_mode:
            # Local subprocess generation (only when LOCAL_MODE=true)
            script_path = os.path.join(project_root, "workflows", "scripts", "synthea-init.sh")
            if not os.path.exists(script_path):
                return jsonify({"status": "error", "message": "Synthea script not found"}), 404
            cmd = [script_path, str(num_patients)]
            if state:
                cmd.append(state)
            
            def stream_output():
                try:
                    process = subprocess.Popen(
                        cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,
                        text=True,
                        bufsize=1
                    )
                    for line in iter(process.stdout.readline, ""):
                        yield f"data: {line.rstrip()}\n\n"
                    process.stdout.close()
                    return_code = process.wait()
                    if return_code != 0:
                        yield f"data: [ERROR] Generation failed with exit code {return_code}\n\n"
                    else:
                        yield "data: [SUCCESS] Patient records generated successfully!\n\n"
                except Exception as stream_err:
                    yield f"data: [ERROR] {str(stream_err)}\n\n"
            
            return Response(stream_output(), content_type='text/event-stream', headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            })
        else:
            # Neither GitHub nor local testing enabled
            return jsonify({"status": "error", "message": "Data generation not configured. Set LOCAL_MODE=true for local testing or provide GitHub credentials."}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/patient_dashboard', methods=['GET'])
@with_supabase
def patient_dashboard(supabase):
    """Fetch patient metrics from Supabase"""
    metrics = fetch_metrics(supabase, "patients")
    if not metrics:
        return jsonify({'message': 'Data not found. Run analytics pipeline first.'}), 404
    
    adv_metrics = metrics.get('advanced_metrics', {})
    
    return jsonify({
        'message': 'Data Loaded successfully',
        'kpis': metrics.get('kpis', {}),
        'metrics': metrics.get('metrics', {}),
        'metric_trends': {
            'economic_dependence': adv_metrics.get('economic_dependence_trend', []),
            'cultural_diversity': adv_metrics.get('cultural_diversity_trend', []),
            'mortality_rate': adv_metrics.get('mortality_rate_trend', [])
        },
        'advanced_metrics': adv_metrics
    })

@app.route('/api/conditions_dashboard', methods=['GET'])
@with_supabase
def conditions_dashboard(supabase):
    """Fetch condition metrics from Supabase"""
    metrics = fetch_metrics(supabase, "conditions")
    if not metrics:
        return jsonify({'message': 'Data not found. Run analytics pipeline first.'}), 404
    
    return jsonify({
        'message': 'Data Loaded successfully',
        'kpis': metrics.get('kpis', {}),
        'metrics': metrics.get('metrics', {}),
        'advanced_metrics': metrics.get('advanced_metrics', {})
    })

@app.route('/api/encounters_dashboard', methods=['GET'])
@with_supabase
def encounters_dashboard(supabase):
    """Fetch encounter metrics from Supabase"""
    metrics = fetch_metrics(supabase, "encounters")
    if not metrics:
        return jsonify({'message': 'Data not found. Run analytics pipeline first.'}), 404
    
    return jsonify({
        'message': 'Data Loaded successfully',
        'kpis': metrics.get('kpis', {}),
        'metrics': metrics.get('metrics', {}),
        'advanced_metrics': metrics.get('advanced_metrics', {})
    })

@app.route('/api/allergy_dashboard', methods=['GET'])
@with_supabase
def allergy_dashboard(supabase):
    """Fetch encounter metrics from Supabase"""
    metrics = fetch_metrics(supabase, "allergies")
    if not metrics:
        return jsonify({'message': 'Data not found. Run analytics pipeline first.'}), 404
    
    return jsonify({
        'message': 'Data Loaded successfully',
        'kpis': metrics.get('kpis', {}),
        'metrics': metrics.get('metrics', {}),
        'advanced_metrics': metrics.get('advanced_metrics', {})
    })  

@app.route('/api/geographic_dashboard', methods=['GET'])
async def get_geographic_dashboard():
    """Fetch geographic state-level KPIs dynamically, lazily and granularly by KPI ID"""
    try:
        kpi = request.args.get('kpi', default='total_patients', type=str)
        
        from workflows.supabase_builder import get_supabase_client
        async with get_supabase_client() as supabase:
            if kpi in ['total_patients', 'active_patient_rate', 'gender_balance_ratio', 'mean_family_income', 'median_family_income', 'avg_patient_age', 'married_rate', 'higher_education_rate']:
                from api.utilities.patients.kpis import get_state_patient_kpis
                data = await get_state_patient_kpis(kpi, supabase)
            elif kpi in ['active_condition_burden', 'current_active_burden', 'global_recovery_rate', 'patient_complexity_score', 'avg_cure_time', 'average_time_to_cure', 'admission_rate_last_30_days', 'total_diagnoses', 'unique_conditions', 'chronic_condition_burden']:
                from api.utilities.conditions.kpis import get_state_condition_kpis
                data = await get_state_condition_kpis(kpi, supabase)
            elif kpi in ['total_allergic_population', 'active_allergy_percentage', 'active_allergy_rate', 'severe_allergy_incidence_rate', 'severe_incident_rate', 'allergic_patient_rate', 'penicillin_allergy_delabeling_eligibility_rate', 'allergy_related_readmission_rate', 'poly_allergen_patient_rate', 'drug_hypersensitivity_rate']:
                from api.utilities.allergies.kpis import get_state_allergy_kpis
                data = await get_state_allergy_kpis(kpi, supabase)
            elif kpi in ['total_visit_volume', 'total_revenue_generated', 'total_revenue', 'average_encounter_duration_hours', 'average_patient_out_of_pocket', 'avg_out_of_pocket', 'average_base_fee', 'total_covered_amount', 'insurer_covered', 'unique_patients_seen', 'average_practitioner_load', 'encounters_30d']:
                from api.utilities.encounters.kpis import get_state_encounter_kpis
                data = await get_state_encounter_kpis(kpi, supabase)
            else:
                return jsonify({'error': f'Invalid KPI ID: {kpi}'}), 400
                
        return jsonify({
            'message': f'Geographic metrics for {kpi} loaded successfully',
            'kpi': kpi,
            'data': data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3001, debug=True)
