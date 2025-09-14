'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dynamically import react-graph-vis to avoid SSR issues
const Graph = dynamic(() => import('react-graph-vis'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading graph...</div>
});

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
      
      // Set first topic as selected by default for highlighting
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

  // Color nodes by course
  const getNodeColor = useCallback((course: string) => {
    const colors: Record<string, { background: string; border: string; highlight: string }> = {
      'CS61A': { background: '#FF6B6B', border: '#E55A5A', highlight: '#FF8E8E' },
      'CS61B': { background: '#4ECDC4', border: '#45B7B8', highlight: '#6BCCC2' },
      'CS61C': { background: '#45B7D1', border: '#3498DB', highlight: '#68C3DD' },
      'CS70': { background: '#96CEB4', border: '#7FB069', highlight: '#A8D8BC' },
      'CS160': { background: '#FFEAA7', border: '#FDCB6E', highlight: '#FFF2C7' },
      'CS162': { background: '#DDA0DD', border: '#D63031', highlight: '#E8B4E8' },
      'CS164': { background: '#98D8C8', border: '#00B894', highlight: '#AAE0D0' },
      'CS168': { background: '#F7DC6F', border: '#F39C12', highlight: '#F9E79F' },
      'CS169': { background: '#BB8FCE', border: '#9B59B6', highlight: '#C7A2D6' },
      'CS170': { background: '#85C1E9', border: '#3498DB', highlight: '#97CBEF' },
      'CS172': { background: '#F8C471', border: '#E67E22', highlight: '#FACD7D' },
      'CS174': { background: '#82E0AA', border: '#00B894', highlight: '#94E6B2' },
      'CS184': { background: '#F1948A', border: '#E74C3C', highlight: '#F3A696' },
      'CS186': { background: '#85C1E9', border: '#2980B9', highlight: '#97CBEF' },
      'CS188': { background: '#D7BDE2', border: '#8E44AD', highlight: '#DFCAE8' },
      'CS189': { background: '#A9DFBF', border: '#27AE60', highlight: '#B5E3C7' }
    };
    return colors[course] || { 
      background: '#BDC3C7', 
      border: '#95A5A6', 
      highlight: '#CDD4D7' 
    };
  }, []);

  // Create complete graph data with ALL nodes and edges
  const completeGraphData = useMemo(() => {
    if (!displayKnowledgeGraph || !rawKnowledgeGraph) return { nodes: [], edges: [] };

    // Create nodes for ALL topics
    const nodes = Object.entries(displayKnowledgeGraph).map(([topicName, topicData]) => {
      const nodeColors = getNodeColor(topicData.course);
      const isSelected = topicName === selectedTopic;
      
      return {
        id: topicName,
        label: topicName.length > 25 ? topicName.substring(0, 25) + '...' : topicName,
        title: `${topicName}\nCourse: ${topicData.course}\nOrder: ${topicData.order}\nPrereqs: ${topicData.prereqs.length}`,
        color: {
          background: nodeColors.background,
          border: isSelected ? '#2C3E50' : nodeColors.border,
          highlight: {
            background: nodeColors.highlight,
            border: '#2C3E50'
          },
          hover: {
            background: nodeColors.highlight,
            border: nodeColors.border
          }
        },
        size: isSelected ? 25 : 15,
        font: {
          size: isSelected ? 14 : 10,
          color: '#2C3E50',
          face: 'Inter, sans-serif',
          strokeWidth: 1,
          strokeColor: '#FFFFFF'
        },
        borderWidth: isSelected ? 3 : 1,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: isSelected ? 10 : 5,
          x: 1,
          y: 1
        }
      };
    });

    // Create edges for ALL prerequisite relationships
    const edges: any[] = [];
    Object.entries(displayKnowledgeGraph).forEach(([topicName, topicData]) => {
      topicData.prereqs.forEach(prereq => {
        if (displayKnowledgeGraph[prereq]) {
          edges.push({
            from: prereq,
            to: topicName,
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 0.8,
                type: 'arrow'
              }
            },
            color: {
              color: '#94A3B8',
              highlight: '#64748B',
              hover: '#475569',
              opacity: 0.7
            },
            width: 1,
            smooth: {
              enabled: true,
              type: 'continuous',
              roundness: 0.2
            },
            shadow: {
              enabled: true,
              color: 'rgba(0,0,0,0.1)',
              size: 3,
              x: 1,
              y: 1
            }
          });
        }
      });
    });

    return { nodes, edges };
  }, [displayKnowledgeGraph, rawKnowledgeGraph, selectedTopic, getNodeColor]);

  // Graph options for vis.js
  const graphOptions = useMemo(() => ({
    layout: {
      improvedLayout: true,
      hierarchical: false
    },
    physics: {
      enabled: true,
      stabilization: { 
        enabled: true, 
        iterations: 200,
        updateInterval: 25
      },
      barnesHut: {
        gravitationalConstant: -8000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 0.1
      }
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      selectConnectedEdges: false,
      hover: true,
      hoverConnectedEdges: true,
      tooltipDelay: 300
    },
    nodes: {
      shape: 'dot',
      scaling: {
        min: 10,
        max: 30
      }
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'continuous'
      }
    }
  }), []);

  // Graph events
  const graphEvents = {
    select: (event: any) => {
      const { nodes } = event;
      if (nodes.length > 0) {
        setSelectedTopic(nodes[0]);
      }
    }
  };

  // Calculate graph statistics from complete graph data
  const graphStats = useMemo(() => {
    if (!completeGraphData) return { nodes: 0, edges: 0, courses: 0 };
    
    const nodes = completeGraphData.nodes.length;
    const edges = completeGraphData.edges.length;
    const coursesSet = new Set<string>();
    
    if (rawKnowledgeGraph) {
      Object.values(rawKnowledgeGraph).forEach(topicData => {
        coursesSet.add(topicData.course);
      });
    }
    
    return { nodes, edges, courses: coursesSet.size };
  }, [completeGraphData, rawKnowledgeGraph]);

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
            {displayKnowledgeGraph && completeGraphData.nodes.length > 0 ? (
              <div className="h-[900px] w-full">
                <Graph
                  graph={completeGraphData}
                  options={graphOptions}
                  events={graphEvents}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Loading complete knowledge graph...</p>
                  <p className="text-sm">
                    Preparing all {totalTopics} topics with their prerequisite relationships
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
