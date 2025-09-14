#!/usr/bin/env python3
"""
Reformat CS61B Study Guides

This script reformats the CS61B study guides to have better structure
for the frontend lesson parsing system.

Usage:
    python reformat_cs61b_guides.py
"""

import os
import re
from pathlib import Path

def reformat_study_guide(content: str, week: int) -> str:
    """Reformat a study guide to have better structure for frontend parsing."""
    
    lines = content.split('\n')
    reformatted_lines = []
    
    # Remove the intro line if it exists
    if lines and "Here's a" in lines[0]:
        lines = lines[1:]
    
    # Remove empty lines at the start
    while lines and not lines[0].strip():
        lines = lines[1:]
    
    # Process each line
    for line in lines:
        line = line.strip()
        
        # Skip empty lines at the beginning
        if not line and not reformatted_lines:
            continue
            
        # Convert main headers (##) to lesson headers
        if line.startswith('## '):
            title = line.replace('## ', '').strip()
            # Clean up the title
            title = re.sub(r'^(Data Structures|Java|Sorting|Algorithms?)\s*[-:]?\s*', '', title, flags=re.IGNORECASE)
            reformatted_lines.append(f"## {title}")
            
        # Convert subheaders (###) to Key Learnings sections
        elif line.startswith('### '):
            title = line.replace('### ', '').strip()
            reformatted_lines.append(f"### Key Learnings: {title}")
            
        # Convert comparison tables to Examples section
        elif line.startswith('|') and '|' in line:
            if not any('Examples' in l for l in reformatted_lines[-5:]):
                reformatted_lines.append("### Examples and Explanations")
            reformatted_lines.append(line)
            
        # Convert bullet points under Key Learnings
        elif line.startswith('- ') or line.startswith('* '):
            # If we're in a Key Learnings section, keep as is
            if any('Key Learnings' in l for l in reformatted_lines[-3:]):
                reformatted_lines.append(line)
            else:
                # Otherwise, start a new Key Learnings section
                if not any('Key Learnings' in l for l in reformatted_lines[-5:]):
                    reformatted_lines.append("### Key Learnings")
                reformatted_lines.append(line)
                
        # Convert numbered lists to Examples
        elif re.match(r'^\d+\.', line):
            if not any('Examples' in l for l in reformatted_lines[-5:]):
                reformatted_lines.append("### Examples and Explanations")
            reformatted_lines.append(line)
            
        # Convert bold text lines to Key Learnings
        elif line.startswith('**') and line.endswith('**'):
            if not any('Key Learnings' in l for l in reformatted_lines[-5:]):
                reformatted_lines.append("### Key Learnings")
            reformatted_lines.append(f"- {line}")
            
        # Regular paragraphs go to Examples
        elif line and not line.startswith('#'):
            if not any('Examples' in l for l in reformatted_lines[-5:]):
                reformatted_lines.append("### Examples and Explanations")
            reformatted_lines.append(line)
            
        else:
            reformatted_lines.append(line)
    
    # Join lines and clean up
    result = '\n'.join(reformatted_lines)
    
    # Remove multiple consecutive empty lines
    result = re.sub(r'\n\s*\n\s*\n', '\n\n', result)
    
    # Ensure we have proper structure
    if not result.strip():
        result = f"# Week {week} Study Guide\n\n## Key Concepts\n\n- Placeholder content for CS61B Week {week}\n\n## Examples and Explanations\n\n- Detailed examples will be added here"
    
    return result.strip()

def main():
    """Main function to reformat all CS61B study guides."""
    cs61b_new_dir = Path("../CS61B_New")
    
    if not cs61b_new_dir.exists():
        print("CS61B_New directory not found!")
        return
    
    print("🔄 Reformatting CS61B study guides...")
    
    for week_dir in sorted(cs61b_new_dir.glob("W*")):
        if not week_dir.is_dir():
            continue
            
        week_num = week_dir.name[1:]  # Remove 'W' prefix
        study_guide_path = week_dir / "study_guide.md"
        
        if not study_guide_path.exists():
            print(f"⚠️  No study guide found for {week_dir.name}")
            continue
            
        print(f"📝 Reformatting {week_dir.name}...")
        
        # Read current content
        with open(study_guide_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Reformat content
        reformatted_content = reformat_study_guide(original_content, int(week_num))
        
        # Write back
        with open(study_guide_path, 'w', encoding='utf-8') as f:
            f.write(reformatted_content)
        
        print(f"✅ Reformatted {week_dir.name}")
    
    print("🎉 All CS61B study guides have been reformatted!")

if __name__ == "__main__":
    main()
