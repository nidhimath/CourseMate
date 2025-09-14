#!/usr/bin/env python3
"""
Wget-Style PDF Downloader

This script mimics wget functionality to recursively download all PDF files
from course websites, similar to: wget -r -A pdf http://example.com

Usage:
    python wget_style_downloader.py <COURSE_CODE>
    
Example:
    python wget_style_downloader.py CS61A
    python wget_style_downloader.py CS188
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
from typing import List, Dict, Optional, Set
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import queue

# Import course data
from course_data import COURSE_WEBSITES, get_course_info

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WgetStyleDownloader:
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
        
        # Thread-safe tracking
        self.visited_urls = set()
        self.downloaded_files = set()
        self.lock = threading.Lock()
        
        # URL queue for crawling
        self.url_queue = queue.Queue()
        self.pdf_queue = queue.Queue()
        
        # Domain restriction
        self.base_domain = urlparse(self.base_url).netloc
        
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
    
    def is_same_domain(self, url: str) -> bool:
        """Check if URL is from the same domain"""
        try:
            parsed = urlparse(url)
            return parsed.netloc == self.base_domain
        except:
            return False
    
    def is_pdf_url(self, url: str) -> bool:
        """Check if URL points to a PDF file"""
        url_lower = url.lower()
        return url_lower.endswith('.pdf')
    
    def extract_week_number(self, url: str, text: str = "") -> Optional[int]:
        """Extract week number from URL or text"""
        combined = f"{url} {text}".lower()
        
        # Common patterns
        patterns = [
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
            r'/(\d+)/',
            r'(\d+)\.pdf',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, combined)
            if match:
                try:
                    week_num = int(match.group(1))
                    if 1 <= week_num <= 15:  # Reasonable week range
                        return week_num
                except ValueError:
                    continue
        
        return None
    
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
    
    def crawl_page(self, url: str):
        """Crawl a single page for links and PDFs"""
        soup = self.get_page_content(url)
        if not soup:
            return
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            # Convert relative URLs to absolute
            full_url = urljoin(url, href)
            
            # Skip if not same domain
            if not self.is_same_domain(full_url):
                continue
            
            # Check if it's a PDF
            if self.is_pdf_url(full_url):
                self.pdf_queue.put((full_url, text))
            else:
                # Add to crawl queue if not visited
                with self.lock:
                    if full_url not in self.visited_urls:
                        self.url_queue.put(full_url)
    
    def download_pdf_worker(self):
        """Worker thread for downloading PDFs"""
        while True:
            try:
                url, text = self.pdf_queue.get(timeout=5)
                
                # Extract week number
                week_num = self.extract_week_number(url, text)
                if not week_num:
                    week_num = 1  # Default to week 1
                
                # Generate filename
                parsed_url = urlparse(url)
                filename = os.path.basename(parsed_url.path)
                
                if not filename or not filename.endswith('.pdf'):
                    filename = f"lecture_{len(self.downloaded_files)}.pdf"
                
                # Create week directory if it doesn't exist
                week_dir = self.course_dir / f"W{week_num}"
                week_dir.mkdir(exist_ok=True)
                
                filepath = week_dir / filename
                
                # Skip if already downloaded
                with self.lock:
                    if str(filepath) in self.downloaded_files:
                        continue
                    self.downloaded_files.add(str(filepath))
                
                # Download the file
                if self.download_pdf(url, filepath):
                    time.sleep(0.5)  # Be respectful to the server
                
                self.pdf_queue.task_done()
                
            except queue.Empty:
                break
            except Exception as e:
                logger.error(f"Error in download worker: {e}")
                self.pdf_queue.task_done()
    
    def crawl_worker(self):
        """Worker thread for crawling pages"""
        while True:
            try:
                url = self.url_queue.get(timeout=5)
                self.crawl_page(url)
                self.url_queue.task_done()
            except queue.Empty:
                break
            except Exception as e:
                logger.error(f"Error in crawl worker: {e}")
                self.url_queue.task_done()
    
    def run(self, max_workers: int = 5):
        """Main execution function"""
        logger.info(f"Starting wget-style download for {self.course_code}")
        
        if not self.base_url:
            logger.error(f"No website URL found for {self.course_code}")
            return False
        
        # Create directories
        self.create_directories()
        
        # Add starting URL to queue
        self.url_queue.put(self.base_url)
        
        # Start worker threads
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Start crawl workers
            crawl_futures = [executor.submit(self.crawl_worker) for _ in range(2)]
            
            # Start download workers
            download_futures = [executor.submit(self.download_pdf_worker) for _ in range(3)]
            
            # Wait for all tasks to complete
            self.url_queue.join()
            self.pdf_queue.join()
            
            # Cancel remaining futures
            for future in crawl_futures + download_futures:
                future.cancel()
        
        # Create placeholder study guides
        for week in range(1, 16):
            self.create_placeholder_study_guide(week)
        
        logger.info(f"Download completed for {self.course_code}")
        logger.info(f"Downloaded {len(self.downloaded_files)} PDF files")
        return True
    
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

def main():
    parser = argparse.ArgumentParser(description='Wget-style recursive PDF downloader for course websites')
    parser.add_argument('course_code', help='Course code (e.g., CS61A, CS188)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    parser.add_argument('--workers', type=int, default=5, help='Number of worker threads (default: 5)')
    
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
    downloader = WgetStyleDownloader(args.course_code)
    success = downloader.run(max_workers=args.workers)
    
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
