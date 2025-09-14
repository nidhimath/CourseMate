#!/usr/bin/env python3
"""
Script to update CS61B course information in the database
Based on data from https://sp25.datastructur.es/
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Course

def update_cs61b_info():
    """Update CS61B course information with correct details from the website"""
    
    with app.app_context():
        # Check if CS61B course already exists
        existing_course = Course.query.filter_by(code='CS61B').first()
        
        # Course information from https://sp25.datastructur.es/
        course_data = {
            'code': 'CS61B',
            'name': 'Data Structures and Algorithms',
            'description': 'CS 61B Spring 2025 - Data Structures and Algorithms. A comprehensive course covering fundamental data structures, algorithms, and software engineering principles.',
            'instructor': 'Justin Yokota, Josh Hug',
            'semester': 'Spring 2025',
            'units': 4,
            'is_active': True
        }
        
        if existing_course:
            # Update existing course
            print(f"Updating existing CS61B course...")
            existing_course.name = course_data['name']
            existing_course.description = course_data['description']
            existing_course.instructor = course_data['instructor']
            existing_course.semester = course_data['semester']
            existing_course.units = course_data['units']
            existing_course.is_active = course_data['is_active']
            
            try:
                db.session.commit()
                print(f"✅ Successfully updated CS61B course information:")
                print(f"   Name: {course_data['name']}")
                print(f"   Instructor: {course_data['instructor']}")
                print(f"   Semester: {course_data['semester']}")
                print(f"   Units: {course_data['units']}")
                print(f"   Description: {course_data['description'][:100]}...")
                return True
            except Exception as e:
                print(f"❌ Error updating CS61B course: {e}")
                db.session.rollback()
                return False
        else:
            # Create new course
            print(f"Creating new CS61B course...")
            new_course = Course(**course_data)
            
            try:
                db.session.add(new_course)
                db.session.commit()
                print(f"✅ Successfully created CS61B course:")
                print(f"   Name: {course_data['name']}")
                print(f"   Instructor: {course_data['instructor']}")
                print(f"   Semester: {course_data['semester']}")
                print(f"   Units: {course_data['units']}")
                print(f"   Description: {course_data['description'][:100]}...")
                return True
            except Exception as e:
                print(f"❌ Error creating CS61B course: {e}")
                db.session.rollback()
                return False

def main():
    """Main function to run the update"""
    print("🔄 Updating CS61B course information...")
    print("📚 Source: https://sp25.datastructur.es/")
    print("=" * 60)
    
    success = update_cs61b_info()
    
    if success:
        print("=" * 60)
        print("✅ CS61B course information updated successfully!")
        print("\n📋 Course Details:")
        print("   • Course Code: CS61B")
        print("   • Course Name: Data Structures and Algorithms")
        print("   • Instructors: Justin Yokota, Josh Hug")
        print("   • Semester: Spring 2025")
        print("   • Units: 4")
        print("   • Website: https://sp25.datastructur.es/")
        print("   • Prerequisites: CS61A")
        return 0
    else:
        print("=" * 60)
        print("❌ Failed to update CS61B course information!")
        return 1

if __name__ == "__main__":
    exit(main())
