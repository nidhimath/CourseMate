"""
Week Video Processor - Submodule for generating YouTube links for each week
based on study guide content.

This module extracts key topics from study guides and uses the YouTube API
to find relevant educational videos for each week of a course.
"""

import os
import re
import json
from typing import List, Dict, Optional, Tuple
from pathlib import Path
from dotenv import load_dotenv

from get_relevant_video import YouTubeEducationalSearch
from models import WeekVideo, db

class WeekVideoProcessor:
    def __init__(self, api_key: str = None):
        """Initialize the processor with YouTube API key."""
        if api_key is None:
            load_dotenv()
            api_key = os.getenv('YOUTUBE_API_KEY')
        
        if not api_key:
            raise ValueError("YouTube API key is required. Set YOUTUBE_API_KEY environment variable.")
        
        self.youtube_searcher = YouTubeEducationalSearch(api_key)
        
    def extract_topics_from_study_guide(self, study_guide_path: str) -> List[str]:
        """
        Extract key topics from a study guide markdown file.
        
        Args:
            study_guide_path: Path to the study guide markdown file
            
        Returns:
            List of key topics extracted from the study guide
        """
        try:
            with open(study_guide_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except FileNotFoundError:
            print(f"Study guide not found: {study_guide_path}")
            return []
        except Exception as e:
            print(f"Error reading study guide: {e}")
            return []
        
        topics = []
        
        # Extract section headers (lines starting with ## or ###)
        section_headers = re.findall(r'^#{2,3}\s+(.+)$', content, re.MULTILINE)
        topics.extend(section_headers)
        
        # Extract key concepts mentioned in bullet points or arrows
        key_concepts = re.findall(r'→\s*([^→\n]+)', content)
        topics.extend([concept.strip() for concept in key_concepts])
        
        # Extract bold terms (wrapped in **)
        bold_terms = re.findall(r'\*\*([^*]+)\*\*', content)
        topics.extend(bold_terms)
        
        # Extract terms in quotes
        quoted_terms = re.findall(r'"([^"]+)"', content)
        topics.extend(quoted_terms)
        
        # Clean and filter topics
        cleaned_topics = []
        for topic in topics:
            # Clean up the topic
            topic = topic.strip()
            topic = re.sub(r'[^\w\s\-\.]', '', topic)  # Remove special characters except spaces, hyphens, dots
            topic = re.sub(r'\s+', ' ', topic)  # Normalize whitespace
            
            # Filter out very short or very long topics
            if 3 <= len(topic) <= 100 and topic not in cleaned_topics:
                cleaned_topics.append(topic)
        
        # Remove duplicates and return top topics
        unique_topics = list(dict.fromkeys(cleaned_topics))  # Preserves order while removing duplicates
        return unique_topics[:10]  # Return top 10 topics
    
    def generate_search_queries(self, topics: List[str], course_code: str) -> List[str]:
        """
        Generate search queries for YouTube based on topics and course context.
        
        Args:
            topics: List of topics extracted from study guide
            course_code: Course code (e.g., 'CS162', 'CS170')
            
        Returns:
            List of search queries optimized for YouTube search
        """
        queries = []
        
        # Course-specific context
        course_context = {
            'CS162': 'operating systems',
            'CS170': 'algorithms',
            'CS61A': 'programming python',
            'CS61B': 'data structures',
            'EECS126': 'probability random processes',
            'EECS16A': 'linear algebra circuits',
            'EECS16B': 'linear algebra circuits'
        }
        
        course_subject = course_context.get(course_code, 'computer science')
        
        # Generate queries combining topics with course context
        for topic in topics[:5]:  # Use top 5 topics
            # Direct topic query
            queries.append(topic)
            
            # Topic with course context
            queries.append(f"{topic} {course_subject}")
            
            # Topic with educational context
            queries.append(f"{topic} tutorial explanation")
        
        return queries[:10]  # Limit to 10 queries
    
    def find_videos_for_week(self, course_code: str, week_number: int, 
                           study_guide_path: str, max_videos: int = 3) -> List[Dict]:
        """
        Find relevant YouTube videos for a specific week based on study guide content.
        
        Args:
            course_code: Course code (e.g., 'CS162', 'CS170')
            week_number: Week number (1, 2, 3, etc.)
            study_guide_path: Path to the study guide markdown file
            max_videos: Maximum number of videos to find per week
            
        Returns:
            List of video dictionaries with metadata
        """
        print(f"Processing week {week_number} for {course_code}...")
        
        # Extract topics from study guide
        topics = self.extract_topics_from_study_guide(study_guide_path)
        if not topics:
            print(f"No topics found in study guide: {study_guide_path}")
            return []
        
        print(f"Extracted topics: {topics[:5]}...")  # Show first 5 topics
        
        # Generate search queries
        search_queries = self.generate_search_queries(topics, course_code)
        print(f"Generated {len(search_queries)} search queries")
        
        # Search for videos
        all_videos = []
        seen_video_ids = set()
        
        for query in search_queries:
            try:
                print(f"Searching for: {query}")
                results = self.youtube_searcher.search_all_channels(query, max_results_per_channel=1)
                
                for result in results:
                    video_id = result['video_id']
                    if video_id not in seen_video_ids:
                        seen_video_ids.add(video_id)
                        all_videos.append(result)
                        
                        if len(all_videos) >= max_videos * 2:  # Get more than needed for filtering
                            break
                
                if len(all_videos) >= max_videos * 2:
                    break
                    
            except Exception as e:
                error_msg = str(e).lower()
                if 'quota' in error_msg or 'limit' in error_msg or 'exceeded' in error_msg:
                    print(f"API quota exceeded while searching for '{query}'. Stopping search.")
                    break  # Stop searching if quota exceeded
                else:
                    print(f"Error searching for '{query}': {e}")
                    continue
        
        # Sort by relevance score and return top videos
        all_videos.sort(key=lambda x: x['relevance_score'], reverse=True)
        return all_videos[:max_videos]
    
    def save_week_videos(self, course_code: str, week_number: int, videos: List[Dict]) -> bool:
        """
        Save videos to database for a specific week.
        
        Args:
            course_code: Course code
            week_number: Week number
            videos: List of video dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Clear existing videos for this week
            WeekVideo.query.filter_by(
                course_code=course_code,
                week_number=week_number
            ).delete()
            
            # Save new videos
            for i, video in enumerate(videos):
                # Extract video ID from URL
                video_id = video['video_id']
                
                # Create topic name from video title (first few words)
                topic_words = video['title'].split()[:4]
                topic = ' '.join(topic_words)
                
                week_video = WeekVideo(
                    course_code=course_code,
                    week_number=week_number,
                    topic=topic,
                    video_title=video['title'],
                    video_url=video['url'],
                    video_id=video_id,
                    channel_name=video['channel'],
                    duration_seconds=video['duration_seconds'],
                    relevance_score=video['relevance_score'],
                    thumbnail_url=video.get('thumbnail', ''),
                    description=video.get('description', '')[:500]  # Limit description length
                )
                
                db.session.add(week_video)
            
            db.session.commit()
            print(f"Saved {len(videos)} videos for {course_code} Week {week_number}")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error saving videos: {e}")
            return False
    
    def process_course_weeks(self, course_code: str, course_path: str, 
                           max_videos_per_week: int = 3) -> Dict[str, int]:
        """
        Process all weeks for a course and generate YouTube videos.
        
        Args:
            course_code: Course code (e.g., 'CS162', 'CS170')
            course_path: Path to the course directory (e.g., '/path/to/CS162_New')
            max_videos_per_week: Maximum videos per week
            
        Returns:
            Dictionary with processing results
        """
        results = {
            'total_weeks': 0,
            'processed_weeks': 0,
            'total_videos': 0,
            'errors': []
        }
        
        course_path = Path(course_path)
        if not course_path.exists():
            error_msg = f"Course path does not exist: {course_path}"
            print(error_msg)
            results['errors'].append(error_msg)
            return results
        
        # Find all week directories
        week_dirs = [d for d in course_path.iterdir() if d.is_dir() and d.name.startswith('W')]
        week_dirs.sort(key=lambda x: int(x.name[1:]))  # Sort by week number
        
        results['total_weeks'] = len(week_dirs)
        print(f"Found {len(week_dirs)} weeks for {course_code}")
        
        for week_dir in week_dirs:
            week_number = int(week_dir.name[1:])  # Extract number from W1, W2, etc.
            study_guide_path = week_dir / 'study_guide.md'
            
            if not study_guide_path.exists():
                error_msg = f"Study guide not found: {study_guide_path}"
                print(error_msg)
                results['errors'].append(error_msg)
                continue
            
            try:
                # Find videos for this week
                videos = self.find_videos_for_week(
                    course_code, week_number, str(study_guide_path), max_videos_per_week
                )
                
                if videos:
                    # Save videos to database
                    if self.save_week_videos(course_code, week_number, videos):
                        results['processed_weeks'] += 1
                        results['total_videos'] += len(videos)
                        print(f"✓ Week {week_number}: {len(videos)} videos")
                    else:
                        error_msg = f"Failed to save videos for week {week_number}"
                        results['errors'].append(error_msg)
                else:
                    error_msg = f"No videos found for week {week_number}"
                    print(error_msg)
                    results['errors'].append(error_msg)
                    
            except Exception as e:
                error_msg = str(e).lower()
                if 'quota' in error_msg or 'limit' in error_msg or 'exceeded' in error_msg:
                    print(f"API quota exceeded while processing week {week_number}. Stopping course processing.")
                    results['errors'].append(f"API quota exceeded - stopped at week {week_number}")
                    break  # Stop processing remaining weeks
                else:
                    error_msg = f"Error processing week {week_number}: {e}"
                    print(error_msg)
                    results['errors'].append(error_msg)
        
        return results
    
    def get_week_videos(self, course_code: str, week_number: int) -> List[Dict]:
        """
        Retrieve videos for a specific week from the database.
        
        Args:
            course_code: Course code
            week_number: Week number
            
        Returns:
            List of video dictionaries
        """
        videos = WeekVideo.query.filter_by(
            course_code=course_code,
            week_number=week_number
        ).order_by(WeekVideo.relevance_score.desc()).all()
        
        return [video.to_dict() for video in videos]
    
    def get_course_videos(self, course_code: str) -> Dict[int, List[Dict]]:
        """
        Retrieve all videos for a course organized by week.
        
        Args:
            course_code: Course code
            
        Returns:
            Dictionary mapping week numbers to lists of videos
        """
        videos = WeekVideo.query.filter_by(course_code=course_code).all()
        
        result = {}
        for video in videos:
            week_num = video.week_number
            if week_num not in result:
                result[week_num] = []
            result[week_num].append(video.to_dict())
        
        # Sort videos within each week by relevance score
        for week_num in result:
            result[week_num].sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return result


def main():
    """Example usage of the WeekVideoProcessor."""
    try:
        # Initialize processor
        processor = WeekVideoProcessor()
        
        # Example: Process CS162 course
        course_code = "CS162"
        course_path = "/Users/nidhimathihalli/Documents/GitHub/CourseMate/CS162_New"
        
        print(f"Processing {course_code} course...")
        results = processor.process_course_weeks(course_code, course_path)
        
        print(f"\nProcessing Results:")
        print(f"Total weeks: {results['total_weeks']}")
        print(f"Processed weeks: {results['processed_weeks']}")
        print(f"Total videos: {results['total_videos']}")
        print(f"Errors: {len(results['errors'])}")
        
        if results['errors']:
            print("\nErrors:")
            for error in results['errors']:
                print(f"  - {error}")
        
        # Example: Retrieve videos for week 1
        print(f"\nVideos for {course_code} Week 1:")
        week1_videos = processor.get_week_videos(course_code, 1)
        for video in week1_videos:
            print(f"  - {video['video_title']} ({video['channel_name']})")
            print(f"    URL: {video['video_url']}")
            print(f"    Score: {video['relevance_score']}")
            print()
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
