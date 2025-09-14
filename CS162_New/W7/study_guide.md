# CS162 Operating Systems and Systems Programming
## Lecture 12: Scheduling - Linux Schedulers and Fair Sharing

### Goals for Today
Understanding Linux scheduler implementations and proportional fair sharing mechanisms, specifically:
→ Linux scheduler evolution and design
→ Proportional fair sharing concepts
→ Linux EEVDF scheduler

### 12.1 Scheduler Design Goals

What we want from schedulers:
1. Minimize average waiting time for IO/interactive tasks (tasks with short CPU bursts)
2. Minimize average completion time
3. Maximize throughput (includes minimizing context switches)
4. Remain fair/starvation-free

### 12.2 History of Linux Schedulers

**O(n) scheduler** (Linux 2.4 to Linux 2.6)
→ Scans full list of processes in ready queue at every context switch
→ Computes priority score for each process
→ Selects best process to run
→ Problem: scalability with more threads & multicore CPUs

**O(1) scheduler** (Linux 2.6 to 2.6.22)
→ Next process chosen in constant time
→ Priority-based with 140 different priorities
→ Real-time/kernel tasks: priorities 0-99 (0 is highest)
→ User tasks: priorities 100-139 (set via "nice" command, values -20 to 19)

Per priority-level, each CPU has two ready queues:
→ Active queue: processes which have not used up time quanta
→ Expired queue: processes who have

Priority adjustment for user tasks:
→ Adjusted ±5 based on heuristics
→ p->sleep_avg = sleep_time - run_time
→ Higher sleep_avg indicates more I/O bound task
→ Interactive Credit earned when task sleeps long, spent when runs long
→ Problem: Very complex to reason about and tune

**Completely Fair Scheduler (CFS)** (Linux 2.6.23 to 6.6)

**EEVDF scheduler** (Linux 6.6 onwards)

### 12.3 Proportional Fair Sharing

Different approach from traditional scheduling:
→ Share CPU proportionally to per-job "weights"
→ Give each job share of CPU according to priority
→ Low-priority jobs run less often
→ All jobs make progress (no starvation)
→ Originated in networking
→ Maintains global property (fairness) instead of reasoning about queues and priorities

**Fair Sharing Variants:**
→ Basic: n users each get 1/n of shared resource
→ Max-min fairness: handles case where user needs less than fair share
→ Weighted/proportional max-min fairness: assigns weights based on importance

### 12.4 Early Proportional Sharing Approaches

**Lottery Scheduling:**
→ Give each job lottery tickets (≥1)
→ On each time slice, randomly pick winning ticket
→ On average, CPU time proportional to number of tickets
→ Running time: O(1)
→ Can suffer temporary unfairness
→ Cannot lead to starvation or priority inversion

**Stride Scheduling:**
→ Deterministic proportional fair sharing
→ Stride of each job = (big number W) / Ni
→ Larger share of tickets Ni means smaller stride
→ Each job has pass counter
→ Scheduler picks job with lowest pass, runs it, adds stride to pass
→ Low-stride jobs (lots of tickets) run more often

Complications:
→ What to do when job doesn't use full time slice?
→ What to do when jobs arrive or leave?
→ Long delays until job is rescheduled

### 12.5 Fluid Flow Model and GPS

**Fluid Flow Model (Generalized Processor Sharing):**
→ Assumes infinitely fine-grained context switching
→ After every instruction (CPU) or bit sent (network)
→ Proportional fair sharing via weighted bit-by-bit round-robin
→ During each round, client does work units equal to its weight

**Weighted Fair Queueing (WFQ):**
→ Select packet that finishes first in GPS assuming no future arrivals
→ Packet approximation of GPS
→ Finish time in WFQ at most q + finish time in GPS (q = max time quantum)

Implementation challenge: 
→ Need to compute finish time in fluid flow system
→ Finish time may change as new packets arrive
→ Very expensive with 1000s of clients

### 12.6 Virtual Time Solution

**Key observation:** While finish times may change when new packet arrives, order doesn't change!

**Solution:** Track virtual finish time instead of actual finish time
→ Number of rounds needed to send remaining bits in GPS
→ Virtual finish time = (length of packet) / wi
→ System virtual time = index of current round in weighted bit-by-bit round-robin

**System Virtual Time V(t):**
→ Measures total bit-by-bit round-robin rounds served
→ V(t) slope = C/N(t)
→ C: resource capacity
→ N(t): total weight of backlogged clients at time t

