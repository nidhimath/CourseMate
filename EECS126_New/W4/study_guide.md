# Continuous Time Markov Chains

## Chapter 1
### Introduction and Motivation

After spending some time with Markov Chains as we have, a natural question one might ask is what to do when our transitions between states don't come at nice, discrete, fixed intervals? For example, if we are modelling the number of people in line at checkout, it's not exactly reasonable to model this situation with customers arriving or being served with some probability exactly once every minute, or once every 10 minutes, or however long you want to make your interval. Instead, in the context of Continuous Time Markov Chains, we operate under the assumption that movements between states are quantified by rates corresponding to independent exponential distributions, rather than independent probabilities as was the case in the context of DTMCs.

## Chapter 2
### Intuition and Building Useful Ideas

From discrete-time Markov chains, we understand the process of jumping from state to state. For each state in the chain, we know the probabilities of transitioning to each other state, so at each timestep, we pick a new state from that distribution, move to that, and repeat.

The new aspect of this in continuous time is that we don't necessarily know when a jump is going to happen: in addition to a distribution over the states, we need to provide some natural way to describe the distribution of the time you spend in each state. Ideally, we also want the machinery of CTMCs to be similar to what we've already developed for DTMCs.

One possibility might be to say each edge has to carry two pieces of information: a probability of making that transition, and a random variable describing how long that transition would take.

However, this model is too general and doesn't capture all the features of Markov chains that we want. It's also overly complicated; in addition to a transition matrix, we need to specify one random variable (not just a constant) per edge, so it would be difficult to have any of the discrete-time algebraic methods and definitions carry over. Therefore, let's look at the features we'd like to have, and see if a more natural description emerges.

→ Markov Property

The most essential property we'd like to carry over from DTMCs to CTMCs is the Markov property. Informally, this says that wherever we end up next is only dependent on where we are right now, rather than the entire history of where we have been. Mathematically, the property is:

P(X_{t+1} = x_{t+1}|X_t = x_t, X_{t-1}, ..., X_0 = x_0) = P(X_{t+1} = x_{t+1}|X_t = x_t).

In continuous time, we can extend this slightly: not only do we want independence from the whole history of where we've been, we want independence from how long we've been where we are right now. If a CTMC is at state 1, it doesn't matter if the chain just moved there or if it's been there for some time (five minutes, five hours, etc.); the time required to leave the state should only depend on the chain setup and not on the history of what's happened.

→ Why Jump Times are Exponential

Although the transition times are no longer fixed to be 1, we can use the Markov property to figure out how they are distributed. Suppose at time t, we're in state i, and we're interested in the distribution of τ, the time until the chain jumps to a different state. As we said above, a key property of τ is that it's independent of how much time we have already spent at i. That is, if the chain has already spent time T in its current state, the distribution of τ is exactly the unconditioned distribution of T + τ:

f_{τ|τ>T}(t + T) = f_τ(t)

This is the statement that τ is memoryless, and we know that the unique continuous memoryless distribution is the exponential! Therefore, τ ~ Exponential(q). We will see that not only are the transition times at each state exponentially distributed, but transitions between specific pairs of states are also described by a rate of an exponential random variable. The value of q is dependent on each pair of states we're interested in (we conventionally denote the rates by q_{ij} for a transition i → j), and is encoded in the rate matrix Q.

→ Intuition per Step

We just saw that the jump times are exponential, and so it makes sense to describe how fast the transition i → j is by the parameter q_{ij} of the exponential random variable that represents its jump time. When we draw a CTMC, these parameters are the edge weights.

From this diagram, how do we get the probability of transitions? Intuitively, we now know how fast each transition happens: for example, if the parameter associated with 1 → 2 is 6 and that associated with 1 → 3 is 2. Therefore, transitions 1 → 2 happen three times as fast as those 1 → 3. This means that if we start at 1, then 3/4 of the time we should expect our next state to be 2, and the remaining 1/4 of the time it's 3. We can formalize this!

