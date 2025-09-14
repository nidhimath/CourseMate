# Chapter 7 - Linear programming and reductions

Many of the problems for which we want algorithms are optimization tasks: the shortest path, the cheapest spanning tree, the longest increasing subsequence, and so on. In such cases, we seek a solution that (1) satisfies certain constraints (for instance, the path must use edges of the graph and lead from s to t, the tree must touch all nodes, the subsequence must be increasing); and (2) is the best possible, with respect to some well-defined criterion, among all solutions that satisfy these constraints.

Linear programming describes a broad class of optimization tasks in which both the constraints and the optimization criterion are linear functions. It turns out an enormous number of problems can be expressed in this way.

Given the vastness of its topic, this chapter is divided into several parts, which can be read separately subject to the following dependencies.

## 7.1 An introduction to linear programming

In a linear programming problem we are given a set of variables, and we want to assign real values to them so as to (1) satisfy a set of linear equations and/or linear inequalities involving these variables and (2) maximize or minimize a given linear objective function.

### 7.1.1 Example: profit maximization

A boutique chocolatier has two products: its flagship assortment of triangular chocolates, called Pyramide, and the more decadent and deluxe Pyramide Nuit. How much of each should it produce to maximize profits? Let's say it makes x₁ boxes of Pyramide per day, at a profit of $1 each, and x₂ boxes of Nuit, at a more substantial profit of $6 apiece; x₁ and x₂ are unknown values that we wish to determine. But this is not all; there are also some constraints on x₁ and x₂ that must be accommodated (besides the obvious one, x₁, x₂ ≥ 0). First, the daily demand for these exclusive chocolates is limited to at most 200 boxes of Pyramide and 300 boxes of Nuit. Also, the current workforce can produce a total of at most 400 boxes of chocolate per day. What are the optimal levels of production?

We represent the situation by a linear program, as follows.

**Objective function**
max x₁ + 6x₂

**Constraints**
x₁ ≤ 200
x₂ ≤ 300  
x₁ + x₂ ≤ 400
x₁, x₂ ≥ 0

A linear equation in x₁ and x₂ defines a line in the two-dimensional (2D) plane, and a linear inequality designates a half-space, the region on one side of the line. Thus the set of all feasible solutions of this linear program, that is, the points (x₁, x₂) which satisfy all constraints, is the intersection of five half-spaces. It is a convex polygon, shown in Figure 7.1.

We want to find the point in this polygon at which the objective function—the profit—is maximized. The points with a profit of c dollars lie on the line x₁ + 6x₂ = c, which has a slope of −1/6 and is shown in Figure 7.1 for selected values of c. As c increases, this "profit line" moves parallel to itself, up and to the right. Since the goal is to maximize c, we must move the line as far up as possible, while still touching the feasible region. The optimum solution will be the very last feasible point that the profit line sees and must therefore be a vertex of the polygon, as shown in the figure. If the slope of the profit line were different, then its last contact with the polygon could be an entire edge rather than a single vertex. In this case, the optimum solution would not be unique, but there would certainly be an optimum vertex.

It is a general rule of linear programs that the optimum is achieved at a vertex of the feasible region. The only exceptions are cases in which there is no optimum; this can happen in two ways:

1. The linear program is infeasible; that is, the constraints are so tight that it is impossible to satisfy all of them. For instance, x ≤ 1, x ≥ 2.

2. The constraints are so loose that the feasible region is unbounded, and it is possible to achieve arbitrarily high objective values. For instance,
   max x₁ + x₂
   x₁, x₂ ≥ 0

### Solving linear programs

Linear programs (LPs) can be solved by the simplex method, devised by George Dantzig in 1947. We shall explain it in more detail in Section 7.6, but briefly, this algorithm starts at a vertex, in our case perhaps (0, 0), and repeatedly looks for an adjacent vertex (connected by an edge of the feasible region) of better objective value. In this way it does hill-climbing on the vertices of the polygon, walking from neighbor to neighbor so as to steadily increase profit along the way. Here's a possible trajectory.

Upon reaching a vertex that has no better neighbor, simplex declares it to be optimal and halts. Why does this local test imply global optimality? By simple geometry—think of the profit line passing through this vertex. Since all the vertex's neighbors lie below the line, the rest of the feasible polygon must also lie below this line.

### More products

Encouraged by consumer demand, the chocolatier decides to introduce a third and even more exclusive line of chocolates, called Pyramide Luxe. One box of these will bring in a profit of $13. Let x₁, x₂, x₃ denote the number of boxes of each chocolate produced daily, with x₃ referring to Luxe. The old constraints on x₁ and x₂ persist, although the labor restriction now extends to x₃ as well: the sum of all three variables can be at most 400. What's more, it turns out that Nuit and Luxe require the same packaging machinery, except that Luxe uses it three times as much, which imposes another constraint x₂ + 3x₃ ≤ 600. What are the best possible levels of production?

Here is the updated linear program.

max x₁ + 6x₂ + 13x₃
x₁ ≤ 200
x₂ ≤ 300
x₁ + x₂ + x₃ ≤ 400
x₂ + 3x₃ ≤ 600
x₁, x₂, x₃ ≥ 0

The space of solutions is now three-dimensional. Each linear equation defines a 3D plane, and each inequality a half-space on one side of the plane. The feasible region is an intersection of seven half-spaces, a polyhedron (Figure 7.2). Looking at the figure, can you decipher which inequality corresponds to each face of the polyhedron?

A profit of c corresponds to the plane x₁ + 6x₂ + 13x₃ = c. As c increases, this profit-plane moves parallel to itself, further and further into the positive orthant until it no longer touches the feasible region. The point of final contact is the optimal vertex: (0, 300, 100), with total profit $3100.

How would the simplex algorithm behave on this modified problem? As before, it would move from vertex to vertex, along edges of the polyhedron, increasing profit steadily. A possible trajectory is shown in Figure 7.2, corresponding to the following sequence of vertices and profits:

(0, 0, 0) → $0  
(200, 0, 0) → $200  
(200, 200, 0) → $1400  
(200, 0, 200) → $2800  
(0, 300, 100) → $3100

Finally, upon reaching a vertex with no better neighbor, it would stop and declare this to be the optimal point. Once again by basic geometry, if all the vertex's neighbors lie on one side of the profit-plane, then so must the entire polyhedron.

### A magic trick called duality

Here is why you should believe that (0, 300, 100), with a total profit of $3100, is the optimum: Look back at the linear program. Add the second inequality to the third, and add to them the fourth multiplied by 4. The result is the inequality x₁ + 6x₂ + 13x₃ ≤ 3100.

Do you see? This inequality says that no feasible solution (values x₁, x₂, x₃ satisfying the constraints) can possibly have a profit greater than 3100. So we must indeed have found the optimum! The only question is, where did we get these mysterious multipliers (0, 1, 1, 4) for the four inequalities?

In Section 7.4 we'll see that it is always possible to come up with such multipliers by solving another LP! Except that (it gets even better) we do not even need to solve this other LP, because it is in fact so intimately connected to the original one—it is called the dual—that solving the original LP solves the dual as well! But we are getting far ahead of our story.

What if we add a fourth line of chocolates, or hundreds more of them? Then the problem becomes high-dimensional, and hard to visualize. Simplex continues to work in this general setting, although we can no longer rely upon simple geometric intuitions for its description and justification. We will study the full-fledged simplex algorithm in Section 7.6.

In the meantime, we can rest assured in the knowledge that there are many professional, industrial-strength packages that implement simplex and take care of all the tricky details like numeric precision. In a typical application, the main task is therefore to correctly express the problem as a linear program. The package then takes care of the rest.

