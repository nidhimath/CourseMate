# Hidden Markov Models

EECS 126 (UC Berkeley)  
Spring 2019

A Markov Chain that has its states hidden (or latent) is called a Hidden Markov Model (HMM). The Xi are state variables and belong to a state space X (discrete), while the Yi are observations with yi ∈ Y, where Y may or may not be discrete.

The graphical model shows hidden states x0, x1, x2, ..., xn connected sequentially, with corresponding observations y0, y1, y2, ..., yn below each state.

Due to the structure of the HMM as indicated by the graphical model, we can simplify our probabilities a lot. This will be very useful!

**Example:** If we had n = 2, then the joint probability P(x0, y0, x1, y1) would be

P(x0, y0, x1, y1) = P(x0)P(y0|x0)P(x1|x0, y0)P(y1|x1, x0, y0) = P(x0)P(y0|x0)P(x1|x0)P(y1|x1).

In general, for n states and corresponding observations (excluding state 0), we have

P(x0, x1, ..., xn, y0, y1, ..., yn) = π0(x0)Q(x0, y0)P(x0, x1)Q(x1, y1) ... P(xn-1, xn)Q(xn, yn)

where π0 specifies the distribution for our initial state, Q models our transition probabilities between hidden states and observations, and P models transitions between hidden states.

HMMs can be used for inference in the following forms.

→ **Filtering:** We feed in Y0, Y1, ..., YT to our filter and want to find X̂T, the last hidden state. Some examples are tracking positions in real time or monitoring the current health of a patient given symptoms {Y0}Ti=0.

→ **Prediction:** We feed in Y0, Y1, ..., YT and want to predict ŶT+1. Some examples are radar tracking, stock price predictions, or predictive coding.

→ **Smoothing:** We feed in Y0, Y1, ..., YT and want to find X̂t for a choice of t ≤ T. Some examples are inferring the cause of a car-crash or "post-mortem" analysis.

→ **MLSE (Maximum Likelihood Sequence Estimation):** We feed in Y0, Y1, ..., YT and want to find the most likely sequence X̂0, X̂1, ..., X̂T that explains our observations. In other words, we want MAP[Xn|Yn = yn], to infer the best sequence of (hidden) states that best explains the observed sequence. This differs from smoothing, where we only care about maximizing over a single hidden state.

Some example applications of finding the MLSE are speech recognition, auto-correction, and convolutional coding with the Viterbi algorithm. In speech recognition, we observe (or listen to) the sounds, and our goal is to find the most likely sequence of words corresponding to the sounds.

In this note, we will focus on MLSE.

## The Viterbi Algorithm

The MLSE is given by

xn* = arg maxxn∈Xn P[Xn = xn|Yn = yn]

= arg maxxn∈Xn [π0Q(x0, y0)P(x0, x1)Q(x1, y1) ... P(xn-1, xn)Q(xn, yn)]

= arg maxxn∈Xn [log π0(x0)Q(x0, y0) + Σm=1n log[P(xm-1, xm)Q(xm, ym)]]

where the last equation is obtained by taking a log (which is allowed because log is a monotonically increasing function). To make the expression more compact, let's define

d0(x0) = -log π0(x0)Q(x0, y0)

dm(xm-1, xm) = -log[P(xm-1, xm)Q(xm, ym)]

Note that all the di's are positive. Thus, we have the following.

**MLSE Estimate:** Finding the maximum likelihood sequence estimate reduces to solving the following optimization problem:

xn* = arg minxn [d0(x0) + Σm=1n dm(xm-1, xm)]

**Example:** Say you're at a "nearly honest casino" which uses a fair die most of the time, but switches to a loaded die occasionally. We can model their transitions between the fair die (F) and the loaded die (L) as a Markov Chain with transition probabilities: F→F: 0.95, F→L: 0.05, L→F: 0.1, L→L: 0.9.

Additionally, we know that for the fair die, the probability of each outcome is equally likely, so P(F = i) = 1/6 for i = 1, ..., 6. For the loaded die, we know that P(L = 6) = 1/2 and P(L = 1) = ... = P(L = 5) = 1/10 so that the die is biased towards rolling a 6.

Given an observed sequence of die rolls (say 6, 6, 1, 6, 2, ...), we want to infer the most likely sequence of "hidden" states (say F, F, L, F, L, ...). We can use a technique called a "trellis" diagram, where green nodes correspond to the fair die and red nodes correspond to the loaded die.

Each stage m-1 to m in the trellis has four possible transitions: dm(F, F), dm(F, L), dm(L, F), and dm(L, L).

To find the minimum length path from stage 0 to stage n, we need a good shortest path algorithm. Bellman-Ford seems like a good choice, especially since its dynamic programming nature lends itself very well to such a calculation (recall that shortest paths on DAGs are best solved by dynamic programming). This technique of filling out the diagram and finding the MLSE using a dynamic programming method was first discovered by Viterbi and is referred to as the Viterbi Algorithm.

First, we need to calculate the edge weights, that is, all the dm's. We perform the following computation for each m, where the P's are given by the Markov chain and the Q's are given by the probabilities of each side for the fair and loaded die:

dm(F, F) = -log[P(F, F)Q(F, Ym+1)]

dm(F, L) = -log[P(F, L)Q(L, Ym+1)]

dm(L, F) = -log[P(L, F)Q(F, Ym+1)]

dm(L, L) = -log[P(L, L)Q(L, Ym+1)]

The circled numbers above each stage are the observations, and the numbers in parentheses along every edge are the weights. The boxed numbers are the shortest path values from that node to the final stage; green numbers represent transitions to a fair die, while red numbers represent transitions to a loaded die. Our initial transition from the origin to L has distance infinity because we're told that the casino will start with a fair die.

If we work our way back through the diagram, we see that the MLSE estimate is (F, F, L, F, L).

Finally, we can do a quick analysis of how much time each of these methods take. The cost of populating the trellis is O(N²n), where N is the number of states and n is the number of stages. If we have a populated trellis, it only takes O(Nn) to find the shortest path (since we only have one node at each stage to consider). In contrast, a naive algorithm that iterates over all possible sequences takes O(Nⁿ) time; we have turned a computationally infeasible problem into a pretty efficient one!