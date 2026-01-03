@echo off
REM Warehouse Management System - Development Runner (Windows)
REM This script runs both the Django backend and React frontend

echo 🚀 Starting Warehouse Management System...

REM Check if ports are available (basic check)
echo Checking port availability...
netstat -an | find "8000" >nul 2>&1
if %errorlevel%==0 (
    echo Port 8000 is already in use. Please free it or change the port.
    pause
    exit /b 1
)

netstat -an | find "5173" >nul 2>&1
if %errorlevel%==0 (
    echo Port 5173 is already in use. Please free it or change the port.
    pause
    exit /b 1
)

REM Start Django backend
echo 📡 Starting Django backend on http://localhost:8000
start "Django Backend" cmd /k "cd backend && python manage.py runserver"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start React frontend
echo ⚛️  Starting React frontend on http://localhost:5173
start "React Frontend" cmd /k "cd warehouse-companion && npm run dev"

echo.
echo 🎉 Both services are starting!
echo 📡 Backend API: http://localhost:8000
echo ⚛️  Frontend App: http://localhost:5173
echo 📚 API Docs: http://localhost:8000/swagger/
echo.
echo Close the command windows to stop the services
echo.

pause
