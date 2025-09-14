#!/usr/bin/env python3
"""
Fix CS61B Study Guides

This script creates properly structured study guides for CS61B
that will display well in the frontend.

Usage:
    python fix_cs61b_guides.py
"""

import os
import re
from pathlib import Path

def create_structured_guide(original_content: str, week: int) -> str:
    """Create a properly structured study guide."""
    
    lines = original_content.split('\n')
    
    # Extract main topics from the original content
    main_topics = []
    current_topic = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        
        # Skip intro lines
        if "Here's a" in line or "Khan Academy" in line:
            continue
            
        # Main headers (##)
        if line.startswith('## '):
            if current_topic:
                main_topics.append({
                    'title': current_topic,
                    'content': '\n'.join(current_content)
                })
            current_topic = line.replace('## ', '').strip()
            current_content = []
            
        # Subheaders (###) - these become key learnings
        elif line.startswith('### '):
            if current_topic:
                current_content.append(line)
            else:
                # If no main topic, create one
                current_topic = f"Week {week} Concepts"
                current_content.append(line)
                
        # Regular content
        elif line:
            current_content.append(line)
    
    # Add the last topic
    if current_topic:
        main_topics.append({
            'title': current_topic,
            'content': '\n'.join(current_content)
        })
    
    # If no topics found, create a default structure
    if not main_topics:
        return f"""# Week {week} Study Guide

## Key Concepts

### Key Learnings
- Core concepts for CS61B Week {week}
- Fundamental data structures and algorithms
- Java programming principles

### Examples and Explanations
- Detailed examples and step-by-step explanations
- Code snippets and implementation details
- Common patterns and best practices"""

    # Create structured content
    structured_lines = []
    
    for i, topic in enumerate(main_topics):
        # Create lesson header
        structured_lines.append(f"## {topic['title']}")
        structured_lines.append("")
        
        # Parse the content into Key Learnings and Examples
        content_lines = topic['content'].split('\n')
        key_learnings = []
        examples = []
        current_section = None
        
        for line in content_lines:
            line = line.strip()
            if not line:
                continue
                
            # Subheaders become key learnings
            if line.startswith('### '):
                key_learnings.append(line.replace('### ', ''))
                current_section = 'key_learnings'
                
            # Bullet points
            elif line.startswith('- ') or line.startswith('* '):
                if current_section == 'key_learnings' or not examples:
                    key_learnings.append(line)
                else:
                    examples.append(line)
                    
            # Numbered lists
            elif re.match(r'^\d+\.', line):
                examples.append(line)
                
            # Bold text
            elif line.startswith('**') and line.endswith('**'):
                key_learnings.append(f"- {line}")
                
            # Tables
            elif line.startswith('|'):
                examples.append(line)
                
            # Regular text
            else:
                examples.append(line)
        
        # Add Key Learnings section
        if key_learnings:
            structured_lines.append("### Key Learnings")
            for item in key_learnings:
                if not item.startswith('- '):
                    structured_lines.append(f"- {item}")
                else:
                    structured_lines.append(item)
            structured_lines.append("")
        
        # Add Examples section
        if examples:
            structured_lines.append("### Examples and Explanations")
            for item in examples:
                structured_lines.append(item)
            structured_lines.append("")
    
    return '\n'.join(structured_lines)

def main():
    """Main function to fix all CS61B study guides."""
    cs61b_new_dir = Path("../CS61B_New")
    
    if not cs61b_new_dir.exists():
        print("CS61B_New directory not found!")
        return
    
    print("🔧 Fixing CS61B study guides...")
    
    for week_dir in sorted(cs61b_new_dir.glob("W*")):
        if not week_dir.is_dir():
            continue
            
        week_num = week_dir.name[1:]  # Remove 'W' prefix
        study_guide_path = week_dir / "study_guide.md"
        
        if not study_guide_path.exists():
            print(f"⚠️  No study guide found for {week_dir.name}")
            continue
            
        print(f"📝 Fixing {week_dir.name}...")
        
        # Read current content
        with open(study_guide_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Create structured content
        structured_content = create_structured_guide(original_content, int(week_num))
        
        # Write back
        with open(study_guide_path, 'w', encoding='utf-8') as f:
            f.write(structured_content)
        
        print(f"✅ Fixed {week_dir.name}")
    
    print("🎉 All CS61B study guides have been fixed!")

if __name__ == "__main__":
    main()
