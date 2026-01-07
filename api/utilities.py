# -- Initialise all Singletons here to be exported in main api file --
import sys, os

sys.path.append(os.path.dirname(os.path.join(os.path.dirname(__file__), '..')))
from threading import main_thread
import time

from etl_pipeline.master import Master
main_singleton = Master()

#Utility functions would be written here in case of any local functionality needed in the API file

#Pyspark functions
from pyspark.sql.functions import (
    current_date, current_timestamp, date_sub, sum, avg, min, max, 
    isnotnull, isnull, datediff, year, month, col, lit
)
from datetime import datetime

class PatientUtils:
    def __init__(self) -> None:
        self.df = main_singleton.getDataframes("patients")

    def get_economic_dependence_trendgraph(self):
        econ_trendgraph = []         
        current_yr = datetime.now().year
        
        for i in range(1, 11):
            target_year = current_yr - i
            ref_date = lit(f"{target_year}-12-31").cast("date")
 
            df_yearly = self.df.filter(
                (year(col("birth_date")) <= target_year) & 
                ((col("death_date").isNull()) | (year(col("death_date")) > target_year))
            )
        
            df_yearly = df_yearly.withColumn("age_at_time", 
                (datediff(ref_date, col("birth_date")) / 365.25).cast("int")
            )
        
            working = df_yearly.filter((col("age_at_time") >= 20) & (col("age_at_time") <= 64)).count()
            non_working = df_yearly.filter((col("age_at_time") < 20) | (col("age_at_time") > 64)).count()
        
            ratio = int((non_working / (working if working > 0 else 1)) * 100)
            econ_trendgraph.append({target_year: ratio})

        return econ_trendgraph

    def cultural_div_score_trend(self):
        cult_div_score_trend = []
        curr_year = datetime.now().year

        for i in range (1, 11):
            target_year = curr_year - i
            
            temp = self.df.filter(
                (year(col("birth_date")) <= target_year) & 
                (isnull(col("death_date")) | (year(col("death_date")) > target_year))
            )

            pop_count = temp.count()
            if pop_count > 0:
                race_df = temp.groupBy("race").count()
                race_df = race_df.withColumn("enhanced_count", (col("count") / pop_count) ** 2)
                # We use [0][0] to get the scalar value from the aggregation
                cult_div_score = int((1 - race_df.agg(sum("enhanced_count")).collect()[0][0]) * 100)
            else:
                cult_div_score = 0
        
            cult_div_score_trend.append({target_year: cult_div_score})

        return cult_div_score_trend

    def mortality_rate_trend(self):
        mort_rate_trend = []
        curr_year = datetime.now().year

        for i in range (1, 11):
            target_year = curr_year - i
            
            dead_count = self.df.filter(
                (isnotnull(col("death_date"))) & (year(col("death_date")) == target_year)    
            ).count()

            alive_count = self.df.filter(
                ((isnull(col("death_date"))) | (year(col("death_date")) >= target_year)) & 
                (year(col("birth_date")) <= target_year)
            ).count()

            rate = round((dead_count / (alive_count if alive_count > 0 else 1)) * 100, 2)
            mort_rate_trend.append({target_year: rate})

        return mort_rate_trend

    def run_all(self):
        return [
            self.get_economic_dependence_trendgraph(), 
            self.cultural_div_score_trend(), 
            self.mortality_rate_trend()
        ]
