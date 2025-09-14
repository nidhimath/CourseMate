# Chapter 2 Study Notes
## Divide-and-conquer algorithms

The divide-and-conquer strategy solves a problem by:
1. Breaking it into subproblems that are themselves smaller instances of the same type of problem
2. Recursively solving these subproblems  
3. Appropriately combining their answers

The real work is done piecemeal, in three different places: in the partitioning of problems into subproblems; at the very tail end of the recursion, when the subproblems are so small that they are solved outright; and in the gluing together of partial answers. These are held together and coordinated by the algorithm's core recursive structure.

As an introductory example, we'll see how this technique yields a new algorithm for multiplying numbers, one that is much more efficient than the method we all learned in elementary school!

## 2.1 Multiplication

The mathematician Carl Friedrich Gauss (1777–1855) once noticed that although the product of two complex numbers

(a + bi)(c + di) = ac - bd + (bc + ad)i

seems to involve four real-number multiplications, it can in fact be done with just three: ac, bd, and (a + b)(c + d), since

bc + ad = (a + b)(c + d) - ac - bd.

In our big-O way of thinking, reducing the number of multiplications from four to three seems wasted ingenuity. But this modest improvement becomes very significant when applied recursively.

Let's move away from complex numbers and see how this helps with regular multiplication. Suppose x and y are two n-bit integers, and assume for convenience that n is a power of 2 (the more general case is hardly any different). As a first step toward multiplying x and y, split each of them into their left and right halves, which are n/2 bits long:

x = 2^(n/2)x_L + x_R
y = 2^(n/2)y_L + y_R

For instance, if x = 10110110₂ (the subscript 2 means "binary") then x_L = 1011₂, x_R = 0110₂, and x = 1011₂ × 2⁴ + 0110₂. The product of x and y can then be rewritten as

xy = (2^(n/2)x_L + x_R)(2^(n/2)y_L + y_R) = 2^n x_Ly_L + 2^(n/2)(x_Ly_R + x_Ry_L) + x_Ry_R.

We will compute xy via the expression on the right. The additions take linear time, as do the multiplications by powers of 2 (which are merely left-shifts). The significant operations are the four n/2-bit multiplications, x_Ly_L, x_Ly_R, x_Ry_L, x_Ry_R; these we can handle by four recursive calls. Thus our method for multiplying n-bit numbers starts by making recursive calls to multiply these four pairs of n/2-bit numbers (four subproblems of half the size), and then evaluates the preceding expression in O(n) time. Writing T(n) for the overall running time on n-bit inputs, we get the recurrence relation

T(n) = 4T(n/2) + O(n).

We will soon see general strategies for solving such equations. In the meantime, this particular one works out to O(n²), the same running time as the traditional grade-school multiplication technique. So we have a radically new algorithm, but we haven't yet made any progress in efficiency. How can our method be sped up?

This is where Gauss's trick comes to mind. Although the expression for xy seems to demand four n/2-bit multiplications, as before just three will do: x_Ly_L, x_Ry_R, and (x_L+x_R)(y_L+y_R), since x_Ly_R+x_Ry_L = (x_L+x_R)(y_L+y_R)−x_Ly_L−x_Ry_R. The resulting algorithm, shown in Figure 2.1, has an improved running time of

T(n) = 3T(n/2) + O(n).

The point is that now the constant factor improvement, from 4 to 3, occurs at every level of the recursion, and this compounding effect leads to a dramatically lower time bound of O(n^1.59).

This running time can be derived by looking at the algorithm's pattern of recursive calls, which form a tree structure, as in Figure 2.2. Let's try to understand the shape of this tree. At each successive level of recursion the subproblems get halved in size. At the (log₂ n)th level, the subproblems get down to size 1, and so the recursion ends. Therefore, the height of the tree is log₂ n. The branching factor is 3—each problem recursively produces three smaller ones—with the result that at depth k in the tree there are 3^k subproblems, each of size n/2^k.

For each subproblem, a linear amount of work is done in identifying further subproblems and combining their answers. Therefore the total time spent at depth k in the tree is

3^k × O(n/2^k) = (3/2)^k × O(n).

