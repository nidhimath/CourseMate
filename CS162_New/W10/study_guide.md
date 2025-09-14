# CS162 Operating Systems and Systems Programming Study Notes

## Lecture 17: General I/O, Storage Devices

### → Introduction

Operating systems serve as intermediaries between hardware devices and user programs, providing abstraction layers that enable standardized interaction with diverse I/O devices. The I/O subsystem represents a critical component of the OS architecture, managing communication between the CPU and external peripherals.

### → Five Components of a Computer

x The classical computer architecture consists of processor, memory, input devices, output devices, and control units
x Input/output mechanisms enable computers to communicate with the external world
x These components work together through standardized interfaces and protocols

### → Device Categories

**Block Devices**
x Examples: disk drives, tape drives, DVD-ROM
x Access data in fixed-size blocks
x Support operations: open(), read(), write(), seek()
x Enable both raw I/O and file-system access

**Character Devices**
x Examples: keyboards, mice, serial ports, some USB devices
x Process single characters sequentially
x Primary operations: get(), put()

**Network Devices**
x Examples: Ethernet, Wireless, Bluetooth
x Utilize socket interface separating protocol from operation
x Include connection management and polling functionality
x Communication methods: pipes, FIFOs, streams, queues, mailboxes

### → IO Subsystem Architecture

The IO subsystem implements multiple abstraction layers:

1.1 **Hardware Level**: Physical IO devices
1.2 **IO Layer**: Device drivers and controllers
1.3 **OS Hardware Virtualization**: Virtual machine abstractions
1.4 **Process Level**: Individual process memory spaces

This hierarchical structure enables code portability across different devices through standardized interfaces. Device drivers implement these standard interfaces while handling device-specific operations internally.

### → IO System Requirements

x **Standardization Challenge**: Managing thousands of diverse devices through uniform interfaces
x **Reliability Concerns**: Handling media failures and transmission errors transparently
x **Performance Management**: Dealing with unpredictable device behavior and varying speeds

### → Hardware Architecture

**Hierarchical Bus Structure**

The system follows a hierarchical organization based on cost-performance tradeoffs:
x Faster buses closer to processor (more expensive)
x Slower, more flexible buses farther from processor
x Example: Intel Z270 chipset with Platform Controller Hub (PCH)

**Platform Controller Hub Components**
x Connected via Direct Media Interface (proprietary bus)
x USB and Ethernet controllers
x Thunderbolt 3 support
x Audio and BIOS functionality
x SATA interfaces for disk connectivity
x Additional PCI Express lanes (lower speed than processor-attached)

### → Device Communication Mechanisms

**Controller Architecture**

Device controllers serve as intermediaries between CPU and devices:
x Contain addressable registers for control and status
x May include memory for request queues
x Support two access methods:

1. **Port-Mapped I/O**
   x Uses privileged in/out instructions
   x Example: `out 0x21,AL` (Intel architecture)

2. **Memory-Mapped I/O**
   x Uses standard load/store instructions
   x Registers appear in physical address space
   x Protected through address translation

### → Data Transfer Protocols

**Basic Polling Protocol**
x CPU continuously checks device status
x Processor responsible for data movement
x High overhead due to busy-waiting

**Interrupt-Driven I/O**
x Hardware interrupts notify CPU of completion
x Allows CPU to process other tasks during I/O
x Interrupt handlers read data and error codes
x Devices often support both polling and interrupts for optimization

**Direct Memory Access (DMA)**

Evolution from programmed I/O:
x CPU initiates DMA request and grants memory bus access
x Device transfers data directly to/from RAM
x Device interrupts CPU upon completion
x Significantly reduces CPU overhead

### → Device Drivers

Device drivers encapsulate device-specific interactions:

**Top Half** (System call path):
x Implements standard cross-device calls
x Operations: open(), close(), read(), write(), ioctl(), strategy()
x Initiates I/O operations
x May block threads until completion

**Bottom Half** (Interrupt routine):
x Handles input reception
x Manages output block transfers
x Wakes sleeping threads when I/O completes

probability: OS composition approximately 70% device drivers

### → Timing Interfaces

**Blocking Interface**
x Process sleeps until data ready (read())
x Process sleeps until device ready (write())

**Non-blocking Interface**
x Returns immediately with transfer count
x May return zero bytes transferred

**Asynchronous Interface**
x Takes buffer pointer, returns immediately
x Kernel fills/empties buffer and notifies user
x Supports polling or callback mechanisms

### → Storage Device Categories

**Magnetic Disks (HDDs)**
x Rarely corrupted storage
x Large capacity, low cost
x Block-level random access
x Slow random access performance
x Better sequential access performance

**Flash Memory (SSDs)**
x Rarely corrupted storage
x Intermediate cost (5-20x disk)
x Block-level random access
x Good read performance
x Degraded random write performance
x Wear leveling requirements