**WFQ Implementation:**
→ Virtual finish time of packet k+1: Fi^(k+1) = max(V(ai^(k+1)), Fi^k) + Li^(k+1)/wi
→ Maintain red-black tree of runnable processes sorted by virtual finish time
→ Always schedule process with earliest virtual finish time

### 12.7 Early Eligible Virtual Deadline First (EEVDF)

**Problem EEVDF solves:** Minimize lag between service received in real system vs fluid flow system
→ WFQ can have worst case lag O(n)*q
→ Red client with 1/2 resource capacity can be denied service for n slots

**EEVDF Solution:**
→ Schedule only eligible processes (virtual arrival time <= current virtual time)
→ Among eligible, pick earliest deadline
→ Achieves lag <= O(1)*q (independent of number of clients)

**Configuring "Packet Lengths":**
→ Tasks specify preferred time slice via sched_setattr()
→ Developers can request interactive tasks be scheduled faster
→ Cannot "cheat" to get more total CPU time with smaller slice

**Implementation in Kernel:**
→ Track lag in virtual time for each task
→ Only tasks with lag ≥ 0 are eligible
→ Compute virtual deadline = eligible_vtime + vtime_slice
→ Store in sorted red-black tree
→ Schedule task with lowest deadline

**Handling Sleeping Tasks:**
→ Remember lag when task sleeps (e.g., on I/O)
→ Return with that lag when wakes up
→ Linux decays lag after time to prevent arbitrary delays

**Nice Values to Weights:**
→ Each priority level is 1.25x weight of next lower
→ weight = 1024 / 1.25^nice

### 12.8 Comparison Summary

Proportional Sharing Algorithm Performance (n = clients, q = max quantum):

**Lottery scheduling:**
→ Scheduler complexity: O(1)
→ Finish time delay: O(sqrt(n))*q average
→ Lag: O(sqrt(n))*q average

**Stride scheduling:**
→ Scheduler complexity: O(log(n))
→ Finish time delay: O(log(n))*q
→ Lag: O(log(n))*q

**WFQ:**
→ Scheduler complexity: O(log(n))
→ Finish time delay: q
→ Lag: O(n)*q

**EEVDF:**
→ Scheduler complexity: O(log(n))
→ Finish time delay: q
→ Lag: O(1)*q

### 12.9 Multicore and Gang Scheduling

**Multicore Scheduling:**
→ Algorithmically similar to single-core
→ Per-core scheduling data structures for cache coherence
→ Affinity scheduling: reschedule thread on same CPU for cache reuse

**Gang Scheduling:**
→ Schedule cooperating threads together on multi-core
→ Makes spin-waiting efficient
→ OS informs parallel programs of processor allocation (Scheduler Activations)
→ Application adapts to available cores
→ Space sharing can be efficient due to sublinear parallel speedup

---

# CS162 Operating Systems and Systems Programming
## Lecture 13: Fair Scheduling Continued & Deadlock

### Goals for Today
→ Proportional fair sharing and Linux EEVDF (continued)
→ Deeper understanding of deadlock

### 13.1 Proportional Fair Sharing Review

Share CPU proportionally to per-job "weights":
→ Each job gets CPU share according to priority
→ Low-priority jobs run less often but make progress
→ No starvation
→ Maintains global fairness property

Fair sharing variants handle different scenarios:
→ Basic: equal sharing (1/n each)
→ Max-min: when users need less than fair share
→ Weighted: importance-based allocation

### 13.2 Fair Sharing Algorithms Review

**Lottery Scheduling:**
→ Lottery tickets assigned to jobs
→ Random winner selection each time slice
→ O(1) runtime
→ Average CPU time proportional to tickets

**Stride Scheduling:**
→ Deterministic with stride = W/Ni
→ Pass counter advanced by stride
→ Challenges with sleeping/joining/leaving jobs

### 13.3 Virtual Time and WFQ

**Fluid Flow Model (GPS):**
→ Infinitely fine-grained context switching
→ Weighted bit-by-bit round-robin

**Virtual Time Solution:**
→ Track rounds needed instead of finish times
→ Order doesn't change when packets arrive
→ System virtual time V(t) increases inversely to total weight

**WFQ Implementation:**
→ Compute virtual finish time for new work
→ Red-black tree sorted by virtual finish time
→ Schedule earliest virtual finish time

### 13.4 EEVDF Algorithm

**Problem:** WFQ can have O(n) lag vs fluid flow system
→ High-weight clients denied service for n slots

**EEVDF Solution:**
→ Schedule only eligible processes (virtual arrival <= current virtual time)
→ Pick earliest deadline among eligible
→ Achieves O(1) lag independent of client count

