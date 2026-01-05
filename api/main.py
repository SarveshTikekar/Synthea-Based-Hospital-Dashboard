#API endpoints (Utilities to be put in utilities.py)

from logging import raiseExceptions
from api import utilities
import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import json


# Ensuring the project root (one level up) is in sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Importing singletons (ensure these paths are correct)
from utilities import main_singleton
from etl_pipeline.patients import PatientsETL
from etl_pipeline.conditions import ConditionsETL
from etl_pipeline.procedures import ProceduresETL
from etl_pipeline.allergies import AllergiesETL

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- ROUTES ---

@app.route('/', methods=['GET'])
def root():
    """Root route - health check"""
    return jsonify({'message': 'Welcome to Synthea API', 'status': 'OK'}), 200


@app.route('/patients', methods=['GET'])
def get_patients():
    """Return all patients as JSON"""
    try:
        patients = patients_singleton.get_patients()
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve patients: {str(e)}'}), 500

@app.route('/get_patient_count', methods=['GET'])
def get_patient_count():

    try:
        data = patients_singleton.get_patients()
        if data is None:
            print("Data is None", sep='\n')
            return jsonify({
                "status": 500,
                "message": "No patient data found"
            })

        else:
            patient_count = data.count()
            print(f"Patient count is: {patient_count}", sep='\n')
            return jsonify({
            
                'status': 200,
                'patient_count': patient_count,
                'message': 'Patient count is returned successfully'
            })

    except Exception as e:
        print("Exception occured!", sep='\n')
        return jsonify({
            "status": 404,
            "error": str(e)
        })
@app.route('/generate_data/', methods=['GET'])
def generate_data():
    """
    Trigger Synthea script to generate new synthetic patient data.
    """
    try:
        num_patients = request.args.get('num_patients', type=int)
        path = os.path.dirname(os.path.abspath(__file__))
        script_dir = os.path.join(path, "..", "scripts", "synthea-init.sh")

        if not os.path.exists(script_dir):
            return jsonify({
                "status": "error",
                "message": f"Synthea script not found at {script_dir}"
            }), 404

        result = subprocess.run(
            [script_dir, str(num_patients)],
            cwd=path,
            capture_output=True,
            text=True,
            check=True
        )

        return jsonify({
            "status": "success",
            "message": f"{num_patients} patient records successfully generated",
            "stdout": result.stdout.strip(),
        }), 200

    except subprocess.CalledProcessError as e:
        return jsonify({
            "status": "error",
            "message": "Data generation failed",
            "output": e.stdout,
            "error": e.stderr
        }), 500


@app.route('/quick_dashboard', methods=['GET'])
def quick_dashboard_data():
    """
    Return patient-level summary data for the Quick Dashboard.
    This data comes from Spark DataFrames and is serialized into JSON.
    """

    try:
        # Check if patient data already exists
        data = main_singleton.getDataframes("patients")

        if data is None:
            # Run ETL once to load patient data
            patients_singleton.etl()
            data = main_singleton.getDataframes("patients")

        if data is None:
            return jsonify({
                "api-status": "failure",
                "code": 404,
                "message": "No patient data found after ETL."
            }), 404

        # ✅ Convert Spark DataFrame → JSON serializable list of dicts
        data_json = [row.asDict(recursive=True) for row in data.collect()]

        return jsonify({
            "api-status": "successs",
            "code": 200,
            "count": len(data_json),
            "data": data_json
        }), 200

    except Exception as e:
        return jsonify({
            "api-status": "Exception caused",
            "error": str(e),
            "code": 500
        }), 500


#Dashboard for patients
@app.route('/patient_dashboard', methods=['GET'])
def patient_dashboard():
    try:
        if main_singleton.getDataframes("patients") is None:
            patient_obj = PatientsETL()

        patient_data = [main_singleton.getKPIS("patients"), main_singleton.getMetrics("patients")]

        if patient_data is None:
            return jsonify({'message': 'Data not found'}), 404
        
        return jsonify({'message': 'Data Loaded successfully', 
                        'kpis': patient_data[0].model_dump(), 'metrics': patient_data[1].model_dump()})

    except Exception as e:
        return jsonify({'error': str(e)}), 400
        

@app.route('/conditions_dashboard', methods=['GET'])
def conditions_dashboard():
    try:

        if main_singleton.getDataframes("conditions") is None:
            conditions_obj = ConditionsETL()

        conditions_data = [main_singleton.getKPIS("conditions"), main_singleton.getMetrics("conditions")]

        if conditions_data is None:
            return jsonify({'message': 'Data not found'}), 404
        
        return jsonify({'message': 'Data Loaded successfully', 
                        'kpis': conditions_data[0].model_dump(), 'metrics': conditions_data[1].model_dump()})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# --- MAIN ENTRY POINT ---
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3001, debug=True)