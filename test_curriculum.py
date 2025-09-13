#!/usr/bin/env python3
"""
Test curriculum generation specifically
"""

import requests
import json

def test_curriculum():
    """Test curriculum generation after upload"""
    
    print("🔐 Step 1: Authenticating...")
    
    # Step 1: Authenticate
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
    
    # Step 2: Upload transcript
    print("📄 Step 2: Uploading transcript...")
    
    upload_url = "http://localhost:5001/api/transcript/upload"
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
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
    print("🎓 Step 3: Testing curriculum generation...")
    
    curriculum_url = "http://localhost:5001/api/transcript/curriculum"
    curriculum_response = requests.get(curriculum_url, headers=headers)
    
    print(f"📡 Curriculum response status: {curriculum_response.status_code}")
    
    if curriculum_response.status_code != 200:
        print(f"❌ Curriculum failed: {curriculum_response.text}")
        return
    
    curriculum_result = curriculum_response.json()
    print("✅ Curriculum generation successful")
    print(f"📋 Curriculum data keys: {list(curriculum_result.keys())}")
    
    # Pretty print the curriculum
    print("\n🎯 CURRICULUM RESULTS:")
    print("=" * 50)
    print(json.dumps(curriculum_result, indent=2))
    
    # Step 4: Test recommendations
    print("\n🎯 Step 4: Testing recommendations...")
    
    recommendations_url = "http://localhost:5001/api/transcript/recommendations"
    recommendations_response = requests.get(recommendations_url, headers=headers)
    
    print(f"📡 Recommendations response status: {recommendations_response.status_code}")
    
    if recommendations_response.status_code != 200:
        print(f"❌ Recommendations failed: {recommendations_response.text}")
        return
    
    recommendations_result = recommendations_response.json()
    print("✅ Recommendations generation successful")
    print(f"📋 Recommendations data keys: {list(recommendations_result.keys())}")
    
    # Pretty print the recommendations
    print("\n🎯 RECOMMENDATIONS RESULTS:")
    print("=" * 50)
    print(json.dumps(recommendations_result, indent=2))
    
    return True

if __name__ == "__main__":
    test_curriculum()
