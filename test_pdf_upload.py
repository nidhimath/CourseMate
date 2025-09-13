#!/usr/bin/env python3
"""
Test PDF upload functionality
"""

import requests
import json
import os

# Set environment variables for testing
os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key'
os.environ['SECRET_KEY'] = 'test-secret-key'

def test_pdf_upload():
    """Test uploading the transcript PDF"""
    
    # First, get a JWT token (simulate login)
    auth_url = "http://localhost:5001/api/auth/google"
    auth_data = {
        "email": "test@example.com",
        "name": "Test User",
        "image": "https://example.com/image.jpg",
        "google_id": "123456789"
    }
    
    print("🔐 Getting authentication token...")
    auth_response = requests.post(auth_url, json=auth_data)
    
    if auth_response.status_code != 200:
        print(f"❌ Auth failed: {auth_response.text}")
        return
    
    auth_result = auth_response.json()
    access_token = auth_result['access_token']
    print("✅ Authentication successful")
    
    # Now test PDF upload
    upload_url = "http://localhost:5001/api/transcript/upload"
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    print("📄 Testing PDF upload...")
    
    # Upload the transcript PDF
    with open('unofficial-transcript.pdf', 'rb') as pdf_file:
        files = {
            'transcript_pdf': ('unofficial-transcript.pdf', pdf_file, 'application/pdf')
        }
        
        upload_response = requests.post(upload_url, headers=headers, files=files)
    
    if upload_response.status_code == 200:
        result = upload_response.json()
        print("✅ PDF upload successful!")
        print(f"📊 Parsed data: {json.dumps(result['parsed_data'], indent=2)}")
        
        # Test curriculum generation
        print("\n🎯 Testing curriculum generation...")
        curriculum_url = "http://localhost:5001/api/transcript/curriculum"
        curriculum_response = requests.get(curriculum_url, headers=headers)
        
        if curriculum_response.status_code == 200:
            curriculum = curriculum_response.json()
            print("✅ Curriculum generation successful!")
            print(f"📋 Available courses: {curriculum['available_courses'][:5]}...")
            print(f"⭐ Recommended courses: {curriculum['recommended_courses'][:5]}...")
        else:
            print(f"❌ Curriculum generation failed: {curriculum_response.text}")
            
    else:
        print(f"❌ PDF upload failed: {upload_response.text}")

if __name__ == "__main__":
    test_pdf_upload()
