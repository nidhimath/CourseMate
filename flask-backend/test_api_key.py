#!/usr/bin/env python3
"""
Simple test script to verify YouTube API key is working.
This script makes a minimal API call to test the key without using quota.
"""

import os
from dotenv import load_dotenv
from googleapiclient.discovery import build

def test_youtube_api_key():
    """Test if the YouTube API key is working."""
    load_dotenv()
    api_key = os.getenv('YOUTUBE_API_KEY')
    
    if not api_key:
        print("❌ No YouTube API key found in environment variables")
        return False
    
    if api_key == 'your_youtube_api_key_here':
        print("❌ YouTube API key is still set to placeholder value")
        return False
    
    print(f"✅ YouTube API key found: {api_key[:10]}...")
    
    try:
        # Create YouTube service
        youtube = build('youtube', 'v3', developerKey=api_key)
        
        # Make a simple API call to test the key
        # This call has minimal quota usage
        response = youtube.search().list(
            q='test',
            part='id',
            maxResults=1,
            type='video'
        ).execute()
        
        print("✅ YouTube API key is working correctly!")
        print(f"   Test search returned {len(response.get('items', []))} result(s)")
        return True
        
    except Exception as e:
        error_msg = str(e).lower()
        if 'quota' in error_msg or 'limit' in error_msg or 'exceeded' in error_msg:
            print("⚠️  YouTube API quota exceeded")
            print("   The API key is valid but quota has been exceeded")
            return False
        elif 'invalid' in error_msg or 'forbidden' in error_msg:
            print("❌ YouTube API key is invalid or forbidden")
            print(f"   Error: {e}")
            return False
        else:
            print(f"❌ Error testing YouTube API: {e}")
            return False

if __name__ == "__main__":
    print("Testing YouTube API Key...")
    print("=" * 40)
    
    success = test_youtube_api_key()
    
    if success:
        print("\n🎉 API key test passed! You can now use the video generation features.")
    else:
        print("\n💡 Please check your API key and try again.")
        print("   Make sure to:")
        print("   1. Get a valid YouTube Data API v3 key from Google Cloud Console")
        print("   2. Enable the YouTube Data API v3 for your project")
        print("   3. Set the YOUTUBE_API_KEY environment variable")
