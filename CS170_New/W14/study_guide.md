# Chapter 9 Study Notes
### Greedy Algorithms.1 Traveling salesman, once more
Assume we have all interpoint distances between n cities, giving a search space of (n − 1)!
different tours. What is a good notion of neighborhood?
The most obvious notion is to consider two tours as being close if they differ in just a few
edges. They can’t differ in just one edge (do you see why?), so we will consider differences of
two edges. We deﬁne the 2-change neighborhood of tour s as being the set of tours that can be
obtained by removing two edges of s and then putting in two other edges. Here’s an example
of a local move:
We now have a well-deﬁned local search procedure. How does it measure up under our two
standard criteria for algorithms—what is its overall running time, and does it always return
the best solution?
Embarrassingly, neither of these questions has a satisfactory answer. Each iteration is
certainly fast, because a tour has only O(n2) neighbors. However, it is not clear how many
iterations will be needed: whether for instance, there might be an exponential number of
them. Likewise, all we can easily say about the ﬁnal tour is that it is locally optimal—that
is, it is superior to the tours in its immediate neighborhood. There might be better solutions
further away. For instance, the following picture shows a possible ﬁnal answer that is clearly
suboptimal; the range of local moves is simply too limited to improve upon it.
To overcome this, we may try a more generous neighborhood, for instance 3-change, con-
sisting of tours that differ on up to three edges. And indeed, the preceding bad case gets
ﬁxed:
But there is a downside, in that the size of a neighborhood becomes O(n3), making each
iteration more expensive. Moreover, there may still be suboptimal local minima, although
fewer than before. To avoid these, we would have to go up to 4-change, or higher. In this
manner, efﬁciency and quality often turn out to be competing considerations in a local search.
Efﬁciency demands neighborhoods that can be searched quickly, but smaller neighborhoods
can increase the abundance of low-quality local optima. The appropriate compromise is typi-
cally determined by experimentation.


### Greedy Algorithms.2 Graph partitioning
The problem of graph partitioning arises in a diversity of applications, from circuit layout
to program analysis to image segmentation. We saw a special case of it, BALANCED CUT, in
# Chapter 8 Study Notes.
GRAPH PARTITIONING
Input: An undirected graph G = (V, E) with nonnegative edge weights; a real
number α ∈ (0, 1/2].
Output: A partition of the vertices into two groups A and B, each of size at least
α|V |.
Goal: Minimize the capacity of the cut (A, B).

Let's look at an example in which the graph has 16 nodes, all edge weights are 0
or 1, and the optimal solution has cost 0. Removing the restriction on the sizes of A and B
would give the MINIMUM CUT problem, which we know to be efﬁciently solvable using ﬂow
techniques. The present variant, however, is NP-hard. In designing a local search algorithm,
it will be a big convenience to focus on the special case α = 1/2, in which A and B are forced to
contain exactly half the vertices. The apparent loss of generality is purely cosmetic, as GRAPH
PARTITIONING reduces to this particular case.
We need to decide upon a neighborhood structure for our problem, and there is one obvious
way to do this. Let (A, B), with |A| = |B|, be a candidate solution; we will deﬁne its neighbors
to be all solutions obtainable by swapping one pair of vertices across the cut, that is, all
solutions of the form (A − {a} + {b}, B − {b} + {a}) where a ∈ A and b ∈ B. Here’s an example
of a local move:
We now have a reasonable local search procedure, and we could just stop here. But there
is still a lot of room for improvement in terms of the quality of the solutions produced. The
search space includes some local optima that are quite far from the global solution. 

What can be done about such suboptimal solutions? We could expand the neighborhood size
to allow two swaps at a time, but this particular bad instance would still stubbornly resist.
Instead, let’s look at some other generic schemes for improving local search procedures.
### Greedy Algorithms.3 Dealing with local optima
Randomization and restarts
Randomization can be an invaluable ally in local search. It is typically used in two ways: to
pick a random initial solution, for instance a random graph partition; and to choose a local
move when several are available.
When there are many local optima, randomization is a way of making sure that there is at
least some probability of getting to the right one. The local search can then be repeated several
times, with a different random seed on each invocation, and the best solution returned. If the
probability of reaching a good local optimum on any given run is p, then within O(1/p) runs
such a solution is likely to be found (recall Exercise 1.34).
Figure 9.10 shows a small instance of graph partitioning, along with the search space of
solutions. There are a total of 8 choose 4 = 70 possible states, but since each of them has an identical
twin in which the left and right sides of the cut are ﬂipped, in effect there are just 35 solutions.
In the ﬁgure, these are organized into seven groups for readability. There are ﬁve local optima,
of which four are bad, with cost 2, and one is good, with cost 0. If local search is started at a
random solution, and at each step a random neighbor of lower cost is selected, then the search
is at most four times as likely to wind up in a bad solution than a good one. Thus only a small
handful of repetitions is needed.

