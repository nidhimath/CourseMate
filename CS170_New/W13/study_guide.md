# Chapter 9 Study Notes
Coping with NP-completeness
You are the junior member of a seasoned project team. Your current task is to write code for
solving a simple-looking problem involving graphs and numbers. What are you supposed to
do?
If you are very lucky, your problem will be among the half-dozen problems concerning
graphs with weights (shortest path, minimum spanning tree, maximum ﬂow, etc.), that we
have solved in this book. Even if this is the case, recognizing such a problem in its natural
habitat—grungy and obscured by reality and context—requires practice and skill. It is more
likely that you will need to reduce your problem to one of these lucky ones—or to solve it using
dynamic programming or linear programming.
But chances are that nothing like this will happen. The world of search problems is a bleak
landscape. There are a few spots of light—brilliant algorithmic ideas—each illuminating a
small area around it (the problems that reduce to it; two of these areas, linear and dynamic
programming, are in fact decently large). But the remaining vast expanse is pitch dark: NP-
complete. What are you to do?
You can start by proving that your problem is actually NP-complete. Often a proof by
generalization (recall the discussion on page 270 and Exercise 8.10) is all that you need; and
sometimes a simple reduction from 3SAT or ZOE is not too difﬁcult to ﬁnd. This sounds like a
theoretical exercise, but, if carried out successfully, it does bring some tangible rewards: now
your status in the team has been elevated, you are no longer the kid who can’t do, and you
have become the noble knight with the impossible quest.
But, unfortunately, a problem does not go away when proved NP-complete. The real ques-
tion is, What do you do next?
This is the subject of the present chapter and also the inspiration for some of the most
important modern research on algorithms and complexity. NP-completeness is not a death
certiﬁcate—it is only the beginning of a fascinating adventure.
Your problem’s NP-completeness proof probably constructs graphs that are complicated
and weird, very much unlike those that come up in your application.
For example, even
though SAT is NP-complete, satisfying assignments for HORN SAT (the instances of SAT that
come up in logic programming) can be found efﬁciently (recall Section 5.3). Or, suppose the
graphs that arise in your application are trees. In this case, many NP-complete problems,
283

284
Algorithms
such as INDEPENDENT SET, can be solved in linear time by dynamic programming (recall
Section 6.7).
Unfortunately, this approach does not always work. For example, we know that 3SAT
is NP-complete. And the INDEPENDENT SET problem, along with many other NP-complete
problems, remains so even for planar graphs (graphs that can be drawn in the plane without
crossing edges). Moreover, often you cannot neatly characterize the instances that come up
in your application. Instead, you will have to rely on some form of intelligent exponential
search—procedures such as backtracking and branch and bound which are exponential time
in the worst-case, but, with the right design, could be very efﬁcient on typical instances that
come up in your application. We discuss these methods in Section 9.1.
Or you can develop an algorithm for your NP-complete optimization problem that falls
short of the optimum but never by too much. For example, in Section 5.4 we saw that the
greedy algorithm always produces a set cover that is no more than log n times the optimal
set cover. An algorithm that achieves such a guarantee is called an approximation algorithm.
As we will see in Section 9.2, such algorithms are known for many NP-complete optimization
problems, and they are some of the most clever and sophisticated algorithms around. And the
theory of NP-completeness can again be used as a guide in this endeavor, by showing that, for
some problems, there are even severe limits to how well they can be approximated—unless of
course P = NP.
Finally, there are heuristics, algorithms with no guarantees on either the running time or
the degree of approximation. Heuristics rely on ingenuity, intuition, a good understanding
of the application, meticulous experimentation, and often insights from physics or biology, to
attack a problem. We see some common kinds in Section 9.3.
## Divide-and-Conquer Intelligent exhaustive search
### Divide-and-Conquer.1 Backtracking
Backtracking is based on the observation that it is often possible to reject a solution by looking
at just a small portion of it. For example, if an instance of SAT contains the clause (x1 ∨ x2),
then all assignments with x1 = x2 = 0 (i.e., false) can be instantly eliminated. To put
it differently, by quickly checking and discrediting this partial assignment, we are able to
prune a quarter of the entire search space. A promising direction, but can it be systematically
exploited?
Here’s how it is done. Consider the Boolean formula φ(w, x, y, z) speciﬁed by the set of
clauses
(w ∨ x ∨ y ∨ z), (w ∨ x), (x ∨ y), (y ∨ z), (z ∨ w), (w ∨ z).
We will incrementally grow a tree of partial solutions. We start by branching on any one
variable, say w:

