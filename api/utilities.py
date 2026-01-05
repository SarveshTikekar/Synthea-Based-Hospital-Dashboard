# -- Initialise all Singletons here to be exported in main api file --
import sys, os

sys.path.append(os.path.dirname(os.path.join(os.path.dirname(__file__), '..')))
import time

#Refactoring this code so to have loading of ETL objects only when necessary, so shifting it to main api file
from etl_pipeline.master import Master

main_singleton = Master()

#Utility functions would be written here in case of any local functionality needed in the API file