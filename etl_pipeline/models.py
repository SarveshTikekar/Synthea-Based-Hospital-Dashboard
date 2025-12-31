from pydantic import BaseModel, Field

class patientKPIS(BaseModel):
    total_patients: int = 0
    active_patient_rate: float = 0
    gender_balance_ratio: float = 0
    mean_family_income: int = 0
    median_family_income: int = 0


class patientMetrics(BaseModel):
    economic_dependence_ratio: int = 0
    cultural_diversity_score: int = 0 # 0 means no cultural diversity
    mortality_rate: float = 0
    age_wealth_correlation: float = 0
    income_inequality_index: float = 0


class conditionKPIS(BaseModel):
    current_active_burden: int = 0
    global_recovery_rate: float = Field(0, description="Percentage of conditions that have been completely treated")
    patient_complexity_score: int = Field(0, description="Average number of conditions per patient")
    average_time_to_cure: int = Field(0, description="Average time (in days) taken to completely treat a condition")
    admission_rate_last_30_days: int = Field(0, description="Number of admissions in the last 30 days related to conditions")
    admission_rate_last_60_days: int = Field(0, description="Number of admissions in the last 60 days related to conditions")

     
class conditionMetrics(BaseModel):
    pass
