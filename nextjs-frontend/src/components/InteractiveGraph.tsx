import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import styles from './InteractiveGraph.module.css';

// Dynamically import react-graph-vis to avoid SSR issues
const Graph = dynamic(() => import('react-graph-vis'), { 
  ssr: false,
  loading: () => <div className={styles.interactiveGraphLoading}>Loading graph...</div>
});

// Type definitions
interface TopicData {
  course: string;
  order: number;
  prereqs?: string[];
}

interface KnowledgeGraph {
  [topicName: string]: TopicData;
}

interface NodeColor {
  background: string;
  border: string;
  highlight: string;
}

interface NodeData {
  id: string;
  label: string;
  title: string;
  color: {
    background: string;
    border: string;
    highlight: {
      background: string;
      border: string;
    };
    hover: {
      background: string;
      border: string;
    };
  };
  size: number;
  font: {
    size: number;
    color: string;
    face: string;
    strokeWidth: number;
    strokeColor: string;
    align: string;
    multi: string;
    bold: boolean;
  };
  borderWidth: number;
  shadow: {
    enabled: boolean;
    color: string;
    size: number;
    x: number;
    y: number;
  };
  course: string;
  order: number;
  prereqs: string[];
}

interface EdgeData {
  from: string;
  to: string;
  arrows: {
    to: {
      enabled: boolean;
      scaleFactor: number;
      type: string;
    };
  };
  color: {
    color: string;
    highlight: string;
    hover: string;
    opacity: number;
  };
  width: number;
  dashes?: boolean | number[];
  smooth: {
    enabled: boolean;
    type: string;
    roundness: number;
  };
  shadow: {
    enabled: boolean;
    color: string;
    size: number;
    x: number;
    y: number;
  };
  hoverWidth?: (width: number) => number;
  selectionWidth?: (width: number) => number;
}

interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

interface InteractiveGraphProps {
  knowledgeGraph: KnowledgeGraph;
  selectedTopic: string;
  onNodeSelect?: (nodeData: NodeData) => void;
  width?: string;
  height?: string;
  showControls?: boolean;
  onTopicChange?: (topic: string) => void;
}

interface SelectEvent {
  nodes: string[];
  edges: string[];
}

