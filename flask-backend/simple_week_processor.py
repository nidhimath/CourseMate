#!/usr/bin/env python3
"""
Simple Week Processor

This script processes each week's PDFs individually and generates study guides.

Usage:
    python simple_week_processor.py <COURSE_CODE>
    
Example:
    python simple_week_processor.py CS61A
"""

import os
import sys
import json
from pathlib import Path
import argparse
from typing import List, Dict, Any
import pymupdf
from dotenv import load_dotenv
import anthropic

def extract_pdf_content(pdf_path: Path) -> str:
    """Extract text content from a single PDF."""
    try:
        doc = pymupdf.open(pdf_path)
        content_parts = [f"# PDF: {pdf_path.stem}\n\n"]
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text().strip()
            if text:
                content_parts.append(f"## Page {page_num + 1}\n\n{text}\n\n")
        
        doc.close()
        return "".join(content_parts)
    except Exception as e:
        print(f"Error extracting content from {pdf_path}: {e}")
        return ""

def send_to_claude(content: str, course_code: str, week_num: int) -> str:
    """Send content to Claude and get study guide."""
    load_dotenv()
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
    
    client = anthropic.Anthropic(api_key=api_key)
    
    instruction = f"""
    You are an educational content assistant. I will provide you with content extracted from PDFs for {course_code} Week {week_num}. Your task is to create **Khan Academy-style study notes**.

    Requirements:

    1. Organize the content into **clear sections and subsections** using headings (##, ###).  
    2. Summarize text into **short, digestible bullet points**.  
    3. Include **markdown tables only if they are relevant** to the concept being explained. Do not insert unrelated tables.   
    4. Ignore any images for now.  
    5. Include a small "Key Points" summary at the end of each major section.  
    6. Keep explanations **concise, educational, and easy to follow**, like Khan Academy notes.  
    7. Focus on the core concepts and learning objectives for this week.

    Here is the content:
    {content}
    """
    
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            messages=[{"role": "user", "content": instruction}]
        )
        
        return response.content[0].text
    except Exception as e:
        print(f"Error calling Claude API: {e}")
        return f"# Week {week_num} Study Guide\n\nError generating study guide: {e}"

def process_week(week_folder: Path, course_code: str, week_num: int) -> bool:
    """Process a single week's PDFs and generate study guide."""
    print(f"Processing {week_folder.name}...")
    
    pdf_files = list(week_folder.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {week_folder.name}")
        return False
    
    print(f"Found {len(pdf_files)} PDFs in {week_folder.name}")
    
    # Extract content from all PDFs
    all_content = []
    for pdf_file in pdf_files:
        content = extract_pdf_content(pdf_file)
        if content:
            all_content.append(content)
    
    if not all_content:
        print(f"No content extracted from {week_folder.name}")
        return False
    
    # Combine all content
    combined_content = "\n\n".join(all_content)
    
    # Send to Claude
    print(f"Generating study guide for {week_folder.name}...")
    study_guide = send_to_claude(combined_content, course_code, week_num)
    
    # Save study guide in the main CourseMate folder
    course_new_folder = Path(f"../{course_code}_New")
    week_new_folder = course_new_folder / week_folder.name
    week_new_folder.mkdir(parents=True, exist_ok=True)
    
    study_guide_file = week_new_folder / "study_guide.md"
    with open(study_guide_file, 'w') as f:
        f.write(study_guide)
    
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

def process_course(course_code: str) -> bool:
    """Process all weeks in a course."""
    course_folder = Path(f"../{course_code}")
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
