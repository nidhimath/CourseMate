# CS162: Operating Systems and Systems Programming

## 5.1 File Descriptors

→ **Introduction to File Descriptors**

All input/output in Linux follows a uniform interface. UNIX offers the same IO interface for all device Input/Output, reading/writing files, interprocess communication, printers, mouse, disk, pipes, and sockets. Everything is a file!

→ **Core Tenants of UNIX/IO Interface**

x **Uniformity** - Same set of system calls (open, read, write, close)

x **Open Before Use** - Must explicitly open file/device/channel

x **Byte-Oriented** - All devices, even block devices, are accessed through byte arrays

x **Kernel Buffered Reads/Writes** - Data is buffered at kernel to decouple internals from application

x **Explicit Close** - Must explicitly close resource

→ **Understanding the File Descriptor**

A file descriptor is a number that uniquely identifies an open IO resource in the OS. It's another index! File descriptors index into a per-process file descriptor table.

Each process maintains its own file descriptor table as part of its process control structure (struct proc in xv6). The file descriptor table contains an array of pointers to open file descriptions (struct file *ofile[NOFILE]).

→ **Table of Open File Description**

Each FD points to an open file description in a system-wide table of open files containing:
- File offset
- File access mode (from open())
- File status flags (from open())
- Reference to physical location (inode)
- Number of times opened

→ **Manipulating File Descriptors**

**Opening and Creating Files:**
```c
int open(const char *filename, int flags, [mode_t mode]);
int creat(const char *filename, mode_t mode);
int close(int filedes);
```

All files explicitly opened via open or create. Return the lowest-numbered file descriptor not currently open for the process. Creates new open file description. Close closes a file descriptor, so that it no longer refers to any file and may be reused.

**Reading and Writing:**
```c
ssize_t read(int filedes, void *buffer, size_t maxsize);
ssize_t write(int filedes, const void *buffer, size_t size);
off_t lseek(int filedes, off_t offset, int whence);
```

→ **Example: File Descriptor Operations**

When a process opens a file, it gets the lowest available file descriptor. The file descriptor points to an entry in the global open file description table. Multiple operations on the same file descriptor share the same file offset, which advances with each read/write operation.

→ **Duplicating File Descriptors**

The dup() system call creates a copy of a file descriptor. Both file descriptors point to the same open file description, sharing the file offset and other attributes. Changes through one descriptor affect the other.

→ **Forking and File Descriptors**

When a process forks, the child process inherits copies of the parent's file descriptors. Both parent and child file descriptors point to the same entries in the global open file description table.

→ **Interprocess Communication: Pipes**

Pipes implement a queue abstraction, implemented as a kernel buffer with two file descriptors - one for writing and one for reading. The pipe() system call allocates two new file descriptors: writes to fileds[1] read from fileds[0]. Pipes block if full or empty.

After last "write" descriptor is closed, pipe is effectively closed - reads return only EOF. After last "read" descriptor is closed, writes generate SIGPIPE signals.

→ **IPC Across Machines: Sockets**

Sockets are an abstraction of two queues, one in each direction. Can read or write to either end. Used for communication between multiple processes on different machines. File descriptors obtained via socket/bind/connect/listen/accept. Still a file - same API/datastructures as files and pipes.

## 5.2 OS Library

→ **Purpose of OS Library**

The OS Library (libc) acts as glue, providing a set of common services between applications and the OS kernel. It serves two main purposes:

x **Improve Programming API** - Minimizes glue code, simulates additional functionality, provides "High Level C API"

x **Performance** - Minimizes cost of syscalls

→ **From File Descriptors to FILE***

FILE* is an OS Library wrapper for manipulating explicit files. Internally contains:
- File descriptor (from call to open)
- Buffer (array)
- Lock (in case multiple threads use the FILE concurrently)

FILE* API operates on streams - unformatted sequences of bytes (text or binary data), with a position.

```c
FILE *fopen(const char *filename, const char *mode);
int fclose(FILE *fp);
```

→ **C High-Level File API**

Character oriented:
```c
int fputc(int c, FILE *fp);
int fputs(const char *s, FILE *fp);
int fgetc(FILE *fp);
char *fgets(char *buf, int n, FILE *fp);
```

Block oriented:
```c
size_t fread(void *ptr, size_t size_of_elements, 
             size_t number_of_elements, FILE *a_file);
size_t fwrite(const void *ptr, size_t size_of_elements,
              size_t number_of_elements, FILE *a_file);
```

