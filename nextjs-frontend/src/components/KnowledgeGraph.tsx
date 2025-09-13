'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useSession } from 'next-auth/react'

interface CourseNode {
  id: string
  name: string
  category: string
  completed: boolean
  current: boolean
  prerequisites: string[]
}

interface KnowledgeGraphProps {
  courses?: CourseNode[]
}

export default function KnowledgeGraph({ courses: propCourses }: KnowledgeGraphProps) {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<CourseNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (propCourses) {
      setCourses(propCourses)
      setLoading(false)
    } else {
      fetchCourses()
    }
  }, [propCourses])

  const fetchCourses = async () => {
    try {
      if (!session?.user?.email) {
        setError('Please sign in to view the knowledge graph')
        setLoading(false)
        return
      }

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
          google_id: session.user.email,
        }),
      })

      if (!authResponse.ok) {
        throw new Error('Authentication failed')
      }

      const authData = await authResponse.json()
      const token = authData.access_token

      // Now fetch courses with the JWT token
      const response = await fetch('http://localhost:5001/api/transcript/curriculum', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Transform the data to match our CourseNode interface
        const transformedCourses: CourseNode[] = []
        
        // Add completed courses
        data.completed_courses?.forEach((course: any) => {
          const courseCode = typeof course === 'string' ? course : course.course_code
          const courseInfo = data.course_details?.[courseCode] || {}
          transformedCourses.push({
            id: courseCode,
            name: courseCode,
            category: courseInfo.category || 'Other',
            completed: true,
            current: false,
            prerequisites: courseInfo.prerequisites || []
          })
        })

        // Add current courses
        data.current_courses?.forEach((courseCode: string) => {
          const courseInfo = data.course_details?.[courseCode] || {}
          transformedCourses.push({
            id: courseCode,
            name: courseCode,
            category: courseInfo.category || 'Other',
            completed: false,
            current: true,
            prerequisites: courseInfo.prerequisites || []
          })
        })

        setCourses(transformedCourses)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load courses')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Knowledge graph fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'CS Core': 'bg-blue-100 text-blue-800',
      'CS Software': 'bg-green-100 text-green-800',
      'CS Theory': 'bg-purple-100 text-purple-800',
      'CS Hardware': 'bg-orange-100 text-orange-800',
      'CS Applications': 'bg-pink-100 text-pink-800',
      'EE Foundation': 'bg-indigo-100 text-indigo-800',
      'EE Signals': 'bg-cyan-100 text-cyan-800',
      'EE Robotics': 'bg-emerald-100 text-emerald-800',
      'EE Circuits': 'bg-amber-100 text-amber-800',
      'EE Power': 'bg-red-100 text-red-800',
      'EE Devices': 'bg-violet-100 text-violet-800',
      'EE Optics': 'bg-teal-100 text-teal-800',
      'Physics': 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getNodeColor = (course: CourseNode) => {
    if (course.completed) return '#10b981' // green
    if (course.current) return '#3b82f6' // blue
    return '#6b7280' // gray
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No courses found. Please upload your transcript first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Course Knowledge Graph</h1>
          <p className="text-blue-700">
            Visualize the relationships between your courses and their prerequisites
          </p>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span className="text-sm">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SVG Knowledge Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Course Prerequisites Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 border rounded-lg bg-white overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {courses.map((course, index) => {
                  const x = 100 + (index % 4) * 150
                  const y = 100 + Math.floor(index / 4) * 100
                  
                  return (
                    <g key={course.id}>
                      {/* Course node */}
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill={getNodeColor(course)}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      
                      {/* Course label */}
                      <text
                        x={x}
                        y={y + 35}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-700"
                      >
                        {course.name}
                      </text>

                      {/* Prerequisite connections */}
                      {course.prerequisites.map((prereq) => {
                        const prereqCourse = courses.find(c => c.name === prereq)
                        if (!prereqCourse) return null

                        const prereqIndex = courses.findIndex(c => c.name === prereq)
                        const prereqX = 100 + (prereqIndex % 4) * 150
                        const prereqY = 100 + Math.floor(prereqIndex / 4) * 100

                        return (
                          <line
                            key={`${course.id}-${prereq}`}
                            x1={prereqX}
                            y1={prereqY}
                            x2={x}
                            y2={y}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        )
                      })}
                    </g>
                  )
                })}

                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#94a3b8"
                    />
                  </marker>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <div className="flex gap-2">
                    {course.completed && (
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    )}
                    {course.current && (
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    )}
                    <Badge className={getCategoryColor(course.category)}>
                      {course.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {course.prerequisites.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Prerequisites:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.prerequisites.map((prereq) => (
                        <Badge
                          key={prereq}
                          variant="secondary"
                          className="text-xs"
                        >
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
