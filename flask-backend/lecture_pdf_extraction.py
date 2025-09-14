import pymupdf
import json
from dotenv import load_dotenv
import requests
import base64
from pathlib import Path
from typing import List, Dict, Any, Tuple
import cv2
import numpy as np
import os
import tempfile
import shutil

class PDFContentOrganizer:
    """Extract figures, text, and tables from PDF and format for Claude API."""
    
    def __init__(self, output_dir: str = "claude_outputs"):
        self.final_output_dir = Path(output_dir)
        self.final_output_dir.mkdir(exist_ok=True)
        self.extracted_content = []
        
        # Figure extraction settings
        self.zoom_factor = 2.0
        self.min_area = 1000
        self.padding = 20
        
        # Create temporary directory for processing
        self.temp_dir = tempfile.mkdtemp()
    
    def __del__(self):
        """Clean up temporary directory."""
        if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def extract_content(self, course_code: str) -> bool:
        """Extract content from all PDFs in a course folder and format for Claude API."""
        course_folder = Path(course_code)
        if not course_folder.exists():
            print(f"Course folder {course_code} not found")
            return False
        
        # Find all week folders
        week_folders = sorted([f for f in course_folder.iterdir() if f.is_dir() and f.name.startswith('W')])
        
        if not week_folders:
            print(f"No week folders found in {course_code}")
            return False
        
        all_message_content = []
        
        for week_folder in week_folders:
            pdf_paths = sorted(week_folder.glob("*.pdf"))
            if not pdf_paths:
                continue
                
            print(f"Processing {len(pdf_paths)} PDFs in {week_folder.name}")
            
            for pdf_path in pdf_paths:
                try:
                    doc = pymupdf.open(pdf_path)
                    pdf_name = pdf_path.stem
                    
                    text_parts = [f"# PDF: {pdf_name} (Week {week_folder.name})\n\n"]
                    
                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)
                        
                        # Extract text content
                        page_content = f"\n## Page {page_num + 1}\n\n"
                        text = page.get_text().strip()
                        if text:
                            page_content += f"### Text:\n{text}\n\n"
                        
                        # Extract tables
                        tables = page.find_tables()
                        if tables:
                            page_content += "### Tables:\n"
                            for i, table in enumerate(tables):
                                try:
                                    table_data = table.extract()
                                    if table_data:
                                        # Convert to markdown table
                                        markdown_table = self._convert_to_markdown_table(table_data)
                                        page_content += f"\n**Table {i+1}:**\n{markdown_table}\n\n"
                                except Exception as e:
                                    print(f"Error extracting table {i+1} from {pdf_name}: {e}")
                        
                        text_parts.append(page_content)
                    
                    doc.close()
                    all_message_content.extend(text_parts)
                    
                except Exception as e:
                    print(f"Error processing {pdf_path}: {e}")
                    continue
        
        if not all_message_content:
            print(f"No content extracted from {course_code}")
            return False
        
        # Convert to the expected format for Claude API
        combined_text = "".join(all_message_content)
        self.extracted_content = [{"type": "text", "text": combined_text}]
        return True
    
    def _convert_to_markdown_table(self, table_data):
        """Convert table data to markdown format."""
        if not table_data or not table_data[0]:
            return ""
        
        # Create header
        header = "| " + " | ".join(str(cell) for cell in table_data[0]) + " |"
        separator = "| " + " | ".join("---" for _ in table_data[0]) + " |"
        
        # Create rows
        rows = []
        for row in table_data[1:]:
            if row:  # Skip empty rows
                rows.append("| " + " | ".join(str(cell) for cell in row) + " |")
        
        return "\n".join([header, separator] + rows)
    
    def _extract_page_figures(self, page, pdf_name: str, page_num: int) -> List[Dict[str, Any]]:
        """Extract figures from a page using contour detection."""
        # Convert page to image
        matrix = pymupdf.Matrix(self.zoom_factor, self.zoom_factor)
        pix = page.get_pixmap(matrix=matrix)
        img_data = pix.tobytes("png")
        
        # Convert to OpenCV format
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Auto-crop figures
        cropped_figures = self._auto_crop_figures(img)
        
        api_figures = []
        for i, cropped in enumerate(cropped_figures):
            # Convert directly to base64 for API (no permanent saving)
            _, buffer = cv2.imencode('.png', cropped)
            img_base64 = base64.b64encode(buffer).decode()
            
            api_figures.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": img_base64
                }
            })
        
        return api_figures
    
    def _auto_crop_figures(self, img: np.ndarray) -> List[np.ndarray]:
        """Figure detection and cropping logic."""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Threshold and find contours
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        figures = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > self.min_area:  # Filter small noise
                x, y, w, h = cv2.boundingRect(contour)
                
                # Add padding and ensure bounds are within image
                x = max(0, x - self.padding)
                y = max(0, y - self.padding)
                w = min(img.shape[1] - x, w + 2 * self.padding)
                h = min(img.shape[0] - y, h + 2 * self.padding)
                
                cropped = img[y:y+h, x:x+w]
                figures.append(cropped)
        
        return figures
    
    def _extract_tables(self, page) -> List[str]:
        """Extract tables as markdown."""
        tables = []
        for table in page.find_tables():
            try:
                markdown_table = table.to_markdown()
                if markdown_table.strip():
                    tables.append(markdown_table)
            except:
                table_data = table.extract()
                if table_data:
                    markdown_table = self._array_to_markdown(table_data)
                    if markdown_table:
                        tables.append(markdown_table)
        return tables
    
    def _array_to_markdown(self, table_data: List[List[str]]) -> str:
        """Convert 2D array to markdown table."""
        if not table_data or not table_data[0]:
            return ""
        
        header = "| " + " | ".join(str(cell).strip() for cell in table_data[0]) + " |"
        separator = "| " + " | ".join("---" for _ in table_data[0]) + " |"
        
        rows = []
        for row in table_data[1:]:
            row_str = "| " + " | ".join(str(cell).strip() for cell in row) + " |"
            rows.append(row_str)
        
        return "\n".join([header, separator] + rows)
    
    def send_to_claude_and_save(self, instruction: str, model: str = "claude-opus-4-1-20250805") -> str:
        """Send to Claude API and save only the final response."""
        if not hasattr(self, 'extracted_content') or not self.extracted_content:
            raise ValueError("No content extracted. Run extract_content() first.")
        
        # Load API key
        load_dotenv()
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        
        # Create message
        message_content = [
            {
                "type": "text", 
                "text": instruction
            }
        ] + self.extracted_content
        
        message = {
            "role": "user",
            "content": message_content
        }
        
        payload = {
            "model": model,
            "max_tokens": 4000,
            "messages": [message]
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
        
        try:
            # Send request to Claude
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            response_data = response.json()
            
            # Save only the Claude output
            timestamp = __import__('datetime').datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"claude_output_{timestamp}.json"
            filepath = self.final_output_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(response_data, f, indent=2, ensure_ascii=False)
            
            print(f"Claude response saved to: {filepath}")
            return str(filepath)
            
        except requests.exceptions.RequestException as e:
            error_response = {"error": str(e), "timestamp": __import__('datetime').datetime.now().isoformat()}
            filename = f"claude_error_{timestamp}.json"
            filepath = self.final_output_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(error_response, f, indent=2, ensure_ascii=False)
            
            print(f"Error saved to: {filepath}")
            return str(filepath)
    
    def get_extraction_summary(self) -> Dict[str, Any]:
        """Get summary of what was extracted."""
        if not self.extracted_content:
            return {"error": "No content extracted"}
        
        text_blocks = sum(1 for item in self.extracted_content if item["type"] == "text")
        image_blocks = sum(1 for item in self.extracted_content if item["type"] == "image")
        
        return {
            "total_content_blocks": len(self.extracted_content),
            "text_blocks": text_blocks,
            "extracted_figures": image_blocks,
            "temp_files_cleaned_up": True
        }

    def extract_structured_pdf(self, pdf_path: str, max_pages: int = 2):
        """
        Extract structured text info from a PDF using PyMuPDF.
        Returns both the raw text and a style profile.
        """
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        doc = pymupdf.open(pdf_path)
        structured_data = []
        all_text = []

        # Process only the first max_pages
        for page_num in range(min(len(doc), max_pages)):
            page = doc.load_page(page_num)
            page_dict = page.get_text("dict")

            for block in page_dict["blocks"]:
                if block["type"] == 0:  # text block
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text = span["text"].strip()
                            if not text:
                                continue
                            structured_data.append({
                                "text": text,
                                "size": span["size"],
                                "flags": span["flags"],  # 2 = bold, 1 = italic
                                "font": span["font"]
                            })
                            all_text.append(text)

        # Build style profile
        headings = set()
        uses_bullets = False
        uses_tables = False

        for span in structured_data:
            text = span["text"]
            # Detect headings (bold or larger font)
            if span["size"] >= 12 or span["flags"] & 2:
                headings.add(text)
            # Detect bullets
            if text.startswith(("-", "*", "•")):
                uses_bullets = True
            # Detect tables (rough)
            if "|" in text:
                uses_tables = True

        style_profile = {
            "example_headings": list(headings)[:5],  # show up to 5 headings
            "uses_bullets": uses_bullets,
            "uses_tables": uses_tables
        }

        # Combine all text as plain content
        pdf_text = "\n".join(all_text)

        return pdf_text, style_profile

def generate_study_guide_from_pdf(pdf_folder: str, reference_path: str = None) -> Dict[str, Any]:
    """
    Function to convert PDF to Khan Academy-style study guide.
    
    Args:
        pdf_folder (str): Path to the PDF folder
        reference_path (str): Path to the reference pdf (class A)
        
    Returns:
        Dict containing:
        - success (bool): Whether the operation succeeded
        - study_guide (str): The formatted study guide text (markdown)
        - error (str): Error message if failed
        - metadata (dict): Info about extraction (figures, pages, etc.)
    """
    try:
        organizer = PDFContentOrganizer()
        organizer.extract_content(pdf_folder)

        # Get the reference text content and style profile
        if not reference_path:
            reference_path = "reference.pdf"
        reference_content, style_profile = organizer.extract_structured_pdf(reference_path, 2)

        # Send to Claude and get the output file path
        instruction = f"""
            You are an expert educational content assistant. I will provide content extracted from a PDF along with a reference style profile.

            Your task: Create **study notes that cover all of the input content**, in the **exact same style, structure, and tone** as the reference PDF.

            Important:
            - Read the **entire content** carefully; do not omit any lesson or section.
            - If the content has multiple lessons or topics, create headings/subsections for each.
            - Replicate the formatting, bulleting, tables, and key points **exactly as in the reference style**.

            Reference Style Profile:
            - Example headings: {style_profile['example_headings']}
            - Uses bullet points: {style_profile['uses_bullets']}
            - Uses tables: {style_profile['uses_tables']}

            Below is the full content to convert into study notes:
        """
        
        output_file = organizer.send_to_claude_and_save(instruction)
        
        # Read the Claude response
        with open(output_file, 'r', encoding='utf-8') as f:
            claude_response = json.load(f)
        
        # Extract just the study guide text
        study_guide = ""
        if "content" in claude_response:
            for block in claude_response["content"]:
                if block.get("type") == "text":
                    study_guide += block.get("text", "")
        
        return {
            "success": True,
            "study_guide": study_guide,
            "metadata": organizer.get_extraction_summary(),
            "output_file": output_file  
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "study_guide": "",
            "metadata": {}
        }

# Example usage:
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python lecture_pdf_extraction.py <COURSE_CODE>")
        print("Example: python lecture_pdf_extraction.py CS61A")
        sys.exit(1)
    
    course_code = sys.argv[1].upper()
    print(f"Processing course: {course_code}")
    
    organizer = PDFContentOrganizer()
    
    # Extract content from course folder
    success = organizer.extract_content(course_code)
    
    if not success:
        print(f"No PDFs found in {course_code}/ directory")
        sys.exit(1)
    
    # Send to Claude and save only the output
    instruction = """
        You are an educational content assistant. I will provide you with content extracted from PDFs, including text sections and markdown-formatted tables. Your task is to create **Khan Academy-style study notes**.

        Requirements:

        1. Organize the content into **clear sections and subsections** using headings (##, ###).  
        2. Summarize text into **short, digestible bullet points**.  
        3. Include **markdown tables only if they are relevant** to the concept being explained. Do not insert unrelated tables.   
        4. Ignore any images for now.  
        5. Include a small "Key Points" summary at the end of each major section.  
        6. Keep explanations **concise, educational, and easy to follow**, like Khan Academy notes.  
        7. If table entries use `<br>` tags, you may keep them as-is or convert them into lists inside the cell for readability.

        Here is the content:
    """
    output_file = organizer.send_to_claude_and_save(instruction)
    
    print(f"Final output saved to: {output_file}")
    print("Summary:", organizer.get_extraction_summary())