import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { LessonView } from './components/LessonView';
import { ProgressPage } from './components/ProgressPage';
import { ClassLessonsView } from './components/ClassLessonsView';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Home, Network, BookOpen, TrendingUp } from 'lucide-react';

type ViewType = 'dashboard' | 'graph' | 'lesson' | 'progress' | 'class-lessons';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          onStartLearning={() => setCurrentView('graph')} 
          onSelectClass={(classId) => {
            setSelectedClass(classId);
            setCurrentView('class-lessons');
          }}
        />;
      case 'class-lessons':
        return <ClassLessonsView 
          classId={selectedClass} 
          onBack={() => setCurrentView('dashboard')}
          onSelectLesson={(lesson) => {
            setSelectedLesson(lesson);
            setCurrentView('lesson');
          }}
        />;
      case 'graph':
        return <KnowledgeGraph onSelectLesson={(lesson) => {
          setSelectedLesson(lesson);
          setCurrentView('lesson');
        }} />;
      case 'lesson':
        return <LessonView 
          lessonId={selectedLesson} 
          onBack={() => {
            if (selectedClass) {
              setCurrentView('class-lessons');
            } else {
              setCurrentView('graph');
            }
          }} 
        />;
      case 'progress':
        return <ProgressPage />;
      default:
        return <Dashboard 
          onStartLearning={() => setCurrentView('graph')} 
          onSelectClass={(classId) => {
            setSelectedClass(classId);
            setCurrentView('class-lessons');
          }}
        />;
    }
  };

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
            
            <nav className="flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => setCurrentView(item.id as ViewType)}
                    className={`flex items-center space-x-2 ${
                      currentView === item.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderView()}
      </main>
    </div>
  );
}