Formatted:
```c
int fprintf(FILE *restrict stream, const char *restrict format, ...);
int fscanf(FILE *restrict stream, const char *restrict format, ...);
```

→ **Buffered IO**

FILE* maintains a per-file user-level buffer. Write calls write to buffer - system flushes buffer to disk when full (or on special character). Read calls read from buffer - system reads from disk when buffer empty. Operations on file descriptors are unbuffered & visible immediately.

→ **Performance Benefits**

Syscalls are 25x more expensive than function calls (~100 ns). Buffering minimizes the number of syscalls and amount copied. FILE* operations can be 50x faster than direct syscall operations.

→ **Buffering Pitfalls**

If not careful, buffering can cause inconsistencies. Must use fflush() to ensure data is written. Avoid mixing FILE* and file descriptors - fread() reads a big chunk of file into user-level buffer, potentially reading ahead of what's requested.

## 5.3 Threads and the Thread API

→ **What is a Thread?**

A single execution sequence that represents a separately schedulable task. Virtualizes the processor - each thread runs on a dedicated virtual processor (with variable speed). Infinitely many such processors. Threads enable users to define each task with sequential code but run each task concurrently.

→ **Why Do We Need Threads?**

x **Natural Program Structure** - Simultaneously update screen, fetch new data from network, receive keyboard input

x **Exploiting Parallelism** - Split unit of work into n tasks and process tasks in parallel on multiple cores

x **Responsiveness** - High priority work should not be delayed by low priority work

x **Masking IO Latency** - Continue to do useful work on separate thread while blocked on IO

→ **Thread ≠ Process**

Processes define the granularity at which the OS offers isolation and protection. Threads capture concurrent sequences of computation. Processes consist of one or more threads!

→ **Thread Requirements**

**No protection** - Threads inside the same process are not isolated from each other

**Individual execution** - Threads execute disjoint instruction streams, need own execution context

**Share an address space** - Share IO state (FDs)

**Individual stack** - Each thread needs its own stack, register state (including EIP, ESP, EBP)

→ **Thread Implementation**

Each process has a PCB containing code, data, heap, and file descriptor table. Each thread within the process has its own TCB (Thread Control Block) containing saved registers, stack, and metadata.

→ **User Threads vs Kernel Threads**

**User Threads:**
- One PCB for the process
- Each thread has own TCB stored in heap of process
- Threads in user-space only, invisible to kernel

**Kernel Threads:**
- Each thread has own TCB
- Each thread individually schedulable
- Requires mode switch to switch threads

→ **Threads in Linux**

Everything is a thread (task_struct). Scheduler only schedules task_struct. Processes are containers in which threads execute.

To fork a process: Invoke clone(...)
To create a thread: Invoke clone(CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND, 0)

→ **pThreads API**

```c
int pthread_create(pthread_t *thread, ... 
                   void *(*start_routine)(void*), void *arg);
void pthread_exit(void *value_ptr);
int pthread_yield();
int pthread_join(pthread_t thread, void **value_ptr);
```

→ **Fork-Join Pattern**

Main thread creates (forks) collection of sub-threads passing them args to work on, and then joins with them, collecting results.

→ **Concurrency Challenges**

Protection is at process level. Threads not isolated. Share an address space. Non-deterministic interleaving of threads leads to race conditions.

# CS162: Operating Systems and Systems Programming

## 6.1 Concurrency

→ **What is a Thread?**

A single execution sequence that represents a separately schedulable task. Virtualizes the processor - each thread runs on a dedicated virtual processor (with variable speed). Infinitely many such processors. Threads let users define each task with sequential code but run each task concurrently.

→ **Thread Architecture**

No protection - Threads inside the same process are not isolated from each other

Individual execution - Threads execute disjoint instruction streams, need own execution context  

Share an address space & share IO state (FDs)

Individual stack, register state (including EIP, ESP, EBP)

→ **Threads in Linux**

Everything is a thread (task_struct). Scheduler only schedules task_struct. Processes are containers in which threads execute.

To fork a process: Invoke clone(...)
To create a thread: Invoke clone(CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND, 0)

→ **pThreads API**

```c
int pthread_create(pthread_t *thread, ...
                   void *(*start_routine)(void*), void *arg);
void pthread_exit(void *value_ptr);
int pthread_join(pthread_t thread, void **value_ptr);
int pthread_yield();
```

