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
        "google_id": "123456789"
    }
    
    auth_response = requests.post(auth_url, json=auth_data)
    
    if auth_response.status_code != 200:
        print(f"❌ Auth failed: {auth_response.text}")
        return
    
    auth_result = auth_response.json()
    access_token = auth_result['access_token']
    print("✅ Authentication successful")
    
    # Step 2: Test PDF upload with valid token
    upload_url = "http://localhost:5001/api/transcript/upload"
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    print("📄 Testing PDF upload with valid token...")
    
    with open('unofficial-transcript.pdf', 'rb') as pdf_file:
        files = {
            'transcript_pdf': ('unofficial-transcript.pdf', pdf_file, 'application/pdf')
        }
        
        upload_response = requests.post(upload_url, headers=headers, files=files)
    
    print(f"📊 Upload response status: {upload_response.status_code}")
    print(f"📊 Upload response: {upload_response.text[:200]}...")
    
    if upload_response.status_code == 200:
        print("✅ PDF upload successful!")
        result = upload_response.json()
        print(f"📊 Found {len(result['parsed_data']['completed_courses'])} completed courses")
    else:
        print(f"❌ PDF upload failed: {upload_response.text}")

if __name__ == "__main__":
    test_complete_flow()