In the example of Figure 9.10, each run of local search has a reasonable chance of ﬁnding the
global optimum. This isn’t always true. As the problem size grows, the ratio of bad to good
local optima often increases, sometimes to the point of being exponentially large. In such
cases, simply repeating the local search a few times is ineffective.
A different avenue of attack is to occasionally allow moves that actually increase the cost,
in the hope that they will pull the search out of dead ends. This would be very useful at the
bad local optima of Figure 9.10, for instance. The method of simulated annealing redeﬁnes
the local search by introducing the notion of a temperature T.
let s be any starting solution
repeat
randomly choose a solution s′ in the neighborhood of s
if ∆ = cost(s′) − cost(s) is negative:
replace s by s′
else:
replace s by s′ with probability e−∆/T .
If T is zero, this is identical to our previous local search. But if T is large, then moves that
increase the cost are occasionally accepted. What value of T should be used?
The trick is to start with T large and then gradually reduce it to zero. Thus initially,
the local search can wander around quite freely, with only a mild preference for low-cost
solutions. As time goes on, this preference becomes stronger, and the system mostly sticks to
the lower-cost region of the search space, with occasional excursions out of it to escape local
optima. Eventually, when the temperature drops further, the system converges on a solution.
Figure 9.11 shows this process schematically.
Simulated annealing is inspired by the physics of crystallization. When a substance is to
be crystallized, it starts in liquid state, with its particles in relatively unconstrained motion.
Then it is slowly cooled, and as this happens, the particles gradually move into more regular
conﬁgurations. This regularity becomes more and more pronounced until ﬁnally a crystal
lattice is formed.
The beneﬁts of simulated annealing come at a signiﬁcant cost: because of the changing
temperature and the initial freedom of movement, many more local moves are needed until
convergence. Moreover, it is quite an art to choose a good timetable by which to decrease the
temperature, called an annealing schedule. But in many cases where the quality of solutions
improves signiﬁcantly, the tradeoff is worthwhile.

#### Exercises
9.1. In the backtracking algorithm for SAT, suppose that we always choose a subproblem (CNF
formula) that has a clause that is as small as possible; and we expand it along a variable that
appears in this small clause. Show that this is a polynomial-time algorithm in the special case
in which the input formula has only clauses with two literals (that is, it is an instance of 2SAT).
9.2. Devise a backtracking algorithm for the RUDRATA PATH problem from a ﬁxed vertex s. To fully
specify such an algorithm you must deﬁne:
(a) What is a subproblem?
(b) How to choose a subproblem.
(c) How to expand a subproblem.
Argue brieﬂy why your choices are reasonable.
9.3. Devise a branch-and-bound algorithm for the SET COVER problem. This entails deciding:
(a) What is a subproblem?
(b) How do you choose a subproblem to expand?
(c) How do you expand a subproblem?
(d) What is an appropriate lowerbound?
Do you think that your choices above will work well on typical instances of the problem? Why?
9.4. Given an undirected graph G = (V, E) in which each node has degree ≤ d, show how to efﬁciently
ﬁnd an independent set whose size is at least 1/(d + 1) times that of the largest independent set.
9.5. Local search for minimum spanning trees. Consider the set of all spanning trees (not just mini-
mum ones) of a weighted, connected, undirected graph G = (V, E).

