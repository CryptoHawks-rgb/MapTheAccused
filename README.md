# MapTheAccused - Fraud Case Visualization System

A comprehensive web application designed to visualize accused individuals involved in fraud or cybercrime cases. The system provides search functionality by phone number, name, or address, and displays their locations on interactive maps with photo upload capabilities.

![MapTheAccused Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20MongoDB-orange)

## 🚀 Features

### Core Functionality
- **🔍 Advanced Search**: Multi-field search by phone number, name, address, case ID
- **🗺️ Interactive Maps**: Leaflet maps with OpenStreetMap integration
- **📸 Photo Upload**: Optional profile photo upload for accused individuals
- **👤 Role-Based Access**: User, Admin, and SuperAdmin roles
- **📊 Analytics Dashboard**: Comprehensive statistics and visualizations
- **🌍 Geocoding**: Automatic location detection using OpenCage API
- **📱 Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Photo Management
- **Upload Support**: JPEG, PNG, WebP formats (max 5MB)
- **Secure Storage**: File validation and secure upload handling  
- **Preview System**: Real-time photo preview in forms
- **Integration**: Photos displayed below map coordinates in accused details
- **Auto-Cleanup**: Automatic photo deletion when records are updated/deleted

### Data Management
- **CRUD Operations**: Complete accused record management
- **Batch Import**: CSV-ready data structure for bulk imports
- **Sample Data**: Comprehensive Indian fraud case examples
- **Data Validation**: Robust validation for all inputs
- **Audit Trail**: Created/updated by tracking with timestamps

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router, Leaflet Maps
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB 
- **Authentication**: JWT with role-based access control
- **File Storage**: Local file system with static serving
- **Geocoding**: OpenCage Data API
- **Deployment**: Kubernetes with Supervisor

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Yarn** package manager
- **Python** (3.9 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/maptheaccused.git
cd maptheaccused
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux  
source venv/bin/activate

pip install -r requirements.txt
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
MONGO_URL=mongodb://localhost:27017/maptheaccused

# Security
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenCage API (for geocoding)
OPENCAGE_API_KEY=your-opencage-api-key-here
```

#### Get OpenCage API Key

1. Sign up at [OpenCage Data](https://opencagedata.com/)
2. Get your free API key (2,500 requests/day)
3. Add it to your `.env` file

### 3. Frontend Setup

```bash
cd ../frontend
yarn install
```

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit the frontend `.env` file:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
GENERATE_SOURCEMAP=false
```

### 4. Database Setup

#### Install and Start MongoDB

**On macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**On Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**On Windows:**
- Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Follow the installation wizard
- Start MongoDB service

#### Verify MongoDB Connection

```bash
mongosh
# Should connect successfully to MongoDB shell
```

### 5. Seed Sample Data (Optional)

Run the seeding script to populate the database with sample data:

```bash
cd scripts
python seed_data.py
```

This will create:
- 4 admin users with different roles
- 10 sample Indian fraud case records
- Geocoded location data

## 🚀 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python server.py
```

The backend will be available at: `http://localhost:8001`

#### Start Frontend Development Server

```bash
cd frontend  
yarn start
```

The frontend will be available at: `http://localhost:3000`

### Production Mode

#### Build Frontend

```bash
cd frontend
yarn build
```

#### Run Production Server

```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

Serve the built frontend using a web server like Nginx or serve the `build` folder.

## 🔑 Default Login Credentials

After running the seeding script, you can use these credentials:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| SuperAdmin | `admin` | `admin123` | Full system access |
| Inspector | `inspector_singh` | `police123` | Manage accused records |
| Cyber Admin | `cyber_admin` | `cyber123` | Manage accused records |
| Data Analyst | `data_analyst` | `analyst123` | Read-only access |

## 📱 Usage

### 1. Login
- Navigate to `http://localhost:3000`
- Use the credentials above to login

### 2. Dashboard
- View system statistics and analytics
- Quick access to key functions
- Overview of fraud cases and amounts

### 3. Search Accused
- Use the search page to find accused individuals
- Search by name, phone, address, or case ID
- View results on interactive map
- Click markers for detailed information

### 4. Manage Accused Records (Admin/SuperAdmin)
- Add new accused individuals with photos
- Upload profile photos (JPEG, PNG, WebP, max 5MB)
- Update existing records
- Delete records (SuperAdmin only)
- Automatic geocoding for addresses

### 5. View Accused Details  
- Complete profile information
- Interactive map with location
- Profile photo displayed below map coordinates
- Case details and fraud information

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # Register user (SuperAdmin only)  
GET  /api/auth/me            # Current user info
```

### Accused Management
```
GET    /api/accused          # Get all accused
GET    /api/accused/{id}     # Get accused by ID
POST   /api/accused          # Create new accused (Admin+)
PUT    /api/accused/{id}     # Update accused (Admin+)
DELETE /api/accused/{id}     # Delete accused (SuperAdmin only)
```

### Photo Upload
```
POST   /api/upload-photo     # Upload photo (Admin+)
DELETE /api/delete-photo/{filename}  # Delete photo (Admin+)
GET    /api/uploads/{filename}       # Serve uploaded photo
```

### Search & Analytics
```
POST /api/search             # Search accused
GET  /api/dashboard/stats    # Dashboard statistics
POST /api/seed-data         # Seed sample data (SuperAdmin only)
```

### User Management
```
GET    /api/users           # Get all users (SuperAdmin only)
DELETE /api/users/{id}      # Delete user (SuperAdmin only)
```

## 📁 Project Structure

```
maptheaccused/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── uploads/           # Uploaded photos directory
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   └── contexts/     # React contexts
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── .env             # Frontend environment
├── scripts/              # Utility scripts
│   └── seed_data.py     # Database seeding script
├── tests/               # Test files
└── README.md           # This file
```

## 🎨 Customization

### Adding New Fraud Types
Edit the accused creation form to include new fraud type tags:

```javascript
// In frontend/src/pages/ManageAccused.js
const fraudTypes = [
  'loan fraud', 'crypto scam', 'investment fraud',
  'bank fraud', 'identity theft', 'your-new-type'
];
```

### Modifying Search Fields
Update the search functionality in the backend:

```python
# In backend/server.py - search_accused function
search_fields = [
    "full_name", "address", "phone_numbers", 
    "case_id", "tags", "your_new_field"
]
```

### Changing Map Providers
Replace Leaflet with Google Maps:

```javascript  
# Install: yarn add @google/maps
# Update frontend/src/components/MapComponent.js
```

## 🔒 Security Considerations

### Production Deployment
- [ ] Change default JWT secret key
- [ ] Use environment variables for all sensitive data  
- [ ] Enable HTTPS/TLS encryption
- [ ] Set up proper CORS policies
- [ ] Configure file upload size limits
- [ ] Implement rate limiting
- [ ] Set up proper backup procedures
- [ ] Configure MongoDB authentication
- [ ] Use a reverse proxy (Nginx/Apache)

### Photo Upload Security
- File type validation (whitelist approach)
- File size limits (5MB default)
- Secure file naming (UUID-based)
- No execution of uploaded files
- Proper content-type validation

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Run Frontend Tests
```bash
cd frontend
yarn test
```

### Manual Testing Checklist
- [ ] User authentication (all roles)
- [ ] Accused CRUD operations
- [ ] Photo upload/delete functionality  
- [ ] Search functionality (all types)
- [ ] Map integration and markers
- [ ] Dashboard statistics
- [ ] Responsive design (mobile/desktop)

## 🚀 Deployment Options

### Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Kubernetes Deployment
- Use provided Kubernetes manifests
- Configure ingress for routing
- Set up persistent volumes for photo storage
- Configure environment-specific config maps

### Cloud Deployment Options
- **AWS**: EC2 + RDS + S3
- **Google Cloud**: Compute Engine + Cloud SQL + Cloud Storage  
- **Azure**: Virtual Machines + Cosmos DB + Blob Storage
- **Heroku**: Web dynos + MongoDB Atlas + Cloudinary

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Python PEP 8 style guidelines
- Use ESLint and Prettier for JavaScript code
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python virtual environment
source venv/bin/activate
pip install -r requirements.txt

# Check MongoDB connection
mongosh mongodb://localhost:27017/maptheaccused
```

**Frontend build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
yarn install
yarn start
```

**Photos won't upload:**
- Check file size (max 5MB)
- Verify file format (JPEG, PNG, WebP only)
- Ensure backend uploads directory exists and is writable
- Check network connectivity and CORS settings

**Maps not loading:**
- Verify internet connection
- Check browser console for JavaScript errors
- Ensure Leaflet CSS is properly loaded

**Geocoding not working:**
- Verify OpenCage API key in `.env` file
- Check API quota limits
- Ensure internet connectivity

### Getting Help
- Check the [Issues](https://github.com/your-username/maptheaccused/issues) page
- Create a new issue with detailed error information
- Include system information and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenCage Data](https://opencagedata.com/) for geocoding services
- [Leaflet](https://leafletjs.com/) for interactive maps
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📊 Project Status

- ✅ **Backend API**: Complete with photo upload
- ✅ **Frontend UI**: Responsive design with photo management
- ✅ **Database**: MongoDB with comprehensive schema
- ✅ **Authentication**: JWT with role-based access
- ✅ **Maps Integration**: Leaflet with OpenCage geocoding
- ✅ **Photo Upload**: Secure file handling with validation
- ✅ **Sample Data**: Indian fraud cases with seeding script
- ✅ **Documentation**: Complete setup and usage guide

---

## 📞 Support

For support and questions:
- 📧 Email: support@maptheaccused.com
- 💬 Create an issue on GitHub
- 📖 Check the documentation

**Made with ❤️ for law enforcement and investigative agencies**