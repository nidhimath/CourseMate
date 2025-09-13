#!/bin/bash

# Coursemate Application Stop Script
echo "🛑 Stopping Coursemate Application..."

# Kill any running Python processes (Flask backend)
pkill -f "python app.py" 2>/dev/null

# Kill any running Node processes (Next.js frontend)
pkill -f "next dev" 2>/dev/null

# Force kill any processes on ports 3000 and 5001
if lsof -i :3000 > /dev/null 2>&1; then
    echo "Killing processes on port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
fi

if lsof -i :5001 > /dev/null 2>&1; then
    echo "Killing processes on port 5001..."
    lsof -ti :5001 | xargs kill -9 2>/dev/null
fi

echo "✅ Application stopped"
