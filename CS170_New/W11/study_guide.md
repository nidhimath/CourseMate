# Chapter 8 Study Notes: NP-complete Problems

## 8.1 Search Problems

Over the past seven chapters we have developed algorithms for finding shortest paths and minimum spanning trees in graphs, matchings in bipartite graphs, maximum increasing subsequences, maximum flows in networks, and so on. All these algorithms are efficient, because in each case their time requirement grows as a polynomial function (such as n, n², or n³) of the size of the input.

To better appreciate such efficient algorithms, consider the alternative: In all these problems we are searching for a solution (path, tree, matching, etc.) from among an exponential population of possibilities. Indeed, n boys can be matched with n girls in n! different ways, a graph with n vertices has n^(n-2) spanning trees, and a typical graph has an exponential number of paths from s to t. All these problems could in principle be solved in exponential time by checking through all candidate solutions, one by one. But an algorithm whose running time is 2^n, or worse, is all but useless in practice. The quest for efficient algorithms is about finding clever ways to bypass this process of exhaustive search, using clues from the input in order to dramatically narrow down the search space.

So far in this book we have seen the most brilliant successes of this quest, algorithmic techniques that defeat the specter of exponentiality: greedy algorithms, dynamic programming, linear programming (while divide-and-conquer typically yields faster algorithms for problems we can already solve in polynomial time). Now the time has come to meet the quest's most embarrassing and persistent failures. We shall see some other "search problems," in which again we are seeking a solution with particular properties among an exponential chaos of alternatives. But for these new problems no shortcut seems possible. The fastest algorithms we know for them are all exponential—not substantially better than an exhaustive search.

### Satisfiability

SATISFIABILITY, or SAT, is a problem of great practical importance, with applications ranging from chip testing and computer design to image analysis and software engineering. It is also a canonical hard problem. Here's what an instance of SAT looks like:

(x ∨ y ∨ z) (x̄ ∨ ȳ) (y ∨ z̄) (z ∨ x̄) (x̄ ∨ ȳ ∨ z̄)

This is a Boolean formula in conjunctive normal form (CNF). It is a collection of clauses (the parentheses), each consisting of the disjunction (logical or, denoted ∨) of several literals, where a literal is either a Boolean variable (such as x) or the negation of one (such as x̄).

A satisfying truth assignment is an assignment of false or true to each variable so that every clause contains a literal whose value is true. The SAT problem is the following: given a Boolean formula in conjunctive normal form, either find a satisfying truth assignment or else report that none exists.

A search problem is specified by an algorithm C that takes two inputs, an instance I and a proposed solution S, and runs in time polynomial in |I|. We say S is a solution to I if and only if C(I, S) = true.

### The Traveling Salesman Problem

In the traveling salesman problem (TSP) we are given n vertices 1, . . . , n and all n(n−1)/2 distances between them, as well as a budget b. We are asked to find a tour, a cycle that passes through every vertex exactly once, of total cost b or less—or to report that no such tour exists.

Notice how we have defined the TSP as a search problem: given an instance, find a tour within the budget (or report that none exists). Our plan in this chapter is to compare and relate problems. The framework of search problems is helpful in this regard, because it encompasses optimization problems like the TSP in addition to true search problems like SAT.

### Euler and Rudrata Problems

EULER PATH: Given a graph, find a path that contains each edge exactly once. It follows from Euler's observation that this search problem can be solved in polynomial time.

RUDRATA CYCLE: Given a graph, find a cycle that visits each vertex exactly once—or report that no such cycle exists. This problem is ominously reminiscent of the TSP, and indeed no polynomial algorithm is known for it.

### Other Hard Problems

INTEGER LINEAR PROGRAMMING (ILP): Given a set of linear inequalities Ax ≤ b, find a nonnegative integer n-vector x such that Ax ≤ b.

ZERO-ONE EQUATIONS (ZOE): Find a vector x of 0's and 1's satisfying Ax = 1, where A is an m×n matrix with 0−1 entries and 1 is the m-vector of all 1's.

THREE-DIMENSIONAL MATCHING: Given n boys, n girls, and n pets, with compatibilities specified by a set of triples, find n disjoint triples to create n harmonious households.

INDEPENDENT SET: Given a graph and an integer g, find g vertices that are independent (no two of which have an edge between them).

VERTEX COVER: Given a graph and a budget b, find b vertices that cover (touch) every edge.

CLIQUE: Given a graph and a goal g, find a set of g vertices such that all possible edges between them are present.

LONGEST PATH: Given a graph G with nonnegative edge weights and two distinguished vertices s and t, along with a goal g, find a path from s to t with total weight at least g.

KNAPSACK: Given integer weights w₁, . . . , wₙ and integer values v₁, . . . , vₙ for n items, weight capacity W and goal g, find a set of items whose total weight is at most W and whose total value is at least g.

SUBSET SUM: Find a subset of a given set of integers that adds up to exactly W.