At the very top level, when k = 0, this works out to O(n). At the bottom, when k = log₂ n, it is O(3^(log₂ n)), which can be rewritten as O(n^(log₂ 3)) (do you see why?). Between these two endpoints, the work done increases geometrically from O(n) to O(n^(log₂ 3)), by a factor of 3/2 per level. The sum of any increasing geometric series is, within a constant factor, simply the last term of the series: such is the rapidity of the increase (Exercise 0.2). Therefore the overall running time is O(n^(log₂ 3)), which is about O(n^1.59).

In the absence of Gauss's trick, the recursion tree would have the same height, but the branching factor would be 4. There would be 4^(log₂ n) = n² leaves, and therefore the running time would be at least this much. In divide-and-conquer algorithms, the number of subproblems translates into the branching factor of the recursion tree; small changes in this coefficient can have a big impact on running time.

A practical note: it generally does not make sense to recurse all the way down to 1 bit. For most processors, 16- or 32-bit multiplication is a single operation, so by the time the numbers get into this range they should be handed over to the built-in procedure.

Finally, the eternal question: Can we do better? It turns out that even faster algorithms for multiplying numbers exist, based on another important divide-and-conquer algorithm: the fast Fourier transform, to be explained in Section 2.6.

## 2.2 Recurrence relations

Divide-and-conquer algorithms often follow a generic pattern: they tackle a problem of size n by recursively solving, say, a subproblems of size n/b and then combining these answers in O(n^d) time, for some a, b, d > 0 (in the multiplication algorithm, a = 3, b = 2, and d = 1). Their running time can therefore be captured by the equation T(n) = aT(⌈n/b⌉) + O(n^d). We next derive a closed-form solution to this general recurrence so that we no longer have to solve it explicitly in each new instance.

**Master theorem:** If T(n) = aT(⌈n/b⌉) + O(n^d) for some constants a > 0, b > 1, and d ≥ 0, then

T(n) = 
- O(n^d) if d > log_b a
- O(n^d log n) if d = log_b a  
- O(n^(log_b a)) if d < log_b a

This single theorem tells us the running times of most of the divide-and-conquer procedures we are likely to use.

**Proof.** To prove the claim, let's start by assuming for the sake of convenience that n is a power of b. This will not influence the final bound in any important way—after all, n is at most a multiplicative factor of b away from some power of b (Exercise 2.2)—and it will allow us to ignore the rounding effect in ⌈n/b⌉.

Next, notice that the size of the subproblems decreases by a factor of b with each level of recursion, and therefore reaches the base case after log_b n levels. This is the height of the recursion tree. Its branching factor is a, so the kth level of the tree is made up of a^k subproblems, each of size n/b^k (Figure 2.3). The total work done at this level is

a^k × O((n/b^k)^d) = O(n^d) × (a/b^d)^k.

As k goes from 0 (the root) to log_b n (the leaves), these numbers form a geometric series with ratio a/b^d. Finding the sum of such a series in big-O notation is easy (Exercise 0.2), and comes down to three cases.

1. The ratio is less than 1.
   Then the series is decreasing, and its sum is just given by its first term, O(n^d).

2. The ratio is greater than 1.
   The series is increasing and its sum is given by its last term, O(n^(log_b a)):
   n^d(a/b^d)^(log_b n) = n^d(a^(log_b n)/(b^(log_b n))^d) = a^(log_b n) = a^((log_a n)(log_b a)) = n^(log_b a).

3. The ratio is exactly 1.
   In this case all O(log n) terms of the series are equal to O(n^d).

These cases translate directly into the three contingencies in the theorem statement.

### Binary search

The ultimate divide-and-conquer algorithm is, of course, binary search: to find a key k in a large file containing keys z[0, 1, . . . , n − 1] in sorted order, we first compare k with z[n/2], and depending on the result we recurse either on the first half of the file, z[0, . . . , n/2 − 1], or on the second half, z[n/2, . . . , n − 1]. The recurrence now is T(n) = T(⌈n/2⌉) + O(1), which is the case a = 1, b = 2, d = 0. Plugging into our master theorem we get the familiar solution: a running time of just O(log n).

