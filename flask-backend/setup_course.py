#!/usr/bin/env python3
"""
Course Setup Script

This script provides an easy interface to set up a new course with materials.
It combines downloading materials and running PDF extraction.

Usage:
    python setup_course.py <COURSE_CODE>
    
Example:
    python setup_course.py CS61A
    python setup_course.py CS188
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

# Add current directory to path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from course_data import COURSE_WEBSITES, get_course_info
from course_material_downloader import CourseMaterialDownloader

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def setup_course(course_code: str, skip_download: bool = False, skip_extraction: bool = False):
    """Set up a complete course with materials and study guides"""
    course_code = course_code.upper()
    
    print(f"🚀 Setting up course: {course_code}")
    
    # Check if course exists
    if course_code not in COURSE_WEBSITES:
        print(f"❌ Course {course_code} not found in course database")
        print("Available courses:")
        for course in sorted(COURSE_WEBSITES.keys()):
            print(f"  - {course}")
        return False
    
    course_info = get_course_info(course_code)
    print(f"📚 Course: {course_code}")
    print(f"🌐 Website: {course_info['website']}")
    print(f"📂 Category: {course_info['category']}")
    
    # Step 1: Download materials
    if not skip_download:
        print(f"\n📥 Step 1: Downloading materials for {course_code}")
        downloader = CourseMaterialDownloader(course_code)
        if not downloader.run():
            print(f"❌ Failed to download materials for {course_code}")
            return False
        print(f"✅ Materials downloaded to {course_code}/ directory")
    else:
        print(f"⏭️  Skipping download step")
    
    # Step 2: Run PDF extraction
    if not skip_extraction:
        print(f"\n🧠 Step 2: Generating study guides for {course_code}")
        
        # Check if we have the extraction script
        extraction_script = Path("lecture_pdf_extraction.py")
        if not extraction_script.exists():
            print(f"❌ PDF extraction script not found: {extraction_script}")
            return False
        
        # Check if we have any PDFs to extract
        course_dir = Path(f"../{course_code}")
        has_pdfs = False
        if course_dir.exists():
            for week_dir in course_dir.glob("W*"):
                if week_dir.is_dir():
                    for file in week_dir.glob("*.pdf"):
                        has_pdfs = True
                        break
                if has_pdfs:
                    break
        
        if not has_pdfs:
            print(f"⚠️  No PDF files found in {course_code}/ directory")
            print(f"📝 Study guides will contain placeholder content")
            print(f"💡 You can manually add PDFs to the week directories and re-run extraction")
        else:
            # Run extraction
            if not run_command(f"python lecture_pdf_extraction.py {course_code}", 
                              f"PDF extraction for {course_code}"):
                print(f"⚠️  PDF extraction failed, but placeholder study guides were created")
        
        print(f"✅ Study guides available in {course_code}_New/ directory")
    else:
        print(f"⏭️  Skipping extraction step")
    
    # Step 3: Create API route (optional)
    print(f"\n🔧 Step 3: Next steps for frontend integration")
    print(f"To add {course_code} support to the frontend:")
    print(f"1. Create API route: nextjs-frontend/src/app/api/{course_code.lower()}/content/[week]/route.ts")
    print(f"2. Update CourseDetail.tsx to include {course_code} in supported courses")
    print(f"3. Test the course in the frontend")
    
    print(f"\n🎉 Course setup completed for {course_code}!")
    return True

def main():
    parser = argparse.ArgumentParser(description='Set up a complete course with materials and study guides')
    parser.add_argument('course_code', nargs='?', help='Course code (e.g., CS61A, CS188)')
    parser.add_argument('--skip-download', action='store_true', help='Skip downloading materials')
    parser.add_argument('--skip-extraction', action='store_true', help='Skip PDF extraction')
    parser.add_argument('--list-courses', action='store_true', help='List all available courses')
    
    args = parser.parse_args()
    
    if args.list_courses:
        print("📚 Available courses:")
        for category, courses in {
            "CS Core": ["CS61A", "CS61B", "CS61C", "CS70"],
            "CS Software": ["CS160", "CS161", "CS162", "CS164", "CS168", "CS169"],
            "CS Theory": ["CS170", "CS172", "CS174", "CS176", "CS191"],
            "CS Hardware": ["CS152"],
            "CS Applications": ["CS184", "CS186", "CS188", "CS189"],
            "EE Foundation": ["EECS16A", "EECS16B"],
            "EE Signals": ["EECS120", "EECS123", "EECS126", "EECS127", "EECS145B", "EECS122"],
            "EE Robotics": ["EECS144", "EECS145L", "EECS149", "EECS106A", "EECS106B", "EECS128", "EECS192"],
            "EE Circuits": ["EECS105", "EECS140", "EECS142"],
            "EE Power": ["EECS108", "EECS113", "EECS137A", "EECS137B"],
            "EE Devices": ["EECS130", "EECS134", "EECS143", "EECS147"],
            "EE Optics": ["EECS118"],
            "Physics": ["Physics7B"]
        }.items():
            print(f"\n{category}:")
            for course in courses:
                if course in COURSE_WEBSITES:
                    print(f"  - {course}")
        return 0
    
    if not args.course_code:
        parser.print_help()
        return 1
    
    success = setup_course(args.course_code, args.skip_download, args.skip_extraction)
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
