#!/bin/bash

# WMS Django Backend Setup Script

echo "🚀 Setting up WMS Django Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

echo "🗄️ Running database migrations..."
python3 manage.py makemigrations
python3 manage.py migrate

echo "👤 Creating superuser..."
echo "from accounts.models import User; User.objects.create_superuser('admin@wms.local', 'admin123', full_name='System Administrator')" | python3 manage.py shell

echo "📊 Loading initial data..."
python3 manage.py loaddata fixtures/initial_data.json 2>/dev/null || echo "⚠️  No initial data fixtures found (this is normal)"

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   cd backend"
echo "   python3 manage.py runserver"
echo ""
echo "📋 Default admin credentials:"
echo "   Email: admin@wms.local"
echo "   Password: admin123"
echo ""
echo "📖 API Documentation:"
echo "   Swagger: http://localhost:8000/swagger/"
echo "   ReDoc: http://localhost:8000/redoc/"
