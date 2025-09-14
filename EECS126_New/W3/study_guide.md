# Modes of Convergence

In the study of real number sequences (aₙ)ₙ∈ℕ, convergence has a single, clear definition: aₙ → a as n → ∞ if for every ε > 0 there exists a positive integer N such that the sequence after N is always within ε of the limit a. However, when we turn our attention to sequences of functions—particularly random variables—the notion of convergence becomes considerably more nuanced. This note explores several fundamental modes of convergence and their relationships in probability theory.

Throughout our discussion, we fix a probability space Ω and consider a sequence of random variables (Xₙ)ₙ∈ℕ, along with another random variable X.

## Almost Sure Convergence

The sequence (Xₙ)ₙ∈ℕ converges almost surely (a.s.) or with probability one to the limit X if the set of outcomes ω ∈ Ω for which Xₙ(ω) → X(ω) forms an event of probability one. This means that all observed realizations of the sequence converge to the limit. We denote this mode of convergence by Xₙ →^{a.s.} X as n → ∞.

While one could define an even stronger notion requiring Xₙ(ω) → X(ω) for every outcome (not just for a set of probability one), probabilists disregard events of probability zero as they are never observed. Thus, almost sure convergence is regarded as the strongest practical form of convergence.

### Theorem 1 (Strong Law of Large Numbers)
If (Xₙ)ₙ∈ℕ are pairwise independent and identically distributed with E[|X₁|] < ∞, then:

n⁻¹ Σᵢ₌₁ⁿ Xᵢ →^{a.s.} E[X₁] as n → ∞

This celebrated result states that sample averages of identically distributed random variables converge almost surely to their expected value under very weak assumptions.

Applications of almost sure convergence appear throughout probability theory: in discrete-time Markov chains (analyzing the fraction of time spent in states), in information theory's asymptotic equipartition property, and in machine learning's stochastic gradient descent algorithms.

## Convergence in Probability

The sequence (Xₙ)ₙ∈ℕ converges in probability to X, denoted Xₙ →^P X as n → ∞, if for every ε > 0:

P(|Xₙ - X| > ε) → 0 as n → ∞

This means that for any fixed ε > 0, the probability that the sequence deviates from the supposed limit X by more than ε becomes vanishingly small.

### Theorem 2
If Xₙ →^{a.s.} X as n → ∞, then Xₙ →^P X as n → ∞.

**Proof:** Fix ε > 0. Define Aₙ := ⋃ₘ₌ₙ^∞ {|Xₘ - X| > ε} to be the event that at least one of Xₙ, Xₙ₊₁, ... deviates from X by more than ε. Observe that A₁ ⊇ A₂ ⊇ ... decreases to an event A which has probability zero, since the almost sure convergence of (Xₙ)ₙ∈ℕ implies that for all outcomes ω (outside of an event of probability zero), the sequence (|Xₙ(ω) - X(ω)|)ₙ∈ℕ is eventually bounded by ε. Thus:

P(|Xₙ - X| > ε) ≤ P(Aₙ) → P(A) = 0 as n → ∞

However, the converse is not true.

### Example 1
Consider Xₙ = 0 for all n ∈ ℕ. For each j ∈ ℕ, pick an index Nⱼ uniformly at random from {2ʲ, ..., 2ʲ⁺¹ - 1} and set X_{Nⱼ} = 1. We have:

P(Xₙ ≠ 0) = P(N_{⌊log₂ n⌋} = n) = 2^{-⌊log₂ n⌋} → 0 as n → ∞

So Xₙ →^P 0. However, for any ω ∈ Ω, the sequence (Xₙ(ω))ₙ∈ℕ takes on both values 0 and 1 infinitely often, so (Xₙ)ₙ∈ℕ does not converge almost surely.

As a consequence of Theorems 1 and 2, if (Xₙ)ₙ∈ℕ are pairwise independent and identically distributed with E[|X₁|] < ∞, then n⁻¹ Σᵢ₌₁ⁿ Xᵢ →^P E[X₁], known as the Weak Law of Large Numbers (WLLN).

The practical distinction: with convergence in probability, deviations of any particular size become increasingly rare but may occur forever. With almost sure convergence, for any observed realization, there will come a time after which no such deviations occur.

## Convergence in Distribution

The sequence (Xₙ)ₙ∈ℕ converges in distribution or in law to X, denoted Xₙ →^d X as n → ∞, if for each x ∈ ℝ such that P(X = x) = 0:

P(Xₙ ≤ x) → P(X ≤ x) as n → ∞

Unlike the previous forms, convergence in distribution does not require all random variables to be defined on the same probability space.

### Example 2
Consider the constant random variables Xₙ := 2⁻ⁿ and X := 0. We have P(Xₙ ≤ 0) = 0 for all n ∈ ℕ, whereas P(X ≤ 0) = 1, so P(Xₙ ≤ 0) does not converge to P(X ≤ 0). Since P(X = 0) = 1, we fix this by only looking at points x where P(X = x) = 0, i.e., where the CDF of X is continuous.

