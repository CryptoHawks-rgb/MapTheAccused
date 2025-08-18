#!/bin/bash

# MapTheAccused Development Startup Script
# This script starts both frontend and backend servers for development

set -e

echo "🚀 Starting MapTheAccused Development Environment"
echo "==============================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "❌ Virtual environment not found. Please run ./install.sh first"
        exit 1
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "❌ Backend .env file not found. Please run ./install.sh first"
        exit 1
    fi
    
    # Start backend server in background
    python server.py &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID) at http://localhost:8001"
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "❌ Node modules not found. Please run ./install.sh first"
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "❌ Frontend .env file not found. Please run ./install.sh first"
        exit 1
    fi
    
    # Start frontend server in background
    yarn start &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID) at http://localhost:3000"
    
    cd ..
}

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "✅ Frontend server stopped"
    fi
    echo "👋 Development environment stopped"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Check if ports are already in use
if check_port 8001; then
    echo "⚠️ Port 8001 is already in use (Backend port)"
    echo "Please stop any existing backend servers or change the port"
    exit 1
fi

if check_port 3000; then
    echo "⚠️ Port 3000 is already in use (Frontend port)"
    echo "Please stop any existing frontend servers or change the port"
    exit 1
fi

# Check MongoDB connection
echo "🔌 Checking MongoDB connection..."
if command -v mongosh >/dev/null 2>&1; then
    if mongosh --eval "db.adminCommand('ping')" --quiet maptheaccused 2>/dev/null; then
        echo "✅ MongoDB connection successful"
    else
        echo "❌ Could not connect to MongoDB"
        echo "Please ensure MongoDB is running on localhost:27017"
        echo "Start MongoDB with:"
        echo "  macOS: brew services start mongodb-community"
        echo "  Linux: sudo systemctl start mongod"
        exit 1
    fi
elif command -v mongo >/dev/null 2>&1; then
    if mongo --eval "db.adminCommand('ping')" --quiet maptheaccused 2>/dev/null; then
        echo "✅ MongoDB connection successful"
    else
        echo "❌ Could not connect to MongoDB"
        echo "Please ensure MongoDB is running on localhost:27017"
        exit 1
    fi
else
    echo "⚠️ MongoDB client not found. Assuming MongoDB is running..."
fi

echo ""
echo "🚀 Starting servers..."

# Start backend
start_backend

# Wait a moment for backend to start
sleep 3

# Start frontend  
start_frontend

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 Development environment is ready!"
echo "=================================="
echo ""
echo "🌐 Application URLs:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8001" 
echo "  API Docs:  http://localhost:8001/docs"
echo ""
echo "🔑 Login Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "📝 Logs:"
echo "  Backend logs will appear here"
echo "  Frontend logs will appear in a new browser tab"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Keep script running and show backend logs
cd backend
source venv/bin/activate
# Follow backend logs (this will keep the script running)
tail -f /dev/null & wait