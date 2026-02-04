# conditions_etl.py
from pyspark.sql.functions import col, to_date, regexp_extract, isnull, mean, countDistinct, sum, coalesce, current_date, datediff, avg, when, date_sub, count, trim, floor, lit, round
from etl_pipeline.master import Master
import os
import math
from .models.conditions import conditionKPIS, conditionMetrics
 
class ConditionsETL:

    def __init__(self) -> None:
        self.master = Master()
        self.etl()
        self.calculateKPIS()
        self.calculateMetrics()

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
               
        df = df.withColumn("medical_concepts", trim(col("medical_concepts"))) \
               .withColumn("associated_semantics", trim(col("associated_semantics")))

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
        avg_time_cure_val = df.filter(col("date_of_abetment").isNotNull()) \
                        .agg(avg(datediff(col("date_of_abetment"), col("condition_record_date")))).first()[0]
        avg_time_cure = math.ceil(avg_time_cure_val) if avg_time_cure_val is not None else 0 

        #KPI-5 Admission rates in last days 
        metrics = df.agg(
        # Count rows where date >= Today - 30 days
            sum(when(col("condition_record_date") >= date_sub(current_date(), 30), 1).otherwise(0)).alias("adm_30"),
    
        ).first()

        adm_30 = metrics["adm_30"]
            
        self.master.setKPIS("conditions", conditionKPIS(current_active_burden=curr_act_burd, global_recovery_rate=glob_reco_rate, patient_complexity_score=pat_comp_score, average_time_to_cure=avg_time_cure, admission_rate_last_30_days=adm_30))
    

    def calculateMetrics(self):

        #Metric-1 Top 5 disorder conditions by prevalence
        df = self.master.getDataframes("conditions")
        collection = df.filter((col("associated_semantics") == "disorder") & (col("date_of_abetment").isNull())) \
                            .groupBy("medical_concepts") \
                            .agg(count(col("uuid")).alias("dis_count")) \
                            .orderBy(col("dis_count").desc()) \
                            .limit(10).collect()
        
        collection2 = [row.asDict() for row in collection]
        top_5_live_disorders = [{item["medical_concepts"]: item["dis_count"]} for item in collection2]

        #Metric-2 Chronic vs Acute condition comparison
        collection = df.filter(col("associated_semantics") == "disorder") \
                    .withColumn("end_date", coalesce(col("date_of_abetment"), current_date())) \
                    .withColumn("duration_days", datediff("end_date", "condition_record_date")) \
                    .withColumn("clinical_course", when(col("duration_days") >= 90, "chronic").otherwise("acute")) \
                    .groupBy("clinical_course") \
                    .agg(count("uuid").alias("ca_count")) \
                    .collect() 
        
        collection2 = [row.asDict() for row in collection]
        chron_vs_ac = [{item['clinical_course']: item['ca_count'] for item in collection2}]

        #Metric-3 Disease resolution efficiency

        collection = df.filter((col("associated_semantics") == "disorder") & (col("date_of_abetment").isNotNull())) \
                        .withColumn("days_for_treatment", datediff(col("date_of_abetment"), col("condition_record_date")))\
                        .groupBy("medical_concepts").agg(

                            count(col("uuid")).alias("frequency"),
                            avg(col("days_for_treatment")).alias("avg_time_to_cure")
                        ).withColumn("avg_time_to_cure", floor(col("avg_time_to_cure"))) \
                        .withColumn("avg_time_to_cure", when(col("avg_time_to_cure") == 0, 1).otherwise(col("avg_time_to_cure"))) \
                        .orderBy(col("avg_time_to_cure").asc(), col("frequency").desc()).limit(20).rdd.map(tuple).collect()
        
        disease_resolution_top_20 = [(item[0], item[1], item[2]) for item in collection]

        #Metric-4 Top 10 recurring disorders

        collection = df.filter((col("associated_semantics") == "disorder")) \
                        .groupBy("uuid", "medical_concepts") \
                        .agg(
                            
                            count("*").alias("rec_count")
                        ).filter(col("rec_count") > 1) \
                        .groupBy("medical_concepts") \
                        .agg(count(col("uuid")).alias("total_recurring")) \
                        .orderBy(col("total_recurring").desc()).limit(10).collect()
        collection2 = [row.asDict() for row in collection]
        top_10_recurr_disorders = [{item["medical_concepts"]: item["total_recurring"]} for item in collection2]

        #Metric-5 Comorbidity pattern: Frequency of patients with multiple co-occurring conditions

        collection = df.filter((col("associated_semantics") == "disorder") & (col("date_of_abetment").isNull())) \
                        .groupBy("uuid").agg(

                            count(col("medical_concepts")).alias("con_count")
                        ).groupBy("con_count") \
                        .agg(count(col("uuid")).alias("c2")) \
                        .orderBy(col("con_count").asc()).collect()
        
        collection2 = [row.asDict() for row in collection]
        commor_pattern = [{item['con_count']: item['c2'] for item in collection2}]

        #Metric 6- Top 10 conditions having highest clinical gravity score

        
        active_df = df.filter(col("date_of_abetment").isNull())

        patient_load = active_df.groupBy("uuid").agg(
            countDistinct("medical_concepts").alias("Ap")
        )

        gravity_df = active_df.join(patient_load, "uuid") \
            .groupBy("medical_concepts") \
            .agg(
                countDistinct("uuid").alias("Nc"),
                round(avg(col("Ap") - 1), 0).cast("int").alias("score")
            )

        clinical_gravity = sorted(
            [{row.medical_concepts: int(row.score)} for row in gravity_df.collect()], 
            key=lambda x: list(x.values())[0], 
            reverse=True
        )[:15]

        self.master.setMetrics("conditions",conditionMetrics(top_disorder_conditions=top_5_live_disorders, chronic_vs_acute=chron_vs_ac, disease_resolution_efficiency=disease_resolution_top_20, top_10_recurring_disorders=top_10_recurr_disorders, commorbidity_pattern=commor_pattern, clinical_gravity=clinical_gravity))
        
    def calculateAdvancedMetrics(self):
        pass

    def test(self):
        df = self.master.getDataframes("conditions")
        distinct_conditions = list(map(lambda x: x[0], df.select("medical_concepts").distinct().collect()))
        print(distinct_conditions, len(distinct_conditions), sep='\n')

        #df.show(10)
        
# Optional: Standalone execution
#if __name__ == "__main__":
#    conditions_etl = ConditionsETL()
#    df_proc = conditions_etl.getDf()
#    df_proc.show(25)
#    print(conditions_etl.master.getKPIS("conditions"))
#    print(conditions_etl.master.getMetrics("conditions"))
#    print(conditions_etl.test())
#    print("Columns:", df_proc.columns)
