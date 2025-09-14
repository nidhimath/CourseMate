'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  CheckCircle,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonContentProps {
  courseCode: string;
  lessonId: string;
  lessonTitle: string;
  courseName: string;
}

export default function LessonContent({ 
  courseCode, 
  lessonId, 
  lessonTitle, 
  courseName 
}: LessonContentProps) {
  const router = useRouter();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    fetchLessonContent();
  }, [courseCode, lessonId]);

  const fetchLessonContent = async () => {
    setIsLoading(true);
    try {
      if (courseCode === 'CS162') {
        // Extract week from lessonId (format: "week-lessonNumber")
        const week = parseInt(lessonId.split('-')[0]);
        
        const response = await fetch(`/api/cs162/week/${week}`);
        if (response.ok) {
          const data = await response.json();
          const fullContent = data.content;
          
          // Parse content into sections
          const contentSections = parseContentIntoSections(fullContent, lessonId);
          setSections(contentSections);
          setContent(contentSections[0] || fullContent);
          
          // Simulate progress (in real app, this would come from user progress)
          setProgress(Math.floor(Math.random() * 100));
          setIsCompleted(progress >= 100);
        }
      } else {
        // For other courses, fetch from API
        const response = await fetch(`/api/courses/${courseCode}/lessons/${lessonId}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
          setProgress(data.progress || 0);
          setIsCompleted(data.completed || false);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseContentIntoSections = (fullContent: string, lessonId: string): string[] => {
    const lines = fullContent.split('\n');
    const sections: string[] = [];
    let currentSection = '';
    let sectionCount = 0;
    let currentSectionLines: string[] = [];
    
    // First, collect all the content
    for (const line of lines) {
      if (line.startsWith('##') && !line.includes('CS162')) {
        if (currentSectionLines.length > 0) {
          sections.push(currentSectionLines.join('\n'));
          sectionCount++;
          currentSectionLines = [];
        }
        currentSectionLines.push(line);
      } else {
        currentSectionLines.push(line);
      }
    }
    
    // Add the last section
    if (currentSectionLines.length > 0) {
      sections.push(currentSectionLines.join('\n'));
    }
    
    // If no sections found, return the full content
    if (sections.length === 0) {
      return [fullContent];
    }
    
    // Group sections into 2-3 meaningful sections
    const groupedSections = groupSectionsIntoSections(sections);
    
    return groupedSections;
  };

  const groupSectionsIntoSections = (sections: string[]): string[] => {
    if (sections.length <= 3) {
      return sections;
    }
    
    // Group sections into 2-3 meaningful groups
    const grouped: string[] = [];
    
    if (sections.length <= 6) {
      // Group into 2 sections
      const midPoint = Math.ceil(sections.length / 2);
      const firstGroup = sections.slice(0, midPoint);
      const secondGroup = sections.slice(midPoint);
      
      grouped.push(createGroupedSection(firstGroup, "Core Concepts"));
      grouped.push(createGroupedSection(secondGroup, "Advanced Topics"));
    } else {
      // Group into 3 sections
      const third = Math.ceil(sections.length / 3);
      const firstGroup = sections.slice(0, third);
      const secondGroup = sections.slice(third, third * 2);
      const thirdGroup = sections.slice(third * 2);
      
      grouped.push(createGroupedSection(firstGroup, "Introduction & Fundamentals"));
      grouped.push(createGroupedSection(secondGroup, "Core Concepts"));
      grouped.push(createGroupedSection(thirdGroup, "Advanced Applications"));
    }
    
    return grouped;
  };

  const createGroupedSection = (sections: string[], groupTitle: string): string => {
    const combinedContent = sections.join('\n\n');
    return `## ${groupTitle}\n\n${combinedContent}`;
  };

  const handleMarkComplete = async () => {
    try {
      // Update progress in the backend
      const response = await fetch(`/api/courses/${courseCode}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          progress: 100
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
        setProgress(100);
        
        // Show success message
        setTimeout(() => {
          // Could navigate to next lesson or back to course overview
        }, 1000);
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setContent(sections[currentSection + 1]);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setContent(sections[currentSection - 1]);
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/→/g, '&rarr;')
      .replace(/x /g, '&bull; ')
      .replace(/\n/g, '<br>');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseCode}`)}
            className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {lessonTitle}
            </h1>
            <p className="text-blue-600 text-lg">
              Learn {lessonTitle.toLowerCase()} using familiar concepts from {courseCode}
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-sm text-gray-600">
              {currentSection + 1} of {sections.length} sections
            </span>
            <Progress value={((currentSection + 1) / sections.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {sections[currentSection]?.split('\n')[0]?.replace(/^#+\s*/, '') || lessonTitle}
                  </CardTitle>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </>
                ) : (
                  <Button
                    onClick={handleMarkComplete}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(content)
              }}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handlePrevSection}
            disabled={currentSection === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Section
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated time: 45 min</span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleNextSection}
            disabled={currentSection === sections.length - 1}
            className="flex items-center gap-2"
          >
            Next Section
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
