# Course Material Setup Guide

This guide explains how to automatically download lecture materials and create study guides for any course in the CourseMate system.

## Quick Start

### Single Course Setup
```bash
# Set up a single course (downloads materials + generates study guides)
python setup_course.py CS61A

# Skip downloading (if you already have materials)
python setup_course.py CS61A --skip-download

# Skip PDF extraction (if you only want to download materials)
python setup_course.py CS61A --skip-extraction
```

### Multiple Courses Setup
```bash
# Set up all courses in a category
python setup_multiple_courses.py --category "CS Core"

# Set up custom list of courses
python setup_multiple_courses.py --courses "CS61A,CS61B,CS61C"

# Set up ALL courses (use with caution!)
python setup_multiple_courses.py --all
```

### Manual Download Only
```bash
# Just download materials without generating study guides
python course_material_downloader.py CS61A
```

### Manual Setup (When Automatic Download Fails)
```bash
# Create manual course structure with detailed instructions
python manual_course_setup.py CS61A
```

## Available Commands

### List Available Courses
```bash
python setup_course.py --list-courses
```

### List Available Categories
```bash
python setup_multiple_courses.py --list-categories
```

## What Each Script Does

### 1. `course_material_downloader.py`
- Scrapes course websites for lecture materials (PDFs, slides, notes)
- Downloads files and organizes them into week folders (W1, W2, etc.)
- Creates placeholder study guide and metadata files
- Handles different website structures and naming patterns

### 2. `setup_course.py`
- Combines downloading materials and PDF extraction
- Provides a complete course setup in one command
- Shows next steps for frontend integration

### 3. `setup_multiple_courses.py`
- Batch processes multiple courses
- Supports category-based setup
- Includes delays between courses to be respectful to servers

### 4. `manual_course_setup.py`
- Creates course structure when automatic downloading fails
- Provides detailed instructions for manual material addition
- Generates placeholder study guides and metadata

## Directory Structure Created

For each course (e.g., CS61A), the scripts create:

```
CS61A/                    # Raw downloaded materials
├── W1/
│   ├── lecture_1.pdf
│   └── slides_1.pdf
├── W2/
│   └── lecture_2.pdf
└── ...

CS61A_New/               # Processed study guides
├── W1/
│   ├── study_guide.md
│   └── metadata.json
├── W2/
│   ├── study_guide.md
│   └── metadata.json
└── ...
```

## Supported Course Websites

The scripts can handle various types of course websites:

- **Standard course pages** with lecture links
- **GitHub repositories** with materials
- **Course management systems** (Canvas, etc.)
- **Direct PDF links** and file downloads
- **Nested directory structures**

## Common Patterns Detected

The scripts automatically detect lecture materials using these patterns:

- `lecture 1`, `week 1`, `class 1`, `session 1`
- `lec1`, `w1`, `c1`, `s1`
- File extensions: `.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`
- Keywords: `lecture`, `week`, `class`, `notes`, `slides`, `handout`

## Troubleshooting

### No Materials Found
- Check if the course website is accessible
- Some courses may have restricted access
- Try running with `--verbose` flag for more details
- Use `manual_course_setup.py` to create structure for manual material addition

### Download Failures
- Network issues or server timeouts
- Some files may be behind authentication
- Check the logs for specific error messages

### PDF Extraction Issues
- Ensure you have the required dependencies installed
- Check that PDF files are not corrupted
- Some PDFs may be image-based and harder to process

## Next Steps After Setup

1. **Check downloaded materials** in the `{COURSE}/` directory
2. **Review generated study guides** in the `{COURSE}_New/` directory
3. **Create frontend API route** for the new course
4. **Update CourseDetail.tsx** to include the new course
5. **Test the course** in the frontend

## Example Workflow

```bash
# 1. Set up a course
python setup_course.py CS188

# 2. Check the results
ls CS188/          # Raw materials
ls CS188_New/      # Study guides

# 3. Create frontend API route
# Copy and modify: nextjs-frontend/src/app/api/cs162/content/[week]/route.ts
# to: nextjs-frontend/src/app/api/cs188/content/[week]/route.ts

# 4. Update CourseDetail.tsx to include CS188 in supported courses

# 5. Test in frontend
```

## Tips

- **Start small**: Test with one course first
- **Check results**: Always verify downloaded materials
- **Be patient**: Large courses may take time to download
- **Respect servers**: The scripts include delays between requests
- **Backup**: Keep copies of important materials

## Dependencies

Make sure you have these Python packages installed:

```bash
pip install requests beautifulsoup4 pathlib
```

The scripts will automatically install other required dependencies as needed.