Recall from Section 5.1 that adding an edge e to a spanning tree T creates an unique cycle, and
subsequently removing any other edge e′ ̸= e from this cycle gives back a different spanning tree
T ′. We will say that T and T ′ differ by a single edge swap (e, e′) and that they are neighbors.
(a) Show that it is possible to move from any spanning tree T to any other spanning tree T ′ by
performing a series of edge-swaps, that is, by moving from neighbor to neighbor. At most
how many edge-swaps are needed?
(b) Show that if T ′ is an MST, then it is possible to choose these swaps so that the costs of
the spanning trees encountered along the way are nonincreasing. In other words, if the
sequence of spanning trees encountered is
T = T0 → T1 → T2 → · · · → Tk = T ′,
then cost(Ti+1) ≤ cost(Ti) for all i < k.
(c) Consider the following local search algorithm which is given as input an undirected graph
G.
Let T be any spanning tree of G
while there is an edge-swap (e, e′) which reduces cost(T ):
T ← T + e − e′
return T
Show that this procedure always returns a minimum spanning tree. At most how many
iterations does it take?
9.6. In the MINIMUM STEINER TREE problem, the input consists of: a complete graph G = (V, E)
with distances duv between all pairs of nodes; and a distinguished set of terminal nodes V ′ ⊆ V .
The goal is to ﬁnd a minimum-cost tree that includes the vertices V ′. This tree may or may not
include nodes in V − V ′.
Suppose the distances in the input are a metric (recall the deﬁnition on page 292). Show that
an efﬁcient ratio-2 approximation algorithm for MINIMUM STEINER TREE can be obtained by
ignoring the nonterminal nodes and simply returning the minimum spanning tree on V ′. (Hint:
Recall our approximation algorithm for the TSP.)
9.7. In the MULTIWAY CUT problem, the input is an undirected graph G = (V, E) and a set of terminal
nodes s1, s2, . . . , sk ∈ V . The goal is to ﬁnd the minimum set of edges in E whose removal leaves
all terminals in different components.
(a) Show that this problem can be solved exactly in polynomial time when k = 2.
(b) Give an approximation algorithm with ratio at most 2 for the case k = 3.
(c) Design a local search algorithm for multiway cut.


9.8. In the MAX SAT problem, we are given a set of clauses, and we want to ﬁnd an assignment that
satisﬁes as many of them as possible.
(a) Show that if this problem can be solved in polynomial time, then so can SAT.
(b) Here’s a very naive algorithm.
for each variable:
set its value to either 0 or 1 by flipping a coin
Suppose the input has m clauses, of which the jth has k_j literals. Show that the expected
number of clauses satisﬁed by this simple algorithm is
m-j=1
2*k_j ≥ m^2.
In other words, this is a 2-approximation in expectation! And if the clauses all contain k
literals, then this approximation factor improves to 1 + 1/(2k − 1).
(c) Can you make this algorithm deterministic? (Hint:
Instead of ﬂipping a coin for each
variable, select the value that satisﬁes the most of the as of yet unsatisﬁed clauses. What
fraction of the clauses is satisﬁed in the end?)
9.9. In the MAXIMUM CUT problem we are given an undirected graph G = (V, E) with a weight w(e)
on each edge, and we wish to separate the vertices into two sets S and V − S so that the total
weight of the edges between the two sets is as large as possible.
For each S ⊆ V deﬁne w(S) to be the sum of all w(e) over all edges {u, v} such that |S∩{u, v}| = 1.
Obviously, MAX CUT is about maximizing w(S) over all subsets of V .
Consider the following local search algorithm for MAX CUT:
start with any S ⊆ V
while there is a subset S′ ⊆ V
such that
||S′| − |S|| = 1 and w(S′) > w(S) do:
set S = S′
(a) Show that this is an approximation algorithm for MAX CUT with ratio 2.
(b) But is it a polynomial-time algorithm?
9.10. Let us call a local search algorithm exact when it always produces the optimum solution. For
example, the local search algorithm for the minimum spanning tree problem introduced in Prob-
lem 9.5 is exact. For another example, simplex can be considered an exact local search algorithm
for linear programming.
(a) Show that the 2-change local search algorithm for the TSP is not exact.
(b) Repeat for the ⌈ n
2 ⌉-change local search algorithm, where n is the number of cities.
(c) Show that the (n − 1)-change local search algorithm is exact.
(d) If A is an optimization problem, deﬁne A-IMPROVEMENT to be the following search problem:
Given an instance x of A and a solution s of A, ﬁnd another solution of x with better cost (or
report that none exists, and thus s is optimum). For example, in TSP IMPROVEMENT we are
given a distance matrix and a tour, and we are asked to ﬁnd a better tour. It turns out that
TSP IMPROVEMENT is NP-complete, and so is SET COVER IMPROVEMENT. (Can you prove
this?)
(e) We say that a local search algorithm has polynomial iteration if each execution of the loop
requires polynomial time. For example, the obvious implementations of the (n − 1)-change
local search algorithm for the TSP deﬁned above do not have polynomial iteration. Show
that, unless P = NP, there is no exact local search algorithm with polynomial iteration for
the TSP and SET COVER problems.

