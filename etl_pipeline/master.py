from pyspark.sql import SparkSession

# -- We would be instantiating a SingleTon class here and that would be yielded to the API (Following System Design principles) -- 

class Master:

    _instance = None
    _master_spark = None
    def __new__(cls):
        if cls._instance is None:

            cls._instance = super().__new__(cls)
            cls._instance.__init_spark()
            cls._instance.dataframes = {}
        
        return cls._instance
    
    def __init_spark(self):
        self._master_spark = SparkSession.builder.appName("Hospital-ETL").config("spark.driver.memory", "4g").getOrCreate()
    
    def __detach_spark(self):
        self._master_spark.stop()
        self._master_spark = None
    
    def getDataframes(self, key):
        return self.dataframes.get(key)
    
    def setDataframes(self, key, df):
        self.dataframes[key] = df  
