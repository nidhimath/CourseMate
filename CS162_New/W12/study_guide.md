# CS162 Operating Systems Study Notes

## Lecture 19: File Systems

### Files & Directories

→ Recall: HDDs and SSDs

HDDs require seek + rotation, are not parallel (one head), have brittle moving parts, random reads take 10s milliseconds, are slow (mechanical), but offer cheap/large storage.

SSDs have no seeks, are parallel, have no moving parts, random reads take 10s microseconds, wear out, but offer more expensive/smaller storage.

x Both work better with larger reads & writes

→ Recall: I/O and Storage Layers

High level I/O includes streams. Low level I/O includes file descriptors. Syscalls include open(), read(), write(), close(). File system manages files/directories/indexes. I/O driver handles commands and data transfers. Hardware includes disks, flash, controllers, DMA.

→ From Storage to File Systems

Variable-size buffers interface with file system blocks (logical index, typically 4KB). HDDs use sectors (physical index, 512B or 4KB). SSDs use flash translation layer with physical pages (4KB) and erasure blocks.

### Building a File System

File system is a layer of OS that transforms block interface of disks into files, directories, etc.

→ Purpose of a File System

Naming: Find file by name, not block numbers
Organization: Organize file names within directories  
Placement: Map files to blocks
Protection: Enforce access restrictions
Reliability: Keep files intact despite crashes, failures

→ User vs. System View of a File

User's view: Durable data structures

System's view (system call interface): Collection of bytes (UNIX)

System's view (inside OS): Collection of blocks (block size ≥ sector size; in UNIX, block size is 4KB)

→ Translation from User to System View

Reading bytes 2-12: Fetch block corresponding to those bytes, return just the correct portion

Writing bytes 2-12: Fetch block, modify relevant portion, write out block

x Everything inside file system is in terms of whole-size blocks

→ What Does the File System Need to Do?

