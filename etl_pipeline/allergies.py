from pyspark.sql.functions import col, to_date, regexp_extract, initcap
from etl_pipeline.master import Master
import os

class AllergiesETL:

    def __init__(self) -> None:
        self.master = Master()
        self.etl()

    def etl(self):
        """
        Load the transformed conditions DataFrame from CSV if not already loaded.
        """

        path=os.path.join(os.path.dirname(__file__), "..", "Datasets", "csv", "allergies.csv")
        df = self.master._master_spark.read.csv(path, header=True, inferSchema=True)

        new_cols = ['recorded_date', '_', 'uuid', 'encounter_id', 'causative_agent_id', 'code_system', 'causative_agent', 'agent_aim', 'agent_class', 'primary_reaction_id', 'primary_reaction', 'primary_reaction_severity', 'symptom_id', 'symptom_observed', 'symptom_severity']

        for old_col, new_col in zip(df.columns, new_cols):
            df = df.withColumnRenamed(old_col, new_col)

        # Drop placeholder columns
        df = df.drop(*[col for col in df.columns if col.startswith('_')])

        # Convert date columns to proper date format
        df = df.withColumn("recorded_date", to_date(col("recorded_date"), "yyyy-MM-dd"))

        #Capitalize first letter for all severities
        df = df.withColumn("primary_reaction_severity", initcap("primary_reaction_severity")) \
        .withColumn("symptom_severity", initcap("symptom_severity"))
        
        #Cast all reaction and symptom ids into int

        df = df.withColumn("primary_reaction_id", col("primary_reaction_id").cast("int")) \
        .withColumn("symptom_id", col("symptom_id").cast("int"))

        # Store in singleton
        self.master.setDataframes("allergies", df)
    
    def getDf(self):
        return self.master.getDataframes("allergies")

# Optional: Standalone execution
if __name__ == "__main__":
    allergies_etl = AllergiesETL()
    df_proc = allergies_etl.getDf() 
    df_proc.show(15)
    print(f"Columns are:{df_proc.columns}")
