from pydantic import BaseModel, Field
from typing import List, Dict, Tuple

class patientKPIS(BaseModel):
    total_patients: int = 0
    active_patient_rate: float = 0
    gender_balance_ratio: float = 0
    mean_family_income: int = 0
    median_family_income: int = 0


class patientMetrics(BaseModel):
    economic_dependence_ratio: int = 0
    cultural_diversity_score: int = 0 
    mortality_rate: float = 0
    age_wealth_correlation: float = 0
    income_inequality_index: float = 0

