#!/usr/bin/env python3
"""
Test the complete authentication and PDF upload flow
"""

import requests
import json

def test_complete_flow():
    """Test the complete flow from auth to PDF upload"""
    
    print("🔐 Testing authentication flow...")
    
    # Step 1: Test authentication
    auth_url = "http://localhost:5001/api/auth/google"
    auth_data = {
        "email": "test@example.com",
        "name": "Test User",
        "image": "https://example.com/image.jpg",
        "google_id": "test@example.com"
    }
    
    auth_response = requests.post(auth_url, json=auth_data)
    
    if auth_response.status_code != 200:
        print(f"❌ Auth failed: {auth_response.text}")
        return
    
    auth_result = auth_response.json()
    access_token = auth_result['access_token']
    print("✅ Authentication successful")
    
    # Step 2: Test PDF upload
    print("📄 Testing PDF upload...")
    
    upload_url = "http://localhost:5001/api/transcript/upload"
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    # Use the existing transcript PDF
    with open('unofficial-transcript.pdf', 'rb') as pdf_file:
        files = {'transcript_pdf': pdf_file}
        upload_response = requests.post(upload_url, headers=headers, files=files)
    
    if upload_response.status_code != 200:
        print(f"❌ Upload failed: {upload_response.text}")
        return
    
    upload_result = upload_response.json()
    print("✅ PDF upload successful")
    print(f"📊 Found {len(upload_result['parsed_data']['completed_courses'])} completed courses")
    print(f"📚 Found {len(upload_result['parsed_data']['current_courses'])} current courses")
    
    # Step 3: Test curriculum generation
    print("🎓 Testing curriculum generation...")
    
    curriculum_url = "http://localhost:5001/api/transcript/curriculum"
    curriculum_response = requests.get(curriculum_url, headers=headers)
    
    if curriculum_response.status_code != 200:
        print(f"❌ Curriculum failed: {curriculum_response.text}")
        return
    
    curriculum_result = curriculum_response.json()
    print("✅ Curriculum generation successful")
    print(f"📋 Generated {len(curriculum_result.get('recommended_courses', []))} course recommendations")
    
    print("\n🎉 Complete flow test successful!")
    return True

if __name__ == "__main__":
    test_complete_flow()
