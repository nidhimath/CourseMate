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
from PIL import Image
import pytesseract

class PDFContentOrganizer:
    """Extract figures, text, and tables from PDF and format for Claude API."""
    
    def __init__(self, output_dir: str = "claude_outputs"):
        self.final_output_dir = Path(output_dir)
        self.final_output_dir.mkdir(exist_ok=True)
        self.content = []
        
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
    
    def extract_content(self, folder_path: str) -> List[Dict[str, Any]]:
        """Extract content from all PDFs in a folder and format for Claude API."""
        folder = Path(folder_path)
        pdf_paths = sorted(folder.glob("*.pdf"))  # get all PDFs in the folder
        all_message_content = []
        seen_hashes = set()

        for pdf_path in pdf_paths:
            doc = pymupdf.open(pdf_path)
            pdf_name = pdf_path.stem
            
            text_parts = [f"# PDF: {pdf_name}\n\n"]  # Add PDF file name as header
            pdf_message_content = []  # text + figures for this PDF
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Extract text content
                page_content = f"\n## Page {page_num + 1}\n\n"
                text = page.get_text().strip()
                if text:
                    page_content += f"### Text:\n{text}\n\n"
                
                # Extract tables
                tables = self._extract_tables(page)
                if tables:
                    page_content += "### Tables:\n"
                    for i, table in enumerate(tables, 1):
                        page_content += f"**Table {i}:**\n{table}\n\n"
                
                # Extract figures (largest per page via contour) + OCR
                page_figures = self._extract_page_figures(page, pdf_name, page_num)
                figure_count = 0
                for fig in page_figures:
                    if fig["hash"] not in seen_hashes:
                        seen_hashes.add(fig["hash"])
                        # Include OCR metadata when adding to message content
                        image_block = {
                            "type": "image",
                            "source": fig["source"]
                        }
                        # Add OCR text to the page content if available
                        if fig.get("metadata", {}).get("ocr"):
                            page_content += f"**Figure OCR Text:** {fig['metadata']['ocr']}\n\n"
                        pdf_message_content.append(image_block)
                        figure_count += 1
                
                if figure_count > 0:
                    page_content += f"### Figures:\n{figure_count} unique figure(s) extracted\n\n"


                text_parts.append(page_content)
            
            # Combine text parts and prepend text block
            combined_text = "".join(text_parts)
            pdf_message_content.insert(0, {"type": "text", "text": combined_text})

            all_message_content.extend(pdf_message_content)
            doc.close()
    
            self.content = all_message_content
            return all_message_content

    
    def _extract_page_figures(self, page, pdf_name: str, page_num: int) -> List[Dict[str, Any]]:
        """Extract largest figure from page, crop via contour, run OCR, return as API-ready dict."""
        matrix = pymupdf.Matrix(self.zoom_factor, self.zoom_factor)
        pix = page.get_pixmap(matrix=matrix)
        img_data = pix.tobytes("png")

        # Convert to OpenCV
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Crop with contour detection
        cropped_figures = self._auto_crop_figures(img)
        if not cropped_figures:
            return []

        # Pick largest figure
        largest_fig = max(cropped_figures, key=lambda f: f.shape[0] * f.shape[1])

        # Run OCR on the cropped figure
        ocr_text = self.run_ocr(largest_fig)

        # Get hash profile
        pil_img = Image.fromarray(cv2.cvtColor(largest_fig, cv2.COLOR_BGR2RGB))
        img_hash = self._calculate_image_hash(pil_img)

        # Encode to base64 for Claude API
        _, buffer = cv2.imencode('.png', largest_fig)
        img_base64 = base64.b64encode(buffer).decode()

        return [{
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": img_base64
            },
            "metadata": {
                "ocr": ocr_text
            },
            "hash": img_hash
        }]

    def _calculate_image_hash(self, img: Image.Image) -> str:
        img = img.resize((8, 8), Image.Resampling.LANCZOS)
        pixels = np.array(img).flatten()
        avg = pixels.mean()
        return ''.join(['1' if p > avg else '0' for p in pixels])

    def run_ocr(self, cropped_img) -> str:
        """
        Run OCR on a cropped figure (OpenCV image).
        Returns extracted text as a string.
        """
        # Convert OpenCV (BGR) -> PIL (RGB)
        pil_img = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
        
        # Run OCR with Tesseract
        text = pytesseract.image_to_string(pil_img, config="--psm 6")
        
        # Clean up text a bit
        return text.strip()
    
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
        if not self.content:
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
        ] + self.content
        
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
            timestamp = __import__('datetime').datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"claude_error_{timestamp}.json"
            filepath = self.final_output_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(error_response, f, indent=2, ensure_ascii=False)
            
            print(f"Error saved to: {filepath}")
            return str(filepath)
    
    def get_extraction_summary(self) -> Dict[str, Any]:
        """Get summary of what was extracted."""
        if not self.content:
            return {"error": "No content extracted"}
        
        text_blocks = sum(1 for item in self.content if item["type"] == "text")
        image_blocks = sum(1 for item in self.content if item["type"] == "image")
        
        return {
            "total_content_blocks": len(self.content),
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

            Your task: Create **study notes that cover ALL of the input content**, in the **exact same style, structure, and tone** as the reference PDF.  

            Instructions:  
            1. **Reorganize by Content**:  
            - Do NOT structure notes by lectures or source divisions.  
            - Instead, group and order the material by topic/content so that the notes flow logically for a student studying the material.  
            - Merge overlapping sections if needed to avoid repetition.  

            2. **Ensure Full Coverage**:  
            - Include **every concept** from the input, even if it is briefly mentioned.  
            - No sections should be omitted.  

            3. **Replicate Reference Style**:  
            - Match the style, headings, bullet usage, and tables exactly as in the reference profile.  
            - Use consistent formatting for definitions, key points, and examples.  
            - If tables or lists are used in the reference, apply them here as well.  

            4. **Clarity and Flow**:  
            - Present the content in a clear, educational order, so it feels like a single cohesive study guide.  
            - Avoid fragmentation across "lectures." Focus on *content-first* organization.  

            Reference Passage:  
            <Start Reference>
            {reference_content}
            <End Reference>

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
    organizer = PDFContentOrganizer()
    
    # Extract content from PDF
    organizer.extract_content("lecture1.pdf")
    
    # Send to Claude and save only the output
    instruction = """
        You are an educational content assistant. I will provide you with content extracted from a PDF, including text sections and markdown-formatted tables. Your task is to create **Khan Academy-style study notes**.

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