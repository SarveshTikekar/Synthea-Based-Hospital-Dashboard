from pydantic import BaseModel, Field
from typing import List, Dict, Tuple

class conditionKPIS(BaseModel):
    current_active_burden: int = 0
    global_recovery_rate: float = Field(0, description="Percentage of conditions that have been completely treated")
    patient_complexity_score: int = Field(0, description="Average number of conditions per patient")
    average_time_to_cure: int = Field(0, description="Average time (in days) taken to completely treat a condition")
    admission_rate_last_30_days: int = Field(0, description="Number of admissions in the last 30 days related to conditions")

class conditionMetrics(BaseModel):
    top_disorder_conditions: List[Dict[str, int]] = Field(default_factory=list, description="List of top 5 disorder conditions by prevalence with their counts")
    chronic_vs_acute: List[Dict[str, int]] = Field(default_factory=list, description="List containing active chronic and acute conditions")
    disease_resolution_efficiency: List[Tuple[str, int, int]] = Field(default_factory=list, description="List of tuples containing medical concept, count and average time to cure for top 5 conditions")
    top_10_recurring_disorders: List[Dict[str, int]] = Field(default_factory=list, description="List of top 10 recurring disorders with their counts")
    commorbidity_pattern: List[Dict[int, int]] = Field(default_factory=list, description="Frequency of patients with multiple co-occurring conditions")
    clinical_gravity: List[Dict[str, float]]