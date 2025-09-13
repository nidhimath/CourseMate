# Coursemate - Personalized Study Assistant

A personalized study assistant for UC Berkeley students that adapts the content of a current class (Class D) into the style of a past class the student has already succeeded in (Class A).

## 🚀 Features

### Core Functionality
- **Personalized Learning**: Adapts CS 170 content using successful CS 61B learning patterns
- **Interactive Knowledge Graph**: Visual representation of concept connections
- **Text Highlighting**: Click to get contextual explanations and CS 61B connections
- **Progress Tracking**: Gamified learning with achievements and progress bars
- **OAuth Authentication**: Secure Google sign-in integration

### Main Views
1. **Dashboard**: Overview of current classes, transcript, and focus class
2. **Knowledge Graph**: Interactive concept map with prerequisite connections
3. **Lesson View**: Concept-based learning with exercises and CS 61B analogies
4. **Progress Page**: Achievement tracking and personalized recommendations

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Radix UI
- **Backend**: Flask with SQLAlchemy, JWT authentication, and PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with comprehensive schema for users, courses, lessons, and progress

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose (recommended)
- Google OAuth credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CourseMate
```

### 2. Set Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 3. Environment Configuration
Copy the example environment files and configure them:

```bash
# Root directory
cp env.example .env

# Frontend
cp nextjs-frontend/env.example nextjs-frontend/.env.local

# Backend
cp flask-backend/env.example flask-backend/.env
```

Update the environment variables with your actual values:
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `NEXTAUTH_SECRET`: A random secret for NextAuth.js
- `SECRET_KEY`: A random secret for Flask
- `JWT_SECRET_KEY`: A random secret for JWT tokens

### 4. Development Setup

#### Option A: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: localhost:5432
```

#### Option B: Manual Setup

**Backend Setup:**
```bash
cd flask-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py  # Seed initial data
python app.py
```

**Frontend Setup:**
```bash
cd nextjs-frontend
npm install
npm run dev
```

### 5. Database Setup
The application uses PostgreSQL. With Docker Compose, the database is automatically set up. For manual setup:

```bash
# Create database
createdb coursemate

# Run migrations (if using Flask-Migrate)
cd flask-backend
flask db upgrade

# Seed initial data
python seed_data.py
```

## 📁 Project Structure

```
CourseMate/
├── nextjs-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 13+ app directory
│   │   ├── components/      # React components
│   │   └── lib/            # Utility functions and auth config
│   ├── package.json
│   └── Dockerfile
├── flask-backend/           # Flask backend application
│   ├── models.py           # Database models
│   ├── routes.py           # API routes
│   ├── app.py             # Flask application
│   ├── seed_data.py       # Database seeding
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml      # Docker Compose configuration
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user information

### Courses
- `GET /api/courses/` - Get all active courses
- `GET /api/courses/{id}` - Get specific course with lessons
- `GET /api/courses/{id}/lessons` - Get lessons for a course

### Lessons
- `GET /api/lessons/{id}` - Get specific lesson with concepts and exercises
- `GET /api/lessons/{id}/concepts` - Get concepts for a lesson
- `GET /api/lessons/{id}/exercises` - Get exercises for a lesson

### Progress
- `GET /api/progress/` - Get user's overall progress
- `GET /api/progress/lesson/{id}` - Get progress for a specific lesson
- `POST /api/progress/update` - Update user progress

## 🎯 Key Features Implementation

### Text Highlighting with Context
The lesson view includes interactive text highlighting that shows contextual explanations and CS 61B connections when users select text.

### Knowledge Graph
An interactive SVG-based graph showing concept relationships, prerequisites, and learning paths.

### Progress Tracking
Comprehensive progress tracking with achievements, weekly progress, and personalized recommendations.

### OAuth Integration
Secure authentication using NextAuth.js with Google OAuth, syncing user data with the Flask backend.

## 🚀 Deployment

### Production Environment Variables
Ensure all environment variables are properly set for production:
- Use strong, unique secrets
- Set proper CORS origins
- Configure production database URL
- Set up proper domain for OAuth redirects

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **OAuth Redirect URI Mismatch**
   - Ensure your Google OAuth redirect URI matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in environment variables
   - Ensure database exists

3. **CORS Issues**
   - Verify `FRONTEND_URL` is set correctly in backend environment
   - Check that frontend and backend are running on expected ports

4. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all environment variables are set

### Getting Help
- Check the logs: `docker-compose logs [service-name]`
- Verify environment variables are loaded correctly
- Ensure all services are running and accessible

## 🎓 Educational Philosophy

Coursemate is built on the principle that students learn best when new concepts are connected to their existing knowledge. By leveraging successful learning patterns from past courses (like CS 61B), we create personalized learning experiences that build confidence and understanding.

The system emphasizes:
- **Connection-based learning**: Linking new concepts to familiar ones
- **Progressive disclosure**: Breaking complex topics into manageable concepts
- **Interactive engagement**: Hands-on exercises and visual learning
- **Personalized pacing**: Adaptive content based on individual progress