---

## Lecture 18: Storage Devices & File Systems

### → Storage Performance Metrics

**Latency**: Time to complete single operation (measured in time units)
**Throughput/Bandwidth**: Rate of operation completion (operations per time unit)
**Overhead**: Time to initiate operation

Modeling Language: `Latency(b) = Overhead + b/TransferCapacity`

### → Hard Disk Drive Architecture

**Physical Components**
x Rotating platters (glass, ceramic, or aluminum)
x Magnetic thin film for data storage
x Read/write heads positioning over tracks

**Organizational Structure**
x **Track**: Concentric circles on platter surface
x **Sector**: Slice of track (smallest addressable unit)
x **Cylinder**: All tracks under heads at given position

**Capacity Evolution**
x Modern drives: 18TB capacity (Seagate, 9 platters)
x Areal density: ≥1 Terabit/square inch
x Historical comparison: 1986 IBM PC 30MB for $500

### → Disk Operation Timing

**Access Components**
1. **Seek Time**: Position head over track (4-6ms typical)
2. **Rotational Latency**: Wait for sector rotation (4-8ms average)
3. **Transfer Time**: Data transfer under head (50-250 MB/s)

**Performance Calculations**

Example configuration:
x 5ms average seek time
x 7200 RPM rotation
x 50 MB/s transfer rate
x 4KB block size

Random read performance:
x Total time: 5ms (seek) + 4ms (rotation) + 0.082ms (transfer) = 9.082ms
x Effective rate: 451 KB/s

Sequential read performance:
x Time: 0.082ms (transfer only)
x Effective rate: 50 MB/s

### → Disk Scheduling Algorithms

**FIFO (First In First Out)**
x Fair to all requesters
x May result in random disk head movement

**SSTF (Shortest Seek Time First)**
x Minimizes seek distance
x Risk of starvation for distant requests

**SCAN (Elevator Algorithm)**
x Services requests in direction of travel
x Prevents starvation while maintaining efficiency

**C-SCAN (Circular SCAN)**
x Unidirectional servicing
x Returns to start without servicing
x Fairer distribution than SCAN

### → Solid State Drive Technology

**Flash Cell Types**

**Single-Level Cell (SLC)**
x One bit per transistor
x 50k-100k write cycles
x Higher performance and durability

**Multi-Level Cell (MLC)**
x 2-3 bits per cell
x 1k-10k write cycles
x Higher density, lower cost

### → Flash Memory Organization

Hierarchical structure:
x **Banks**: Parallel access capability
x **Blocks**: 128-256KB (erase unit)
x **Pages**: Few KB (write unit)
x **Cells**: 1-4 bits storage

### → Flash Operations

**Read Operation**
x Page-level granularity
x 10s of microseconds latency
x Independent of previous operations

**Write Operation**
1. Erase entire block (milliseconds)
2. Program individual pages (100s microseconds)
3. Limited erase cycles per block

### → Flash Translation Layer (FTL)

**Core Functions**
x Maps logical blocks to physical pages
x Reduces write amplification
x Implements wear leveling

**Key Principles**
x **Indirection**: Virtual to physical block mapping
x **Copy-on-Write**: Write new versions to free pages
x **Garbage Collection**: Reclaim invalid pages

### → File System Architecture

The file system transforms block device interfaces into user-visible abstractions:

**User View**
x Named files and directories
x Durable data structures

**System Call Interface**
x Collection of bytes (UNIX model)
x Agnostic to user data structures

**Internal OS View**
x Collection of blocks (typically 4KB)
x Block-based operations

### → File System Components

**Superblock**: File system metadata
**Free Bitmaps**: Allocation tracking
**Inode**: Individual file representation
**Dentry**: Directory entry components
**File Object**: Open file process association
**Data Blocks**: Actual file storage

### → Inode Structure

The inode serves as the fundamental file representation:
x Contains file metadata
x Points to data blocks
x Referenced by inode number
x Accessed through directory lookups

### → Directory Implementation

Directories are specialized files containing:
x File name to inode number mappings
x Support for hierarchical organization
x System calls: open, creat, readdir, mkdir, rmdir, link, unlink

### → File Access Process

Reading `/foo/bar.txt`:
1. Traverse directory structure
2. Locate inode number in directory
3. Read inode metadata
4. Access data blocks
5. Return requested data

### → Design Considerations

**Critical Factors**
x Disk performance optimization
x Dynamic size management
x Directory organization efficiency
x Block allocation/deallocation strategies

**Performance Comparisons**

HDD characteristics:
x Mechanical seek requirements
x Single head limitations
x Moving parts vulnerability
x 10s milliseconds random access

SSD characteristics:
x No mechanical delays
x Parallel operations support
x No moving parts
x 10s microseconds random access
x Wear limitations
x Higher cost per GB (declining)