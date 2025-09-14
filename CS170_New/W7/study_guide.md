# Chapter 6: Dynamic programming

## 6.5 Chain matrix multiplication

Multiplying matrices A₁ × A₂ × ... × Aₙ requires choosing a parenthesization. Different orders yield dramatically different costs.

Define C(i, j) = minimum cost of multiplying Aᵢ × ... × Aⱼ.

For the optimal subtree, splitting at position k:
C(i, j) = min{C(i, k) + C(k+1, j) + mᵢ₋₁ · mₖ · mⱼ : i ≤ k < j}

The algorithm:
```
for i = 1 to n:
    C(i, i) = 0
for s = 1 to n−1:
    for i = 1 to n−s:
        j = i + s
        C(i, j) = min{C(i, k) + C(k+1, j) + mᵢ₋₁ · mₖ · mⱼ : i ≤ k < j}
return C(1, n)
```

Time complexity: O(n³).

## 6.6 Shortest paths

### Shortest reliable paths

When path reliability matters, we seek shortest paths using at most k edges. Define:
dist(v, i) = length of shortest path from s to v using i edges

The update equation:
dist(v, i) = min{dist(u, i−1) + ℓ(u, v) : (u, v) ∈ E}

### All-pairs shortest paths

The Floyd-Warshall algorithm finds shortest paths between all vertex pairs. Define:
dist(i, j, k) = shortest path from i to j using only vertices {1, ..., k} as intermediates

The key insight: paths through k either use k or don't:
dist(i, j, k) = min{dist(i, k, k−1) + dist(k, j, k−1), dist(i, j, k−1)}

Time complexity: O(|V|³).

### The traveling salesman problem

For cities {1, ..., n}, find the minimum-length tour visiting each exactly once.

Define C(S, j) = shortest path visiting each node in S exactly once, starting at 1 and ending at j.

Recurrence:
C(S, j) = min{C(S−{j}, i) + dᵢⱼ : i ∈ S, i ≠ j}

Time complexity: O(n²2ⁿ)—exponential but much better than the O(n!) brute force.

## 6.7 Independent sets in trees

An independent set contains no adjacent nodes. While finding maximum independent sets is intractable in general graphs, trees admit linear-time solutions.

After rooting the tree at r, define:
I(u) = size of largest independent set in subtree rooted at u

The recurrence considers whether u is included:
I(u) = max{1 + Σ(grandchildren w) I(w), Σ(children w) I(w)}

The algorithm processes nodes bottom-up in the rooted tree, achieving O(|V| + |E|) time.

Memory optimization is crucial in dynamic programming. Often we need only remember values until larger dependent subproblems are solved, allowing substantial space savings compared to storing all subproblem solutions.