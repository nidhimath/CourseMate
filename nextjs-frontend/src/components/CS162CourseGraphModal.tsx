'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import InteractiveGraph from './InteractiveGraph';

interface CS162CourseGraphModalProps {
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

export default function CS162CourseGraphModal({ 
  isOpen, 
  onClose, 
  courseCode 
}: CS162CourseGraphModalProps) {
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [cs162Topics, setCS162Topics] = useState<KnowledgeGraph | null>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('OS History');

  // Load knowledge graph when modal opens
  useEffect(() => {
    if (isOpen && !knowledgeGraph) {
      loadKnowledgeGraph();
    }
  }, [isOpen, knowledgeGraph]);

  const loadKnowledgeGraph = async () => {
    setIsLoadingGraph(true);
    try {
      console.log('Loading knowledge graph from:', '/knowledge_graph.json');
      const response = await fetch('/knowledge_graph.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Knowledge graph loaded successfully');
        setKnowledgeGraph(data);
        
        // Find CS162 topics and ALL their prerequisites recursively
        const cs162TopicsAndPrereqs: KnowledgeGraph = {};
        const allTopics = data as KnowledgeGraph;
        
        // First, find all CS162 topics
        const cs162TopicNames: string[] = [];
        Object.entries(allTopics).forEach(([topicName, topicData]) => {
          const topic = topicData as TopicData;
          if (topic.course === 'CS162') {
            cs162TopicNames.push(topicName);
          }
        });
        
        // Function to recursively add a topic and all its prerequisites
        const addTopicWithPrereqs = (topicName: string, visited: Set<string> = new Set()) => {
          // Avoid infinite loops
          if (visited.has(topicName)) return;
          visited.add(topicName);
          
          // Find the topic in the knowledge graph
          const topic = allTopics[topicName];
          if (topic) {
            // Add this topic to our result
            cs162TopicsAndPrereqs[topicName] = topic;
            
            // Recursively add all prerequisites
            if (topic.prereqs && Array.isArray(topic.prereqs)) {
              topic.prereqs.forEach(prereq => {
                addTopicWithPrereqs(prereq, visited);
              });
            }
          }
        };
        
        // Add all CS162 topics and their prerequisites
        cs162TopicNames.forEach(topicName => {
          addTopicWithPrereqs(topicName);
        });
        
        console.log('CS162 topics found:', cs162TopicNames.length);
        console.log('Total topics (including prereqs):', Object.keys(cs162TopicsAndPrereqs).length);
        setCS162Topics(cs162TopicsAndPrereqs);
        
        // Set first CS162 topic as default
        const firstCS162Topic = cs162TopicNames[0];
        if (firstCS162Topic) {
          setSelectedTopic(firstCS162Topic);
        }
      } else {
        throw new Error(`Failed to load knowledge graph: ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading knowledge graph:', err);
      setError(err instanceof Error ? err.message : 'Failed to load knowledge graph');
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
            <h2 className="text-2xl font-bold text-gray-900">CS162 Complete Knowledge Graph</h2>
            <p className="text-sm text-gray-600 mt-1">
              All CS162 topics and their prerequisite dependencies from all courses
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
                Loading CS162 Knowledge Graph...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Preparing complete course visualization
              </p>
            </div>
          ) : cs162Topics && selectedTopic ? (
            <div className="h-full">
              <InteractiveGraph
                knowledgeGraph={cs162Topics}
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
                Unable to Display CS162 Graph
              </p>
              <p className="text-sm text-gray-500">
                Knowledge graph data is not available
              </p>
              <button
                onClick={loadKnowledgeGraph}
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
              {cs162Topics ? (
                <>
                  Total Topics: <span className="font-medium">{Object.keys(cs162Topics).length}</span>
                  {' '}(CS162 + Prerequisites)
                </>
              ) : (
                'Loading CS162 dependency graph...'
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
