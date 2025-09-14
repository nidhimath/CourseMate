# Chapter 1
## The Hilbert Space of Random Variables

### 1.1 Outline

Fix a probability space and consider the set

H := {X : X is a real-valued random variable with E[X²] < ∞}.

There are natural notions of length and orthogonality for objects in H, which allow us to work with random variables geometrically, as if they were vectors in Euclidean space. Such a space is known as a Hilbert space.

Geometric reasoning leads to an insightful view of mean square error estimation as a projection onto an appropriate space.

First, we will review linear algebra and explain what it means for H to be a Hilbert space. Then, we will study projections in detail and solve the constrained optimization problem of finding the closest point on a linear space to a given point. Using the ideas of projection and orthogonality, we will derive the linear least squares estimator (LLSE). We will then extend the ideas to the non-linear case, arriving at the minimum mean square error (MMSE) estimator.

### 1.2 Vector Spaces

A (real) vector space V is a collection of objects, including a zero vector 0 ∈ V, equipped with two operations, vector addition (which allows us to add two vectors u, v ∈ V to obtain another vector u + v ∈ V) and scalar multiplication (which allows us to "scale" a vector v ∈ V by a real number c to obtain a vector cv), satisfying the following axioms: for all u, v, w ∈ V and all a, b ∈ R,

· vector addition is associative, commutative, and 0 is the identity element, that is, u + (v + w) = (u + v) + w, u + v = v + u, and u + 0 = u;

· scalar multiplication is compatible with vector operations: 1v = v, a(bv) = (ab)v, a(u + v) = au + av, and (a + b)u = au + bu.

It is not important to memorize all of the axioms; however, it is important to recognize that the axioms capture a lot of useful mathematical structures, including the space of random variables, which is why linear algebra plays a key role in many disciplines.

To gain intuition for these axioms, the most natural example of a vector space is Rⁿ, for any positive integer n. The space Rⁿ consists of n-tuples of real numbers. Vector addition and scalar multiplication are defined componentwise:

(x₁, ..., xₙ) + (y₁, ..., yₙ) = (x₁ + y₁, ..., xₙ + yₙ),
c(x₁, ..., xₙ) = (cx₁, ..., cxₙ).

Given a set S ⊆ V, the span of S is the set of vectors we can reach from vectors in S using a finite number of vector addition and scalar multiplication operations:

span S := {c₁v₁ + ··· + cₘvₘ : m ∈ N, v₁, ..., vₘ ∈ S, c₁, ..., cₘ ∈ R}.

We say that an element of span S is a linear combination of the vectors in S. Also, span S is itself a vector space. Whenever we have a subset U ⊆ V such that U is also a vector space in its own right, then we call U a subspace of V.

Notice that if any vector v ∈ S can be written as a linear combination of the other vectors in S, then we can safely remove v from S without decreasing the span of the vectors, i.e., span S = span(S \ {v}). This is because any linear combination using v can be rewritten as a linear combination using only vectors in S \ {v}. From the perspective of figuring out which vectors lie in span S, v is redundant. Thus, we say that S is linearly independent if it contains no redundant vectors, i.e., if no vector in S can be written as a linear combination of the other vectors in S.

A set S of vectors which is both linearly independent and has span S = V is called a basis of V. The significance of a basis S is that any element of V can be written as a unique linear combination of elements of S. One of the most fundamental results in linear algebra says that for any vector space V, a basis always exists, and moreover, the cardinality of any basis is the same. The size of any basis of V is called the dimension of V, denoted dim V.

Here is a fact: any finite-dimensional vector space is essentially identical to Rⁿ, which means that Rⁿ is truly a model vector space. However, in this note, we will have need for infinite-dimensional vector spaces too.

#### 1.2.1 Inner Product Spaces & Hilbert Spaces

We have promised to talk geometrically, but so far, the definition of a vector space does not have any geometry built into it. For this, we need another definition.

For a real vector space V, a map ⟨·, ·⟩: V × V → [0, ∞) satisfying, for all u, v, w ∈ V and c ∈ R,

