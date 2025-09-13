import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { X, BookOpen, Video, ExternalLink, ChevronRight } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'current' | 'prerequisite' | 'concept';
  x: number;
  y: number;
  completed: boolean;
  course: string;
}

interface KnowledgeGraphProps {
  onSelectLesson: (lessonId: string) => void;
}

export function KnowledgeGraph({ onSelectLesson }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nodes: Node[] = [
    // CS 170 Current Topics
    { id: 'dijkstra', label: 'Dijkstra\'s Algorithm', type: 'current', x: 400, y: 200, completed: false, course: 'CS 170' },
    { id: 'dynamic-prog', label: 'Dynamic Programming', type: 'current', x: 600, y: 150, completed: true, course: 'CS 170' },
    { id: 'graph-algorithms', label: 'Graph Algorithms', type: 'current', x: 500, y: 100, completed: false, course: 'CS 170' },
    { id: 'network-flow', label: 'Network Flow', type: 'current', x: 700, y: 200, completed: false, course: 'CS 170' },
    
    // Prerequisites from CS 61B
    { id: 'bfs-dfs', label: 'BFS/DFS', type: 'prerequisite', x: 200, y: 150, completed: true, course: 'CS 61B' },
    { id: 'trees', label: 'Trees & BSTs', type: 'prerequisite', x: 150, y: 250, completed: true, course: 'CS 61B' },
    { id: 'hashmaps', label: 'Hash Maps', type: 'prerequisite', x: 300, y: 300, completed: true, course: 'CS 61B' },
    { id: 'priority-queues', label: 'Priority Queues', type: 'prerequisite', x: 250, y: 100, completed: true, course: 'CS 61B' },
    
    // Supporting Concepts
    { id: 'recursion', label: 'Recursion', type: 'concept', x: 100, y: 200, completed: true, course: 'CS 61A' },
    { id: 'big-o', label: 'Big O Analysis', type: 'concept', x: 350, y: 50, completed: true, course: 'CS 61B' },
  ];

  const edges = [
    // Prerequisites to current topics
    { from: 'bfs-dfs', to: 'dijkstra' },
    { from: 'bfs-dfs', to: 'graph-algorithms' },
    { from: 'priority-queues', to: 'dijkstra' },
    { from: 'trees', to: 'dynamic-prog' },
    { from: 'hashmaps', to: 'dynamic-prog' },
    { from: 'graph-algorithms', to: 'network-flow' },
    { from: 'dijkstra', to: 'network-flow' },
    
    // Foundational concepts
    { from: 'recursion', to: 'bfs-dfs' },
    { from: 'recursion', to: 'trees' },
    { from: 'big-o', to: 'graph-algorithms' },
    { from: 'big-o', to: 'dynamic-prog' },
  ];

  const getNodeColor = (node: Node) => {
    if (node.type === 'current') {
      return node.completed ? '#22c55e' : '#3b82f6'; // green if completed, blue if current
    }
    if (node.type === 'prerequisite') {
      return '#10b981'; // teal for prerequisites
    }
    return '#8b5cf6'; // purple for concepts
  };

  const getNodeDetails = (node: Node) => {
    const details = {
      'dijkstra': {
        description: 'Find shortest paths in weighted graphs using a greedy approach, similar to how we used priority queues in CS 61B.',
        prerequisites: ['BFS/DFS', 'Priority Queues'],
        videos: ['Berkeley CS170 Lecture 12', 'Dijkstra Visualization'],
        progress: 0,
        lessons: 5
      },
      'dynamic-prog': {
        description: 'Break problems into subproblems and build solutions bottom-up, like the recursive thinking from CS 61A but with memoization.',
        prerequisites: ['Trees & BSTs', 'Hash Maps'],
        videos: ['Berkeley CS170 Lecture 15', 'DP Patterns'],
        progress: 100,
        lessons: 4
      },
      'graph-algorithms': {
        description: 'Advanced graph traversal and analysis techniques building on BFS/DFS foundations from CS 61B.',
        prerequisites: ['BFS/DFS', 'Big O Analysis'],
        videos: ['Berkeley CS170 Lecture 10', 'Graph Theory Basics'],
        progress: 25,
        lessons: 6
      },
      'network-flow': {
        description: 'Model flow problems as graphs and find maximum flow, combining graph algorithms with optimization.',
        prerequisites: ['Graph Algorithms', 'Dijkstra\'s Algorithm'],
        videos: ['Berkeley CS170 Lecture 18', 'Max Flow Applications'],
        progress: 0,
        lessons: 3
      }
    };
    
    return details[node.id as keyof typeof details] || {
      description: `Foundation concept from ${node.course}`,
      prerequisites: [],
      videos: [],
      progress: 100,
      lessons: 0
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl text-blue-900">CS 170 Knowledge Graph</h2>
        <p className="text-blue-700">
          Explore how current topics connect to your successful CS 61B foundation
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graph Visualization */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-blue-900">Concept Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <svg
                ref={svgRef}
                width="100%"
                height="500"
                viewBox="0 0 800 400"
                className="border rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50"
              >
                {/* Edges */}
                {edges.map((edge, idx) => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray={fromNode.type === 'prerequisite' ? '5,5' : 'none'}
                    />
                  );
                })}
                
                {/* Nodes */}
                {nodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      fill={getNodeColor(node)}
                      stroke="white"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedNode(node)}
                    />
                    {node.completed && (
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        ✓
                      </text>
                    )}
                    <text
                      x={node.x}
                      y={node.y + 35}
                      textAnchor="middle"
                      fill="#1e40af"
                      fontSize="12"
                      fontWeight="medium"
                      className="pointer-events-none"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
              
              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-700">Current Topic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                  <span className="text-blue-700">Prerequisite (CS 61B)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-blue-700">Foundation (CS 61A)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-blue-700">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">{selectedNode.label}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className={`w-fit ${
                  selectedNode.type === 'current' ? 'bg-blue-100 text-blue-800' :
                  selectedNode.type === 'prerequisite' ? 'bg-teal-100 text-teal-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {selectedNode.course}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-700">
                  {getNodeDetails(selectedNode).description}
                </p>
                
                {selectedNode.type === 'current' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Progress</span>
                        <span className="text-blue-900">{getNodeDetails(selectedNode).progress}%</span>
                      </div>
                      <Progress value={getNodeDetails(selectedNode).progress} className="h-2" />
                    </div>
                    
                    <Button 
                      onClick={() => onSelectLesson(selectedNode.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                )}
                
                {getNodeDetails(selectedNode).prerequisites.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Prerequisites</h4>
                    <div className="space-y-1">
                      {getNodeDetails(selectedNode).prerequisites.map((prereq, idx) => (
                        <div key={idx} className="flex items-center text-sm text-blue-700">
                          <ChevronRight className="w-3 h-3 mr-1" />
                          {prereq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {getNodeDetails(selectedNode).videos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Resources</h4>
                    <div className="space-y-2">
                      {getNodeDetails(selectedNode).videos.map((video, idx) => (
                        <Button key={idx} variant="outline" size="sm" className="w-full justify-start">
                          <Video className="w-3 h-3 mr-2" />
                          {video}
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-blue-700">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <p>Click on any node to see detailed information and start learning!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}