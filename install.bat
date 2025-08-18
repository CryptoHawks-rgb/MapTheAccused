@echo off
REM MapTheAccused Windows Installation Script
REM This script sets up the development environment for MapTheAccused on Windows

echo 🚀 MapTheAccused Windows Installation Script
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
) else (
    echo ✅ Python: Found
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✅ Node.js: Found
)

REM Check if Yarn is installed
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Yarn is not installed
    echo Installing Yarn...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Yarn
        pause
        exit /b 1
    )
) else (
    echo ✅ Yarn: Found
)

echo.
echo 🔧 Setting up Backend...

REM Backend setup
cd backend

REM Create virtual environment
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating backend .env file...
    copy .env.example .env
    echo ⚠️ Please edit backend\.env and add your OpenCage API key
) else (
    echo ✅ Backend .env file already exists
)

REM Create uploads directory
if not exist "uploads" mkdir uploads
echo ✅ Created uploads directory

cd ..

echo.
echo 🎨 Setting up Frontend...

REM Frontend setup
cd frontend

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
yarn install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating frontend .env file...
    copy .env.example .env
) else (
    echo ✅ Frontend .env file already exists
)

cd ..

echo.
echo 💾 Database Setup...
echo ⚠️ Please ensure MongoDB is installed and running
echo Download from: https://www.mongodb.com/try/download/community
echo Default connection: mongodb://localhost:27017

echo.
echo 🌱 Setting up Sample Data...

REM Seed database
cd scripts
echo 📊 Seeding database with sample data...
python seed_data.py
if %errorlevel% equ 0 (
    echo ✅ Database seeded successfully
) else (
    echo ⚠️ Database seeding failed. You can run it later with: cd scripts && python seed_data.py
)
cd ..

echo.
echo 🎉 Installation Complete!
echo =======================
echo.
echo 📝 Next Steps:
echo 1. Install and start MongoDB if not already done
echo 2. Add your OpenCage API key to backend\.env
echo    - Sign up at: https://opencagedata.com/
echo    - Free tier: 2,500 requests/day
echo.
echo 🚀 To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python server.py
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   yarn start
echo.
echo 🌐 Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8001
echo   API Docs: http://localhost:8001/docs
echo.
echo 🔑 Default Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo 📚 For more information, see README.md
echo.
echo Happy coding! 🎯
pause