· (symmetry) ⟨u, v⟩ = ⟨v, u⟩,
· (linearity) ⟨u + cv, w⟩ = ⟨u, w⟩ + c⟨v, w⟩, and
· (positive definiteness) ⟨u, u⟩ > 0 if u ≠ 0

is called a (real) inner product on V. Then, V along with the map ⟨·, ·⟩ is called a (real) inner product space. Note that combining symmetry and linearity gives us linearity in the second argument too, ⟨u, v + cw⟩ = ⟨u, v⟩ + c⟨u, w⟩.

The familiar inner product on Euclidean space Rⁿ is ⟨x, y⟩ := Σⁿᵢ₌₁ xᵢyᵢ, also sometimes called the dot product.

The first bit of geometry that the inner product gives us is a norm map ‖·‖: V → [0, ∞), given by

‖v‖ := √⟨v, v⟩.

By analogy to Euclidean space, we can consider the norm to be the length of a vector.

The second bit of geometry is the notion of an angle θ between vectors u and v, which we can define via the formula ⟨u, v⟩ = ‖u‖‖v‖cos θ. We are only interested in the case when cos θ = 0, which tells us when u and v are orthogonal. Precisely, we say that u and v are orthogonal if ⟨u, v⟩ = 0.

Now, it is your turn! Do the following exercise.

Exercise 1. Prove that ⟨X, Y⟩ := E[XY] makes H into a real inner product space. (Hint: You must first show that H is a real vector space, which requires H to be closed under vector addition, i.e., if X, Y ∈ H, then X + Y ∈ H. For this, use the Cauchy-Schwarz inequality, which says that for random variables X and Y, |E[XY]| ≤ √(E[X²]E[Y²]).)

To motivate the definition of the inner product given above, first consider the case when the probability space Ω is finite. Then, E[XY] = Σω∈Ω X(ω)Y(ω)P(ω), which bears resemblance to the Euclidean inner product ⟨x, y⟩ = Σⁿᵢ₌₁ xᵢyᵢ. However, E[XY] is a sum in which we weight each sample point ω ∈ Ω by its probability, which makes sense in a probabilistic context. In the case when X and Y have joint density f, then E[XY] = ∫∞₋∞ xyf(x, y)dxdy, which is again similar but with an integral replacing the summation and f(x, y)dxdy standing in as the "probability" of the point (x, y).

Finally, we are not quite at the definition of a Hilbert space yet. A (real) Hilbert space is a real inner product space which satisfies an additional analytic property called completeness, which we will not describe (for this, you will have to take a course in functional analysis).

If Ω is finite, then H is finite-dimensional. Indeed, a basis is given by the indicators {1ω}ω∈Ω. However, in general H is infinite-dimensional, and we will soon run into analytical issues which obscure the core ideas. Therefore, from this point forward, we will behave as if H were finite-dimensional, when in reality it is not.

### 1.3 Projection

Now that we know that H is a Hilbert space, we would like to apply our knowledge to the problem of estimating a random variable Y ∈ H. Clearly, if we could directly observe Y, then estimation would not be a difficult problem. However, we are often not given direct access to Y, and we are only allowed to observe some other random variable X which is correlated with Y. The problem is then to find the best estimator of Y, if we restrict ourselves to using only functions of our observation X. Even still, finding the best function of X might be computationally prohibitive, and it may be desired to only use linear functions, i.e., functions of the form a + bX for a, b ∈ R.

Notice that "linear functions of the form a + bX" can also be written as span{1, X}, a subspace of V, so we may formulate our problem more generally as the following:

Given y ∈ V and a subspace U ⊆ V, find the closest point x ∈ U to y.

The answer will turn out to be the projection of y onto the subspace U. We will explain this concept now.

Given a set S ⊆ V, we define the orthogonal complement of S, denoted S⊥:

S⊥ := {v ∈ V : ⟨u, v⟩ = 0 for all u ∈ S}.

That is, S⊥ is the set of vectors which are orthogonal to everything in S. Check for yourself that S⊥ is a subspace.

