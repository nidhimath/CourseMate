#!/usr/bin/env python3
"""
Example usage of the Week Video Processor submodule.

This script demonstrates how to use the new YouTube video functionality
to generate relevant educational videos for each week of a course.
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from week_video_processor import WeekVideoProcessor
from models import db, WeekVideo
from app import app

def example_single_week():
    """Example: Generate videos for a single week."""
    print("=== Example: Single Week Video Generation ===")
    
    with app.app_context():
        try:
            # Initialize the processor
            processor = WeekVideoProcessor()
            
            # Example: CS162 Week 1
            course_code = "CS162"
            week_number = 1
            study_guide_path = "/Users/nidhimathihalli/Documents/GitHub/CourseMate/CS162_New/W1/study_guide.md"
            
            print(f"Generating videos for {course_code} Week {week_number}...")
            
            # Extract topics from study guide
            topics = processor.extract_topics_from_study_guide(study_guide_path)
            print(f"Extracted topics: {topics[:5]}...")  # Show first 5
            
            # Generate search queries
            queries = processor.generate_search_queries(topics, course_code)
            print(f"Generated queries: {queries[:3]}...")  # Show first 3
            
            # Find videos (this makes actual YouTube API calls)
            videos = processor.find_videos_for_week(
                course_code, week_number, study_guide_path, max_videos=2
            )
            
            if videos:
                print(f"Found {len(videos)} relevant videos:")
                for i, video in enumerate(videos, 1):
                    print(f"  {i}. {video['title']}")
                    print(f"     Channel: {video['channel']}")
                    print(f"     Duration: {video['duration_seconds']} seconds")
                    print(f"     Relevance Score: {video['relevance_score']}")
                    print(f"     URL: {video['url']}")
                    print()
                
                # Save to database
                success = processor.save_week_videos(course_code, week_number, videos)
                if success:
                    print("✓ Videos saved to database successfully!")
                else:
                    print("✗ Failed to save videos to database")
            else:
                print("No relevant videos found")
                
        except Exception as e:
            print(f"Error: {e}")

def example_course_processing():
    """Example: Process an entire course."""
    print("\n=== Example: Full Course Processing ===")
    
    with app.app_context():
        try:
            processor = WeekVideoProcessor()
            
            course_code = "CS162"
            course_path = "/Users/nidhimathihalli/Documents/GitHub/CourseMate/CS162_New"
            
            print(f"Processing entire {course_code} course...")
            print("This will process all weeks with study guides.")
            
            # Process all weeks
            results = processor.process_course_weeks(
                course_code, course_path, max_videos_per_week=2
            )
            
            print(f"\nResults:")
            print(f"  Total weeks found: {results['total_weeks']}")
            print(f"  Successfully processed: {results['processed_weeks']}")
            print(f"  Total videos generated: {results['total_videos']}")
            print(f"  Errors encountered: {len(results['errors'])}")
            
            if results['errors']:
                print("\nErrors:")
                for error in results['errors']:
                    print(f"  - {error}")
                    
        except Exception as e:
            print(f"Error: {e}")

def example_retrieve_videos():
    """Example: Retrieve videos from database."""
    print("\n=== Example: Retrieving Videos from Database ===")
    
    with app.app_context():
        try:
            processor = WeekVideoProcessor()
            
            course_code = "CS162"
            
            # Get all videos for the course
            all_videos = processor.get_course_videos(course_code)
            
            if all_videos:
                print(f"Retrieved videos for {course_code}:")
                for week_num in sorted(all_videos.keys()):
                    videos = all_videos[week_num]
                    print(f"\nWeek {week_num} ({len(videos)} videos):")
                    for video in videos:
                        print(f"  - {video['video_title']} ({video['channel_name']})")
                        print(f"    Score: {video['relevance_score']}")
            else:
                print(f"No videos found for {course_code}")
                
        except Exception as e:
            print(f"Error: {e}")

def example_api_usage():
    """Example: How to use the API endpoints."""
    print("\n=== Example: API Usage ===")
    
    print("The following API endpoints are now available:")
    print()
    print("1. Get videos for a specific week:")
    print("   GET /api/week-videos/{course_code}/weeks/{week_number}/videos")
    print("   Example: GET /api/week-videos/CS162/weeks/1/videos")
    print()
    print("2. Get all videos for a course:")
    print("   GET /api/week-videos/{course_code}/videos")
    print("   Example: GET /api/week-videos/CS162/videos")
    print()
    print("3. Generate videos for entire course:")
    print("   POST /api/week-videos/{course_code}/generate")
    print("   Body: {\"course_path\": \"/path/to/course\", \"max_videos_per_week\": 3}")
    print()
    print("4. Generate videos for specific week:")
    print("   POST /api/week-videos/{course_code}/weeks/{week_number}/generate")
    print("   Body: {\"study_guide_path\": \"/path/to/study_guide.md\", \"max_videos\": 3}")
    print()
    print("All endpoints require JWT authentication.")

def main():
    """Run examples."""
    print("Week Video Processor - Example Usage")
    print("=" * 50)
    
    # Check if YouTube API key is available
    if not os.getenv('YOUTUBE_API_KEY'):
        print("Warning: YOUTUBE_API_KEY environment variable not set.")
        print("The examples will show the structure but won't make actual API calls.")
        print()
    
    # Run examples
    example_single_week()
    example_course_processing()
    example_retrieve_videos()
    example_api_usage()
    
    print("\n" + "=" * 50)
    print("Example usage completed!")
    print("\nTo use this functionality:")
    print("1. Set your YOUTUBE_API_KEY environment variable")
    print("2. Run: python generate_week_videos.py CS162")
    print("3. Or use the API endpoints in your frontend application")

if __name__ == "__main__":
    main()
