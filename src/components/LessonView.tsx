import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, ChevronDown, ChevronUp, Video, ExternalLink, HelpCircle, CheckCircle, Play, Lightbulb, Target, BookOpen, Zap } from 'lucide-react';

interface LessonViewProps {
  lessonId: string | null;
  onBack: () => void;
}

interface ContextModal {
  isOpen: boolean;
  content: string;
  title: string;
  position: { x: number; y: number };
  selectedText: string;
}

interface LessonItem {
  id: string;
  type: 'concept' | 'exercise';
  title: string;
  content?: string;
  analogy?: string;
  problem?: string;
  hints?: string[];
  solution?: string;
  cs61bConnection?: string;
  completed: boolean;
}

export function LessonView({ lessonId, onBack }: LessonViewProps) {
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [contextModal, setContextModal] = useState<ContextModal>({
    isOpen: false,
    content: '',
    title: '',
    position: { x: 0, y: 0 },
    selectedText: ''
  });
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set(['concept-1', 'concept-2', 'exercise-1']));
  const contentRef = useRef<HTMLDivElement>(null);

  const lessonData = {
    'dijkstra': {
      title: 'Dijkstra\'s Algorithm',
      description: 'Learn shortest path algorithms using familiar concepts from CS 61B',
      items: [
        {
          id: 'concept-1',
          type: 'concept' as const,
          title: 'What is Dijkstra\'s Algorithm?',
          content: `Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph. Think of it like the **breadth-first search** you mastered in CS 61B, but now we're considering edge weights.

In CS 61B, you learned that BFS explores nodes level by level. Dijkstra's algorithm is similar, but instead of exploring by "levels," it explores by **distance from the source**. Just like how you used a **priority queue** for your A* implementation in the Berkeley Maps project!

The key insight: always process the **closest unvisited vertex** next. This greedy choice guarantees we find the shortest path, just like how the greedy approach worked for minimum spanning trees.`,
          analogy: 'Think of this like the BFS approach in CS 61B - we explored neighbors systematically, but now we prioritize by distance rather than discovery order.',
          completed: true
        },
        {
          id: 'exercise-1',
          type: 'exercise' as const,
          title: '🎯 Quick Check: BFS vs Dijkstra\'s',
          problem: 'Given this simple graph, compare how BFS and Dijkstra\'s would explore vertices starting from A. What\'s the key difference?',
          hints: [
            'BFS uses a regular queue (FIFO)',
            'Dijkstra\'s uses a priority queue (min-heap)',
            'BFS finds shortest path in unweighted graphs',
            'Dijkstra\'s considers edge weights'
          ],
          cs61bConnection: 'Remember your BFS implementation from CS 61B? Dijkstra\'s is almost identical, just swap the queue for a priority queue!',
          completed: true
        },
        {
          id: 'concept-2',
          type: 'concept' as const,
          title: 'The Algorithm Step-by-Step',
          content: `Here's how Dijkstra's works, broken down like the **step-by-step debugging** we practiced in CS 61B:

1. **Initialize**: Set distance to source as 0, all others as infinity (like initializing your distance array in BFS)
2. **Priority Queue**: Add all vertices to a min-heap ordered by distance (remember **MinPQ** from your data structures?)
3. **Extract minimum**: Remove the vertex with smallest distance (like \`removeMin()\` in your heap implementation)
4. **Relax edges**: For each neighbor, check if going through current vertex gives a shorter path
5. **Update distances**: If shorter path found, update distance and parent (like updating your \`distTo\` array)

The **relaxation** step is key - it's like updating your best path when you find a better route, similar to how you updated shortest paths in your graph algorithms project.`,
          analogy: 'This is exactly like your CS 61B shortest path lab, but now we\'re using edge weights instead of uniform costs!',
          completed: true
        },
        {
          id: 'exercise-2',
          type: 'exercise' as const,
          title: '📝 Trace Dijkstra\'s Algorithm',
          problem: 'Given the weighted graph below, trace Dijkstra\'s algorithm starting from vertex A. Show the priority queue state and distance updates at each step.',
          hints: [
            'Start with distance[A] = 0, all others = ∞',
            'Use a priority queue to always process the closest unvisited vertex',
            'For each vertex, relax all outgoing edges',
            'Update the priority queue when distances change'
          ],
          solution: 'Step 1: Initialize distances, Step 2: Process vertex A, Step 3: Relax edges A→B, A→C...',
          cs61bConnection: 'This is exactly like tracing BFS, but we prioritize by distance instead of discovery order.',
          completed: false
        },
        {
          id: 'concept-3',
          type: 'concept' as const,
          title: 'Why the Greedy Choice Works',
          content: `The greedy property of Dijkstra's algorithm might seem surprising at first. Why does always choosing the **closest unvisited vertex** guarantee the optimal solution?

The proof relies on a **contradiction argument** (like the proof techniques from your algorithm analysis in CS 61B). Suppose there's a shorter path to a vertex we just processed. This path must go through some unvisited vertex, but since we always choose the closest unvisited vertex, any path through an unvisited vertex must be longer.

This is similar to the **greedy approach** in your CS 61B MST (Minimum Spanning Tree) algorithms - Prim's and Kruskal's algorithms also make locally optimal choices that lead to globally optimal solutions.

Remember the **cut property** from graph theory? Dijkstra's leverages a similar principle for shortest paths.`,
          analogy: 'Just like how Prim\'s MST algorithm greedily chose the minimum weight edge crossing the cut, Dijkstra greedily chooses the minimum distance vertex.',
          completed: false
        },
        {
          id: 'exercise-3',
          type: 'exercise' as const,
          title: '🧠 Proof Challenge',
          problem: 'Prove that when Dijkstra\'s algorithm selects a vertex u with distance d, no shorter path to u can exist. Use contradiction.',
          hints: [
            'Assume there exists a shorter path to u',
            'This path must go through some unvisited vertex v',
            'But we chose u because it had minimum distance among unvisited vertices',
            'This leads to a contradiction'
          ],
          cs61bConnection: 'Remember proving correctness of algorithms in CS 61B? Same approach - assume the opposite and find a contradiction.',
          completed: false
        },
        {
          id: 'concept-4',
          type: 'concept' as const,
          title: 'Implementation with Priority Queue',
          content: `Let's implement Dijkstra's using the **priority queue** concepts from CS 61B. Remember your \`ArrayHeapMinPQ\` implementation? We'll use a similar approach.

\`\`\`java
public class DijkstrasSP {
    private double[] distTo;
    private DirectedEdge[] edgeTo;
    private IndexMinPQ<Double> pq;
    
    public DijkstrasSP(EdgeWeightedDigraph G, int s) {
        distTo = new double[G.V()];
        edgeTo = new DirectedEdge[G.V()];
        pq = new IndexMinPQ<Double>(G.V());
        
        // Initialize distances (like your BFS distance array)
        for (int v = 0; v < G.V(); v++) {
            distTo[v] = Double.POSITIVE_INFINITY;
        }
        distTo[s] = 0.0;
        
        pq.insert(s, distTo[s]);
        while (!pq.isEmpty()) {
            int v = pq.delMin(); // Extract closest vertex
            for (DirectedEdge e : G.adj(v)) {
                relax(e); // Update distances to neighbors
            }
        }
    }
    
    private void relax(DirectedEdge e) {
        int v = e.from(), w = e.to();
        if (distTo[w] > distTo[v] + e.weight()) {
            distTo[w] = distTo[v] + e.weight();
            edgeTo[w] = e;
            if (pq.contains(w)) pq.decreaseKey(w, distTo[w]);
            else                pq.insert(w, distTo[w]);
        }
    }
}
\`\`\`

The **relax operation** is where the magic happens - it's like updating your \`distTo\` array in BFS, but now considering edge weights.`,
          analogy: 'This looks very similar to your CS 61B graph traversal code, just with a priority queue instead of a regular queue!',
          completed: false
        },
        {
          id: 'exercise-4',
          type: 'exercise' as const,
          title: '💻 Code Implementation',
          problem: 'Complete the relax() method implementation. What should happen when we find a shorter path to a vertex?',
          hints: [
            'Check if new path is shorter than current known distance',
            'Update distance and parent if shorter path found',
            'Update the vertex\'s priority in the priority queue',
            'Handle case where vertex isn\'t in PQ yet'
          ],
          cs61bConnection: 'This is just like updating your shortest path data structures from the graph labs!',
          completed: false
        },
        {
          id: 'concept-5',
          type: 'concept' as const,
          title: 'Time Complexity Analysis',
          content: `Let's analyze the **time complexity** using the Big-O techniques from CS 61B. The runtime depends on our priority queue implementation:

**With Binary Heap (like your ArrayHeapMinPQ):**
- **Extract-min**: O(log V) - removing minimum from heap
- **Decrease-key**: O(log V) - updating priority in heap  
- **Total operations**: V extract-mins + E decrease-keys
- **Overall complexity**: O((V + E) log V)

For **dense graphs** (E ≈ V²), this becomes O(V² log V).
For **sparse graphs** (E ≈ V), this becomes O(V log V).

**With Fibonacci Heap** (advanced data structure):
- Extract-min: O(log V) amortized
- Decrease-key: O(1) amortized
- **Total**: O(V log V + E)

This analysis is similar to how you analyzed your **A* algorithm** complexity in the Berkeley Maps project - considering both the number of operations and the cost per operation.`,
          analogy: 'Remember analyzing the runtime of your heap operations in CS 61B? Same principle applies here - we count expensive operations and multiply by their cost.',
          completed: false
        },
        {
          id: 'exercise-5',
          type: 'exercise' as const,
          title: '⚡ Performance Analysis',
          problem: 'For a graph with 1000 vertices and 5000 edges, calculate the expected number of priority queue operations in Dijkstra\'s algorithm.',
          hints: [
            'Count extract-min operations (one per vertex)',
            'Count decrease-key operations (at most one per edge)',
            'Each operation takes O(log V) time in binary heap',
            'Total is (V + E) × log V'
          ],
          cs61bConnection: 'Just like analyzing your heap and graph algorithm runtimes in CS 61B!',
          completed: false
        }
      ]
    },
    'cs170-shortest-paths': {
      title: 'Shortest Path Algorithms',
      description: 'Master shortest path algorithms building on CS 61B foundations',
      items: [
        {
          id: 'concept-1',
          type: 'concept' as const,
          title: 'Shortest Path Problem Overview',
          content: `The shortest path problem asks: given a graph and two vertices, what's the path between them with minimum total weight? This builds directly on the **graph traversal** concepts from CS 61B.

In CS 61B, you solved the unweighted shortest path problem using **BFS**. Now we're extending this to weighted graphs where edges have different costs - like finding the fastest route considering traffic, not just the route with fewest turns.

There are several variants:
- **Single-source**: Find shortest paths from one vertex to all others (Dijkstra's)
- **Single-pair**: Find shortest path between two specific vertices  
- **All-pairs**: Find shortest paths between every pair of vertices (Floyd-Warshall)`,
          analogy: 'Remember your Berkeley Maps project? You found shortest paths in the road network - this is the same problem, but now roads can have different "costs" like travel time or distance.',
          completed: false
        }
      ]
    }
  };

  const currentLesson = lessonData[lessonId as keyof typeof lessonData] || lessonData.dijkstra;

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() && contentRef.current) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (contentRef.current.contains(range.commonAncestorContainer)) {
          const contextButton = document.createElement('button');
          contextButton.innerHTML = '💡 More Context';
          contextButton.className = 'fixed z-50 px-2 py-1 text-xs bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700 transition-colors';
          contextButton.style.left = `${rect.right + 10}px`;
          contextButton.style.top = `${rect.top - 5}px`;
          
          contextButton.onclick = () => {
            setContextModal({
              isOpen: true,
              content: getContextualExplanation(selection.toString()),
              title: 'More Context',
              position: { x: rect.left, y: rect.bottom },
              selectedText: selection.toString()
            });
            document.body.removeChild(contextButton);
            selection.removeAllRanges();
          };
          
          document.body.appendChild(contextButton);
          
          setTimeout(() => {
            if (document.body.contains(contextButton)) {
              document.body.removeChild(contextButton);
            }
          }, 5000);
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const getContextualExplanation = (selectedText: string): string => {
    const explanations: { [key: string]: string } = {
      'breadth-first search': 'BFS explores nodes level by level, visiting all neighbors of a vertex before moving to the next level. In CS 61B, you used this for finding shortest paths in unweighted graphs.',
      'priority queue': 'A priority queue always returns the element with highest (or lowest) priority. In CS 61B, you implemented this as a min-heap using an array-based binary heap structure.',
      'greedy choice': 'A greedy algorithm makes the locally optimal choice at each step, hoping to find a global optimum. This worked for MST algorithms like Prim\'s and Kruskal\'s in CS 61B.',
      'relaxation': 'Edge relaxation checks if going through a vertex gives a shorter path to its neighbor. If so, we update the distance - similar to updating shortest paths in your graph traversal labs.',
      'cut property': 'In graph theory, a cut divides vertices into two sets. The cut property states that the minimum weight edge crossing any cut is in some MST - this was key to understanding Prim\'s algorithm.',
      'time complexity': 'Big-O analysis measures how runtime grows with input size. In CS 61B, you analyzed complexities of data structures like heaps (O(log n) operations) and hash tables (O(1) average).'
    };

    const lowerText = selectedText.toLowerCase();
    for (const [key, explanation] of Object.entries(explanations)) {
      if (lowerText.includes(key.toLowerCase())) {
        return explanation;
      }
    }

    return `"${selectedText}" - This concept builds on foundations from CS 61B. Try highlighting specific terms like "priority queue" or "BFS" for more detailed explanations!`;
  };

  const toggleItemCompletion = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const toggleExerciseExpansion = (exerciseId: string) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseId)) {
      newExpanded.delete(exerciseId);
    } else {
      newExpanded.add(exerciseId);
    }
    setExpandedExercises(newExpanded);
  };

  const totalItems = currentLesson.items.length;
  const completedCount = currentLesson.items.filter(item => completedItems.has(item.id)).length;
  const progressPercentage = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl text-blue-900">{currentLesson.title}</h2>
            <p className="text-blue-700">{currentLesson.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-blue-700 mb-1">
            {completedCount} of {totalItems} completed
          </div>
          <Progress value={progressPercentage} className="w-32" />
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-4xl mx-auto space-y-6" ref={contentRef}>
        {currentLesson.items.map((item, index) => (
          <div key={item.id}>
            {item.type === 'concept' ? (
              // Concept Card
              <Card className={`${
                completedItems.has(item.id) 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-blue-200 bg-blue-50'
              } transition-colors`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-blue-900">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        completedItems.has(item.id) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }>
                        {completedItems.has(item.id) ? 'Completed' : 'In Progress'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemCompletion(item.id)}
                      >
                        {completedItems.has(item.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="prose prose-sm max-w-none text-blue-900"
                    dangerouslySetInnerHTML={{ 
                      __html: item.content?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-800">$1</strong>')
                        .replace(/```java\n([\s\S]*?)\n```/g, '<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto"><code>$1</code></pre>') || ''
                    }}
                  />
                  
                  {item.analogy && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-800">
                            <strong>CS 61B Connection:</strong> {item.analogy}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Exercise Card
              <Card className={`border-2 ${
                completedItems.has(item.id) 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-yellow-300 bg-yellow-50'
              } transition-colors`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-yellow-900">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        completedItems.has(item.id) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {completedItems.has(item.id) ? 'Completed' : 'Try It!'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExerciseExpansion(item.id)}
                      >
                        {expandedExercises.has(item.id) ? (
                          <ChevronUp className="w-4 h-4 text-yellow-700" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-yellow-700" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-yellow-900 font-medium">{item.problem}</p>
                  
                  {expandedExercises.has(item.id) && (
                    <>
                      {item.hints && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-yellow-900">💡 Hints:</h5>
                          <div className="space-y-1">
                            {item.hints.map((hint, hintIdx) => (
                              <p key={hintIdx} className="text-sm text-yellow-700 pl-3 border-l-2 border-yellow-300">
                                {hint}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.cs61bConnection && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-700">
                              <strong>CS 61B Link:</strong> {item.cs61bConnection}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleItemCompletion(item.id)}
                          className={completedItems.has(item.id) ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}
                        >
                          {completedItems.has(item.id) ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            <Video className="w-3 h-3 mr-1" />
                            Hint Video
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            <HelpCircle className="w-3 h-3 mr-1" />
                            Get Help
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      {/* Help Resources */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Need Additional Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start">
              <Video className="w-4 h-4 mr-2" />
              Watch Berkeley Lecture
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Algorithm Visualization
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Office Hours
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Context Modal */}
      <Dialog open={contextModal.isOpen} onOpenChange={(open) => setContextModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Context: "{contextModal.selectedText}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-blue-700">{contextModal.content}</p>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Video className="w-3 h-3 mr-1" />
                Related Video
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <ExternalLink className="w-3 h-3 mr-1" />
                CS 61B Reference
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}