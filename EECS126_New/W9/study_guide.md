# Chapter 1

## Markov Chains

### 1.1 Brisk Introduction

This note is not meant to be a comprehensive treatment of Markov chains. Instead, it is intended to provide additional explanations for topics which are not emphasized as much in the course texts.

A sequence of random variables (Xₙ)ₙ∈ℕ is a discrete-time Markov chain (DTMC) on the state space 𝒳 if it satisfies the Markov property: for all positive integers n and feasible sequences of states x₀, x₁, ..., xₙ₊₁ ∈ 𝒳,

P(Xₙ₊₁ = xₙ₊₁ | Xₙ = xₙ, ..., X₁ = x₁, X₀ = x₀) = P(xₙ, xₙ₊₁),

where P(·, ·) is a set of non-negative numbers such that for all x ∈ 𝒳, ∑ᵧ∈𝒳 P(x, y) = 1. The Markov property is often summarized by the statement "the past and future are conditionally independent given the present", and it reflects a model in which knowledge of the current state fully determines the distribution of the next state. Be careful however; the random variables in a Markov chain are not in general independent, and in particular, the Markov property does not say that Xₙ₊₁ is independent of Xₙ₋₁.

In this course, we will allow 𝒳 to either be finite or countably infinite. When 𝒳 is finite, then the numbers (P(x, y), x, y ∈ 𝒳) can be organized into a matrix called the transition probability matrix; it has the property that its rows sum to 1, and such matrices are called row stochastic.

In order to fully specify the joint distribution of a Markov chain, one needs to specify the initial distribution π₀, which is a probability distribution on 𝒳 representing the distribution of X₀; and the transition probabilities P. The Markov property then gives, for any positive integer n and x₀, x₁, ..., xₙ ∈ 𝒳,

P(X₀ = x₀, X₁ = x₁, ..., Xₙ = xₙ) = π₀(x₀)P(x₀, x₁) · · · P(xₙ₋₁, xₙ).

Using the rules of probability and the Markov property, the k-step transition matrix Pₖ is

Pₖ(x, y) := P(Xₖ = y | X₀ = x)
         = ∑ₓ₁,...,ₓₖ₋₁∈𝒳 P(Xₖ = y, Xₖ₋₁ = xₖ₋₁, ..., X₁ = x₁ | X₀ = x)
         = ∑ₓ₁,...,ₓₖ₋₁∈𝒳 P(x, x₁)P(x₁, x₂) · · · P(xₖ₋₂, xₖ₋₁)P(xₖ₋₁, y)
         = Pᵏ(x, y),

where Pᵏ(x, y) is the (x, y) entry of the kth power of P. A consequence is that Pₖ₊ₗ = PₖPₗ for all k, ℓ ∈ ℕ; these are known as the Chapman-Kolmogorov equations. Usually, we denote the distribution of Xₙ by the row vector πₙ, and then the distribution of πₙ is given by matrix-vector multiplication: πₙ = π₀Pⁿ.

As another consequence of the above discussion, if π₀ is a distribution such that π₀ = π₀P, then the chain will have the same distribution for all time: πₙ = π₀ for all n ∈ ℕ. Such a distribution is called a stationary distribution of the chain (also known as an invariant distribution). Stationarity plays a central role in the study of Markov chains. The condition π = πP is more explicitly written as π(x) = ∑ᵧ∈𝒳 π(y)P(y, x) for all x ∈ 𝒳, and these are known as the balance equations. In the finite-state case, the balance equations correspond to a set of |𝒳| linear equations (one of which is redundant), along with the normalization condition ∑ₓ∈𝒳 π(x) = 1, and the system can be solved via Gaussian elimination (or other methods for calculating eigenvectors).

## Chapter 2

### Long-Run Behavior of a Countable-State Markov Chain

This section aims to give a big picture overview of the results about the long-run behavior of countable-state discrete-time Markov chains. The proofs will not be given here.

### 2.1 Recurrence & Transience

