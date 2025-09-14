# Chapter 6: Dynamic programming

## 6.1 Shortest paths in dags, revisited

Dynamic programming represents one of the most powerful algorithmic paradigms, alongside linear programming, offering broad applicability when specialized methods fail. While this generality often comes at a cost in efficiency, the technique proves invaluable for solving complex optimization problems.

The foundation of dynamic programming lies in exploiting the special structure of directed acyclic graphs (dags). In a dag, nodes can be linearized—arranged so all edges go from left to right. This property makes shortest path computation particularly straightforward.

For any node D with predecessors B and C, the shortest path satisfies:
dist(D) = min{dist(B) + 1, dist(C) + 3}

This relationship extends to all nodes, enabling computation of all distances in a single pass through the linearized order. The algorithm solves a collection of subproblems {dist(u) : u ∈ V}, starting with the smallest (dist(s) = 0) and progressively tackling larger ones.

The key insight: at each node, we compute some function of the values of the node's predecessors. This technique generalizes beyond shortest paths—we could compute longest paths, paths with smallest products, or other optimizations simply by changing the function.

Dynamic programming fundamentally involves identifying and solving subproblems from smallest to largest, using answers to small problems to solve larger ones. The dag is implicit: nodes represent subproblems, edges represent dependencies between them.

## 6.2 Longest increasing subsequences

Given a sequence a₁, ..., aₙ, an increasing subsequence consists of elements aᵢ₁, aᵢ₂, ..., aᵢₖ where i₁ < i₂ < ... < iₖ and the numbers are strictly increasing. The task: find the increasing subsequence of greatest length.

To understand the solution space, we create a graph with node i for each element aᵢ, adding directed edges (i, j) whenever i < j and aᵢ < aⱼ. This graph forms a dag where increasing subsequences correspond to paths.

The algorithm defines L(j) as the length of the longest increasing subsequence ending at j:

```
for j = 1, 2, ..., n:
    L(j) = 1 + max{L(i) : (i, j) ∈ E}
return maxⱼ L(j)
```

This exemplifies the dynamic programming property: an ordering on subproblems with a relation showing how to solve each subproblem given answers to "smaller" ones. The computation takes O(n²) time.

The danger of recursion becomes apparent here. A naive recursive approach would solve the same subproblems repeatedly, leading to exponential time complexity. Dynamic programming achieves efficiency by explicitly enumerating distinct subproblems and solving them in the right order.

## 6.3 Edit distance

Edit distance measures the similarity between strings through alignment. An alignment writes strings one above the other, with gaps indicated by "−". The cost equals the number of differing columns, and edit distance is the minimum cost over all possible alignments.

For strings x[1···m] and y[1···n], we define subproblems:
E(i, j) = edit distance between x[1···i] and y[1···j]

The rightmost column of any alignment must be one of three forms, leading to:
E(i, j) = min{1 + E(i−1, j), 1 + E(i, j−1), diff(i, j) + E(i−1, j−1)}

where diff(i, j) = 0 if x[i] = y[j], and 1 otherwise.

The algorithm fills an m×n table with base cases E(0, j) = j and E(i, 0) = i:

```
for i = 0, 1, ..., m:
    E(i, 0) = i
for j = 1, 2, ..., n:
    E(0, j) = j
for i = 1, 2, ..., m:
    for j = 1, 2, ..., n:
        E(i, j) = min{E(i−1, j) + 1, E(i, j−1) + 1, E(i−1, j−1) + diff(i, j)}
return E(m, n)
```

Running time: O(mn).

The underlying dag structure reveals itself with nodes corresponding to positions (i, j) and edges representing precedence constraints. By weighting edges appropriately, edit distances become shortest paths in this dag.

## 6.4 Knapsack

The knapsack problem involves selecting items of weights w₁, ..., wₙ and values v₁, ..., vₙ to maximize value while staying within capacity W.

### Knapsack with repetition

Define K(w) = maximum value achievable with capacity w.

If the optimal solution includes item i, then:
K(w) = max{K(w − wᵢ) + vᵢ : wᵢ ≤ w}

The algorithm:
```
K(0) = 0
for w = 1 to W:
    K(w) = max{K(w − wᵢ) + vᵢ : wᵢ ≤ w}
return K(W)
```

Time complexity: O(nW).

### Knapsack without repetition

When repetitions are forbidden, we need additional information about items used. Define:
K(w, j) = maximum value using capacity w and items 1, ..., j

The recurrence:
K(w, j) = max{K(w − wⱼ, j−1) + vⱼ, K(w, j−1)}

The algorithm fills a (W+1) × (n+1) table in O(nW) time.

Memoization offers an alternative: a recursive implementation that remembers previous invocations via hash tables. While achieving the same O(nW) complexity, memoization only solves actually-needed subproblems, potentially saving computation when many subproblems are irrelevant.
