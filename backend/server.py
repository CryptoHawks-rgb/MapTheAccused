from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import uuid
import requests
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="MapTheAccused API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client.maptheaccused

# Collections
users_collection = db.users
accused_collection = db.accused

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
OPENCAGE_API_KEY = os.getenv("OPENCAGE_API_KEY")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class AccusedCreate(BaseModel):
    full_name: str
    phone_numbers: List[str]
    address: str
    fraud_amount: float
    case_id: str
    fir_details: str
    police_station: str
    tags: List[str]
    profile_photo: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AccusedUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_numbers: Optional[List[str]] = None
    address: Optional[str] = None
    fraud_amount: Optional[float] = None
    case_id: Optional[str] = None
    fir_details: Optional[str] = None
    police_station: Optional[str] = None
    tags: Optional[List[str]] = None
    profile_photo: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    search_type: str  # "phone", "name", "address"

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user

def require_role(required_role: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] != required_role and current_user["role"] != "superadmin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

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
        print(f"Geocoding error: {e}")
        return None, None

# Create superadmin user on startup
@app.on_event("startup")
async def create_superadmin():
    superadmin = users_collection.find_one({"role": "superadmin"})
    if not superadmin:
        superadmin_data = {
            "user_id": str(uuid.uuid4()),
            "username": "admin",
            "email": "admin@maptheaccused.com",
            "password": hash_password("admin123"),
            "role": "superadmin",
            "created_at": datetime.utcnow()
        }
        users_collection.insert_one(superadmin_data)
        print("Superadmin user created: username=admin, password=admin123")

# Auth endpoints
@app.post("/api/auth/register", response_model=dict)
async def register(user: UserCreate, current_user: dict = Depends(require_role("superadmin"))):
    """Register a new user (superadmin only)"""
    try:
        user_data = {
            "user_id": str(uuid.uuid4()),
            "username": user.username,
            "email": user.email,
            "password": hash_password(user.password),
            "role": user.role,
            "created_at": datetime.utcnow()
        }
        users_collection.insert_one(user_data)
        return {"message": "User created successfully"}
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Username or email already exists")

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    """Login user"""
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user["role"]
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

# Accused endpoints
@app.post("/api/accused", response_model=dict)
async def create_accused(accused: AccusedCreate, current_user: dict = Depends(require_role("admin"))):
    """Create a new accused record (admin/superadmin only)"""
    accused_data = accused.dict()
    accused_data["accused_id"] = str(uuid.uuid4())
    accused_data["created_at"] = datetime.utcnow()
    accused_data["created_by"] = current_user["username"]
    
    # Geocode address if lat/lng not provided
    if not accused_data["latitude"] or not accused_data["longitude"]:
        lat, lng = geocode_address(accused_data["address"])
        accused_data["latitude"] = lat
        accused_data["longitude"] = lng
    
    accused_collection.insert_one(accused_data)
    return {"message": "Accused record created successfully", "accused_id": accused_data["accused_id"]}

@app.get("/api/accused", response_model=list)
async def get_all_accused(current_user: dict = Depends(get_current_user)):
    """Get all accused records"""
    accused_list = list(accused_collection.find({}, {"_id": 0}))
    return accused_list

@app.get("/api/accused/{accused_id}", response_model=dict)
async def get_accused(accused_id: str, current_user: dict = Depends(get_current_user)):
    """Get accused by ID"""
    accused = accused_collection.find_one({"accused_id": accused_id}, {"_id": 0})
    if not accused:
        raise HTTPException(status_code=404, detail="Accused not found")
    return accused

