# Chapter 5: Greedy algorithms

A game like chess can be won only by thinking ahead: a player who is focused entirely on immediate advantage is easy to defeat. But in many other games, such as Scrabble, it is possible to do quite well by simply making whichever move seems best at the moment and not worrying too much about future consequences.

This sort of myopic behavior is easy and convenient, making it an attractive algorithmic strategy. Greedy algorithms build up a solution piece by piece, always choosing the next piece that offers the most obvious and immediate benefit. Although such an approach can be disastrous for some computational tasks, there are many for which it is optimal. Our first example is that of minimum spanning trees.

## 5.1 Minimum spanning trees

Suppose you are asked to network a collection of computers by linking selected pairs of them. This translates into a graph problem in which nodes are computers, undirected edges are potential links, and the goal is to pick enough of these edges that the nodes are connected. But this is not all; each link also has a maintenance cost, reflected in that edge's weight. What is the cheapest possible network?

One immediate observation is that the optimal set of edges cannot contain a cycle, because removing an edge from this cycle would reduce the cost without compromising connectivity:

**Property 1** Removing a cycle edge cannot disconnect a graph.

So the solution must be connected and acyclic: undirected graphs of this kind are called trees. The particular tree we want is the one with minimum total weight, known as the minimum spanning tree. Here is its formal definition.

**Input:** An undirected graph G = (V, E); edge weights we.  
**Output:** A tree T = (V, E′), with E′ ⊆ E, that minimizes weight(T) = Σe∈E′ we.

### 5.1.1 A greedy approach

Kruskal's minimum spanning tree algorithm starts with the empty graph and then selects edges from E according to the following rule.

*Repeatedly add the next lightest edge that doesn't produce a cycle.*

In other words, it constructs the tree edge by edge and, apart from taking care to avoid cycles, simply picks whichever edge is cheapest at the moment. This is a greedy algorithm: every decision it makes is the one with the most obvious immediate advantage.

The correctness of Kruskal's method follows from a certain cut property, which is general enough to also justify a whole slew of other minimum spanning tree algorithms.

### Trees

A tree is an undirected graph that is connected and acyclic. Much of what makes trees so useful is the simplicity of their structure. For instance,

**Property 2** A tree on n nodes has n - 1 edges.

This can be seen by building the tree one edge at a time, starting from an empty graph. Initially each of the n nodes is disconnected from the others, in a connected component by itself. As edges are added, these components merge. Since each edge unites two different components, exactly n - 1 edges are added by the time the tree is fully formed.

The converse is also true.

**Property 3** Any connected, undirected graph G = (V, E) with |E| = |V| - 1 is a tree.

**Property 4** An undirected graph is a tree if and only if there is a unique path between any pair of nodes.

### 5.1.2 The cut property

Say that in the process of building a minimum spanning tree (MST), we have already chosen some edges and are so far on the right track. Which edge should we add next? The following lemma gives us a lot of flexibility in our choice.

**Cut property** Suppose edges X are part of a minimum spanning tree of G = (V, E). Pick any subset of nodes S for which X does not cross between S and V - S, and let e be the lightest edge across this partition. Then X ∪ {e} is part of some MST.

A cut is any partition of the vertices into two groups, S and V - S. What this property says is that it is always safe to add the lightest edge across any cut (that is, between a vertex in S and one in V - S), provided X has no edges across the cut.

### 5.1.3 Kruskal's algorithm

We are ready to justify Kruskal's algorithm. At any given moment, the edges it has already chosen form a partial solution, a collection of connected components each of which has a tree structure. The next edge e to be added connects two of these components; call them T1 and T2. Since e is the lightest edge that doesn't produce a cycle, it is certain to be the lightest edge between T1 and V - T1 and therefore satisfies the cut property.

### 5.1.4 A data structure for disjoint sets

**Union by rank**

One way to store a set is as a directed tree. Nodes of the tree are elements of the set, arranged in no particular order, and each has parent pointers that eventually lead up to the root of the tree. This root element is a convenient representative, or name, for the set. It is distinguished from the other elements by the fact that its parent pointer is a self-loop.

In addition to a parent pointer π, each node also has a rank that, for the time being, should be interpreted as the height of the subtree hanging from that node.

By design, the rank of a node is exactly the height of the subtree rooted at that node. This means, for instance, that as you move up a path toward a root node, the rank values along the way are strictly increasing.

**Property 1** For any x, rank(x) < rank(π(x)).

**Property 2** Any root node of rank k has at least 2^k nodes in its tree.

**Property 3** If there are n elements overall, there can be at most n/2^k nodes of rank k.