S. Dasgupta, C.H. Papadimitriou, and U.V. Vazirani
285
Initial formula φ
w = 1
w = 0
Plugging w = 0 and w = 1 into φ, we ﬁnd that no clause is immediately violated and
thus neither of these two partial assignments can be eliminated outright. So we need to keep
branching. We can expand either of the two available nodes, and on any variable of our choice.
Let’s try this one:
Initial formula φ
w = 1
w = 0
x = 0
x = 1
This time, we are in luck. The partial assignment w = 0, x = 1 violates the clause (w ∨ x)
and can be terminated, thereby pruning a good chunk of the search space. We backtrack out
of this cul-de-sac and continue our explorations at one of the two remaining active nodes.
In this manner, backtracking explores the space of assignments, growing the tree only at
nodes where there is uncertainty about the outcome, and stopping if at any stage a satisfying
assignment is encountered.
In the case of Boolean satisﬁability, each node of the search tree can be described either
by a partial assignment or by the clauses that remain when those values are plugged into the
original formula. For instance, if w = 0 and x = 0 then any clause with w or x is instantly
satisﬁed and any literal w or x is not satisﬁed and can be removed. What’s left is
(y ∨ z), (y), (y ∨ z).
Likewise, w = 0 and x = 1 leaves
(), (y ∨ z),
with the “empty clause” ( ) ruling out satisﬁability. Thus the nodes of the search tree, repre-
senting partial assignments, are themselves SAT subproblems.
This alternative representation is helpful for making the two decisions that repeatedly
arise: which subproblem to expand next, and which branching variable to use. Since the ben-
eﬁt of backtracking lies in its ability to eliminate portions of the search space, and since this
happens only when an empty clause is encountered, it makes sense to choose the subproblem
that contains the smallest clause and to then branch on a variable in that clause. If this clause

286
Algorithms
Figure 9.1 Backtracking reveals that φ is not satisﬁable.
(), (y ∨ z)
(y ∨ z), (y), (y ∨ z)
(z), (z)
(x ∨ y), (y ∨ z), (z), (z)
(x ∨ y), (y), ()
(x ∨ y), ()
(w ∨ x ∨ y ∨ z), (w ∨ x), (x ∨ y), (y ∨ z), (z ∨ w), (w ∨ z)
(x ∨ y ∨ z), (x), (x ∨ y), (y ∨ z)
x = 1
()
z = 0
z = 1
()
()
y = 1
z = 1
z = 0
y = 0
w = 1
w = 0
x = 0
happens to be a singleton, then at least one of the resulting branches will be terminated. (If
there is a tie in choosing subproblems, one reasonable policy is to pick the one lowest in the
tree, in the hope that it is close to a satisfying assignment.) See Figure 9.1 for the conclusion
of our earlier example.
More abstractly, a backtracking algorithm requires a test that looks at a subproblem and
quickly declares one of three outcomes:
1. Failure: the subproblem has no solution.
2. Success: a solution to the subproblem is found.
3. Uncertainty.
In the case of SAT, this test declares failure if there is an empty clause, success if there are
no clauses, and uncertainty otherwise. The backtracking procedure then has the following
format.
Start with some problem P0
Let S = {P0}, the set of active subproblems
Repeat while S is nonempty:
choose a subproblem P ∈ S and remove it from S
expand it into smaller subproblems P1, P2, . . . , Pk
For each Pi:
If test(Pi) succeeds:
halt and announce this solution
If test(Pi) fails:
discard Pi

