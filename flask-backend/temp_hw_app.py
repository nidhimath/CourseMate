#!/usr/bin/env python3
"""
Flask API for generating structured learning exercises from PDF files
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import base64
import json
import re
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    points_match = re.search(r'\((\d+)\s*points?\)', title_line)
    points = int(points_match.group(1)) if points_match else 0
    
    # Clean title (remove points from title)
    title = re.sub(r'\s*\(\d+\s*points?\)', '', title_line).strip()
    
    problem_data = {
        "problem_number": problem_num,
        "title": title,
        "points": points,
        "learning_notes": {
            "core_concepts": [],
            "key_tradeoffs": []
        },
        "problem_breakdown": []
    }
    
    current_section = None
    current_part = None
    
    for line in lines[1:]:
        line = line.strip()
        
        if line.startswith('### Learning Notes'):
            current_section = 'learning_notes'
            continue
        elif line.startswith('### Problem Breakdown'):
            current_section = 'problem_breakdown'
            continue
        elif line.startswith('## Check Your Understanding'):
            current_section = 'check_understanding'
            break
        elif line.startswith('#### Part ('):
            # Extract part letter and description
            part_match = re.search(r'#### Part \(([a-z])\):\s*(.+)', line)
            if part_match:
                part_letter = part_match.group(1)
                part_description = part_match.group(2)
                current_part = {
                    "part": part_letter,
                    "description": part_description,
                    "key_information": [],
                    "leading_questions": []
                }
                problem_data["problem_breakdown"].append(current_part)
            continue
        elif line.startswith('**Key Information:**'):
            continue
        elif line.startswith('**Leading Questions:**'):
            continue
        elif line.startswith('**Core Concepts:**'):
            continue
        elif line.startswith('**Key Tradeoffs:**'):
            continue
        elif not line:
            continue
        
        # Process content based on current section
        if current_section == 'learning_notes':
            if line.startswith('- '):
                concept = line[2:].strip()
                # Check if we're in core concepts or key tradeoffs section
                section_text = section
                if '**Core Concepts:**' in section_text and '**Key Tradeoffs:**' in section_text:
                    # Find which section this line belongs to
                    core_start = section_text.find('**Core Concepts:**')
                    tradeoffs_start = section_text.find('**Key Tradeoffs:**')
                    line_pos = section_text.find(line)
                    
                    if core_start < line_pos < tradeoffs_start:
                        problem_data["learning_notes"]["core_concepts"].append(concept)
                    elif line_pos > tradeoffs_start:
                        problem_data["learning_notes"]["key_tradeoffs"].append(concept)
                else:
                    # Default to core concepts if we can't determine
                    problem_data["learning_notes"]["core_concepts"].append(concept)
        elif current_section == 'problem_breakdown' and current_part:
            if line.startswith('- '):
                info = line[2:].strip()
                current_part["key_information"].append(info)
            elif line.startswith(('1. ', '2. ', '3. ', '4. ', '5. ')):
                question = line[3:].strip()
                current_part["leading_questions"].append(question)
    
    # Add check your understanding questions
    check_understanding_section = re.search(r'## Check Your Understanding\n(.*?)(?=\n\n|\Z)', section, re.DOTALL)
    if check_understanding_section:
        check_text = check_understanding_section.group(1)
        questions = []
        for line in check_text.split('\n'):
            line = line.strip()
            if line.startswith(('1. ', '2. ', '3. ', '4. ')):
                question = re.sub(r'^\d+\.\s*\*\*(.+?)\*\*:\s*(.+)', r'\1: \2', line[3:].strip())
                questions.append(question)
        problem_data["check_understanding"] = questions
    
    return problem_data

@app.route('/')
def home():
    """Home endpoint with API documentation"""
    return jsonify({
        "message": "Learning Exercises API",
        "version": "1.0.0",
        "endpoints": {
            "/generate": "POST - Generate structured learning exercises from PDF",
            "/health": "GET - Health check"
        },
        "usage": {
            "method": "POST",
            "url": "/generate",
            "body": {
                "filepath": "path/to/your/pdf/file.pdf"
            }
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/generate', methods=['POST'])
def generate_exercises():
    """Generate structured learning exercises from PDF filepath"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'filepath' not in data:
            return jsonify({
                "error": "Missing 'filepath' in request body",
                "example": {
                    "filepath": "path/to/your/pdf/file.pdf"
                }
            }), 400
        
        filepath = data['filepath']
        
        # Check if file exists
        if not os.path.exists(filepath):
            return jsonify({
                "error": f"File not found: {filepath}",
                "message": "Please provide a valid file path"
            }), 404
        
        # Check if file is a PDF
        if not filepath.lower().endswith('.pdf'):
            return jsonify({
                "error": "File must be a PDF",
                "message": "Only PDF files are supported"
            }), 400
        
        # Generate learning exercises
        print(f"Processing PDF: {filepath}")
        exercises_content = create_learning_exercises(filepath)
        
        # Convert to JSON
        print("Converting to JSON...")
        json_data = turn_exercises_into_json(exercises_content)
        
        # Add metadata
        json_data["metadata"] = {
            "source_file": filepath,
            "generated_at": "2024-01-01T00:00:00Z",  # You can add actual timestamp
            "total_problems": len(json_data["problems"])
        }
        
        return jsonify({
            "success": True,
            "data": json_data,
            "message": f"Successfully generated {len(json_data['problems'])} problems"
        })
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload a PDF file and generate exercises"""
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({
                "error": "No file provided",
                "message": "Please include a PDF file in the 'file' field"
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                "error": "No file selected",
                "message": "Please select a PDF file to upload"
            }), 400
        
        # Check if file is allowed
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Invalid file type",
                "message": "Only PDF files are allowed"
            }), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Generate learning exercises
        print(f"Processing uploaded PDF: {filepath}")
        exercises_content = create_learning_exercises(filepath)
        
        # Convert to JSON
        print("Converting to JSON...")
        json_data = turn_exercises_into_json(exercises_content)
        
        # Add metadata
        json_data["metadata"] = {
            "source_file": filename,
            "uploaded_at": "2024-01-01T00:00:00Z",  # You can add actual timestamp
            "total_problems": len(json_data["problems"])
        }
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            "success": True,
            "data": json_data,
            "message": f"Successfully processed {filename} and generated {len(json_data['problems'])} problems"
        })
        
    except Exception as e:
        print(f"Error processing upload: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500