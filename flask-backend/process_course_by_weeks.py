#!/usr/bin/env python3
"""
Process Course by Weeks

This script processes a course folder and generates study guides for each week
by running PDF extraction on each week's materials separately.

Usage:
    python process_course_by_weeks.py <COURSE_CODE>
    
Example:
    python process_course_by_weeks.py CS61A
"""

import os
import sys
import json
from pathlib import Path
import argparse
from typing import List, Dict, Any

# Import the PDF extraction class
from lecture_pdf_extraction import PDFContentOrganizer

def process_week(week_folder: Path, course_code: str, week_num: int) -> bool:
    """Process a single week's PDFs and generate study guide."""
    print(f"Processing {week_folder.name}...")
    
    pdf_files = list(week_folder.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {week_folder.name}")
        return False
    
    print(f"Found {len(pdf_files)} PDFs in {week_folder.name}")
    
    # Create a temporary folder for this week
    temp_week_folder = Path(f"temp_{course_code}_{week_folder.name}")
    temp_week_folder.mkdir(exist_ok=True)
    
    try:
        # Copy PDFs to temp folder
        for pdf_file in pdf_files:
            import shutil
            shutil.copy2(pdf_file, temp_week_folder / pdf_file.name)
        
        # Process with PDF extraction
        organizer = PDFContentOrganizer()
        
        # Extract content from temp folder
        success = organizer.extract_content(str(temp_week_folder))
        
        if not success:
            print(f"Failed to extract content from {week_folder.name}")
            return False
        
        # Send to Claude and save
        instruction = f"""
        You are an educational content assistant. I will provide you with content extracted from PDFs for {course_code} Week {week_num}, including text sections and markdown-formatted tables. Your task is to create **Khan Academy-style study notes**.

        Requirements:

        1. Organize the content into **clear sections and subsections** using headings (##, ###).  
        2. Summarize text into **short, digestible bullet points**.  
        3. Include **markdown tables only if they are relevant** to the concept being explained. Do not insert unrelated tables.   
        4. Ignore any images for now.  
        5. Include a small "Key Points" summary at the end of each major section.  
        6. Keep explanations **concise, educational, and easy to follow**, like Khan Academy notes.  
        7. If table entries use `<br>` tags, you may keep them as-is or convert them into lists inside the cell for readability.
        8. Focus on the core concepts and learning objectives for this week.

        Here is the content:
        """
        
        output_file = organizer.send_to_claude_and_save(instruction)
        
        # Read the generated content
        with open(output_file, 'r') as f:
            claude_response = json.load(f)
        
        # Extract the study guide content
        study_guide_content = ""
        if "study_guide" in claude_response and claude_response["study_guide"]:
            study_guide_content = claude_response["study_guide"]
        elif "content" in claude_response and claude_response["content"]:
            # If it's the new format, extract from content
            if isinstance(claude_response["content"], list) and len(claude_response["content"]) > 0:
                study_guide_content = claude_response["content"][0].get("text", "")
        
        # Save study guide to the course_new folder
        course_new_folder = Path(f"{course_code}_New")
        week_new_folder = course_new_folder / week_folder.name
        week_new_folder.mkdir(parents=True, exist_ok=True)
        
        study_guide_file = week_new_folder / "study_guide.md"
        with open(study_guide_file, 'w') as f:
            f.write(study_guide_content)
        
        # Create metadata
        metadata = {
            "week": week_num,
            "course": course_code,
            "title": f"Week {week_num} Study Guide",
            "description": f"Study guide for {course_code} Week {week_num}",
            "topics": [],
            "difficulty": "intermediate",
            "estimated_time": "60 minutes",
            "pdf_count": len(pdf_files),
            "pdf_files": [f.name for f in pdf_files]
        }
        
        metadata_file = week_new_folder / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Generated study guide for {week_folder.name}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {week_folder.name}: {e}")
        return False
    
    finally:
        # Clean up temp folder
        import shutil
        if temp_week_folder.exists():
            shutil.rmtree(temp_week_folder)

def process_course(course_code: str) -> bool:
    """Process all weeks in a course."""
    course_folder = Path(course_code)
    if not course_folder.exists():
        print(f"Course folder {course_code} not found")
        return False
    
    # Find all week folders
    week_folders = sorted([f for f in course_folder.iterdir() 
                          if f.is_dir() and f.name.startswith('W')])
    
    if not week_folders:
        print(f"No week folders found in {course_code}")
        return False
    
    print(f"Processing {len(week_folders)} weeks for {course_code}")
    
    success_count = 0
    for week_folder in week_folders:
        # Extract week number
        week_num = int(week_folder.name[1:])  # Remove 'W' prefix
        
        if process_week(week_folder, course_code, week_num):
            success_count += 1
    
    print(f"\n🎉 Completed! Generated study guides for {success_count}/{len(week_folders)} weeks")
    return success_count > 0

def main():
    parser = argparse.ArgumentParser(description='Process course PDFs week by week and generate study guides')
    parser.add_argument('course_code', help='Course code (e.g., CS61A, CS188)')
    
    args = parser.parse_args()
    
    course_code = args.course_code.upper()
    print(f"🚀 Processing course: {course_code}")
    
    success = process_course(course_code)
    
    if success:
        print(f"\n✅ Successfully processed {course_code}")
        print(f"📁 Study guides saved in {course_code}_New/ directory")
        print(f"🔧 Next steps:")
        print(f"1. Create API route: nextjs-frontend/src/app/api/{course_code.lower()}/content/[week]/route.ts")
        print(f"2. Update CourseDetail.tsx to include {course_code}")
        print(f"3. Test the course in the frontend")
        return 0
    else:
        print(f"❌ Failed to process {course_code}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
