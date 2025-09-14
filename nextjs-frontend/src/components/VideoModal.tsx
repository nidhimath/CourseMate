'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  Youtube,
  Play
} from 'lucide-react';

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

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: WeekVideo | null;
}

export default function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  if (!isOpen || !video) return null;

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

  const handleOpenInYouTube = () => {
    window.open(video.video_url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Video Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.video_title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Video Preview</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleOpenInYouTube}
                className="w-full flex items-center gap-2"
              >
                <Youtube className="h-4 w-4" />
                Watch on YouTube
              </Button>
            </div>
            
            {/* Video Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {video.video_title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">
                    {video.channel_name}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getRelevanceColor(video.relevance_score)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {video.relevance_score.toFixed(1)} relevance
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(video.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>YouTube</span>
                  </div>
                </div>
              </div>
              
              {video.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {video.description}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Course Context</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Course:</strong> {video.course_code}</p>
                  <p><strong>Week:</strong> {video.week_number}</p>
                  <p><strong>Topic:</strong> {video.topic}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
