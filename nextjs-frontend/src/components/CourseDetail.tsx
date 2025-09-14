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
import { useLessonContext } from '@/contexts/LessonContext';
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
  const { isLessonCompleted, getLessonProgress, toggleLessonCompletion } = useLessonContext();
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

  const generateLessonContent = (lesson: Lesson) => {
    const content = lessonContent[lesson.id];
    const [week, lessonNumber] = lesson.id.split('-');
    
    // If we have actual content from the API, use it
    if (content && content.sections && content.content) {
      const sections = content.sections;
      const lessonIndex = parseInt(lessonNumber) - 1;
      
      if (sections[lessonIndex]) {
        const sectionTitle = sections[lessonIndex];
        
        // Extract key information from the actual content
        const fullContent = content.content;
        const sectionContent = extractSectionContent(fullContent, sectionTitle);
        
        return {
          coreConcepts: extractCoreConcepts(sectionContent, sectionTitle),
          keyTradeoffs: extractKeyTradeoffs(sectionContent, sectionTitle),
          keyInformation: extractKeyInformation(sectionContent, sectionTitle),
          leadingQuestions: generateLeadingQuestions(sectionTitle, sectionContent),
          reflectionQuestion: `Reflect on ${sectionTitle}. How does this concept relate to the broader operating systems principles you've learned? What are the practical implications for system design?`
        };
      }
    }

    // Fallback content if no real content is available
    return {
      coreConcepts: [
        `Week ${week} Core Concept 1: Fundamental principles`,
        `Week ${week} Core Concept 2: Key methodologies`,
        `Week ${week} Core Concept 3: Practical applications`,
        `Week ${week} Core Concept 4: Advanced topics`
      ],
      keyTradeoffs: [
        `Week ${week} Tradeoff 1: Performance vs. Complexity`,
        `Week ${week} Tradeoff 2: Memory vs. Speed`,
        `Week ${week} Tradeoff 3: Security vs. Usability`,
        `Week ${week} Tradeoff 4: Scalability vs. Simplicity`
      ],
      keyInformation: [
        `Week ${week} Lesson ${lessonNumber} key information point 1`,
        `Week ${week} Lesson ${lessonNumber} key information point 2`,
        `Week ${week} Lesson ${lessonNumber} key information point 3`
      ],
      leadingQuestions: [
        `1. What are the main concepts covered in Week ${week}?`,
        `2. How do these concepts apply to real-world scenarios?`,
        `3. What are the practical implications of this lesson?`
      ],
      reflectionQuestion: `Reflect on the key concepts from Week ${week}, Lesson ${lessonNumber}. How do they connect to your overall understanding of the course material?`
    };
  };

  const extractSectionContent = (fullContent: string, sectionTitle: string): string => {
    // Find the section in the content
    const lines = fullContent.split('\n');
    let sectionStart = -1;
    let sectionEnd = lines.length;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(sectionTitle)) {
        sectionStart = i;
        break;
      }
    }
    
    if (sectionStart === -1) return '';
    
    // Find the end of this section (next ## header)
    for (let i = sectionStart + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        sectionEnd = i;
        break;
      }
    }
    
    return lines.slice(sectionStart, sectionEnd).join('\n');
  };

  const extractCoreConcepts = (content: string, sectionTitle: string): string[] => {
    const concepts: string[] = [];
    const lines = content.split('\n');
    
    // Look for key concepts in the content
    for (const line of lines) {
      if (line.includes('→') || line.includes('**') || line.includes('x')) {
        const cleanLine = line.replace(/^[→x\s-]+/, '').replace(/\*\*/g, '').trim();
        if (cleanLine.length > 10 && cleanLine.length < 100) {
          concepts.push(cleanLine);
        }
      }
    }
    
    // If we don't have enough concepts, generate some based on the section title
    if (concepts.length < 3) {
      concepts.push(
        `${sectionTitle}: Core definition and principles`,
        `${sectionTitle}: Key characteristics and properties`,
        `${sectionTitle}: Implementation considerations`,
        `${sectionTitle}: Performance implications`
      );
    }
    
    return concepts.slice(0, 4);
  };

  const extractKeyTradeoffs = (content: string, sectionTitle: string): string[] => {
    const tradeoffs: string[] = [];
    const lines = content.split('\n');
    
    // Look for tradeoff-related content
    for (const line of lines) {
      if (line.toLowerCase().includes('tradeoff') || 
          line.toLowerCase().includes('vs') || 
          line.toLowerCase().includes('balance') ||
          line.toLowerCase().includes('overhead')) {
        const cleanLine = line.replace(/^[→x\s-]+/, '').replace(/\*\*/g, '').trim();
        if (cleanLine.length > 10 && cleanLine.length < 100) {
          tradeoffs.push(cleanLine);
        }
      }
    }
    
    // If we don't have enough tradeoffs, generate some
    if (tradeoffs.length < 3) {
      tradeoffs.push(
        `${sectionTitle}: Performance vs. complexity considerations`,
        `${sectionTitle}: Memory and resource management tradeoffs`,
        `${sectionTitle}: Scalability vs. simplicity`,
        `${sectionTitle}: Security vs. usability`
      );
    }
    
    return tradeoffs.slice(0, 4);
  };

  const extractKeyInformation = (content: string, sectionTitle: string): string[] => {
    const info: string[] = [];
    const lines = content.split('\n');
    
    // Extract key information points
    for (const line of lines) {
      if (line.includes('→') || line.includes('**') || line.includes('x')) {
        const cleanLine = line.replace(/^[→x\s-]+/, '').replace(/\*\*/g, '').trim();
        if (cleanLine.length > 20 && cleanLine.length < 150) {
          info.push(cleanLine);
        }
      }
    }
    
    // If we don't have enough info, generate some
    if (info.length < 3) {
      info.push(
        `${sectionTitle} is a fundamental concept in operating systems`,
        `Understanding ${sectionTitle} is crucial for system design`,
        `Practical applications of ${sectionTitle} in real systems`
      );
    }
    
    return info.slice(0, 3);
  };

  const generateLeadingQuestions = (sectionTitle: string, content: string): string[] => {
    return [
      `1. What is ${sectionTitle} and why is it important in operating systems?`,
      `2. How does ${sectionTitle} relate to other OS concepts you've learned?`,
      `3. What are the practical implications and applications of ${sectionTitle}?`
    ];
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
  useEffect(() => {
    if (lessons.length > 0) {
      console.log('Updating lesson completion status for', lessons.length, 'lessons');
      setLessons(prevLessons => 
        prevLessons.map(lesson => ({
          ...lesson,
          completed: isLessonCompleted(lesson.id),
          progress: getLessonProgress(lesson.id)
        }))
      );
    }
  }, [lessons.length, isLessonCompleted, getLessonProgress]);

  const fetchLessons = async () => {
    console.log('fetchLessons called for week:', selectedWeek);
    console.log('fetchLessons: Current URL:', window.location.href);
    console.log('fetchLessons: Search params:', Object.fromEntries(searchParams.entries()));
    setIsLoading(true);
    try {
      // For CS162, we'll generate lessons based on the weekly content we have
      if (courseCode === 'CS162') {
        const cs162Lessons = await generateCS162Lessons(selectedWeek);
        console.log('Generated lessons for week', selectedWeek, ':', cs162Lessons.length, 'lessons');
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
    console.log('generateCS162Lessons called with week:', week);
    // Generate lessons based on the CS162 study guides we have
    const weekLessons: Lesson[] = [];
    
    try {
      // Fetch the study guide content for this week
      console.log('Fetching content for week:', week);
      const response = await fetch(`/api/cs162/week/${week}`);
      if (response.ok) {
        const data = await response.json();
        const content = data.content;
        console.log('Content length for week', week, ':', content.length);
        
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
        console.log('Generated', groupedLessons.length, 'lessons for week', week);
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
    console.log('groupSectionsIntoLessons called with week:', week, 'and', sections.length, 'sections');
    if (sections.length === 0) {
      console.log('No sections found, creating default lesson for week:', week);
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
        const lessonId = `${week}-${index + 1}`;
        lessons.push({
          id: lessonId,
          title: section,
          description: `Study guide content for ${section}`,
          duration: 45,
          difficulty: 'Beginner',
          completed: isLessonCompleted(lessonId),
          progress: getLessonProgress(lessonId),
          week,
          order: index + 1
        });
      });
    } else if (sections.length <= 6) {
      // Group into 2 lessons
      const midPoint = Math.ceil(sections.length / 2);
      const firstGroup = sections.slice(0, midPoint);
      const secondGroup = sections.slice(midPoint);
      
      const firstLessonId = `${week}-1`;
      lessons.push({
        id: firstLessonId,
        title: `Core Concepts: ${firstGroup[0]}`,
        description: `Study guide covering ${firstGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Beginner',
        completed: false, // Will be updated after generation
        progress: 0, // Will be updated after generation
        week,
        order: 1
      });
      
      const secondLessonId = `${week}-2`;
      lessons.push({
        id: secondLessonId,
        title: `Advanced Topics: ${secondGroup[0]}`,
        description: `Study guide covering ${secondGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Beginner',
        completed: false, // Will be updated after generation
        progress: 0, // Will be updated after generation
        week,
        order: 2
      });
    } else {
      // Group into 3 lessons
      const third = Math.ceil(sections.length / 3);
      const firstGroup = sections.slice(0, third);
      const secondGroup = sections.slice(third, third * 2);
      const thirdGroup = sections.slice(third * 2);
      
      const firstLessonId = `${week}-1`;
      lessons.push({
        id: firstLessonId,
        title: `Introduction: ${firstGroup[0]}`,
        description: `Study guide covering ${firstGroup.join(', ')}`,
        duration: 45,
        difficulty: 'Beginner',
        completed: false, // Will be updated after generation
        progress: 0, // Will be updated after generation
        week,
        order: 1
      });
      
      const secondLessonId = `${week}-2`;
      lessons.push({
        id: secondLessonId,
        title: `Core Concepts: ${secondGroup[0]}`,
        description: `Study guide covering ${secondGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Beginner',
        completed: false, // Will be updated after generation
        progress: 0, // Will be updated after generation
        week,
        order: 2
      });
      
      const thirdLessonId = `${week}-3`;
      lessons.push({
        id: thirdLessonId,
        title: `Advanced Applications: ${thirdGroup[0]}`,
        description: `Study guide covering ${thirdGroup.join(', ')}`,
        duration: 60,
        difficulty: 'Beginner',
        completed: false, // Will be updated after generation
        progress: 0, // Will be updated after generation
        week,
        order: 3
      });
    }
    
    console.log('Generated lessons for week', week, ':', lessons.length, 'lessons');
    return lessons;
  };


  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleLessonClick = (lesson: Lesson) => {
    router.push(`/courses/${courseCode}/lessons/${lesson.id}`);
  };

  const handleToggleLessonCompletion = async (lessonId: string) => {
    try {
      console.log('Toggling completion for lesson:', lessonId);
      // Toggle lesson completion in the context (this will persist)
      await toggleLessonCompletion(lessonId);
      
      // Update only the specific lesson that was clicked
      setLessons(prevLessons => 
        prevLessons.map(lesson => 
          lesson.id === lessonId 
            ? { 
                ...lesson, 
                completed: !lesson.completed, 
                progress: lesson.completed ? 0 : 100 
              }
            : lesson
        )
      );
      console.log('Updated lesson completion for:', lessonId);
    } catch (error) {
      console.error('Error toggling lesson completion:', error);
    }
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
                ) : (
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLessonCompletion(lesson.id);
                                    }}
                                    className="text-xs"
                                  >
                                    {lesson.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                  </Button>
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
                              {/* Learning Notes Section */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-blue-500" />
                                  Learning Notes
                                </h4>
                                
                                {(() => {
                                  const content = generateLessonContent(lesson);
                                  return (
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <h5 className="font-medium text-gray-900">Core Concepts</h5>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                          {content.coreConcepts.map((concept, index) => (
                                            <li key={index}>• {concept}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <h5 className="font-medium text-gray-900">Key Tradeoffs</h5>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                          {content.keyTradeoffs.map((tradeoff, index) => (
                                            <li key={index}>• {tradeoff}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Problem Breakdown Section */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <Target className="h-4 w-4 text-green-500" />
                                  Problem Breakdown
                                </h4>
                                
                                {(() => {
                                  const content = generateLessonContent(lesson);
                                  return (
                                    <div className="space-y-3">
                                      <Card className="border-l-4 border-l-blue-500">
                                        <CardHeader className="py-3">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <CardTitle className="text-base">Part (a): Understanding Core Concepts</CardTitle>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="space-y-2">
                                            <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                              <CheckCircle className="h-4 w-4 text-blue-500" />
                                              Key Information
                                            </h5>
                                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                                              {content.keyInformation.map((info, index) => (
                                                <li key={index}>• {info}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                              <TrendingUp className="h-4 w-4 text-green-500" />
                                              Leading Questions
                                            </h5>
                                            <ol className="text-sm text-gray-600 space-y-1 ml-6">
                                              {content.leadingQuestions.map((question, index) => (
                                                <li key={index}>{question}</li>
                                              ))}
                                            </ol>
                                          </div>
                                        </CardContent>
                                      </Card>
                                      
                                      <Card className="border-l-4 border-l-green-500">
                                        <CardHeader className="py-3">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <CardTitle className="text-base">Part (b): Practical Applications</CardTitle>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="space-y-2">
                                            <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                              <CheckCircle className="h-4 w-4 text-blue-500" />
                                              Key Information
                                            </h5>
                                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                                              <li>• Real-world examples and practical applications</li>
                                              <li>• Performance optimization techniques and tradeoffs</li>
                                              <li>• Common problems and their solutions</li>
                                            </ul>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                              <TrendingUp className="h-4 w-4 text-green-500" />
                                              Leading Questions
                                            </h5>
                                            <ol className="text-sm text-gray-600 space-y-1 ml-6">
                                              <li>1. How would you apply these concepts in practice?</li>
                                              <li>2. What are the tradeoffs in real-world implementations?</li>
                                              <li>3. How do these concepts scale in larger systems?</li>
                                            </ol>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Check Understanding Section */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                                  Check Understanding
                                </h4>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <p className="text-sm text-gray-700">
                                    <strong>Reflection Question:</strong> {generateLessonContent(lesson).reflectionQuestion}
                                  </p>
                                </div>
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