Track free disk blocks (know where to put newly written data)
Track which blocks contain data for which files (know where to read from)
Track files in a directory (find list of file's blocks given name)

x All maintained somewhere on disk

→ Critical Factors in File System Design

(Hard) Disk Performance
Open before read/write
Size determined as files are used
Organized into directories
Need to carefully allocate/free blocks

### Files & Directories

→ Manipulating Directories

System calls: open/creat/readdir traverse structure, mkdir/rmdir add/remove entries, link/unlink (rm)

libc support: DIR * opendir, struct dirent * readdir, int readdir_r

→ Example: Early Unix File System

Superblock object: information about file system
Free bitmaps: what is allocated/not allocated
Inode object: represents specific file
Dentry object: directory entry, single component of path
Blocks: How files are stored on disk
File object: open file associated with process

→ Components of Unix File System

File path → Directory Structure → File Header Structure (Inode/"index node") → File number "inumber" → Data blocks

x One Block = potentially multiple sectors (e.g., 512B sector, 4KB block)

→ How to Find a File's Inode Number?

Look up through directory structure. Directory is specialized file containing <file_name : inode number> mappings. Each mapping called directory entry.

→ File System Workload Characteristics

Published in FAST 2007

Observation #1: Most Files Are Small
Observation #2: Most Bytes are in Large Files

### Unix Inode Structure

File Number is index into array of inode structures. Each inode corresponds to file and contains metadata. Inode maintains multi-level tree to find storage blocks. Original format appeared in BSD 4.1.

→ File Attributes

User, Group, 9 basic access control bits (UGO x RWX), SetUID bit (execute at owner permissions), SetGID bit (execute at group's permissions)

→ Direct Pointers

12 Direct pointers. 4kB blocks sufficient for files up to 48KB.

→ Indirect Pointers

48 KB + 4 MB + 4 GB + 4 TB

Indirect pointers point to disk block containing only pointers.

Assume 4KB blocks:
- Maximum size with only direct pointers: 12 * 4 KB = 48 KB
- Maximum size with one indirect pointer: 12 * 4 KB + 1024 * 4KB = 4.1MB  
- Maximum size with double indirect pointers: 12 * 4KB + 1024 * 4KB + 1024 * 1024 * 4KB = 4.6 GB

→ Inodes form an on-disk index

Sample file in multilevel indexed format (12 direct ptrs, 4K blocks):
- Block #23 accesses: Two (indirect block, data)
- Block #5 accesses: One (data)
- Block #1100 accesses: Three (double indirect block, indirect block, data)

→ Creating new files

Inodes stored in inode table. File system stores bitmap of free inodes and free blocks.

On creating new file:
1. Check which inode is free/where inode is stored
2. Check which data blocks are free

### Fast File System (BSD 4.2, 1984)

Same inode structure as BSD 4.1. Changes to block sizes from 1024→4096 bytes for performance.

→ Optimization for Performance and Reliability

Distribute inodes among different tracks closer to data
Uses bitmap allocation in place of freelist
Attempt to allocate files contiguously
10% reserved disk space
Skip-sector positioning

→ FFS Locality: Block Groups

Distribute header information (inodes) closer to data blocks in same "cylinder group". File system volume divided into "block groups". Data blocks, metadata, and free space interleaved within block group. Put directory and its files in same block group.

First-Free allocation of new file blocks. To expand file, first try successive blocks in bitmap, then choose new range. Few little holes at start, big sequential runs at end of group. Avoids fragmentation. Sequential layout for big files.

x Important: keep 10% or more free (reserve space in Block Group)

→ Attack of the Rotational Delay

Missing blocks due to rotational delay. Read one block, do processing, read next block. Disk has continued turning: missed next block. Need 1 revolution/block.

Solution 1: Skip sector positioning ("interleaving") - Place blocks from one file on every other block of track

Solution 2: Read-ahead - read next block right after first, even if application hasn't asked yet

→ UNIX 4.2 BSD FFS

Pros: Efficient storage for small and large files, Locality for both, No defragmentation necessary

Cons: Inefficient for tiny files, Inefficient encoding when file mostly contiguous, Need to reserve 10-20% free space

### Other File Systems

→ FAT (File Allocation Table)

MS-DOS, 1977. File is collection of disk blocks. FAT is linked list 1-1 with blocks. File number is index of root of block list. File offset: block number and offset within block. Follow list to get block number. Unused blocks marked free.

Directories are files containing <file_name: file_number> mappings. File attributes kept in directory. Each directory has linked list of entries. Root directory always at block 2.

→ Windows NTFS

Default on modern Windows systems. Variable length extents. Master File Table where everything is sequence of <attribute:value>.

Each MFT entry contains metadata and:
- File's data directly (small files)
- List of extents (start block, size) for file's data
- For big files: pointers to other MFT entries with more extent lists

Directories implemented as B-Trees. File's number identifies its entry in MFT.

## Lecture 20: File Systems & Reliability

### Buffer Caches

Kernel must copy disk blocks to main memory to access contents and write back if modified.

→ Key Idea

Exploit temporal locality by caching disk data in memory:
- Disk blocks: Mapping from block address→disk content
- Name translations: Mapping from paths→inodes

Buffer Cache: Memory used to cache FS data, including disk blocks and metadata. Can contain "dirty" blocks (modifications not on disk).

→ Buffer Cache Replacement Policy

Preferred policy: LRU
- Can afford overhead full LRU implementation  
- Works well for name translation
- Works well if memory accommodates working set

Disadvantages: Fails when application scans through file system, flushing cache with data used once

→ Buffer Cache Size

How much memory for buffer cache vs virtual memory?
- Too much to file system cache → won't run many applications
- Too little to file system cache → applications run slowly

Solution: adjust boundary dynamically to balance disk access rates

→ File System Prefetching

Read Ahead Prefetching: fetch sequential blocks early. Exploit fact that most common file access is sequential. Elevator algorithm can efficiently interleave prefetches.

→ Delayed Writes

Buffer cache is writeback cache. write() copies data from user space to kernel buffer cache (quick return). read() fulfilled by cache.

Data reaches disk when:
- Buffer cache is full (need to evict)
- Buffer cache flushed periodically (in case of crash)

Advantages: Low latency, efficient disk scheduling, delay block allocation, some files never reach disk

### Dealing with Persistent State

Buffer cache writes back dirty blocks periodically to minimize data loss. Linux does periodic flush every 30 seconds. Applications can use fsync to force flushing.

x Not foolproof - can still crash with dirty blocks in cache

→ Important "ilities"

Availability: Probability system can accept and process requests
Durability: Ability to recover data despite faults  
Reliability: Ability to perform required functions under stated conditions for specified time

### Storage Reliability Problem

Single logical file operation involves updates to multiple physical disk blocks (inode, indirect block, data block, bitmap). At physical level, operations complete one at a time. Want concurrent operations for performance.

x How guarantee consistency regardless of when crash occurs?

→ Threats to Reliability

Interrupted Operation: Crash during related updates may leave data inconsistent

Loss of stored data: Failure of storage media may cause data to disappear/corrupt

### Two Reliability Approaches

1.1 Careful Ordering and Recovery (FAT & FFS + fsck)
- Each step builds structure: Data block → inode → free → directory
- Last step links to rest of FS
- Recovery scans for incomplete actions

1.2 Versioning and Copy-on-Write (ZFS)
- Version files at some granularity
- Create new structure linking to unchanged parts
- Last step declares new version ready

→ Reliability Approach #1: Careful Ordering

Sequence operations in specific order. Careful design allows safe interruption. Post-crash recovery reads data structures, cleans up as needed.

Berkeley FFS Create File:
Normal: Allocate data block, write data, allocate inode, write inode, update bitmaps, update directory, update modify time

Recovery: Scan inode table, delete unlinked files, compare free bitmap against inode trees, scan directories

x Time proportional to disk size

→ Reliability Approach #2: Copy on Write

Create new version with updated data. Reuse blocks that don't change. Only point to new version when fully done.

x Seems expensive but updates can be batched, disk writes occur in parallel

### Transactions

Atomic sequence of reads and writes taking system from one consistent state to another. Extends atomic updates from memory to persistent storage.

→ Typical Structure

Begin transaction (get transaction id)
Do updates (roll-back if fail or conflicts)
Commit transaction

→ Transactional File Systems

Better reliability through log. Changes treated as transactions. Transaction committed once fully written to log. Data preserved in log and replayed to recover.

Difference: Log Structured filesystem keeps data in log form. Journaled filesystem uses log only for recovery.

→ Journaling File Systems

Don't modify data structures directly. Write each update as transaction in log (journal/intention list). Once in log, safely apply to other structures.

Linux took ext2 and added journal to get ext3.

→ Creating File with Journaling

Find free blocks/inode/dirent → Write to log (map, inode, dirent) → Commit → Eventually replay transaction

All accesses first look in log (on-disk structure might be stale). Eventually copy to disk and discard from log.

→ Crash Recovery

Discard Partial: Scan log, detect start with no commit, discard entries, disk unchanged

Keep Complete: Scan log, find start and matching commit, redo as usual

→ Journaling Summary

Updates atomic even if crash - either fully applied or discarded. All physical operations treated as logical unit.

x Expensive - writing data twice. Modern filesystems journal metadata updates only.