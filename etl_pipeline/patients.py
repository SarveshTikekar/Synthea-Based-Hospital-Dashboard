# patients_etl.py
from pyspark.sql.functions import col, when, split, to_date
from etl_pipeline.master import Master
import re
import os

class PatientsETL:
    def __init__(self):
        self.master = Master()
        self.etl()
        
    def etl(self):
        """
        Load the transformed patients DataFrame from CSV if not already loaded.
        """

        path=os.path.join(os.path.dirname(__file__), "..", "Datasets", "csv", "patients.csv")
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

        # Clean first, middle, last, maiden names
        df = df.withColumn("first_name", split(col("first_name"), re_patterns[1]).getItem(0)) \
               .withColumn("middle_name", split(col("middle_name"), re_patterns[1]).getItem(0)) \
               .withColumn("last_name", split(col("last_name"), re_patterns[1]).getItem(0)) \

        # Fill missing values
        df = df.withColumn("salutation", when(col("gender") == "M", "Mr.").otherwise("Ms.")) \
                .fillna({"passport_number": "N/A", "middle_name": "N/A", "doctorate": "No doctorate", "marital_status": "Unknown"})
        
        
        # Store in singleton
        self.master.setDataframes("patients", df)
            
    def get_patients(self):
        return self.master.getDataframes("patients")
    
# Optional: Standalone execution
if __name__ == "__main__":
    patients_etl = PatientsETL()
    df_proc = patients_etl.get_patients()
    df_proc.show(10)
    print("Columns:", df_proc.columns)
