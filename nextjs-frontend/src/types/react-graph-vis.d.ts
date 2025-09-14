declare module 'react-graph-vis' {
    import { Component } from 'react';
    
    interface GraphEvents {
      select?: (event: any) => void;
      click?: (event: any) => void;
      oncontext?: (event: any) => void;
      doubleClick?: (event: any) => void;
      hoverNode?: (event: any) => void;
      blurNode?: (event: any) => void;
      hoverEdge?: (event: any) => void;
      blurEdge?: (event: any) => void;
      zoom?: (event: any) => void;
      showPopup?: (event: any) => void;
      hidePopup?: () => void;
    }
  
    interface GraphData {
      nodes: any[];
      edges: any[];
    }
  
    interface GraphOptions {
      [key: string]: any;
    }
  
    interface GraphProps {
      graph: GraphData;
      options?: GraphOptions;
      events?: GraphEvents;
      style?: React.CSSProperties;
      getNetwork?: (network: any) => void;
      getNodes?: (nodes: any) => void;
      getEdges?: (edges: any) => void;
    }
  
    export default class Graph extends Component<GraphProps> {}
  }