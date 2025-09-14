# Frontend YouTube Integration

This document describes how the YouTube video functionality has been integrated into the Next.js frontend.

## Overview

The YouTube video submodule is now fully integrated into the frontend, allowing users to:
- View relevant YouTube videos for each week of a course
- Generate new videos based on study guide content
- Watch videos in a modal or open them directly on YouTube
- See video relevance scores and metadata

## Components Added

### 1. API Routes (`/src/app/api/week-videos/`)

- **`[courseCode]/videos/route.ts`** - Get all videos for a course
- **`[courseCode]/weeks/[weekNumber]/videos/route.ts`** - Get videos for specific week
- **`[courseCode]/generate/route.ts`** - Generate videos for entire course

These routes proxy requests to the Flask backend and handle authentication.

### 2. WeekVideos Component (`/src/components/WeekVideos.tsx`)

Main component that displays YouTube videos for a specific week:

**Features:**
- Fetches videos from the API
- Displays video thumbnails, titles, and metadata
- Shows relevance scores and duration
- Allows video generation with a button
- Handles loading and error states
- Opens videos in modal or new tab

**Props:**
```typescript
interface WeekVideosProps {
  courseCode: string;
  weekNumber: number;
  onVideoClick?: (video: WeekVideo) => void;
}
```

### 3. VideoModal Component (`/src/components/VideoModal.tsx`)

Modal component for detailed video viewing:

**Features:**
- Shows video thumbnail and details
- Displays relevance score and metadata
- "Watch on YouTube" button
- Course context information
- Responsive design

### 4. CourseDetail Integration

The `CourseDetail.tsx` component has been updated to include a new "Videos" tab:

- Added third tab for videos alongside Lessons and Assignments
- Week selector works across all tabs
- Videos are displayed using the `WeekVideos` component
- Clicking videos opens them in new tabs by default

## Usage

### For Users

1. **Navigate to a course** (e.g., CS162)
2. **Click the "Videos" tab**
3. **Select a week** from the week selector
4. **View available videos** or click "Generate Videos" if none exist
5. **Click on a video** to open it in a modal or new tab

### For Developers

#### Adding Videos to Other Components

```typescript
import WeekVideos from '@/components/WeekVideos';

// Basic usage
<WeekVideos courseCode="CS162" weekNumber={1} />

// With custom click handler
<WeekVideos 
  courseCode="CS162" 
  weekNumber={1}
  onVideoClick={(video) => {
    // Custom behavior
    console.log('Video clicked:', video);
  }}
/>
```

#### Using the Video Modal

```typescript
import VideoModal from '@/components/VideoModal';

<VideoModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  video={selectedVideo}
/>
```

## API Integration

The frontend communicates with the Flask backend through Next.js API routes:

```
Frontend Component → Next.js API Route → Flask Backend → YouTube API
```

### Environment Variables

Make sure these are set in your `.env.local`:

```env
FLASK_BASE_URL=http://localhost:5001
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## Styling

The components use Tailwind CSS with custom utilities:

- `.line-clamp-2` - Truncate text to 2 lines
- `.line-clamp-4` - Truncate text to 4 lines

## Error Handling

The components handle various error states:

- **No videos found** - Shows generate button
- **API errors** - Displays error messages
- **Loading states** - Shows spinners
- **Network issues** - Graceful fallbacks

## Future Enhancements

Potential improvements:

1. **Video Playback** - Embed YouTube player in modal
2. **Playlists** - Create weekly playlists
3. **Progress Tracking** - Track which videos user has watched
4. **Recommendations** - Suggest related videos
5. **Offline Support** - Download videos for offline viewing
6. **User Ratings** - Allow users to rate video relevance

## Testing

To test the integration:

1. Start the Flask backend: `cd flask-backend && python app.py`
2. Start the Next.js frontend: `cd nextjs-frontend && npm run dev`
3. Navigate to a course (e.g., `/courses/CS162`)
4. Click the "Videos" tab
5. Try generating videos for a week
6. Click on videos to test the modal

## Troubleshooting

### Common Issues

1. **"No videos found"** - Check if Flask backend is running and YouTube API key is set
2. **"Failed to generate videos"** - Verify course path exists and study guides are present
3. **Authentication errors** - Ensure user is logged in and JWT tokens are valid
4. **CORS issues** - Check Flask CORS configuration

### Debug Mode

Enable debug logging in the browser console to see API requests and responses.
