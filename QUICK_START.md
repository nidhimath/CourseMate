# 🚀 Coursemate - Quick Start Guide

## 📋 Prerequisites
Make sure you have these installed:
- Node.js (✅ Already installed)
- Python 3.11+ (✅ Already installed) 
- PostgreSQL 15 (✅ Already installed)
- Homebrew (✅ Already installed)

## 🎯 Quick Start (Easiest Method)

### Option 1: Use the Startup Script
```bash
# Navigate to the project directory
cd /Users/nidhimathihalli/Documents/GitHub/CourseMate

# Start the entire application
./start-app.sh
```

### Option 2: Manual Commands
```bash
# Navigate to the project directory
cd /Users/nidhimathihalli/Documents/GitHub/CourseMate

# 1. Start PostgreSQL (if not already running)
brew services start postgresql@15

# 2. Start Flask Backend (in a new terminal)
cd flask-backend
source venv/bin/activate
python app.py

# 3. Start Next.js Frontend (in another new terminal)
cd nextjs-frontend
npm run dev
```

## 🌐 Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Sign in with Google OAuth**

## 🛑 Stop the Application

### Option 1: Use the Stop Script
```bash
./stop-app.sh
```

### Option 2: Manual Stop
```bash
# Press Ctrl+C in each terminal where the services are running
# Or kill the processes:
pkill -f "python app.py"
pkill -f "next dev"
```

## 🔧 Troubleshooting

### If PostgreSQL isn't running:
```bash
brew services start postgresql@15
```

### If you get port conflicts (OAuth errors):
```bash
# The startup script now automatically handles this, but if you need manual cleanup:
./cleanup-ports.sh

# Or manually check what's using the ports
lsof -i :3000
lsof -i :5001
```

### If OAuth redirect URI errors occur:
- Make sure the frontend is running on port 3000 (not 3001)
- The startup script now automatically kills processes on port 3000 to ensure it's free
- If you still get errors, run: `./cleanup-ports.sh` then `./start-app.sh`

### If you need to restart everything:
```bash
./stop-app.sh
sleep 2
./start-app.sh
```

## 📁 Project Structure
```
CourseMate/
├── start-app.sh          # Quick start script
├── stop-app.sh           # Quick stop script
├── nextjs-frontend/      # React/Next.js frontend
├── flask-backend/        # Python/Flask backend
└── .env files            # Environment configuration
```

## 🎉 You're Ready!
Once both services are running, open http://localhost:3000 in your browser and sign in with Google!
