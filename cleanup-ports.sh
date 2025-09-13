#!/bin/bash

# Port Cleanup Script for Coursemate
echo "🧹 Cleaning up ports 3000 and 5001..."

# Kill processes on port 3000
if lsof -i :3000 > /dev/null 2>&1; then
    echo "Killing processes on port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    echo "✅ Port 3000 cleared"
else
    echo "✅ Port 3000 is already free"
fi

# Kill processes on port 5001
if lsof -i :5001 > /dev/null 2>&1; then
    echo "Killing processes on port 5001..."
    lsof -ti :5001 | xargs kill -9 2>/dev/null
    echo "✅ Port 5001 cleared"
else
    echo "✅ Port 5001 is already free"
fi

echo ""
echo "🎉 Port cleanup complete!"
echo "You can now run ./start-app.sh"