Given a subspace U ⊆ V, what does it mean to "project" y onto U? To get a feel for the idea, imagine a slanted pole in broad daylight. One might say that the shadow it casts on the ground is a "projection" of the streetlight onto the ground. From this visualization, you might also realize that there are different types of projections, depending on the location of the sun in the sky. The projection we are interested in is the shadow cast when the sun is directly overhead, because this projection minimizes the distance from the tip of the pole to the tip of the shadow; this is known as an orthogonal projection.

Formally, the orthogonal projection onto a subspace U is the map P : V → U such that Py := arg minₓ∈U ‖y - x‖. In words, given an input y, Py is the closest point in U to y. We claim that Py satisfies the following two conditions:

Py ∈ U    and    y - Py ∈ U⊥.    (1)

Why? Suppose that (1) holds. Then, for any x ∈ U, since Py - x ∈ U,

‖y - x‖² = ‖y - Py + Py - x‖² = ‖y - Py‖² + 2⟨y - Py, Py - x⟩ + ‖Py - x‖²
         = ‖y - Py‖² + ‖Py - x‖² ≥ ‖y - Py‖²,

with equality if and only if x = Py, i.e., Py is the minimizer of ‖y - x‖² over x ∈ U.

We now invite you to further explore the properties of P.

Exercise 2.
(a) A map T : V → V is called a linear transformation if for all u, v ∈ V and all c ∈ R, T(u + cv) = Tu + cTv. Prove that P is a linear transformation. (Hint: Apply the same method of proof used above.)
(b) Suppose that U is finite-dimensional, n := dim U, with basis {vᵢ}ⁿᵢ₌₁. Suppose that the basis is orthonormal, that is, the vectors are pairwise orthogonal and ‖vᵢ‖ = 1 for each i = 1, ..., n. Show that Py = Σⁿᵢ₌₁⟨y, vᵢ⟩vᵢ. (Note: If we take U = Rⁿ with the standard inner product, then P can be represented as a matrix in the form P = Σⁿᵢ₌₁ vᵢvᵢᵀ.)

#### 1.3.1 Gram-Schmidt Process

Let us see what (1) tells us in the case when we have a finite basis {vᵢ}ⁿᵢ₌₁ for U. The condition Py ∈ U says that Py is a linear combination Σⁿᵢ₌₁ cᵢvᵢ of the basis {vᵢ}ⁿᵢ₌₁. The condition y - Py ∈ U⊥ is equivalent to saying that y - Py is orthogonal to vᵢ for i = 1, ..., n. These two conditions give us a system of equations which we can, in principle, solve:

⟨y - Σⁿᵢ₌₁ cᵢvᵢ, vⱼ⟩ = 0,    j = 1, ..., n.    (2)

However, what if the basis {vᵢ}ⁿᵢ₌₁ is orthonormal, as in Exercise 2(b)? Then, the computation of Py is simple: for each i = 1, ..., n, ⟨y, vᵢ⟩ gives the component of the projection in the direction vᵢ.

Fortunately, there is a simple procedure for taking a basis and converting it into an orthonormal basis. It is known as the Gram-Schmidt process. The algorithm is iterative: at step j ∈ {1, ..., n}, we will have an orthonormal set of vectors {uᵢ}ʲᵢ₌₁ so that span{uᵢ}ʲᵢ₌₁ = span{vᵢ}ʲᵢ₌₁. To start, take u₁ := v₁/‖v₁‖. Now, at step j ∈ {1, ..., n-1}, consider Pu₁,...,uⱼvⱼ₊₁, where Pu₁,...,uⱼ is the orthogonal projection onto span{u₁, ..., uⱼ}. Because of (1), we know that wⱼ₊₁ := vⱼ₊₁ - Pu₁,...,uⱼvⱼ₊₁ lies in (span{uᵢ}ʲᵢ₌₁)⊥, so that wⱼ₊₁ is orthogonal to u₁, ..., uⱼ. Also, we know that wⱼ₊₁ ≠ 0 because if vⱼ₊₁