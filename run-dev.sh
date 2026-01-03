#!/bin/bash

# Warehouse Management System - Development Runner
# This script runs both the Django backend and React frontend

echo "🚀 Starting Warehouse Management System..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use. Please free it or change the port."
        return 1
    fi
    return 0
}

# Check if ports are available
echo "Checking port availability..."
check_port 8000 || exit 1
check_port 5173 || exit 1

# Start Django backend in background
echo "📡 Starting Django backend on http://localhost:8000"
cd backend && python manage.py runserver &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start React frontend in background
echo "⚛️  Starting React frontend on http://localhost:5173"
cd ../warehouse-companion && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Both services are running!"
echo "📡 Backend API: http://localhost:8000"
echo "⚛️  Frontend App: http://localhost:5173"
echo "📚 API Docs: http://localhost:8000/swagger/"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to kill both processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
