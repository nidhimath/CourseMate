'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ArrowLeft, BookOpen, Clock, CheckCircle, Play, Lock, Users, Calendar, Target, Award, ChevronRight } from 'lucide-react'

interface ClassLessonsViewProps {
  classId: string
}

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'completed' | 'in-progress' | 'locked' | 'available'
  progress: number
  prerequisitesMet: boolean
  week: number
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
  const router = useRouter()

  const classData = {
    'cs170': {
      name: 'CS 170: Efficient Algorithms and Intractable Problems',
      description: 'Concept and basic techniques in the design and analysis of algorithms; models of computation; lower bounds; algorithms for optimum search trees, balanced trees, VLSI layout, number theory.',
      instructor: 'Prof. Satish Rao',
      semester: 'Spring 2024',
      units: 4,
      overallProgress: 75,
      totalLessons: 28,
      completedLessons: 21,
      lessons: [
        // Week 1
        { id: 'cs170-intro', title: 'Course Introduction & Asymptotic Analysis', description: 'Overview of algorithmic thinking and Big-O notation review', duration: '45 min', difficulty: 'Beginner' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 1 },
        { id: 'cs170-divide-conquer', title: 'Divide and Conquer Algorithms', description: 'Master theorem and recursive algorithm analysis', duration: '60 min', difficulty: 'Intermediate' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 1 },
        { id: 'cs170-sorting', title: 'Advanced Sorting Algorithms', description: 'Beyond comparison sorts: counting, radix, and bucket sort', duration: '50 min', difficulty: 'Intermediate' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 1 },
        
        // Week 2  
        { id: 'cs170-graph-basics', title: 'Graph Algorithms Fundamentals', description: 'Graph representations and basic traversal algorithms', duration: '55 min', difficulty: 'Intermediate' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 2 },
        { id: 'cs170-bfs-dfs', title: 'BFS, DFS and Applications', description: 'Breadth-first and depth-first search with practical applications', duration: '65 min', difficulty: 'Intermediate' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 2 },
        { id: 'cs170-dag', title: 'Directed Acyclic Graphs', description: 'Topological sorting and applications to scheduling', duration: '40 min', difficulty: 'Intermediate' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 2 },
        
        // Week 3
        { id: 'cs170-shortest-paths', title: 'Shortest Path Algorithms', description: 'Dijkstra\'s algorithm and Bellman-Ford for shortest paths', duration: '70 min', difficulty: 'Advanced' as const, status: 'in-progress' as const, progress: 60, prerequisitesMet: true, week: 3 },
        { id: 'cs170-mst', title: 'Minimum Spanning Trees', description: 'Kruskal\'s and Prim\'s algorithms for MST construction', duration: '55 min', difficulty: 'Intermediate' as const, status: 'available' as const, progress: 0, prerequisitesMet: true, week: 3 },
        { id: 'cs170-network-flow', title: 'Network Flow Algorithms', description: 'Max flow min cut theorem and Ford-Fulkerson algorithm', duration: '80 min', difficulty: 'Advanced' as const, status: 'available' as const, progress: 0, prerequisitesMet: false, week: 3 },
        
        // Week 4
        { id: 'cs170-dynamic-programming', title: 'Dynamic Programming Introduction', description: 'Optimal substructure and overlapping subproblems', duration: '75 min', difficulty: 'Advanced' as const, status: 'locked' as const, progress: 0, prerequisitesMet: false, week: 4 },
        { id: 'cs170-dp-applications', title: 'DP Applications', description: 'Classic DP problems: knapsack, edit distance, LCS', duration: '85 min', difficulty: 'Advanced' as const, status: 'locked' as const, progress: 0, prerequisitesMet: false, week: 4 },
        { id: 'cs170-dp-optimization', title: 'DP Optimization Techniques', description: 'Advanced DP: memoization vs tabulation, space optimization', duration: '60 min', difficulty: 'Advanced' as const, status: 'locked' as const, progress: 0, prerequisitesMet: false, week: 4 },
      ],
      assignments: [
        { id: 'hw1', title: 'Homework 1: Divide and Conquer', type: 'homework' as const, dueDate: 'Feb 15', status: 'completed' as const, score: 95 },
        { id: 'hw2', title: 'Homework 2: Graph Algorithms', type: 'homework' as const, dueDate: 'Mar 1', status: 'completed' as const, score: 88 },
        { id: 'hw3', title: 'Homework 3: Shortest Paths', type: 'homework' as const, dueDate: 'Mar 15', status: 'in-progress' as const },
        { id: 'midterm', title: 'Midterm Exam', type: 'exam' as const, dueDate: 'Mar 20', status: 'upcoming' as const },
      ]
    },
    'eecs16a': {
      name: 'EECS 16A: Designing Information Devices and Systems I',
      description: 'Linear algebra, basic circuit analysis, and design of information devices and systems.',
      instructor: 'Prof. Miki Lustig',
      semester: 'Spring 2024',
      units: 4,
      overallProgress: 60,
      totalLessons: 24,
      completedLessons: 14,
      lessons: [
        { id: 'eecs16a-linear-algebra', title: 'Linear Algebra Foundations', description: 'Vectors, matrices, and linear transformations', duration: '50 min', difficulty: 'Beginner' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 1 },
        { id: 'eecs16a-circuits', title: 'Basic Circuit Analysis', description: 'Kirchhoff\'s laws and resistive circuits', duration: '60 min', difficulty: 'Intermediate' as const, status: 'in-progress' as const, progress: 45, prerequisitesMet: true, week: 1 },
      ],
      assignments: [
        { id: 'hw1', title: 'Homework 1: Linear Systems', type: 'homework' as const, dueDate: 'Feb 10', status: 'completed' as const, score: 92 },
        { id: 'lab1', title: 'Lab 1: Circuit Simulation', type: 'project' as const, dueDate: 'Feb 20', status: 'in-progress' as const },
      ]
    },
    'math54': {
      name: 'Math 54: Linear Algebra and Differential Equations',
      description: 'Linear algebra: matrix arithmetic, determinants, eigenvectors. Differential equations: first and second order.',
      instructor: 'Prof. Richard Bamler',
      semester: 'Spring 2024', 
      units: 4,
      overallProgress: 90,
      totalLessons: 20,
      completedLessons: 18,
      lessons: [
        { id: 'math54-matrices', title: 'Matrix Operations', description: 'Matrix multiplication, inverses, and determinants', duration: '45 min', difficulty: 'Beginner' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 1 },
        { id: 'math54-eigenvalues', title: 'Eigenvalues and Eigenvectors', description: 'Computing and interpreting eigenvalues', duration: '55 min', difficulty: 'Intermediate' as const, status: 'completed' as const, progress: 100, prerequisitesMet: true, week: 1 },
      ],
      assignments: [
        { id: 'hw1', title: 'Homework 1: Matrix Operations', type: 'homework' as const, dueDate: 'Feb 8', status: 'completed' as const, score: 98 },
        { id: 'midterm', title: 'Midterm Exam', type: 'exam' as const, dueDate: 'Mar 15', status: 'completed' as const, score: 94 },
      ]
    }
  }

  const currentClass = classData[classId as keyof typeof classData] || classData.cs170
  const weeks = Array.from(new Set(currentClass.lessons.map(lesson => lesson.week))).sort()
  const lessonsForWeek = currentClass.lessons.filter(lesson => lesson.week === selectedWeek)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in-progress': return <Play className="w-4 h-4 text-blue-600" />
      case 'locked': return <Lock className="w-4 h-4 text-gray-400" />
      default: return <BookOpen className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50'
      case 'in-progress': return 'border-blue-200 bg-blue-50'
      case 'locked': return 'border-gray-200 bg-gray-50'
      default: return 'border-blue-200 bg-blue-50'
    }
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
                <h2 className="text-2xl text-blue-900">{currentClass.name}</h2>
                <p className="text-blue-700 max-w-3xl">{currentClass.description}</p>
                <div className="flex items-center space-x-6 text-sm text-blue-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{currentClass.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{currentClass.semester}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{currentClass.units} units</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="w-64">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl text-blue-900">{currentClass.overallProgress}%</div>
                  <p className="text-sm text-blue-700">Overall Progress</p>
                  <Progress value={currentClass.overallProgress} className="h-2" />
                  <p className="text-xs text-blue-600">
                    {currentClass.completedLessons} of {currentClass.totalLessons} lessons
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
                {lessonsForWeek.map((lesson) => (
                  <Card 
                    key={lesson.id}
                    className={`${getStatusColor(lesson.status)} transition-all hover:shadow-md ${
                      lesson.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (lesson.status !== 'locked') {
                        handleLessonSelect(lesson.id)
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">
                            {getStatusIcon(lesson.status)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className={`font-medium ${
                                lesson.status === 'locked' ? 'text-gray-600' : 'text-blue-900'
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
                                {lesson.status !== 'locked' && (
                                  <ChevronRight className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm ${
                              lesson.status === 'locked' ? 'text-gray-500' : 'text-blue-700'
                            }`}>
                              {lesson.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className={`flex items-center space-x-1 ${
                                  lesson.status === 'locked' ? 'text-gray-400' : 'text-blue-600'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.duration}</span>
                                </div>
                                {!lesson.prerequisitesMet && (
                                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                    Prerequisites needed
                                  </Badge>
                                )}
                              </div>
                              
                              {lesson.progress > 0 && (
                                <div className="flex items-center space-x-2">
                                  <Progress value={lesson.progress} className="w-20 h-1" />
                                  <span className="text-xs text-blue-600">{lesson.progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div className="grid gap-4">
                {currentClass.assignments.map((assignment) => (
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