**Implementation Details:**
→ Track lag in virtual time
→ Compute virtual deadline for eligible tasks (lag ≥ 0)
→ Red-black tree maintains sorted order
→ Schedule lowest deadline

**Packet Length Configuration:**
→ Tasks specify preferred slice via sched_setattr()
→ Cannot cheat for more total CPU time
→ Enables faster scheduling of interactive tasks

### 13.5 Understanding Deadlock

**Deadlock:** Cyclic waiting for resources
→ Thread A owns Res 1, waits for Res 2
→ Thread B owns Res 2, waits for Res 1
→ System stuck in circular dependency

**Deadlock vs Starvation:**
→ Deadlock implies starvation
→ Starvation doesn't imply deadlock
→ Starvation can end (but doesn't have to)
→ Deadlock cannot end without external intervention

### 13.6 Deadlock Examples

**Bridge Crossing Example:**
→ Single-lane bridge, traffic from both directions
→ Cars must own segment underneath
→ Must acquire segment moving into
→ Bridge allows traffic one direction at time
→ Circular waiting creates deadlock

**Lock-based Deadlock:**
Thread A: x.Acquire(); y.Acquire(); ... y.Release(); x.Release();
Thread B: y.Acquire(); x.Acquire(); ... x.Release(); y.Release();
→ Non-deterministic deadlock possible
→ Sometimes schedule avoids deadlock

**Dining Computer Scientists:**
→ Five chopsticks, five scientists
→ Need two chopsticks to eat
→ Free-for-all leads to deadlock
→ External intervention needed

### 13.7 Four Requirements for Deadlock

1. **Mutual exclusion and bounded resources:**
   Only one thread can use resource at time

2. **Hold and wait:**
   Thread holding resource waits for additional resources

3. **No preemption:**
   Resources released only voluntarily after use

4. **Circular wait:**
   Set {T1, ..., Tn} where Ti waits for resource held by T(i+1)

### 13.8 Detecting Deadlock

**Resource-Allocation Graph:**
→ Vertices: threads T and resources R
→ Request edge: Ti → Rj
→ Assignment edge: Rj → Ti
→ Cycle may indicate deadlock

**Detection Algorithm:**
→ Track FreeResources, RequestT, AllocT vectors
→ Simulate if threads can terminate
→ Start with Avail = FreeResources
→ Find threads whose requests <= Avail
→ Release their resources, update Avail
→ Threads remaining in UNFINISHED are deadlocked

### 13.9 Dealing with Deadlock

**Four approaches:**

1. **Deadlock prevention:** Write code to avoid deadlock conditions
2. **Deadlock recovery:** Let deadlock happen, then recover
3. **Deadlock avoidance:** Dynamically delay requests to prevent deadlock
4. **Deadlock denial:** Ignore possibility of deadlock

### 13.10 Deadlock Prevention Techniques

**Fix Condition 1 (Mutual Exclusion):**
→ Provide sufficient resources
→ Example: virtual memory provides "infinite" space

**Fix Condition 2 (Hold and Wait):**
→ Acquire all resources atomically
→ Acquire_both(x, y) instead of separate acquisitions

**Fix Condition 3 (No Preemption):**
→ Force thread to give up resource
→ Common in databases (transaction aborts)
→ Wireless networks: collision detection and retry

**Fix Condition 4 (Circular Wait):**
→ Force all threads to request resources in same order
→ Example: always acquire lower-numbered resource first

### 13.11 Deadlock Avoidance

**Three States:**
→ Safe state: Can delay acquisition to prevent deadlock
→ Unsafe state: No deadlock yet, but unavoidable
→ Deadlocked state: Deadlock exists

**Banker's Algorithm:**
→ Ensures system never enters unsafe state
→ Evaluate each request, grant if deadlock-free ordering exists
→ Pretend request granted, run detection algorithm
→ Uses Max allocation instead of current Request
→ If safe after grant, allow; if unsafe, delay

Algorithm modification for avoidance:
→ Check if ([Maxthread] - [Allocthread] <= [Avail])
→ Instead of ([Requestthread] <= [Avail])
→ Ensures threads can complete with maximum possible requests

### 13.12 Summary

**Deadlock Key Points:**
→ Deadlock implies starvation, not vice versa
→ Four necessary conditions must all be present
→ Prevention eliminates one condition
→ Recovery handles after occurrence
→ Avoidance dynamically prevents unsafe states
→ Banker's algorithm maintains system safety

**Scheduler Evolution:**
→ O(n) → O(1) → CFS → EEVDF
→ From simple scanning to complex heuristics
→ Now proportional fair sharing with low lag
→ EEVDF provides predictable, fair scheduling with minimal complexity