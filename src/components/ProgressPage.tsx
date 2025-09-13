import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Trophy, Target, BookOpen, TrendingUp, Calendar, Star, Award, Lightbulb, ChevronRight, Clock } from 'lucide-react';

export function ProgressPage() {
  const weeklyProgress = [
    { week: 'Week 1', completed: 8, total: 10, percentage: 80 },
    { week: 'Week 2', completed: 7, total: 8, percentage: 87 },
    { week: 'Week 3', completed: 5, total: 12, percentage: 42 },
    { week: 'Week 4', completed: 0, total: 10, percentage: 0 },
  ];

  const completedLessons = [
    { id: 'dynamic-prog', title: 'Dynamic Programming', course: 'CS 170', completedAt: '2 days ago', score: 95 },
    { id: 'graph-algorithms', title: 'Graph Algorithms Basics', course: 'CS 170', completedAt: '1 week ago', score: 88 },
    { id: 'bfs-review', title: 'BFS/DFS Review', course: 'CS 61B', completedAt: '1 week ago', score: 100 },
    { id: 'priority-queues', title: 'Priority Queues', course: 'CS 61B', completedAt: '2 weeks ago', score: 92 },
  ];

  const analogies = [
    {
      concept: 'Dijkstra\'s Algorithm',
      analogy: 'Like BFS from CS 61B, but prioritizing by distance instead of discovery order',
      strength: 'Strong',
      course: 'CS 61B → CS 170'
    },
    {
      concept: 'Dynamic Programming',
      analogy: 'Similar to recursive solutions from CS 61A, but with memoization to avoid recomputation',
      strength: 'Very Strong',
      course: 'CS 61A → CS 170'
    },
    {
      concept: 'Network Flow',
      analogy: 'Like graph traversal from CS 61B, but tracking capacity constraints at each edge',
      strength: 'Moderate',
      course: 'CS 61B → CS 170'
    },
  ];

  const recommendations = [
    {
      title: 'Complete Dijkstra\'s Algorithm',
      description: 'You\'re ready based on your strong BFS and Priority Queue foundations',
      priority: 'High',
      estimatedTime: '45 min',
      prerequisitesMet: true,
      icon: Target
    },
    {
      title: 'Review Graph Representation',
      description: 'Brush up on adjacency lists before tackling Network Flow',
      priority: 'Medium',
      estimatedTime: '20 min',
      prerequisitesMet: true,
      icon: BookOpen
    },
    {
      title: 'Linear Programming Basics',
      description: 'Complete Network Flow lessons first to unlock this topic',
      priority: 'Low',
      estimatedTime: '60 min',
      prerequisitesMet: false,
      icon: Lightbulb
    },
  ];

  const achievements = [
    { title: 'First Week Complete', description: 'Completed your first week of lessons', earned: true, date: 'Jan 15' },
    { title: 'Perfect Score', description: 'Got 100% on a lesson assessment', earned: true, date: 'Jan 20' },
    { title: 'Connection Master', description: 'Made 5 CS 61B connections', earned: true, date: 'Jan 22' },
    { title: 'Quick Learner', description: 'Complete 3 lessons in one day', earned: false, date: null },
    { title: 'Algorithm Expert', description: 'Master all graph algorithms', earned: false, date: null },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'bg-green-100 text-green-800';
      case 'Strong': return 'bg-blue-100 text-blue-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl text-blue-900">Your Learning Progress</h2>
        <p className="text-blue-700">Track your journey and discover personalized connections</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl text-blue-900 mb-1">85%</div>
            <p className="text-sm text-blue-700">Overall Progress</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl text-blue-900 mb-1">23</div>
            <p className="text-sm text-blue-700">Lessons Completed</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl text-blue-900 mb-1">12.5</div>
            <p className="text-sm text-blue-700">Hours Studied</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl text-blue-900 mb-1">4</div>
            <p className="text-sm text-blue-700">Achievements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Calendar className="w-5 h-5" />
              <span>Weekly Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyProgress.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">{week.week}</span>
                  <span className="text-sm text-blue-700">
                    {week.completed}/{week.total} lessons
                  </span>
                </div>
                <Progress value={week.percentage} className="h-2" />
                <div className="text-right text-xs text-blue-600">{week.percentage}%</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommended Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <TrendingUp className="w-5 h-5" />
              <span>Recommended Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    rec.prerequisitesMet ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${
                      rec.prerequisitesMet ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${
                          rec.prerequisitesMet ? 'text-blue-900' : 'text-gray-600'
                        }`}>
                          {rec.title}
                        </h4>
                        <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className={`text-sm mb-2 ${
                        rec.prerequisitesMet ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          rec.prerequisitesMet ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          Est. {rec.estimatedTime}
                        </span>
                        {rec.prerequisitesMet && (
                          <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                            Start <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <BookOpen className="w-5 h-5" />
              <span>Recently Completed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedLessons.map((lesson, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{lesson.title}</h4>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span>{lesson.course}</span>
                    <span>•</span>
                    <span>{lesson.completedAt}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-900">{lesson.score}%</div>
                  <div className="text-xs text-green-700">Score</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Award className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-yellow-500' : 'bg-gray-300'
                }`}>
                  <Trophy className={`w-5 h-5 ${
                    achievement.earned ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    achievement.earned ? 'text-yellow-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                      {achievement.date}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Course Analogies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Lightbulb className="w-5 h-5" />
            <span>Course Connections & Analogies</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analogies.map((analogy, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-blue-900">{analogy.concept}</h4>
                <div className="flex items-center space-x-2">
                  <Badge className={getStrengthColor(analogy.strength)} variant="secondary">
                    {analogy.strength}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                    {analogy.course}
                  </Badge>
                </div>
              </div>
              <p className="text-blue-700 text-sm">{analogy.analogy}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}