S. Dasgupta, C.H. Papadimitriou, and U.V. Vazirani
287
Otherwise:
add Pi to S
Announce that there is no solution
For SAT, the choose procedure picks a clause, and expand picks a variable within that clause.
We have already discussed some reasonable ways of making such choices.
With the right test, expand, and choose routines, backtracking can be remarkably effec-
tive in practice. The backtracking algorithm we showed for SAT is the basis of many successful
satisﬁability programs. Another sign of quality is this: if presented with a 2SAT instance, it
will always ﬁnd a satisfying assignment, if one exists, in polynomial time (Exercise 9.1)!
### Divide-and-Conquer.2 Branch-and-bound
The same principle can be generalized from search problems such as SAT to optimization
problems. For concreteness, let’s say we have a minimization problem; maximization will
follow the same pattern.
As before, we will deal with partial solutions, each of which represents a subproblem,
namely, what is the (cost of the) best way to complete this solution? And as before, we need
a basis for eliminating partial solutions, since there is no other source of efﬁciency in our
method. To reject a subproblem, we must be certain that its cost exceeds that of some other
solution we have already encountered. But its exact cost is unknown to us and is generally
not efﬁciently computable. So instead we use a quick lower bound on this cost.
Start with some problem P0
Let S = {P0}, the set of active subproblems
bestsofar = ∞
Repeat while S is nonempty:
choose a subproblem (partial solution) P ∈ S and remove it from S
expand it into smaller subproblems P1, P2, . . . , Pk
For each Pi:
If Pi is a complete solution:
update bestsofar
else if lowerbound(Pi) < bestsofar:
add Pi to S
return bestsofar
Let’s see how this works for the traveling salesman problem on a graph G = (V, E) with
edge lengths de > 0. A partial solution is a simple path a ⇝ b passing through some vertices
S ⊆ V , where S includes the endpoints a and b. We can denote such a partial solution by the
tuple [a, S, b]—in fact, a will be ﬁxed throughout the algorithm. The corresponding subproblem
is to ﬁnd the best completion of the tour, that is, the cheapest complementary path b ⇝ a with
intermediate nodes V −S. Notice that the initial problem is of the form [a, {a}, a] for any a ∈ V
of our choosing.
At each step of the branch-and-bound algorithm, we extend a particular partial solution
[a, S, b] by a single edge (b, x), where x ∈ V − S. There can be up to |V − S| ways to do this, and
each of these branches leads to a subproblem of the form [a, S ∪ {x}, x].

288
Algorithms
How can we lower-bound the cost of completing a partial tour [a, S, b]? Many sophisticated
methods have been developed for this, but let’s look at a rather simple one. The remainder of
the tour consists of a path through V − S, plus edges from a and b to V − S. Therefore, its cost
is at least the sum of the following:
1. The lightest edge from a to V − S.
2. The lightest edge from b to V − S.
3. The minimum spanning tree of V − S.
(Do you see why?) And this lower bound can be computed quickly by a minimum spanning
tree algorithm. Figure 9.2 runs through an example: each node of the tree represents a partial
tour (speciﬁcally, the path from the root to that node) that at some stage is considered by the
branch-and-bound procedure. Notice how just 28 partial solutions are considered, instead of
the 7! = 5,040 that would arise in a brute-force search.

