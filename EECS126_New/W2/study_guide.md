# Concentration Inequalities

EECS 126 (UC Berkeley)  
Fall 2021

Suppose we have a collection of scalar random variables X₁, . . . , Xₙ. We may often wish to analyze the distribution of their sum (or equivalently, their average)

Sₙ = X₁ + · · · + Xₙ.

It turns out that, assuming that our Xᵢ have a sufficient amount of regularity and independence, which will be quantified throughout this section, the probability of being close to the mean will sharply concentrate in a relatively narrow range.

## 1 The Moment Method, Chernoff/Hoeffding Bounds

The first moment method should be a familiar application of Markov's inequality,

P(|Sₙ| ≥ λ) ≤ (1/λ) ∑ᵢ₌₁ⁿ E|Xᵢ|,                 (1)

as should the second moment method, an application of Chebyshev's inequality,

P(|Sₙ| ≥ λ) ≤ (1/λ²) ∑ᵢ₌₁ⁿ Var(Xᵢ),              (2)

where we have assumed that the Xᵢ are pairwise independent.

**Exercise 1.1.** Come up with examples of random variables X₁, . . . , Xₙ in which (1) and (2) are tight.

We can play a similar game with k-th moments, by assuming k-wise independence. We'd have to do some combinatorial bookkeeping with the terms in

E|Sₙ|ᵏ = ∑₁≤ᵢ₁,...,ᵢₖ≤ₙ EXᵢ₁ . . . Xᵢₖ,

and after some algebra involving Stirling's formula, we can arrive at the large deviation bound

P(|Sₙ| ≥ λ√n) ≤ 2(√(ek/2)/λ)ᵏ.                  (3)

But instead of dwelling on this, we can often obtain much better bounds using exponential moments, namely by considering the moment generating function Ee^(tSₙ). The following is a bound for a single random variable which will be useful.

**Lemma 1.2 (Hoeffding's lemma)**  
If X is a scalar random variable taking values in [a, b], then for any t > 0,

Ee^(tX) ≤ e^(tEX)(1 + O(t²Var(X)e^(O(t(b-a))))),     (4)

and in particular,

Ee^(tX) ≤ e^(tEX)e^(O(t²Var(X))) ≤ e^(tEX)e^(O(t²(b-a)²)).     (5)

*Proof.* Note that we can subtract the mean from X, a, b and assume that EX = 0. Furthermore, by normalizing X we can assume that b - a = 1. Then X = O(1), and we have the Taylor expansion

e^(tX) = 1 + tX + (tX)²/2! + (tX)³/3! + · · ·
      = 1 + tX + O(t²X²e^(O(t))).

Taking expectations gives us

Ee^(tX) = 1 + O(t²Var(X)e^(O(t))),

proving (4). To get the other bound, note that Var(X) ≤ (b - a)², and consider the function

f(x) = (1 + x²e^x)/e^(x²),

which can be shown to be bounded. With x = t(b - a), this gives us (5).

Using some calculus, we can sharpen Hoeffding's lemma to the following explicit bound:

**Theorem 1.3 (Chernoff bound)**  
Let X₁, . . . , Xₙ be independent scalar random variables with |Xᵢ| ≤ K almost surely, with means μᵢ and variances σᵢ². Then for any λ > 0, we have

P(|Sₙ - μ| ≥ λσ) ≤ C max{e^(-cλ²), e^(-cλσ/K)},     (6)

where C, c > 0 are constants, μ := ∑ᵢ₌₁ⁿ μᵢ, and σ² := ∑ᵢ₌₁ⁿ σᵢ².

*Proof.* We may assume that μᵢ = 0 and K = 1. It then suffices to prove the upper tail bound

P(Sₙ ≥ λσ) ≤ C max{e^(-cλ²), e^(-cλσ)}.

Note that by independence,

Ee^(tSₙ) = ∏ᵢ₌₁ⁿ Ee^(tXᵢ).

By (5) and the fact that |X| ≤ 1, we have

Ee^(tXᵢ) ≤ e^(O(t²σᵢ²)),

and together this gives us

Ee^(tSₙ) ≤ e^(O(t²σ²)).

By Markov's inequality, one has

P(Sₙ ≥ λσ) ≤ e^(O(t²σ²)-tλσ).

Optimizing over t subject to the constraint t ∈ [0, 1] gives us (6).

**Exercise 1.4.** By letting t take values in some larger interval than [0, 1], show that the term e^(-cλσ/K) in the Chernoff bound can be replaced with (λK/σ)^(-cλσ/K), which is better for when λK ≫ σ.

**Corollary 1.5 (Hoeffding bound)**  
Let X₁, . . . , Xₙ be independent random variables taking values in intervals [aᵢ, bᵢ], respectively. Then

P(|Sₙ - ESₙ| ≥ λσ) ≤ Ce^(-cλ²),

where C, c > 0 are constants and σ² := ∑ᵢ₌₁ⁿ |bᵢ - aᵢ|².

*Proof.* This follows from Chernoff's bound and the assumption that Var(Sₙ) = ∑ᵢ₌₁ⁿ |bᵢ - aᵢ|².

Notes by Albert Zhang