When discussing Markov chains, the mental picture to have is that of a particle which jumps from state to state in the state space according to the transition probabilities of the chain, and the random variable Xₙ keeps track of the location of the particle at time n.

The first key insight about Markov chains is that, while some states will be visited by the chain over and over again, other states will only be visited a few times and then never seen again. To formalize this, let us define some standard notation. For each x ∈ 𝒳, the random variable Tₓ represents the first time that the chain visits state x, i.e., Tₓ := min{n ∈ ℕ : Xₙ = x} (this is called the hitting time of state x). We will also need the random variable T⁺ₓ := min{n ∈ ℤ⁺ : Xₙ = x}, which is the hitting time for state x except that we do not let T⁺ₓ equal 0 when the chain starts at x. Also, the notations Pₓ and Eₓ mean that the chain is started at state x, that is,

Pₓ(·) := P(· | X₀ = x),
Eₓ[·] := E[· | X₀ = x].

Then, for x, y ∈ 𝒳, we define ρₓ,ᵧ := Pₓ(T⁺ᵧ < ∞), the probability that starting from state x we eventually reach state y, and ρₓ := ρₓ,ₓ for simplicity. Now, we say that a state x is recurrent if ρₓ = 1 and transient if ρₓ < 1.

Proposition 1. Let Nₓ denote the total number of visits to state x, that is, Nₓ := ∑ₙ∈ℕ 1{Xₙ = x}. If x is recurrent, then Nₓ = ∞ Pₓ-a.s., so in particular Eₓ[Nₓ] = ∞. If x is transient, then Eₓ[Nₓ] < ∞; in fact,

Eₓ[Nₓ] = ρₓ/(1 - ρₓ) < ∞.

In particular, Nₓ < ∞ Pₓ-a.s.

In the above result, the notation Pₓ-a.s. means that the event occurs almost surely when the chain is started from state x, i.e., Pₓ(·) = 1.

The above result formalizes the intuition about recurrent and transient states: starting from a recurrent state x, then x will be visited infinitely many times by the chain. Starting from a transient state x, the chain will only visit x finitely many times, and then never return.

What is an example of a recurrent state or a transient state? We will shortly describe the main classification result, which gives an easy way of figuring out which states are transient and which states are recurrent by looking at the transition diagram of the Markov chain. The transition diagram is the directed graph associated with the Markov chain, where the vertices are the states in 𝒳, and the edge (x, y) is drawn in the transition diagram if and only if P(x, y) > 0. However, we can treat a few examples from definitions alone.

Example 1. Consider the two-state chain:

[Diagram shows states 0 and 1 with transition probabilities]

Here it is clear that once we are in state 1, we will never leave 1, whereas if we are in state 0, then eventually we will leave state 0 and move to state 1. Therefore state 0 is transient and state 1 is recurrent.

Example 2. Consider the simple random walk which is "reflected" at 0:

[Diagram shows states 0, 1, 2, ... with transition probabilities 1/2]

We claim that state 0 is recurrent. If we start in state 0, then with probability 1/2 we will return to state 0 immediately; otherwise, we will move to state 1, which yields the equation

ρ₀ = 1/2 + 1/2ρ₁,₀.

Now, once we are in state 1, then with probability 1/2 we will reach state 0; otherwise, with probability 1/2 we will reach state 2, so

ρ₁,₀ = 1/2 + 1/2ρ₂,₀.

However, in order to reach state 0 from 2, we must reach 1 from 2 and 0 from 1, so ρ₂,₀ = ρ₂,₁ρ₁,₀. By symmetry, ρ₂,₁ = ρ₁,₀, so ρ₂,₀ = ρ²₁,₀. Substituting this into the above equations yields

ρ₁,₀ = 1/2 + 1/2ρ²₁,₀

and this is seen to imply ρ₁,₀ = 1; thus, ρ₀ = 1 as well. Already we have arrived at a result that is not immediately obvious: the reflected random walk will visit the origin infinitely often (instead of "drifting off to ∞").