→ **Fork-Join Pattern**

Main thread creates (forks) multiple sub-threads, passing them args to work on, and then joins with them, collecting results.

## 6.2 Concurrency Challenges

→ **Race Conditions**

Protection is at process level. Threads not isolated. Share an address space. Non-deterministic interleaving of threads causes unpredictable results.

→ **Multiprocessing vs Multiprogramming**

**Multiprocessing** - multiple CPUs  
**Multiprogramming** - multiple jobs or processes  
**Multithreading** - multiple threads per process

Scheduler is free to run threads in any order. Can choose to run each thread to completion or time-slice in big or small chunks.

→ **Example: ATM Bank Server**

Service a set of requests without corrupting database or handing out too much money. 

Without threads, would need event-driven style with complex state management. Threads yield overlapped I/O and computation without "deconstructing" code into non-blocking fragments. One thread per request allows requests to proceed to completion, blocking as required.

→ **The Race Condition Problem**

Shared state can get corrupted when multiple threads access it concurrently:

Thread 1:
```
load r1, acct->balance
add r1, amount1
store r1, acct->balance
```

Thread 2:
```
load r1, acct->balance
add r1, amount2
store r1, acct->balance
```

Different interleavings produce different results.

## 6.3 Atomic Operations and Synchronization

→ **Atomic Operations**

An operation that always runs to completion, or not at all. It is indivisible: cannot be stopped in the middle, and state cannot be modified by someone else in the middle. Fundamental building block - without atomic operations, threads have no way to work together.

On most machines, memory references and assignments (loads and stores) of words are atomic. Many instructions are not atomic (e.g., double-precision floating point store).

→ **Synchronization Definitions**

**Synchronization** - Using atomic operations to ensure cooperation between threads

**Mutual Exclusion** - Ensuring that only one thread does a particular thing at a time

**Critical Section** - Piece of code that only one thread can execute at once

→ **Locks**

Prevents someone from doing something. Lock() before entering critical section and before accessing shared data. Unlock() when leaving, after accessing shared data. Wait if locked. All synchronization involves waiting.

→ **API for Locks**

Allocation and initialization:
```c
struct Lock mylock;
// or
pthread_mutex_t mylock;
lock_init(&mylock);
// or
mylock = PTHREAD_MUTEX_INITIALIZER;
```

Atomic operations:
```c
acquire(&mylock); // wait until lock is free; then mark as busy
release(&mylock); // mark lock as free
```

→ **Fix Banking Problem with Locks**

```c
Deposit(acctId, amount) {
   acquire(&mylock);      // Wait if someone else in critical section
   acct = GetAccount(actId);
   acct->balance += amount;
   StoreAccount(acct);
   release(&mylock);      // Release someone into critical section
}
```

Threads serialized by lock through critical section. Only one thread at a time.

→ **Correctness Requirements**

Threaded programs must work for all interleavings of thread instruction sequences. Cooperating threads inherently non-deterministic and non-reproducible. Really hard to debug unless carefully designed!

## 6.4 The "Too Much Milk" Problem

→ **Problem Statement**

Two people need to coordinate buying milk. Never more than one person buys. Someone buys if needed.

→ **Solution Attempts**

**Solution #1** - Leave note before buying: Fails because thread can be context switched after checking but before leaving note.

**Solution #1½** - Leave note before checking: Results in no one ever buying milk.

**Solution #2** - Labeled notes: Can lead to neither thread buying milk due to unfortunate context switches. This kind of lockup is called "starvation."

→ **Solution #3 (Working Solution)**

Thread A:
```
leave note A;
while (note B) {
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
if (noNote A) {
   if (noMilk) {
      buy milk;
   }
}
remove note B;
```

Both can guarantee that either it is safe to buy, or other will buy. Works but is unsatisfactory - complex, asymmetric code, busy-waiting.

→ **Solution #4 (With Locks)**

```c
acquire(&milklock);
if (nomilk)
   buy milk;
release(&milklock);
```

Simple and symmetric solution using atomic lock operations.

→ **Hardware Support for Synchronization**

Implement various higher-level synchronization primitives using atomic operations:

**Hardware:** Load/Store, Disable Ints, Test&Set, Compare&Swap

**Higher-level API:** Locks, Semaphores, Monitors, Send/Receive

**Programs:** Shared Programs