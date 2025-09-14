#!/usr/bin/env python3
"""
Course Setup Help Script

This script provides an interactive help system for setting up courses.
It guides users through the different options available.

Usage:
    python course_setup_help.py
"""

import os
import sys
from pathlib import Path

# Add current directory to path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from course_data import COURSE_WEBSITES, COURSE_CATEGORIES

def show_main_menu():
    """Show the main help menu"""
    print("🎓 CourseMate Course Setup Help")
    print("=" * 50)
    print()
    print("Choose an option:")
    print("1. Set up a single course automatically")
    print("2. Set up multiple courses (batch)")
    print("3. Set up a course manually")
    print("4. List all available courses")
    print("5. Show setup examples")
    print("6. Exit")
    print()

def show_single_course_help():
    """Show help for single course setup"""
    print("📚 Single Course Setup")
    print("-" * 30)
    print()
    print("Automatic setup (recommended):")
    print("  python setup_course.py <COURSE_CODE>")
    print()
    print("Examples:")
    print("  python setup_course.py CS61A")
    print("  python setup_course.py CS188")
    print("  python setup_course.py EECS126")
    print()
    print("Options:")
    print("  --skip-download    Skip downloading materials")
    print("  --skip-extraction  Skip PDF extraction")
    print("  --list-courses     List all available courses")
    print()
    print("Manual setup (when automatic fails):")
    print("  python manual_course_setup.py <COURSE_CODE>")
    print()

def show_batch_setup_help():
    """Show help for batch setup"""
    print("📚 Batch Course Setup")
    print("-" * 30)
    print()
    print("Set up all courses in a category:")
    print("  python setup_multiple_courses.py --category \"CS Core\"")
    print()
    print("Set up custom list of courses:")
    print("  python setup_multiple_courses.py --courses \"CS61A,CS61B,CS61C\"")
    print()
    print("Set up ALL courses (use with caution!):")
    print("  python setup_multiple_courses.py --all")
    print()
    print("List available categories:")
    print("  python setup_multiple_courses.py --list-categories")
    print()

def show_manual_setup_help():
    """Show help for manual setup"""
    print("📚 Manual Course Setup")
    print("-" * 30)
    print()
    print("When to use manual setup:")
    print("- Course website doesn't have downloadable materials")
    print("- Materials are behind authentication")
    print("- You want to add materials from other sources")
    print()
    print("Create manual structure:")
    print("  python manual_course_setup.py <COURSE_CODE>")
    print()
    print("Then:")
    print("1. Add materials to week directories (W1, W2, etc.)")
    print("2. Run PDF extraction: python lecture_pdf_extraction.py <COURSE_CODE>")
    print("3. Create frontend API route")
    print("4. Update CourseDetail.tsx")
    print()

def list_all_courses():
    """List all available courses"""
    print("📚 All Available Courses")
    print("-" * 30)
    print()
    
    for category, courses in COURSE_CATEGORIES.items():
        print(f"{category}:")
        for course in courses:
            if course in COURSE_WEBSITES:
                print(f"  - {course}")
        print()

def show_examples():
    """Show practical examples"""
    print("📚 Setup Examples")
    print("-" * 30)
    print()
    
    print("Example 1: Set up CS61A (automatic)")
    print("  python setup_course.py CS61A")
    print("  # Downloads materials and generates study guides")
    print()
    
    print("Example 2: Set up CS188 (automatic)")
    print("  python setup_course.py CS188")
    print("  # Downloads lecture slides and creates study guides")
    print()
    
    print("Example 3: Set up all CS Core courses")
    print("  python setup_multiple_courses.py --category \"CS Core\"")
    print("  # Sets up CS61A, CS61B, CS61C, CS70")
    print()
    
    print("Example 4: Manual setup for CS61A")
    print("  python manual_course_setup.py CS61A")
    print("  # Creates structure, then manually add materials")
    print()
    
    print("Example 5: Just download materials (no extraction)")
    print("  python setup_course.py CS61A --skip-extraction")
    print("  # Downloads materials but doesn't generate study guides")
    print()

def main():
    """Main interactive help system"""
    while True:
        show_main_menu()
        
        try:
            choice = input("Enter your choice (1-6): ").strip()
            
            if choice == "1":
                show_single_course_help()
            elif choice == "2":
                show_batch_setup_help()
            elif choice == "3":
                show_manual_setup_help()
            elif choice == "4":
                list_all_courses()
            elif choice == "5":
                show_examples()
            elif choice == "6":
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1-6.")
            
            input("\nPress Enter to continue...")
            print("\n" + "="*50 + "\n")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
