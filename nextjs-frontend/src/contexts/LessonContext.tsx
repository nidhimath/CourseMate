'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface LessonCompletion {
  [lessonId: string]: {
    completed: boolean;
    progress: number;
  };
}

interface LessonContextType {
  lessonCompletions: LessonCompletion;
  markLessonComplete: (lessonId: string) => void;
  markLessonIncomplete: (lessonId: string) => void;
  toggleLessonCompletion: (lessonId: string) => void;
  updateLessonProgress: (lessonId: string, progress: number) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getLessonProgress: (lessonId: string) => number;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
};

interface LessonProviderProps {
  children: ReactNode;
}

export const LessonProvider: React.FC<LessonProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [lessonCompletions, setLessonCompletions] = useState<LessonCompletion>({});

  // Load from localStorage and backend on mount
  useEffect(() => {
    const loadProgress = async () => {
      // First load from localStorage for immediate UI update
      const saved = localStorage.getItem('lessonCompletions');
      if (saved) {
        try {
          setLessonCompletions(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading lesson completions from localStorage:', error);
        }
      }

      // Only sync with backend if user is authenticated
      if (session?.user?.email) {
        try {
          // Get the backend token from the session
          const token = (session as any).accessToken;
          if (!token) {
            console.log('No backend token available');
            return;
          }

          const response = await fetch('/api/courses/CS162/lessons/progress', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const backendProgress: LessonCompletion = {};
            
            // Convert backend format to our format
            Object.entries(data.progress).forEach(([lessonId, progress]: [string, any]) => {
              backendProgress[lessonId] = {
                completed: progress.completed,
                progress: progress.progress
              };
            });

            // Merge with localStorage data (backend takes precedence)
            setLessonCompletions(prev => ({
              ...prev,
              ...backendProgress
            }));
          }
        } catch (error) {
          console.error('Error loading progress from backend:', error);
        }
      }
    };

    loadProgress();
  }, [session]);

  // Save to localStorage whenever completions change
  useEffect(() => {
    localStorage.setItem('lessonCompletions', JSON.stringify(lessonCompletions));
  }, [lessonCompletions]);

  const markLessonComplete = async (lessonId: string) => {
    // Update local state immediately
    setLessonCompletions(prev => ({
      ...prev,
      [lessonId]: {
        completed: true,
        progress: 100
      }
    }));

    // Sync with backend if authenticated
    if (session?.user?.email) {
      try {
        const token = (session as any).accessToken;
        if (!token) {
          console.log('No backend token available for progress sync');
          return;
        }

        const response = await fetch(`/api/courses/CS162/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: true,
            progress: 100
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync progress with backend');
        }
      } catch (error) {
        console.error('Error syncing progress with backend:', error);
      }
    }
  };

  const markLessonIncomplete = async (lessonId: string) => {
    // Update local state immediately
    setLessonCompletions(prev => ({
      ...prev,
      [lessonId]: {
        completed: false,
        progress: 0
      }
    }));

    // Sync with backend if authenticated
    if (session?.user?.email) {
      try {
        const token = (session as any).accessToken;
        if (!token) {
          console.log('No backend token available for progress sync');
          return;
        }

        const response = await fetch(`/api/courses/CS162/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: false,
            progress: 0
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync progress with backend');
        }
      } catch (error) {
        console.error('Error syncing progress with backend:', error);
      }
    }
  };

  const toggleLessonCompletion = async (lessonId: string) => {
    const isCurrentlyCompleted = isLessonCompleted(lessonId);
    if (isCurrentlyCompleted) {
      await markLessonIncomplete(lessonId);
    } else {
      await markLessonComplete(lessonId);
    }
  };

  const updateLessonProgress = (lessonId: string, progress: number) => {
    setLessonCompletions(prev => ({
      ...prev,
      [lessonId]: {
        completed: progress === 100,
        progress
      }
    }));
  };

  const isLessonCompleted = useCallback((lessonId: string) => {
    return lessonCompletions[lessonId]?.completed || false;
  }, [lessonCompletions]);

  const getLessonProgress = useCallback((lessonId: string) => {
    return lessonCompletions[lessonId]?.progress || 0;
  }, [lessonCompletions]);

  const value: LessonContextType = {
    lessonCompletions,
    markLessonComplete,
    markLessonIncomplete,
    toggleLessonCompletion,
    updateLessonProgress,
    isLessonCompleted,
    getLessonProgress
  };

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
};