Proposition 2. A finite-state DTMC has at least one recurrent state.

After all, the chain has to spend its time somewhere, and if it visits each of its finitely many state finitely many times, then where else could it go? However, this is not true for infinite-state Markov chains.

Example 3. Consider the following chain:

[Diagram shows states 0, 1, 2, ... with transitions of probability 1]

Clearly the chain drifts off to ∞ and every state is transient.

### 2.2 Classification of States

We say that state x communicates with state y if ρₓ,ᵧ > 0 and ρᵧ,ₓ > 0. In words, it is possible (through a sequence of transitions with non-zero probability) to reach state y from state x, and it is also possible to reach state x from state y. A communicating class is a maximal set of states which communicate with each other. In graph terminology, a communicating class is a strongly connected component (SCC) in the transition diagram of the chain. The set of communicating classes of the chain partition the state space, and this concept will allow us to take a Markov chain with a complicated structure and decompose it into smaller chains.

We say that a Markov chain is irreducible if it consists of only a single communicating class. An alternate way to describe irreducibility is that for any pair of states x and y, it is possible to reach x from y and vice versa.

We say that a property of a state is a class property if the property is necessarily shared by all members of a communicating class. In this case, then the property is not really a property of the state, but rather a property of the entire communicating class. The key classification result is:

Theorem 1 (Classification of States). Recurrence and transience are class properties.

We can now speak of recurrent and transient classes, rather than restricting ourselves to recurrent and transient states. In the case when the Markov chain is irreducible, then there is only one communicating class, so we can speak of the entire Markov chain as being recurrent or transient. The following observations are helpful for classifying the states of a Markov chain.

· From Proposition 2 it follows that every finite-state irreducible chain is recurrent. More generally, any finite communicating class which has no edges leaving the communicating class (the class is closed) is recurrent.

· If a state has an edge which leads outside of the communicating class in which it belongs, then the state is transient.

· If a state is recurrent, then any state it can reach is also recurrent ("recurrence is contagious").

Given the above observations, see if you can formulate an algorithm for classifying all of the states of a finite-state Markov chain given only the transition diagram.

Example 4. Let us classify all of the states in the examples above.

· Example 1. The communicating classes are {0} and {1}. Since {0} has an edge to {1}, it is transient, and since {1} is closed it is recurrent.

· Example 2. The chain is irreducible, and since we have shown that 0 is recurrent, it follows that the entire chain is recurrent.

· Example 3. The communicating classes are {i} for i ∈ ℕ and each class is transient.

### 2.3 Positive Recurrence & Null Recurrence

In this section we address the existence and uniqueness of the stationary distribution.

First of all, to understand the terminology, a sequence of random variables (Xₙ)ₙ∈ℕ is called stationary if for all positive integers k, n, and all events A₁, ..., Aₙ, then

P(X₁ ∈ A₁, ..., Xₙ ∈ Aₙ) = P(Xₖ₊₁ ∈ A₁, ..., Xₖ₊ₙ ∈ Aₙ).

In other words, the distribution of (X₁, ..., Xₙ) is the same as the joint distribution after we shift the time index by k to (Xₖ₊₁, ..., Xₖ₊ₙ). Stationarity is important because many stochastic processes that have a stationary regime will, under suitable conditions, converge to stationarity in some sense. Consequently, stationarity is a powerful simplifying assumption that is justified for systems that have been running for a long period of time.

For a Markov chain (Xₙ)ₙ∈ℕ, convince yourself that (Xₙ)ₙ∈ℕ is stationary if and only if the chain is started from its stationary distribution (so the terminology is consistent).

We will start with a crucial interpretation of the stationary distribution. We will focus on the irreducible case.

Theorem 2. Suppose that the Markov chain is irreducible with a stationary distribution π. Then, for each x ∈ 𝒳,

π(x) = 1/Eₓ[T⁺ₓ].

Understanding this theorem carefully sheds light on much of the convergence theory, so let us take the time to sketch the ideas involved. Markov chains are a generalization of