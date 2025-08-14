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
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{self.base_url}{endpoint}"
            request_headers = self.headers.copy()
            if headers:
                request_headers.update(headers)
            
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method.upper() == "POST":
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
    
    def test_geocoding_integration(self):
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