#!/usr/bin/env python3
"""
Seeding Script for MapTheAccused Application

This script seeds the database with:
1. Admin users with different roles
2. Comprehensive Indian accused data with realistic information

Usage:
    python seed_data.py
"""

import os
import sys
import uuid
from datetime import datetime
from pymongo import MongoClient
from passlib.context import CryptContext
import requests
from dotenv import load_dotenv

# Add parent directory to path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', '.env'))

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/maptheaccused")
OPENCAGE_API_KEY = os.getenv("OPENCAGE_API_KEY")

client = MongoClient(MONGO_URL)
db = client.maptheaccused

# Collections
users_collection = db.users
accused_collection = db.accused

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def geocode_address(address: str) -> tuple:
    """Geocode address using OpenCage API"""
    try:
        url = f"https://api.opencagedata.com/geocode/v1/json"
        params = {
            'q': address,
            'key': OPENCAGE_API_KEY,
            'countrycode': 'in',  # Restrict to India
            'limit': 1
        }
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['total_results'] > 0:
            result = data['results'][0]
            lat = result['geometry']['lat']
            lng = result['geometry']['lng']
            return lat, lng
        return None, None
    except Exception as e:
        print(f"Geocoding error for address '{address}': {e}")
        return None, None

def seed_admin_users():
    """Seed admin users with different roles"""
    print("🔐 Seeding admin users...")
    
    admin_users = [
        {
            "user_id": str(uuid.uuid4()),
            "username": "admin",
            "email": "admin@maptheaccused.com",
            "password": hash_password("admin123"),
            "role": "superadmin",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": str(uuid.uuid4()),
            "username": "inspector_singh",
            "email": "inspector.singh@police.gov.in",
            "password": hash_password("police123"),
            "role": "admin",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": str(uuid.uuid4()),
            "username": "cyber_admin",
            "email": "cyber.admin@cybercrime.gov.in",
            "password": hash_password("cyber123"),
            "role": "admin",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": str(uuid.uuid4()),
            "username": "data_analyst",
            "email": "analyst@maptheaccused.com",
            "password": hash_password("analyst123"),
            "role": "user",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Clear existing users except keep existing superadmin
    existing_superadmin = users_collection.find_one({"role": "superadmin"})
    users_collection.delete_many({})
    
    # Insert all admin users
    users_collection.insert_many(admin_users)
    
    print(f"✅ Created {len(admin_users)} admin users:")
    for user in admin_users:
        print(f"   - {user['username']} ({user['role']}) - password: {user['username'].split('_')[0] if '_' in user['username'] else user['username']}123")

def seed_indian_accused_data():
    """Seed comprehensive Indian accused data"""
    print("👤 Seeding Indian accused data...")
    
    accused_data = [
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Rajesh Kumar Singh",
            "phone_numbers": ["+91-9876543210", "+91-8765432109"],
            "address": "Plot 123, Connaught Place, New Delhi, Delhi 110001",
            "fraud_amount": 250000.0,
            "case_id": "FIR/2024/001",
            "fir_details": "Cheating and criminal breach of trust under sections 420, 406 IPC. Created fake investment scheme targeting elderly citizens.",
            "police_station": "Connaught Place Police Station, New Delhi",
            "tags": ["loan fraud", "fake documents", "elderly targeting"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Priya Sharma",
            "phone_numbers": ["+91-9123456789", "+91-8012345678"],
            "address": "B-45, Banjara Hills, Road No. 12, Hyderabad, Telangana 500034",
            "fraud_amount": 180000.0,
            "case_id": "FIR/2024/002",
            "fir_details": "Online investment fraud under IT Act Section 66D and IPC 420. Operated fake cryptocurrency trading platform.",
            "police_station": "Banjara Hills Police Station, Hyderabad",
            "tags": ["crypto scam", "investment fraud", "online fraud"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Mohammed Ali Khan",
            "phone_numbers": ["+91-9898989898", "+91-9797979797"],
            "address": "456, MG Road, Brigade Road Junction, Bengaluru, Karnataka 560001",
            "fraud_amount": 500000.0,
            "case_id": "FIR/2024/003",
            "fir_details": "Bank fraud and forgery under sections 420, 468, 471 IPC. Created fake bank documents for loan approval.",
            "police_station": "MG Road Police Station, Bengaluru",
            "tags": ["bank fraud", "forgery", "document fraud"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Anita Gupta",
            "phone_numbers": ["+91-9555666777"],
            "address": "C-78, Sector 15, Near City Center Mall, Noida, Uttar Pradesh 201301",
            "fraud_amount": 75000.0,
            "case_id": "FIR/2024/004",
            "fir_details": "Credit card fraud and identity theft under sections 420, 468 IPC and IT Act Section 66C.",
            "police_station": "Sector 20 Police Station, Noida",
            "tags": ["credit card fraud", "identity theft", "cyber crime"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Vikram Choudhary",
            "phone_numbers": ["+91-9111222333"],
            "address": "Plot 89, Linking Road, Bandra West, Mumbai, Maharashtra 400050",
            "fraud_amount": 320000.0,
            "case_id": "FIR/2024/005",
            "fir_details": "Real estate fraud under sections 420, 506 IPC. Sold non-existent properties to multiple buyers.",
            "police_station": "Bandra Police Station, Mumbai",
            "tags": ["real estate fraud", "cheating", "intimidation"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Sunita Agarwal",
            "phone_numbers": ["+91-9444555666", "+91-8333444555"],
            "address": "15A, Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017",
            "fraud_amount": 425000.0,
            "case_id": "FIR/2024/006",
            "fir_details": "Online matrimonial fraud under IPC 420, 506 and IT Act. Created fake profiles and extorted money.",
            "police_station": "T. Nagar Police Station, Chennai",
            "tags": ["matrimonial fraud", "extortion", "fake identity"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Deepak Joshi",
            "phone_numbers": ["+91-9777888999"],
            "address": "301, Satellite Road, Paldi, Ahmedabad, Gujarat 380007",
            "fraud_amount": 150000.0,
            "case_id": "FIR/2024/007",
            "fir_details": "Educational certificate fraud under sections 420, 468, 471 IPC. Created fake degree certificates.",
            "police_station": "Paldi Police Station, Ahmedabad",
            "tags": ["certificate fraud", "educational fraud", "forgery"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Kavita Reddy",
            "phone_numbers": ["+91-9000111222", "+91-8999000111"],
            "address": "Plot 45, Jubilee Hills, Near HITEC City, Hyderabad, Telangana 500033",
            "fraud_amount": 280000.0,
            "case_id": "FIR/2024/008",
            "fir_details": "Job placement fraud under IPC 420. Charged fees for fake job placements in IT companies.",
            "police_station": "Jubilee Hills Police Station, Hyderabad",
            "tags": ["job fraud", "placement scam", "fake promises"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Ravi Patel",
            "phone_numbers": ["+91-9666777888"],
            "address": "B/12, Law Garden Area, Ellisbridge, Ahmedabad, Gujarat 380006",
            "fraud_amount": 195000.0,
            "case_id": "FIR/2024/009",
            "fir_details": "Insurance fraud under IPC 420, 406. Filed false claims for vehicle accidents.",
            "police_station": "Ellisbridge Police Station, Ahmedabad",
            "tags": ["insurance fraud", "false claims", "vehicle fraud"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Meera Krishnan",
            "phone_numbers": ["+91-9333444555"],
            "address": "12/8, Brigade Road, Near Commercial Street, Bengaluru, Karnataka 560025",
            "fraud_amount": 360000.0,
            "case_id": "FIR/2024/010",
            "fir_details": "Medical fraud under IPC 420, 468. Operated fake medical clinic with forged certificates.",
            "police_station": "Commercial Street Police Station, Bengaluru",
            "tags": ["medical fraud", "fake clinic", "health scam"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        }
    ]
    
    # Clear existing accused data
    accused_collection.delete_many({})
    
    # Geocode addresses and insert data
    print("🌍 Geocoding addresses...")
    for i, accused in enumerate(accused_data, 1):
        print(f"   Processing {i}/{len(accused_data)}: {accused['full_name']}")
        lat, lng = geocode_address(accused["address"])
        accused["latitude"] = lat
        accused["longitude"] = lng
        
        if lat and lng:
            print(f"      ✅ Geocoded: {lat:.4f}, {lng:.4f}")
        else:
            print(f"      ❌ Failed to geocode address")
    
    # Insert all accused data
    accused_collection.insert_many(accused_data)
    
    print(f"✅ Created {len(accused_data)} accused records with comprehensive Indian data")

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding for MapTheAccused...")
    print("=" * 60)
    
    try:
        # Test database connection
        client.admin.command('ping')
        print("✅ Database connection successful")
        
        # Seed admin users
        seed_admin_users()
        print()
        
        # Seed accused data
        seed_indian_accused_data()
        print()
        
        print("=" * 60)
        print("🎉 Database seeding completed successfully!")
        print()
        print("📝 Login Credentials:")
        print("   Superadmin: admin / admin123")
        print("   Inspector: inspector_singh / police123")
        print("   Cyber Admin: cyber_admin / cyber123")
        print("   Data Analyst: data_analyst / analyst123")
        print()
        print("📊 Database Summary:")
        print(f"   Users: {users_collection.count_documents({})}")
        print(f"   Accused Records: {accused_collection.count_documents({})}")
        print(f"   Total Fraud Amount: ₹{sum([doc['fraud_amount'] for doc in accused_collection.find({})]):.2f}")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    main()