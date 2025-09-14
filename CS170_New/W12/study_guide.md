# Chapter 8 Study Notes: NP-complete Problems

## 8.2 NP-complete Problems

### P and NP

The class of all search problems is denoted NP.

The class of all search problems that can be solved in polynomial time is denoted P.

NP stands for "nondeterministic polynomial time," a term going back to the roots of complexity theory. Intuitively, it means that a solution to any search problem can be found and verified in polynomial time by a special (and quite unrealistic) sort of algorithm, called a nondeterministic algorithm.

Is P ≠ NP? Most algorithms researchers think so. It is hard to believe that exponential search can always be avoided, that a simple trick will crack all these hard problems, famously unsolved for decades and centuries.

### Reductions

A reduction from search problem A to search problem B is a polynomial-time algorithm f that transforms any instance I of A into an instance f(I) of B, together with another polynomial-time algorithm h that maps any solution S of f(I) back into a solution h(S) of I. If f(I) has no solution, then neither does I.

A search problem is NP-complete if all other search problems reduce to it.

Difficulty flows in the direction of the arrow, while efficient algorithms move in the opposite direction. If even one NP-complete problem is in P, then P = NP.

Reductions compose: If A → B and B → C, then A → C.

## 8.3 The Reductions

The search problems can be reduced to one another. As a consequence, they are all NP-complete.

### Key Reductions

3SAT → INDEPENDENT SET: Given a 3SAT instance, create a graph with a triangle for each clause (vertices labeled by the clause's literals), and additional edges between any two vertices that represent opposite literals. Set the goal to the number of clauses.

SAT → 3SAT: Replace any clause with more than three literals (a₁ ∨ a₂ ∨ · · · ∨ aₖ) by a set of clauses using new variables y₁, y₂, etc.

INDEPENDENT SET → VERTEX COVER: A set of nodes S is a vertex cover of graph G = (V, E) if and only if the remaining nodes, V − S, are an independent set of G.

INDEPENDENT SET → CLIQUE: A set of nodes S is an independent set of G if and only if S is a clique of Ḡ (the complement of G).

3D MATCHING → ZOE: Express 3D MATCHING as a system of 0−1 equations where each variable represents whether a triple is chosen.

ZOE → SUBSET SUM: Think of the columns of the matrix as numbers in base n + 1.

RUDRATA CYCLE → TSP: Given a graph G = (V, E), create a TSP instance where the distance between cities u and v is 1 if {u, v} is an edge of G and 1 + α otherwise.

ANY PROBLEM IN NP → SAT: Any polynomial algorithm can be rendered as a circuit, and CIRCUIT SAT can be reduced to SAT.