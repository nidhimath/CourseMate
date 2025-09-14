#!/usr/bin/env python3
"""
Test script for the Week Video Processor functionality.
This script demonstrates how to use the WeekVideoProcessor to generate
YouTube videos for course weeks based on study guide content.
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from week_video_processor import WeekVideoProcessor
from models import db, WeekVideo
from app import app

def test_topic_extraction():
    """Test topic extraction from study guides."""
    print("=== Testing Topic Extraction ===")
    
    processor = WeekVideoProcessor()
    
    # Test with CS162 Week 1 study guide
    study_guide_path = "/Users/nidhimathihalli/Documents/GitHub/CourseMate/CS162_New/W1/study_guide.md"
    
    if os.path.exists(study_guide_path):
        topics = processor.extract_topics_from_study_guide(study_guide_path)
        print(f"Extracted {len(topics)} topics from CS162 Week 1:")
        for i, topic in enumerate(topics[:10], 1):
            print(f"  {i}. {topic}")
    else:
        print(f"Study guide not found: {study_guide_path}")
    
    print()

def test_search_queries():
    """Test search query generation."""
    print("=== Testing Search Query Generation ===")
    
    processor = WeekVideoProcessor()
    
    # Sample topics
    topics = [
        "Operating Systems",
        "Process Management", 
        "Virtual Memory",
        "System Calls",
        "Dual Mode Operation"
    ]
    
    queries = processor.generate_search_queries(topics, "CS162")
    print(f"Generated {len(queries)} search queries:")
    for i, query in enumerate(queries, 1):
        print(f"  {i}. {query}")
    
    print()

def test_single_week_processing():
    """Test processing a single week."""
    print("=== Testing Single Week Processing ===")
    
    try:
        processor = WeekVideoProcessor()
        
        # Test with CS162 Week 1
        course_code = "CS162"
        week_number = 1
        study_guide_path = "/Users/nidhimathihalli/Documents/GitHub/CourseMate/CS162_New/W1/study_guide.md"
        
        if os.path.exists(study_guide_path):
            print(f"Processing {course_code} Week {week_number}...")
            videos = processor.find_videos_for_week(
                course_code, week_number, study_guide_path, max_videos=2
            )
            
            print(f"Found {len(videos)} videos:")
            for i, video in enumerate(videos, 1):
                print(f"  {i}. {video['title']}")
                print(f"     Channel: {video['channel']}")
                print(f"     URL: {video['url']}")
                print(f"     Score: {video['relevance_score']}")
                print()
        else:
            print(f"Study guide not found: {study_guide_path}")
            
    except Exception as e:
        print(f"Error in single week processing: {e}")
    
    print()

def test_database_operations():
    """Test database operations with app context."""
    print("=== Testing Database Operations ===")
    
    with app.app_context():
        try:
            # Create tables
            db.create_all()
            
            # Test saving a sample video
            sample_video = WeekVideo(
                course_code="CS162",
                week_number=1,
                topic="Operating Systems Introduction",
                video_title="Introduction to Operating Systems",
                video_url="https://www.youtube.com/watch?v=example",
                video_id="example123",
                channel_name="Test Channel",
                duration_seconds=600,
                relevance_score=8.5,
                thumbnail_url="https://example.com/thumb.jpg",
                description="A test video description"
            )
            
            # Clear any existing test data
            WeekVideo.query.filter_by(course_code="CS162", week_number=1).delete()
            
            # Add and commit
            db.session.add(sample_video)
            db.session.commit()
            
            # Retrieve and verify
            saved_videos = WeekVideo.query.filter_by(course_code="CS162", week_number=1).all()
            print(f"Saved {len(saved_videos)} videos to database")
            
            for video in saved_videos:
                print(f"  - {video.video_title} ({video.channel_name})")
            
            # Clean up test data
            WeekVideo.query.filter_by(course_code="CS162", week_number=1).delete()
            db.session.commit()
            print("Test data cleaned up")
            
        except Exception as e:
            print(f"Error in database operations: {e}")
            db.session.rollback()
    
    print()

def test_course_processing():
    """Test processing an entire course."""
    print("=== Testing Course Processing ===")
    
    try:
        processor = WeekVideoProcessor()
        
        course_code = "CS162"
        course_path = "/Users/nidhimathihalli/Documents/GitHub/CourseMate/CS162_New"
        
        if os.path.exists(course_path):
            print(f"Processing entire {course_code} course...")
            print("Note: This will make actual YouTube API calls and may take a while.")
            
            # Ask for confirmation
            response = input("Do you want to proceed with full course processing? (y/N): ")
            if response.lower() == 'y':
                results = processor.process_course_weeks(course_code, course_path, max_videos_per_week=2)
                
                print(f"\nProcessing Results:")
                print(f"  Total weeks: {results['total_weeks']}")
                print(f"  Processed weeks: {results['processed_weeks']}")
                print(f"  Total videos: {results['total_videos']}")
                print(f"  Errors: {len(results['errors'])}")
                
                if results['errors']:
                    print("\nErrors:")
                    for error in results['errors']:
                        print(f"  - {error}")
            else:
                print("Skipping full course processing")
        else:
            print(f"Course path not found: {course_path}")
            
    except Exception as e:
        print(f"Error in course processing: {e}")
    
    print()

def main():
    """Run all tests."""
    print("Week Video Processor Test Suite")
    print("=" * 50)
    
    # Check if YouTube API key is available
    if not os.getenv('YOUTUBE_API_KEY'):
        print("Warning: YOUTUBE_API_KEY environment variable not set.")
        print("Some tests may fail. Set the API key to test YouTube functionality.")
        print()
    
    # Run tests
    test_topic_extraction()
    test_search_queries()
    test_database_operations()
    test_single_week_processing()
    test_course_processing()
    
    print("Test suite completed!")

if __name__ == "__main__":
    main()
