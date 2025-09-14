from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///coursemate.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
from models import db
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)

# Import models and routes
from models import User, Course, Lesson, Progress, Concept, Exercise
from routes import auth_bp, courses_bp, lessons_bp, progress_bp, transcript_bp, lesson_progress_bp, homework_bp, week_videos_bp
from classify_topic import classify_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(courses_bp, url_prefix='/api/courses')
app.register_blueprint(lessons_bp, url_prefix='/api/lessons')
app.register_blueprint(progress_bp, url_prefix='/api/progress')
app.register_blueprint(transcript_bp, url_prefix='/api/transcript')
app.register_blueprint(lesson_progress_bp, url_prefix='/api/courses')
app.register_blueprint(homework_bp, url_prefix='/api/courses')
app.register_blueprint(week_videos_bp, url_prefix='/api/week-videos')
app.register_blueprint(classify_bp, url_prefix='/api/classify')

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/')
def index():
    return jsonify({
        'message': 'Coursemate API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'courses': '/api/courses',
            'lessons': '/api/lessons',
            'progress': '/api/progress'
        }
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Production vs Development
    if os.environ.get('FLASK_ENV') == 'production':
        port = int(os.environ.get('PORT', 5001))
        app.run(host='0.0.0.0', port=port)
    else:
        app.run(debug=True, host='0.0.0.0', port=5001)
