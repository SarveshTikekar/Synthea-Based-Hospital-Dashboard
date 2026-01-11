# patients_etl.py
from pyspark.sql.functions import col, when, split, to_date, isnull, mean, percentile_approx, current_date, datediff, coalesce, sum, dense_rank, count, lit, concat

from math import log2
from pyspark.sql import Window
from etl_pipeline.master import Master
import re
import os
from .models.patients import patientKPIS, patientMetrics, patientAdvancedMetrics

builtins = __builtins__

class PatientsETL:
    def __init__(self):
        self.master = Master()
        self.etl()
        self.calculateKPIS()
        self.calculateMetrics()
        self.calculateAdvancedMetrics()

    def etl(self):
        """
        Load the transformed patients DataFrame from CSV if not already loaded.
        """

        path=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Datasets", "csv", "patients.csv"))
        df = self.master._master_spark.read.csv(path, header=True, inferSchema=True)

        # Rename columns    
        new_cols_list = ["uuid", "birth_date", "death_date", "social_security_number", "driver_license_number", 
                         "passport_number", "salutation", "first_name", "middle_name", "last_name", "doctorate", "_", "marital_status",
                         "race", "ethnicity", "gender", "patient_birthplace", "current_address", "geolocated_city", "geolocated_state",
                         "geolocated_county", "_", "postal_code", "latitude", "longitude", "_", "_", "family_income"]

        for old_col, new_col in zip(df.columns, new_cols_list):
            df = df.withColumnRenamed(old_col, new_col)
        
        df = df.drop(*[col for col in df.columns if col.startswith("_")])

        # Drop numeric-looking column names
        re_patterns = [r'_', r'[0-9]+$']
        dropped_cols = [col for col in df.columns if re.match(re_patterns[0], col)]
        df = df.drop(*dropped_cols)
       
        #Format dates

        df = df.withColumn("death_date", to_date(col("death_date"), "yyyy-MM-dd"))
        
        df = df.withColumn("birth_date", to_date(col("birth_date"), "yyyy-MM-dd"))

        # Clean first, middle, last, maiden names
        df = df.withColumn("first_name", split(col("first_name"), re_patterns[1]).getItem(0)) \
               .withColumn("middle_name", split(col("middle_name"), re_patterns[1]).getItem(0)) \
               .withColumn("last_name", split(col("last_name"), re_patterns[1]).getItem(0)) \

        # Fill missing values
        df = df.withColumn("salutation", when(col("gender") == "M", "Mr.").otherwise("Ms.")) \
                .fillna({"passport_number": "N/A", "middle_name": "N/A", "doctorate": "No doctorate", "marital_status": "Unknown"})
        
        #Modify the postal code 
        df = df.withColumn("postal_code", col("postal_code").cast("string")).withColumn("postal_code",concat(lit("0"),col("postal_code")))
        # Store in singleton
        self.master.setDataframes("patients", df)
            
    def get_patients(self):
        return self.master.getDataframes("patients")

    def calculateKPIS(self): 
        df = self.master.getDataframes("patients")

        #KPI-1 Number of alive patients
        patient_count = df.select(col("uuid")).count()
        
        #KPI-2
        active_patient_rt = int((df.filter(isnull(col("death_date")))
                                .count()/patient_count) * 100)

        #KPI-3
        gender_ratio = int((df.filter(col("gender") == "M").count()/df.filter(col("gender") == "F").count()) * 100)

        #KPI-4

        stats = df.filter(isnull(col("death_date"))).agg(
                    
                    mean("family_income").alias("mean"),
                    percentile_approx("family_income", 0.5).alias("median")
                ).first()

        mean_fi , median_fi = stats["mean"], stats["median"]

        self.master.setKPIS("patients", patientKPIS(total_patients = patient_count, active_patient_rate = active_patient_rt, gender_balance_ratio = gender_ratio, mean_family_income = int(mean_fi), median_family_income = int(median_fi)))

    def calculateMetrics(self):    
        
        #Metric-1 Economic dependence ratio
        df = self.master.getDataframes("patients")
        end_date = coalesce(col("death_date"), current_date())
        df = df.withColumn("age", (datediff(end_date, col("birth_date"))/365.25).cast("int"))

        working_class = df.filter((col("age") >= 20) & (col("age") <= 64)).count()
        non_working_class = df.filter((col("age") < 20) | (col("age") > 64)).count()
          
        econ_dep_ratio = int(((non_working_class) / (working_class if working_class > 0 else 1)) * 100)

        #Metric 2: Cultural diversity score
        race_df = df.groupBy("race").count()
        race_df = race_df.withColumn("enhanced_count", (col("count") / df.count()) ** 2)

        cult_div_score = int((1 - race_df.agg(sum("enhanced_count")).first()[0]) * 100)

        #Metric-3 Mortality_rate
        deaths = df.filter(col("death_date").isNotNull()).select(col("death_date")).count()
        mort_rate = deaths / df.count() * 100
        
        #Metric-4 Age-wealth correlation, age is x-ax and wealth is y-ax
        
        averages = df.agg(mean("age").alias("mean_age"), mean("family_income").alias("mean_fi")).first()

        x_mean = averages.mean_age 
        y_mean = averages.mean_fi 
        
        denom_term_1, denom_term_2 = df.agg( sum ((col("age") - x_mean) ** 2) ).first()[0], df.agg( sum ((col("family_income") - y_mean) ** 2) ).first()[0] 
        corr_coeff = df.agg( sum((col("age") - x_mean) * (col("family_income") - y_mean)) ).first()[0] / ((denom_term_1 * denom_term_2) ** 0.5)

        #Metric 5 Income inequality index (Gini coefficient) using Lorenz curve

        df = df.withColumn("income_ranking", dense_rank().over(window=Window.orderBy(col("family_income"))))
        gini_coeff = float((2 * df.agg(sum(col("family_income") * col("income_ranking"))).first()[0]/(df.agg(sum(col("family_income"))).first()[0] * df.count()))- ((df.count() + 1)/df.count()))

        self.master.setMetrics("patients", patientMetrics(economic_dependence_ratio = econ_dep_ratio, cultural_diversity_score = cult_div_score, mortality_rate = mort_rate, age_wealth_correlation=corr_coeff, income_inequality_index=gini_coeff))

    def calculateAdvancedMetrics(self):
        
        #ADM-1 Actural survival trend
        bins = [x * 5 for x in range(1, 18)]
        
        df = self.master.getDataframes("patients")
        df = df.withColumn("age", when((col("death_date").isNotNull()), (datediff(col("death_date"), col("birth_date"))/365.25).cast("int")) \
                           .otherwise((datediff(current_date(), col("birth_date"))/365.25)).cast("int"))
        
        males = []
        females = []
        
        curr_m, curr_f = 1, 1
        
        for req_age in bins:
            
            alive_m = df.filter((col("gender") == "M") & (col("age") >= req_age)).count()
            alive_f = df.filter((col("gender") == "F") & (col("age") >= req_age)).count()
            
            dead_m = df.filter((col("gender") == "M") & ((col("age") > (req_age - 5)) & (col("age") <= req_age) & (col("death_date").isNotNull()))).count()
            dead_f = df.filter((col("gender") == "F") & ((col("age") > (req_age - 5)) & (col("age") <= req_age) & (col("death_date").isNotNull()))).count()

            ratio_m = float(1 - (dead_m/(alive_m if alive_m > 0 else 1)))
            ratio_f = float(1 - (dead_f/(alive_f if alive_f > 0 else 1)))
            
            curr_m , curr_f = round(curr_m * ratio_m, 3), round(curr_f * ratio_f, 3)
            males.append({req_age: curr_m})
            females.append({req_age: curr_f})
        
        actur_surv_trend = [{"males": males}, {"females": females}]

        #ADM-2 Demographic entropy
        city_list = [str(row[0]) for row in df.select("geolocated_city").distinct().collect()]
        dem_entro = []

        for city in city_list:
            group = [{row[1]: row[2]} for row in df.filter(col("geolocated_city") == city) \
                    .groupBy("geolocated_city", "race").agg(count("*")).collect()]

            total_count = __builtins__.sum(val for d in group for val in d.values())

            if total_count > 0:
                terms = [ (val/total_count) * log2(val/total_count) 
                  for d in group 
                  for val in d.values() if val > 0 ]

                div_index = round(-1 * __builtins__.sum(terms), 3)
            else:
                div_index = 0.0
            dem_entro.append((city, div_index, group))
            


        self.master.setAdvancedMetrics("patients", patientAdvancedMetrics(actural_survival_trend=actur_surv_trend, 
                                                                          demographic_entropy=dem_entro))
    
    def testing(self):
        df = self.master.getDataframes("patients")
        print(df.printSchema())
# Optional: Standalone execution
if __name__ == "__main__":
    patients_etl = PatientsETL()
    df_proc = patients_etl.get_patients()
    df_proc.show(10)
    print("Columns:", df_proc.columns)
    print(patients_etl.master.getKPIS("patients"))
    print(patients_etl.master.getMetrics("patients"))
    print(patients_etl.master.getAdvancedMetrics("patients"))
    print(patients_etl.testing())
