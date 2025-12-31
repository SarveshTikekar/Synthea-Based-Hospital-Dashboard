# conditions_etl.py
from pyspark.sql.functions import col, to_date, regexp_extract, isnull, mean, countDistinct, sum, coalesce, current_date, datediff, avg, when, date_sub
from etl_pipeline.master import Master
import os
import math
from .models import conditionKPIS
class ConditionsETL:

    def __init__(self) -> None:
        self.master = Master()
        self.etl()
        self.calculateKPIS()
        #self.calculateMetrics()

    def etl(self):
        """
        Load the transformed conditions DataFrame from CSV if not already loaded.
        """

        path=os.path.join(os.path.dirname(__file__), "..", "Datasets", "csv", "conditions.csv")
        
        df = self.master._master_spark.read.csv(path, header=True, inferSchema=True)
        new_cols = ['condition_record_date', 'date_of_abetment', 'uuid', 'encounter_uuid', '_', 'fsn_id', 'fsn']

        for old_col, new_col in zip(df.columns, new_cols):
            df = df.withColumnRenamed(old_col, new_col)

        # Drop placeholder columns
        df = df.drop(*[col for col in df.columns if col.startswith('_')])

        # Convert date columns to proper date format
        df = df.withColumn("condition_record_date", to_date(col("condition_record_date"), "yyyy-MM-dd")) \
               .withColumn("date_of_abetment", to_date(col("date_of_abetment"), "yyyy-MM-dd"))

        # Extract event type from description and drop the fsn column
        df = df.withColumn("medical_concepts", regexp_extract(col("fsn"), r"^(.*?)\(", 1)) \
               .withColumn("associated_semantics", regexp_extract(col("fsn"), r"\((.*?)\)$", 1)).drop("fsn")

        # Store in singleton
        self.master.setDataframes("conditions", df)

    def getDf(self):
        return self.master.getDataframes("conditions")

    def calculateKPIS(self):
        
        #KPI-1 Current active burden: Number of conditions not treated completely

        df = self.master.getDataframes("conditions")
        curr_act_burd = df.filter(isnull(col("date_of_abetment"))).count()

        #KPI-2 Global recovery rate
        glob_reco_rate = (df.filter(col("date_of_abetment").isNotNull()).count()/(df.count() if df.count() > 0 else 1)) * 100


        #KPI-3 Patient complexity score: Average number of conditions per patient

        refined_df = df.filter(col("date_of_abetment").isNotNull()).groupBy("uuid").agg(countDistinct(col("medical_concepts")).alias("smmc"))
        numerator = refined_df.agg(sum(col("smmc"))).first()[0]
        
        pat_comp_score = math.ceil(numerator / (refined_df.count() if refined_df.count() > 0 else 1))   


        #KPI-4 Average time to cure: Average time (in days) taken to completely treat a condition

        

        avg_time_cure = math.ceil(df.filter(col("date_of_abetment").isNotNull()) \
                        .agg(avg(datediff(col("date_of_abetment"), col("condition_record_date")))).first()[0]) 

        #KPI-4 and KPI-5 Admission rates in last 30 and 60 days
        
        metrics = df.agg(
        # Count rows where date >= Today - 30 days
            sum(when(col("condition_record_date") >= date_sub(current_date(), 30), 1).otherwise(0)).alias("adm_30"),
        
        # Count rows where date >= Today - 60 days
            sum(when(col("condition_record_date") >= date_sub(current_date(), 60), 1).otherwise(0)).alias("adm_60")
        ).first()

        adm_30 = metrics["adm_30"]
        adm_60 = metrics["adm_60"] 
            
        self.master.setKPIS("conditions", conditionKPIS(current_active_burden=curr_act_burd, global_recovery_rate=glob_reco_rate, patient_complexity_score=pat_comp_score, average_time_to_cure=avg_time_cure, admission_rate_last_30_days=adm_30, admission_rate_last_60_days=adm_60))
    
    def calculateMetrics(self):
        self.master.setMetrics("conditions", )
        

# Optional: Standalone execution
if __name__ == "__main__":
    conditions_etl = ConditionsETL()
    df_proc = conditions_etl.getDf()
    df_proc.show(25)
    print(conditions_etl.master.getKPIS("conditions"))
    print("Columns:", df_proc.columns)
