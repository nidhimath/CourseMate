'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ArrowLeft, BookOpen, Clock, CheckCircle, Play, Lock, Users, Calendar, Target, Award, ChevronRight } from 'lucide-react'
import { dataService, Course, Lesson } from '@/lib/dataService'

interface ClassLessonsViewProps {
  classId: string
}

interface Assignment {
  id: string
  title: string
  type: 'homework' | 'project' | 'exam'
  dueDate: string
  status: 'completed' | 'in-progress' | 'upcoming'
  score?: number
}

export default function ClassLessonsView({ classId }: ClassLessonsViewProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, lessonsData] = await Promise.all([
          dataService.getCourse(classId),
          dataService.getCourseLessons(classId)
        ])
        setCourse(courseData)
        setLessons(lessonsData)
      } catch (error) {
        console.error('Failed to fetch course data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [classId])

  // Mock assignments data (you can replace this with API call later)
  const assignments: Assignment[] = [
    { id: 'hw1', title: 'Homework 1: Divide and Conquer', type: 'homework', dueDate: 'Feb 15', status: 'completed', score: 95 },
    { id: 'hw2', title: 'Homework 2: Graph Algorithms', type: 'homework', dueDate: 'Mar 1', status: 'completed', score: 88 },
    { id: 'hw3', title: 'Homework 3: Shortest Paths', type: 'homework', dueDate: 'Mar 15', status: 'in-progress' },
    { id: 'midterm', title: 'Midterm Exam', type: 'exam', dueDate: 'Mar 20', status: 'upcoming' },
  ]

  // Group lessons by week
  const lessonsByWeek = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.week]) {
      acc[lesson.week] = []
    }
    acc[lesson.week].push(lesson)
    return acc
  }, {} as { [week: number]: Lesson[] })

  const weeks = Object.keys(lessonsByWeek).map(Number).sort()
  const lessonsForWeek = lessonsByWeek[selectedWeek] || []

  const getStatusIcon = (lesson: Lesson) => {
    // Mock status based on lesson data - you can replace with actual progress data
    const isCompleted = lesson.id.includes('intro') || lesson.id.includes('divide') || lesson.id.includes('sorting')
    const isInProgress = lesson.id.includes('shortest')
    const isLocked = lesson.week > 3
    
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (isInProgress) return <Play className="w-4 h-4 text-blue-600" />
    if (isLocked) return <Lock className="w-4 h-4 text-gray-400" />
    return <BookOpen className="w-4 h-4 text-blue-600" />
  }

  const getStatusColor = (lesson: Lesson) => {
    const isCompleted = lesson.id.includes('intro') || lesson.id.includes('divide') || lesson.id.includes('sorting')
    const isInProgress = lesson.id.includes('shortest')
    const isLocked = lesson.week > 3
    
    if (isCompleted) return 'border-green-200 bg-green-50'
    if (isInProgress) return 'border-blue-200 bg-blue-50'
    if (isLocked) return 'border-gray-200 bg-gray-50'
    return 'border-blue-200 bg-blue-50'
  }

  const getLessonStatus = (lesson: Lesson) => {
    const isCompleted = lesson.id.includes('intro') || lesson.id.includes('divide') || lesson.id.includes('sorting')
    const isInProgress = lesson.id.includes('shortest')
    const isLocked = lesson.week > 3
    
    if (isCompleted) return 'completed'
    if (isInProgress) return 'in-progress'
    if (isLocked) return 'locked'
    return 'available'
  }

  const getLessonProgress = (lesson: Lesson) => {
    const isCompleted = lesson.id.includes('intro') || lesson.id.includes('divide') || lesson.id.includes('sorting')
    const isInProgress = lesson.id.includes('shortest')
    
    if (isCompleted) return 100
    if (isInProgress) return 60
    return 0
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleLessonSelect = (lessonId: string) => {
    router.push(`/class/${classId}/lesson/${lessonId}`)
  }

  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading course data...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-blue-900 mb-4">Course not found</h2>
          <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl text-blue-900">Coursemate</h1>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">UC Berkeley</span>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/knowledge-graph')}
                className="text-blue-700 hover:bg-blue-100"
              >
                Knowledge Graph
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/progress')}
                className="text-blue-700 hover:bg-blue-100"
              >
                Progress
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Button variant="ghost" onClick={handleBack} className="text-blue-700 mt-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="space-y-2">
               <h2 className="text-2xl text-blue-900">{course.name}</h2>
               <p className="text-blue-700 max-w-3xl">{course.description}</p>
                <div className="flex items-center space-x-6 text-sm text-blue-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                   <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                   <span>{course.semester}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                   <span>{course.units} units</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="w-64">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl text-blue-900">75%</div>
                  <p className="text-sm text-blue-700">Overall Progress</p>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-blue-600">
                    {lessons.length} lessons available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-6">
              {/* Week Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-700">Week:</span>
                {weeks.map((week) => (
                  <Button
                    key={week}
                    variant={selectedWeek === week ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWeek(week)}
                    className={selectedWeek === week ? 'bg-blue-600 text-white' : 'text-blue-700'}
                  >
                    {week}
                  </Button>
                ))}
              </div>

              {/* Lessons Grid */}
              <div className="grid gap-4">
                 {lessonsForWeek.map((lesson) => {
                   const status = getLessonStatus(lesson)
                   const progress = getLessonProgress(lesson)
                   const isLocked = status === 'locked'
                   
                   return (
                  <Card 
                    key={lesson.id}
                       className={`${getStatusColor(lesson)} transition-all hover:shadow-md ${
                         !isLocked ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                         if (!isLocked) {
                        handleLessonSelect(lesson.id)
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">
                               {getStatusIcon(lesson)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className={`font-medium ${
                                   isLocked ? 'text-gray-600' : 'text-blue-900'
                              }`}>
                                {lesson.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  className={getDifficultyColor(lesson.difficulty)}
                                  variant="secondary"
                                >
                                  {lesson.difficulty}
                                </Badge>
                                   {!isLocked && (
                                  <ChevronRight className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm ${
                                 isLocked ? 'text-gray-500' : 'text-blue-700'
                            }`}>
                              {lesson.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className={`flex items-center space-x-1 ${
                                     isLocked ? 'text-gray-400' : 'text-blue-600'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                     <span>{lesson.duration} min</span>
                                </div>
                              </div>
                              
                                 {progress > 0 && (
                                <div className="flex items-center space-x-2">
                                     <Progress value={progress} className="w-20 h-1" />
                                     <span className="text-xs text-blue-600">{progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                   )
                 })}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-blue-900">{assignment.title}</h3>
                            <Badge 
                              className={getAssignmentStatusColor(assignment.status)}
                              variant="secondary"
                            >
                              {assignment.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {assignment.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-blue-700">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due {assignment.dueDate}</span>
                            </div>
                            {assignment.score && (
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3" />
                                <span>Score: {assignment.score}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {assignment.status !== 'completed' && (
                          <Button variant="outline" size="sm">
                            {assignment.status === 'upcoming' ? 'View Details' : 'Continue'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
