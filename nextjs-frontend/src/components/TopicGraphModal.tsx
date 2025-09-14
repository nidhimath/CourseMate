'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import InteractiveGraph from './InteractiveGraph';

interface TopicGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonContent: string;
  courseCode: string;
}

interface KnowledgeGraph {
  [topicName: string]: {
    topic_name: string;
    prereqs: string[];
    course: string;
    order: number;
  };
}

export default function TopicGraphModal({ 
  isOpen, 
  onClose, 
  lessonContent, 
  courseCode 
}: TopicGraphModalProps) {
  const [identifiedTopic, setIdentifiedTopic] = useState<string | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load knowledge graph data
  useEffect(() => {
    if (isOpen && !knowledgeGraph) {
      loadKnowledgeGraph();
    }
  }, [isOpen, knowledgeGraph]);

  // Classify topic when modal opens
  useEffect(() => {
    if (isOpen && lessonContent && !identifiedTopic && !isClassifying) {
      classifyTopic();
    }
  }, [isOpen, lessonContent, identifiedTopic, isClassifying]);

  const loadKnowledgeGraph = async () => {
    setIsLoadingGraph(true);
    try {
      console.log('Attempting to load knowledge graph from:', '/knowledge_graph.json');
      const response = await fetch('/knowledge_graph.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log('Knowledge graph response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Knowledge graph loaded successfully, topics count:', Object.keys(data).length);
        setKnowledgeGraph(data);
      } else {
        throw new Error(`Failed to load knowledge graph: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error loading knowledge graph:', err);
      setError('Failed to load knowledge graph data');
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const classifyTopic = async () => {
    setIsClassifying(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/classify/topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: lessonContent,
          courseCode: courseCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIdentifiedTopic(data.topic);
        
        if (data.warning) {
          setError(`Warning: ${data.warning}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify topic');
      }
    } catch (err) {
      console.error('Error classifying topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to classify topic');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleClose = () => {
    setIdentifiedTopic(null);
    setError(null);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Topic Knowledge Graph</h2>
            {identifiedTopic && (
              <p className="text-sm text-gray-600 mt-1">
                Showing relationships for: <span className="font-semibold text-blue-600">{identifiedTopic}</span>
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
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 text-sm">{error}</span>
            </div>
          )}

          {(isClassifying || isLoadingGraph) ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {isClassifying ? 'Analyzing lesson content...' : 'Loading knowledge graph...'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {isClassifying ? 'Identifying the main topic covered in this lesson' : 'Preparing the interactive visualization'}
              </p>
            </div>
          ) : identifiedTopic && knowledgeGraph ? (
            <div className="h-full">
              <InteractiveGraph
                knowledgeGraph={knowledgeGraph}
                selectedTopic={identifiedTopic}
                width="100%"
                height="500px"
                showControls={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Unable to Display Graph
              </p>
              <p className="text-sm text-gray-500">
                {!identifiedTopic ? 'Could not identify the topic for this lesson' : 'Knowledge graph data is not available'}
              </p>
              <button
                onClick={classifyTopic}
                disabled={isClassifying}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClassifying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {identifiedTopic ? (
                <>Topic: <span className="font-medium">{identifiedTopic}</span></>
              ) : (
                'Analyzing lesson content...'
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
