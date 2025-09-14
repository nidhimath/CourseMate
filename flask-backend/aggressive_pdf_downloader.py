#!/usr/bin/env python3
"""
Aggressive PDF Downloader

This script aggressively searches for and downloads all PDF files from course websites.
It uses multiple strategies to find PDFs that might be hidden or in subdirectories.

Usage:
    python aggressive_pdf_downloader.py <COURSE_CODE>
    
Example:
    python aggressive_pdf_downloader.py CS61A
    python aggressive_pdf_downloader.py CS188
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
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Import course data
from course_data import COURSE_WEBSITES, get_course_info

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AggressivePDFDownloader:
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
        
        # Thread-safe sets for tracking
        self.visited_urls = set()
        self.found_pdfs = set()
        self.downloaded_pdfs = set()
        self.lock = threading.Lock()
        
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
            r'chapter\s*(\d+)',
            r'ch(\d+)',
            r'part\s*(\d+)',
            r'(\d+)',
        ]
        
        # PDF-related keywords
        self.pdf_keywords = [
            'lecture', 'week', 'class', 'session', 'notes', 'slides',
            'handout', 'material', 'reading', 'assignment', 'homework',
            'lab', 'tutorial', 'recitation', 'discussion', 'review',
            'exam', 'quiz', 'test', 'solution', 'answer'
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
            with self.lock:
                if url in self.visited_urls:
                    return None
                self.visited_urls.add(url)
            
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
    
    def is_pdf_url(self, url: str) -> bool:
        """Check if URL points to a PDF file"""
        url_lower = url.lower()
        return url_lower.endswith('.pdf') or 'pdf' in url_lower
    
    def is_lecture_related(self, url: str, text: str) -> bool:
        """Check if a link is likely lecture material"""
        url_lower = url.lower()
        text_lower = text.lower()
        
        # Check for PDF extension
        if self.is_pdf_url(url):
            return True
        
        # Check for lecture-related keywords
        return any(keyword in text_lower for keyword in self.pdf_keywords)
    
    def find_all_links(self, soup: BeautifulSoup, base_url: str) -> List[tuple]:
        """Find all links on a page"""
        links = []
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            # Convert relative URLs to absolute
            full_url = urljoin(base_url, href)
            
            # Skip if already visited
            if full_url in self.visited_urls:
                continue
            
            links.append((full_url, text))
        
        return links
    
    def find_pdf_links(self, soup: BeautifulSoup, base_url: str) -> List[tuple]:
        """Find all PDF links on a page"""
        pdf_links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            # Convert relative URLs to absolute
            full_url = urljoin(base_url, href)
            
            # Check if it's a PDF
            if self.is_pdf_url(full_url):
                pdf_links.append((full_url, text))
        
        return pdf_links
    
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
    
    def crawl_website(self, start_url: str, max_depth: int = 3, current_depth: int = 0) -> Dict[int, List[tuple]]:
        """Recursively crawl website to find all PDFs"""
        if current_depth > max_depth:
            return {}
        
        logger.info(f"Crawling {start_url} (depth {current_depth})")
        
        soup = self.get_page_content(start_url)
        if not soup:
            return {}
        
        week_materials = {}
        
        # Find PDF links on current page
        pdf_links = self.find_pdf_links(soup, start_url)
        for url, text in pdf_links:
            week_num = self.extract_week_number(text) or self.extract_week_number(url)
            if week_num:
                if week_num not in week_materials:
                    week_materials[week_num] = []
                week_materials[week_num].append((url, text))
        
        # Find all links to crawl further
        all_links = self.find_all_links(soup, start_url)
        
        # Filter links that might contain more materials
        relevant_links = []
        for url, text in all_links:
            if self.is_lecture_related(url, text):
                relevant_links.append((url, text))
        
        # Crawl relevant links
        for url, text in relevant_links[:10]:  # Limit to prevent infinite crawling
            sub_materials = self.crawl_website(url, max_depth, current_depth + 1)
            for week, materials in sub_materials.items():
                if week not in week_materials:
                    week_materials[week] = []
                week_materials[week].extend(materials)
        
        return week_materials
    
    def download_week_materials(self, week_num: int, materials: List[tuple]):
        """Download materials for a specific week"""
        week_dir = self.course_dir / f"W{week_num}"
        
        logger.info(f"Downloading materials for week {week_num}")
        
        for i, (url, text) in enumerate(materials, 1):
            # Generate filename
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)
            
            if not filename or not filename.endswith('.pdf'):
                filename = f"lecture_{i}.pdf"
            
            filepath = week_dir / filename
            
            # Skip if file already exists
            if filepath.exists():
                logger.info(f"File already exists: {filepath}")
                continue
            
            # Download the file
            if self.download_pdf(url, filepath):
                time.sleep(0.5)  # Be respectful to the server
    
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
        logger.info(f"Starting aggressive PDF download for {self.course_code}")
        
        if not self.base_url:
            logger.error(f"No website URL found for {self.course_code}")
            return False
        
        # Create directories
        self.create_directories()
        
        # Crawl website for PDFs
        week_materials = self.crawl_website(self.base_url)
        
        if not week_materials:
            logger.warning(f"No PDF materials found for {self.course_code}")
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
    parser = argparse.ArgumentParser(description='Aggressively download all PDFs from course websites')
    parser.add_argument('course_code', help='Course code (e.g., CS61A, CS188)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    parser.add_argument('--max-depth', type=int, default=3, help='Maximum crawl depth (default: 3)')
    
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
    downloader = AggressivePDFDownloader(args.course_code)
    success = downloader.run()
    
    if success:
        logger.info(f"Successfully downloaded PDFs for {args.course_code}")
        logger.info(f"Next steps:")
        logger.info(f"1. Check the {args.course_code}/ directory for downloaded PDFs")
        logger.info(f"2. Run PDF extraction: python lecture_pdf_extraction.py {args.course_code}")
        logger.info(f"3. Update the frontend to include {args.course_code} support")
        return 0
    else:
        logger.error(f"Failed to download PDFs for {args.course_code}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
