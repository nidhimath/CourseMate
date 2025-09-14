# CS162 Operating Systems and Systems Programming
## Lecture 10 & 11: Scheduling - Core Concepts and Classic Policies

→ **Goals for Today**

Understanding scheduling fundamentals
What makes a good scheduling policy
Examining existing schedulers and their performance

→ **The Scheduling Loop**

Core scheduling decisions:
1. Which task to run next
2. How frequently does the loop run
3. What happens if run never returns

```
if (readyThreads(TCBs)) {
    nextTCB = selectThread(TCBs);
    run(nextTCB);
} else {
    run_idle_thread();
}
```

→ **Thread Life Cycle**

States: Running → Ready → Blocked → Dying
Transitions triggered by:
- Time slice expiration
- I/O requests
- Fork/yield operations
- Interrupt occurrences

→ **Important Performance Metrics**

**Response time (latency)** - User-perceived time to complete task
**Throughput** - Rate at which tasks are completed  
**Scheduling overhead** - Time to switch between tasks
**Predictability** - Variance in response times
**Fairness** - Equality in performance perceived by tasks
**Starvation** - Lack of progress due to resource allocation

→ **Scheduling Policy Goals**

Minimize latency
Maximize throughput
Remain fair and starvation-free

→ **Useful Metrics**

**Waiting time for P** - Total time spent waiting for CPU
**Average waiting time** - Average of all processes' wait time
**Response time for P** - Time to when process gets first scheduled
**Completion time** - Waiting time + Run time
**Average completion time** - Average of all processes' completion time

→ **Core Assumptions**

Threads are independent (one thread = one user)
Only work-conserving schedulers (never leave processor idle if work exists)

→ **Workload Types**

**Compute-Bound** - Primarily perform compute, fully utilize CPU
**I/O Bound** - Mostly wait for I/O, limited compute in bursts, often blocked

## Classic Scheduling Policies

→ **First-Come, First-Served (FCFS)**

Run tasks in order of arrival
Run until completion (or blocks on I/O)
No preemption

Example with P1(3), P2(3), P3(24):
- Order P1→P2→P3: Average completion = 13, Average waiting = 3
- Order P3→P2→P1: Average completion = 27, Average waiting = 17

**The Convoy Effect**
Short processes stuck behind long processes
Lots of small tasks build up behind long tasks
FCFS is non-preemptible

**FCFS Summary**
Good: Simple, low overhead, no starvation*
Bad: Sensitive to arrival order (poor predictability)
Ugly: Convoy effect, bad for interactive tasks
*Assuming jobs eventually finish

→ **Shortest Job First (SJF)**

Schedule jobs by estimated completion time
Minimizes average completion time if all jobs arrive simultaneously

Example with P1(3), P2(6), P3(24), P4(1):
Order P4→P1→P2→P3: Average completion = 12.25

**SJF Issues**
Can lead to starvation - always favoring short jobs
Subject to convoy effect - non-preemptible
Requires knowing job duration

**SJF Summary**
Good: Optimal average completion time (simultaneous arrival)
Bad: Still subject to convoy effect
Ugly: Can lead to starvation, requires job duration knowledge

→ **Shortest Time to Completion First (STCF)**

Introduces preemption
Schedule task with least time remaining
De-schedules running tasks before completion

**STCF Summary**
Good: Optimal average completion time always
Bad: -
Ugly: Can lead to starvation, requires job duration knowledge

→ **Round-Robin (RR)**

Runs job for time slice (scheduling quantum)
After time slice, switch to next job in ready queue
Time-slicing approach

Example with quantum = 20:
P1(53), P2(8), P3(68), P4(24)
Schedule: P1→P2→P3→P4→P1→P3→P4→P1→P3→P3
Average waiting = 66.25, Average completion = 104.25

**Time Quantum Effects**
Smaller quantum → Better response time, worse completion time
Larger quantum → Better completion time, worse response time
Must be large relative to context switch overhead

**Context Switching Overhead**
Mode switch overhead
Cache state thrashing
Quantum must exceed context switch time

**RR Summary**
Good: Bounded response time, no starvation, no convoy effect
Bad: High completion time (stretches long jobs)
Ugly: Context switching overhead

→ **Performance Comparison**

FCFS vs RR with 10 jobs (100s each), quantum = 1s:
- FCFS completion times: 100, 200, ..., 1000
- RR completion times: 991, 992, ..., 1000

## Advanced Scheduling

→ **Priorities**

Jobs assigned priority levels
Higher priority jobs scheduled first
Should get larger CPU share

**Strict Priority Scheduling**
n different priority queues
Always process highest-priority non-empty queue
Process each queue round-robin
Can lead to starvation

**Priority Inversion**
High-priority thread blocked waiting on low-priority thread
Low-priority holds resource needed by high-priority
Medium-priority can starve high-priority

**Priority Donation/Inheritance**
High-priority temporarily grants priority to low-priority
Allows low-priority to release needed resources

→ **Multi-Level Feedback Queue (MLFQ)**

Creates distinct queues with different priority levels
Jobs belong to one queue at a time
Jobs can move between queues
Individual queues run RR with increasing time quanta

**MLFQ Rules (Version 2.0)**

Rule 1: If Priority(A) > Priority(B), A runs
Rule 2: If Priority(A) = Priority(B), run RR
Rule 3: New jobs start at highest priority
Rule 4: Job using full time allotment drops priority
Rule 5: After period S, move all jobs to top queue

**Learning Behavior**
Assumes all jobs short initially
I/O-bound jobs stay at high priority
CPU-bound jobs drop to lower priorities
Emulates STCF without knowing job duration

**MLFQ Issues and Solutions**
Gaming: Insert I/O before quantum expires
Solution: Track total time at priority level

Starvation: High-priority queues favored
Solution: Periodic priority boost (Rule 5)

## Linux Schedulers

→ **History**

O(n) scheduler: Linux 2.4 to 2.6
O(1) scheduler: Linux 2.6 to 2.6.22
Completely Fair Scheduler (CFS): Linux 2.6.23 to 6.6
EEVDF scheduler: Linux 6.6 onwards

→ **O(n) Scheduler**

Scans full ready queue at context switch
Computes priorities dynamically
Single queue even on multicore
Scalability issues with process count

→ **O(1) Scheduler**

Constant time process selection
140 priority levels:
- Kernel/real-time: 0-99 (0 highest)
- User tasks: 100-139 (100 highest)

Per-CPU dual ready queues:
- Active queue: processes with remaining quanta
- Expired queue: processes with exhausted quanta

Priority adjustment ±5 based on sleep_avg heuristic
Interactive credit for I/O-bound behavior

→ **Real-Time Scheduling**

Goal: Predictability of performance
Real-time tasks preempt non-RT tasks
No dynamic priority adjustment

Schemes:
- SCHED_FIFO: Preempts others, no timeslice limit
- SCHED_RR: Round-robin among same priority

Real-time equals predictability, not fast computing