S. Dasgupta, C.H. Papadimitriou, and U.V. Vazirani
289
Figure 9.2 (a) A graph and its optimal traveling salesman tour. (b) The branch-and-bound
search tree, explored left to right. Boxed numbers indicate lower bounds on cost.
(a)
A
B
C
D
E
F
G
H
1
2
1
1
1
2
1
2
5
1
1
1
A
B
C
D
E
F
G
H
1
1
1
1
1
1
1
1
(b)
A
E
H
F
G
B
F
G
D
15
14
8
B
D
C
D
H
G
H
8
E
C
G
inf
8
10
13
12
8
8
14
8
8
8
8
10
C
10
G
E
F
G
H
D
11
11
11
11
inf
H
G
14
14
10
10
Cost: 11
Cost: 8

290
Algorithms
## Dynamic Programming Approximation algorithms
In an optimization problem we are given an instance I and are asked to ﬁnd the optimum
solution—the one with the maximum gain if we have a maximization problem like INDEPEN-
DENT SET, or the minimum cost if we are dealing with a minimization problem such as the
TSP. For every instance I, let us denote by OPT(I) the value (beneﬁt or cost) of the optimum
solution. It makes the math a little simpler (and is not too far from the truth) to assume that
OPT(I) is always a positive integer.
We have already seen an example of a (famous) approximation algorithm in Section 5.4:
the greedy scheme for SET COVER. For any instance I of size n, we showed that this greedy
algorithm is guaranteed to quickly ﬁnd a set cover of cardinality at most OPT(I) log n. This
log n factor is known as the approximation guarantee of the algorithm.
More generally, consider any minimization problem. Suppose now that we have an algo-
rithm A for our problem which, given an instance I, returns a solution with value A(I). The
approximation ratio of algorithm A is deﬁned to be
αA = max
I
A(I)
OPT(I).
In other words, αA measures by the factor by which the output of algorithm A exceeds the
optimal solution, on the worst-case input. The approximation ratio can also be deﬁned for
maximization problems, such as INDEPENDENT SET, in the same way—except that to get a
number larger than 1 we take the reciprocal.
So, when faced with an NP-complete optimization problem, a reasonable goal is to look for
an approximation algorithm A whose αA is as small as possible. But this kind of guarantee
might seem a little puzzling: How can we come close to the optimum if we cannot determine
the optimum? Let’s look at a simple example.
### Dynamic Programming.1 Vertex cover
We already know the VERTEX COVER problem is NP-hard.
VERTEX COVER
Input: An undirected graph G = (V, E).
Output: A subset of the vertices S ⊆ V that touches every edge.
Goal: Minimize |S|.
See Figure 9.3 for an example.
Since VERTEX COVER is a special case of SET COVER, we know from # Chapter 5 Study Notes that it can
be approximated within a factor of O(log n) by the greedy algorithm: repeatedly delete the
vertex of highest degree and include it in the vertex cover. And there are graphs on which the
greedy algorithm returns a vertex cover that is indeed log n times the optimum.
A better approximation algorithm for VERTEX COVER is based on the notion of a matching,
a subset of edges that have no vertices in common (Figure 9.4). A matching is maximal if no

S. Dasgupta, C.H. Papadimitriou, and U.V. Vazirani
291
Figure 9.3 A graph whose optimal vertex cover, shown shaded, is of size 8.
Figure 9.4 (a) A matching, (b) its completion to a maximal matching, and (c) the resulting
vertex cover.
(a)
(b)
(c)
more edges can be added to it. Maximal matchings will help us ﬁnd good vertex covers, and
moreover, they are easy to generate: repeatedly pick edges that are disjoint from the ones
chosen already, until this is no longer possible.
What is the relationship between matchings and vertex covers? Here is the crucial fact:
any vertex cover of a graph G must be at least as large as the number of edges in any matching
in G; that is, any matching provides a lower bound on OPT. This is simply because each edge
of the matching must be covered by one of its endpoints in any vertex cover! Finding such a
lower bound is a key step in designing an approximation algorithm, because we must compare
the quality of the solution found by our algorithm to OPT, which is NP-complete to compute.
One more observation completes the design of our approximation algorithm: let S be a
set that contains both endpoints of each edge in a maximal matching M. Then S must be a
vertex cover—if it isn’t, that is, if it doesn’t touch some edge e ∈ E, then M could not possibly
be maximal since we could still add e to it. But our cover S has 2|M| vertices. And from the
previous paragraph we know that any vertex cover must have size at least |M|. So we’re done.
Here’s the algorithm for VERTEX COVER.
Find a maximal matching M ⊆ E