## 2.3 Mergesort

The problem of sorting a list of numbers lends itself immediately to a divide-and-conquer strategy: split the list into two halves, recursively sort each half, and then merge the two sorted sublists.

```
function mergesort(a[1 . . . n])
Input: An array of numbers a[1 . . . n]
Output: A sorted version of this array

if n > 1:
    return merge(mergesort(a[1 . . .⌊n/2⌋]), mergesort(a[⌊n/2⌋+ 1 . . . n]))
else:
    return a
```

The correctness of this algorithm is self-evident, as long as a correct merge subroutine is specified. If we are given two sorted arrays x[1 . . . k] and y[1 . . . l], how do we efficiently merge them into a single sorted array z[1 . . . k + l]? Well, the very first element of z is either x[1] or y[1], whichever is smaller. The rest of z[·] can then be constructed recursively.

```
function merge(x[1 . . . k], y[1 . . . l])
if k = 0: return y[1 . . . l]
if l = 0: return x[1 . . . k]
if x[1] ≤ y[1]:
    return x[1] ◦ merge(x[2 . . . k], y[1 . . . l])
else:
    return y[1] ◦ merge(x[1 . . . k], y[2 . . . l])
```

Here ◦ denotes concatenation. This merge procedure does a constant amount of work per recursive call (provided the required array space is allocated in advance), for a total running time of O(k + l). Thus merge's are linear, and the overall time taken by mergesort is

T(n) = 2T(n/2) + O(n),

or O(n log n).

Looking back at the mergesort algorithm, we see that all the real work is done in merging, which doesn't start until the recursion gets down to singleton arrays. The singletons are merged in pairs, to yield arrays with two elements. Then pairs of these 2-tuples are merged, producing 4-tuples, and so on. Figure 2.4 shows an example.

This viewpoint also suggests how mergesort might be made iterative. At any given moment, there is a set of "active" arrays—initially, the singletons—which are merged in pairs to give the next batch of active arrays. These arrays can be organized in a queue, and processed by repeatedly removing two arrays from the front of the queue, merging them, and putting the result at the end of the queue.

In the following pseudocode, the primitive operation inject adds an element to the end of the queue while eject removes and returns the element at the front of the queue.

```
function iterative-mergesort(a[1 . . . n])
Input: elements a₁, a₂, . . . , aₙ to be sorted

Q = [ ] (empty queue)
for i = 1 to n:
    inject(Q, [aᵢ])
while |Q| > 1:
    inject(Q, merge(eject(Q), eject(Q)))
return eject(Q)
```

### An n log n lower bound for sorting

Sorting algorithms can be depicted as trees. The one in the following figure sorts an array of three elements, a₁, a₂, a₃. It starts by comparing a₁ to a₂ and, if the first is larger, compares it with a₃; otherwise it compares a₂ and a₃. And so on. Eventually we end up at a leaf, and this leaf is labeled with the true order of the three elements as a permutation of 1, 2, 3. For example, if a₂ < a₁ < a₃, we get the leaf labeled "2 1 3."

The depth of the tree—the number of comparisons on the longest path from root to leaf, in this case 3—is exactly the worst-case time complexity of the algorithm.

This way of looking at sorting algorithms is useful because it allows one to argue that mergesort is optimal, in the sense that Ω(n log n) comparisons are necessary for sorting n elements.

Here is the argument: Consider any such tree that sorts an array of n elements. Each of its leaves is labeled by a permutation of {1, 2, . . . , n}. In fact, every permutation must appear as the label of a leaf. The reason is simple: if a particular permutation is missing, what happens if we feed the algorithm an input ordered according to this same permutation? And since there are n! permutations of n elements, it follows that the tree has at least n! leaves.

We are almost done: This is a binary tree, and we argued that it has at least n! leaves. Recall now that a binary tree of depth d has at most 2^d leaves (proof: an easy induction on d). So, the depth of our tree—and the complexity of our algorithm—must be at least log(n!). And it is well known that log(n!) ≥ c · n log n for some c > 0. There are many ways to see this. The easiest is to notice that n! ≥ (n/2)^(n/2) because n! = 1 · 2 · ·