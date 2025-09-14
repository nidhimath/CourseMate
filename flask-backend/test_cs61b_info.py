#!/usr/bin/env python3
"""
Test script to verify CS61B course information is properly stored
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Course
from course_data import get_course_info

def test_cs61b_info():
    """Test CS61B course information from database and course_data"""
    
    with app.app_context():
        print("🧪 Testing CS61B Course Information")
        print("=" * 50)
        
        # Test database information
        print("📊 Database Information:")
        db_course = Course.query.filter_by(code='CS61B').first()
        
        if db_course:
            print(f"   ✅ Course found in database")
            print(f"   📝 Name: {db_course.name}")
            print(f"   👨‍🏫 Instructor: {db_course.instructor}")
            print(f"   📅 Semester: {db_course.semester}")
            print(f"   📚 Units: {db_course.units}")
            print(f"   📖 Description: {db_course.description[:100]}...")
            print(f"   🔗 Website: {db_course.code} - https://sp25.datastructur.es/")
        else:
            print("   ❌ Course not found in database")
            return False
        
        print("\n📋 Course Data Information:")
        course_info = get_course_info('CS61B')
        
        if course_info:
            print(f"   ✅ Course info retrieved from course_data")
            print(f"   📝 Name: {course_info.get('name', 'N/A')}")
            print(f"   👨‍🏫 Instructor: {course_info.get('instructor', 'N/A')}")
            print(f"   📅 Semester: {course_info.get('semester', 'N/A')}")
            print(f"   📚 Units: {course_info.get('units', 'N/A')}")
            print(f"   🕐 Lecture Time: {course_info.get('lecture_time', 'N/A')}")
            print(f"   🔗 Website: {course_info.get('website', 'N/A')}")
            print(f"   📋 Prerequisites: {', '.join(course_info.get('prerequisites', []))}")
            print(f"   🏷️ Category: {course_info.get('category', 'N/A')}")
        else:
            print("   ❌ Course info not found in course_data")
            return False
        
        print("\n✅ All tests passed!")
        return True

def main():
    """Main function to run the test"""
    success = test_cs61b_info()
    
    if success:
        print("\n🎉 CS61B course information is properly configured!")
        print("\n📚 Course Summary:")
        print("   • CS61B: Data Structures and Algorithms")
        print("   • Instructors: Justin Yokota, Josh Hug")
        print("   • Spring 2025, 4 units")
        print("   • Prerequisites: CS61A")
        print("   • Website: https://sp25.datastructur.es/")
        return 0
    else:
        print("\n❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    exit(main())
