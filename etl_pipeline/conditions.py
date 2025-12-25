# conditions_etl.py
from pyspark.sql.functions import col, to_date, regexp_extract
from etl_pipeline.master import Master
import os

class ConditionsETL:

    def __init__(self) -> None:
        self.master = Master()
        self.etl()

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

        # Extract event type from description
        df = df.withColumn("associated_semantics", regexp_extract(col("fsn"), r"\((.*?)\)$", 1)) \
               .withColumn("medical_concepts", regexp_extract(col("fsn"), r"^(.*?)\(", 1))

        # Store in singleton
        self.master.setDataframes("conditions", df)

    def getDf(self):
        return self.master.getDataframes("conditions")

# Optional: Standalone execution
if __name__ == "__main__":
    conditions_etl = ConditionsETL()
    df_proc = conditions_etl.getDf()
    df_proc.show(25)
    print("Columns:", df_proc.columns)
