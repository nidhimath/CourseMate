## Graphs and Graph Algorithms

### Key Learnings
- Graphs consist of vertices (nodes) and edges
- Directed vs Undirected graphs
- Adjacency list vs Adjacency matrix representation
- Breadth-First Search (BFS) and Depth-First Search (DFS)
- Shortest path algorithms: Dijkstra's algorithm

### Examples and Explanations
Graph Representation (Adjacency List):
```java
class Graph {
    private Map<Integer, List<Integer>> adjList;
    
    public void addEdge(int from, int to) {
        adjList.computeIfAbsent(from, k -> new ArrayList<>()).add(to);
    }
}
```

BFS Implementation:
```java
public void bfs(int start) {
    Queue<Integer> queue = new LinkedList<>();
    boolean[] visited = new boolean[vertices];
    queue.offer(start);
    visited[start] = true;
    
    while (!queue.isEmpty()) {
        int current = queue.poll();
        for (int neighbor : adjList.get(current)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                queue.offer(neighbor);
            }
        }
    }
}
```