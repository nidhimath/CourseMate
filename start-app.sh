#!/bin/bash

# Coursemate Application Startup Script
echo "🚀 Starting Coursemate Application..."
echo "=================================="

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! brew services list | grep postgresql@15 | grep started > /dev/null; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 3
else
    echo "✅ PostgreSQL is already running"
fi

# Kill any existing processes on ports 3000 and 5001
echo ""
echo "🧹 Cleaning up existing processes..."
pkill -f "python app.py" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Check if ports are free
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is busy. Killing processes..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

if lsof -i :5001 > /dev/null 2>&1; then
    echo "⚠️  Port 5001 is busy. Killing processes..."
    lsof -ti :5001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start Flask Backend
echo ""
echo "🐍 Starting Flask Backend..."
cd flask-backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Next.js Frontend
echo ""
echo "⚛️  Starting Next.js Frontend..."
cd nextjs-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Application is starting up!"
echo "=================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
