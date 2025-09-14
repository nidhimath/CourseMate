#!/usr/bin/env python3
"""
Batch Course Setup Script

This script can set up multiple courses at once, useful for setting up
all courses in a category or a custom list.

Usage:
    python setup_multiple_courses.py --category "CS Core"
    python setup_multiple_courses.py --courses "CS61A,CS61B,CS61C"
    python setup_multiple_courses.py --all
"""

import os
import sys
import argparse
import time
from pathlib import Path

# Add current directory to path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from course_data import COURSE_WEBSITES, COURSE_CATEGORIES
from setup_course import setup_course

def setup_courses_in_category(category: str, skip_download: bool = False, skip_extraction: bool = False):
    """Set up all courses in a specific category"""
    if category not in COURSE_CATEGORIES:
        print(f"❌ Category '{category}' not found")
        print("Available categories:")
        for cat in COURSE_CATEGORIES.keys():
            print(f"  - {cat}")
        return False
    
    courses = COURSE_CATEGORIES[category]
    print(f"📚 Setting up {len(courses)} courses in category: {category}")
    
    success_count = 0
    for i, course in enumerate(courses, 1):
        print(f"\n{'='*60}")
        print(f"📖 Course {i}/{len(courses)}: {course}")
        print(f"{'='*60}")
        
        if setup_course(course, skip_download, skip_extraction):
            success_count += 1
        else:
            print(f"❌ Failed to set up {course}")
        
        # Add delay between courses to be respectful to servers
        if i < len(courses):
            print(f"⏳ Waiting 5 seconds before next course...")
            time.sleep(5)
    
    print(f"\n🎉 Completed! {success_count}/{len(courses)} courses set up successfully")
    return success_count == len(courses)

def setup_custom_courses(course_list: str, skip_download: bool = False, skip_extraction: bool = False):
    """Set up a custom list of courses"""
    courses = [course.strip().upper() for course in course_list.split(',')]
    
    # Validate courses
    invalid_courses = [course for course in courses if course not in COURSE_WEBSITES]
    if invalid_courses:
        print(f"❌ Invalid courses: {', '.join(invalid_courses)}")
        return False
    
    print(f"📚 Setting up {len(courses)} custom courses")
    
    success_count = 0
    for i, course in enumerate(courses, 1):
        print(f"\n{'='*60}")
        print(f"📖 Course {i}/{len(courses)}: {course}")
        print(f"{'='*60}")
        
        if setup_course(course, skip_download, skip_extraction):
            success_count += 1
        else:
            print(f"❌ Failed to set up {course}")
        
        # Add delay between courses
        if i < len(courses):
            print(f"⏳ Waiting 5 seconds before next course...")
            time.sleep(5)
    
    print(f"\n🎉 Completed! {success_count}/{len(courses)} courses set up successfully")
    return success_count == len(courses)

def setup_all_courses(skip_download: bool = False, skip_extraction: bool = False):
    """Set up all available courses"""
    all_courses = list(COURSE_WEBSITES.keys())
    print(f"📚 Setting up ALL {len(all_courses)} courses")
    print("⚠️  This will take a very long time and may overwhelm servers!")
    
    response = input("Are you sure you want to continue? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Cancelled by user")
        return False
    
    success_count = 0
    for i, course in enumerate(all_courses, 1):
        print(f"\n{'='*60}")
        print(f"📖 Course {i}/{len(all_courses)}: {course}")
        print(f"{'='*60}")
        
        if setup_course(course, skip_download, skip_extraction):
            success_count += 1
        else:
            print(f"❌ Failed to set up {course}")
        
        # Add delay between courses
        if i < len(all_courses):
            print(f"⏳ Waiting 10 seconds before next course...")
            time.sleep(10)
    
    print(f"\n🎉 Completed! {success_count}/{len(all_courses)} courses set up successfully")
    return success_count == len(all_courses)

def main():
    parser = argparse.ArgumentParser(description='Set up multiple courses with materials and study guides')
    parser.add_argument('--category', help='Set up all courses in a category (e.g., "CS Core")')
    parser.add_argument('--courses', help='Comma-separated list of courses (e.g., "CS61A,CS61B,CS61C")')
    parser.add_argument('--all', action='store_true', help='Set up ALL available courses (use with caution!)')
    parser.add_argument('--skip-download', action='store_true', help='Skip downloading materials')
    parser.add_argument('--skip-extraction', action='store_true', help='Skip PDF extraction')
    parser.add_argument('--list-categories', action='store_true', help='List all available categories')
    
    args = parser.parse_args()
    
    if args.list_categories:
        print("📚 Available categories:")
        for category, courses in COURSE_CATEGORIES.items():
            print(f"\n{category} ({len(courses)} courses):")
            for course in courses:
                print(f"  - {course}")
        return 0
    
    if not any([args.category, args.courses, args.all]):
        parser.print_help()
        return 1
    
    success = False
    
    if args.category:
        success = setup_courses_in_category(args.category, args.skip_download, args.skip_extraction)
    elif args.courses:
        success = setup_custom_courses(args.courses, args.skip_download, args.skip_extraction)
    elif args.all:
        success = setup_all_courses(args.skip_download, args.skip_extraction)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
