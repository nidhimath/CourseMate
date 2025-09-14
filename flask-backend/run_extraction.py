from lecture_pdf_extraction import generate_study_guide_from_pdf
import json
import os
from pathlib import Path

# Process each week
for week in range(1, 16):
    week_folder = f"../cs162/w{week}"
    output_folder = f"../CS162_New/W{week}"
    
    if os.path.exists(week_folder):
        print(f"Processing Week {week}...")
        
        # Create output directory
        Path(output_folder).mkdir(parents=True, exist_ok=True)
        
        # Generate study guide
        result = generate_study_guide_from_pdf(
            pdf_folder=week_folder,
            reference_path="../NLP_notes.pdf"
        )
        
        if result["success"]:
            # Save JSON
            with open(f"{output_folder}/study_guide.json", 'w') as f:
                json.dump(result["study_guide"], f, indent=2)
            
            # Save metadata
            with open(f"{output_folder}/metadata.json", 'w') as f:
                json.dump({
                    "week": week,
                    "pdfs_processed": result["metadata"].get("pdfs_processed", 0),
                    "claude_output_file": result["output_file"]
                }, f, indent=2)
            
            print(f"Week {week} completed successfully!")
        else:
            print(f"Week {week} failed: {result.get('error')}")
    else:
        print(f"Week {week} folder not found, skipping...")
