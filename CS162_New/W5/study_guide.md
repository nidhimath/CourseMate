# CS162: Operating Systems and Systems Programming
## Lecture 9: Monitors (Continued) and Scheduling

### Hardware-Based Synchronization
The synchronization hierarchy shows implementation of higher-level primitives using atomic operations:
- **Hardware level**: Load/Store, Disable Interrupts, Test&Set, Compare&Swap
- **Higher-level API**: Locks, Semaphores, Monitors, Send/Receive
- **Programs**: Shared programs using the higher-level APIs

### Monitors

#### Core Concepts
A monitor combines a lock with zero or more condition variables for managing concurrent access to shared data. It represents a paradigm for concurrent programming - some languages like Java provide this natively, while most others use actual locks and condition variables.

#### Wait & Signal Pattern
The basic pattern involves acquiring a lock, checking conditions with while loops, waiting on condition variables if necessary, and signaling when making changes:

```
acquire(&buf_lock);
while (isEmpty(&queue)) {
  cond_wait(&buf_CV,&buf_lock); 
}
// ... critical section ...
release(&lock);
```

#### Hoare vs Mesa Semantics

**Hoare Semantics**:
1. When calling signal, handover lock to waiting thread
2. Waiting thread gets immediately scheduled (nothing can run in between)
3. Thread eventually releases lock

**Mesa Semantics** (more common):
1. When calling signal, keep lock and place waiting thread on READY queue (no special priority)
2. Signaling thread eventually releases lock
3. Waiting thread eventually gets scheduled and acquires lock (other threads may run in between)
4. This is why Mesa monitors use `while` loops instead of `if` statements

### Readers/Writers Problem

#### Problem Definition
Consider a shared database with two classes of users:
- **Readers**: Never modify database
- **Writers**: Read and modify database

Goals:
- Allow multiple readers simultaneously
- Only one writer at a time
- No readers when writer is active

#### Solution Components
State variables (protected by lock):
- `AR`: Number of active readers (initially 0)
- `WR`: Number of waiting readers (initially 0)
- `AW`: Number of active writers (initially 0)
- `WW`: Number of waiting writers (initially 0)
- `okToRead`: Condition variable for readers
- `okToWrite`: Condition variable for writers

#### Implementation Pattern
Basic structure follows the monitor pattern of checking conditions, waiting if necessary, updating state, and signaling when appropriate. The solution prioritizes writers to prevent writer starvation.

### Language Support for Synchronization

#### C/C++ Challenges
C requires explicit lock management with careful attention to all code paths:
- Must release locks before every return statement
- Exception handling in C++ complicates lock management
- Solution: Use lock guards (RAII pattern) in C++

```cpp
std::lock_guard<std::mutex> lock(global_mutex);
// Lock automatically released when guard goes out of scope
```

#### Python
Uses the `with` keyword for automatic acquire/release:
```python
with lock:
    some_var += 1
    # release() called automatically when leaving block
```

#### Java
Every object has an associated lock acquired/released with synchronized methods:
```java
public synchronized void deposit(int amount) {
    balance += amount;
}
```

### Scheduling

#### The Scheduling Loop
```
if (readyThreads(TCBs)) {
    nextTCB = selectThread(TCBs);
    run(nextTCB);
} else {
    run_idle_thread();
}
```

Key questions:
1. Which task to run next?
2. How frequently does this loop run?
3. What happens if run never returns?

#### Performance Metrics

**Key Metrics**:
- **Response time (latency)**: User-perceived time to complete task
- **Throughput**: Rate at which tasks are completed
- **Scheduling overhead**: Time to switch between tasks
- **Predictability**: Variance in response times
- **Fairness**: Equality in performance across tasks
- **Starvation**: Lack of progress due to resource allocation

**Derived Metrics**:
- **Waiting time**: Total time spent waiting for CPU
- **Completion time**: Waiting time + Run time
- **Average waiting/completion time**: Average across all processes

### Classic Scheduling Policies

#### First-Come, First-Served (FCFS/FIFO)
- Run tasks in order of arrival until completion
- No preemption
- **Pros**: Simple, low overhead, no starvation
- **Cons**: Convoy effect (short processes stuck behind long ones), poor for interactive tasks

#### Shortest Job First (SJF)
- Schedule jobs by estimated completion time
- Optimal average completion time when all jobs arrive simultaneously
- **Pros**: Optimal average completion time (for simultaneous arrivals)
- **Cons**: Can lead to starvation, requires knowing job duration

#### Shortest Time to Completion First (STCF)
- Preemptive version of SJF
- Schedule task with least time remaining
- **Pros**: Optimal average completion time always, no convoy effect
- **Cons**: Can lead to starvation, requires knowing job duration

#### Round Robin (RR)
- Run each job for a time quantum, then switch to next
- Time-slicing approach
- **Pros**: Bounded response time, no starvation, no convoy effect
- **Cons**: Can have high completion time, context switching overhead

#### Time Quantum Considerations
- Small quantum → better response time but higher overhead
- Large quantum → lower overhead but approaches FCFS behavior
- Must be large relative to context switch time

### Policy Comparison Summary

| Property | FCFS | SJF | STCF | RR |
|----------|------|-----|------|-----|
| Optimize Average Completion Time | No | Yes* | Yes | No |
| Optimize Average Response Time | No | No | No | Yes |
| Prevent Starvation | Yes | No | No | Yes |
| Prevent Convoy Effect | No | No | Yes | Yes |
| No Oracle Required | Yes | No | No | Yes |

*When all jobs arrive simultaneously

### Key Takeaways
1. No single scheduling policy is perfect for all scenarios
2. Trade-offs exist between response time, completion time, fairness, and overhead
3. Preemption helps avoid convoy effect but adds context switching overhead
4. Knowledge of job duration enables optimization but is often unavailable
5. Real systems often use hybrid approaches combining multiple policies