292
Algorithms
Return S = {all endpoints of edges in M}
This simple procedure always returns a vertex cover whose size is at most twice optimal!
In summary, even though we have no way of ﬁnding the best vertex cover, we can easily
ﬁnd another structure, a maximal matching, with two key properties:
1. Its size gives us a lower bound on the optimal vertex cover.
2. It can be used to build a vertex cover, whose size can be related to that of the optimal
cover using property 1.
Thus, this simple algorithm has an approximation ratio of αA ≤ 2. In fact, it is not hard to
ﬁnd examples on which it does make a 100% error; hence αA = 2.
### Dynamic Programming.2 Clustering
We turn next to a clustering problem, in which we have some data (text documents, say, or
images, or speech samples) that we want to divide into groups. It is often useful to deﬁne “dis-
tances” between these data points, numbers that capture how close or far they are from one
another. Often the data are true points in some high-dimensional space and the distances are
the usual Euclidean distance; in other cases, the distances are the result of some “similarity
tests” to which we have subjected the data points. Assume that we have such distances and
that they satisfy the usual metric properties:
1. d(x, y) ≥ 0 for all x, y.
2. d(x, y) = 0 if and only if x = y.
3. d(x, y) = d(y, x).
4. (Triangle inequality) d(x, y) ≤ d(x, z) + d(z, y).
We would like to partition the data points into groups that are compact in the sense of having
small diameter.
k-CLUSTER
Input: Points X = {x1, . . . , xn} with underlying distance metric d(·, ·); integer k.
Output: A partition of the points into k clusters C1, . . . , Ck.
Goal: Minimize the diameter of the clusters,
max
j
max
xa,xb∈Cj d(xa, xb).
One way to visualize this task is to imagine n points in space, which are to be covered by k
spheres of equal size. What is the smallest possible diameter of the spheres? Figure 9.5 shows
an example.
This problem is NP-hard, but has a very simple approximation algorithm. The idea is to
pick k of the data points as cluster centers and to then assign each of the remaining points to

S. Dasgupta, C.H. Papadimitriou, and U.V. Vazirani
293
Figure 9.5 Some data points and the optimal k = 4 clusters.
Figure 9.6 (a) Four centers chosen by farthest-ﬁrst traversal. (b) The resulting clusters.
(a)
2
1
4
3
(b)
the center closest to it, thus creating k clusters. The centers are picked one at a time, using
an intuitive rule: always pick the next center to be as far as possible from the centers chosen
so far (see Figure 9.6).
Pick any point µ1 ∈ X as the first cluster center
for i = 2 to k:
Let µi be the point in X that is farthest from µ1, . . . , µi−1
(i.e., that maximizes minj<i d(·, µj))
Create k clusters:
Ci = {all x ∈ X whose closest center is µi}
It’s clear that this algorithm returns a valid partition. What’s more, the resulting diameter is
guaranteed to be at most twice optimal.
Here’s the argument. Let x ∈ X be the point farthest from µ1, . . . , µk (in other words the
next center we would have chosen, if we wanted k + 1 of them), and let r be its distance to its
closest center. Then every point in X must be within distance r of its cluster center. By the
triangle inequality, this means that every cluster has diameter at most 2r.
But how does r relate to the diameter of the optimal clustering? Well, we have identiﬁed
k + 1 points {µ1, µ2, . . . , µk, x} that are all at a distance at least r from each other (why?). Any
partition into k clusters must put two of these points in the same cluster and must therefore