const InteractiveGraph: React.FC<InteractiveGraphProps> = ({ 
  knowledgeGraph, 
  selectedTopic, 
  onNodeSelect,
  width = '800px',
  height = '600px',
  showControls = true,
  onTopicChange
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [network, setNetwork] = useState<any>(null);
  const router = useRouter();

  // Color nodes by course with prettier gradients
  const getNodeColor = useCallback((course: string): NodeColor => {
    const colors: Record<string, NodeColor> = {
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

  // Transform the knowledge graph data into nodes and edges for vis.js
  const graphData = useMemo((): GraphData => {
    if (!knowledgeGraph || !selectedTopic) return { nodes: [], edges: [] };

    const topic = knowledgeGraph[selectedTopic];
    if (!topic) return { nodes: [], edges: [] };

    const relatedTopics = new Set<string>([selectedTopic]);
    
    // Add prerequisites and topics that have this as a prerequisite
    if (topic.prereqs && Array.isArray(topic.prereqs)) {
      topic.prereqs.forEach(prereq => relatedTopics.add(prereq));
    }
    
    Object.entries(knowledgeGraph).forEach(([topicName, topicData]) => {
      if (topicData.prereqs && Array.isArray(topicData.prereqs) && topicData.prereqs.includes(selectedTopic)) {
        relatedTopics.add(topicName);
      }
    });

    const nodes: NodeData[] = Array.from(relatedTopics).map(topicName => {
      const topicData = knowledgeGraph[topicName];
      if (!topicData) return null;
      
      const nodeColors = getNodeColor(topicData.course);
      const isMainTopic = topicName === selectedTopic;
      
      return {
        id: topicName,
        label: topicName.length > 20 ? topicName.replace(/(.{20})/g, '$1\n').trim() : topicName,
        title: `${topicName}\nCourse: ${topicData.course}\nOrder: ${topicData.order}`, // Enhanced tooltip
        color: {
          background: nodeColors.background,
          border: isMainTopic ? '#2C3E50' : nodeColors.border,
          highlight: {
            background: nodeColors.highlight,
            border: '#2C3E50'
          },
          hover: {
            background: nodeColors.highlight,
            border: nodeColors.border
          }
        },
        size: isMainTopic ? 30 : 18,
        font: {
          size: isMainTopic ? 16 : 14,
          color: '#2C3E50',
          face: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          strokeWidth: isMainTopic ? 3 : 2,
          strokeColor: '#FFFFFF',
          align: 'center',
          multi: 'html',
          bold: isMainTopic
        },
        borderWidth: isMainTopic ? 4 : 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: isMainTopic ? 15 : 8,
          x: 2,
          y: 2
        },
        course: topicData.course,
        order: topicData.order,
        prereqs: topicData.prereqs || []
      };
    }).filter((node): node is NodeData => node !== null);

    const edges: EdgeData[] = [];
    nodes.forEach(node => {
      if (node.prereqs && Array.isArray(node.prereqs)) {
        node.prereqs.forEach(prereq => {
          if (relatedTopics.has(prereq)) {
            // Determine if this is a hard or soft prerequisite based on course relationships
            const isHardPrereq = true; // For now, treat all as hard prereqs
            
            edges.push({
              from: prereq,
              to: node.id,
              arrows: {
                to: {
                  enabled: true,
                  scaleFactor: 1.5,
                  type: 'arrow'
                },
              },
              color: {
                color: isHardPrereq ? '#2980B9' : '#95A5A6',
                highlight: '#E74C3C',
                hover: '#E74C3C',
                opacity: 0.9
              },
              width: isHardPrereq ? 3 : 2,
              dashes: isHardPrereq ? false : [5, 5], // Dashed for soft dependencies
              smooth: {
                enabled: false, // Straight edges for clarity
                type: 'straightCross',
                roundness: 0
              },
              shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.15)',
                size: 4,
                x: 2,
                y: 2
              },
              hoverWidth: function(width: number) {
                return width + 2;
              },
              selectionWidth: function(width: number) {
                return width + 1;
              }
            });
          }
        });
      }
    });

    return { nodes, edges };
  }, [knowledgeGraph, selectedTopic, getNodeColor]);

  const options = {
    layout: {
      improvedLayout: true,
      clusterThreshold: 150,
      hierarchical: {
        enabled: true,
        levelSeparation: 200,
        nodeSpacing: 150,
        treeSpacing: 250,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
        direction: 'UD', // Top-down for prerequisite flow
        sortMethod: 'directed',
        shakeTowards: 'roots'
      }
    },
    physics: {
      enabled: true,
      stabilization: { 
        iterations: 150,
        updateInterval: 25
      },
      barnesHut: {
        gravitationalConstant: -12000,
        centralGravity: 0.4,
        springLength: 180, // Increased for better spacing
        springConstant: 0.02,
        damping: 0.12,
        avoidOverlap: 0.2
      },
      maxVelocity: 50,
      minVelocity: 0.1,
      solver: 'barnesHut',
      timestep: 0.35,
      adaptiveTimestep: true
    },
    nodes: {
      shape: 'dot',
      scaling: {
        min: 20,
        max: 45,
        label: {
          enabled: true,
          min: 14,
          max: 20,
          maxVisible: 35,
          drawThreshold: 3
        }
      },
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      },
      chosen: {
        node: function(values: any, id: string, selected: boolean, hovering: boolean) {
          values.size = values.size * 1.1;
          values.borderWidth = values.borderWidth * 2;
        }
      }
    },
    edges: {
      width: 2,
      smooth: {
        enabled: false, // Straight edges by default
        type: 'straightCross'
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 1.2
        }
      },
      chosen: {
        edge: function(values: any, id: string, selected: boolean, hovering: boolean) {
          values.width = values.width * 1.5;
          values.color = '#E74C3C'; // Red highlight on selection
        }
      },
      hoverWidth: function(width: number) {
        return width + 1;
      },
      font: {
        size: 12,
        color: '#2C3E50',
        strokeWidth: 2,
        strokeColor: '#FFFFFF'
      }
    },
    interaction: {
      hover: true,
      hoverConnectedEdges: true,
      selectConnectedEdges: false,
      tooltipDelay: 300,
      zoomView: true,
      dragView: true,
      dragNodes: true,
      multiselect: false,
      navigationButtons: false,
      keyboard: {
        enabled: false
      }
    },
    configure: {
      enabled: false
    },
    height: height
  };

  const events = {
    select: function(event: SelectEvent) {
      const { nodes } = event;
      if (nodes.length > 0) {
        const nodeId = nodes[0];
        const nodeData = graphData.nodes.find(node => node.id === nodeId);
        if (nodeData) {
          setSelectedNode(nodeData);
          if (onNodeSelect) {
            onNodeSelect(nodeData);
          }
        }
      }
    }
  };

  const selectRandomTopic = (): void => {
    if (knowledgeGraph && onTopicChange) {
      const topics = Object.keys(knowledgeGraph);
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      onTopicChange(randomTopic);
      setSelectedNode(null);
    }
  };

  const zoomToFit = (): void => {
    if (network) {
      network.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutCubic'
        }
      });
    }
  };

  const zoomIn = (): void => {
    if (network) {
      const scale = network.getScale();
      network.moveTo({
        scale: scale * 1.2,
        animation: { duration: 300, easingFunction: 'easeInOutCubic' }
      });
    }
  };

  const zoomOut = (): void => {
    if (network) {
      const scale = network.getScale();
      network.moveTo({
        scale: scale * 0.8,
        animation: { duration: 300, easingFunction: 'easeInOutCubic' }
      });
    }
  };

  const closeNodeInfo = (): void => {
    setSelectedNode(null);
  };

  const navigateToCourse = (courseCode: string): void => {
    router.push(`/courses/${courseCode}`);
  };

  if (!knowledgeGraph) {
    return <div className={styles.interactiveGraphLoading}>Loading knowledge graph...</div>;
  }

  return (
    <div className={styles.interactiveGraphContainer}>
      {showControls && (
        <div className={styles.interactiveGraphControls}>
          <button onClick={selectRandomTopic} className={styles.randomTopicButton}>
            Show Random Topic
          </button>
          <div className={styles.currentTopicDisplay}>
            Current Topic: <strong>{selectedTopic}</strong>
          </div>
          
          {/* Zoom Controls */}
          <div className={styles.zoomControls}>
            <button onClick={zoomIn} className={styles.zoomButton} title="Zoom In">
              +
            </button>
            <button onClick={zoomToFit} className={styles.zoomButton} title="Fit to Screen">
              ⌂
            </button>
            <button onClick={zoomOut} className={styles.zoomButton} title="Zoom Out">
              −
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.graphVisualizationGlass} style={{ width, height }}>
        <Graph
          graph={graphData}
          options={options}
          events={events}
          style={{ height: '100%', width: '100%' }}
          getNetwork={(net: any) => setNetwork(net)}
        />
      </div>

      {selectedNode && (
        <div className={styles.nodeInfoModal}>
          <div className={styles.nodeInfoContent}>
            <h3>Topic Information</h3>
            <div className={styles.infoDetails}>
              <p><strong>Topic:</strong> {selectedNode.id}</p>
              <p>
                <strong>Course:</strong>{' '}
                <button 
                  onClick={() => navigateToCourse(selectedNode.course)}
                  className={styles.courseLink}
                  title={`Go to ${selectedNode.course} course page`}
                >
                  {selectedNode.course}
                </button>
              </p>
              <p><strong>Order:</strong> {selectedNode.order}</p>
              <p><strong>Prerequisites:</strong></p>
              <ul>
                {selectedNode.prereqs && selectedNode.prereqs.length > 0 ? (
                  selectedNode.prereqs.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>
            <button onClick={closeNodeInfo} className={styles.closeInfoButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveGraph;
