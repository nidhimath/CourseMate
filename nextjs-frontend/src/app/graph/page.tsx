'use client'

import React, { useState, useEffect } from 'react';
import InteractiveGraph from '@/components/InteractiveGraph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Match the structure from knowledge_graph.json
interface RawTopicData {
  topic_name: string;
  course: string;
  order: number;
  prereqs: string[];
}

// Match what InteractiveGraph expects
interface ProcessedTopicData {
  course: string;
  order: number;
  prereqs: string[];
}

interface RawKnowledgeGraph {
  [topicName: string]: RawTopicData;
}

interface ProcessedKnowledgeGraph {
  [topicName: string]: ProcessedTopicData;
}

export default function GraphPage() {
  const [rawKnowledgeGraph, setRawKnowledgeGraph] = useState<RawKnowledgeGraph | null>(null);
  const [processedKnowledgeGraph, setProcessedKnowledgeGraph] = useState<ProcessedKnowledgeGraph | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKnowledgeGraph();
  }, []);

  const loadKnowledgeGraph = async () => {
    try {
      const response = await fetch('/knowledge_graph.json');
      if (!response.ok) {
        throw new Error('Failed to load knowledge graph');
      }
      const rawData: RawKnowledgeGraph = await response.json();
      setRawKnowledgeGraph(rawData);
      
      // Transform data to match InteractiveGraph expectations
      const processedData: ProcessedKnowledgeGraph = {};
      Object.entries(rawData).forEach(([topicName, topicData]) => {
        processedData[topicName] = {
          course: topicData.course,
          order: topicData.order,
          prereqs: topicData.prereqs || []
        };
      });
      setProcessedKnowledgeGraph(processedData);
      
      // Set first topic as selected by default
      const firstTopic = Object.keys(rawData)[0];
      if (firstTopic) {
        setSelectedTopic(firstTopic);
      }
    } catch (err) {
      console.error('Error loading knowledge graph:', err);
      setError('Failed to load knowledge graph data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (topicName: string) => {
    setSelectedTopic(topicName);
  };

  const handleNodeSelect = (nodeData: any) => {
    setSelectedTopic(nodeData.id);
  };

  // Get unique courses for display
  const availableCourses = rawKnowledgeGraph 
    ? Array.from(new Set(Object.values(rawKnowledgeGraph).map(topic => topic.course))).sort()
    : [];

  // Get all topics for display
  const allTopics = rawKnowledgeGraph ? Object.keys(rawKnowledgeGraph) : [];

  // Always show the complete graph with all 214 topics
  const displayKnowledgeGraph = processedKnowledgeGraph;

  // Calculate graph statistics
  const getGraphStats = () => {
    if (!displayKnowledgeGraph || !rawKnowledgeGraph) return { nodes: 0, edges: 0, courses: 0 };
    
    const nodes = Object.keys(displayKnowledgeGraph).length;
    let edges = 0;
    const coursesSet = new Set<string>();
    
    Object.entries(displayKnowledgeGraph).forEach(([topicName, topicData]) => {
      edges += topicData.prereqs.length;
      if (rawKnowledgeGraph[topicName]) {
        coursesSet.add(rawKnowledgeGraph[topicName].course);
      }
    });
    
    return { nodes, edges, courses: coursesSet.size };
  };

  const graphStats = getGraphStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading knowledge graph...</p>
            <p className="text-sm text-gray-500 mt-2">Loading 214 topics and relationships...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadKnowledgeGraph}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rawKnowledgeGraph || !processedKnowledgeGraph) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No knowledge graph data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTopics = Object.keys(rawKnowledgeGraph).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete Course Knowledge Graph
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Interactive visualization of all {totalTopics} topics across UC Berkeley CS/EECS courses
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{totalTopics} Total Topics</Badge>
            <Badge variant="secondary">{availableCourses.length} Courses</Badge>
            <Badge variant="default">{graphStats.nodes} Visible Nodes</Badge>
            <Badge variant="default">{graphStats.edges} Connections</Badge>
            <Badge variant="outline">{graphStats.courses} Course{graphStats.courses !== 1 ? 's' : ''} Shown</Badge>
          </div>
        </div>


        {/* Topic Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Topic to Explore</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedTopic || ''}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a topic...</option>
              {allTopics.map(topicName => (
                <option key={topicName} value={topicName}>
                  {topicName} ({rawKnowledgeGraph[topicName].course})
                </option>
              ))}
            </select>
            
            {selectedTopic && rawKnowledgeGraph[selectedTopic] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedTopic}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge>{rawKnowledgeGraph[selectedTopic].course}</Badge>
                  <Badge variant="secondary">Order: {rawKnowledgeGraph[selectedTopic].order}</Badge>
                  <Badge variant="outline">
                    {rawKnowledgeGraph[selectedTopic].prereqs.length} Prerequisites
                  </Badge>
                </div>
                {rawKnowledgeGraph[selectedTopic].prereqs.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Prerequisites:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rawKnowledgeGraph[selectedTopic].prereqs.map(prereq => (
                        <Badge 
                          key={prereq} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTopicChange(prereq)}
                        >
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show topics that depend on this one */}
                {(() => {
                  const dependents = Object.entries(rawKnowledgeGraph)
                    .filter(([_, topicData]) => topicData.prereqs.includes(selectedTopic))
                    .map(([topicName]) => topicName);
                  
                  if (dependents.length > 0) {
                    return (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Topics that depend on this:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dependents.map(dependent => (
                            <Badge 
                              key={dependent} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-blue-50 border-blue-200"
                              onClick={() => handleTopicChange(dependent)}
                            >
                              {dependent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactive Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Complete Knowledge Graph
                {selectedTopic && (
                  <span className="text-base font-normal text-gray-600 ml-2">
                    - Exploring "{selectedTopic}"
                  </span>
                )}
              </span>
              <div className="text-sm font-normal text-gray-500">
                {graphStats.nodes} nodes • {graphStats.edges} edges
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTopic && displayKnowledgeGraph ? (
              <div className="h-[900px] w-full">
                <InteractiveGraph
                  knowledgeGraph={displayKnowledgeGraph}
                  selectedTopic={selectedTopic}
                  onNodeSelect={handleNodeSelect}
                  onTopicChange={handleTopicChange}
                  width="100%"
                  height="900px"
                  showControls={true}
                />
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a topic to visualize the complete graph</p>
                  <p className="text-sm">
                    The graph will show all {totalTopics} topics with their complete prerequisite network
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graph Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Graph Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTopics}</div>
                <div className="text-sm text-gray-600">Total Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{graphStats.nodes}</div>
                <div className="text-sm text-gray-600">Visible Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{graphStats.edges}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{availableCourses.length}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Graph Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2 border-2 border-gray-800"></div>
                <p className="text-sm">Selected Topic</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Prerequisites</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Dependents</p>
              </div>
              <div className="text-center">
                <div className="w-6 h-0 border-t-2 border-gray-400 mx-auto mb-2 mt-2"></div>
                <p className="text-sm">Prerequisite Link</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Tip:</strong> Click on nodes to navigate between topics and explore the complete curriculum structure.</p>
              <p><strong>Performance:</strong> This graph shows all {totalTopics} topics simultaneously with their complete prerequisite relationships.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
