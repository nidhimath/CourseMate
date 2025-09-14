#!/usr/bin/env python3
"""
Command-line script to generate YouTube videos for course weeks.
This script can be used to populate the database with relevant YouTube videos
for each week of a course based on study guide content.

Usage:
    python generate_week_videos.py <course_code> [options]
    
Examples:
    python generate_week_videos.py CS162
    python generate_week_videos.py CS170 --max-videos 5
    python generate_week_videos.py CS162 --week 1
"""

import argparse
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from week_video_processor import WeekVideoProcessor
from models import db, WeekVideo
from app import app

def find_course_path(course_code):
    """Find the course path for the given course code."""
    base_path = Path("/Users/nidhimathihalli/Documents/GitHub/CourseMate")
    
    # Look for course directories with _New suffix
    possible_paths = [
        base_path / f"{course_code}_New",
        base_path / course_code,
        base_path / f"{course_code.lower()}_new",
        base_path / course_code.lower()
    ]
    
    for path in possible_paths:
        if path.exists() and path.is_dir():
            return str(path)
    
    return None

def list_available_courses():
    """List all available courses in the CourseMate directory."""
    base_path = Path("/Users/nidhimathihalli/Documents/GitHub/CourseMate")
    
    if not base_path.exists():
        print("CourseMate directory not found!")
        return []
    
    courses = []
    for item in base_path.iterdir():
        if item.is_dir() and item.name.endswith('_New'):
            course_code = item.name.replace('_New', '')
            courses.append(course_code)
    
    return sorted(courses)

def generate_videos_for_course(course_code, course_path, max_videos_per_week=3, specific_week=None):
    """Generate videos for a course or specific week."""
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            
            # Initialize processor
            processor = WeekVideoProcessor()
            
            if specific_week:
                # Process specific week
                week_dir = Path(course_path) / f"W{specific_week}"
                study_guide_path = week_dir / "study_guide.md"
                
                if not study_guide_path.exists():
                    print(f"Study guide not found: {study_guide_path}")
                    return False
                
                print(f"Processing {course_code} Week {specific_week}...")
                videos = processor.find_videos_for_week(
                    course_code, specific_week, str(study_guide_path), max_videos_per_week
                )
                
                if videos:
                    success = processor.save_week_videos(course_code, specific_week, videos)
                    if success:
                        print(f"✓ Generated {len(videos)} videos for Week {specific_week}")
                        for video in videos:
                            print(f"  - {video['title']} ({video['channel']})")
                        return True
                    else:
                        print("✗ Failed to save videos to database")
                        return False
                else:
                    print(f"✗ No videos found for Week {specific_week}")
                    return False
            else:
                # Process entire course
                print(f"Processing entire {course_code} course...")
                results = processor.process_course_weeks(
                    course_code, course_path, max_videos_per_week
                )
                
                print(f"\nResults:")
                print(f"  Total weeks: {results['total_weeks']}")
                print(f"  Processed weeks: {results['processed_weeks']}")
                print(f"  Total videos: {results['total_videos']}")
                print(f"  Errors: {len(results['errors'])}")
                
                if results['errors']:
                    print("\nErrors:")
                    for error in results['errors']:
                        print(f"  - {error}")
                
                return results['processed_weeks'] > 0
                
        except Exception as e:
            print(f"Error: {e}")
            return False

def show_existing_videos(course_code):
    """Show existing videos for a course."""
    with app.app_context():
        videos = WeekVideo.query.filter_by(course_code=course_code.upper()).all()
        
        if not videos:
            print(f"No videos found for {course_code}")
            return
        
        # Group by week
        videos_by_week = {}
        for video in videos:
            week_num = video.week_number
            if week_num not in videos_by_week:
                videos_by_week[week_num] = []
            videos_by_week[week_num].append(video)
        
        print(f"Existing videos for {course_code}:")
        for week_num in sorted(videos_by_week.keys()):
            week_videos = videos_by_week[week_num]
            print(f"\nWeek {week_num} ({len(week_videos)} videos):")
            for video in week_videos:
                print(f"  - {video.video_title} ({video.channel_name})")
                print(f"    URL: {video.video_url}")
                print(f"    Score: {video.relevance_score}")

def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description="Generate YouTube videos for course weeks based on study guides",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_week_videos.py CS162
  python generate_week_videos.py CS170 --max-videos 5
  python generate_week_videos.py CS162 --week 1
  python generate_week_videos.py --list-courses
  python generate_week_videos.py CS162 --show-existing
        """
    )
    
    parser.add_argument('course_code', nargs='?', help='Course code (e.g., CS162, CS170)')
    parser.add_argument('--week', type=int, help='Process specific week only')
    parser.add_argument('--max-videos', type=int, default=3, help='Maximum videos per week (default: 3)')
    parser.add_argument('--course-path', help='Custom course path (optional)')
    parser.add_argument('--list-courses', action='store_true', help='List available courses')
    parser.add_argument('--show-existing', action='store_true', help='Show existing videos for course')
    parser.add_argument('--force', action='store_true', help='Force regeneration (overwrite existing videos)')
    
    args = parser.parse_args()
    
    # Check for YouTube API key
    if not os.getenv('YOUTUBE_API_KEY'):
        print("Error: YOUTUBE_API_KEY environment variable not set.")
        print("Please set your YouTube Data API key to use this script.")
        sys.exit(1)
    
    # List courses
    if args.list_courses:
        courses = list_available_courses()
        if courses:
            print("Available courses:")
            for course in courses:
                print(f"  - {course}")
        else:
            print("No courses found!")
        return
    
    # Show existing videos
    if args.show_existing:
        if not args.course_code:
            print("Error: Course code required for --show-existing")
            sys.exit(1)
        show_existing_videos(args.course_code)
        return
    
    # Validate course code
    if not args.course_code:
        print("Error: Course code is required")
        print("Use --list-courses to see available courses")
        sys.exit(1)
    
    # Find course path
    if args.course_path:
        course_path = args.course_path
        if not os.path.exists(course_path):
            print(f"Error: Course path does not exist: {course_path}")
            sys.exit(1)
    else:
        course_path = find_course_path(args.course_code)
        if not course_path:
            print(f"Error: Course path not found for {args.course_code}")
            print("Available courses:")
            for course in list_available_courses():
                print(f"  - {course}")
            sys.exit(1)
    
    print(f"Course: {args.course_code}")
    print(f"Path: {course_path}")
    print(f"Max videos per week: {args.max_videos}")
    if args.week:
        print(f"Specific week: {args.week}")
    print()
    
    # Check for existing videos
    if not args.force:
        with app.app_context():
            existing_count = WeekVideo.query.filter_by(course_code=args.course_code.upper()).count()
            if existing_count > 0:
                print(f"Warning: {existing_count} videos already exist for {args.course_code}")
                response = input("Do you want to continue? This will add more videos. (y/N): ")
                if response.lower() != 'y':
                    print("Cancelled.")
                    return
    
    # Generate videos
    success = generate_videos_for_course(
        args.course_code.upper(),
        course_path,
        args.max_videos,
        args.week
    )
    
    if success:
        print("\n✓ Video generation completed successfully!")
    else:
        print("\n✗ Video generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
