#!/usr/bin/env python3
"""
Test photo size validation specifically
"""

import requests
import io
from PIL import Image

# Get backend URL
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            base_url = line.split('=')[1].strip() + "/api"
            break

# Login first
login_data = {"username": "admin", "password": "admin123"}
response = requests.post(f"{base_url}/auth/login", json=login_data)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create a large file (should be > 5MB)
print("Creating large test file...")
# Create 6MB of data
large_data = b'A' * (6 * 1024 * 1024)  # 6MB
img_buffer = io.BytesIO(large_data)

print(f"File size: {len(large_data)} bytes")
print(f"File size in MB: {len(large_data) / (1024*1024):.2f} MB")

# Reset buffer position
img_buffer.seek(0)

# Try to upload
files = {"file": ("large_test.png", img_buffer, "image/png")}
response = requests.post(f"{base_url}/upload-photo", files=files, headers=headers)

print(f"Response status: {response.status_code}")
print(f"Response: {response.json()}")