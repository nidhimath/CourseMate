from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, Course, Lesson, Progress, Concept, Exercise, db
from datetime import datetime
import json

# Authentication Blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Handle Google OAuth authentication"""
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        image = data.get('image')
        google_id = data.get('google_id')
        
        if not email or not name:
            return jsonify({'error': 'Email and name are required'}), 400
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                name=name,
                image_url=image,
                google_id=google_id
            )
            db.session.add(user)
            db.session.commit()
        else:
            # Update existing user
            user.name = name
            user.image_url = image
            user.google_id = google_id
            user.updated_at = datetime.utcnow()
            db.session.commit()
        
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Courses Blueprint
courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    """Get all active courses"""
    try:
        courses = Course.query.filter_by(is_active=True).all()
        return jsonify([course.to_dict() for course in courses]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    """Get specific course with lessons"""
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        course_data = course.to_dict()
        course_data['lessons'] = [lesson.to_dict() for lesson in course.lessons if lesson.is_active]
        
        return jsonify(course_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<int:course_id>/lessons', methods=['GET'])
@jwt_required()
def get_course_lessons(course_id):
    """Get lessons for a specific course"""
    try:
        lessons = Lesson.query.filter_by(course_id=course_id, is_active=True).order_by(Lesson.week, Lesson.order).all()
        return jsonify([lesson.to_dict() for lesson in lessons]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Lessons Blueprint
lessons_bp = Blueprint('lessons', __name__)

@lessons_bp.route('/<int:lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson(lesson_id):
    """Get specific lesson with concepts and exercises"""
    try:
        lesson = Lesson.query.get(lesson_id)
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        return jsonify(lesson.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lessons_bp.route('/<int:lesson_id>/concepts', methods=['GET'])
@jwt_required()
def get_lesson_concepts(lesson_id):
    """Get concepts for a specific lesson"""
    try:
        concepts = Concept.query.filter_by(lesson_id=lesson_id).order_by(Concept.order).all()
        return jsonify([concept.to_dict() for concept in concepts]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lessons_bp.route('/<int:lesson_id>/exercises', methods=['GET'])
@jwt_required()
def get_lesson_exercises(lesson_id):
    """Get exercises for a specific lesson"""
    try:
        exercises = Exercise.query.filter_by(lesson_id=lesson_id).order_by(Exercise.order).all()
        return jsonify([exercise.to_dict() for exercise in exercises]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Progress Blueprint
progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_progress():
    """Get user's overall progress"""
    try:
        user_id = get_jwt_identity()
        progress_records = Progress.query.filter_by(user_id=user_id).all()
        
        # Calculate overall statistics
        total_lessons = Lesson.query.filter_by(is_active=True).count()
        completed_lessons = Progress.query.filter_by(user_id=user_id, completed=True).distinct(Progress.lesson_id).count()
        
        overall_progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        return jsonify({
            'overall_progress': round(overall_progress, 2),
            'completed_lessons': completed_lessons,
            'total_lessons': total_lessons,
            'progress_records': [record.to_dict() for record in progress_records]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/lesson/<int:lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson_progress(lesson_id):
    """Get progress for a specific lesson"""
    try:
        user_id = get_jwt_identity()
        progress_records = Progress.query.filter_by(user_id=user_id, lesson_id=lesson_id).all()
        
        return jsonify([record.to_dict() for record in progress_records]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/update', methods=['POST'])
@jwt_required()
def update_progress():
    """Update user progress"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        lesson_id = data.get('lesson_id')
        concept_id = data.get('concept_id')
        exercise_id = data.get('exercise_id')
        completed = data.get('completed', False)
        score = data.get('score')
        time_spent = data.get('time_spent')
        
        if not lesson_id:
            return jsonify({'error': 'Lesson ID is required'}), 400
        
        # Check if progress record exists
        progress = Progress.query.filter_by(
            user_id=user_id,
            lesson_id=lesson_id,
            concept_id=concept_id,
            exercise_id=exercise_id
        ).first()
        
        if not progress:
            # Create new progress record
            progress = Progress(
                user_id=user_id,
                lesson_id=lesson_id,
                concept_id=concept_id,
                exercise_id=exercise_id,
                completed=completed,
                score=score,
                time_spent=time_spent,
                completed_at=datetime.utcnow() if completed else None
            )
            db.session.add(progress)
        else:
            # Update existing progress record
            progress.completed = completed
            progress.score = score
            progress.time_spent = time_spent
            progress.updated_at = datetime.utcnow()
            if completed and not progress.completed_at:
                progress.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(progress.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
