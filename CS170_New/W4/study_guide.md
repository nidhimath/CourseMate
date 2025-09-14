# Chapter 4
## Paths in graphs

### 4.1 Distances

Depth-first search readily identifies all the vertices of a graph that can be reached from a designated starting point. It also finds explicit paths to these vertices, summarized in its search tree. However, these paths might not be the most economical ones possible. In the figure, vertex C is reachable from S by traversing just one edge, while the DFS tree shows a path of length 3. This chapter is about algorithms for finding shortest paths in graphs.

Path lengths allow us to talk quantitatively about the extent to which different vertices of a graph are separated from each other:

→ The distance between two nodes is the length of the shortest path between them.

To get a concrete feel for this notion, consider a physical realization of a graph that has a ball for each vertex and a piece of string for each edge. If you lift the ball for vertex s high enough, the other balls that get pulled up along with it are precisely the vertices reachable from s. And to find their distances from s, you need only measure how far below s they hang.

In Figure 4.2 for example, vertex B is at distance 2 from S, and there are two shortest paths to it. When S is held up, the strings along each of these paths become taut. On the other hand, edge (D, E) plays no role in any shortest path and therefore remains slack.

### 4.2 Breadth-first search

In Figure 4.2, the lifting of s partitions the graph into layers: s itself, the nodes at distance 1 from it, the nodes at distance 2 from it, and so on. A convenient way to compute distances from s to the other vertices is to proceed layer by layer. Once we have picked out the nodes at distance 0, 1, 2, . . . , d, the ones at d + 1 are easily determined: they are precisely the as-yet-unseen nodes that are adjacent to the layer at distance d. This suggests an iterative algorithm in which two layers are active at any given time: some layer d, which has been fully identified, and d + 1, which is being discovered by scanning the neighbors of layer d.

Breadth-first search (BFS) directly implements this simple reasoning (Figure 4.3). Initially the queue Q consists only of s, the one node at distance 0. And for each subsequent distance d = 1, 2, 3, . . ., there is a point in time at which Q contains all the nodes at distance d and nothing else. As these nodes are processed (ejected off the front of the queue), their as-yet-unseen neighbors are injected into the end of the queue.

Let's try out this algorithm on our earlier example (Figure 4.1) to confirm that it does the right thing. If S is the starting point and the nodes are ordered alphabetically, they get visited in the sequence shown in Figure 4.4. The breadth-first search tree, on the right, contains the edges through which each node is initially discovered. Unlike the DFS tree we saw earlier, it has the property that all its paths from S are the shortest possible. It is therefore a shortest-path tree.

#### Correctness and efficiency

We have developed the basic intuition behind breadth-first search. In order to check that the algorithm works correctly, we need to make sure that it faithfully executes this intuition. What we expect, precisely, is that

→ For each d = 0, 1, 2, . . ., there is a moment at which (1) all nodes at distance ≤d from s have their distances correctly set; (2) all other nodes have their distances set to ∞; and (3) the queue contains exactly the nodes at distance d.

This has been phrased with an inductive argument in mind. We have already discussed both the base case and the inductive step. Can you fill in the details?

The overall running time of this algorithm is linear, O(|V| + |E|), for exactly the same reasons as depth-first search. Each vertex is put on the queue exactly once, when it is first encountered, so there are 2|V| queue operations. The rest of the work is done in the algorithm's innermost loop. Over the course of execution, this loop looks at each edge once (in directed graphs) or twice (in undirected graphs), and therefore takes O(|E|) time.

Now that we have both BFS and DFS before us: how do their exploration styles compare? Depth-first search makes deep incursions into a graph, retreating only when it runs out of new nodes to visit. This strategy gives it the wonderful, subtle, and extremely useful properties we saw in the Chapter 3. But it also means that DFS can end up taking a long and convoluted route to a vertex that is actually very close by, as in Figure 4.1. Breadth-first search makes sure to visit vertices in increasing order of their distance from the starting point. This is a broader, shallower search, rather like the propagation of a wave upon water. And it is achieved using almost exactly the same code as DFS—but with a queue in place of a stack.

Also notice one stylistic difference from DFS: since we are only interested in distances from s, we do not restart the search in other connected components. Nodes not reachable from s are simply ignored.

### 4.3 Lengths on edges

