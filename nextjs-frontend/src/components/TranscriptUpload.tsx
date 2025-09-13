'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle, FileText, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface TranscriptUploadProps {
  onUploadSuccess?: (data: any) => void;
}

export default function TranscriptUpload({ onUploadSuccess }: TranscriptUploadProps) {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadStatus('idle');
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a PDF file');
        setUploadStatus('error');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
    } else {
      setErrorMessage('Please drop a PDF file');
      setUploadStatus('error');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a PDF file');
      setUploadStatus('error');
      return;
    }

    if (!session?.user?.email) {
      setErrorMessage('Please sign in to upload your transcript');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // First, authenticate with the backend to get a JWT token
      const authResponse = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          google_id: session.user.email, // Using email as ID for simplicity
        }),
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const authData = await authResponse.json();
      const token = authData.access_token;

      // Now upload the transcript with the JWT token
      const formData = new FormData();
      formData.append('transcript_pdf', selectedFile);

      const response = await fetch('http://localhost:5001/api/transcript/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setParsedData(data.parsed_data);
        onUploadSuccess?.(data.parsed_data);
      } else {
        setUploadStatus('error');
        setErrorMessage(data.error || 'Failed to upload transcript');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Network error. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Your Transcript PDF
        </CardTitle>
        <CardDescription>
          Upload your academic transcript PDF to generate a personalized learning curriculum.
          The system will automatically parse your transcript and analyze your completed courses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="h-12 w-12 text-green-500 mx-auto" />
              <div className="text-lg font-medium text-green-700">{selectedFile.name}</div>
              <div className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Remove File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <div className="text-lg font-medium text-gray-700">
                  Drop your transcript PDF here
                </div>
                <div className="text-sm text-gray-500">
                  or click to browse files
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Select PDF File
              </Button>
            </div>
          )}
        </div>

        {uploadStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'success' && parsedData && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transcript uploaded and parsed successfully! Found {parsedData.completed_courses.length} completed courses and {parsedData.current_courses.length} current courses.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing PDF...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Analyze
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isUploading}
          >
            Clear
          </Button>
        </div>

        {parsedData && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Completed Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {parsedData.completed_courses.map((course: any) => {
                      const courseCode = typeof course === 'string' ? course : course.course_code;
                      const grade = typeof course === 'object' ? course.grade : undefined;
                      return (
                        <div key={courseCode} className="text-sm bg-green-50 px-2 py-1 rounded">
                          {courseCode}{grade && ` (${grade})`}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Current Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {parsedData.current_courses.map((course: string) => (
                      <div key={course} className="text-sm bg-blue-50 px-2 py-1 rounded">
                        {course}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {parsedData.gpa > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Academic Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">GPA</div>
                      <div className="text-2xl font-bold">{parsedData.gpa}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Units</div>
                      <div className="text-2xl font-bold">{parsedData.total_units}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}