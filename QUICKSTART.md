# Coursemate Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Docker and Docker Compose installed
- Google account for OAuth setup

### 2. Google OAuth Setup (2 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### 3. Environment Setup (1 minute)
```bash
# Clone and setup
git clone <repository-url>
cd CourseMate

# Copy environment template
cp env.example .env

# Edit .env with your Google OAuth credentials
nano .env
```

Update these values in `.env`:
```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEXTAUTH_SECRET=any-random-secret-string
```

### 4. Start the Application (2 minutes)
```bash
# Make scripts executable
chmod +x start.sh dev-setup.sh

# Start with Docker Compose
./start.sh
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## 🎯 What You'll See

1. **Sign In Page**: Click "Sign in with Google" using your UC Berkeley account
2. **Dashboard**: Overview of your courses and academic progress
3. **Knowledge Graph**: Interactive concept map showing CS 170 topics connected to CS 61B foundations
4. **Lesson View**: Click on any lesson to see concept-based learning with CS 61B analogies
5. **Progress Page**: Track your learning journey and achievements

## 🔧 Key Features to Try

### Text Highlighting
- In any lesson, highlight text to see contextual explanations
- Get CS 61B connections and additional resources

### Interactive Knowledge Graph
- Click on nodes to see detailed information
- Explore prerequisite relationships
- Start learning from the graph

### Progress Tracking
- Complete concepts and exercises
- See your progress across different topics
- Get personalized recommendations

## 🛠️ Development Mode

For development with hot reloading:

```bash
# Setup development environment
./dev-setup.sh

# Start backend (in one terminal)
cd flask-backend
source venv/bin/activate
python app.py

# Start frontend (in another terminal)
cd nextjs-frontend
npm run dev
```

## 🐛 Troubleshooting

### OAuth Issues
- Ensure redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check that Google OAuth credentials are correct
- Verify the domain is authorized in Google Console

### Database Issues
- Ensure PostgreSQL is running (Docker handles this automatically)
- Check database connection in backend logs

### Port Conflicts
- Frontend: Change port in `nextjs-frontend/package.json`
- Backend: Change port in `flask-backend/app.py`
- Database: Change port in `docker-compose.yml`

## 📚 Next Steps

1. **Customize Content**: Add your own courses and lessons in the database
2. **Extend Features**: Add more interactive elements or learning tools
3. **Deploy**: Use the Docker setup to deploy to your preferred platform
4. **Integrate**: Connect with real UC Berkeley course data

## 🆘 Need Help?

- Check the full README.md for detailed documentation
- Review the API endpoints in the backend routes
- Look at the component structure in the frontend
- Check Docker logs: `docker-compose logs [service-name]`

Happy learning! 🎓
