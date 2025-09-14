'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Upload, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import HomeworkUpload from './HomeworkUpload';
import HomeworkDisplay from './HomeworkDisplay';

interface AssignmentsProps {
  courseCode: string;
}

interface HomeworkData {
  title: string;
  problems: Array<{
    number: number;
    title: string;
    points: number;
    learning_notes: {
      core_concepts: string[];
      key_tradeoffs: string[];
    };
    parts: Array<{
      letter: string;
      description: string;
      key_information: string[];
      leading_questions: string[];
    }>;
    check_understanding: string;
  }>;
  metadata: {
    source_file: string;
    uploaded_at: string;
    total_problems: number;
  };
}

export default function Assignments({ courseCode }: AssignmentsProps) {
  const { data: session, status } = useSession();
  const [homeworkData, setHomeworkData] = useState<HomeworkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Load existing homework on component mount
  useEffect(() => {
    if (status === 'loading') {
      // Session is still loading, don't do anything yet
      return;
    }
    
    if (status === 'unauthenticated') {
      // User is not authenticated, show error
      setError('Please sign in to access assignments');
      setIsLoading(false);
      return;
    }
    
    // Session is loaded and user is authenticated
    loadExistingHomework();
  }, [courseCode, session, status]);

  const loadExistingHomework = async () => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = (session as any).accessToken;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/courses/${courseCode}/homework`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHomeworkData(data.data);
        setShowUpload(false);
      } else if (response.status === 404) {
        // No homework found, show upload form
        setHomeworkData(null);
        setShowUpload(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load homework');
      }
    } catch (error) {
      console.error('Error loading homework:', error);
      setError(error instanceof Error ? error.message : 'Failed to load homework');
      setShowUpload(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (data: HomeworkData) => {
    setHomeworkData(data);
    setShowUpload(false);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDeleteHomework = async () => {
    if (!session) return;
    
    try {
      const token = (session as any).accessToken;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/courses/${courseCode}/homework`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setHomeworkData(null);
        setShowUpload(true);
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete homework');
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete homework');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assignments
          </CardTitle>
          <CardDescription>
            Upload homework assignments to get structured learning exercises and problem-solving guidance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {homeworkData ? (
        <div className="space-y-4">
          {/* Success Message */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Homework assignment loaded successfully! You can now work through the structured exercises.
            </AlertDescription>
          </Alert>
          
          {/* Homework Display */}
          <HomeworkDisplay 
            homeworkData={homeworkData} 
            onDelete={handleDeleteHomework}
          />
        </div>
      ) : showUpload ? (
        <div className="space-y-4">
          {/* Upload Form */}
          <HomeworkUpload
            courseCode={courseCode}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Upload Process</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload your PDF homework assignment</li>
                    <li>• AI analyzes the problems and structure</li>
                    <li>• Generates learning notes and concepts</li>
                    <li>• Creates guided problem-solving questions</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">What you get</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Core concepts for each problem</li>
                    <li>• Key tradeoffs and considerations</li>
                    <li>• Step-by-step problem breakdown</li>
                    <li>• Leading questions to guide thinking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-600 mb-4">
            Upload your first homework assignment to get started with structured learning exercises.
          </p>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Assignment
          </Button>
        </div>
      )}
    </div>
  );
}
