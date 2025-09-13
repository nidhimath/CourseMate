# /Users/nidhimathihalli/Documents/GitHub/CourseMate/flask-backend/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    def __init__(self):
        self.url = os.environ.get('SUPABASE_URL')
        self.anon_key = os.environ.get('SUPABASE_ANON_KEY')
        self.service_role_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if not all([self.url, self.anon_key]):
            raise ValueError("Missing Supabase configuration. Please check your environment variables.")
        
        # Use anon key for now (you can switch to service role key later for admin operations)
        self.client: Client = create_client(self.url, self.anon_key)
    
    def get_client(self) -> Client:
        return self.client

# Global instance
supabase_client = SupabaseClient()