# CS162 Operating Systems and Systems Programming Study Notes

## Lecture 14: Virtual Memory

### Virtualizing Memory
Operating systems provide virtual memory as part of virtualizing system resources. Process abstraction includes:
→ Memory (address space) - stores code, data, stack, heap
→ CPU Registers - Program Counter, Stack Pointer, regular registers  
→ IO information - open files and other resources

### Memory Virtualization Objectives
→ **Isolation** - processes cannot access each other's memory
→ **Flexibility** - processes can use memory as needed
→ **Infinite Resources** - illusion of unlimited memory

OS interposes on memory access through hardware translation support. Hardware accelerates common case; uncommon cases trap to OS.

### Memory Addresses  
Memory addresses refer to byte locations. With K bits, can address 2^K unique locations.
→ 32-bit addresses: 2^32 = 4,294,967,296 bytes
→ 64-bit addresses: 2^64 = extremely large address space

### Memory Protection Mechanisms

**1.1 Uniprogramming**
Application runs at same physical memory location. No protection - application can access any physical address. Gives illusion of dedicated machine by providing reality of dedicated machine.

**1.2 Memory Translation Through Relocation**  
Loader/linker adjusts addresses when program loaded into memory. No protection - bugs in any program can crash other programs or OS.

**1.3 Base & Bound**
Hardware registers provide protection:
→ Base register: starting address of process memory
→ Bound register: limit of process memory
→ CPU checks: physical address must be between Base and Base+Bound

Limitations:
→ No expandable memory (static allocation)
→ No memory sharing between processes
→ Non-relative memory addresses
→ External fragmentation (cannot relocate programs)
→ Internal fragmentation (address space must be contiguous)

**1.4 Base & Bound With Hardware Relocation**
Programs compiled as if loaded at address zero. Hardware translates:
physical address = virtual address + base

Memory Management Unit (MMU) performs virtual to physical address translation.

**1.5 Segmentation**
Creates base and bounds pair per logical segment (code, data, heap, stack). Each segment placed independently in memory.

Implementation uses segment map in processor:
→ Segment number mapped to base/limit pair  
→ Virtual address = [Segment #][Offset]
→ Physical address = Base[Segment #] + Offset

Pros:
→ Minimal hardware requirements
→ Supports sparse address spaces
→ Avoids internal fragmentation

Cons: 
→ External fragmentation still a problem
→ Must fit variable-sized chunks into physical memory

## Lecture 15: Virtual Memory (2)

### Paging
Divides logical address space into fixed-sized pages and physical memory into page frames.

Virtual address format: [Virtual Page #][Offset]
→ Virtual Page # specifies which page
→ Offset specifies location within page

### Page Tables
Store virtual-to-physical address translations. One page table per process, stored in memory. Page Table Base Register (PTBR) points to table.

Translation process:
1. Extract virtual page number (first p bits)
2. Look up physical frame number in page table
3. Extract offset (last o bits)  
4. Combine: physical address = frame # × page size + offset

### Page Table Entry (PTE) - 32 bits
Contains:
→ Page Frame Number (20 bits)
→ Control bits (12 bits):
  - P: Present/valid
  - W: Writeable
  - U: User accessible
  - A: Accessed recently
  - D: Dirty (modified)
  - Protection and caching bits

### PTE Capabilities
→ **Demand Paging**: Keep only active pages in memory
→ **Copy-on-Write**: Share pages between processes, copy when modified
→ **Zero Fill On Demand**: Allocate zeroed pages on first use
→ **Data Breakpoints**: Mark pages read-only for debugging

### Page Sharing
Processes map virtual pages to same physical frame. Used for:
→ Kernel region shared across processes
→ Multiple processes running same binary
→ Shared memory segments

### Multi-Level Page Tables
Addresses page table size problem through hierarchy:

**Two-Level Paging**:
Virtual address: [Outer Page #][Inner Page #][Offset]
→ Outer table points to inner tables
→ Inner tables point to physical frames
→ Can mark entire regions invalid to save space

**x86 64-bit**: Four-level page tables with 48-bit virtual addresses

### Inverted Page Tables
Single table with entry per physical page. Contains process ID + virtual page mapping. Size proportional to physical memory, not virtual.

### Translation Lookaside Buffer (TLB)
Hardware cache for virtual-to-physical translations. Exploits locality:
→ **Temporal locality**: Recently accessed pages likely accessed again
→ **Spatial locality**: Nearby pages likely accessed together

Without TLB, each memory access requires multiple page table lookups. TLB provides cached end-to-end translation result.

### Address Translation Performance
Average Memory Access Time (AMAT) = (Hit Rate × Hit Time) + (Miss Rate × Miss Time)

TLB dramatically improves translation speed by caching recent translations.

### Memory Hierarchy Integration
Translation occurs between processor and main memory:
→ Core → Cache(s) → MMU (with TLB) → Physical Memory
→ Page tables stored in main memory (possibly cached)

### Paging Limitations
→ **Space overhead**: Large page tables for 64-bit address spaces
→ **Time overhead**: Multiple memory accesses for translation
→ **Internal fragmentation**: Unused space within pages

Solutions involve combination of multi-level tables, TLBs, and inverted tables to balance space/time tradeoffs.