# CS162 Lecture 23: Internet & Data Processing Systems

## Introduction
→ This lecture covers distributed systems concepts, focusing on Network File Systems (NFS), the Internet architecture, and distributed data processing frameworks like MapReduce and Spark.

## Distributed File Systems and NFS

### x Network File System (NFS)
NFS provides transparent access to files stored on remote disks. Key characteristics:
- Mount remote files into local file system
- Directory in local file system refers to remote files  
- Example: `/users/jane/prog/foo.c` on laptop refers to `/prog/foo.c` on `fs.cs.berkeley.edu`

### x Stateless Protocol Design
**Stateless Protocol**: All information required to service a request is included with the request itself

**Idempotent Operations**: Repeating an operation multiple times is same as executing it just once
- Example: "ReadAt(file_id, offset, length)" instead of "Read(fd, length)"

### x NFS Cache Consistency
NFS implements weak consistency:
- Client polls server periodically to check for changes
- Polls occur if data hasn't been checked in last 3-30 seconds (tunable parameter)
- When file is changed on one client, server is notified, but other clients use old version until timeout
- Multiple client writes to same file can result in either version (or parts of both) - completely arbitrary!

## The Internet Architecture

### x Internet Layering Model  
The Internet uses a layered "hourglass model":
- **Application Layer**: SMTP, HTTP, NTP, DNS
- **Transport Layer**: TCP, UDP  
- **Internet Layer**: IP (the "narrow waist")
- **Data Link Layer**: Ethernet, SONET, 802.11
- **Physical Layer**: Fiber, Copper, Radio

The "narrow waist" (IP) facilitates interoperability - layers abstract away hardware so upper layers are agnostic to lower layers.

### x Implications of Hourglass Model
Single Internet-layer module (IP):
- Allows arbitrary networks to interoperate
- Allows applications to function on all networks  
- Supports simultaneous innovations above and below IP
- But changing IP itself (e.g., IPv6) is very complex

### x Drawbacks of Internet Layering
- Layer N may duplicate layer N-1 functionality (e.g., error recovery)
- Layers may need same information (e.g., timestamps, MTU size)
- Layering can hurt performance by hiding details
- Some layers not cleanly separated due to performance dependencies

### x The End-to-End Argument
"End-to-End Arguments in System Design" (Saltzer, Reed, Clark 1984) - "Sacred Text" of the Internet

**Core Message**: Some types of network functionality can only be correctly implemented end-to-end
- Reliability, security, etc.  
- Hosts can't rely on network to fully implement them, so must do it themselves

**Example - Reliable File Transfer**:
- Solution 1: Make each step reliable, then concatenate them
- Solution 2: End-to-end check and retry if necessary

Solution 1 is incomplete (what if memory corrupted?). Solution 2 is complete - full functionality can be implemented at application layer with no need for reliability from lower layers.

**Interpretations**:
- **Conservative**: Don't implement function at lower levels unless it can be completely implemented there
- **Moderate**: Think twice before implementing functionality in network - do it only as performance enhancement

## Distributed Data Processing

### x The Big Data Problem
Data is growing faster than server speeds:
- Growing data sources (web, mobile, scientific)
- Cheap storage (doubling every ~18 months)  
- Stalling CPU speeds

**Examples**:
- 1000 genomes project: 200 TB
- Google web index: 100+ PB
- Large Databricks customer ingest: 1 PB/day
- Cost of 1 TB disk: $20
- Time to read 1 TB from disk: 3 hours (100 MB/s)

Single machine can no longer process or store all the data - only solution is to distribute over large clusters.

### x Traditional Network Programming Challenges
Message-passing between nodes is really hard at scale:
- How to divide problem across nodes?
- How to deal with failures?
- Even worse: stragglers (node not failed, but slow)

Almost nobody does this directly for distributed data processing.

## MapReduce Framework

### x MapReduce History
- Developed by Google, paper published in 2004
- Environment: clusters of cheap commodity machines
- Many "one-off" solutions were hard to maintain, get right, and time-consuming to implement

### x MapReduce Programming Model
**Data type**: key-value records

**Map function**: (Kin, Vin) → list(Kinter, Vinter)

**Reduce function**: (Kinter, list(Vinter)) → list(Kout, Vout)

### x Word Count Example
Four steps to count word occurrences:
1. Convert files into pairs of (key, value)
2. Define and apply map function to all files
3. Shuffle - all elements with same key go to same reduce
4. Define and apply reduce function to result of map

**Step 1**: Transform file into (File Name, List of words)

