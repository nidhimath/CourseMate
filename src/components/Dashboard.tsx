import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BookOpen, Star, Clock, TrendingUp, Award, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onStartLearning: () => void;
  onSelectClass: (classId: string) => void;
}

export function Dashboard({ onStartLearning, onSelectClass }: DashboardProps) {
  const currentClasses = [
    { id: 'cs170', name: 'CS 170: Algorithms', progress: 75, status: 'active' },
    { id: 'eecs16a', name: 'EECS 16A: Circuits', progress: 60, status: 'active' },
    { id: 'math54', name: 'Math 54: Linear Algebra', progress: 90, status: 'active' },
  ];

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
  ];

  const focusClass = currentClasses[0]; // CS 170 as current focus

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl text-blue-900">Welcome back, Alex!</h2>
        <p className="text-blue-700 max-w-2xl mx-auto">
          Ready to tackle CS 170 algorithms using concepts from your successful CS 61B experience? 
          Coursemate has personalized your learning path based on your academic history.
        </p>
      </div>

      {/* Current Focus Class */}
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
              <span className="text-sm text-blue-900">{focusClass.progress}%</span>
            </div>
            <Progress value={focusClass.progress} className="h-2" />
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
              onClick={onStartLearning}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>

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
            {currentClasses.map((course) => (
              <div 
                key={course.id} 
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => onSelectClass(course.id)}
              >
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{course.name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Progress</span>
                      <span className="text-blue-900">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={course.id === 'cs170' ? 'default' : 'secondary'}
                    className={course.id === 'cs170' ? 'bg-yellow-500 text-yellow-900' : ''}
                  >
                    {course.id === 'cs170' ? 'Focus' : 'Active'}
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
  );
}