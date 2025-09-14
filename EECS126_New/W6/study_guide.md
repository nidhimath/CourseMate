# Chapter 1
## Hypothesis Testing

### 1.1 Introduction

Thus far in this class, we have been trying to predict behavior for a given model (e.g., how many arrivals do we expect in τ time for a Poisson Process). Hypothesis Testing deals with the reverse direction, of trying to fit a model for a set of observations.

The general setup of the problem is as follows: you are given some observation(s) x ~ X, and you are told that there is some θ* ∈ Θ for which the data was drawn as X ~ P_θ*, and the task is to determine whether θ* is in Θ₀ or in Θ₁ (these sets are constructed where Θ₀ ∪ Θ₁ = Θ and Θ₀ ∩ Θ₁ = ∅). If θ* ∈ Θ₀ we say H₀ is correct, otherwise, H₁ is correct. An example may be more illuminating:

#### Example 1

Suppose you have 10 fire alarms in your home. k of the fire alarms went off, and you want to determine whether there is actually a fire in your home or its a false alarm. H₀, the null hypothesis, is that there is no fire; H₁, the alternate hypothesis, is that there is a fire in your home. In general, we assume the null hypothesis is correct until we get more information to overturn this assumption. In this example, maybe we decide that if 1 fire alarm went off, this is not enough information to say that the house is on fire, because its more likely that the alarm is faulty. However, if 8 alarms went off, maybe under our knowledge, we would reject the null hypothesis and say the house is on fire. In this example Θ₀ = {0} and Θ₁ = {1}. If we decide based on our information that θ = 0, then we say the house is not on fire (H₀). Otherwise we would say θ = 1, that the house is on fire (H₁).

We call H₀ (and H₁) simple if Θ₀ and Θ₁ each only contain one item. Notice that in the example, the hypothesis test is simple. Suppose instead of determining whether the house was on fire, we were trying to estimate what percentage of the house was on fire. Θ₀ = {0} and Θ₁ = (0, 100]. In this case the null hypothesis that 0% of the house is on fire is simple, while the alternate hypothesis is not simple. The focus of this note will be on simple null and simple alternate tests.

We can design any arbitrary test that uses our observation (later we will find that there is some notion of "optimal" test); in particular our test can be thought of as a Acceptance Region A i.e., the test is: accept H₀ ⟺ x ∈ A. More often than not (at least in this class) the problem is to determine what "optimal" A needs to be for a given set of conditions.

#### Example 2: Acceptance Regions

Examples of such arbitrary tests are:

1. Reject H₀ if and only if x > t
2. Reject H₀ if and only if x = t  
3. Reject H₀ with probability γ when x > t

where t ∈ ℝ is arbitrary and used to define the acceptance region of the test. Note that these tests are arbitrary and are not necessarily "optimal" in the Neyman-Pearson sense.

For any arbitrary test, there is a possibility of rejecting the null when the null is in fact true. This is called a Type-I Error or probability of false alarm (PFA). The probability of a type-I error occurring is called the significance level which is denoted by α. More formally, this value is in general:

α(A) := P_H₀(choosing H₁) = P_H₀(x ∉ A)

On the flip side, there is a possibility of accepting the null when the alternative is true. This is called a Type-II Error. The probability of a type-II error is defined as β and it is in general:

β(A) := P_H₁(choosing H₀) = P_H₁(x ∈ A)

The probability of the test to correctly reject the null is called the power (also called the probability of correct detection (PCD)) of the test, which is denoted by 1 - β.

Even though A can be chosen arbitrarily, we want to find the "best" A. It is clear that there are two conflicting interests. We want minimize the probability of a type-I error, while simultaneously maximizing the power of the test. So to formalize this issue, we formulate the problem as "how large of a PCD can we get for a constrained PFA?" In other words, it is the following optimization problem:

q := max_A 1 - β(A)  
s.t. α(A) ≤ z

Where z is some predefined constant (often times, z = 0.05). It turns out for the simple vs simple hypothesis testing regime, we can characterize the "optimal" testing scheme (i.e., the A that maximizes q)

### 1.2 "Optimal" Likelihood Ratio test

#### Definition 1: Likelihood ratio

We define the Likelihood ratio to be:

L(x) := P_H₁(x)/P_H₀(x)

or

L(x) := f_H₁(x)/f_H₀(x)

#### Definition 2: Likelihood ratio test

The Likelihood ratio test (also called the Neyman-Pearson Test): for a critical threshold c and for observation x

1. accept H₀ if L(x) < c
2. reject H₀ with probability γ if L(x) = c
3. reject H₀ if L(x) > c

Note that this use of L(x) characterizes the acceptance region A

#### Lemma 1: Neyman-Pearson

Consider a particular choice of c in the Likelihood Ratio test, such that

P_H₀(L(x) > c) + γ P_H₀(L(x) = c) = α₀  
P_H₁(L(x) < c) + (1 - γ) P_H₁(L(x) = c) = β₀

Suppose there is some other test, with rejection region A, which achieves a smaller or equal false rejection probability P_H₀(X ∈ A) ≤ α₀ then P_H₁(x ∉ A) ≥ β₀. There is strict inequality P_H₁(X ∉ A) > β₀ when P_H₀(X ∈ A) < α₀

In other words, the Likelihood Ratio Test is the most powerful test.

Proof. In the Bertsekas book page 491. This theorem was paraphrased from the Bertsekas book.

This lemma characterizes what the optimal acceptance region should look like. As a consequence of the Neyman-Pearson Lemma, (1) is equivalent to:

q = max_c 1 - P_H₁(L(x) < c) - (1 - γ) P_H₁(L(x) = c)  
s.t. P_H₀(L(x) > c) + γ P_H₀(L(x) = c) = z

