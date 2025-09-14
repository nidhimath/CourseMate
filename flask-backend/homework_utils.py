"""
Homework processing utilities for generating structured learning exercises from PDF files
"""

import anthropic
import base64
import json
import re
import os
from datetime import datetime

def create_learning_exercises(pdf_path):
    """Create structured exercises and notes for each problem part"""
    # Initialize the Claude client
    api_key = os.getenv('ANTHROPIC_API_KEY')
    client = anthropic.Anthropic(api_key=api_key)
    
    # Read and encode the PDF
    with open(pdf_path, "rb") as pdf_file:
        pdf_data = pdf_file.read()
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
    
    # Create the message with PDF attachment
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_base64
                        }
                    },
                    {
                        "type": "text",
                        "text": """
                        Prompt:

Break down the following homework assignment (algorithms/CS domain) into structured learning materials. Emphasize the problem-solving process — identifying key information and asking guiding questions.

Use this EXACT markdown format:

# Problem Set 3: [Title]

## Problem 1: [Title] ([Points] points)

### Learning Notes

**Core Concepts:**
- [Concept 1 with explanation]
- [Concept 2 with explanation]

**Key Tradeoffs:**
- [Tradeoff 1 with explanation]
- [Tradeoff 2 with explanation]

### Problem Breakdown

#### Part (a): [Description]
**Key Information:**
- [Constraint 1]
- [Constraint 2]

**Leading Questions:**
1. [Question 1 guiding thought process]
2. [Question 2 guiding toward candidate approaches]
3. [Question 3 testing correctness/efficiency intuition]

#### Part (b): [Description]
**Key Information:**
- [Constraint 1]
- [Constraint 2]

**Leading Questions:**
1. [Question 1]
2. [Question 2]
3. [Question 3]

## Check Your Understanding

[Conceptual or extension questions testing whether the student can generalize the approach]

Constraints:

Every problem part must include both Key Information and exactly 3 Leading Questions.

Keep explanations concise and problem-solving–oriented.

Do not provide final solutions unless explicitly required.
                        """
                    }
                ]
            }
        ]
    )
    
    return message.content[0].text

def turn_exercises_into_json(content):
    """Turn the exercises into a JSON object"""
    
    # Initialize the JSON structure
    exercises_data = {
        "title": "Problem Set 3: Binary Trees and Data Structure Design - Structured Exercises",
        "problems": []
    }
    
    # Split content by problem sections using markdown headers
    problems = re.split(r'## Problem \d+:', content)
    
    for i, problem_section in enumerate(problems[1:], 1):  # Skip first empty split
        problem_data = parse_problem_section(problem_section, i)
        if problem_data:
            exercises_data["problems"].append(problem_data)
    
    return exercises_data

def parse_problem_section(section, problem_num):
    """Parse a single problem section"""
    
    lines = section.strip().split('\n')
    
    # Extract problem title and points from first line
    title_line = lines[0].strip()
    title_match = re.match(r'^(.+?)\s*\((\d+)\s*points?\)', title_line)
    
    if title_match:
        title = title_match.group(1).strip()
        points = int(title_match.group(2))
    else:
        title = title_line
        points = 0
    
    problem_data = {
        "number": problem_num,
        "title": title,
        "points": points,
        "learning_notes": {},
        "parts": [],
        "check_understanding": ""
    }
    
    # Parse the rest of the section
    current_part = None
    current_section = None
    current_list = []
    
    for line in lines[1:]:
        line = line.strip()
        
        if not line:
            continue
            
        # Learning Notes section
        if line.startswith('### Learning Notes'):
            current_section = 'learning_notes'
            continue
        elif line.startswith('**Core Concepts:**'):
            current_section = 'learning_notes'
            problem_data['learning_notes']['core_concepts'] = []
            current_list = problem_data['learning_notes']['core_concepts']
            continue
        elif line.startswith('**Key Tradeoffs:**'):
            current_section = 'learning_notes'
            problem_data['learning_notes']['key_tradeoffs'] = []
            current_list = problem_data['learning_notes']['key_tradeoffs']
            continue
        
        # Problem Breakdown section
        elif line.startswith('### Problem Breakdown'):
            current_section = 'problem_breakdown'
            continue
        elif line.startswith('#### Part ('):
            # Save previous part if exists
            if current_part:
                problem_data['parts'].append(current_part)
            
            # Start new part
            part_match = re.match(r'#### Part \((\w+)\):\s*(.+)', line)
            if part_match:
                current_part = {
                    "letter": part_match.group(1),
                    "description": part_match.group(2).strip(),
                    "key_information": [],
                    "leading_questions": []
                }
            continue
        elif line.startswith('**Key Information:**'):
            if current_part:
                current_part['key_information'] = []
                current_list = current_part['key_information']
            continue
        elif line.startswith('**Leading Questions:**'):
            if current_part:
                current_part['leading_questions'] = []
                current_list = current_part['leading_questions']
            continue
        
        # Check Your Understanding section
        elif line.startswith('## Check Your Understanding'):
            current_section = 'check_understanding'
            continue
        
        # Add content to current list
        elif line.startswith('- ') and current_list is not None:
            current_list.append(line[2:].strip())
        elif line.startswith(('1. ', '2. ', '3. ', '4. ', '5. ')) and current_list is not None:
            current_list.append(line[3:].strip())
        elif current_section == 'check_understanding' and line:
            problem_data['check_understanding'] += line + ' '
    
    # Add the last part
    if current_part:
        problem_data['parts'].append(current_part)
    
    # Clean up check understanding
    problem_data['check_understanding'] = problem_data['check_understanding'].strip()
    
    return problem_data

def process_homework_pdf(pdf_path, filename):
    """Process a homework PDF and return structured exercises data"""
    try:
        # Generate learning exercises
        print(f"Processing homework PDF: {pdf_path}")
        exercises_content = create_learning_exercises(pdf_path)
        
        # Convert to JSON
        print("Converting to JSON...")
        json_data = turn_exercises_into_json(exercises_content)
        
        # Add metadata
        json_data["metadata"] = {
            "source_file": filename,
            "uploaded_at": datetime.utcnow().isoformat(),
            "total_problems": len(json_data["problems"])
        }
        
        return json_data
        
    except Exception as e:
        print(f"Error processing homework PDF: {str(e)}")
        raise e
