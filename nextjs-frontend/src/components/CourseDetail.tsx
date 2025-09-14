'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  GraduationCap,
  Clock,
  CheckCircle,
  ChevronRight,
  BookOpen,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [courseCode, selectedWeek]);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      // For CS162, we'll generate lessons based on the weekly content we have
      if (courseCode === 'CS162') {
        const cs162Lessons = await generateCS162Lessons(selectedWeek);
        setLessons(cs162Lessons);
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

  const generateCS162Lessons = async (week: number): Promise<Lesson[]> => {
    // Generate lessons based on the CS162 study guides we have
    const weekLessons: Lesson[] = [];
    
    try {
      // Fetch the study guide content for this week
      const response = await fetch(`/api/cs162/week/${week}`);
      if (response.ok) {
        const data = await response.json();
        const content = data.content;
        
        // Parse the content to extract lesson topics and group them into 2-3 lessons max
        const lines = content.split('\n');
        const allSections: string[] = [];
        
        for (const line of lines) {
          if (line.startsWith('##') && !line.includes('CS162')) {
            allSections.push(line.replace(/^#+\s*/, '').trim());
          }
        }
        
        // Group sections into 2-3 lessons
        const groupedLessons = groupSectionsIntoLessons(allSections, week);
        weekLessons.push(...groupedLessons);
      }
    } catch (error) {
      console.error('Error generating CS162 lessons:', error);
    }
    
    // If no lessons found, create default ones
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
        order: 1
      });
    }
    
    return weekLessons;
  };

  const groupSectionsIntoLessons = (sections: string[], week: number): Lesson[] => {
    if (sections.length === 0) {
      return [{
        id: `${week}-1`,
        title: `Week ${week} Overview`,
        description: `Introduction to Week ${week} concepts`,
        duration: 45,
        difficulty: 'Beginner',
        completed: false,
        progress: 0,
        week,
        order: 1
      }];
    }

    const lessons: Lesson[] = [];
    
    if (sections.length <= 3) {
      // Use sections as-is
      sections.forEach((section, index) => {
        lessons.push({
          id: `${week}-${index + 1}`,
          title: section,
          description: `Study guide content for ${section}`,
          duration: 45,
          difficulty: index === 0 ? 'Beginner' : index === 1 ? 'Intermediate' : 'Advanced',
          completed: false,
          progress: 0,
          week,
          order: index + 1
        });
      });
    } else if (sections.length <= 6) {
      // Group into 2 lessons
      const midPoint = Math.ceil(sections.length / 2);
      const firstGroup = sections.slice(0, midPoint);
      const secondGroup = sections.slice(midPoint);
      
      lessons.push({
        id: `${week}-1`,
        title: `Core Concepts: ${firstGroup[0]}`,
        description: `Study guide covering ${firstGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Beginner',
        completed: false,
        progress: 0,
        week,
        order: 1
      });
      
      lessons.push({
        id: `${week}-2`,
        title: `Advanced Topics: ${secondGroup[0]}`,
        description: `Study guide covering ${secondGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Intermediate',
        completed: false,
        progress: 0,
        week,
        order: 2
      });
    } else {
      // Group into 3 lessons
      const third = Math.ceil(sections.length / 3);
      const firstGroup = sections.slice(0, third);
      const secondGroup = sections.slice(third, third * 2);
      const thirdGroup = sections.slice(third * 2);
      
      lessons.push({
        id: `${week}-1`,
        title: `Introduction: ${firstGroup[0]}`,
        description: `Study guide covering ${firstGroup.join(', ')}`,
        duration: 45,
        difficulty: 'Beginner',
        completed: false,
        progress: 0,
        week,
        order: 1
      });
      
      lessons.push({
        id: `${week}-2`,
        title: `Core Concepts: ${secondGroup[0]}`,
        description: `Study guide covering ${secondGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Intermediate',
        completed: false,
        progress: 0,
        week,
        order: 2
      });
      
      lessons.push({
        id: `${week}-3`,
        title: `Advanced Applications: ${thirdGroup[0]}`,
        description: `Study guide covering ${thirdGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Advanced',
        completed: false,
        progress: 0,
        week,
        order: 3
      });
    }
    
    return lessons;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleLessonClick = (lesson: Lesson) => {
    router.push(`/courses/${courseCode}/lessons/${lesson.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                      onClick={() => setSelectedWeek(week)}
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
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <Card 
                        key={lesson.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow bg-green-50 border-green-200"
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <CardContent className="p-4">
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
                              <Badge className={getDifficultyColor(lesson.difficulty)}>
                                {lesson.difficulty}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          
                          {lesson.progress > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              <Progress value={lesson.progress} className="flex-1 h-2" />
                              <span className="text-xs text-gray-500">{lesson.progress}%</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Assignments will be available soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
