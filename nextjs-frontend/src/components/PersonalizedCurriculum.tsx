'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CourseInfo {
  course_code: string;
  website: string;
  category: string;
  prerequisites: string[];
  missing_prerequisites?: string[];
  can_take?: boolean;
  grade?: string; // Add grade field for completed courses
}

interface CompletedCourse {
  course_code: string;
  grade: string;
}

interface CurriculumData {
  completed_courses: CompletedCourse[];
  current_courses: string[];
  available_courses: string[];
  recommended_courses: string[];
  course_details: Record<string, CourseInfo>;
}

export default function PersonalizedCurriculum() {
  const { data: session } = useSession();
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      if (!session?.user?.email) {
        setError('Please sign in to view your curriculum');
        setIsLoading(false);
        return;
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
          google_id: session.user.email, // Using email as ID for simplicity
        }),
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const authData = await authResponse.json();
      const token = authData.access_token;

      // Now fetch curriculum with the JWT token
      const response = await fetch('http://localhost:5001/api/transcript/curriculum', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurriculumData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load curriculum');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Curriculum fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      if (!session?.user?.email) {
        return [];
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
      });

      if (!authResponse.ok) {
        return [];
      }

      const authData = await authResponse.json();
      const token = authData.access_token;

      // Now fetch recommendations with the JWT token
      const response = await fetch('http://localhost:5001/api/transcript/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.recommendations;
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your personalized curriculum...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!curriculumData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No curriculum data available. Please upload your transcript first.</AlertDescription>
      </Alert>
    );
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
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-800',
      'A-': 'bg-green-100 text-green-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'C-': 'bg-yellow-100 text-yellow-800',
      'D+': 'bg-orange-100 text-orange-800',
      'D': 'bg-orange-100 text-orange-800',
      'D-': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
      'P': 'bg-green-100 text-green-800',
      'S': 'bg-green-100 text-green-800',
      'NP': 'bg-red-100 text-red-800',
      'U': 'bg-red-100 text-red-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  const CourseCard = ({ courseCode, courseInfo, grade }: { courseCode: string; courseInfo: CourseInfo; grade?: string }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{courseCode}</CardTitle>
          <Badge className={grade ? getGradeColor(grade) : getCategoryColor(courseInfo.category)}>
            {grade || courseInfo.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {courseInfo.website && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(courseInfo.website, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Course Materials
          </Button>
        )}
        
        {courseInfo.prerequisites.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Prerequisites:</div>
            <div className="flex flex-wrap gap-1">
              {courseInfo.prerequisites.map((prereq) => (
                <Badge
                  key={prereq}
                  variant={curriculumData.completed_courses.some(course => 
                    (typeof course === 'string' ? course : course.course_code) === prereq
                  ) ? "default" : "secondary"}
                  className="text-xs"
                >
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {courseInfo.missing_prerequisites && courseInfo.missing_prerequisites.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Missing prerequisites: {courseInfo.missing_prerequisites.join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Your Personalized Curriculum</h1>
        <p className="text-gray-600">
          Based on your transcript analysis and course prerequisites
        </p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Current Courses
              </CardTitle>
              <CardDescription>
                Courses you're currently taking this semester.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curriculumData.current_courses.map((courseCode) => {
                  const courseInfo = curriculumData.course_details[courseCode] || {
                    course_code: courseCode,
                    website: "",
                    category: "Other",
                    prerequisites: []
                  };
                  return (
                    <CourseCard
                      key={courseCode}
                      courseCode={courseCode}
                      courseInfo={courseInfo}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Completed Courses
              </CardTitle>
              <CardDescription>
                Courses you've successfully completed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curriculumData.completed_courses.map((course) => {
                  const courseCode = typeof course === 'string' ? course : course.course_code;
                  const grade = typeof course === 'object' ? course.grade : undefined;
                  const courseInfo = curriculumData.course_details[courseCode] || {
                    course_code: courseCode,
                    website: "",
                    category: "Other",
                    prerequisites: []
                  };
                  return (
                    <CourseCard
                      key={courseCode}
                      courseCode={courseCode}
                      courseInfo={courseInfo}
                      grade={grade}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
