'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Youtube,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import VideoModal from './VideoModal';

interface WeekVideo {
  id: number;
  course_code: string;
  week_number: number;
  topic: string;
  video_title: string;
  video_url: string;
  video_id: string;
  channel_name: string;
  duration_seconds: number;
  relevance_score: number;
  thumbnail_url?: string;
  description?: string;
}

interface WeekVideosProps {
  courseCode: string;
  weekNumber: number;
  onVideoClick?: (video: WeekVideo) => void;
}

export default function WeekVideos({ courseCode, weekNumber, onVideoClick }: WeekVideosProps) {
  const [videos, setVideos] = useState<WeekVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WeekVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/week-videos/${courseCode}/weeks/${weekNumber}/videos`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No videos found for this week');
          setVideos([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideos = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Determine course path based on course code
      const coursePath = `/Users/nidhimathihalli/Documents/GitHub/CourseMate/${courseCode}_New`;
      
      const response = await fetch(`/api/week-videos/${courseCode}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_path: coursePath,
          max_videos_per_week: 3,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429 || errorData.quota_exceeded) {
          throw new Error('YouTube API quota exceeded. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to generate videos');
      }
      
      const data = await response.json();
      console.log('Video generation result:', data);
      
      // Refresh videos after generation
      await fetchVideos();
    } catch (err) {
      console.error('Error generating videos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate videos';
      setError(errorMessage);
      
      // Check if it's a quota exceeded error
      if (errorMessage.includes('quota exceeded')) {
        setQuotaExceeded(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRelevanceColor = (score: number): string => {
    if (score >= 7) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleVideoClick = (video: WeekVideo) => {
    if (onVideoClick) {
      onVideoClick(video);
    } else {
      // Default behavior: open modal
      setSelectedVideo(video);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  useEffect(() => {
    fetchVideos();
  }, [courseCode, weekNumber]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Week {weekNumber} Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Week {weekNumber} Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Available</h3>
            <p className="text-gray-600 mb-4">
              {error === 'No videos found for this week' 
                ? 'No YouTube videos have been generated for this week yet.'
                : error
              }
            </p>
            <Button 
              onClick={generateVideos}
              disabled={isGenerating || quotaExceeded}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Videos...
                </>
              ) : quotaExceeded ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  API Quota Exceeded
                </>
              ) : (
                <>
                  <Youtube className="h-4 w-4" />
                  Generate Videos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Week {weekNumber} Videos
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateVideos}
            disabled={isGenerating || quotaExceeded}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : quotaExceeded ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Quota Exceeded
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Educational YouTube videos related to this week's content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
        
        {videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.video_title}
                        className="w-32 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                        <Play className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {video.video_title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {video.channel_name}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRelevanceColor(video.relevance_score)}`}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {video.relevance_score.toFixed(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(video.duration_seconds)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <span>YouTube</span>
                      </div>
                    </div>
                    
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
            <p className="text-gray-600 mb-4">
              No YouTube videos have been generated for this week yet.
            </p>
            <Button 
              onClick={generateVideos}
              disabled={isGenerating || quotaExceeded}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Videos...
                </>
              ) : quotaExceeded ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  API Quota Exceeded
                </>
              ) : (
                <>
                  <Youtube className="h-4 w-4" />
                  Generate Videos
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        video={selectedVideo}
      />
    </Card>
  );
}
