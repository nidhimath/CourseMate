'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface WeekContent {
  week: number;
  title: string;
  content: string;
  hasContent: boolean;
}

interface CS162CurriculumData {
  weeks: WeekContent[];
  totalWeeks: number;
  availableWeeks: number;
}

export default function CS162Curriculum() {
  const [curriculumData, setCurriculumData] = useState<CS162CurriculumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weekContent, setWeekContent] = useState<string>('');

  useEffect(() => {
    fetchCS162Content();
  }, []);

  const fetchCS162Content = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the list of available weeks and their content
      const response = await fetch('/api/cs162/weeks');
      
      if (response.ok) {
        const data = await response.json();
        setCurriculumData(data);
      } else {
        setError('Failed to load CS162 curriculum content');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('CS162 content fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeekContent = async (week: number) => {
    try {
      const response = await fetch(`/api/cs162/week/${week}`);
      
      if (response.ok) {
        const data = await response.json();
        setWeekContent(data.content);
        setSelectedWeek(week);
      } else {
        setError(`Failed to load Week ${week} content`);
      }
    } catch (error) {
      setError('Network error loading week content');
      console.error('Week content fetch error:', error);
    }
  };

  const getWeekStatus = (week: WeekContent) => {
    if (week.hasContent) {
      return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Available' };
    } else {
      return { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Coming Soon' };
    }
  };

  const WeekCard = ({ week }: { week: WeekContent }) => {
    const status = getWeekStatus(week);
    const StatusIcon = status.icon;
    
    return (
      <Card 
        className={`hover:shadow-md transition-shadow cursor-pointer ${
          week.hasContent ? 'hover:border-blue-300' : 'opacity-60'
        }`}
        onClick={() => week.hasContent && fetchWeekContent(week.week)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Week {week.week}</CardTitle>
            <Badge className={status.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.text}
            </Badge>
          </div>
          <CardDescription>{week.title}</CardDescription>
        </CardHeader>
        <CardContent>
          {week.hasContent ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/courses/CS162`;
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Course Materials
            </Button>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              Content not yet available
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const StudyGuideModal = () => {
    if (!selectedWeek || !weekContent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Week {selectedWeek} Study Guide</h2>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedWeek(null);
                setWeekContent('');
              }}
            >
              Close
            </Button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: weekContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/→/g, '&rarr;').replace(/x /g, '&bull; ')
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading CS162 curriculum...</span>
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
        <AlertDescription>No CS162 curriculum data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">CS162 Operating Systems</h1>
        <p className="text-gray-600">
          Personalized study curriculum with weekly content
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {curriculumData.availableWeeks} of {curriculumData.totalWeeks} weeks available
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Weekly Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Weekly Study Materials
              </CardTitle>
              <CardDescription>
                Access personalized study guides for each week of CS162.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curriculumData.weeks.map((week) => (
                  <WeekCard key={week.week} week={week} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Learning Progress
              </CardTitle>
              <CardDescription>
                Track your progress through the CS162 curriculum.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">
                    {curriculumData.availableWeeks} / {curriculumData.totalWeeks} weeks
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(curriculumData.availableWeeks / curriculumData.totalWeeks) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{curriculumData.availableWeeks}</div>
                    <div className="text-sm text-green-600">Available</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-600">{curriculumData.totalWeeks - curriculumData.availableWeeks}</div>
                    <div className="text-sm text-gray-600">Coming Soon</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StudyGuideModal />
    </div>
  );
}
