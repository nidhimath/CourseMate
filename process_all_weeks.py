#!/usr/bin/env python3

import os
import sys
import json
from pathlib import Path
from flask_backend.lecture_pdf_extraction import generate_study_guide_from_pdf

def process_all_weeks():
    """Process all weeks from w1 to w15 and save JSON outputs to CS162_New"""
    
    # Base paths
    cs162_folder = Path("cs162")
    cs162_new_folder = Path("CS162_New")
    reference_pdf = "NLP_notes.pdf"
    
    # Ensure CS162_New exists
    cs162_new_folder.mkdir(exist_ok=True)
    
    # Process each week
    for week_num in range(1, 16):  # w1 to w15
        week_folder = cs162_folder / f"w{week_num}"
        output_folder = cs162_new_folder / f"W{week_num}"
        
        if not week_folder.exists():
            print(f"Warning: {week_folder} does not exist, skipping...")
            continue
            
        # Create output folder
        output_folder.mkdir(exist_ok=True)
        
        print(f"Processing Week {week_num}...")
        print(f"  Input folder: {week_folder}")
        print(f"  Output folder: {output_folder}")
        
        try:
            # Generate study guide
            result = generate_study_guide_from_pdf(
                pdf_folder=str(week_folder),
                reference_path=reference_pdf
            )
            
            if result["success"]:
                # Save the study guide JSON
                study_guide_file = output_folder / "study_guide.json"
                with open(study_guide_file, 'w', encoding='utf-8') as f:
                    json.dump(result["study_guide"], f, indent=2, ensure_ascii=False)
                
                # Save metadata
                metadata_file = output_folder / "metadata.json"
                metadata = {
                    "week": week_num,
                    "pdfs_processed": result["metadata"].get("pdfs_processed", 0),
                    "text_blocks": result["metadata"].get("text_blocks", 0),
                    "image_blocks": result["metadata"].get("image_blocks", 0),
                    "claude_output_file": result["output_file"]
                }
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
                
                print(f"  ✓ Success! Saved to {study_guide_file}")
                print(f"  ✓ Metadata saved to {metadata_file}")
            else:
                print(f"  ✗ Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"  ✗ Error processing Week {week_num}: {str(e)}")
        
        print()  # Empty line for readability
    
    print("Processing complete!")

if __name__ == "__main__":
    process_all_weeks()
