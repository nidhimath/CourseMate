# CS162 Operating Systems Study Notes

## 1.1 Introduction to Operating Systems

→ The modern computing environment presents significant challenges for OS design. Operating systems must manage diverse hardware ranging from smartwatches to laptops, each running complex software systems. Every device requires an OS that interfaces with hardware resources and manages multiple applications simultaneously.

→ Bell's Law demonstrates the evolution of computing devices over time. A new device class emerges approximately every 10 years, evolving from mainframes (103:1 computers per person) through personal computers (1:1) to modern IoT devices (1:106). This progression shows computing shifting from number crunching and data storage toward productivity applications and finally streaming from/to the physical world.

## 1.2 Operating System Complexity

→ Software complexity has grown dramatically over decades. Modern operating systems contain millions of lines of code - Linux 5.6 (2020) contains approximately 140 million lines compared to the original Unix with just thousands. This complexity stems from multiple factors:

x Better reliability and security requirements
x Energy efficiency demands  
x Performance optimization needs (efficient code, parallel execution)
x Legacy system support

→ Hardware complexity continues increasing as processors become "smarter." Intel Skylake-X architectures demonstrate this with Direct Media Interface connections, multiple memory channels for high bandwidth DRAM, PCI Express lanes for high-speed I/O devices, SATA interfaces for storage, and integrated Ethernet capabilities.

## 1.3 Operating System Definition

→ An operating system serves as the software layer interfacing between diverse hardware resources and applications running on the machine. It implements a virtual machine whose interface proves more convenient than raw hardware interfaces by providing security, reliability, and portability abstractions.

→ The OS fulfills three primary roles:

**Referee** - Manages protection, isolation, and resource sharing between applications. Implements fault isolation to separate programs from each other and the OS. Determines resource allocation through scheduling algorithms and enables controlled communication via pipes/sockets.

**Illusionist** - Provides clean abstractions of physical resources through virtualization. Creates illusions that each application has exclusive resource use, that hardware capabilities not physically present exist, and that hardware resources appear infinite.

**Glue** - Delivers common standard services to applications, maximizing code reuse and enabling independent component evolution. Standard primitives like file systems, network interfaces, and GUI frameworks simplify sharing between applications.

## 1.4 Evaluation Criteria

→ Operating systems must satisfy multiple evaluation criteria:

**Performance** - The OS implements abstractions efficiently with low overhead while maintaining fairness in resource distribution. Key metrics include response time for task completion, throughput for groups of tasks, and predictability of performance over time.

**Reliability** - System performs its intended functions correctly. OS failures prove catastrophic, making availability (mean time to failure + mean time to repair) critical.

**Security** - Minimizes vulnerability to attacks while maintaining system integrity and data privacy. Enforcement policy determines how the OS ensures only permitted actions occur, while security policy defines what actions are permitted.

**Portability** - Abstractions remain unchanged as hardware evolves. Applications cannot require rewriting for new hardware platforms. The Hardware Abstraction Layer provides this separation between OS and hardware.

## 2.1 Process Abstraction

→ A process represents an instance of a running program with restricted rights. Each process contains:

x Memory (address space) storing code, data, stack, and heap
x CPU registers including Program Counter and Stack Pointer  
x I/O information including open files

→ The Process Control Block (PCB) stores metadata the OS requires for process management. This includes process ID (PID), user ID (UID), process state, register values, open file lists, and scheduling information. The kernel maintains process lists, run queues for READY processes, and wait queues for BLOCKED processes.

## 2.2 Process Life Cycle

→ Processes transition through multiple states during execution:

x **Running** - Currently executing on CPU
x **Ready** - Waiting for CPU allocation
x **Blocked** - Waiting for I/O or event completion
x **Dying** - Process termination phase

Transitions occur when processes get scheduled/descheduled, request I/O operations, or complete I/O operations.

## 2.3 Protection Through Dual Mode Operation

→ Hardware provides dual mode operation using a mode bit distinguishing between:

**Kernel Mode** - OS executes with protection checks disabled, accessing any hardware operations directly. Only trusted kernel code runs in this mode.

**User Mode** - Applications execute with dangerous operations disabled. The processor checks each instruction before execution, permitting only safe instruction subsets.

→ This dual mode design preserves functionality, performance, and control while enforcing protection. Simulation alternatives prove too slow since most operations are inherently safe and don't require checking.

## 2.4 Hardware Protection Requirements

→ Four critical hardware mechanisms enable protection:

**1. Privileged Instructions** - Certain operations cannot execute in user mode:
x Changing privilege level (mode bit modification)
x Modifying address space
x Disabling interrupts
x Performing I/O operations
x Halting the processor

**2. Memory Isolation** - Hardware prevents memory accesses outside a process's allocated address space. This protects kernel memory and other applications' memory from unauthorized access.

**3. Interrupts** - Hardware timer interrupts ensure the kernel regains control from running processes. Timer reset remains a privileged operation, preventing processes from monopolizing the CPU.

**4. Safe Transfers** - Controlled transitions between user and kernel modes occur only at OS-specified locations through system calls and exceptions.

## 2.5 System Calls and Exceptions

→ Applications access kernel functionality through controlled mechanisms:

**System Calls** - Deliberate requests for kernel services, transitioning from user to kernel mode at specific OS-defined entry points.

**Exceptions** - Generated when user code attempts privileged operations, transferring control to kernel exception handlers at predetermined locations.

→ These mechanisms maintain the protection boundary while enabling necessary OS services for application functionality.

## 2.6 Virtual Memory Protection

→ Memory protection prevents catastrophic system failures from application bugs. Historical examples demonstrate the importance:

x Game bugs allowing characters to overwrite kernel memory
x Super Mario Land 2 level exit exploit exploring entire system memory
x Slug creatures in games deleting memory walls and corrupting RAM

→ Virtual memory systems provide essential isolation between processes and the kernel, preventing such failures in modern systems.