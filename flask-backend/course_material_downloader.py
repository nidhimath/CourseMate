#!/usr/bin/env python3
"""
Course Material Downloader

This script downloads lecture materials from course websites and organizes them
into the same folder structure as CS162, CS170, and EECS126.

Usage:
    python course_material_downloader.py <COURSE_CODE>
    
Example:
    python course_material_downloader.py CS61A
    python course_material_downloader.py CS188
"""

import os
import sys
import re
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time
from pathlib import Path
import argparse
from typing import List, Dict, Optional, Tuple
import logging

# Import course data
from course_data import COURSE_WEBSITES, get_course_info

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CourseMaterialDownloader:
    def __init__(self, course_code: str):
        self.course_code = course_code.upper()
        self.course_info = get_course_info(self.course_code)
        self.base_url = self.course_info.get('website', '')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Create course directories in the main CourseMate folder
        self.course_dir = Path(f"../{self.course_code}")
        self.course_new_dir = Path(f"../{self.course_code}_New")
        
        # Common patterns for lecture materials
        self.lecture_patterns = [
            r'lecture\s*(\d+)',
            r'week\s*(\d+)',
            r'class\s*(\d+)',
            r'session\s*(\d+)',
            r'day\s*(\d+)',
            r'(\d+)\s*lecture',
            r'(\d+)\s*week',
            r'(\d+)\s*class',
            r'(\d+)\s*session',
            r'(\d+)\s*day',
            r'lec(\d+)',
            r'w(\d+)',
            r'c(\d+)',
            r's(\d+)',
            r'd(\d+)',
        ]
        
        # File extensions to look for
        self.target_extensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx']
        
    def create_directories(self):
        """Create the course directory structure"""
        logger.info(f"Creating directories for {self.course_code}")
        
        # Create main course directory
        self.course_dir.mkdir(exist_ok=True)
        
        # Create course_new directory
        self.course_new_dir.mkdir(exist_ok=True)
        
        # Create week directories (W1-W15)
        for week in range(1, 16):
            week_dir = self.course_dir / f"W{week}"
            week_new_dir = self.course_new_dir / f"W{week}"
            week_dir.mkdir(exist_ok=True)
            week_new_dir.mkdir(exist_ok=True)
            
        logger.info(f"Created directory structure for {self.course_code}")
    
    def get_page_content(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage"""
        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_week_number(self, text: str) -> Optional[int]:
        """Extract week number from text using various patterns"""
        text_lower = text.lower()
        
        for pattern in self.lecture_patterns:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    week_num = int(match.group(1))
                    if 1 <= week_num <= 15:  # Reasonable week range
                        return week_num
                except ValueError:
                    continue
        
        return None
    
    def is_lecture_material(self, url: str, text: str) -> bool:
        """Check if a link is likely lecture material"""
        url_lower = url.lower()
        text_lower = text.lower()
        
        # Check for target file extensions
        if any(url_lower.endswith(ext) for ext in self.target_extensions):
            return True
        
        # Check for lecture-related keywords
        lecture_keywords = [
            'lecture', 'week', 'class', 'session', 'notes', 'slides',
            'handout', 'material', 'reading', 'assignment', 'homework'
        ]
        
        return any(keyword in text_lower for keyword in lecture_keywords)
    
    def download_file(self, url: str, filepath: Path) -> bool:
        """Download a file from URL"""
        try:
            logger.info(f"Downloading: {url}")
            response = self.session.get(url, timeout=60)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Downloaded: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return False
    
    def find_lecture_links(self, soup: BeautifulSoup, base_url: str) -> List[Tuple[str, str, int]]:
        """Find all lecture material links on a page"""
        links = []
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            # Convert relative URLs to absolute
            full_url = urljoin(base_url, href)
            
            # Check if it's lecture material
            if self.is_lecture_material(full_url, text):
                week_num = self.extract_week_number(text) or self.extract_week_number(href)
                if week_num:
                    links.append((full_url, text, week_num))
        
        return links
    
    def scrape_course_website(self) -> Dict[int, List[Tuple[str, str]]]:
        """Scrape the course website for lecture materials"""
        if not self.base_url:
            logger.error(f"No website found for {self.course_code}")
            return {}
        
        logger.info(f"Scraping course website: {self.base_url}")
        
        # Get main page
        soup = self.get_page_content(self.base_url)
        if not soup:
            return {}
        
        # Find lecture links
        lecture_links = self.find_lecture_links(soup, self.base_url)
        
        # Group by week
        week_materials = {}
        for url, text, week_num in lecture_links:
            if week_num not in week_materials:
                week_materials[week_num] = []
            week_materials[week_num].append((url, text))
        
        # Also check common subdirectories
        common_paths = [
            '/lectures/', '/lecture/', '/slides/', '/notes/', '/materials/',
            '/handouts/', '/readings/', '/assignments/', '/homework/',
            '/schedule/', '/calendar/', '/syllabus/'
        ]
        
        for path in common_paths:
            sub_url = urljoin(self.base_url, path)
            sub_soup = self.get_page_content(sub_url)
            if sub_soup:
                sub_links = self.find_lecture_links(sub_soup, sub_url)
                for url, text, week_num in sub_links:
                    if week_num not in week_materials:
                        week_materials[week_num] = []
                    week_materials[week_num].append((url, text))
        
        # If no materials found, try course-specific approaches
        if not week_materials:
            week_materials = self.try_course_specific_scraping(soup)
        
        return week_materials
    
    def try_course_specific_scraping(self, soup: BeautifulSoup) -> Dict[int, List[Tuple[str, str]]]:
        """Try course-specific scraping approaches for different types of course websites"""
        week_materials = {}
        
        # CS61A specific: Look for lecture videos and notes
        if self.course_code == "CS61A":
            logger.info("Trying CS61A-specific scraping...")
            # Look for lecture links in the main content
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True)
                
                # Look for lecture patterns
                if any(keyword in text.lower() for keyword in ['lecture', 'video', 'notes', 'slides']):
                    # Try to extract week number from text
                    week_num = self.extract_week_number(text) or self.extract_week_number(href)
                    if week_num:
                        full_url = urljoin(self.base_url, href)
                        if week_num not in week_materials:
                            week_materials[week_num] = []
                        week_materials[week_num].append((full_url, text))
        
        # CS188 specific: Look for lecture slides
        elif self.course_code == "CS188":
            logger.info("Trying CS188-specific scraping...")
            # CS188 often has lecture slides in specific formats
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True)
                
                if any(ext in href.lower() for ext in ['.pdf', '.ppt', '.pptx']):
                    week_num = self.extract_week_number(text) or self.extract_week_number(href)
                    if week_num:
                        full_url = urljoin(self.base_url, href)
                        if week_num not in week_materials:
                            week_materials[week_num] = []
                        week_materials[week_num].append((full_url, text))
        
        # Generic approach: Look for any PDFs or lecture-related content
        else:
            logger.info("Trying generic scraping approach...")
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True)
                
                # Look for any files that might be lecture materials
                if any(ext in href.lower() for ext in ['.pdf', '.ppt', '.pptx', '.doc', '.docx']):
                    week_num = self.extract_week_number(text) or self.extract_week_number(href)
                    if week_num:
                        full_url = urljoin(self.base_url, href)
                        if week_num not in week_materials:
                            week_materials[week_num] = []
                        week_materials[week_num].append((full_url, text))
        
        return week_materials
    
    def download_week_materials(self, week_num: int, materials: List[Tuple[str, str]]):
        """Download materials for a specific week"""
        week_dir = self.course_dir / f"W{week_num}"
        
        logger.info(f"Downloading materials for week {week_num}")
        
        for i, (url, text) in enumerate(materials, 1):
            # Determine file extension
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)
            
            if not filename or '.' not in filename:
                # Generate filename based on content
                ext = '.pdf'  # Default to PDF
                filename = f"lecture_{i}{ext}"
            
            filepath = week_dir / filename
            
            # Skip if file already exists
            if filepath.exists():
                logger.info(f"File already exists: {filepath}")
                continue
            
            # Download the file
            if self.download_file(url, filepath):
                time.sleep(1)  # Be respectful to the server
    
    def create_placeholder_study_guide(self, week_num: int):
        """Create placeholder study guide and metadata files"""
        week_new_dir = self.course_new_dir / f"W{week_num}"
        
        # Create placeholder study guide
        study_guide_path = week_new_dir / "study_guide.md"
        if not study_guide_path.exists():
            with open(study_guide_path, 'w') as f:
                f.write(f"# Week {week_num} Study Guide\n\n")
                f.write(f"## Key Concepts\n\n")
                f.write(f"- Placeholder content for {self.course_code} Week {week_num}\n")
                f.write(f"- This will be populated after running PDF extraction\n\n")
                f.write(f"## Examples and Explanations\n\n")
                f.write(f"- Detailed examples will be added here\n")
                f.write(f"- Step-by-step explanations will be provided\n")
        
        # Create placeholder metadata
        metadata_path = week_new_dir / "metadata.json"
        if not metadata_path.exists():
            import json
            metadata = {
                "week": week_num,
                "course": self.course_code,
                "title": f"Week {week_num} Materials",
                "description": f"Lecture materials for {self.course_code} Week {week_num}",
                "topics": [],
                "difficulty": "intermediate",
                "estimated_time": "60 minutes"
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
    
    def run(self):
        """Main execution function"""
        logger.info(f"Starting download for {self.course_code}")
        
        if not self.base_url:
            logger.error(f"No website URL found for {self.course_code}")
            return False
        
        # Create directories
        self.create_directories()
        
        # Scrape course website
        week_materials = self.scrape_course_website()
        
        if not week_materials:
            logger.warning(f"No lecture materials found for {self.course_code}")
            # Create placeholder structure anyway
            for week in range(1, 16):
                self.create_placeholder_study_guide(week)
            return True
        
        # Download materials for each week
        for week_num, materials in week_materials.items():
            if 1 <= week_num <= 15:  # Valid week range
                self.download_week_materials(week_num, materials)
                self.create_placeholder_study_guide(week_num)
        
        # Create placeholder files for weeks without materials
        for week in range(1, 16):
            if week not in week_materials:
                self.create_placeholder_study_guide(week)
        
        logger.info(f"Download completed for {self.course_code}")
        return True

def main():
    parser = argparse.ArgumentParser(description='Download course materials and create folder structure')
    parser.add_argument('course_code', help='Course code (e.g., CS61A, CS188)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate course code
    if args.course_code.upper() not in COURSE_WEBSITES:
        logger.error(f"Course {args.course_code} not found in course database")
        logger.info("Available courses:")
        for course in sorted(COURSE_WEBSITES.keys()):
            logger.info(f"  {course}")
        return 1
    
    # Run downloader
    downloader = CourseMaterialDownloader(args.course_code)
    success = downloader.run()
    
    if success:
        logger.info(f"Successfully created folder structure for {args.course_code}")
        logger.info(f"Next steps:")
        logger.info(f"1. Check the {args.course_code}/ directory for downloaded materials")
        logger.info(f"2. Run PDF extraction: python lecture_pdf_extraction.py {args.course_code}")
        logger.info(f"3. Update the frontend to include {args.course_code} support")
        return 0
    else:
        logger.error(f"Failed to download materials for {args.course_code}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