294
Algorithms
have diameter at least r.
This algorithm has a certain high-level similarity to our scheme for VERTEX COVER. In-
stead of a maximal matching, we use a different easily computable structure—a set of k points
that cover all of X within some radius r, while at the same time being mutually separated
by a distance of at least r. This structure is used both to generate a clustering and to give a
lower bound on the optimal clustering.
We know of no better approximation algorithm for this problem.
### Dynamic Programming.3 TSP
The triangle inequality played a crucial role in making the k-CLUSTER problem approximable.
It also helps with the TRAVELING SALESMAN PROBLEM: if the distances between cities satisfy
the metric properties, then there is an algorithm that outputs a tour of length at most 1.5
times optimal. We’ll now look at a slightly weaker result that achieves a factor of 2.
Continuing with the thought processes of our previous two approximation algorithms, we
can ask whether there is some structure that is easy to compute and that is plausibly related
to the best traveling salesman tour (as well as providing a good lower bound on OPT). A little
thought and experimentation reveals the answer to be the minimum spanning tree.
Let’s understand this relation. Removing any edge from a traveling salesman tour leaves
a path through all the vertices, which is a spanning tree. Therefore,
TSP cost ≥ cost of this path ≥ MST cost.
Now, we somehow need to use the MST to build a traveling salesman tour. If we can use each
edge twice, then by following the shape of the MST we end up with a tour that visits all the
cities, some of them more than once. Here’s an example, with the MST on the left and the
resulting tour on the right (the numbers show the order in which the edges are taken).
Tulsa
Albuquerque
Amarillo
Wichita
Little
Rock
Dallas
Houston
San Antonio
El Paso
Tulsa
Wichita
Little
Rock
Dallas
Houston
El Paso
Amarillo
San Antonio
Albuquerque
5
2
1
10
9
11
8
7
12
6
4
13
14
3
15
16
Therefore, this tour has a length at most twice the MST cost, which as we’ve already seen is
at most twice the TSP cost.
This is the result we wanted, but we aren’t quite done because our tour visits some cities
multiple times and is therefore not legal. To ﬁx the problem, the tour should simply skip any
city it is about to revisit, and instead move directly to the next new city in its list:

S. Dasgupta, C.H. Papadimitriou, and U.V. Vazirani
295
Tulsa
Wichita
Little
Rock
Dallas
Houston
San Antonio
El Paso
Albuquerque
Amarillo
By the triangle inequality, these bypasses can only make the overall tour shorter.
General TSP
But what if we are interested in instances of TSP that do not satisfy the triangle inequality?
It turns out that this is a much harder problem to approximate.
Here is why: Recall that on page 274 we gave a polynomial-time reduction which given
any graph G and integer any C > 0 produces an instance I(G, C) of the TSP such that:
(i) If G has a Rudrata path, then OPT(I(G, C)) = n, the number of vertices in G.
(ii) If G has no Rudrata path, then OPT(I(G, C)) ≥ n + C.
This means that even an approximate solution to TSP would enable us to solve RUDRATA
PATH! Let’s work out the details.
Consider an approximation algorithm A for TSP and let αA denote its approximation ratio.
From any instance G of RUDRATA PATH, we will create an instance I(G, C) of TSP using the
speciﬁc constant C = nαA. What happens when algorithm A is run on this TSP instance? In
case (i), it must output a tour of length at most αAOPT(I(G, C)) = nαA, whereas in case (ii) it
must output a tour of length at least OPT(I(G, C)) > nαA. Thus we can ﬁgure out whether G
has a Rudrata path! Here is the resulting procedure:
Given any graph G:
compute I(G, C) (with C = n · αA) and run algorithm A on it
if the resulting tour has length ≤ nαA:
conclude that G has a Rudrata path
else:
conclude that G has no Rudrata path
This tells us whether or not G has a Rudrata path; by calling the procedure a polynomial
number of times, we can ﬁnd the actual path (Exercise 8.2).
We’ve shown that if TSP has a polynomial-time approximation algorithm, then there is
a polynomial algorithm for the NP-complete RUDRATA PATH problem. So, unless P = NP,
there cannot exist an efﬁcient approximation algorithm for the TSP.

