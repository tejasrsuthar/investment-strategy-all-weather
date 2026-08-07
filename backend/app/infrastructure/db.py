import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME", "raghuvir_consultants")

# Use certifi's root certificate bundle for mongodb+srv / tls connections
mongo_kwargs = {}
if "mongodb+srv://" in MONGO_URI or "tls=true" in MONGO_URI.lower() or "ssl=true" in MONGO_URI.lower():
    mongo_kwargs["tlsCAFile"] = certifi.where()

client = MongoClient(MONGO_URI, **mongo_kwargs)
db = client[DB_NAME]

def get_db():
    return db
