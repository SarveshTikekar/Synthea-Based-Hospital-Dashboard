# Formats for all dashboard components

PERCENTAGE_FORMAT = "{:.2}%"
DOLLAR_FORMAT = "${:,.2f}"
YEAR_FORMAT = "{:.0f} years"
PATIENT_FORMAT = "{:.0f} patients"
ENCOUNTER_FORMAT = "{:.0f} encounters"
HOUR_FORMAT = "{:.1f} hours"
CONDITION_FORMAT = "{:.0f} conditions"

PATIENTS_FORMAT={

    "Total Patients": PATIENT_FORMAT,
    "Active Rate": PERCENTAGE_FORMAT,
    "Gender Ratio": "",
    "Mean Income": DOLLAR_FORMAT,
    "Median Income": DOLLAR_FORMAT,
    "Average Patient Age": YEAR_FORMAT,
    "Marriage Rate": PERCENTAGE_FORMAT,
    "Higher Education Rate": PERCENTAGE_FORMAT,
    "Economic Dependency Rate": PERCENTAGE_FORMAT,
    "Cultural Diversity Rate": PERCENTAGE_FORMAT,
    "Mortality Rate": PERCENTAGE_FORMAT,
    "Actual Survival Trend": PERCENTAGE_FORMAT,
    "Entropy Score": "",
    "Wealth Trajectory": DOLLAR_FORMAT,
    "Mortality Hazard": PERCENTAGE_FORMAT,
}

ALLERGIES_FORMAT={}
ENCOUNTERS_FORMAT={

    "Total Volume": ENCOUNTER_FORMAT,
    "Unique Patients": PATIENT_FORMAT,
    "Total Revenue": DOLLAR_FORMAT,
    "Average Duration": HOUR_FORMAT,
    "Average Practioner Load": "{:.1f} encounters/day",
    "Average Base Fee": DOLLAR_FORMAT,
    "Total Insurance Covered": DOLLAR_FORMAT,
    "Patient out-of-pocket": "{:,.2f} dollars / encounter",
    "Encounter Types": ENCOUNTER_FORMAT,
    "Coverage vs OOP": DOLLAR_FORMAT,
    "Top 10 Encounter Types": ENCOUNTER_FORMAT,
    "Most Expensive causes": DOLLAR_FORMAT,
    "Fee Divergence": DOLLAR_FORMAT,
    "Top 10 Practioners": ENCOUNTER_FORMAT,
    "Patient Burden Trajectory": DOLLAR_FORMAT,
    "Readmission and Retention Timeline": PATIENT_FORMAT,
    "Duration distribution": HOUR_FORMAT,
    "High Cost Anomaly": ENCOUNTER_FORMAT
}

CONDITIONS_FORMAT={

    "Active Burden": CONDITION_FORMAT,
    "Reccovery Rate": PERCENTAGE_FORMAT,
    "Average Complexity": f"{CONDITION_FORMAT}/patient",
    "Average Time to Cure": "{:.0f} days",
    "Admissions last 30 days": PATIENT_FORMAT,
    "Total Diagnoses": CONDITION_FORMAT,
    "Unique Conditions": CONDITION_FORMAT,
    "Chronic Burden": CONDITION_FORMAT,
    "Top 10 Active Conditions": CONDITION_FORMAT,
    "Top 10 Recurring Conditions": CONDITION_FORMAT,
    "Clinical Course": CONDITION_FORMAT,
    "Comorbidity Index": PATIENT_FORMAT,
    "Recurrence Gap": "{:.0f} days",
    "Incidence Velocity": "{:.1f} new cases/day",
    "Average Cure Time": "{:.0f} days",
    "Clinical Gravity": "",
    "Top Comorbidity Pairs": PATIENT_FORMAT,
    "Disease Pathways": [PERCENTAGE_FORMAT, PATIENT_FORMAT]
}