Recall that the minimum of exponential RVs is also exponential, with parameter equal to the sum of the rates. This gives us two high-level ways of looking at CTMCs. Suppose from our current state we have n possible states, 1, 2, . . . , n, and their exponential rates are λ₁, λ₂, . . . , λₙ (that is, the time required to jump to state 1 is Exponential(λ₁), the time required to jump to state 2 is Exponential(λ₂), and so on). Then, we can view the action of a CTMC as either of the following:

1. Draw proposed jump times τ₁ ~ Exponential(λ₁), τ₂ ~ Exponential(λ₂), . . . , τₙ ~ Exponential(λₙ) and jump to the state that comes up first.

2. Draw a jump time τ ~ Exponential(λ₁ + λ₂ + · · · + λₙ), wait that much time, and jump to a state from the distribution given by P(X_j = k) = λₖ/Σᵢλᵢ.

This also tells us that the time that we stay put is distributed according to Exponential(Σᵢλᵢ), which means the mean time is 1/(λ₁ + λ₂ + · · · + λₙ): the higher all the outgoing rates are, the less time before we jump.

→ Self-Loops

You may have noticed that Figure 2 lacks self-loops, i.e. the idea from DTMCs of a state transitioning to itself. However, since we don't have fixed time steps any more, this concept does not translate to CTMCs. Since we're not 'forced' to ever move, a state transitioning to itself is just the same as nothing happening.

However, the timescale on which 'nothing' happens is still meaningful: as we just saw, the time for which we stay in the state we're currently in is distributed according to Exponential(Σᵢλᵢ), and so the rate at which we transition from a state to any other state is Σᵢλᵢ. In the rate matrix, we'll denote this by -Σᵢλᵢ, to indicate that it's the rate of entering a state rather than leaving it.

## Chapter 3
### Rate Matrix, Stationary Distributions, and Hitting Times

→ Basic Definitions

We now define what exactly a CTMC is. Concretely, we start with some set of states X, along with some initial probability distribution over X. Our random process is then defined by a rate matrix Q ∈ ℝ^{|X|×|X|} where

Q(i, j) ≥ 0    ∀i ≠ j
Σⱼ Q(i, j) = 0

The above in particular implies that Q(i, i) = -Σⱼ≠ᵢ Q(i, j).

Example 1. We could have

Q = [-4  3  1]
    [ 0 -2  2]
    [ 1  1 -2]

