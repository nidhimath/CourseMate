# CS162 Operating Systems and Systems Programming - Lecture Notes

## Lecture 21: Reliability & Distributed Systems

### 21.1 Storage Reliability

→ **Recall: File System Buffer Cache**

The OS implements a cache of disk blocks for efficient access to data, directories, inodes, and freemap. Data written to buffer cache is flushed to disk periodically, but may be lost if machine crashes before flush occurs.

→ **Storage Reliability Problem**

Even without buffer cache, file system data structures may be inconsistent after failure:
- Single logical file operation can involve updates to multiple disk blocks (inode, indirect block, data block, bitmap)
- Within storage device, single block write might update multiple sectors

x **How do we guarantee consistency regardless of when crash occurs?**

### 21.2 Reliability Approaches

→ **Two Main Approaches**

**1. Careful Ordering and Recovery (FAT & FFS + fsck)**
- Each step builds structure: Data block → inode → free → directory
- Last step links it into rest of FS
- Recovery scans structure looking for incomplete actions

**2. Versioning and Copy-on-Write (ZFS)**
- Version files at some granularity
- Create new structure linking back to unchanged parts of old
- Last step declares new version ready

→ **More General Solutions**

**Transactions for atomic updates:**
- Ensure multiple related updates performed atomically
- If crash occurs in middle, state reflects either all or none of updates
- Most modern file systems use transactions internally

**Redundancy for media failures:**
- Error Correcting Codes on media
- Replication across media (e.g., RAID disk array)

### 21.3 Transactions

→ **Key Concept**

A transaction is an atomic sequence of reads and writes that takes the system from one consistent state to another.

- Extends concept of atomic updates from memory to persistent storage
- Code in critical section appears atomic to other threads
- Transactions extend this to persistent storage

→ **Typical Transaction Structure**

1. Begin transaction - get transaction ID
2. Do bunch of updates
   - If any fail, roll-back
   - If conflicts with other transactions, roll-back
3. Commit transaction

→ **Transaction Example: SQL**

```sql
BEGIN;    --BEGIN TRANSACTION
UPDATE accounts SET balance = balance - 100.00 WHERE name = 'Alice';
UPDATE branches SET balance = balance - 100.00 WHERE name = ...;
UPDATE accounts SET balance = balance + 100.00 WHERE name = 'Bob';
UPDATE branches SET balance = balance + 100.00 WHERE name = ...;
COMMIT;   --COMMIT WORK
```

### 21.4 Logging and Journaling

→ **The Log as Tool**

One simple action is atomic - write/append basic item. Use that to seal commitment to whole series of actions:
- Start Tran N
- Get 10$ from account A
- Get 7$ from account B  
- Get 13$ from account C
- Put 15$ into account X
- Put 15$ into account Y
- Commit Tran N

→ **Transactional File Systems**

Better reliability through use of log:
- Changes to all FS data structures treated as transactions
- Transaction committed once fully written to log
- Data forced to disk for reliability
- Process can be accelerated with NVRAM

**Difference between Log Structured and Journaling file systems:**
- Log Structured: data stays in log form
- Journaling: log only used for recovery

### 21.5 Journaling File System Operation

→ **Creating File with Journaling**

Process:
1. Find free data block(s)
2. Find free inode entry
3. Find dirent insertion point
4. [log] Write map (mark used)
5. [log] Write inode entry to point to block(s)
6. [log] Write dirent to point to inode

Log contains: start marker, pending operations, commit marker

→ **After Commit**

- All accesses to file system first look in log
- Actual on-disk data structure might be stale
- Eventually copy changes to disk and discard transaction from log

→ **Crash Recovery**

**Discard Partial Transactions:**
- Upon recovery, scan log
- Detect transaction start with no commit
- Discard log entries
- Disk remains unchanged

**Keep Complete Transactions:**
- Scan log, find start
- Find matching commit
- Redo as usual or let happen later

→ **Journaling Summary**

**Why go through this trouble?**
- Updates atomic, even if we crash
- Update either fully applied or discarded
- All physical operations treated as logical unit

**Cost considerations:**
- Writing all data twice (once to log, once to actual blocks)
- Modern filesystems journal metadata updates only

## Lecture 22: Distributed File Systems & Internet

### 22.1 Distributed Systems Introduction

→ **What is a Distributed System?**

"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable." - Leslie Lamport

→ **Two Types of Distributed Systems**

**Client/Server Model:**
- One or more servers provide services to clients
- Clients make remote procedure calls to server
- Server serves requests from clients

**Peer-to-Peer Model:**
- Each computer acts as peer
- No hierarchy or central coordination point
- All-way communication between peers through gossiping

### 22.2 Promise and Challenges

→ **Promise of Distributed Systems**

**Availability:** Proportion of time system is functioning
- One machine goes down, use another

**Fault-tolerance:** System has well-defined behavior when fault occurs
- Store data in multiple locations

**Scalability:** Ability to add resources to support more work
- Just add machines when need more storage/processing

**Transparency:** System masks complexity behind simple interface
- Location, Migration, Replication, Concurrency, Parallelism, Fault Tolerance

→ **Challenges of Distributed Systems**

- How do you get machines to communicate?
- How do you get machines to coordinate?
- How do you deal with failures?
- How do you deal with security (corrupted machines)?

### 22.3 Communication in Distributed Systems

→ **Protocols**

A protocol is agreement on how to communicate, covering:
- **Syntax:** how communication is specified & structured
  - Format, order messages are sent and received
- **Semantics:** what communication means
  - Actions taken when transmitting, receiving, or timer expires

→ **Message Passing**

