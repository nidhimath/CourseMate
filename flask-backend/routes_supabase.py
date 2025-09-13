# /Users/nidhimathihalli/Documents/GitHub/CourseMate/flask-backend/routes_supabase.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models_supabase import User, UserCourse
import json
import tempfile
import pdfplumber
from transcript_parser import TranscriptParser

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
transcript_bp = Blueprint('transcript', __name__, url_prefix='/api/transcript')

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Handle Google OAuth authentication"""
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        image_url = data.get('image')
        google_id = data.get('google_id')
        
        if not all([email, name, google_id]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user exists
        user = User.get_by_email(email)
        
        if not user:
            # Create new user
            user = User.create_user(email, name, image_url, google_id)
        
        # Create JWT token
        access_token = create_access_token(identity=str(user['id']))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'image_url': user['image_url']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_transcript():
    """Upload and parse transcript PDF"""
    try:
        user_id = int(get_jwt_identity())
        
        if 'transcript_pdf' not in request.files:
            return jsonify({'error': 'No PDF file provided'}), 400
        
        file = request.files['transcript_pdf']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            file.save(tmp_file.name)
            
            try:
                # Extract text from PDF
                with pdfplumber.open(tmp_file.name) as pdf:
                    text = ""
                    for page in pdf.pages:
                        text += page.extract_text() or ""
                
                # Parse transcript
                parser = TranscriptParser()
                parsed_data = parser.parse_transcript(text)
                
                # Update user with transcript data
                transcript_json = json.dumps(parsed_data)
                User.update_transcript_data(user_id, transcript_json)
                
                # Store user courses
                for course in parsed_data['completed_courses']:
                    UserCourse.create_user_course(user_id, course, 'completed')
                
                for course in parsed_data['current_courses']:
                    UserCourse.create_user_course(user_id, course, 'current')
                
                return jsonify({
                    'message': 'Transcript uploaded and parsed successfully',
                    'parsed_data': parsed_data
                }), 200
                
            finally:
                # Clean up temporary file
                import os
                os.unlink(tmp_file.name)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/curriculum', methods=['GET'])
@jwt_required()
def get_curriculum():
    """Get user's curriculum data"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get user data
        user = User.get_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user courses
        completed_courses = UserCourse.get_user_courses(user_id, 'completed')
        current_courses = UserCourse.get_user_courses(user_id, 'current')
        
        curriculum_data = {
            'user_id': user_id,
            'transcript_uploaded': user['transcript_uploaded'],
            'curriculum_generated': user['curriculum_generated'],
            'completed_courses': [course['course_code'] for course in completed_courses],
            'current_courses': [course['course_code'] for course in current_courses],
            'transcript_data': json.loads(user['transcript_data']) if user['transcript_data'] else None
        }
        
        return jsonify(curriculum_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get course recommendations"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get user's completed courses
        completed_courses = UserCourse.get_user_courses(user_id, 'completed')
        completed_course_codes = [course['course_code'] for course in completed_courses]
        
        # Generate recommendations based on completed courses
        from course_data import get_available_courses, get_missing_prerequisites
        
        available_courses = get_available_courses(completed_course_codes)
        missing_prereqs = get_missing_prerequisites(completed_course_codes)
        
        recommendations = {
            'available_courses': available_courses,
            'missing_prerequisites': missing_prereqs,
            'next_steps': available_courses[:5]  # Top 5 recommendations
        }
        
        return jsonify(recommendations), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500