# CS162 Lecture 16: Memory 3 - Demand Paging Study Notes

## → Overview
This lecture covers advanced memory management topics including handling large page tables, the Translation Lookaside Buffer (TLB), and demand paging mechanisms.

## → Limitations of Simple Paging

**Space Overhead with 64-bit Address Space:**
- 32-bit systems: 4MB page table per process (manageable)
- 64-bit systems: 36 petabytes per process (impossible!)
- Problem: Address space is sparse - most entries map to nothing

**Performance Issues:**
- Time overhead: Every memory access requires accessing page table first
- Internal fragmentation: 4KB pages waste space

## → Multi-Level Page Tables

**2-Level Paging Structure:**
- Divides virtual address into: Outer Page # | Inner Page # | Offset
- Tree structure allows marking entire regions as invalid
- Saves space when address space is sparse

**x86 32-bit Example:**
- 10 bits outer page, 10 bits inner page, 12 bits offset
- Each inner page table fits in single 4KB page
- Can share entire regions between processes

**x86 64-bit Uses 4-Level Page Tables:**
- 48-bit virtual addresses (not full 64 bits)
- Four 9-bit indices + 12-bit offset
- Each level uses 4KB pages

## → Alternative Page Table Designs

**Paged Segmentation:**
- Uses segments for top level, paging within segments
- Used in x86 32-bit systems

**Inverted Page Table:**
- Single table with entry per physical page
- Size proportional to physical memory (not virtual)
- Uses hash table for lookups
- Disadvantage: No cache locality

## → Translation Lookaside Buffer (TLB)

**Purpose:**
- Hardware cache for virtual→physical translations
- Avoids multiple memory accesses for page table walks
- Exploits locality of reference

**TLB Management:**
- Context switch requires TLB flush or ProcessID tags
- Page table changes require TLB consistency updates
- Hit rate critical for performance

## → Caching and Memory Hierarchy

**Memory Access Time:**
- AMAT = (Hit Rate × Hit Time) + (Miss Rate × Miss Time)
- 90% hit rate: AMAT = 11ns
- 99% hit rate: AMAT = 2.01ns

**Locality Principles:**
- Temporal locality: Recently accessed items likely accessed again
- Spatial locality: Nearby items likely accessed together

## → Demand Paging

**Core Concept:**
- Use main memory as cache for disk
- Pages loaded only when needed
- Illusion of infinite memory

**Page Table Entry (PTE) Fields:**
- P: Present bit (page in memory)
- D: Dirty bit (page modified)
- If not present, PTE contains disk location

## → Page Fault Handling

**Steps on Page Fault:**
1. MMU traps to OS
2. OS selects victim page if needed
3. Write victim to disk if dirty
4. Load new page from disk
5. Update page table entry
6. Invalidate TLB entry
7. Retry faulting instruction

**Uses of Page Faults:**
- Stack/heap extension
- Copy-on-write for fork()
- Demand loading for exec()
- Memory-mapped files

## → Virtual Address Space Management

**Backing Store:**
- Every utilized page backed by disk block
- Swap file stores non-resident pages
- OS maintains mapping: (PID, page#) → disk_block

**Process Address Space:**
- Code, data, heap, stack regions
- Page table maps entire VAS
- Resident pages mapped to memory frames
- Non-resident pages tracked on disk

## → Performance Considerations

**Effective Access Time:**
- Example: 200ns memory, 8ms page fault
- 1 fault per 1000 accesses = 40× slowdown
- For <10% slowdown: need <1 fault per 400,000 accesses

**Working Set Model:**
- Programs transition through working sets
- Subset of address space actively used
- Important for memory allocation decisions

## → Page Replacement Policies

**Types of Misses:**
- Compulsory: First access to page
- Capacity: Not enough memory
- Policy: Premature eviction

**Basic Policies:**
- **FIFO:** Remove oldest page (simple but ineffective)
- **Random:** Unpredictable, used in TLBs
- **MIN:** Replace page used furthest in future (optimal but impossible)

## → Key Design Decisions

**Memory Allocation:**
- How many frames per process?
- Fairness vs. utilization trade-offs
- Priority-based allocation

**Free Frame Management:**
- Maintain free list
- Background "reaper" process
- Write back dirty pages proactively
- Zero unused pages