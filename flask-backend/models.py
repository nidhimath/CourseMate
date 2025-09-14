from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(200))
    google_id = db.Column(db.String(100), unique=True)
    transcript_uploaded = db.Column(db.Boolean, default=False)
    transcript_data = db.Column(db.Text, nullable=True)  # JSON string of parsed transcript
    curriculum_generated = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    progress = db.relationship('Progress', backref='user', lazy=True, cascade='all, delete-orphan')
    homework_assignments = db.relationship('HomeworkAssignment', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    instructor = db.Column(db.String(100))
    semester = db.Column(db.String(20))
    units = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    lessons = db.relationship('Lesson', backref='course', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'instructor': self.instructor,
            'semester': self.semester,
            'units': self.units,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Lesson(db.Model):
    __tablename__ = 'lessons'
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    week = db.Column(db.Integer)
    order = db.Column(db.Integer)
    duration = db.Column(db.Integer)  # in minutes
    difficulty = db.Column(db.String(20))  # Beginner, Intermediate, Advanced
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    concepts = db.relationship('Concept', backref='lesson', lazy=True, cascade='all, delete-orphan')
    exercises = db.relationship('Exercise', backref='lesson', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.course_id,
            'title': self.title,
            'description': self.description,
            'week': self.week,
            'order': self.order,
            'duration': self.duration,
            'difficulty': self.difficulty,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'concepts': [concept.to_dict() for concept in self.concepts],
            'exercises': [exercise.to_dict() for exercise in self.exercises]
        }

class Concept(db.Model):
    __tablename__ = 'concepts'
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    order = db.Column(db.Integer)
    analogy = db.Column(db.Text)
    cs61b_connection = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'title': self.title,
            'content': self.content,
            'order': self.order,
            'analogy': self.analogy,
            'cs61b_connection': self.cs61b_connection,
            'created_at': self.created_at.isoformat()
        }

class Exercise(db.Model):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    problem = db.Column(db.Text)
    hints = db.Column(db.Text)  # JSON string
    solution = db.Column(db.Text)
    order = db.Column(db.Integer)
    cs61b_connection = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'title': self.title,
            'problem': self.problem,
            'hints': json.loads(self.hints) if self.hints else [],
            'solution': self.solution,
            'order': self.order,
            'cs61b_connection': self.cs61b_connection,
            'created_at': self.created_at.isoformat()
        }

class UserCourse(db.Model):
    __tablename__ = 'user_courses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)  # CS61A, EECS16A, etc.
    status = db.Column(db.String(20), nullable=False)  # completed, current, planned
    grade = db.Column(db.String(5), nullable=True)  # A+, A, B+, etc.
    semester = db.Column(db.String(20), nullable=True)  # Fall 2024, Spring 2025, etc.
    units = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_code': self.course_code,
            'status': self.status,
            'grade': self.grade,
            'semester': self.semester,
            'units': self.units,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Progress(db.Model):
    __tablename__ = 'progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    concept_id = db.Column(db.Integer, db.ForeignKey('concepts.id'), nullable=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    score = db.Column(db.Float)
    time_spent = db.Column(db.Integer)  # in minutes
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lesson_id': self.lesson_id,
            'concept_id': self.concept_id,
            'exercise_id': self.exercise_id,
            'completed': self.completed,
            'score': self.score,
            'time_spent': self.time_spent,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class LessonProgress(db.Model):
    __tablename__ = 'lesson_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)  # CS162, etc.
    lesson_id = db.Column(db.String(50), nullable=False)  # "1-1", "2-1", etc.
    completed = db.Column(db.Boolean, default=False)
    progress = db.Column(db.Integer, default=0)  # 0-100 percentage
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint to prevent duplicate entries
    __table_args__ = (db.UniqueConstraint('user_id', 'course_code', 'lesson_id', name='unique_user_lesson'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_code': self.course_code,
            'lesson_id': self.lesson_id,
            'completed': self.completed,
            'progress': self.progress,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class HomeworkAssignment(db.Model):
    __tablename__ = 'homework_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)  # CS162, etc.
    title = db.Column(db.String(200), nullable=False)
    original_filename = db.Column(db.String(200), nullable=False)
    exercises_data = db.Column(db.Text, nullable=False)  # JSON string of structured exercises
    total_problems = db.Column(db.Integer, default=0)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_code': self.course_code,
            'title': self.title,
            'original_filename': self.original_filename,
            'exercises_data': self.exercises_data,
            'total_problems': self.total_problems,
            'uploaded_at': self.uploaded_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WeekVideo(db.Model):
    __tablename__ = 'week_videos'
    
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), nullable=False)  # CS162, CS170, etc.
    week_number = db.Column(db.Integer, nullable=False)  # 1, 2, 3, etc.
    topic = db.Column(db.String(200), nullable=False)  # Main topic for this video
    video_title = db.Column(db.String(300), nullable=False)
    video_url = db.Column(db.String(500), nullable=False)
    video_id = db.Column(db.String(50), nullable=False)  # YouTube video ID
    channel_name = db.Column(db.String(100), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    relevance_score = db.Column(db.Float, nullable=False)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint to prevent duplicate videos for same week/topic
    __table_args__ = (db.UniqueConstraint('course_code', 'week_number', 'topic', name='unique_week_topic_video'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_code': self.course_code,
            'week_number': self.week_number,
            'topic': self.topic,
            'video_title': self.video_title,
            'video_url': self.video_url,
            'video_id': self.video_id,
            'channel_name': self.channel_name,
            'duration_seconds': self.duration_seconds,
            'relevance_score': self.relevance_score,
            'thumbnail_url': self.thumbnail_url,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
