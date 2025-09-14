from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, Course, Lesson, Progress, Concept, Exercise, UserCourse, LessonProgress, HomeworkAssignment, WeekVideo, db
from transcript_parser import TranscriptParser
from course_data import get_course_info, get_available_courses, get_missing_prerequisites
from homework_utils import process_homework_pdf
from week_video_processor import WeekVideoProcessor
from datetime import datetime
import json
import os
import tempfile
import pdfplumber

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
        access_token = create_access_token(identity=str(user.id))
        
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

# Transcript and Curriculum Blueprint
transcript_bp = Blueprint('transcript', __name__)

@transcript_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_transcript():
    """Upload and parse transcript PDF"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file was uploaded
        if 'transcript_pdf' not in request.files:
            return jsonify({'error': 'No PDF file uploaded'}), 400
        
        file = request.files['transcript_pdf']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Extract text from PDF
            transcript_text = ""
            with pdfplumber.open(temp_file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        transcript_text += page_text + "\n"
            
            if not transcript_text.strip():
                return jsonify({'error': 'Could not extract text from PDF. Please ensure the PDF contains readable text.'}), 400
            
            # Parse the transcript
            parser = TranscriptParser()
            parsed_data = parser.parse_transcript(transcript_text)
            
            # Update user with transcript data
            user.transcript_uploaded = True
            user.transcript_data = json.dumps(parsed_data)
            user.updated_at = datetime.utcnow()
            
            # Clear existing user courses
            UserCourse.query.filter_by(user_id=user_id).delete()
            
            # Add completed courses
            for course_data in parsed_data['completed_courses']:
                if isinstance(course_data, dict):
                    # New format with grade information
                    course_code = course_data['course_code']
                    grade = course_data.get('grade', 'N/A')
                else:
                    # Legacy format (string)
                    course_code = course_data
                    grade = 'N/A'
                
                user_course = UserCourse(
                    user_id=user_id,
                    course_code=course_code,
                    status='completed',
                    grade=grade
                )
                db.session.add(user_course)
            
            # Add current courses
            for course_code in parsed_data['current_courses']:
                user_course = UserCourse(
                    user_id=user_id,
                    course_code=course_code,
                    status='current'
                )
                db.session.add(user_course)
            
            db.session.commit()
            
            return jsonify({
                'message': 'Transcript uploaded and parsed successfully',
                'parsed_data': parsed_data
            }), 200
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
    except Exception as e:
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

@transcript_bp.route('/existing', methods=['GET'])
@jwt_required()
def get_existing_transcript():
    """Get existing transcript data for the user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.transcript_uploaded or not user.transcript_data:
            return jsonify({'error': 'No transcript data found'}), 404
        
        # Parse the stored transcript data
        parsed_data = json.loads(user.transcript_data)
        
        return jsonify({
            'transcript_uploaded': user.transcript_uploaded,
            'parsed_data': parsed_data,
            'uploaded_at': user.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/clear', methods=['POST'])
@jwt_required()
def clear_transcript():
    """Clear existing transcript data for the user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Clear transcript data
        user.transcript_uploaded = False
        user.transcript_data = None
        user.curriculum_generated = False
        user.updated_at = datetime.utcnow()
        
        # Clear existing user courses
        UserCourse.query.filter_by(user_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({'message': 'Transcript data cleared successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/curriculum', methods=['GET'])
@jwt_required()
def get_curriculum():
    """Get personalized curriculum based on transcript"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.transcript_uploaded:
            return jsonify({'error': 'No transcript uploaded'}), 400
        
        # Parse transcript data
        transcript_data = json.loads(user.transcript_data)
        completed_courses = transcript_data['completed_courses']
        current_courses = transcript_data['current_courses']
        
        # Generate curriculum plan
        parser = TranscriptParser()
        curriculum_plan = parser.generate_curriculum_plan(completed_courses, current_courses)
        
        # Mark curriculum as generated
        user.curriculum_generated = True
        db.session.commit()
        
        return jsonify(curriculum_plan), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_user_courses():
    """Get user's courses (completed, current, planned)"""
    try:
        user_id = get_jwt_identity()
        user_courses = UserCourse.query.filter_by(user_id=user_id).all()
        
        courses_data = {
            'completed': [],
            'current': [],
            'planned': []
        }
        
        for user_course in user_courses:
            course_info = get_course_info(user_course.course_code)
            course_data = {
                'course_code': user_course.course_code,
                'status': user_course.status,
                'grade': user_course.grade,
                'semester': user_course.semester,
                'units': user_course.units,
                'website': course_info['website'],
                'category': course_info['category'],
                'prerequisites': course_info['prerequisites']
            }
            courses_data[user_course.status].append(course_data)
        
        return jsonify(courses_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transcript_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get course recommendations based on completed courses"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.transcript_uploaded:
            return jsonify({'error': 'No transcript uploaded'}), 400
        
        # Parse transcript data
        transcript_data = json.loads(user.transcript_data)
        completed_courses = transcript_data['completed_courses']
        current_courses = transcript_data['current_courses']
        
        # Get available courses
        available_courses = get_available_courses(completed_courses)
        available_courses = [course for course in available_courses if course not in current_courses]
        
        # Generate recommendations
        parser = TranscriptParser()
        recommended_courses = parser._get_recommended_courses(available_courses, completed_courses)
        
        # Get detailed information for recommendations
        recommendations = []
        for course_code in recommended_courses[:10]:  # Top 10 recommendations
            course_info = get_course_info(course_code)
            missing_prereqs = get_missing_prerequisites(course_code, completed_courses)
            
            recommendations.append({
                'course_code': course_code,
                'website': course_info['website'],
                'category': course_info['category'],
                'prerequisites': course_info['prerequisites'],
                'missing_prerequisites': missing_prereqs,
                'can_take': len(missing_prereqs) == 0
            })
        
        return jsonify({
            'recommendations': recommendations,
            'completed_courses': completed_courses,
            'current_courses': current_courses
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# Lesson Progress Blueprint
lesson_progress_bp = Blueprint('lesson_progress', __name__)

@lesson_progress_bp.route('/<course_code>/lessons/<lesson_id>/progress', methods=['POST'])
@jwt_required()
def update_lesson_progress(course_code, lesson_id):
    """Update lesson progress for a user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        completed = data.get('completed', False)
        progress = data.get('progress', 0)
        
        # Find existing progress record
        lesson_progress = LessonProgress.query.filter_by(
            user_id=user_id,
            course_code=course_code,
            lesson_id=lesson_id
        ).first()
        
        if lesson_progress:
            # Update existing record
            lesson_progress.completed = completed
            lesson_progress.progress = progress
            lesson_progress.updated_at = datetime.utcnow()
            if completed:
                lesson_progress.completed_at = datetime.utcnow()
        else:
            # Create new record
            lesson_progress = LessonProgress(
                user_id=user_id,
                course_code=course_code,
                lesson_id=lesson_id,
                completed=completed,
                progress=progress,
                completed_at=datetime.utcnow() if completed else None
            )
            db.session.add(lesson_progress)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Progress updated successfully',
            'progress': lesson_progress.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@lesson_progress_bp.route('/<course_code>/lessons/progress', methods=['GET'])
@jwt_required()
def get_lesson_progress(course_code):
    """Get all lesson progress for a user in a course"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all progress records for this user and course
        progress_records = LessonProgress.query.filter_by(
            user_id=user_id,
            course_code=course_code
        ).all()
        
        # Convert to dictionary for easy lookup
        progress_dict = {}
        for record in progress_records:
            progress_dict[record.lesson_id] = {
                'completed': record.completed,
                'progress': record.progress,
                'completed_at': record.completed_at.isoformat() if record.completed_at else None
            }
        
        return jsonify({
            'progress': progress_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Homework Blueprint
homework_bp = Blueprint('homework', __name__)

@homework_bp.route('/<course_code>/homework/upload', methods=['POST'])
@jwt_required()
def upload_homework(course_code):
    """Upload a homework PDF and generate structured exercises"""
    try:
        print(f"Upload request received for course: {course_code}")
        user_id = get_jwt_identity()
        print(f"User ID from JWT: {user_id}")
        user = User.query.get(user_id)
        print(f"User found: {user is not None}")
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file is present in request
        print(f"Request files: {list(request.files.keys())}")
        if 'file' not in request.files:
            print("No 'file' key in request.files")
            return jsonify({
                'error': 'No file provided',
                'message': 'Please include a PDF file in the \'file\' field'
            }), 400
        
        file = request.files['file']
        print(f"File received: {file.filename}, size: {file.content_length}")
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'message': 'Please select a PDF file to upload'
            }), 400
        
        # Check if file is a PDF
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({
                'error': 'Invalid file type',
                'message': 'Only PDF files are allowed'
            }), 400
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Process the homework PDF
            exercises_data = process_homework_pdf(temp_path, file.filename)
            
            # Check if user already has homework for this course
            existing_homework = HomeworkAssignment.query.filter_by(
                user_id=user_id,
                course_code=course_code
            ).first()
            
            if existing_homework:
                # Update existing homework
                existing_homework.title = exercises_data.get('title', 'Homework Assignment')
                existing_homework.original_filename = file.filename
                existing_homework.exercises_data = json.dumps(exercises_data)
                existing_homework.total_problems = len(exercises_data.get('problems', []))
                existing_homework.uploaded_at = datetime.utcnow()
                existing_homework.updated_at = datetime.utcnow()
            else:
                # Create new homework assignment
                homework = HomeworkAssignment(
                    user_id=user_id,
                    course_code=course_code,
                    title=exercises_data.get('title', 'Homework Assignment'),
                    original_filename=file.filename,
                    exercises_data=json.dumps(exercises_data),
                    total_problems=len(exercises_data.get('problems', []))
                )
                db.session.add(homework)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'data': exercises_data,
                'message': f'Successfully processed {file.filename} and generated {len(exercises_data.get("problems", []))} problems'
            }), 200
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@homework_bp.route('/<course_code>/homework', methods=['GET'])
@jwt_required()
def get_homework(course_code):
    """Get homework assignment for a user and course"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get homework assignment for this user and course
        homework = HomeworkAssignment.query.filter_by(
            user_id=user_id,
            course_code=course_code
        ).first()
        
        if not homework:
            return jsonify({
                'error': 'No homework found',
                'message': 'No homework assignment found for this course'
            }), 404
        
        # Parse the exercises data
        exercises_data = json.loads(homework.exercises_data)
        
        return jsonify({
            'success': True,
            'data': exercises_data,
            'homework_info': homework.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@homework_bp.route('/<course_code>/homework', methods=['DELETE'])
@jwt_required()
def delete_homework(course_code):
    """Delete homework assignment for a user and course"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find and delete homework assignment
        homework = HomeworkAssignment.query.filter_by(
            user_id=user_id,
            course_code=course_code
        ).first()
        
        if not homework:
            return jsonify({
                'error': 'No homework found',
                'message': 'No homework assignment found for this course'
            }), 404
        
        db.session.delete(homework)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Homework assignment deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Week Videos Blueprint
week_videos_bp = Blueprint('week_videos', __name__)

@week_videos_bp.route('/<course_code>/weeks/<int:week_number>/videos', methods=['GET'])
@jwt_required()
def get_week_videos(course_code, week_number):
    """Get YouTube videos for a specific week of a course"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get videos from database
        videos = WeekVideo.query.filter_by(
            course_code=course_code.upper(),
            week_number=week_number
        ).order_by(WeekVideo.relevance_score.desc()).all()
        
        if not videos:
            return jsonify({
                'message': f'No videos found for {course_code} Week {week_number}',
                'videos': []
            }), 200
        
        return jsonify({
            'course_code': course_code.upper(),
            'week_number': week_number,
            'videos': [video.to_dict() for video in videos]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@week_videos_bp.route('/<course_code>/videos', methods=['GET'])
@jwt_required()
def get_course_videos(course_code):
    """Get all YouTube videos for a course organized by week"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all videos for the course
        videos = WeekVideo.query.filter_by(
            course_code=course_code.upper()
        ).order_by(WeekVideo.week_number, WeekVideo.relevance_score.desc()).all()
        
        # Organize by week
        videos_by_week = {}
        for video in videos:
            week_num = video.week_number
            if week_num not in videos_by_week:
                videos_by_week[week_num] = []
            videos_by_week[week_num].append(video.to_dict())
        
        return jsonify({
            'course_code': course_code.upper(),
            'videos_by_week': videos_by_week,
            'total_weeks': len(videos_by_week),
            'total_videos': len(videos)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@week_videos_bp.route('/<course_code>/generate', methods=['POST'])
@jwt_required()
def generate_week_videos(course_code):
    """Generate YouTube videos for all weeks of a course based on study guides"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        course_path = data.get('course_path')
        max_videos_per_week = data.get('max_videos_per_week', 3)
        
        if not course_path:
            return jsonify({'error': 'course_path is required'}), 400
        
        # Check if course path exists
        if not os.path.exists(course_path):
            return jsonify({'error': f'Course path does not exist: {course_path}'}), 400
        
        # Initialize video processor
        try:
            processor = WeekVideoProcessor()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Process all weeks for the course
        results = processor.process_course_weeks(
            course_code.upper(), 
            course_path, 
            max_videos_per_week
        )
        
        # Check if quota was exceeded
        quota_exceeded = any('quota exceeded' in error.lower() for error in results.get('errors', []))
        
        if quota_exceeded:
            return jsonify({
                'success': False,
                'course_code': course_code.upper(),
                'results': results,
                'message': 'YouTube API quota exceeded. Please try again later.',
                'quota_exceeded': True
            }), 429  # Too Many Requests
        else:
            return jsonify({
                'success': True,
                'course_code': course_code.upper(),
                'results': results,
                'message': f'Generated {results["total_videos"]} videos for {results["processed_weeks"]} weeks'
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@week_videos_bp.route('/<course_code>/weeks/<int:week_number>/generate', methods=['POST'])
@jwt_required()
def generate_single_week_videos(course_code, week_number):
    """Generate YouTube videos for a specific week based on study guide"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        study_guide_path = data.get('study_guide_path')
        max_videos = data.get('max_videos', 3)
        
        if not study_guide_path:
            return jsonify({'error': 'study_guide_path is required'}), 400
        
        # Check if study guide exists
        if not os.path.exists(study_guide_path):
            return jsonify({'error': f'Study guide does not exist: {study_guide_path}'}), 400
        
        # Initialize video processor
        try:
            processor = WeekVideoProcessor()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Find videos for this week
        try:
            videos = processor.find_videos_for_week(
                course_code.upper(),
                week_number,
                study_guide_path,
                max_videos
            )
            
            if not videos:
                return jsonify({
                    'message': f'No relevant videos found for {course_code} Week {week_number}',
                    'videos': []
                }), 200
            
            # Save videos to database
            success = processor.save_week_videos(course_code.upper(), week_number, videos)
            
            if success:
                return jsonify({
                    'success': True,
                    'course_code': course_code.upper(),
                    'week_number': week_number,
                    'videos': videos,
                    'message': f'Generated and saved {len(videos)} videos for Week {week_number}'
                }), 200
            else:
                return jsonify({'error': 'Failed to save videos to database'}), 500
                
        except Exception as e:
            error_msg = str(e).lower()
            if 'quota' in error_msg or 'limit' in error_msg or 'exceeded' in error_msg:
                return jsonify({
                    'success': False,
                    'error': 'YouTube API quota exceeded. Please try again later.',
                    'quota_exceeded': True
                }), 429  # Too Many Requests
            else:
                return jsonify({'error': str(e)}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
