# MapTheAccused - Fraud Case Visualization System

## Project Overview
MapTheAccused is a comprehensive web application designed to visualize accused individuals involved in fraud or cybercrime cases. The system provides search functionality by phone number, name, or address, and displays their locations on interactive maps.

## Original User Problem Statement
Build a web application to visualize accused individuals involved in fraud or cybercrime cases, searchable by phone number, name, or address. When a user searches, the app should show the accused's details if available and highlight their location on Google Maps (via MyMaps or Google Maps embed).

## Technical Implementation

### Tech Stack Used
- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React with Tailwind CSS  
- **Maps**: Leaflet with OpenStreetMap tiles
- **Geocoding**: OpenCage Data API
- **Authentication**: JWT with role-based access control
- **Deployment**: Kubernetes with supervisor

### Key Features Implemented

#### 🔍 Search Functionality
- Multi-field search: phone number, name, address, case ID
- Advanced filters: fraud amount, city/police station, fraud type
- Real-time search results with map integration

#### 🧑‍💼 Accused Profile System
- Complete profile information including:
  - Full Name and Profile Photo support
  - Multiple Phone Numbers
  - Full Address with geocoding
  - Fraud Amount in Indian Rupees
  - Case ID and FIR details
  - Police Station information
  - Fraud type tags (e.g., "crypto scam", "loan fraud")

#### 🗺️ Location Mapping
- Interactive Leaflet maps with OpenStreetMap tiles
- Automatic geocoding using OpenCage API for Indian addresses
- Custom markers for accused locations
- Map zoom and bounds fitting for search results
- Detailed popups with accused information

#### 📋 Dashboard & Analytics
- Statistical overview with key metrics
- Total accused count and fraud amounts
- Top fraud types and city-wise statistics
- Visual charts and data representation

#### 🔄 Data Management
- Admin/SuperAdmin data entry forms
- CSV-ready data structure for bulk imports
- Sample Indian fraud case data seeding
- CRUD operations for accused records

#### 🔐 Role-Based Access Control
- **User**: Read-only access to search and view
- **Admin**: Can manage accused records
- **SuperAdmin**: Full system access including user management
- Seed superadmin account: username `admin`, password `admin123`

### API Endpoints Implemented

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user info

#### Accused Management  
- `GET /api/accused` - Get all accused records
- `GET /api/accused/{id}` - Get specific accused details
- `POST /api/accused` - Create new accused record
- `PUT /api/accused/{id}` - Update accused record
- `DELETE /api/accused/{id}` - Delete accused record

#### Search & Analytics
- `POST /api/search` - Search accused by various criteria
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/seed-data` - Seed sample data

### Sample Data Structure
The system includes sample Indian fraud cases with:
- Real Indian addresses (Delhi, Mumbai, Bangalore, Hyderabad, Noida)
- Indian phone number formats (+91-XXXXXXXXXX)
- Indian Rupee amounts (₹75,000 to ₹500,000)
- Realistic case IDs and police stations
- Common fraud types in India

### Frontend Components

#### Pages
- **Login**: Secure authentication with demo credentials
- **Dashboard**: Analytics and quick actions
- **Search**: Advanced search with map integration  
- **AccusedDetail**: Complete profile view with location
- **ManageAccused**: CRUD operations for accused records
- **ManageUsers**: User management (SuperAdmin only)

#### Components
- **MapComponent**: Interactive Leaflet map with accused markers
- **Navbar**: Role-based navigation
- **ProtectedRoute**: Route protection with role validation

### Configuration

#### Environment Variables
- **Backend**: OpenCage API key, MongoDB URL, JWT secrets
- **Frontend**: Backend API URL

#### OpenCage Integration
- API Key: f51c2c630d3f4666be24edb8f90edca4
- Geocoding for Indian addresses with countrycode='in'
- Lat/long conversion for address-to-coordinate mapping

## Getting Started

### Default Login Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: SuperAdmin (full access)

### First Time Setup
1. Login with default credentials
2. Navigate to Dashboard
3. Click "Seed Sample Data" to populate with Indian fraud cases
4. Explore search functionality and map visualization

## Testing Protocol

### Backend Testing Guidelines
- Test all API endpoints for CRUD operations
- Verify role-based access control
- Test OpenCage geocoding integration
- Validate search functionality across all fields

### Frontend Testing Guidelines  
- Test responsive design across devices
- Verify map integration and marker functionality
- Test search filters and real-time updates
- Validate role-based UI changes
- Test form submissions and data validation

### Integration Testing
- End-to-end user workflows
- Map marker click and popup functionality
- Search-to-detail navigation flows
- Authentication and authorization flows

## Future Enhancements Roadmap
- Bulk CSV import functionality
- Advanced map clustering for dense areas
- Export functionality for search results
- Email notifications for new cases
- Mobile app development
- Advanced analytics and reporting

---

## Testing Communication Protocol

When invoking testing agents, follow these guidelines:

### For Backend Testing (`deep_testing_backend_v2`)
- Always test API endpoints in logical order (auth → CRUD → search)
- Include role-based permission testing
- Test OpenCage geocoding with Indian addresses
- Verify data validation and error handling

### For Frontend Testing (`auto_frontend_testing_agent`)
- Test responsive design and user interactions
- Verify map functionality and marker interactions  
- Test search functionality with various inputs
- Validate role-based access and navigation

### Data Consistency
- Always use Indian addresses for geocoding tests
- Use proper Indian phone number formats
- Test with realistic fraud amounts in INR
- Verify proper date formatting and display

---

## Development Notes

### Completed Features ✅
- Complete role-based authentication system
- Interactive map with OpenCage geocoding
- Advanced search with multiple filters
- Comprehensive dashboard with analytics
- Full CRUD operations for accused management
- User management system
- Responsive design with Tailwind CSS
- Sample Indian fraud case data

### Technical Decisions Made
- Used Leaflet instead of Google Maps for cost efficiency
- OpenCage API for reliable Indian address geocoding
- UUID-based IDs instead of MongoDB ObjectIDs for JSON compatibility
- JWT-based authentication with role validation
- Supervisor-managed services for Kubernetes deployment

---

This project successfully implements all requested features with additional enhancements for a production-ready fraud case visualization system tailored for Indian law enforcement and investigative agencies.