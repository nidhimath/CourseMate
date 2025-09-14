from googleapiclient.discovery import build
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

class YouTubeEducationalSearch:
    def __init__(self, api_key):
        self.youtube = build('youtube', 'v3', developerKey=api_key)
        
        # Educational channels with their IDs
        self.educational_channels = {
            'Khan Academy': 'UC4a-Gbdw7vOaccHmFo40b9g',
            '3Blue1Brown': 'UCYO_jab_esuFRV4b17AJtAw',
            'MIT OpenCourseWare': 'UCEBb1b_L6zDS3xTUrIALZOw',
            'Crash Course': 'UCX6b17PVsYBQ0ip5gyeme-Q',
            'Veritasium': 'UCHnyfMqiRRG1u-2MsSQLbXA'
        }
    
    def search_channel(self, channel_id, query, max_results=3):
        """Search for videos in a specific channel"""
        try:
            search_response = self.youtube.search().list(
                q=query,
                channelId=channel_id,
                part='id,snippet',
                maxResults=max_results,
                type='video',
                order='relevance'
            ).execute()
            
            return search_response['items']
        except Exception as e:
            print(f"Error searching channel {channel_id}: {e}")
            return []
    
    def get_video_details(self, video_id):
        """Get additional video details including duration"""
        try:
            video_response = self.youtube.videos().list(
                part='contentDetails,statistics',
                id=video_id
            ).execute()
            
            if video_response['items']:
                return video_response['items'][0]
            return None
        except Exception as e:
            print(f"Error getting video details for {video_id}: {e}")
            return None
    
    def parse_duration(self, duration):
        """Convert YouTube duration format (PT4M13S) to seconds"""
        import re
        pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
        match = pattern.match(duration)
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    def is_within_duration_limit(self, duration_seconds):
        """Check if video is within 20 minute limit"""
        return duration_seconds <= 1200  # 20 minutes = 1200 seconds
    
    def search_all_channels(self, query, max_results_per_channel=2):
        """Search all educational channels for relevant videos"""
        all_results = []
        query_keywords = query.lower().split()
        
        for channel_name, channel_id in self.educational_channels.items():
            videos = self.search_channel(channel_id, query, max_results_per_channel)
            
            for video in videos:
                video_id = video['id']['videoId']
                snippet = video['snippet']
                
                # Get additional video details
                video_details = self.get_video_details(video_id)
                
                if video_details:
                    duration = video_details['contentDetails']['duration']
                    duration_seconds = self.parse_duration(duration)
                    
                    # Skip videos longer than 20 minutes
                    if not self.is_within_duration_limit(duration_seconds):
                        continue
                    
                    # Create simple video URL without timestamp
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                    
                    result = {
                        'channel': channel_name,
                        'title': snippet['title'],
                        'description': snippet['description'][:200] + "..." if len(snippet['description']) > 200 else snippet['description'],
                        'video_id': video_id,
                        'url': video_url,
                        'thumbnail': snippet['thumbnails']['medium']['url'],
                        'published_at': snippet['publishedAt'],
                        'duration': duration,
                        'duration_seconds': duration_seconds,
                        'relevance_score': self.calculate_relevance_score(snippet, query_keywords)
                    }
                    
                    all_results.append(result)
        
        # Sort by relevance score
        all_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        if not all_results or all_results[0]['relevance_score'] <= 1:
            general_results = self.search_general_youtube(query, query_keywords, 3)
            all_results.extend(general_results)
        return all_results
    
    def search_general_youtube(self, query, query_keywords, max_results=5):
        """Search general YouTube when educational channels have low relevance"""
        try:
            search_response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                maxResults=max_results,
                type='video',
                order='relevance'
            ).execute()
            
            general_results = []
            
            for video in search_response['items']:
                video_id = video['id']['videoId']
                snippet = video['snippet']
                
                # Get additional video details
                video_details = self.get_video_details(video_id)
                
                if video_details:
                    duration = video_details['contentDetails']['duration']
                    duration_seconds = self.parse_duration(duration)
                    
                    # Skip videos longer than 20 minutes
                    if not self.is_within_duration_limit(duration_seconds):
                        continue
                    
                    # Create simple video URL without timestamp
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                    
                    result = {
                        'channel': snippet['channelTitle'],
                        'title': snippet['title'],
                        'description': snippet['description'][:200] + "..." if len(snippet['description']) > 200 else snippet['description'],
                        'video_id': video_id,
                        'url': video_url,
                        'thumbnail': snippet['thumbnails']['medium']['url'],
                        'published_at': snippet['publishedAt'],
                        'duration': duration,
                        'duration_seconds': duration_seconds,
                        'relevance_score': self.calculate_relevance_score(snippet, query_keywords) + 0.1  # Slight boost to prioritize over low-scoring edu results
                    }
                    
                    general_results.append(result)
            
            return general_results
            
        except Exception as e:
            print(f"Error searching general YouTube: {e}")
            return []

    def calculate_relevance_score(self, snippet, query_keywords):
        """Simple relevance scoring based on keyword matches"""
        title_lower = snippet['title'].lower()
        desc_lower = snippet['description'].lower()
        
        score = 0
        for keyword in query_keywords:
            # Title matches are worth more
            if keyword in title_lower:
                score += 3
            if keyword in desc_lower:
                score += 1
        
        return score
    
    def get_top_video(self, query):
        """Get the single most relevant video"""
        results = self.search_all_channels(query, max_results_per_channel=2)
        
        if results:
            return results[0]['url']
        else:
            return None
    
    def print_top_result(self, query):
        """Print the top result"""
        results = self.search_all_channels(query, max_results_per_channel=2)
        
        if results:
            video = results[0]
            print(f"\nTop Educational Video for '{query}':")
            print(f"Title: {video['title']}")
            print(f"Channel: {video['channel']}")
            print(f"Duration: {video['duration']}")
            print(f"URL: {video['url']}")
            return video['url']
        else:
            print(f"No relevant videos found for '{query}'")
            return None

# Integration function for your hackathon project
def get_top_educational_video(api_key, topic):
    """
    Main function to get the single most relevant educational video
    Returns just the YouTube URL
    """
    searcher = YouTubeEducationalSearch(api_key)
    return searcher.get_top_video(topic)

if __name__ == "__main__":
    # Replace with your YouTube Data API key
    load_dotenv()
    API_KEY = os.getenv('YOUTUBE_API_KEY')
    print(get_top_educational_video(API_KEY, "markov chains"))