@echo off
REM WMS Django Backend Setup Script for Windows

echo 🚀 Setting up WMS Django Backend...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
pip install -r requirements.txt

echo 🗄️ Running database migrations...
python manage.py makemigrations
python manage.py migrate

echo 👤 Creating superuser...
echo from accounts.models import User; User.objects.create_superuser('admin@wms.local', 'admin123', full_name='System Administrator') | python manage.py shell

echo 📊 Loading initial data...
python manage.py loaddata fixtures/initial_data.json 2>nul || echo ⚠️  No initial data fixtures found (this is normal)

echo ✅ Setup complete!
echo.
echo 🚀 To start the development server:
echo    cd backend
echo    python manage.py runserver
echo.
echo 📋 Default admin credentials:
echo    Email: admin@wms.local
echo    Password: admin123
echo.
echo 📖 API Documentation:
echo    Swagger: http://localhost:8000/swagger/
echo    ReDoc: http://localhost:8000/redoc/

pause
