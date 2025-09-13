import re
import json
from typing import List, Dict, Set, Tuple
from course_data import get_all_courses, get_course_info

class TranscriptParser:
    def __init__(self):
        self.all_courses = get_all_courses()
        # Create patterns for different course code formats
        self.course_patterns = [
            r'\b(CS\s*\d+[A-Z]*)\b',  # CS 61A, CS61A, CS170, CS61BL, etc.
            r'\b(EECS\s*\d+[A-Z]*)\b',  # EECS 16A, EECS16A, EECS120, etc.
            r'\b(COMPSCI\s*\d+[A-Z]*)\b',  # COMPSCI 61A, COMPSCI61A, COMPSCI 61BL, etc.
            r'\b(Physics\s*\d+[A-Z]*)\b',  # Physics 7B, Physics7B, etc.
            r'\b(PHYSICS\s*\d+[A-Z]*)\b',  # PHYSICS 7B, PHYSICS7B, etc.
            r'\b(EE\s*\d+[A-Z]*)\b',  # EE 140, EE140, etc.
            r'\b(Math\s*\d+[A-Z]*)\b',  # Math 1A, Math1A, etc.
            r'\b(MATH\s*\d+[A-Z]*)\b',  # MATH 191, MATH191, etc.
            r'\b(INDENG\s*\d+[A-Z]*)\b',  # INDENG 198, etc.
        ]
        self.combined_pattern = '|'.join(self.course_patterns)

    def _normalize_course_code(self, course_code: str) -> str:
        """Normalize course codes to match our database format"""
        # Remove all spaces first
        course_code = course_code.replace(' ', '')
        
        # Convert COMPSCI to CS
        if course_code.startswith('COMPSCI'):
            course_code = course_code.replace('COMPSCI', 'CS')
        # Convert PHYSICS to Physics
        elif course_code.startswith('PHYSICS'):
            course_code = course_code.replace('PHYSICS', 'Physics')
        # Convert MATH to Math
        elif course_code.startswith('MATH'):
            course_code = course_code.replace('MATH', 'Math')
        
        # Handle common course suffixes (L = Lab, H = Honors, etc.)
        # For now, we'll map common variations to the base course
        if course_code.endswith('L') and course_code.startswith('CS'):
            # CS61BL -> CS61B, CS61CL -> CS61C, etc.
            course_code = course_code[:-1]
        elif course_code.endswith('H') and course_code.startswith('CS'):
            # CS61AH -> CS61A, etc.
            course_code = course_code[:-1]
        
        return course_code

    def parse_transcript(self, transcript_text: str) -> Dict:
        """
        Parse transcript text and extract course information
        Returns: {
            'completed_courses': List[str],
            'current_courses': List[str],
            'gpa': float,
            'total_units': int,
            'semester_info': Dict
        }
        """
        # Clean the text
        text = self._clean_text(transcript_text)
        
        # Extract courses
        completed_courses = self._extract_completed_courses(text)
        current_courses = self._extract_current_courses(text)
        
        # Remove current courses from completed courses (prioritize current over completed)
        completed_courses = [course for course in completed_courses if course['course_code'] not in current_courses]
        
        # Extract GPA and units
        gpa = self._extract_gpa(text)
        total_units = self._extract_total_units(text)
        
        # Extract semester information
        semester_info = self._extract_semester_info(text)
        
        return {
            'completed_courses': completed_courses,
            'current_courses': current_courses,
            'gpa': gpa,
            'total_units': total_units,
            'semester_info': semester_info,
            'raw_text': transcript_text
        }

    def _clean_text(self, text: str) -> str:
        """Clean and normalize transcript text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters that might interfere
        text = re.sub(r'[^\w\s\-\.]', ' ', text)
        return text.strip()

    def _extract_completed_courses(self, text: str) -> List[dict]:
        """Extract completed courses with grades from transcript"""
        completed_courses = []
        
        # Find all course codes in the text
        course_matches = re.findall(self.combined_pattern, text, re.IGNORECASE)
        
        for match in course_matches:
            # Handle tuple from multiple groups in regex
            if isinstance(match, tuple):
                course_code = next((m for m in match if m), '')
            else:
                course_code = match
            
            if not course_code:
                continue
                
            # Clean up the course code (normalize)
            course_code = course_code.upper()
            # Convert COMPSCI to CS format and remove spaces
            course_code = self._normalize_course_code(course_code)
            if course_code in self.all_courses:
                # Check if this course appears to be completed
                if self._is_course_completed(course_code, text):
                    # Extract grade for this course
                    grade = self._extract_course_grade(course_code, text)
                    completed_courses.append({
                        'course_code': course_code,
                        'grade': grade
                    })
        
        return completed_courses

    def _extract_current_courses(self, text: str) -> List[str]:
        """Extract current/in-progress courses from transcript"""
        current_courses = set()
        
        # Look for current semester indicators
        current_indicators = [
            'current', 'in progress', 'enrolled', 'taking', 'this semester',
            'fall 2025', 'spring 2025', 'summer 2025', 'fa25', 'sp25', 'su25',
            'fall 2026', 'spring 2026', 'summer 2026', 'fa26', 'sp26', 'su26'
        ]
        
        # Find all course codes in the text
        course_matches = re.findall(self.combined_pattern, text, re.IGNORECASE)
        
        for match in course_matches:
            # Handle tuple from multiple groups in regex
            if isinstance(match, tuple):
                course_code = next((m for m in match if m), '')
            else:
                course_code = match
            
            if not course_code:
                continue
                
            # Clean up the course code (normalize)
            course_code = course_code.upper()
            # Convert COMPSCI to CS format and remove spaces
            course_code = self._normalize_course_code(course_code)
            if course_code in self.all_courses:
                # Check if this course appears to be current
                if self._is_course_current(course_code, text, current_indicators):
                    current_courses.add(course_code)
        
        return list(current_courses)

    def _is_course_completed(self, course_code: str, text: str) -> bool:
        """Check if a course appears to be completed"""
        # Create possible variations of the course code for searching
        search_variations = [course_code]
        
        # Add original format variations
        if course_code.startswith('CS'):
            # CS61A -> COMPSCI 61A, COMPSCI61A, CS 61A
            # Also include variations with L suffix (for lab courses)
            number_part = course_code[2:]
            search_variations.extend([
                f'COMPSCI {number_part}',
                f'COMPSCI{number_part}',
                f'CS {number_part}',
                f'CS{number_part}',
                f'COMPSCI {number_part}L',  # For lab courses like COMPSCI 61BL
                f'COMPSCI{number_part}L',
                f'CS {number_part}L',
                f'CS{number_part}L'
            ])
        elif course_code.startswith('EECS'):
            # EECS16A -> EECS 16A, EECS16A
            number_part = course_code[4:]
            search_variations.extend([
                f'EECS {number_part}',
                f'EECS{number_part}'
            ])
        elif course_code.startswith('Physics'):
            # Physics7B -> PHYSICS 7B, PHYSICS7B
            number_part = course_code[6:]
            search_variations.extend([
                f'PHYSICS {number_part}',
                f'PHYSICS{number_part}'
            ])
        elif course_code.startswith('Math'):
            # Math191 -> MATH 191, MATH191
            number_part = course_code[4:]
            search_variations.extend([
                f'MATH {number_part}',
                f'MATH{number_part}'
            ])
        
        # Look for grade indicators near any variation of the course code
        for variation in search_variations:
            grade_patterns = [
                r'\b' + re.escape(variation) + r'\b.*?[A-F][+-]?',
                r'\b' + re.escape(variation) + r'\b.*?\d+\.\d+',
                r'\b' + re.escape(variation) + r'\b.*?(pass|fail|credit)',
            ]
            
            for pattern in grade_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return True
        
        # Look for semester indicators that suggest completion
        completed_indicators = [
            'fall 2023', 'spring 2024', 'summer 2024', 'fa23', 'sp24', 'su24',
            'fall 2024', 'spring 2025', 'summer 2025', 'fa24', 'sp25', 'su25',
            'completed', 'finished', 'taken'
        ]
        
        for indicator in completed_indicators:
            if indicator in text.lower():
                # Check if any variation of the course is near this indicator
                for variation in search_variations:
                    course_pos = text.lower().find(variation.lower())
                    indicator_pos = text.lower().find(indicator)
                    if course_pos != -1 and abs(course_pos - indicator_pos) < 100:
                        return True
        
        # If course has a grade pattern anywhere in the text, consider it completed
        for variation in search_variations:
            grade_anywhere_pattern = r'\b' + re.escape(variation) + r'\b.*?[A-F][+-]?\b'
            if re.search(grade_anywhere_pattern, text, re.IGNORECASE):
                return True
            
        return False

    def _is_course_current(self, course_code: str, text: str, current_indicators: List[str]) -> bool:
        """Check if a course appears to be current/in-progress"""
        # Create possible variations of the course code for searching
        search_variations = [course_code]
        
        # Add original format variations
        if course_code.startswith('CS'):
            # CS61A -> COMPSCI 61A, COMPSCI61A, CS 61A
            # Also include variations with L suffix (for lab courses)
            number_part = course_code[2:]
            search_variations.extend([
                f'COMPSCI {number_part}',
                f'COMPSCI{number_part}',
                f'CS {number_part}',
                f'CS{number_part}',
                f'COMPSCI {number_part}L',  # For lab courses like COMPSCI 61BL
                f'COMPSCI{number_part}L',
                f'CS {number_part}L',
                f'CS{number_part}L'
            ])
        elif course_code.startswith('EECS'):
            # EECS16A -> EECS 16A, EECS16A
            number_part = course_code[4:]
            search_variations.extend([
                f'EECS {number_part}',
                f'EECS{number_part}'
            ])
        elif course_code.startswith('Physics'):
            # Physics7B -> PHYSICS 7B, PHYSICS7B
            number_part = course_code[6:]
            search_variations.extend([
                f'PHYSICS {number_part}',
                f'PHYSICS{number_part}'
            ])
        elif course_code.startswith('Math'):
            # Math191 -> MATH 191, MATH191
            number_part = course_code[4:]
            search_variations.extend([
                f'MATH {number_part}',
                f'MATH{number_part}'
            ])
        
        # Check for "—" grade pattern (indicates current/in-progress)
        for variation in search_variations:
            dash_grade_pattern = r'\b' + re.escape(variation) + r'\b.*?—'
            if re.search(dash_grade_pattern, text, re.IGNORECASE):
                return True
        
        # NEW LOGIC: Check if course appears in the most recent semester (Fall 2025)
        # Look for "Fall 2025" and check if the course appears after it
        fall_2025_pos = text.lower().find('fall 2025')
        if fall_2025_pos != -1:
            # Get text after Fall 2025
            text_after_fall_2025 = text[fall_2025_pos:]
            for variation in search_variations:
                if variation.lower() in text_after_fall_2025.lower():
                    return True
            
        for indicator in current_indicators:
            if indicator in text.lower():
                # Check if any variation of the course is near this indicator
                for variation in search_variations:
                    course_pos = text.lower().find(variation.lower())
                    indicator_pos = text.lower().find(indicator)
                    if course_pos != -1 and abs(course_pos - indicator_pos) < 100:
                        return True
        return False

    def _extract_course_grade(self, course_code: str, text: str) -> str:
        """Extract the grade for a specific course"""
        # Create possible variations of the course code for searching
        search_variations = [course_code]
        
        # Add original format variations
        if course_code.startswith('CS'):
            number_part = course_code[2:]
            search_variations.extend([
                f'COMPSCI {number_part}',
                f'COMPSCI{number_part}',
                f'CS {number_part}',
                f'CS{number_part}',
                f'COMPSCI {number_part}L',
                f'COMPSCI{number_part}L',
                f'CS {number_part}L',
                f'CS{number_part}L'
            ])
        elif course_code.startswith('EECS'):
            number_part = course_code[4:]
            search_variations.extend([
                f'EECS {number_part}',
                f'EECS{number_part}'
            ])
        elif course_code.startswith('Physics'):
            number_part = course_code[6:]
            search_variations.extend([
                f'PHYSICS {number_part}',
                f'PHYSICS{number_part}'
            ])
        elif course_code.startswith('Math'):
            number_part = course_code[4:]
            search_variations.extend([
                f'MATH {number_part}',
                f'MATH{number_part}'
            ])
        
        # Look for grade patterns after each course variation
        grade_patterns = [
            r'([A-F][+-]?)',  # A+, A, A-, B+, B, B-, etc.
            r'(P)',           # Pass
            r'(S)',           # Satisfactory
            r'(NP)',          # No Pass
            r'(U)',           # Unsatisfactory
        ]
        
        for variation in search_variations:
            # Look for the course code followed by a grade
            # Pattern: course code, optional text, then a number (units), then grade
            pattern = r'\b' + re.escape(variation) + r'\b.*?(\d+)\s+([A-F][+-]?|P|S|NP|U)(?:\s|$)'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                grade = match.group(2).upper()
                # Validate that this is a real grade (not part of another word)
                if grade in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'S', 'NP', 'U']:
                    return grade
        
        # If no grade found, return "N/A"
        return "N/A"

    def _extract_gpa(self, text: str) -> float:
        """Extract GPA from transcript"""
        gpa_patterns = [
            r'gpa[:\s]*(\d+\.\d+)',
            r'grade point average[:\s]*(\d+\.\d+)',
            r'cumulative gpa[:\s]*(\d+\.\d+)',
        ]
        
        for pattern in gpa_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue
        
        return 0.0

    def _extract_total_units(self, text: str) -> int:
        """Extract total units from transcript"""
        unit_patterns = [
            r'total units[:\s]*(\d+)',
            r'units completed[:\s]*(\d+)',
            r'credit hours[:\s]*(\d+)',
        ]
        
        for pattern in unit_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        
        return 0

    def _extract_semester_info(self, text: str) -> Dict:
        """Extract semester information"""
        semester_info = {
            'current_semester': '',
            'current_year': '',
            'all_semesters': []
        }
        
        # Look for semester patterns
        semester_patterns = [
            r'(fall|spring|summer)\s*(\d{4})',
            r'(fa|sp|su)(\d{2})',
        ]
        
        for pattern in semester_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                semester, year = match
                semester_info['all_semesters'].append({
                    'semester': semester.lower(),
                    'year': year
                })
        
        return semester_info

    def generate_curriculum_plan(self, completed_courses: List[str], current_courses: List[str]) -> Dict:
        """Generate a personalized curriculum plan"""
        from course_data import get_available_courses, get_missing_prerequisites, get_course_info
        
        # Get available courses based on completed prerequisites
        available_courses = get_available_courses(completed_courses)
        
        # Remove current courses from available (since they're already being taken)
        available_courses = [course for course in available_courses if course not in current_courses]
        
        # Categorize available courses
        curriculum_plan = {
            'completed_courses': completed_courses,
            'current_courses': current_courses,
            'available_courses': available_courses,
            'recommended_courses': self._get_recommended_courses(available_courses, completed_courses),
            'course_details': {}
        }
        
        # Add detailed information for each course
        for course in available_courses + current_courses:
            curriculum_plan['course_details'][course] = get_course_info(course)
        
        return curriculum_plan

    def _get_recommended_courses(self, available_courses: List[str], completed_courses: List[str]) -> List[str]:
        """Get recommended courses based on common paths and prerequisites"""
        # Priority courses (core requirements that most students take)
        priority_courses = ['CS61A', 'CS61B', 'CS61C', 'CS70', 'EECS16A', 'EECS16B']
        
        # Theory courses that build on each other
        theory_sequence = ['CS170', 'CS172', 'CS174']
        
        # Software courses that are commonly taken
        software_courses = ['CS161', 'CS162', 'CS164', 'CS168']
        
        recommended = []
        
        # Add priority courses that are available
        for course in priority_courses:
            if course in available_courses and course not in recommended:
                recommended.append(course)
        
        # Add theory sequence courses
        for course in theory_sequence:
            if course in available_courses and course not in recommended:
                recommended.append(course)
        
        # Add software courses
        for course in software_courses:
            if course in available_courses and course not in recommended:
                recommended.append(course)
        
        # Add remaining available courses
        for course in available_courses:
            if course not in recommended:
                recommended.append(course)
        
        return recommended[:10]  # Limit to top 10 recommendations