**Step 2 Map**: Associate each word with count of 1

**Step 3 Shuffle**: Aggregate intermediate results by key

**Step 4 Reduce**: Sum counts for each word

### x MapReduce System Architecture
System has coordinator and multiple worker nodes for map and reduce tasks.

### x Fault Tolerance in MapReduce
**Assumptions**:
- Any individual machine unlikely to crash
- Large cluster likely to experience failures
- Does not handle coordinator crashes
- Does handle worker failures

**Fault Tolerance Mechanisms**:

1. **If map/reduce task crashes**:
   - Retry on another node
   - OK for map (no dependencies)
   - OK for reduce (map outputs on disk)
   - If same task repeatedly fails, fail job or ignore input block
   - Note: Tasks must be idempotent (deterministic and side-effect-free)

2. **If worker node crashes**:
   - Relaunch current tasks on other nodes
   - Relaunch any maps the node previously ran (output files lost)

3. **If task is slow (straggler)**:
   - Launch second copy on another node
   - Take output of whichever finishes first
   - Critical for performance in large clusters

## Apache Spark

### x Beyond MapReduce
- Not all applications easily expressed with maps & reduces
- MapReduce stores all intermediate state on disk (slow)
- Many other frameworks: Spark, Apache Hive, PowerGraph, Naiad, Flink

### x Apache Spark Overview
Open source engine that generalizes MapReduce with:
- Higher-level operators (not just map & reduce, but join, filter, SQL, streaming)
- Efficient handling of intermediate datasets (reliable storage in memory)

### x Resilient Distributed Datasets (RDDs)
Key idea in Spark - think of as distributed, reliable virtual memory:
- Immutable collections of objects stored in memory or disk across cluster
- Built with parallel transformation operators (map, filter)
- Automatically rebuilt on failure using lineage information

### x Log Mining Example
```python
lines = spark.textFile("hdfs://...")
errors = lines.filter(lambda s: s.startswith("ERROR"))
messages = errors.map(lambda s: s.split('\t')(2))
messages.cache()

messages.filter(lambda s: s.contains("foo")).count()
messages.filter(lambda s: s.contains("bar")).count()
```
Performance: full-text search of Wikipedia in 1 sec (vs 40 s for on-disk data)

### x RDD Fault Tolerance
RDDs track lineage info to rebuild lost data:
```
file.map(record => (record.type, 1))
    .reduceByKey((x, y) => x + y)
    .filter((type, count) => count > 10)
```
If data is lost, can recompute from source using transformations.

### x Performance Improvements
Iterative App Performance (Logistic Regression):
- Hadoop: 110 s/iteration
- Spark: First iteration 80 s, further iterations 1 s

## Hadoop Components

### x Hadoop Architecture
- **Distributed File System (HDFS)**:
  - Single namespace for entire cluster
  - Replicates data 3x for fault-tolerance
- **MapReduce Framework**:
  - Runs jobs submitted by users
  - Manages work distribution & fault-tolerance
  - Colocated with file system

### x Hadoop Distributed File System (HDFS)
- Files split into 128MB blocks
- Blocks replicated across several datanodes (often 3)
- Namenode stores metadata (file names, locations)
- Optimized for large files, sequential reads
- Files are append-only

---

# CS162 Lecture 24: Coordination

## Introduction
→ This lecture covers coordination in distributed systems, focusing on making distributed decisions when machines can fail and networks are unreliable.

## The Coordination Challenge

### x Why Coordination is Hard
Coordination is difficult when:
- Machines can fail
- Networks are slow and/or unreliable  
- Machines may receive conflicting proposals on what to do

### x Coordination Example
Distributed decision scenario:
- Client wants to persist data across multiple machines
- Each machine must accept for operation to succeed
- All machines must flush to disk if all accept
- Client notified only after all machines successfully persist

## The General's Paradox

### x Problem Setup
Two generals on separate mountains:
- Can only communicate via messengers
- Messengers can be captured
- Need to coordinate attack
- If they attack at different times, they all die
- If they attack at same time, they win

### x Impossibility Result
Scenario demonstrates impossibility:
1. Caesar sends "Attack at 11 am!" to Brutus
2. Brutus receives and sends acknowledgment
3. Caesar doesn't know if acknowledgment arrived
4. Brutus doesn't know if Caesar knows acknowledgment arrived

Caesar needs to know that Brutus knows that Caesar knows that Brutus knows they are attacking at 11 am - infinite regress!

**Key Result**: Impossible to achieve simultaneous actions with unreliable channels because never know whether messenger or ACK got lost.