296
Algorithms
### Dynamic Programming.4 Knapsack
Our last approximation algorithm is for a maximization problem and has a very impressive
guarantee: given any ϵ > 0, it will return a solution of value at least (1 − ϵ) times the optimal
value, in time that scales only polynomially in the input size and in 1/ϵ.
The problem is KNAPSACK, which we ﬁrst encountered in # Chapter 6 Study Notes. There are n items,
with weights w1, . . . , wn and values v1, . . . , vn (all positive integers), and the goal is to pick the
most valuable combination of items subject to the constraint that their total weight is at most
W.
Earlier we saw a dynamic programming solution to this problem with running time O(nW).
Using a similar technique, a running time of O(nV ) can also be achieved, where V is the sum
of the values. Neither of these running times is polynomial, because W and V can be very
large, exponential in the size of the input.
Let’s consider the O(nV ) algorithm. In the bad case when V is large, what if we simply
scale down all the values in some way? For instance, if
v1 = 117,586,003, v2 = 738,493,291, v3 = 238,827,453,
we could simply knock off some precision and instead use 117, 738, and 238. This doesn’t
change the problem all that much and will make the algorithm much, much faster!
Now for the details. Along with the input, the user is assumed to have speciﬁed some
approximation factor ϵ > 0.
Discard any item with weight > W
Let vmax = maxi vi
Rescale values vi = ⌊vi * n ⌋
Run the dynamic programming algorithm with values {�vi}
Output the resulting choice of items
Let’s see why this works. First of all, since the rescaled values �vi are all at most n/ϵ, the
dynamic program is efﬁcient, running in time O(n3/ϵ).

### Dynamic Programming.5 The approximability hierarchy
Given any NP-complete optimization problem, we seek the best approximation algorithm
possible. Failing this, we try to prove lower bounds on the approximation ratios that are
achievable in polynomial time (we just carried out such a proof for the general TSP). All told,
NP-complete optimization problems are classiﬁed as follows:
• Those for which, like the TSP, no ﬁnite approximation ratio is possible.
• Those for which an approximation ratio is possible, but there are limits to how small
this can be. VERTEX COVER, k-CLUSTER, and the TSP with triangle inequality belong
here. (For these problems we have not established limits to their approximability, but
these limits do exist, and their proofs constitute some of the most sophisticated results
in this ﬁeld.)
• Down below we have a more fortunate class of NP-complete problems for which ap-
proximability has no limits, and polynomial approximation algorithms with error ratios
arbitrarily close to zero exist. KNAPSACK resides here.
• Finally, there is another class of problems, between the ﬁrst two given here, for which
the approximation ratio is about log n. SET COVER is an example.
(A humbling reminder: All this is contingent upon the assumption P ̸= NP. Failing this,
this hierarchy collapses down to P, and all NP-complete optimization problems can be solved
exactly in polynomial time.)
A ﬁnal point on approximation algorithms: often these algorithms, or their variants, per-
form much better on typical instances than their worst-case approximation ratio would have
you believe.
## Greedy Algorithms Local search heuristics
Our next strategy for coping with NP-completeness is inspired by evolution (which is, after
all, the world’s best-tested optimization procedure)—by its incremental process of introducing
small mutations, trying them out, and keeping them if they work well. This paradigm is
called local search and can be applied to any optimization task. Here’s how it looks for a
minimization problem.
let s be any initial solution
while there is some solution s′ in the neighborhood of s
for which cost(s′) < cost(s):
replace s by s′
return s
On each iteration, the current solution is replaced by a better one close to it, in its neigh-
borhood. This neighborhood structure is something we impose upon the problem and is the
central design decision in local search. As an illustration, let’s revisit the traveling salesman
problem.