# CS162: Operating Systems and Systems Programming
## Lecture 7 & 8: Concurrency

### 7.1 Introduction to Concurrency

**→ Correctness with Concurrency**

Threaded programs must work for all interleavings of thread instruction sequences. Cooperating threads are inherently non-deterministic and non-reproducible, making them extremely difficult to debug unless carefully designed.

### 7.2 The Milk Buying Problem

**→ Problem Statement**

Two people need to coordinate buying milk to avoid purchasing too much while ensuring someone buys it when needed.

**x Time-Based Example:**

At 3:00, Person A checks fridge - out of milk
At 3:05, Person A leaves for store
At 3:10, Person A arrives at store; Person B checks fridge - out of milk
At 3:15, Person A buys milk; Person B leaves for store
At 3:20, Person A arrives home with milk; Person B arrives at store
At 3:25, Person B buys milk
At 3:30, Person B arrives home with milk

Result: Too much milk purchased due to lack of coordination.

**→ Desired Correctness Properties**

1. Never more than one person buys milk (mutual exclusion)
2. Someone buys milk if needed (progress)

### 7.3 Solution Attempts Using Atomic Operations

**→ Solution #1: Simple Note**

```
if (noMilk) {
   if (noNote) {
      leave Note;
      buy milk;
      remove Note;
   }
}
```

**x Problem:** Thread can be context switched after checking but before buying milk. This intermittent failure makes debugging extremely difficult.

**→ Solution #1½: Note First**

```
leave Note;
if (noMilk) {
   if (noNote) {
      buy milk;
   }
}
remove Note;
```

**x Problem:** With computers, no one ever buys milk - both threads see note and skip buying.

**→ Solution #2: Labeled Notes**

Thread A and Thread B each leave their own notes before checking for the other's note.

**x Problem:** Possible for neither thread to buy milk if context switches occur at exactly wrong times.

**→ Solution #3: Asymmetric Solution**

Thread A:
```
leave note A;
while (note B) { //X
   do nothing;
}
if (noMilk) {
   buy milk;
}
remove note A;
```

Thread B:
```
leave note B;
if (noNote A) { //Y
   if (noMilk) {
      buy milk;
   }
}
remove note B;
```

This solution is correct under sequential consistency assumptions but is unsatisfactory due to complexity, asymmetry between threads, and busy-waiting.

### 7.4 Hardware Support for Synchronization

**→ Lock-Based Solution**

Using acquire() and release() operations:

```
acquire(&milklock);
if (nomilk)
   buy milk;
release(&milklock);
```

**→ Implementation Approaches**

**1.1 Disabling Interrupts**

Simple but problematic:
- Critical sections might be arbitrarily long
- Doesn't work on multiprocessors
- Can miss important I/O events

Smarter approach with short critical sections:
```
Acquire() {
   disable interrupts;
   if (value == BUSY) {
      put thread on wait queue;
      Go to sleep();
   } else {
      value = BUSY;
   }
   enable interrupts;
}
```

**1.2 Atomic Read-Modify-Write Instructions**

Hardware provides atomic operations:

**test&set:**
```
test&set(&address) {
   result = M[address];
   M[address] = 1;
   return result;
}
```

**compare&swap:**
```
compare&swap(&address, reg1, reg2) {
   if (reg1 == M[address]) {
      M[address] = reg2;
      return success;
   } else {
      return failure;
   }
}
```

### 7.5 Lock Implementation Using Hardware Support

**→ Simple Busy-Waiting Lock**

```
acquire(int *thelock) {
   while (test&set(thelock));
}

release(int *thelock) {
   *thelock = 0;
}
```

**x Problem:** Busy-waiting wastes CPU cycles and causes cache ping-ponging on multiprocessors.

**→ Better Lock with Sleep/Wake**

Only busy-wait to atomically check lock value, then sleep if needed:

```
acquire(int *thelock) {
   while (test&set(guard));
   if (*thelock == BUSY) {
      put thread on wait queue;
      go to sleep() & guard = 0;
   } else {
      *thelock = BUSY;
      guard = 0;
   }
}
```

### 7.6 Linux futex

Fast Userspace Mutex provides kernel sleep functionality:

- FUTEX_WAIT: Sleep if condition holds
- FUTEX_WAKE: Wake up waiting threads

Allows syscall-free operation in uncontended case while falling back to kernel support when needed.

### 8.1 Producer-Consumer Problem

**→ Problem Definition**

Producers put items into shared buffer, consumers remove them. Need synchronization to:
- Prevent producer from adding to full buffer
- Prevent consumer from removing from empty buffer
- Protect buffer integrity

### 8.2 Semaphores

**→ Definition**

Non-negative integer value with atomic operations:
- P() or Down(): Wait for positive value, then decrement
- V() or Up(): Increment value, wake waiting thread

**→ Two Uses**

**1.1 Mutual Exclusion (initial value = 1)**
```
semaP(&mysem);
// Critical section
semaV(&mysem);
```

**1.2 Scheduling Constraints (initial value = 0)**

For thread synchronization and signaling.

**→ Bounded Buffer with Semaphores**

```
Semaphore fullSlots = 0;
Semaphore emptySlots = bufSize;
Semaphore mutex = 1;

Producer(item) {
   semaP(&emptySlots);
   semaP(&mutex);
   Enqueue(item);
   semaV(&mutex);
   semaV(&fullSlots);
}

Consumer() {
   semaP(&fullSlots);
   semaP(&mutex);
   item = Dequeue();
   semaV(&mutex);
   semaV(&emptySlots);
   return item;
}
```

### 8.3 Monitors

**→ Components**

Monitor consists of:
- Lock for mutual exclusion
- Condition variables for scheduling constraints

**→ Condition Variable Operations**

- Wait(&lock): Atomically release lock and sleep
- Signal(): Wake one waiter
- Broadcast(): Wake all waiters

**→ Mesa vs Hoare Semantics**

Mesa (most common):
- Signaler keeps lock and processor
- Waiter placed on ready queue
- Must recheck condition with while loop

Hoare:
- Signaler transfers lock/CPU to waiter
- Waiter runs immediately

**→ Bounded Buffer with Monitor**

```
Producer(item) {
   acquire(&buf_lock);
   while (buffer full) {
      cond_wait(&isNotFull, &buf_lock);
   }
   enqueue(item);
   cond_signal(&isNotEmpty);
   release(&buf_lock);
}

Consumer() {
   acquire(&buf_lock);
   while (buffer empty) {
      cond_wait(&isNotEmpty, &buf_lock);
   }
   item = dequeue();
   cond_signal(&isNotFull);
   release(&buf_lock);
   return item;
}
```

### 8.4 Readers/Writers Problem

**→ Problem Statement**

Multiple readers can access database simultaneously, but writers need exclusive access.

**→ State Variables**

- AR: Active readers
- WR: Waiting readers  
- AW: Active writers
- WW: Waiting writers

**→ Implementation**

Reader checks if safe to read (no active/waiting writers), increments active readers, accesses database, then signals waiting writer if last reader.

Writer checks if safe to write (no active readers/writers), gets exclusive access, then signals waiting writers or broadcasts to waiting readers.

### 8.5 Language Support

**→ C++**

Lock guards with RAII pattern:
```
std::lock_guard<std::mutex> lock(global_mutex);
// Automatically released when out of scope
```

**→ Python**

with statement:
```
with lock:
   some_var += 1
   # Automatically released
```

**→ Java**

synchronized keyword:
```
public synchronized void deposit(int amount) {
   balance += amount;
}
```

Built-in monitor support with wait(), notify(), notifyAll().