#!/usr/bin/env python3
"""
Google Slides PDF Downloader for CS61B

This script downloads PDFs from Google Slides presentations found on the CS61B website.
It extracts Google Slides URLs and converts them to PDF download links.

Usage:
    python google_slides_downloader.py CS61B
    
Example:
    python google_slides_downloader.py CS61B
"""

import os
import sys
import re
import requests
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup
import time
from pathlib import Path
import argparse
from typing import List, Dict, Optional, Set
import logging

# Import course data
from course_data import COURSE_WEBSITES, get_course_info

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GoogleSlidesDownloader:
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
        
        # Google Slides patterns
        self.google_slides_patterns = [
            r'https://docs\.google\.com/presentation/d/([a-zA-Z0-9_-]+)',
            r'https://docs\.google\.com/presentation/d/([a-zA-Z0-9_-]+)/edit',
            r'https://docs\.google\.com/presentation/d/([a-zA-Z0-9_-]+)/present'
        ]
        
        # Week patterns
        self.week_patterns = [
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
        
        for pattern in self.week_patterns:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    week_num = int(match.group(1))
                    if 1 <= week_num <= 15:  # Reasonable week range
                        return week_num
                except ValueError:
                    continue
        
        return None
    
    def find_google_slides_links(self, soup: BeautifulSoup, base_url: str) -> List[tuple]:
        """Find all Google Slides links on a page"""
        slides_links = []
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            # Convert relative URLs to absolute
            full_url = urljoin(base_url, href)
            
            # Check if it's a Google Slides link
            for pattern in self.google_slides_patterns:
                match = re.search(pattern, full_url)
                if match:
                    slides_id = match.group(1)
                    slides_links.append((full_url, text, slides_id))
                    break
        
        return slides_links
    
    def convert_slides_to_pdf_url(self, slides_url: str, slides_id: str) -> str:
        """Convert Google Slides URL to PDF download URL"""
        # Google Slides PDF export URL format
        pdf_url = f"https://docs.google.com/presentation/d/{slides_id}/export/pdf"
        return pdf_url
    
    def download_pdf(self, url: str, filepath: Path) -> bool:
        """Download a PDF file"""
        try:
            logger.info(f"Downloading PDF: {url}")
            response = self.session.get(url, timeout=60)
            response.raise_for_status()
            
            # Check if it's actually a PDF
            content_type = response.headers.get('content-type', '').lower()
            if 'pdf' not in content_type and not url.lower().endswith('.pdf'):
                logger.warning(f"URL doesn't appear to be a PDF: {url}")
                return False
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Downloaded: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return False
    
    def scrape_course_website(self) -> Dict[int, List[tuple]]:
        """Scrape the course website for Google Slides links"""
        if not self.base_url:
            logger.error(f"No website found for {self.course_code}")
            return {}
        
        logger.info(f"Scraping course website: {self.base_url}")
        
        # Get main page
        soup = self.get_page_content(self.base_url)
        if not soup:
            return {}
        
        # Find Google Slides links
        slides_links = self.find_google_slides_links(soup, self.base_url)
        
        # Group by week
        week_materials = {}
        for url, text, slides_id in slides_links:
            week_num = self.extract_week_number(text) or self.extract_week_number(url)
            if week_num:
                if week_num not in week_materials:
                    week_materials[week_num] = []
                week_materials[week_num].append((url, text, slides_id))
        
        # Also check common subdirectories for more slides
        common_paths = [
            '/labs/', '/lectures/', '/slides/', '/materials/',
            '/homeworks/', '/projects/', '/resources/'
        ]
        
        for path in common_paths:
            sub_url = urljoin(self.base_url, path)
            sub_soup = self.get_page_content(sub_url)
            if sub_soup:
                sub_links = self.find_google_slides_links(sub_soup, sub_url)
                for url, text, slides_id in sub_links:
                    week_num = self.extract_week_number(text) or self.extract_week_number(url)
                    if week_num:
                        if week_num not in week_materials:
                            week_materials[week_num] = []
                        week_materials[week_num].append((url, text, slides_id))
        
        return week_materials
    
    def download_week_materials(self, week_num: int, materials: List[tuple]):
        """Download materials for a specific week"""
        week_dir = self.course_dir / f"W{week_num}"
        
        logger.info(f"Downloading materials for week {week_num}")
        
        for i, (url, text, slides_id) in enumerate(materials, 1):
            # Convert to PDF URL
            pdf_url = self.convert_slides_to_pdf_url(url, slides_id)
            
            # Generate filename
            filename = f"lecture_{i}_{slides_id}.pdf"
            filepath = week_dir / filename
            
            # Skip if file already exists
            if filepath.exists():
                logger.info(f"File already exists: {filepath}")
                continue
            
            # Download the file
            if self.download_pdf(pdf_url, filepath):
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
        logger.info(f"Starting Google Slides download for {self.course_code}")
        
        if not self.base_url:
            logger.error(f"No website URL found for {self.course_code}")
            return False
        
        # Create directories
        self.create_directories()
        
        # Scrape course website
        week_materials = self.scrape_course_website()
        
        if not week_materials:
            logger.warning(f"No Google Slides found for {self.course_code}")
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
    parser = argparse.ArgumentParser(description='Download PDFs from Google Slides for course websites')
    parser.add_argument('course_code', help='Course code (e.g., CS61B)')
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
    downloader = GoogleSlidesDownloader(args.course_code)
    success = downloader.run()
    
    if success:
        logger.info(f"Successfully downloaded Google Slides PDFs for {args.course_code}")
        logger.info(f"Next steps:")
        logger.info(f"1. Check the {args.course_code}/ directory for downloaded PDFs")
        logger.info(f"2. Run PDF extraction: python simple_week_processor.py {args.course_code}")
        logger.info(f"3. Update the frontend to include {args.course_code} support")
        return 0
    else:
        logger.error(f"Failed to download Google Slides PDFs for {args.course_code}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