Breadth-first search treats all edges as having the same length. This is rarely true in applications where shortest paths are to be found. For instance, suppose you are driving from San Francisco to Las Vegas, and want to find the quickest route. Figure 4.5 shows the major highways you might conceivably use. Picking the right combination of them is a shortest-path problem in which the length of each edge (each stretch of highway) is important. For the remainder of this chapter, we will deal with this more general scenario, annotating every edge e ∈ E with a length le. If e = (u, v), we will sometimes also write l(u, v) or luv.

These le's do not have to correspond to physical lengths. They could denote time (driving time between cities) or money (cost of taking a bus), or any other quantity that we would like to conserve. In fact, there are cases in which we need to use negative lengths, but we will briefly overlook this particular complication.

### 4.4 Dijkstra's algorithm

#### 4.4.1 An adaptation of breadth-first search

Breadth-first search finds shortest paths in any graph whose edges have unit length. Can we adapt it to a more general graph G = (V, E) whose edge lengths le are positive integers?

##### A more convenient graph

Here is a simple trick for converting G into something BFS can handle: break G's long edges into unit-length pieces, by introducing "dummy" nodes. Figure 4.6 shows an example of this transformation. To construct the new graph G',

→ For any edge e = (u, v) of E, replace it by le edges of length 1, by adding le - 1 dummy nodes between u and v.

Graph G' contains all the vertices V that interest us, and the distances between them are exactly the same as in G. Most importantly, the edges of G' all have unit length. Therefore, we can compute distances in G by running BFS on G'.

##### Alarm clocks

If efficiency were not an issue, we could stop here. But when G has very long edges, the G' it engenders is thickly populated with dummy nodes, and the BFS spends most of its time diligently computing distances to these nodes that we don't care about at all.

To see this more concretely, consider the graphs G and G' of Figure 4.7, and imagine that the BFS, started at node s of G', advances by one unit of distance per minute. For the first 99 minutes it tediously progresses along S-A and S-B, an endless desert of dummy nodes. Is there some way we can snooze through these boring phases and have an alarm wake us up whenever something interesting is happening—specifically, whenever one of the real nodes (from the original graph G) is reached?

We do this by setting two alarms at the outset, one for node A, set to go off at time T = 100, and one for B, at time T = 200. These are estimated times of arrival, based upon the edges currently being traversed. We doze off and awake at T = 100 to find A has been discovered. At this point, the estimated time of arrival for B is adjusted to T = 150 and we change its alarm accordingly.

More generally, at any given moment the breadth-first search is advancing along certain edges of G, and there is an alarm for every endpoint node toward which it is moving, set to go off at the estimated time of arrival at that node. Some of these might be overestimates because BFS may later find shortcuts, as a result of future arrivals elsewhere. In the preceding example, a quicker route to B was revealed upon arrival at A. However, nothing interesting can possibly happen before an alarm goes off. The sounding of the next alarm must therefore signal the arrival of the wavefront to a real node u ∈ V by BFS. At that point, BFS might also start advancing along some new edges out of u, and alarms need to be set for their endpoints.

The following "alarm clock algorithm" faithfully simulates the execution of BFS on G'.

x Set an alarm clock for node s at time 0.
x Repeat until there are no more alarms:
  → Say the next alarm goes off at time T, for node u. Then:
    - The distance from s to u is T.
    - For each neighbor v of u in G:
      * If there is no alarm yet for v, set one for time T + l(u, v).
      * If v's alarm is set for later than T + l(u, v), then reset it to this earlier time.

##### Dijkstra's algorithm

The alarm clock algorithm computes distances in any graph with positive integral edge lengths. It is almost ready for use, except that we need to somehow implement the system of alarms. The right data structure for this job is a priority queue (usually implemented via a heap), which maintains a set of elements (nodes) with associated numeric key values (alarm times) and supports the following operations:

→ Insert. Add a new element to the set.
→ Decrease-key. Accommodate the decrease in key value of a particular element.
→ Delete-min. Return the element with the smallest key, and remove it from the set.
→ Make-queue. Build a priority queue out of the given elements, with the given key values. (In many implementations, this is significantly faster than inserting the elements one by one.)

The first two let us set alarms, and the third tells us which alarm is next to go off. Putting this all together, we get Dijkstra's algorithm (Figure 4.8).

In the code, dist(u) refers to the current alarm clock setting for node u. A value of ∞ means the alarm hasn't so far been set. There is also a special array, prev, that holds one crucial piece of information for each node u: the identity of the node immediately before it on the shortest path from s to u. By following these back-pointers, we can easily reconstruct shortest paths, and so this array is a compact summary of all the paths found. A full example of the algorithm's operation, along with the final shortest-path tree, is shown in Figure 4.9.

