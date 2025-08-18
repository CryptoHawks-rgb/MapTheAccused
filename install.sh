#!/bin/bash

# MapTheAccused Installation Script
# This script sets up the development environment for MapTheAccused

set -e  # Exit on any error

echo "🚀 MapTheAccused Installation Script"
echo "===================================="

# Check if running on supported OS
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Operating System: $OSTYPE (Supported)"
else
    echo "⚠️ Warning: This script is designed for Linux/macOS. Windows users should use WSL or follow manual installation."
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo ""
echo "🔍 Checking Prerequisites..."

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Yarn
if command_exists yarn; then
    YARN_VERSION=$(yarn --version)
    echo "✅ Yarn: $YARN_VERSION"
else
    echo "❌ Yarn is not installed. Please install Yarn package manager first."
    echo "   Run: npm install -g yarn"
    exit 1
fi

# Check MongoDB
if command_exists mongod; then
    echo "✅ MongoDB: Installed"
else
    echo "⚠️ MongoDB is not installed or not in PATH."
    echo "   Please install MongoDB Community Edition:"
    echo "   - macOS: brew tap mongodb/brew && brew install mongodb-community"
    echo "   - Ubuntu: Follow instructions at https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/"
fi

echo ""
echo "🔧 Setting up Backend..."

# Backend setup
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️ Please edit backend/.env and add your OpenCage API key"
else
    echo "✅ Backend .env file already exists"
fi

# Create uploads directory
mkdir -p uploads
echo "✅ Created uploads directory"

cd ..

echo ""
echo "🎨 Setting up Frontend..."

# Frontend setup
cd frontend

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
yarn install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
else
    echo "✅ Frontend .env file already exists"
fi

cd ..

echo ""
echo "💾 Setting up Database..."

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "🚀 Starting MongoDB..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew services start mongodb-community 2>/dev/null || echo "⚠️ Could not start MongoDB via brew. Please start manually."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start mongod 2>/dev/null || echo "⚠️ Could not start MongoDB via systemctl. Please start manually."
    fi
fi

# Test MongoDB connection
echo "🔌 Testing MongoDB connection..."
if command_exists mongosh; then
    if mongosh --eval "db.adminCommand('ping')" --quiet maptheaccused 2>/dev/null; then
        echo "✅ MongoDB connection successful"
    else
        echo "⚠️ Could not connect to MongoDB. Please ensure it's running on localhost:27017"
    fi
else
    echo "⚠️ mongosh not found. Using legacy mongo client..."
    if command_exists mongo; then
        if mongo --eval "db.adminCommand('ping')" --quiet maptheaccused 2>/dev/null; then
            echo "✅ MongoDB connection successful"
        else
            echo "⚠️ Could not connect to MongoDB. Please ensure it's running on localhost:27017"
        fi
    fi
fi

echo ""
echo "🌱 Setting up Sample Data..."

# Seed database
cd scripts
echo "📊 Seeding database with sample data..."
if python seed_data.py; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️ Database seeding failed. You can run it later with: cd scripts && python seed_data.py"
fi
cd ..

echo ""
echo "🎉 Installation Complete!"
echo "======================="
echo ""
echo "📝 Next Steps:"
echo "1. Add your OpenCage API key to backend/.env"
echo "   - Sign up at: https://opencagedata.com/"
echo "   - Free tier: 2,500 requests/day"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python server.py"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  yarn start"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8001"
echo "  API Docs: http://localhost:8001/docs"
echo ""
echo "🔑 Default Login Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "Happy coding! 🎯"