This last observation implies, crucially, that the maximum rank is log n. Therefore, all the trees have height ≤ log n, and this is an upper bound on the running time of find and union.

**Path compression**

During each find, when a series of parent pointers is followed up to the root of a tree, we will change all these pointers so that they point directly to the root. This path compression heuristic only slightly increases the time needed for a find and is easy to code.

The benefit of this simple alteration is long-term rather than instantaneous and thus necessitates a particular kind of analysis: we need to look at sequences of find and union operations, starting from an empty data structure, and determine the average time per operation. This amortized cost turns out to be just barely more than O(1), down from the earlier O(log n).

### 5.1.5 Prim's algorithm

What the cut property tells us in most general terms is that any algorithm conforming to the following greedy schema is guaranteed to work.

X = { } (edges picked so far)  
repeat until |X| = |V| - 1:  
→ pick a set S ⊂ V for which X has no edges between S and V - S  
→ let e ∈ E be the minimum-weight edge between S and V - S  
→ X = X ∪ {e}

A popular alternative to Kruskal's algorithm is Prim's, in which the intermediate set of edges X always forms a subtree, and S is chosen to be the set of this tree's vertices.

## 5.2 Huffman encoding

In the MP3 audio compression scheme, a sound signal is encoded in three steps.

1. It is digitized by sampling at regular intervals, yielding a sequence of real numbers s1, s2, ..., sT.

2. Each real-valued sample st is quantized: approximated by a nearby number from a finite set Γ. This set is carefully chosen to exploit human perceptual limitations, with the intention that the approximating sequence is indistinguishable from s1, s2, ..., sT by the human ear.

3. The resulting string of length T over alphabet Γ is encoded in binary.

It is in the last step that Huffman encoding is used. A danger with having codewords of different lengths is that the resulting encoding may not be uniquely decipherable. We will avoid this problem by insisting on the prefix-free property: no codeword can be a prefix of another codeword.

Any prefix-free encoding can be represented by a full binary tree—that is, a binary tree in which every node has either zero or two children—where the symbols are at the leaves, and where each codeword is generated by a path from root to leaf, interpreting left as 0 and right as 1.

In general, how do we find the optimal coding tree, given the frequencies f1, f2, ..., fn of n symbols? To make the problem precise, we want a tree whose leaves each correspond to a symbol and which minimizes the overall length of the encoding,

cost of tree = Σ(i=1 to n) fi · (depth of ith symbol in tree)

The cost of a tree is the sum of the frequencies of all leaves and internal nodes, except the root.

The first formulation of the cost function tells us that the two symbols with the smallest frequencies must be at the bottom of the optimal tree, as children of the lowest internal node. This suggests that we start constructing the tree greedily: find the two symbols with the smallest frequencies, say i and j, and make them children of a new node, which then has frequency fi + fj.

## 5.3 Horn formulas

In order to display human-level intelligence, a computer must be able to perform at least some modicum of logical reasoning. Horn formulas are a particular framework for doing this, for expressing logical facts and deriving conclusions.

The most primitive object in a Horn formula is a Boolean variable, taking value either true or false. A literal is either a variable x or its negation x̄ ("NOT x"). In Horn formulas, knowledge about variables is represented by two kinds of clauses:

1. Implications, whose left-hand side is an AND of any number of positive literals and whose right-hand side is a single positive literal.

2. Pure negative clauses, consisting of an OR of any number of negative literals.

Given a set of clauses of these two types, the goal is to determine whether there is a consistent explanation: an assignment of true/false values to the variables that satisfies all the clauses. This is also called a satisfying assignment.

Our strategy for solving a Horn formula is this: We start with all variables false. We then proceed to set some of them to true, one by one, but very reluctantly, and only if we absolutely have to because an implication would otherwise be violated. Once we are done with this phase and all implications are satisfied, only then do we turn to the negative clauses and make sure they are all satisfied.

## 5.4 Set cover

This is a typical set cover problem. For each town x, let Sx be the set of towns within 30 miles of it. A school at x will essentially "cover" these other towns. The question is then, how many sets Sx must be picked in order to cover all the towns in the county?

**SET COVER**  
**Input:** A set of elements B; sets S1, ..., Sm ⊆ B  
**Output:** A selection of the Si whose union is B.  
**Cost:** Number of sets picked.

This problem lends itself immediately to a greedy solution:

Repeat until all elements of B are covered:  
→ Pick the set Si with the largest number of uncovered elements.

**Claim** Suppose B contains n elements and that the optimal cover consists of k sets. Then the greedy algorithm will use at most k ln n sets.

The ratio between the greedy algorithm's solution and the optimal solution varies from input to input but is always less than ln n. We call this maximum ratio the approximation factor of the greedy algorithm.