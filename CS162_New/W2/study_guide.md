# CS162 Operating Systems and Systems Programming
## Lecture 3: Processes (Continued)

### 1.1 Process and Kernel Fundamentals

→ **The Process**
A process represents an executing program with restricted rights. The enforcement mechanism must maintain security without hindering functionality or degrading performance. Each process operates through layered interaction: Process → OS → Hardware.

→ **Operating System Kernel**
The kernel constitutes the lowest level of the OS running on the system. It maintains trusted status with full access to all hardware capabilities. All other software, including the rest of the OS and applications, operates in untrusted mode with restricted access.

→ **Dual Mode Operation**
The system employs a bit to enable two distinct execution modes:
- User Mode: Processor checks each instruction before execution, executing only a limited safe instruction set
- Kernel Mode: OS executes with protection checks disabled, capable of executing any instructions

### 1.2 Hardware Support Requirements

The hardware must provide four critical support mechanisms:

x **Privileged Instructions**: Unsafe instructions cannot execute in user mode
x **Memory Isolation**: Memory accesses outside a process's address space remain prohibited
x **Interrupts**: Ensure kernel can regain control from running processes
x **Safe Transfers**: Correctly transfer control between user-mode and kernel-mode

### 1.3 Safe Control Transfer Mechanisms

→ **Transfer Types**
Safe control transfer occurs through three primary mechanisms:
1. System Calls - Synchronous user program requests for OS services
2. Exceptions - Synchronous unexpected conditions from user program behavior
3. Interrupts - Asynchronous signals indicating external events requiring attention

→ **System Calls**
System calls transfer control to kernel at well-defined locations. Linux 3.0 contains 336 system calls handling operations from file I/O to process creation. The system call interface serves as the "narrow waist" separating user applications from kernel services.

→ **Exceptions**
Exceptions halt process execution and enter kernel at specific handlers. Common triggers include division by zero, attempts to write read-only memory, privileged instruction execution in user mode, and debugger breakpoints.

→ **Interrupts**
Interrupts provide asynchronous notification of external events. Types include timer interrupts, I/O interrupts, and interprocessor interrupts. The processor stops current execution and enters designated interrupt handlers.

### 1.4 The Stack Architecture

→ **Address Space Organization**
Process address space contains four primary regions:
- Code: Program instructions
- Data: Global variables
- Heap: Dynamically allocated memory during runtime
- Stack: Temporary data including function parameters, return addresses, local variables

→ **Stack Terminology**
x Stack Frame: All stack information pertaining to a function call
x Frame Pointer (%ebp): Contains base address of function's frame
x Stack Pointer (%esp): Points to next item on stack
x Instruction Pointer (%eip): Indicates current address of executing program

→ **Call Stack Operation**
Function calls create new stack frames containing saved frame pointers, function parameters loaded in reverse order, local variables, and return addresses. The leave instruction restores caller's frame while ret pops EIP restoring control flow.

### 1.5 User to Kernel Mode Transition

→ **Key Requirements**
Three requirements ensure safe kernel entry:
1. Limited Entry - Cannot jump to arbitrary kernel code
2. Atomic Switch - Switch from process stack to kernel stack
3. Transparent Execution - Restore prior state to continue program

→ **Interrupt Handling Process**
1. Processor detects interrupt signal from APIC
2. Hardware suspends user program, saves recovery state (ESP, EIP, EFLAGS)
3. System switches to kernel stack atomically
4. Control unit sets EIP to handler from Interrupt Vector Table
5. Handler saves remaining registers and implements logic
6. System restores user program state via iret instruction

→ **Two Stack Architecture**
Each process maintains separate user and kernel stacks. The kernel stack stores recovery state during mode transitions. Stack switching prevents malicious corruption and maintains privacy between execution contexts.

→ **Concurrent Interrupt Handling**
Hardware provides instructions to temporarily defer interrupt delivery. Interrupts remain disabled during handler execution. Disabled periods must remain minimal to maintain system responsiveness.

## Lecture 4: Systems Programming - Processes and Communication

### 2.1 Process Management API

→ **Core System Calls**
The Unix process API maintains simplicity through six fundamental calls:
- exit: Terminate a process
- fork: Copy the current process
- exec: Change the program being run
- wait: Wait for process completion
- kill: Send signals to processes
- sigaction: Set signal handlers

→ **Process Family Tree**
Linux processes form a hierarchical tree structure. Each process maintains exactly one parent while supporting multiple children. All processes originate from the init process (PID 1).

### 2.2 Fork System Call

→ **Fork Operation**
Fork creates a new child process as a complete copy of the parent. The operation duplicates:
- Address space including code/data segments
- Register values including PC and SP
- Stack contents
- File descriptors

→ **Fork Implementation**
The kernel performs these steps:
1. Allocates new PCB
2. Duplicates register values, address space, flags, open files
3. Allocates new PID
4. Marks process as READY state

→ **Fork Return Values**
Fork returns different values to distinguish processes:
- Parent receives child's PID (positive value)
- Child receives 0
- Negative value indicates failure

Both processes resume execution from the fork call with identical state except for return value. Process scheduling determines execution order with arbitrary interleaving possible.

### 2.3 Exec System Call

→ **Program Replacement**
Exec replaces the running program entirely. The system call handler:
1. Replaces code and data segments
2. Sets EIP to new program start
3. Reinitializes SP and FP
4. Pushes program arguments onto stack

The fork/exec pattern enables process creation: parent forks child, child executes new program via exec.

### 2.4 Wait and Exit

→ **Process Synchronization**
Wait blocks parent execution until child termination. Parents retrieve child exit status through wait parameter. Exit terminates process execution returning status to parent.

### 2.5 Signals

→ **Signal Mechanism**
Signals provide short asynchronous messages between processes. They notify processes of specific events and enable custom handler execution. Each signal has a default action overridable through sigaction.

Common signals include SIGINT (Ctrl+C termination) and timer signals for periodic condition checking. Signal handlers execute as kernel-to-user mode transitions with program control resuming at interrupted instruction.

### 2.6 Unix I/O Interface

→ **Everything is a File**
Unix provides uniform I/O interface for:
- Device input/output
- File reading/writing
- Interprocess communication
- Network operations

→ **Core I/O Principles**
x **Uniformity**: Same system calls (open, read, write, close) for all I/O
x **Open Before Use**: Explicit open required for resources
x **Byte-Oriented**: All devices accessed through byte arrays
x **Kernel Buffering**: Data buffered in kernel decoupling internals from applications
x **Explicit Close**: Resources require explicit closure

### 2.7 File Descriptors

→ **File Descriptor Architecture**
File descriptors uniquely identify open I/O resources. They index into per-process file descriptor tables. Standard descriptors include:
- 0: STDIN
- 1: STDOUT
- 2: STDERR

→ **Open File Description Table**
Each file descriptor references an entry in the system-wide open file table containing:
- File offset tracking current position
- Access mode from open call
- Status flags
- Reference to physical location (inode)
- Reference count

→ **File Operations**
x open/creat: Opens files returning lowest available descriptor
x close: Releases descriptor for reuse
x read: Reads data using file descriptor
x write: Writes data using file descriptor
x lseek: Repositions file offset

File operations maintain shared state through the open file table. Multiple descriptors can reference the same open file description. Offset updates affect all references to the same description.