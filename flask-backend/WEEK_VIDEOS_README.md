# Week Videos Submodule

This submodule adds YouTube video functionality to the CourseMate application, automatically generating relevant educational videos for each week of a course based on study guide content.

## Features

- **Automatic Topic Extraction**: Extracts key topics from study guide markdown files
- **Smart Search Queries**: Generates optimized search queries for YouTube API
- **Educational Channel Focus**: Prioritizes educational channels like Khan Academy, 3Blue1Brown, MIT OpenCourseWare
- **Relevance Scoring**: Ranks videos by relevance to course content
- **Database Storage**: Stores video metadata with course and week associations
- **REST API**: Provides endpoints for frontend integration

## Components

### 1. Database Model (`WeekVideo`)

Stores video metadata in the database:

```python
class WeekVideo(db.Model):
    course_code = db.Column(db.String(20), nullable=False)  # CS162, CS170, etc.
    week_number = db.Column(db.Integer, nullable=False)     # 1, 2, 3, etc.
    topic = db.Column(db.String(200), nullable=False)       # Main topic
    video_title = db.Column(db.String(300), nullable=False)
    video_url = db.Column(db.String(500), nullable=False)
    video_id = db.Column(db.String(50), nullable=False)     # YouTube video ID
    channel_name = db.Column(db.String(100), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    relevance_score = db.Column(db.Float, nullable=False)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
```

### 2. Week Video Processor (`WeekVideoProcessor`)

Main class that handles video generation:

```python
from week_video_processor import WeekVideoProcessor

# Initialize with YouTube API key
processor = WeekVideoProcessor()

# Extract topics from study guide
topics = processor.extract_topics_from_study_guide("path/to/study_guide.md")

# Generate search queries
queries = processor.generate_search_queries(topics, "CS162")

# Find videos for a week
videos = processor.find_videos_for_week("CS162", 1, "study_guide.md", max_videos=3)

# Save to database
processor.save_week_videos("CS162", 1, videos)

# Process entire course
results = processor.process_course_weeks("CS162", "/path/to/course", max_videos_per_week=3)
```

### 3. API Endpoints

#### Get Videos for Specific Week
```
GET /api/week-videos/{course_code}/weeks/{week_number}/videos
```

#### Get All Videos for Course
```
GET /api/week-videos/{course_code}/videos
```

#### Generate Videos for Entire Course
```
POST /api/week-videos/{course_code}/generate
Content-Type: application/json

{
  "course_path": "/path/to/course",
  "max_videos_per_week": 3
}
```

#### Generate Videos for Specific Week
```
POST /api/week-videos/{course_code}/weeks/{week_number}/generate
Content-Type: application/json

{
  "study_guide_path": "/path/to/study_guide.md",
  "max_videos": 3
}
```

## Setup

### 1. Environment Variables

Set your YouTube Data API key:

```bash
export YOUTUBE_API_KEY="your_youtube_api_key_here"
```

### 2. Database Migration

The new `WeekVideo` model will be automatically created when you run the application.

### 3. Course Structure

Ensure your course directories follow this structure:

```
CourseMate/
├── CS162_New/
│   ├── W1/
│   │   ├── study_guide.md
│   │   └── metadata.json
│   ├── W2/
│   │   ├── study_guide.md
│   │   └── metadata.json
│   └── ...
├── CS170_New/
│   └── ...
```

## Usage

### Command Line Script

Generate videos for an entire course:

```bash
python generate_week_videos.py CS162
```

Generate videos for a specific week:

```bash
python generate_week_videos.py CS162 --week 1
```

List available courses:

```bash
python generate_week_videos.py --list-courses
```

Show existing videos:

```bash
python generate_week_videos.py CS162 --show-existing
```

### Python API

```python
from week_video_processor import WeekVideoProcessor
from app import app

with app.app_context():
    processor = WeekVideoProcessor()
    
    # Process entire course
    results = processor.process_course_weeks("CS162", "/path/to/CS162_New")
    
    # Get videos for specific week
    videos = processor.get_week_videos("CS162", 1)
    
    # Get all videos for course
    all_videos = processor.get_course_videos("CS162")
```

### Frontend Integration

```javascript
// Get videos for a specific week
const response = await fetch('/api/week-videos/CS162/weeks/1/videos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Generate videos for entire course
const generateResponse = await fetch('/api/week-videos/CS162/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    course_path: '/path/to/CS162_New',
    max_videos_per_week: 3
  })
});
```

## Topic Extraction

The system extracts topics from study guides using multiple methods:

1. **Section Headers**: Lines starting with `##` or `###`
2. **Key Concepts**: Text following `→` arrows
3. **Bold Terms**: Text wrapped in `**bold**`
4. **Quoted Terms**: Text in quotes

Example study guide content:
```markdown
## 1.1 Introduction to Operating Systems

→ The modern computing environment presents significant challenges for OS design.

**Process Management** is a key concept in operating systems.

"Virtual Memory" provides abstraction over physical memory.
```

Extracted topics: `["Introduction to Operating Systems", "modern computing environment", "Process Management", "Virtual Memory"]`

## Search Query Generation

The system generates optimized search queries by:

1. Using extracted topics directly
2. Combining topics with course context (e.g., "operating systems")
3. Adding educational context (e.g., "tutorial explanation")

Example queries for CS162:
- `"Process Management"`
- `"Process Management operating systems"`
- `"Process Management tutorial explanation"`

## Educational Channel Priority

The system prioritizes these educational channels:

- Khan Academy
- 3Blue1Brown
- MIT OpenCourseWare
- Crash Course
- Veritasium

Videos from these channels receive higher relevance scores.

## Testing

Run the test suite:

```bash
python test_week_videos.py
```

Run examples:

```bash
python example_usage.py
```

## Error Handling

The system handles various error conditions:

- Missing study guides
- Invalid course paths
- YouTube API rate limits
- Database connection issues
- Invalid video data

All errors are logged and returned in the API response.

## Performance Considerations

- Videos are limited to 20 minutes duration
- Maximum 3 videos per week by default
- Search results are cached in database
- API calls are rate-limited by YouTube

## Future Enhancements

Potential improvements:

1. **Video Quality Scoring**: Rate videos by educational quality
2. **User Feedback**: Allow users to rate video relevance
3. **Playlist Generation**: Create YouTube playlists for each week
4. **Offline Support**: Download videos for offline viewing
5. **Multi-language Support**: Support for non-English videos
6. **AI Enhancement**: Use AI to better match videos to content

## Troubleshooting

### Common Issues

1. **No videos found**: Check if study guide exists and has content
2. **API key errors**: Verify YOUTUBE_API_KEY is set correctly
3. **Database errors**: Ensure database is properly initialized
4. **Rate limiting**: YouTube API has daily quotas

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

To add new features:

1. Extend the `WeekVideoProcessor` class
2. Add new API endpoints in `routes.py`
3. Update the database model if needed
4. Add tests in `test_week_videos.py`
5. Update this documentation
