'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import InteractiveGraph from './InteractiveGraph';

interface CourseGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseCode: string;
}

interface TopicData {
  topic_name: string;
  prereqs: string[];
  course: string;
  order: number;
}

interface KnowledgeGraph {
  [topicName: string]: TopicData;
}

export default function CourseGraphModal({ 
  isOpen, 
  onClose, 
  courseCode 
}: CourseGraphModalProps) {
  const [courseTopics, setCourseTopics] = useState<KnowledgeGraph | null>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Load course topics when modal opens
  useEffect(() => {
    if (isOpen && courseCode) {
      loadCourseTopics();
    }
  }, [isOpen, courseCode]);

  const loadCourseTopics = async () => {
    setIsLoadingGraph(true);
    setError(null);
    
    try {
      console.log(`Loading topics for ${courseCode} from: /topics_${courseCode}.json`);
      const response = await fetch(`/topics_${courseCode}.json`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${courseCode} topics loaded successfully`);
        setCourseTopics(data);
        
        // Set first topic as default (sorted by order)
        const topicEntries = Object.entries(data);
        if (topicEntries.length > 0) {
          const sortedTopics = topicEntries
            .map(([name, topic]) => ({ name, order: (topic as TopicData).order || 0 }))
            .sort((a, b) => a.order - b.order);
          setSelectedTopic(sortedTopics[0].name);
        }
      } else if (response.status === 404) {
        throw new Error(`No topic graph available for ${courseCode}. Topics file not found.`);
      } else {
        throw new Error(`Failed to load ${courseCode} topics: ${response.status}`);
      }
    } catch (err) {
      console.error(`Error loading ${courseCode} topics:`, err);
      setError(err instanceof Error ? err.message : `Failed to load ${courseCode} topics`);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleTopicChange = (newTopic: string) => {
    setSelectedTopic(newTopic);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-[95vw] w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{courseCode} Knowledge Graph</h2>
            <p className="text-sm text-gray-600 mt-1">
              Course topics and their prerequisite dependencies
            </p>
            {selectedTopic && (
              <p className="text-sm text-blue-600 mt-1">
                Centered on: <span className="font-semibold">{selectedTopic}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {isLoadingGraph ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Loading {courseCode} Knowledge Graph...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Preparing course visualization
              </p>
            </div>
          ) : courseTopics && selectedTopic ? (
            <div className="h-full">
              <InteractiveGraph
                knowledgeGraph={courseTopics}
                selectedTopic={selectedTopic}
                width="100%"
                height="650px"
                showControls={true}
                onTopicChange={handleTopicChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                No Knowledge Graph Available
              </p>
              <p className="text-sm text-gray-500">
                {error || `Knowledge graph data is not available for ${courseCode}`}
              </p>
              <button
                onClick={loadCourseTopics}
                disabled={isLoadingGraph}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingGraph ? 'Loading...' : 'Try Again'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {courseTopics ? (
                <>
                  Total Topics: <span className="font-medium">{Object.keys(courseTopics).length}</span>
                </>
              ) : (
                `Loading ${courseCode} topics...`
              )}
            </span>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