Interface:
- Mailbox (mbox): temporary holding area for messages
- Send(message,mbox)
- Receive(buffer,mbox)

→ **Data Representation**

Object in memory has machine-specific binary representation. Externalizing object requires turning it into sequence of bytes:

- **Serialization/Marshalling:** Express object as sequence of bytes
- **Deserialization/Unmarshalling:** Reconstruct object from marshalled form

**Endianness consideration:**
- Big Endian: most significant byte stored first
- Little Endian: least significant byte stored first

**Common formats:** JSON, XML, Protocol Buffers

### 22.4 Remote Procedure Call (RPC)

→ **RPC Concept**

Makes communication look like ordinary function call:
- Automates complexity of translating between representations
- Client calls: `remoteFileSystem→Read("file.txt")`
- Translated automatically into call on server: `fileSys→Read("file.txt")`

→ **RPC Implementation**

Request-response message passing under covers:
- Client stub: marshalls arguments, unmarshalls return values
- Server stub: unmarshalls arguments, marshalls return values

**Stub generator:** Compiler that generates stubs
- Input: interface definitions in IDL
- Output: stub code in appropriate source language

→ **RPC Details**

**Binding:** Converting user-visible name into network endpoint
- Static: fixed at compile time
- Dynamic: performed at runtime via name service

**Multiple servers:** 
- Choose unloaded server at binding time
- Router level redirect for load balancing

→ **Problems with RPC**

**Non-Atomic Failures:**
- Different failure modes than single machine
- Can result in inconsistent view of world
- Solution: Distributed transactions/2PC

**Performance:**
- Cost: Procedure call << same-machine RPC << network RPC
- Overheads: Marshalling, Stubs, Kernel-Crossing, Communication
- Programmers must be aware RPC is not free

### 22.5 Distributed File Systems

→ **Concept**

Transparent access to files stored on remote disk:
- Mount remote files into local file system
- Directory in local file system refers to remote files

**Naming choices:**
- [Hostname,localname]: Filename includes server
- Global name space: Filename unique in "world"

→ **Virtual Filesystem Switch (VFS)**

Virtual abstraction of file system in many OSes:
- Provides virtual superblocks, inodes, files
- Compatible with variety of local and remote file systems
- Same system call interface for different file system types

→ **Simple Distributed File System**

Remote Disk: Reads and writes forwarded to server using RPC

**Advantages:** Server provides consistent view to multiple clients

**Problems - Performance:**
- Network slower than local memory
- Lots of network traffic/not well pipelined
- Server can be bottleneck

→ **Caching to Reduce Network Load**

Use buffer cache at source and destination

**Advantage:** If operations can be done locally, no network traffic needed

**Problems:**
- Failure: Client caches have uncommitted data
- Cache consistency: Client caches not consistent with server/each other

### 22.6 Network File System (NFS)

→ **NFS Architecture**

Introduced by Sun in 1986 as open protocol

Three layers:
1. UNIX file-system interface: open, read, write, close + file descriptors
2. VFS layer: distinguishes local from remote files
3. NFS service layer: implements NFS protocol

→ **NFS Protocol Features**

**Stateless servers:** Each request provides all arguments required
- E.g., ReadAt(inumber,position), not Read(openfile)
- No network open() or close() needed

**Idempotent operations:** Multiple requests have same effect as one
- Read/write file blocks: just re-read or re-write
- Remove: operation done twice returns advisory error

**Write-through caching:** Modified data committed to server's disk before returning result
- NSF2: every write persisted
- NSF3: open-to-close consistency

→ **NFS Cache Consistency**

**Weak consistency:**
- Client polls server periodically (3-30 seconds timeout)
- When file changed on one client, other clients use old version until timeout
- Multiple writers: can get either version or parts of both

**Failure Model:** Transparent to client system
- Options: Hang until server returns OR Return error

→ **NFS Pros and Cons**

**Pros:**
- Simple, highly portable

**Cons:**
- Sometimes inconsistent
- Doesn't scale to large # clients
- Server becomes bottleneck due to polling traffic

### 22.7 The Internet

→ **Internet as Distributed System**

Largest distributed system that exists:
- Many different applications (Email, web, P2P)
- Many different operating systems and devices
- Many different network styles and technologies

Organization: Layering & end-to-end principle

→ **The Hourglass Model**

"Narrow waist" facilitates interoperability:
- Physical layer
- Data Link layer
- **IP (Internet Protocol) - the waist**
- Transport layer (TCP/UDP)
- Application layer

**Implications:**
- Any network supporting IP can exchange packets
- Applications using IP can use any network
- Supports simultaneous innovations above and below IP
- But changing IP itself very involved

→ **Drawbacks of Layering**

- Layer N may duplicate layer N-1 functionality
- Layers may need same information
- Layering can hurt performance
- Some layers not always cleanly separated

### 22.8 End-to-End Principle

→ **Core Argument**

"End-to-End Arguments in System Design" by Saltzer, Reed, and Clark ('84)

Simple Message: Some network functionality can only be correctly implemented end-to-end
- Reliability, security, etc.
- Hosts cannot rely on network help, must implement themselves

→ **Example: Reliable File Transfer**

**Solution 1:** Make each step reliable, concatenate them
**Solution 2:** End-to-end check and retry if necessary

Solution 1 incomplete - what if memory corrupted?
Solution 2 complete - full functionality at application layer

→ **Interpretations**

**Conservative:** Don't implement function at lower levels unless can be completely implemented there

**Moderate:** Think twice before implementing in network
- If hosts can implement correctly, lower layer only for performance enhancement
- Only if doesn't burden applications not requiring functionality