### Theorem 3
1. If (Xₙ)ₙ∈ℕ and X take values in ℤ, and if P(Xₙ = x) → P(X = x) for all x ∈ ℤ, then Xₙ →^d X.

2. If (Xₙ)ₙ∈ℕ and X are continuous random variables, and if f_{Xₙ}(x) → f_X(x) for all x ∈ ℝ, then Xₙ →^d X.

### Theorem 4
If Xₙ →^P X as n → ∞, then Xₙ →^d X as n → ∞.

**Proof:** Let x be a point such that P(X = x) = 0. Fix ε > 0. We can write:

P(Xₙ ≤ x) = P(Xₙ ≤ x, |Xₙ - X| < ε) + P(Xₙ ≤ x, |Xₙ - X| ≥ ε)
         ≤ P(X ≤ x + ε) + P(|Xₙ - X| ≥ ε)

Similarly:

P(X ≤ x - ε) = P(X ≤ x - ε, |Xₙ - X| < ε) + P(X ≤ x - ε, |Xₙ - X| ≥ ε)
             ≤ P(Xₙ ≤ x) + P(|Xₙ - X| ≥ ε)

Combining the bounds:

P(X ≤ x - ε) - P(|Xₙ - X| ≥ ε) ≤ P(Xₙ ≤ x) ≤ P(X ≤ x + ε) + P(|Xₙ - X| ≥ ε)

Since Xₙ →^P X, then P(|Xₙ - X| ≥ ε) → 0, so eventually (P(Xₙ ≤ x))ₙ∈ℕ is trapped between P(X ≤ x - ε) and P(X ≤ x + ε). This holds for all ε > 0 and the CDF of X is continuous at x, so taking ε → 0, we conclude P(Xₙ ≤ x) → P(X ≤ x).

The converse is not true: convergence in distribution does not imply convergence in probability.

### Example 3
Let X₀ ~ Uniform[-1, 1], and for each positive integer n, let Xₙ := (-1)ⁿX₀. Then Xₙ ~ Uniform[-1, 1] for all n ∈ ℕ because the Uniform[-1, 1] distribution is symmetric around the origin, so convergence in distribution holds trivially. However, (Xₙ)ₙ∈ℕ does not converge in probability.

Thus we have established the hierarchy:

Xₙ →^{a.s.} X  ⟹  Xₙ →^P X  ⟹  Xₙ →^d X

### Theorem 5 (Central Limit Theorem)
If (Xₙ)ₙ∈ℕ is a sequence of i.i.d. random variables with common mean μ and finite variance σ², then:

(Σᵢ₌₁ⁿ Xᵢ - nμ)/(σ√n) →^d Z as n → ∞

where Z is a standard Gaussian random variable. Explicitly, for all x ∈ ℝ:

P((Σᵢ₌₁ⁿ Xᵢ - nμ)/(σ√n) ≤ x) → ∫₋∞ˣ (1/√2π) exp(-z²/2) dz as n → ∞

The CLT plays a crucial role in statistics for providing asymptotic confidence intervals. Statisticians also work to prove convergence in distribution to other common distributions such as chi-squared or t distributions.

### Theorem 6 (Poisson Law of Rare Events)
If Xₙ ~ Binomial(n, pₙ) where pₙ → 0 such that npₙ → λ > 0, then Xₙ →^d X, where X ~ Poisson(λ).

Many situations involving balls and bins have Poisson limits, making this result useful in random graph models.

## Miscellaneous Results

### Continuous Mapping

#### Theorem 7 (Continuous Mapping)
Let f be a continuous function.

1. If Xₙ →^{a.s.} X, then f(Xₙ) →^{a.s.} f(X).
2. If Xₙ →^P X, then f(Xₙ) →^P f(X).
3. If Xₙ →^d X, then f(Xₙ) →^d f(X).

A typical application involves analyzing sequences through log or exp transformations when showing convergence of (log Xₙ)ₙ∈ℕ or (exp Xₙ)ₙ∈ℕ is easier than the original sequence.

### Convergence of Expectation

In general, none of the above modes of convergence imply that E[Xₙ] → E[X]. For example, let U ~ Uniform[0, 1] and let Xₙ := n𝟙{U ≤ n⁻¹}. Then Xₙ →^{a.s.} 0, but E[Xₙ] = 1 for all n.

#### Theorem 8 (Convergence Theorems)
Suppose Xₙ →^{a.s.} X.

1. **Monotone Convergence:** If 0 ≤ X₁ ≤ X₂ ≤ X₃ ≤ ..., then E[Xₙ] → E[X].

2. **Dominated Convergence:** If there exists a random variable Y ≥ 0 with E[Y] < ∞ and |Xₙ|, |X| ≤ Y for all n, then E[Xₙ] → E[X].

These convergence theorems are technical tools used in advanced probability theory to justify convergence of expectations.