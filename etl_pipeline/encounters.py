from pyspark.sql.functions import col, to_date, regexp_extract, date_format, expr, to_timestamp, cast
from etl_pipeline.master import Master
import os

class EncountersETL:

    def __init__(self) -> None:
        self.master = Master()
        self.etl()

    def etl(self):
        """
        Load the transformed conditions DataFrame from CSV if not already loaded.
        """

        path=os.path.join(os.path.dirname(__file__), "..", "Datasets", "csv", "encounters.csv")
        
        df = self.master._master_spark.read.csv(path, header=True, inferSchema=True)
        new_cols = ['encounter_id', 'visit_start', 'visit_end', 'uuid', 'hospital_id', 'practioner_id', '_', 'encounter_type', 'encounter_reason_id', 'encounter_reason', 'visiting_base_fees', 'visting_total_fees', 'coverage', 'diagnosis_id', 'diagnosis']

        for old_col, new_col in zip(df.columns, new_cols):
            df = df.withColumnRenamed(old_col, new_col)

        # Drop placeholder columns
        df = df.drop(*[col for col in df.columns if col.startswith('_')])

        # Convert date columns to proper date format
        df = df.withColumn("visit_start", date_format(to_timestamp(col("visit_start")) + expr("INTERVAL 5 HOURS 30 MINUTES"), "yyyy-MM-dd'T'HH:mm:ss'Z'"))
        
        df = df.withColumn("visit_end", date_format(to_timestamp(col("visit_end")) + expr("INTERVAL 5 HOURS 30 MINUTES"), "yyyy-MM-dd'T'HH:mm:ss'Z'"))

        #Typecast ids to proper int
        df = df.withColumn("diagnosis_id", col("diagnosis_id").cast("int"))

        # Store in singleton
        self.master.setDataframes("encounters", df)

    def getDf(self):
        return self.master.getDataframes("encounters")

# Optional: Standalone execution
if __name__ == "__main__":
    encounters = EncountersETL()
    df_proc = encounters.getDf()
    df_proc.show(25)
    print("Columns:", df_proc.columns)
