#!/usr/bin/env python3
"""
Manual Course Setup Script

This script helps set up courses manually when automatic downloading doesn't work.
It creates the directory structure and provides guidance for adding materials.

Usage:
    python manual_course_setup.py <COURSE_CODE>
    
Example:
    python manual_course_setup.py CS61A
"""

import os
import sys
import argparse
from pathlib import Path
import json

# Add current directory to path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from course_data import COURSE_WEBSITES, get_course_info

def create_manual_course_structure(course_code: str):
    """Create a manual course structure with detailed instructions"""
    course_code = course_code.upper()
    
    print(f"🔧 Setting up manual course structure for {course_code}")
    
    # Check if course exists
    if course_code not in COURSE_WEBSITES:
        print(f"❌ Course {course_code} not found in course database")
        return False
    
    course_info = get_course_info(course_code)
    print(f"📚 Course: {course_code}")
    print(f"🌐 Website: {course_info['website']}")
    print(f"📂 Category: {course_info['category']}")
    
    # Create directories in the main CourseMate folder
    course_dir = Path(f"../{course_code}")
    course_new_dir = Path(f"../{course_code}_New")
    
    course_dir.mkdir(exist_ok=True)
    course_new_dir.mkdir(exist_ok=True)
    
    # Create week directories and instruction files
    for week in range(1, 16):
        week_dir = course_dir / f"W{week}"
        week_new_dir = course_new_dir / f"W{week}"
        
        week_dir.mkdir(exist_ok=True)
        week_new_dir.mkdir(exist_ok=True)
        
        # Create instruction file for each week
        instruction_file = week_dir / "INSTRUCTIONS.txt"
        with open(instruction_file, 'w') as f:
            f.write(f"INSTRUCTIONS FOR {course_code} WEEK {week}\n")
            f.write("=" * 50 + "\n\n")
            f.write("1. Add your lecture materials to this directory:\n")
            f.write("   - PDF files (lecture slides, notes, handouts)\n")
            f.write("   - PowerPoint files (.ppt, .pptx)\n")
            f.write("   - Word documents (.doc, .docx)\n")
            f.write("   - Any other relevant materials\n\n")
            f.write("2. Name your files clearly:\n")
            f.write("   - lecture_1.pdf\n")
            f.write("   - slides_1.pdf\n")
            f.write("   - notes_1.pdf\n")
            f.write("   - etc.\n\n")
            f.write("3. After adding materials, run:\n")
            f.write(f"   python lecture_pdf_extraction.py {course_code}\n\n")
            f.write("4. This will generate study guides in the {course_code}_New/ directory\n\n")
            f.write("5. For frontend integration, create:\n")
            f.write(f"   nextjs-frontend/src/app/api/{course_code.lower()}/content/[week]/route.ts\n")
        
        # Create placeholder study guide
        study_guide_path = week_new_dir / "study_guide.md"
        if not study_guide_path.exists():
            with open(study_guide_path, 'w') as f:
                f.write(f"# Week {week} Study Guide\n\n")
                f.write(f"## Key Concepts\n\n")
                f.write(f"- Add key concepts for {course_code} Week {week}\n")
                f.write(f"- This will be populated after running PDF extraction\n\n")
                f.write(f"## Examples and Explanations\n\n")
                f.write(f"- Add detailed examples here\n")
                f.write(f"- Include step-by-step explanations\n")
        
        # Create placeholder metadata
        metadata_path = week_new_dir / "metadata.json"
        if not metadata_path.exists():
            metadata = {
                "week": week,
                "course": course_code,
                "title": f"Week {week} Materials",
                "description": f"Lecture materials for {course_code} Week {week}",
                "topics": [],
                "difficulty": "intermediate",
                "estimated_time": "60 minutes"
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
    
    # Create main instruction file
    main_instruction = course_dir / "SETUP_INSTRUCTIONS.txt"
    with open(main_instruction, 'w') as f:
        f.write(f"MANUAL SETUP INSTRUCTIONS FOR {course_code}\n")
        f.write("=" * 60 + "\n\n")
        f.write("This course structure has been created for manual setup.\n")
        f.write("Follow these steps to add your course materials:\n\n")
        f.write("1. COURSE WEBSITE:\n")
        f.write(f"   {course_info['website']}\n\n")
        f.write("2. ADD MATERIALS:\n")
        f.write("   - Go to each week directory (W1, W2, etc.)\n")
        f.write("   - Add your lecture materials (PDFs, slides, notes)\n")
        f.write("   - See INSTRUCTIONS.txt in each week directory for details\n\n")
        f.write("3. GENERATE STUDY GUIDES:\n")
        f.write(f"   python lecture_pdf_extraction.py {course_code}\n\n")
        f.write("4. FRONTEND INTEGRATION:\n")
        f.write(f"   - Create API route: nextjs-frontend/src/app/api/{course_code.lower()}/content/[week]/route.ts\n")
        f.write(f"   - Update CourseDetail.tsx to include {course_code}\n")
        f.write("   - Test the course in the frontend\n\n")
        f.write("5. TIPS:\n")
        f.write("   - Use clear, descriptive filenames\n")
        f.write("   - Organize materials by week\n")
        f.write("   - Include both slides and notes when available\n")
        f.write("   - Test the PDF extraction after adding materials\n")
    
    print(f"✅ Manual course structure created for {course_code}")
    print(f"📁 Course directory: {course_dir}")
    print(f"📁 Study guides directory: {course_new_dir}")
    print(f"📋 Instructions: {main_instruction}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Set up a course manually with instructions')
    parser.add_argument('course_code', help='Course code (e.g., CS61A, CS188)')
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
    
    success = create_manual_course_structure(args.course_code)
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
