# /Users/nidhimathihalli/Documents/GitHub/CourseMate/flask-backend/models_supabase.py
from datetime import datetime
from typing import Dict, List, Optional
from supabase_client import supabase_client

class SupabaseModel:
    """Base class for Supabase models"""
    
    @classmethod
    def get_table_name(cls) -> str:
        """Return the table name for this model"""
        return cls.__name__.lower() + 's'
    
    @classmethod
    def create(cls, data: Dict) -> Dict:
        """Create a new record"""
        table_name = cls.get_table_name()
        result = supabase_client.get_client().table(table_name).insert(data).execute()
        return result.data[0] if result.data else None
    
    @classmethod
    def get_by_id(cls, record_id: int) -> Optional[Dict]:
        """Get a record by ID"""
        table_name = cls.get_table_name()
        result = supabase_client.get_client().table(table_name).select("*").eq("id", record_id).execute()
        return result.data[0] if result.data else None
    
    @classmethod
    def get_by_email(cls, email: str) -> Optional[Dict]:
        """Get a record by email"""
        table_name = cls.get_table_name()
        result = supabase_client.get_client().table(table_name).select("*").eq("email", email).execute()
        return result.data[0] if result.data else None
    
    @classmethod
    def update(cls, record_id: int, data: Dict) -> Optional[Dict]:
        """Update a record"""
        table_name = cls.get_table_name()
        result = supabase_client.get_client().table(table_name).update(data).eq("id", record_id).execute()
        return result.data[0] if result.data else None
    
    @classmethod
    def delete(cls, record_id: int) -> bool:
        """Delete a record"""
        table_name = cls.get_table_name()
        result = supabase_client.get_client().table(table_name).delete().eq("id", record_id).execute()
        return len(result.data) > 0

class User(SupabaseModel):
    """User model for Supabase"""
    
    @classmethod
    def get_table_name(cls) -> str:
        return "users"
    
    @classmethod
    def create_user(cls, email: str, name: str, image_url: str = None, google_id: str = None) -> Dict:
        """Create a new user"""
        data = {
            "email": email,
            "name": name,
            "image_url": image_url,
            "google_id": google_id,
            "transcript_uploaded": False,
            "transcript_data": None,
            "curriculum_generated": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        return cls.create(data)
    
    @classmethod
    def update_transcript_data(cls, user_id: int, transcript_data: str) -> Dict:
        """Update user's transcript data"""
        data = {
            "transcript_uploaded": True,
            "transcript_data": transcript_data,
            "updated_at": datetime.utcnow().isoformat()
        }
        return cls.update(user_id, data)

class UserCourse(SupabaseModel):
    """UserCourse model for Supabase"""
    
    @classmethod
    def get_table_name(cls) -> str:
        return "user_courses"
    
    @classmethod
    def create_user_course(cls, user_id: int, course_code: str, status: str) -> Dict:
        """Create a new user course record"""
        data = {
            "user_id": user_id,
            "course_code": course_code,
            "status": status,  # 'completed', 'current', 'planned'
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        return cls.create(data)
    
    @classmethod
    def get_user_courses(cls, user_id: int, status: str = None) -> List[Dict]:
        """Get user courses by status"""
        table_name = cls.get_table_name()
        query = supabase_client.get_client().table(table_name).select("*").eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status)
        
        result = query.execute()
        return result.data if result.data else []