@app.put("/api/accused/{accused_id}", response_model=dict)
async def update_accused(accused_id: str, accused_update: AccusedUpdate, current_user: dict = Depends(require_role("admin"))):
    """Update accused record (admin/superadmin only)"""
    update_data = {k: v for k, v in accused_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    # Geocode address if it's being updated
    if "address" in update_data:
        lat, lng = geocode_address(update_data["address"])
        update_data["latitude"] = lat
        update_data["longitude"] = lng
    
    update_data["updated_at"] = datetime.utcnow()
    update_data["updated_by"] = current_user["username"]
    
    result = accused_collection.update_one(
        {"accused_id": accused_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Accused not found")
    
    return {"message": "Accused record updated successfully"}

@app.delete("/api/accused/{accused_id}", response_model=dict)
async def delete_accused(accused_id: str, current_user: dict = Depends(require_role("superadmin"))):
    """Delete accused record (superadmin only)"""
    result = accused_collection.delete_one({"accused_id": accused_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Accused not found")
    return {"message": "Accused record deleted successfully"}

@app.post("/api/search", response_model=list)
async def search_accused(search: SearchQuery, current_user: dict = Depends(get_current_user)):
    """Search accused by phone, name, or address"""
    query = search.query.strip().lower()
    search_type = search.search_type.lower()
    
    if search_type == "phone":
        # Search in phone_numbers array
        results = list(accused_collection.find(
            {"phone_numbers": {"$regex": query, "$options": "i"}}, 
            {"_id": 0}
        ))
    elif search_type == "name":
        # Search in full_name
        results = list(accused_collection.find(
            {"full_name": {"$regex": query, "$options": "i"}}, 
            {"_id": 0}
        ))
    elif search_type == "address":
        # Search in address
        results = list(accused_collection.find(
            {"address": {"$regex": query, "$options": "i"}}, 
            {"_id": 0}
        ))
    else:
        # Search in all fields
        results = list(accused_collection.find({
            "$or": [
                {"full_name": {"$regex": query, "$options": "i"}},
                {"address": {"$regex": query, "$options": "i"}},
                {"phone_numbers": {"$regex": query, "$options": "i"}},
                {"case_id": {"$regex": query, "$options": "i"}},
                {"tags": {"$regex": query, "$options": "i"}}
            ]
        }, {"_id": 0}))
    
    return results

@app.get("/api/dashboard/stats", response_model=dict)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    total_accused = accused_collection.count_documents({})
    total_fraud_amount = list(accused_collection.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$fraud_amount"}}}
    ]))
    total_amount = total_fraud_amount[0]["total"] if total_fraud_amount else 0
    
    # Top fraud types (tags)
    tag_stats = list(accused_collection.aggregate([
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]))
    
    # City-wise stats
    city_stats = list(accused_collection.aggregate([
        {"$group": {"_id": "$police_station", "count": {"$sum": 1}, "total_amount": {"$sum": "$fraud_amount"}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]))
    
    return {
        "total_accused": total_accused,
        "total_fraud_amount": total_amount,
        "top_fraud_types": tag_stats,
        "city_stats": city_stats
    }

# Users management endpoints
@app.get("/api/users", response_model=list)
async def get_all_users(current_user: dict = Depends(require_role("superadmin"))):
    """Get all users (superadmin only)"""
    users_list = list(users_collection.find({}, {"_id": 0, "password": 0}))
    return users_list

@app.delete("/api/users/{user_id}", response_model=dict)
async def delete_user(user_id: str, current_user: dict = Depends(require_role("superadmin"))):
    """Delete user (superadmin only)"""
    # Don't allow deletion of current user
    if users_collection.find_one({"user_id": user_id, "username": current_user["username"]}):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = users_collection.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Seed data endpoint
@app.post("/api/seed-data", response_model=dict)
async def seed_sample_data(current_user: dict = Depends(require_role("superadmin"))):
    """Seed sample Indian fraud case data (superadmin only)"""
    sample_data = [
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Rajesh Kumar Singh",
            "phone_numbers": ["+91-9876543210", "+91-8765432109"],
            "address": "Plot 123, Connaught Place, New Delhi, Delhi 110001",
            "fraud_amount": 250000.0,
            "case_id": "FIR/2024/001",
            "fir_details": "Cheating and criminal breach of trust under sections 420, 406 IPC",
            "police_station": "Connaught Place Police Station, New Delhi",
            "tags": ["loan fraud", "fake documents"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Priya Sharma",
            "phone_numbers": ["+91-9123456789"],
            "address": "B-45, Banjara Hills, Hyderabad, Telangana 500034",
            "fraud_amount": 180000.0,
            "case_id": "FIR/2024/002",
            "fir_details": "Online investment fraud under IT Act and IPC 420",
            "police_station": "Banjara Hills Police Station, Hyderabad",
            "tags": ["crypto scam", "investment fraud"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Mohammed Ali Khan",
            "phone_numbers": ["+91-9898989898", "+91-9797979797"],
            "address": "456, MG Road, Bengaluru, Karnataka 560001",
            "fraud_amount": 500000.0,
            "case_id": "FIR/2024/003",
            "fir_details": "Bank fraud and forgery under sections 420, 468, 471 IPC",
            "police_station": "MG Road Police Station, Bengaluru",
            "tags": ["bank fraud", "forgery"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        },
        {
            "accused_id": str(uuid.uuid4()),
            "full_name": "Anita Gupta",
            "phone_numbers": ["+91-9555666777"],
            "address": "C-78, Sector 15, Noida, Uttar Pradesh 201301",
            "fraud_amount": 75000.0,
            "case_id": "FIR/2024/004",
            "fir_details": "Credit card fraud under sections 420, 468 IPC",
            "police_station": "Sector 20 Police Station, Noida",
            "tags": ["credit card fraud", "identity theft"],
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
            "fir_details": "Real estate fraud under sections 420, 506 IPC",
            "police_station": "Bandra Police Station, Mumbai",
            "tags": ["real estate fraud", "cheating"],
            "created_at": datetime.utcnow(),
            "created_by": "system"
        }
    ]
    
    # Clear existing data
    accused_collection.delete_many({})
    
    # Geocode addresses and insert data
    for accused in sample_data:
        lat, lng = geocode_address(accused["address"])
        accused["latitude"] = lat
        accused["longitude"] = lng
        accused_collection.insert_one(accused)
    
    return {"message": f"Successfully seeded {len(sample_data)} sample accused records"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)