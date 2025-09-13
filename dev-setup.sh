#!/bin/bash

# Coursemate Development Setup Script

echo "🚀 Setting up Coursemate for development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your Google OAuth credentials before continuing."
    echo "   You need to:"
    echo "   1. Go to Google Cloud Console"
    echo "   2. Create OAuth 2.0 credentials"
    echo "   3. Add redirect URI: http://localhost:3000/api/auth/callback/google"
    echo "   4. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Copy environment files to subdirectories
echo "📋 Setting up environment files..."
cp .env nextjs-frontend/.env.local
cp .env flask-backend/.env

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd nextjs-frontend
npm install
cd ..

# Install backend dependencies
echo "🐍 Setting up Python virtual environment..."
cd flask-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ Development setup complete!"
echo ""
echo "To start the application:"
echo "1. Run: ./start.sh (for Docker)"
echo "2. Or manually:"
echo "   - Backend: cd flask-backend && source venv/bin/activate && python app.py"
echo "   - Frontend: cd nextjs-frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
