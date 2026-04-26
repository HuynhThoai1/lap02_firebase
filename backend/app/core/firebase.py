import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

import json

load_dotenv()

if not firebase_admin._apps:
    firebase_credentials = os.getenv("FIREBASE_CREDENTIALS_JSON")
    
    if firebase_credentials:
        # Load from JSON string (Production/Render)
        cred_dict = json.loads(firebase_credentials)
        cred = credentials.Certificate(cred_dict)
    else:
        # Load from file (Local Development)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-key.json")
        full_key_path = os.path.join(base_dir, key_path)
        cred = credentials.Certificate(full_key_path)
        
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_db():
    return db

def get_auth():
    return auth
