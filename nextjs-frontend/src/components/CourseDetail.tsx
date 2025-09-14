'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  GraduationCap,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Play,
  Target,
  TrendingUp
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Assignments from './Assignments';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number; // 0-100
  week: number;
  order: number;
  content?: string;
}

interface CourseDetailProps {
  courseCode: string;
  courseName: string;
  description: string;
  instructor: string;
  semester: string;
  units: number;
}

export default function CourseDetail({ 
  courseCode, 
  courseName, 
  description, 
  instructor, 
  semester, 
  units 
}: CourseDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [lessonContent, setLessonContent] = useState<{[key: string]: any}>({});

  const toggleLessonExpansion = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
      // Fetch lesson content when expanding
      fetchLessonContent(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const fetchLessonContent = async (lessonId: string) => {
    if (lessonContent[lessonId]) return; // Already fetched
    
    try {
      const [week, lessonNumber] = lessonId.split('-');
      const response = await fetch(`/api/cs162/content/${week}`);
      if (response.ok) {
        const data = await response.json();
        setLessonContent(prev => ({
          ...prev,
          [lessonId]: data
        }));
      }
    } catch (error) {
      console.error('Error fetching lesson content:', error);
    }
  };



  // Check URL parameters on every render to ensure we catch navigation changes
  useEffect(() => {
    const weekParam = searchParams.get('week');
    console.log('CourseDetail: URL week parameter:', weekParam);
    console.log('CourseDetail: Current selectedWeek:', selectedWeek);
    console.log('CourseDetail: All search params:', Object.fromEntries(searchParams.entries()));
    console.log('CourseDetail: Current URL:', window.location.href);
    
    if (weekParam) {
      const weekNumber = parseInt(weekParam, 10);
      console.log('CourseDetail: Parsed week number:', weekNumber);
      if (weekNumber >= 1 && weekNumber <= 15) {
        if (weekNumber !== selectedWeek) {
          console.log('CourseDetail: Week changed from', selectedWeek, 'to', weekNumber);
          setSelectedWeek(weekNumber);
        } else {
          console.log('CourseDetail: Week already set to', weekNumber);
        }
      } else {
        console.log('CourseDetail: Invalid week number:', weekNumber);
      }
    } else {
      console.log('CourseDetail: No week parameter found, keeping current week:', selectedWeek);
    }
  }, [searchParams]);

  // Force re-render when URL changes by using a key
  const urlKey = searchParams.get('week') || '1';

  useEffect(() => {
    fetchLessons();
  }, [courseCode, selectedWeek]);

  // Update lesson completion status after lessons are generated

  const fetchLessons = async () => {
    console.log('fetchLessons called for week:', selectedWeek);
    console.log('fetchLessons: Current URL:', window.location.href);
    console.log('fetchLessons: Search params:', Object.fromEntries(searchParams.entries()));
    setIsLoading(true);
    try {
      // For courses with study guides (CS162, CS170, EECS126), generate lessons from content
      if (['CS162', 'CS170', 'EECS126'].includes(courseCode)) {
        const courseLessons = await generateLessons(selectedWeek, courseCode);
        console.log('Generated lessons for week', selectedWeek, ':', courseLessons.length, 'lessons');
        setLessons(courseLessons);
      } else {
        // For other courses, fetch from API
        const response = await fetch(`/api/courses/${courseCode}/lessons?week=${selectedWeek}`);
        if (response.ok) {
          const data = await response.json();
          setLessons(data.lessons);
        }
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLessons = async (week: number, courseCode: string): Promise<Lesson[]> => {
    console.log(`generateLessons called with week: ${week}, course: ${courseCode}`);
    const weekLessons: Lesson[] = [];
    
    try {
      // Fetch the lessons for this week based on course code
      console.log('Fetching lessons for week:', week);
      const response = await fetch(`/api/${courseCode.toLowerCase()}/content/${week}`);
      if (response.ok) {
        const data = await response.json();
        const lessons = data.lessons;
        console.log('Found', lessons.length, 'lessons for week', week);
        
        // Convert the API response to our Lesson format
        lessons.forEach((lesson: any, index: number) => {
          const lessonId = lesson.id;
          weekLessons.push({
            id: lessonId,
            title: lesson.title,
            description: `Study guide content for ${lesson.title}`,
            duration: 45,
            difficulty: 'Beginner',
            completed: false,
            progress: 0,
            week,
            order: index + 1,
            content: lesson.content // Store the HTML content
          });
        });
      }
    } catch (error) {
      console.error(`Error generating ${courseCode} lessons:`, error);
    }
    
    // If no lessons found, create a default one
    if (weekLessons.length === 0) {
      weekLessons.push({
        id: `${week}-1`,
        title: `Week ${week} Overview`,
        description: `Introduction to Week ${week} concepts`,
        duration: 45,
        difficulty: 'Beginner',
        completed: false,
        progress: 0,
        week,
        order: 1,
        content: ''
      });
    }
    
    return weekLessons;
  };



  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleLessonClick = (lesson: Lesson) => {
    router.push(`/courses/${courseCode}/lessons/${lesson.id}`);
  };

  const handleToggleLessonCompletion = (lessonId: string) => {
    setLessons(prevLessons => 
      prevLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      )
    );
  };

  return (
    <div key={urlKey} className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {courseCode}: {courseName}
              </h1>
              <p className="text-gray-600 mb-4 max-w-3xl">
                {description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{semester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{units} units</span>
                </div>
              </div>
            </div>
            
            {/* Progress Card */}
            <Card className="w-64">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {overallProgress}%
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Overall Progress
                </div>
                <Progress value={overallProgress} className="mb-3" />
                <div className="text-sm text-gray-600">
                  {completedLessons} of {totalLessons} lessons
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lessons" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-6">
            <div className="flex gap-6">
              {/* Week Selector */}
              <div className="w-48">
                <div className="text-sm font-medium text-gray-700 mb-3">Week:</div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((week) => (
                    <Button
                      key={week}
                      variant={selectedWeek === week ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        console.log('CourseDetail: Week button clicked, setting week to:', week);
                        setSelectedWeek(week);
                        // Update URL to reflect the selected week
                        const url = new URL(window.location.href);
                        url.searchParams.set('week', week.toString());
                        console.log('CourseDetail: Updating URL to:', url.pathname + url.search);
                        router.push(url.pathname + url.search);
                      }}
                      className="w-full justify-start"
                    >
                      {week}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Lessons List */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : lessons.length > 0 ? (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <Card 
                        key={lesson.id} 
                        className={`overflow-hidden ${
                          lesson.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <CardHeader 
                              className="cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleLessonExpansion(lesson.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  {lesson.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                  )}
                                  
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                      {lesson.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {lesson.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{lesson.duration} min</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLessonCompletion(lesson.id);
                                    }}
                                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                                      lesson.completed 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'bg-white border-gray-300 hover:border-gray-400'
                                    }`}
                                  />
                                  {expandedLessons.has(lesson.id) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <CardContent className="space-y-6">
                              {/* Lesson Content */}
                              <div className="space-y-4">
                                {lesson.content ? (
                                  <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                                  />
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No content available for this lesson.</p>
                                )}
                              </div>
                              
                              {lesson.progress > 0 && (
                                <div className="flex items-center gap-2">
                                  <Progress value={lesson.progress} className="flex-1 h-2" />
                                  <span className="text-xs text-gray-500">{lesson.progress}%</span>
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons available</h3>
                    <p className="text-gray-600">
                      No content is available for this week. Please check back later.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <Assignments courseCode={courseCode} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
