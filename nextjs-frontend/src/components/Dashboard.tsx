'use client'

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { BookOpen, Star, Clock, TrendingUp, Award, ChevronRight, LogOut } from 'lucide-react'
import { dataService, Course } from '@/lib/dataService'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await dataService.getCourses()
        setCourses(coursesData)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const transcript = [
    { semester: 'Fall 2023', courses: [
      { code: 'CS 61A', name: 'Structure & Interpretation', grade: 'A', units: 4 },
      { code: 'Math 1A', name: 'Calculus', grade: 'A-', units: 4 },
      { code: 'Physics 7A', name: 'Physics for Scientists', grade: 'B+', units: 4 },
    ]},
    { semester: 'Spring 2024', courses: [
      { code: 'CS 61B', name: 'Data Structures', grade: 'A', units: 4 },
      { code: 'Math 1B', name: 'Calculus', grade: 'A', units: 4 },
      { code: 'EE 16A', name: 'Designing Circuits', grade: 'B+', units: 4 },
    ]},
  ]

  const focusClass = courses[0] // First course as current focus

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const handleClassSelect = (classId: string) => {
    router.push(`/class/${classId}`)
  }

  const handleStartLearning = () => {
    router.push('/knowledge-graph')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading courses...</p>
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-700">{session?.user?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl text-blue-900">Welcome back, {session?.user?.name?.split(' ')[0]}!</h2>
            <p className="text-blue-700 max-w-2xl mx-auto">
              Ready to tackle {focusClass?.name || 'your courses'} using concepts from your successful CS 61B experience? 
              Coursemate has personalized your learning path based on your academic history.
            </p>
          </div>

          {/* Current Focus Class */}
          {focusClass && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-900">Current Focus</CardTitle>
                      <p className="text-blue-700">{focusClass.name}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 text-yellow-900">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Course Progress</span>
                    <span className="text-sm text-blue-900">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-4 text-sm text-blue-700">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>3 lessons left this week</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Adapted from CS 61B style</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleStartLearning}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <TrendingUp className="w-5 h-5" />
                  <span>Current Classes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    onClick={() => handleClassSelect(course.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{course.name}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Progress</span>
                          <span className="text-blue-900">75%</span>
                        </div>
                        <Progress value={75} className="h-1" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={course.id === focusClass?.id ? 'default' : 'secondary'}
                        className={course.id === focusClass?.id ? 'bg-yellow-500 text-yellow-900' : ''}
                      >
                        {course.id === focusClass?.id ? 'Focus' : 'Active'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Transcript Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Award className="w-5 h-5" />
                  <span>Academic History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transcript.map((semester, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="font-medium text-blue-900">{semester.semester}</h4>
                    <div className="space-y-2">
                      {semester.courses.map((course, courseIdx) => (
                        <div key={courseIdx} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-blue-900">{course.code}</p>
                            <p className="text-xs text-blue-700">{course.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-blue-700">{course.units} units</span>
                            <Badge 
                              className={`text-xs ${getGradeColor(course.grade)}`}
                              variant="secondary"
                            >
                              {course.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-blue-900 mb-1">3.7</div>
                <p className="text-sm text-blue-700">GPA</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-blue-900 mb-1">42</div>
                <p className="text-sm text-blue-700">Units Completed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-blue-900 mb-1">12</div>
                <p className="text-sm text-blue-700">Lessons This Week</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-blue-900 mb-1">85%</div>
                <p className="text-sm text-blue-700">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