and this would be a perfectly valid rate matrix for a CTMC with |X| = 3 (three states). (Note: This follows the convention in Walrand's book, not Bertsekas).

More generally, our rate matrix Q looks like:

Q = [-Σⁿᵢ₌₁,ᵢ≠₁ λ₁→ᵢ    λ₁→₂    ...    λ₁→ₙ]
    [λ₂→₁    -Σⁿᵢ₌₁,ᵢ≠₂ λ₂→ᵢ    ...    λ₂→ₙ]
    [...    ...    ...    ...]
    [λₙ→₁    λₙ→₂    ...    -Σⁿᵢ₌₁,ᵢ≠ₙ λₙ→ᵢ]

where each λ represents the rate at which we follow a particular edge, which is an exponential random variable (i.e. the first arrival of a Poisson process, if you're familiar with that). For simplicity, we denote

qᵢ = Σⁿⱼ₌₁,ⱼ≠ᵢ λᵢ→ⱼ = -Q(i, i)

Where the last equality follows from the definition of the rate matrix. Let's make sure our setup does actually satisfy the Markov property, at least at a small enough time scale. To see why the continuous time analog we have constructed might satisfy something like this property we have to first recall an important property of exponentials. Suppose Y ~ Exponential(λ). Then we have that

P(Y ≥ ε) = e^{-λε} = 1 - λε + o(ε),

where we have used the taylor series expansion of e^x and used the "little-o" notation, which just refers the set of functions such that:

lim_{ε→0} o(ε)/ε = 0.

For example, ε² ∈ o(ε). Why does this property of exponential RVs matter? Suppose we are at state i with holding rate qᵢ. Then we have

1. no transitions happen with probability 1 - qᵢε + o(ε) or
2. 1 transition happens with probability qᵢε + o(ε)
3. 2 or more transitions happen with negligible probability o(ε).

In the context of our CTMCs, it means we have the following property:

Proposition 1.
P(X_{t+ε} = j|X_t = i; X_u, u < t) = {εQ(i, j) + o(ε)    i ≠ j
                                       {1 + εQ(i, i) + o(ε)    i = j

What the above tells us is that our CTMCs satisfy the Markov property, provided ε is small enough. Why is the above true? We saw above that for small enough ε, the probability that we observe two or more "jumps" or "transitions" in our process is negligibly small. Also recall that if we have independent Y₁ ~ Exponential(λ₁), ..., Yₙ ~ Exponential(λₙ), then

min_i Yᵢ ~ Exponential(Σⁿᵢ₌₁ λᵢ).

This tells us that our holding time at state i, or the amount of time we wait before transitioning to a new state from state i, is also exponentially distributed with rate λ = Σⱼ≠ᵢ Q(i, j) = -Q(i, i). Recall that we also proved in the homework that

P(min_i Yᵢ = Yⱼ) = λⱼ/Σᵢλᵢ.

The above facts tell us that

P(X_{t+ε} = j|X_t = i; X_u, u < t) = P(we leave state i)P(we go to state j|we leave state i)
                                     ≈ ε(-Q(i, i)) · Q(i, j)/(-Q(i, i)) = εQ(i, j),

where in the above we have omitted the o(ε) terms for clarity. We conclude this section by noting that a Poisson process can be modeled very simply as a CTMC:

Remark 1. If we have a PP(λ), we can model it as a CTMC with states 1 → 2 → 3 → ... with each transition having rate λ.

→ Stationary Distributions and Hitting Times

Now we are ready to discuss stationary distributions. Recall that for DTMCs, we were interested in solving for π such that π = πP, where P was our transition probability matrix. However, in the context of CTMCs, we instead need to solve for

πQ = 0,
Σᵢ πᵢ = 1.

One might wonder, why the change? For DTMCs, the whole reason we formulated the original equation was just to encode the notion that the probability mass going into and coming out of any given state i remains consistent when we are in the stationary distribution:

πᵢ = Σⱼ∈X P(j, i)πⱼ

Here, we don't have probabilities, but rather want to make sure that the combined rates going into a state equals the combined rate going out of the state. Intuitively, this will ensure that when our chain is in stationarity, the amount of probability mass that remains in any given state remains roughly the same:

∀i, πᵢ · (-Q(i, i)) = Σⱼ≠ᵢ λⱼ→ᵢπⱼ ⟺ πQ = 0.

Therefore, solving for our stationary distribution just boils down to solving πQ = 0.

Exercise 1 (B&T 7.14). Say our application has a normal state (1) and a test state (2) and a repair state (3) with transitions 1 → 2 with rate 1, 2 → 1 with rate 2.5, 2 → 3 with rate 2.5, and 3 → 1 with rate 3.

What is the stationary distribution of this Markov Chain? Note we have

Q = [-1   1   0]
    [2.5 -5  2.5]
    [3    0  -3]

Write out the balance equations, either by examining πQ = 0 or by just looking at the "rate in = rate out" for each state. Show that

π = (30/41, 6/41, 5/41).

The last fundamental thing we have to worry about is solving hitting time problems using first step equations. It is very analogous to solving hitting time problems with DTMCs. Can you guess what the differences will be? Recall that when we set up our FSEs in the context of DTMCs, we had to remember to add 1 to every equation to take into account our discrete time intervals going by. In the context of CTMCs, this no longer makes sense, and instead we have to consider the expected holding time we stay in a given state before jumping. This is exactly 1/(-Q(i,i)) = 1/qᵢ. This concept is best illustrated by example:

Example 2. Consider 20 lightbulbs that have indep. lifetimes that are exponentially distributed with rate 1 (month). How long before all the bulbs die out?

We can model this with 21 states, corresponding to the number of lightbulbs still alive. We transition from state 20 to state 19 with rate 20 (min of 20 exponentials!), and from 19 to 18 with rate 19, and so on (draw the Markov chain if it's not clear!). How long does it take for us to get to zero? We have to come up with first step equations. The biggest difference is that we are not transitioning after 1 time step now, we are transitioning on average after 1/qᵢ amount of