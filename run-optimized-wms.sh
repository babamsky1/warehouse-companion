#!/bin/bash

# Optimized WMS Startup Script
# This script starts both frontend and backend with all performance optimizations

echo "🚀 Starting Optimized WMS (Warehouse Management System)"
echo "=================================================="
echo ""

# Check if we're in the project root
if [ ! -d "warehouse-companion" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is already in use"
        return 1
    fi
    return 0
}

# Check ports
echo "📋 Checking port availability..."
if ! check_port 5173; then
    echo "   Frontend port 5173 is busy - trying 5174..."
    FRONTEND_PORT=5174
else
    FRONTEND_PORT=5173
fi

if ! check_port 8000; then
    echo "   Backend port 8000 is busy - trying 8001..."
    BACKEND_PORT=8001
else
    BACKEND_PORT=8000
fi

echo "✅ Frontend will use port: $FRONTEND_PORT"
echo "✅ Backend will use port: $BACKEND_PORT"
echo ""

# Start backend in background
echo "🐍 Starting Django backend with mock data..."
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "   Activating virtual environment..."
    source venv/bin/activate
fi

# Run Django server
python manage.py runserver 0.0.0.0:$BACKEND_PORT &
BACKEND_PID=$!
cd ..

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   📊 Mock data: 1000 users, 2000 products pre-generated"
echo "   ⚡ API endpoints cached with 5-minute timeout"
echo "   🔗 API docs: http://localhost:$BACKEND_PORT/swagger/"
echo ""

# Wait a moment for backend to initialize
sleep 3

# Start frontend
echo "⚛️  Starting React frontend with Vite..."
cd warehouse-companion

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Start Vite dev server
npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   🚀 Hot reload enabled"
echo "   📱 Virtual tables for large datasets"
echo "   🔍 Debounced search (300ms)"
echo "   ⚡ React Query caching optimized"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test endpoints
echo "🧪 Testing API endpoints..."
curl -s http://localhost:$BACKEND_PORT/api/mock/health/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API not responding"
fi

echo ""
echo "🎉 WMS is now running!"
echo "=========================="
echo ""
echo "📱 Frontend (React + TypeScript):"
echo "   🌐 http://localhost:$FRONTEND_PORT"
echo "   📊 Dashboard with real-time stats"
echo "   👥 Users page with virtual table"
echo "   📦 Products page with search"
echo "   ⚙️  Settings page"
echo ""
echo "🐍 Backend (Django + Mock Data):"
echo "   🌐 http://localhost:$BACKEND_PORT"
echo "   📖 API Documentation: http://localhost:$BACKEND_PORT/swagger/"
echo "   📊 Mock data endpoints:"
echo "      - /api/mock/users/ (1000 users)"
echo "      - /api/mock/products/ (2000 products)"
echo "      - /api/mock/dashboard/"
echo "      - /api/mock/settings/"
echo ""
echo "🛠️  Development Tools:"
echo "   🔍 React Query DevTools (F12 → React Query)"
echo "   📈 Performance monitoring enabled"
echo "   🗄️  Cache invalidation: POST /api/mock/cache/invalidate/"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📚 Documentation:"
echo "   📖 Performance Guide: ./PERFORMANCE_OPTIMIZATION_GUIDE.md"
echo "   🔧 React Query Usage: ./REACT_QUERY_USAGE_GUIDE.md"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

echo "Press Ctrl+C to stop all services"
wait