In summary, we can think of Dijkstra's algorithm as just BFS, except it uses a priority queue instead of a regular queue, so as to prioritize nodes in a way that takes edge lengths into account. This viewpoint gives a concrete appreciation of how and why the algorithm works, but there is a more direct, more abstract derivation that doesn't depend upon BFS at all. We now start from scratch with this complementary interpretation.

#### 4.4.2 An alternative derivation

Here's a plan for computing shortest paths: expand outward from the starting point s, steadily growing the region of the graph to which distances and shortest paths are known. This growth should be orderly, first incorporating the closest nodes and then moving on to those further away. More precisely, when the "known region" is some subset of vertices R that includes s, the next addition to it should be the node outside R that is closest to s. Let us call this node v; the question is: how do we identify it?

To answer, consider u, the node just before v in the shortest path from s to v:

Since we are assuming that all edge lengths are positive, u must be closer to s than v is. This means that u is in R—otherwise it would contradict v's status as the closest node to s outside R. So, the shortest path from s to v is simply a known shortest path extended by a single edge.

But there will typically be many single-edge extensions of the currently known shortest paths (Figure 4.10); which of these identifies v? The answer is, the shortest of these extended paths. Because, if an even shorter single-edge-extended path existed, this would once more contradict v's status as the node outside R closest to s. So, it's easy to find v: it is the node outside R for which the smallest value of distance(s, u) + l(u, v) is attained, as u ranges over R. In other words, try all single-edge extensions of the currently known shortest paths, find the shortest such extended path, and proclaim its endpoint to be the next node of R.

We now have an algorithm for growing R by looking at extensions of the current set of shortest paths. Some extra efficiency comes from noticing that on any given iteration, the only new extensions are those involving the node most recently added to region R. All other extensions will have been assessed previously and do not need to be recomputed. In the following pseudocode, dist(v) is the length of the currently shortest single-edge-extended path leading to v; it is ∞ for nodes not adjacent to R.

```
Initialize dist(s) to 0, other dist(·) values to ∞
R = { } (the "known region")
while R ≠ V:
    Pick the node v ∉ R with smallest dist(·)
    Add v to R
    for all edges (v, z) ∈ E:
        if dist(z) > dist(v) + l(v, z):
            dist(z) = dist(v) + l(v, z)
```

Incorporating priority queue operations gives us back Dijkstra's algorithm (Figure 4.8).

To justify this algorithm formally, we would use a proof by induction, as with breadth-first search. Here's an appropriate inductive hypothesis.

→ At the end of each iteration of the while loop, the following conditions hold: (1) there is a value d such that all nodes in R are at distance ≤d from s and all nodes outside R are at distance ≥d from s, and (2) for every node u, the value dist(u) is the length of the shortest path from s to u whose intermediate nodes are constrained to be in R (if no such path exists, the value is ∞).

The base case is straightforward (with d = 0), and the details of the inductive step can be filled in from the preceding discussion.

#### 4.4.3 Running time

At the level of abstraction of Figure 4.8, Dijkstra's algorithm is structurally identical to breadth-first search. However, it is slower because the priority queue primitives are computationally more demanding than the constant-time eject's and inject's of BFS. Since makequeue takes at most as long as |V| insert operations, we get a total of |V| deletemin and |V| + |E| insert/decreasekey operations. The time needed for these varies by implementation; for instance, a binary heap gives an overall running time of O((|V| + |E|) log |V|).

##### Which heap is best?

The running time of Dijkstra's algorithm depends heavily on the priority queue implementation used. Here are the typical choices.

[THIS IS TABLE: Shows implementation comparison with columns for Implementation, deletemin, insert/decreasekey, and total time]
Implementation | deletemin | insert/decreasekey | |V| × deletemin + (|V| + |E|) × insert
Array | O(|V|) | O(1) | O(|V|²)
Binary heap | O(log |V|) | O(log |V|) | O((|V| + |E|) log |V|)
d-ary heap | O(d log |V|/log d) | O(log |V|/log d) | O((|V| · d + |E|) log |V|/log d)
Fibonacci heap | O(log |V|) | O(1) (amortized) | O(|V| log |V| + |E|)

So for instance, even a naive array implementation gives a respectable time complexity of O(|V|²), whereas with a binary heap we get O((|V| + |E|) log |V|). Which is preferable? This depends on whether the graph is sparse (has few edges) or dense (has lots of them). For all graphs, |E| is less than |V|². If it is Ω(|V|²), then clearly the