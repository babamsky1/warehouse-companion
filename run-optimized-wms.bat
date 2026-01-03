@echo off
REM Optimized WMS Startup Script for Windows
REM This script starts both frontend and backend with all performance optimizations

echo 🚀 Starting Optimized WMS (Warehouse Management System)
echo ==================================================
echo.

REM Check if we're in the project root
if not exist "warehouse-companion" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Set default ports
set FRONTEND_PORT=5173
set BACKEND_PORT=8000

REM Check if ports are available (simplified check)
echo 📋 Checking port availability...
netstat -an | find ":%FRONTEND_PORT% " >nul
if %errorlevel% equ 0 (
    echo    Frontend port %FRONTEND_PORT% is busy - trying 5174...
    set FRONTEND_PORT=5174
)

netstat -an | find ":%BACKEND_PORT% " >nul
if %errorlevel% equ 0 (
    echo    Backend port %BACKEND_PORT% is busy - trying 8001...
    set BACKEND_PORT=8001
)

echo ✅ Frontend will use port: %FRONTEND_PORT%
echo ✅ Backend will use port: %BACKEND_PORT%
echo.

REM Start backend
echo 🐍 Starting Django backend with mock data...
cd backend

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo    Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Run Django server in background
start "Django Backend" cmd /c "python manage.py runserver 0.0.0.0:%BACKEND_PORT% && pause"
cd ..

echo ✅ Backend started
echo    📊 Mock data: 1000 users, 2000 products pre-generated
echo    ⚡ API endpoints cached with 5-minute timeout
echo    🔗 API docs: http://localhost:%BACKEND_PORT%/swagger/
echo.

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo ⚛️  Starting React frontend with Vite...
cd warehouse-companion

REM Install dependencies if needed
if not exist "node_modules" (
    echo    Installing dependencies...
    call npm install
)

REM Start Vite dev server in background
start "React Frontend" cmd /c "npm run dev -- --port %FRONTEND_PORT% && pause"
cd ..

echo ✅ Frontend started
echo    🚀 Hot reload enabled
echo    📱 Virtual tables for large datasets
echo    🔍 Debounced search (300ms)
echo    ⚡ React Query caching optimized
echo.

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak >nul

REM Test backend
echo 🧪 Testing backend connectivity...
powershell -Command "& {try { $response = Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/api/mock/health/' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend API is responding' } else { Write-Host '❌ Backend API not responding correctly' } } catch { Write-Host '❌ Backend API not responding' }}"

echo.
echo 🎉 WMS is now running!
echo ==========================
echo.
echo 📱 Frontend (React + TypeScript):
echo    🌐 http://localhost:%FRONTEND_PORT%
echo    📊 Dashboard with real-time stats
echo    👥 Users page with virtual table
echo    📦 Products page with search
echo    ⚙️  Settings page
echo.
echo 🐍 Backend (Django + Mock Data):
echo    🌐 http://localhost:%BACKEND_PORT%
echo    📖 API Documentation: http://localhost:%BACKEND_PORT%/swagger/
echo    📊 Mock data endpoints:
echo       - /api/mock/users/ (1000 users)
echo       - /api/mock/products/ (2000 products)
echo       - /api/mock/dashboard/
echo       - /api/mock/settings/
echo.
echo 🛠️  Development Tools:
echo    🔍 React Query DevTools (F12 → React Query)
echo    📈 Performance monitoring enabled
echo    🗄️  Cache invalidation: POST /api/mock/cache/invalidate/
echo.
echo 📚 Documentation:
echo    📖 Performance Guide: .\PERFORMANCE_OPTIMIZATION_GUIDE.md
echo    🔧 React Query Usage: .\REACT_QUERY_USAGE_GUIDE.md
echo.
echo 🛑 Close the command windows to stop services
echo.

pause