This has an important consequence as we find the optimal parameters of our decision rule by solving for the value of c that sets P_H₀(L(x) > c) + γ P_H₀(L(x) = c) = z. However, L(x) is often difficult to analyze. So oftentimes in this class, there will be some equivalent condition that is easier to manipulate. i.e., it may be the case that we have a relationship L(x) > c ⟺ B for an event B(x) which is easier to handle; e.g., in this class, often times L(x) is monotonic in x; this means L(x) > c ⟺ x > t or x < t. We can use these if and only if conditions to rewrite the Likelihood ratio test in an equivalent, more digestible way. This type of trick is elucidated in the next example:

#### Example 3: Normal RV Hypothesis Test

Suppose we are trying to determine whether X is N(0, σ²) or N(1, σ²) by using our observation x for a significance level z via a Likelihood ratio hypothesis test. Our two simple hypotheses are:

• H₀ : X ~ N(0, σ²); Θ₀ = {μ = 0}
• H₁ : X ~ N(1, σ²); Θ₁ = {μ = 1}

Let's see what the most powerful test is. i.e., let's conduct a likelihood ratio test. First, let's see what the likelihood ratio is:

L(x) = f_μ=1(x)/f_μ=0(x) = [1/(σ√2π) exp(-(x-1)²/2σ²)]/[1/(σ√2π) exp(-x²/2σ²)]

= exp(-(x - 1)²/2σ² + x²/2σ²)

= exp((2x - 1)/2σ²)

Observe that for some c ∈ ℝ

L(x) = exp((2x - 1)/2σ²) > c ⟺ x > t

for some t ∈ ℝ since L(x) is monotonically increasing in t. Using this observation, we can see that the likelihood ratio test reduces to:

1. reject H₀ if x > t
2. accept H₀ if x ≤ t

Notice that this rule intuitively makes sense. Since H₁ corresponds to the hypothesis that the mean is larger, which means that a larger observe value intuitively corresponds to higher likelihood that μ = 1.

With these values defined, we know that α = P_μ=0(X > t) and β = P_μ=1(X < t). In setting up the optimization problem specified in (2), we see that we need to find that maximizes the following:

max_t 1 - Φ((t - 1)/σ)  
s.t. 1 - Φ(t/σ) = z

We can then solve for the t value where 1 - Φ(t/σ) = z.

Oftentimes when the likelihood ratio has non-zero probability on a single value i.e., P(L(x) = d) > 0, γ may need to be calibrated. When X is discrete, the likelihood ratio has a discrete image, so this serves as a sufficient condition indicating when γ may need to be tuned. Here is an example when γ is needed when X is a continuous random variable:

#### Example 4: Tuning γ

Suppose we are trying to determine whether X is Uniform[-1, 1] or Uniform[0, 2] for a given observation x ~ X and a significance level z via a hypothesis test. Formally, our hypotheses are:

• H₀ : X ~ Uniform[-1, 1]
• H₁ : X ~ Uniform[0, 2]

Let's conduct a likelihood ratio test. The likelihood ratio is:

L(x) = f_H₁(x)/f_H₀(x) = 1{0 ≤ x ≤ 2}/1{-1 ≤ x ≤ 1}

Upon using the Neyman-Pearson Lemma, we need to find the solution of (2) which reduces to finding a solution of:

P_H₀(L(x) > c) + γ P_H₀(L(x) = c) = z

Since the output of L(x) is {0, 1, ∞}, we observe that we only need to consider c = 0, c = 1, c = ∞. So we can brute force our choice of c directly by evaluating P_H₀(L(x) > c) and P_H₀(L(x) = c).

We make the following observations:

1. Suppose c = 0, observe that P_H₀(L(x) = 0) = 1/2 and P_H₀(L(x) > 0) = 1 - P_H₀(L(x) = 0) = 1/2. Thus, we get the equation z = 1/2 + γ1/2

2. Suppose c = 1, observe that P_H₀(L(x) = 1) = 1/2 and P_H₀(L(x) > 1) = 0. Thus, we get the equation z = 0 + γ1/2

3. Suppose c = ∞, observe that P_H₀(L(x) = ∞) = 0 and P_H₀(L(x) > ∞) = 0. Thus, we get the (useless) equation z = 0, which is not satisfiable for z ≠ 0.

We observe that we get the following test in accordance to the procedure described in Definition 2:

1. If 0 ≤ z ≤ 1/2, (using the second case above) we can set c = 1 and γ = 2z.
2. If 1/2 ≤ z ≤ 1, (using the first case above) we can set c = 0 and γ = 2(z - 1/2)

Even though this is an optimal test, we can also disentangle the test from the likelihood ratio altogether by utilizing the following observations:

• L(x) = 0 ⟺ x ∈ [-1, 0)
• L(x) = 1 ⟺ x ∈ [0, 1]
• L(x) = ∞ ⟺ x ∈ (1, 2]

Thus in substituting these if and only if conditions into the procedure described in 2, we get the equivalent tests:

1. If 0 ≤ z ≤ 1/2:
   (a) accept H₀ if x ∈ [-1, 0)
   (b) reject H₀ with probability γ = 2z if x ∈ [0, 1]
   (c) reject H₀ if x ∈ (1, 2]

2. If 1/2 < z ≤ 1:
   (a) reject H₀ with probability γ = 2(z - 1/2) if x ∈ [-1, 0)
   (b) reject H₀ if x ∈ [0, 2]

Side note: It turns out that the second test for γ > 0 is "worse" the second test for γ = 0 because there is no way that H₁ is true if x ∈ [-1, 0). In other words the PCD of the second test with γ = 0 is already 1 (the maximum value), so making γ larger only serves to increase the PFA. For this reason, choices of z > 1/2 don't really make sense in this problem.