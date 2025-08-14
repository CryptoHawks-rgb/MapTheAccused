#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for MapTheAccused System
Tests authentication, CRUD operations, search, dashboard, and geocoding functionality
"""

import requests
import json
import time
import os
import io
from PIL import Image
from typing import Dict, Any, Optional

class MapTheAccusedAPITester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.base_url = self.get_backend_url()
        self.headers = {"Content-Type": "application/json"}
        self.auth_token = None
        self.test_results = []
        
    def get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        url = line.split('=')[1].strip()
                        return f"{url}/api"
            return "http://localhost:8001/api"
        except:
            return "http://localhost:8001/api"
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, files: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{self.base_url}{endpoint}"
            request_headers = self.headers.copy()
            if headers:
                request_headers.update(headers)
            
            # Remove Content-Type for file uploads to let requests set it
            if files:
                request_headers.pop("Content-Type", None)
            
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method.upper() == "POST":
                if files:
                    response = requests.post(url, data=data, files=files, headers=request_headers, timeout=10)
                else:
                    response = requests.post(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=request_headers, timeout=10)
            else:
                return False, f"Unsupported method: {method}", 0
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", 0
    
    def test_authentication(self):
        """Test authentication and authorization"""
        print("🔐 Testing Authentication & Authorization...")
        
        # Test login with superadmin credentials
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        success, response, status_code = self.make_request("POST", "/auth/login", login_data)
        
        if success and "access_token" in response:
            self.auth_token = response["access_token"]
            self.headers["Authorization"] = f"Bearer {self.auth_token}"
            self.log_test("Superadmin Login", True, 
                         f"Successfully logged in as {response.get('role', 'unknown')} role")
            
            # Test getting current user info
            success, user_info, _ = self.make_request("GET", "/auth/me")
            if success:
                self.log_test("Get Current User Info", True, 
                             f"User: {user_info.get('username')}, Role: {user_info.get('role')}")
            else:
                self.log_test("Get Current User Info", False, "Failed to get user info", user_info)
        else:
            self.log_test("Superadmin Login", False, f"Status: {status_code}", response)
            return False
        
        return True
    
    def test_data_seeding(self):
        """Test data seeding functionality"""
        print("🌱 Testing Data Seeding...")
        
        success, response, status_code = self.make_request("POST", "/seed-data")
        
        if success:
            self.log_test("Seed Sample Data", True, response.get("message", "Data seeded successfully"))
        else:
            self.log_test("Seed Sample Data", False, f"Status: {status_code}", response)
        
        return success
    
    def test_accused_crud(self):
        """Test CRUD operations for accused records"""
        print("👤 Testing Accused Management CRUD...")
        
        # Test GET all accused (should return 5 seeded records)
        success, accused_list, status_code = self.make_request("GET", "/accused")
        
        if success and isinstance(accused_list, list):
            count = len(accused_list)
            self.log_test("GET All Accused Records", True, 
                         f"Retrieved {count} accused records")
            
            if count >= 5:
                self.log_test("Verify Seeded Data Count", True, 
                             f"Found {count} records (expected 5+)")
            else:
                self.log_test("Verify Seeded Data Count", False, 
                             f"Found only {count} records, expected 5")
        else:
            self.log_test("GET All Accused Records", False, f"Status: {status_code}", accused_list)
            return False
        
        # Test GET individual accused record
        if accused_list:
            first_accused_id = accused_list[0].get("accused_id")
            if first_accused_id:
                success, accused_detail, _ = self.make_request("GET", f"/accused/{first_accused_id}")
                if success:
                    self.log_test("GET Individual Accused Record", True, 
                                 f"Retrieved details for {accused_detail.get('full_name')}")
                else:
                    self.log_test("GET Individual Accused Record", False, 
                                 "Failed to get individual record", accused_detail)
        
        # Test POST - Create new accused with Indian address
        new_accused_data = {
            "full_name": "Test Kumar Patel",
            "phone_numbers": ["+91-9988776655"],
            "address": "123, Brigade Road, Bengaluru, Karnataka 560025",
            "fraud_amount": 150000.0,
            "case_id": "FIR/2024/TEST001",
            "fir_details": "Test case for API validation under section 420 IPC",
            "police_station": "Brigade Road Police Station, Bengaluru",
            "tags": ["test case", "api validation"]
        }
        
        success, create_response, status_code = self.make_request("POST", "/accused", new_accused_data)
        
        if success and "accused_id" in create_response:
            created_id = create_response["accused_id"]
            self.log_test("POST Create New Accused", True, 
                         f"Created accused with ID: {created_id}")
            
            # Test PUT - Update the created record
            update_data = {
                "fraud_amount": 175000.0,
                "tags": ["test case", "api validation", "updated"]
            }
            
            success, update_response, _ = self.make_request("PUT", f"/accused/{created_id}", update_data)
            if success:
                self.log_test("PUT Update Accused Record", True, "Successfully updated accused record")
            else:
                self.log_test("PUT Update Accused Record", False, "Failed to update record", update_response)
            
            # Test DELETE (superadmin only)
            success, delete_response, _ = self.make_request("DELETE", f"/accused/{created_id}")
            if success:
                self.log_test("DELETE Accused Record", True, "Successfully deleted accused record")
            else:
                self.log_test("DELETE Accused Record", False, "Failed to delete record", delete_response)
        else:
            self.log_test("POST Create New Accused", False, f"Status: {status_code}", create_response)
        
        return True
    
    def test_search_functionality(self):
        """Test search functionality with different search types"""
        print("🔍 Testing Search Functionality...")
        
        search_tests = [
            {"query": "Rajesh", "search_type": "name", "description": "Search by name"},
            {"query": "9876543210", "search_type": "phone", "description": "Search by phone"},
            {"query": "Delhi", "search_type": "address", "description": "Search by address"},
            {"query": "FIR/2024/001", "search_type": "case_id", "description": "Search by case ID"}
        ]
        
        for search_test in search_tests:
            search_data = {
                "query": search_test["query"],
                "search_type": search_test["search_type"]
            }
            
            success, results, status_code = self.make_request("POST", "/search", search_data)
            
            if success and isinstance(results, list):
                count = len(results)
                self.log_test(f"Search - {search_test['description']}", True, 
                             f"Found {count} results for '{search_test['query']}'")
            else:
                self.log_test(f"Search - {search_test['description']}", False, 
                             f"Status: {status_code}", results)
    
    def test_dashboard_analytics(self):
        """Test dashboard analytics and statistics"""
        print("📊 Testing Dashboard Analytics...")
        
        success, stats, status_code = self.make_request("GET", "/dashboard/stats")
        
        if success and isinstance(stats, dict):
            total_accused = stats.get("total_accused", 0)
            total_fraud_amount = stats.get("total_fraud_amount", 0)
            top_fraud_types = stats.get("top_fraud_types", [])
            city_stats = stats.get("city_stats", [])
            
            self.log_test("Dashboard Statistics", True, 
                         f"Total Accused: {total_accused}, Total Fraud Amount: ₹{total_fraud_amount:,.0f}")
            
            # Verify expected fraud amount (₹13,25,000 from seeded data)
            expected_amount = 1325000  # 250000 + 180000 + 500000 + 75000 + 320000
            if abs(total_fraud_amount - expected_amount) < 1000:  # Allow small variance
                self.log_test("Verify Total Fraud Amount", True, 
                             f"Amount matches expected: ₹{total_fraud_amount:,.0f}")
            else:
                self.log_test("Verify Total Fraud Amount", False, 
                             f"Expected ₹{expected_amount:,.0f}, got ₹{total_fraud_amount:,.0f}")
            
            if top_fraud_types:
                self.log_test("Fraud Type Aggregations", True, 
                             f"Found {len(top_fraud_types)} fraud types")
            
            if city_stats:
                self.log_test("City-wise Statistics", True, 
                             f"Found {len(city_stats)} city statistics")
        else:
            self.log_test("Dashboard Statistics", False, f"Status: {status_code}", stats)
    
    def create_test_image(self, filename: str, size: tuple = (100, 100), format: str = "JPEG") -> io.BytesIO:
        """Create a test image file in memory"""
        img = Image.new('RGB', size, color='red')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format=format)
        img_buffer.seek(0)
        return img_buffer
    
    def create_large_test_image(self, filename: str) -> io.BytesIO:
        """Create a large test image (>5MB) for size validation testing"""
        # Create a large image that will exceed 5MB when saved
        img = Image.new('RGB', (3000, 3000), color='blue')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG', quality=100)
        img_buffer.seek(0)
        return img_buffer
    
    def test_photo_upload_functionality(self):
        """Test photo upload functionality comprehensively"""
        print("📸 Testing Photo Upload Functionality...")
        
        # Test 1: Valid photo upload (JPEG)
        test_image = self.create_test_image("test.jpg", format="JPEG")
        files = {"file": ("test.jpg", test_image, "image/jpeg")}
        
        success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
        
        uploaded_filename = None
        if success and "photo_url" in response:
            photo_url = response["photo_url"]
            uploaded_filename = response.get("filename")
            self.log_test("Photo Upload - Valid JPEG", True, 
                         f"Photo uploaded successfully: {photo_url}")
        else:
            self.log_test("Photo Upload - Valid JPEG", False, 
                         f"Status: {status_code}", response)
        
        # Test 2: Valid photo upload (PNG)
        test_image_png = self.create_test_image("test.png", format="PNG")
        files = {"file": ("test.png", test_image_png, "image/png")}
        
        success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
        
        uploaded_filename_png = None
        if success and "photo_url" in response:
            uploaded_filename_png = response.get("filename")
            self.log_test("Photo Upload - Valid PNG", True, 
                         f"PNG photo uploaded successfully: {response['photo_url']}")
        else:
            self.log_test("Photo Upload - Valid PNG", False, 
                         f"Status: {status_code}", response)
        
        # Test 3: Valid photo upload (WebP)
        test_image_webp = self.create_test_image("test.webp", format="WEBP")
        files = {"file": ("test.webp", test_image_webp, "image/webp")}
        
        success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
        
        uploaded_filename_webp = None
        if success and "photo_url" in response:
            uploaded_filename_webp = response.get("filename")
            self.log_test("Photo Upload - Valid WebP", True, 
                         f"WebP photo uploaded successfully: {response['photo_url']}")
        else:
            self.log_test("Photo Upload - Valid WebP", False, 
                         f"Status: {status_code}", response)
        
        # Test 4: Invalid file type (text file)
        text_file = io.BytesIO(b"This is not an image")
        files = {"file": ("test.txt", text_file, "text/plain")}
        
        success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
        
        if not success and status_code == 400:
            self.log_test("Photo Upload - Invalid File Type", True, 
                         "Correctly rejected non-image file")
        else:
            self.log_test("Photo Upload - Invalid File Type", False, 
                         f"Should have rejected text file. Status: {status_code}", response)
        
        # Test 5: File size validation (>5MB)
        try:
            large_image = self.create_large_test_image("large.jpg")
            files = {"file": ("large.jpg", large_image, "image/jpeg")}
            
            success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
            
            if not success and status_code == 400:
                self.log_test("Photo Upload - Size Limit Validation", True, 
                             "Correctly rejected oversized file")
            else:
                self.log_test("Photo Upload - Size Limit Validation", False, 
                             f"Should have rejected large file. Status: {status_code}", response)
        except Exception as e:
            self.log_test("Photo Upload - Size Limit Validation", False, 
                         f"Error creating large test image: {str(e)}")
        
        # Test 6: Upload without authentication
        temp_headers = self.headers.copy()
        self.headers.pop("Authorization", None)
        
        test_image_auth = self.create_test_image("auth_test.jpg", format="JPEG")
        files = {"file": ("auth_test.jpg", test_image_auth, "image/jpeg")}
        
        success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
        
        if not success and status_code == 401:
            self.log_test("Photo Upload - Authentication Required", True, 
                         "Correctly rejected unauthenticated request")
        else:
            self.log_test("Photo Upload - Authentication Required", False, 
                         f"Should require authentication. Status: {status_code}", response)
        
        # Restore authentication
        self.headers = temp_headers
        
        # Test 7: Static file serving
        if uploaded_filename:
            # Test accessing uploaded file via static URL
            static_url = f"{self.base_url}/uploads/{uploaded_filename}"
            try:
                response = requests.get(static_url, timeout=10)
                if response.status_code == 200 and response.headers.get('content-type', '').startswith('image/'):
                    self.log_test("Static File Serving", True, 
                                 f"Successfully served uploaded image: {uploaded_filename}")
                else:
                    self.log_test("Static File Serving", False, 
                                 f"Failed to serve image. Status: {response.status_code}")
            except Exception as e:
                self.log_test("Static File Serving", False, 
                             f"Error accessing static file: {str(e)}")
        
        # Return uploaded filenames for cleanup in other tests
        return {
            "jpeg": uploaded_filename,
            "png": uploaded_filename_png,
            "webp": uploaded_filename_webp
        }
    
    def test_photo_delete_functionality(self, uploaded_files: Dict[str, str]):
        """Test photo deletion functionality"""
        print("🗑️ Testing Photo Delete Functionality...")
        
        # Test deleting uploaded photos
        for format_type, filename in uploaded_files.items():
            if filename:
                success, response, status_code = self.make_request("DELETE", f"/delete-photo/{filename}")
                
                if success:
                    self.log_test(f"Photo Delete - {format_type.upper()}", True, 
                                 f"Successfully deleted {filename}")
                else:
                    self.log_test(f"Photo Delete - {format_type.upper()}", False, 
                                 f"Failed to delete {filename}. Status: {status_code}", response)
        
        # Test deleting non-existent photo
        success, response, status_code = self.make_request("DELETE", "/delete-photo/nonexistent.jpg")
        
        # This should still return success as per the implementation
        if success:
            self.log_test("Photo Delete - Non-existent File", True, 
                         "Handled non-existent file deletion gracefully")
        else:
            self.log_test("Photo Delete - Non-existent File", False, 
                         f"Status: {status_code}", response)
        
        # Test delete without authentication
        temp_headers = self.headers.copy()
        self.headers.pop("Authorization", None)
        
        success, response, status_code = self.make_request("DELETE", "/delete-photo/test.jpg")
        
        if not success and status_code == 401:
            self.log_test("Photo Delete - Authentication Required", True, 
                         "Correctly rejected unauthenticated delete request")
        else:
            self.log_test("Photo Delete - Authentication Required", False, 
                         f"Should require authentication. Status: {status_code}", response)
        
        # Restore authentication
        self.headers = temp_headers
    
    def test_accused_with_photos(self):
        """Test accused management with photo integration"""
        print("👤📸 Testing Accused Management with Photos...")
        
        # First upload a photo
        test_image = self.create_test_image("profile.jpg", format="JPEG")
        files = {"file": ("profile.jpg", test_image, "image/jpeg")}
        
        success, upload_response, _ = self.make_request("POST", "/upload-photo", files=files)
        
        if not success or "photo_url" not in upload_response:
            self.log_test("Accused with Photos - Photo Upload Failed", False, 
                         "Could not upload photo for accused testing")
            return
        
        photo_url = upload_response["photo_url"]
        uploaded_filename = upload_response["filename"]
        
        # Test 1: Create accused with profile photo
        accused_data = {
            "full_name": "Arjun Singh Rajput",
            "phone_numbers": ["+91-9876543211"],
            "address": "456, MG Road, Pune, Maharashtra 411001",
            "fraud_amount": 200000.0,
            "case_id": "FIR/2024/PHOTO001",
            "fir_details": "Online fraud with fake identity under sections 420, 468 IPC",
            "police_station": "MG Road Police Station, Pune",
            "tags": ["online fraud", "identity theft"],
            "profile_photo": photo_url
        }
        
        success, create_response, status_code = self.make_request("POST", "/accused", accused_data)
        
        if success and "accused_id" in create_response:
            accused_id = create_response["accused_id"]
            self.log_test("Create Accused with Photo", True, 
                         f"Created accused with profile photo: {accused_id}")
            
            # Test 2: Verify photo URL in accused record
            success, accused_detail, _ = self.make_request("GET", f"/accused/{accused_id}")
            
            if success and accused_detail.get("profile_photo") == photo_url:
                self.log_test("Verify Photo URL in Accused Record", True, 
                             f"Photo URL correctly stored: {photo_url}")
            else:
                self.log_test("Verify Photo URL in Accused Record", False, 
                             f"Photo URL mismatch or missing")
            
            # Test 3: Update accused with new photo
            new_test_image = self.create_test_image("new_profile.jpg", format="JPEG")
            files = {"file": ("new_profile.jpg", new_test_image, "image/jpeg")}
            
            success, new_upload_response, _ = self.make_request("POST", "/upload-photo", files=files)
            
            if success and "photo_url" in new_upload_response:
                new_photo_url = new_upload_response["photo_url"]
                new_filename = new_upload_response["filename"]
                
                update_data = {"profile_photo": new_photo_url}
                success, update_response, _ = self.make_request("PUT", f"/accused/{accused_id}", update_data)
                
                if success:
                    self.log_test("Update Accused Photo", True, 
                                 "Successfully updated accused profile photo")
                    
                    # Verify old photo should be deleted (implementation should handle this)
                    # Note: The backend should delete the old photo file when updating
                    
                else:
                    self.log_test("Update Accused Photo", False, 
                                 "Failed to update accused photo", update_response)
                    # Clean up new photo if update failed
                    self.make_request("DELETE", f"/delete-photo/{new_filename}")
            
            # Test 4: Delete accused record (should also delete associated photo)
            success, delete_response, _ = self.make_request("DELETE", f"/accused/{accused_id}")
            
            if success:
                self.log_test("Delete Accused with Photo", True, 
                             "Successfully deleted accused record (photo should be auto-deleted)")
            else:
                self.log_test("Delete Accused with Photo", False, 
                             "Failed to delete accused record", delete_response)
        else:
            self.log_test("Create Accused with Photo", False, 
                         f"Status: {status_code}", create_response)
            # Clean up uploaded photo if accused creation failed
            self.make_request("DELETE", f"/delete-photo/{uploaded_filename}")
    
    def test_photo_role_permissions(self):
        """Test role-based permissions for photo operations"""
        print("🔐📸 Testing Photo Role Permissions...")
        
        # This test would require creating a user with 'user' role
        # For now, we'll test that admin/superadmin roles work
        # The authentication test already covers this partially
        
        # Test that current admin user can upload photos
        test_image = self.create_test_image("permission_test.jpg", format="JPEG")
        files = {"file": ("permission_test.jpg", test_image, "image/jpeg")}
        
        success, response, status_code = self.make_request("POST", "/upload-photo", files=files)
        
        if success:
            self.log_test("Admin Role Photo Upload Permission", True, 
                         "Admin user can upload photos")
            
            # Clean up
            if "filename" in response:
                self.make_request("DELETE", f"/delete-photo/{response['filename']}")
        else:
            self.log_test("Admin Role Photo Upload Permission", False, 
                         f"Admin should be able to upload photos. Status: {status_code}", response)
        """Test OpenCage geocoding integration"""
        print("🌍 Testing OpenCage Geocoding Integration...")
        
        # Create accused with Indian addresses to test geocoding
        test_addresses = [
            "Mumbai, Maharashtra",
            "Bengaluru, Karnataka"
        ]
        
        for i, address in enumerate(test_addresses):
            accused_data = {
                "full_name": f"Geocoding Test User {i+1}",
                "phone_numbers": [f"+91-900000000{i}"],
                "address": address,
                "fraud_amount": 50000.0,
                "case_id": f"GEO/TEST/{i+1}",
                "fir_details": "Geocoding test case",
                "police_station": f"Test Station {i+1}",
                "tags": ["geocoding test"]
            }
            
            success, response, status_code = self.make_request("POST", "/accused", accused_data)
            
            if success and "accused_id" in response:
                accused_id = response["accused_id"]
                
                # Get the created record to check if geocoding worked
                success, accused_detail, _ = self.make_request("GET", f"/accused/{accused_id}")
                
                if success:
                    lat = accused_detail.get("latitude")
                    lng = accused_detail.get("longitude")
                    
                    if lat is not None and lng is not None:
                        self.log_test(f"Geocoding - {address}", True, 
                                     f"Coordinates: {lat:.4f}, {lng:.4f}")
                    else:
                        self.log_test(f"Geocoding - {address}", False, 
                                     "No coordinates found after geocoding")
                    
                    # Clean up test record
                    self.make_request("DELETE", f"/accused/{accused_id}")
                else:
                    self.log_test(f"Geocoding - {address}", False, 
                                 "Failed to retrieve created record")
            else:
                self.log_test(f"Geocoding - {address}", False, 
                             f"Failed to create test record: {response}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend API Testing for MapTheAccused")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test authentication first
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return
        
        # Test data seeding
        self.test_data_seeding()
        
        # Wait a moment for data to be processed
        time.sleep(2)
        
        # Test CRUD operations
        self.test_accused_crud()
        
        # Test search functionality
        self.test_search_functionality()
        
        # Test dashboard analytics
        self.test_dashboard_analytics()
        
        # Test geocoding integration
        self.test_geocoding_integration()
        
        # Test photo upload functionality
        uploaded_files = self.test_photo_upload_functionality()
        
        # Test photo delete functionality
        self.test_photo_delete_functionality(uploaded_files)
        
        # Test accused management with photos
        self.test_accused_with_photos()
        
        # Test photo role permissions
        self.test_photo_role_permissions()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅" in result["status"])
        failed = sum(1 for result in self.test_results if "❌" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        print()
        
        if failed > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌" in result["status"]:
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        print("✅ PASSED TESTS:")
        for result in self.test_results:
            if "✅" in result["status"]:
                print(f"  - {result['test']}")

if __name__ == "__main__":
    tester = MapTheAccusedAPITester()
    tester.run_all_tests()