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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    progress = db.relationship('Progress', backref='user', lazy=True, cascade='all, delete-orphan')
    
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
