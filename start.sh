#!/bin/bash

# Coursemate Startup Script

echo "🚀 Starting Coursemate..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from env.example..."
    cp env.example .env
    echo "📝 Please edit .env file with your actual values before running again."
    echo "   You need to set up Google OAuth credentials."
    exit 1
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up --build

echo "✅ Coursemate is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
