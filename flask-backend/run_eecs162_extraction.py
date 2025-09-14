#!/usr/bin/env python3
"""
Script to run lecture PDF extraction for EECS162 weeks
"""

import os
import sys
from lecture_pdf_extraction import generate_study_guide_from_pdf

def main():
    # Reference PDF for style (using NLP_notes.pdf as reference)
    reference_pdf = "../NLP_notes.pdf"
    
    # Process weeks 1-12 (based on the folder structure I see)
    for week in range(1, 13):
        week_folder = f"../EECS162/W{week}"
        output_folder = f"../EECS162_New/W{week}"
        
        print(f"Processing Week {week}...")
        
        # Check if week folder exists and has PDFs
        if not os.path.exists(week_folder):
            print(f"  Week {week} folder not found, skipping...")
            continue
            
        # Check if there are any PDF files in the week folder
        pdf_files = [f for f in os.listdir(week_folder) if f.endswith('.pdf')]
        if not pdf_files:
            print(f"  No PDF files found in Week {week}, skipping...")
            continue
            
        print(f"  Found {len(pdf_files)} PDF file(s): {', '.join(pdf_files)}")
        
        try:
            # Create output folder if it doesn't exist
            os.makedirs(output_folder, exist_ok=True)
            
            # Generate study guide
            study_guide = generate_study_guide_from_pdf(week_folder, reference_pdf)
            
            # Extract the markdown content from the study guide
            if isinstance(study_guide, dict) and 'study_guide' in study_guide:
                markdown_content = study_guide['study_guide']
            else:
                markdown_content = str(study_guide)
            
            # Save study guide as markdown file
            with open(os.path.join(output_folder, "study_guide.md"), "w", encoding="utf-8") as f:
                f.write(markdown_content)
            
            # Save metadata
            from datetime import datetime
            import json
            metadata = {
                "week": week,
                "source_folder": week_folder,
                "pdf_files": pdf_files,
                "reference_pdf": reference_pdf,
                "generated_at": datetime.now().isoformat()
            }
            
            with open(os.path.join(output_folder, "metadata.json"), "w") as f:
                json.dump(metadata, f, indent=2)
            
            print(f"  ✓ Week {week} completed successfully")
            
        except Exception as e:
            print(f"  ✗ Week {week} failed: {str(e)}")
            continue
    
    print("EECS162 extraction completed!")

if __name__ == "__main__":
    main()