### x Additional Impossibility Results
- If network unreliable, impossible to guarantee two entities do something simultaneously
- If nodes behave maliciously, impossible to get eventual agreement with less than 3f+1 parties (of which f can misbehave)

## Two-Phase Commit (2PC)

### x Overview
- Two or more machines agree to do something, or not do it, atomically
- No constraints on time, just that it will eventually happen
- Used in most modern distributed systems
- Developed by Turing award winner Jim Gray (first Berkeley CS PhD, 1969)

### x 2PC Properties
Goal: Determine whether to commit or abort a transaction

1. **Agreement**: All processes that reach decision reach same one
2. **Finality**: Process cannot reverse decision after reaching one
3. **Consistency**: If no failures and every process votes yes, decision will be commit
4. **Termination**: If all failures repaired and no more failures, all processes eventually decide

### x 2PC Terminology
**Setup**:
- One coordinator
- Set of participants
- Each process has access to persistent log
- Processes can crash and recover
- Recorded information on log persists after crashes

**Voting**:
- Coordinator asks all processes to vote
- Each participant can vote YES or NO
- If all vote YES, coordinator must vote COMMIT
- If one votes NO, coordinator must vote ABORT

### x 2PC Algorithm (No Failures)

**Coordinator Algorithm**:
1. Send VOTE-REQ to all workers
2. Wait for votes
3. Collect votes:
   - If receive VOTE-COMMIT from all N workers, send GLOBAL-COMMIT
   - Otherwise, send GLOBAL-ABORT to all workers

**Worker Algorithm**:
1. Wait for VOTE-REQ
2. Send VOTE-COMMIT or VOTE-ABORT to coordinator
   - If sent VOTE-ABORT, immediately abort
3. Wait for decision
4. If receive GLOBAL-COMMIT then commit
   - If receive GLOBAL-ABORT then abort

### x Coordinator State Machine
States: INIT → WAIT → ABORT/COMMIT
- INIT: Recv START, Send VOTE-REQ → WAIT
- WAIT: Recv VOTE-ABORT, Send GLOBAL-ABORT → ABORT
- WAIT: Recv all VOTE-COMMIT, Send GLOBAL-COMMIT → COMMIT

### x Handling Message Timeouts

**Step 2 timeout** (worker waiting for VOTE-REQ):
- Since hasn't voted yet, worker can decide abort and halt

**Step 3 timeout** (coordinator waiting for votes):
- Coordinator can always vote abort, sends GLOBAL-ABORT to all

**Step 4 timeout** (worker voted COMMIT, waiting for decision):
- Worker cannot decide - must run termination protocol

### x Termination Protocol
**Option 1**: Simply wait for coordinator to recover

**Option 2**: Ask a friendly participant p
- Case 1: If p decided COMMIT/ABORT, forwards decision
- Case 2: If p has not decided, votes ABORT, sends abort to initiator
- Case 3: If p voted COMMIT, p is also stuck and can't help

If every participant voted COMMIT and coordinator crashes before sending decision, must wait for coordinator to recover!

### x Machine Recovery
All nodes use stable storage (backed by disk/SSD):

**Logging Protocol**:
- Coordinator writes START-2PC when sending VOTE-REQ
- Participant writes VOTE-* before voting
- Coordinator writes GLOBAL-* before sending decision
- Participant writes commit/abort after receiving GLOBAL-*

**Recovery Actions**:
- Coordinator: If sees VOTE-REQ but no decision, decides ABORT
- Participant: If no record, sends VOTE-ABORT; if VOTE-COMMIT, contacts friend
- Coordinator: If sees GLOBAL-*, resends decision
- Participant: If sees decision in log, 2PC already terminated

### x 2PC Summary
**Why 2PC avoids General's Paradox**:
- 2PC is about all nodes eventually coming to same decision
- Not necessarily at same time
- Allowing reboot and continue provides time for collecting decisions

**Biggest downside**: Blocking - failed node can prevent system progress

**Still one of most popular coordination algorithms today**

## Alternatives to 2PC

### x Three-Phase Commit
One more phase, allows nodes to fail or block and still make progress

### x PAXOS
Alternative used by Google and others without 2PC blocking problem:
- Developed by Leslie Lamport (Turing Award Winner)
- No fixed leader, can choose new leader on fly
- Better failure handling

### x Byzantine Agreement
What if nodes are malicious (attempting to compromise decision making)?
- Use more hardened decision-making process
- Byzantine Agreement and Blockchains handle malicious actors