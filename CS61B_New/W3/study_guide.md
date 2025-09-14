## Data Structures and Basic Java

### Key Learnings
- Java is statically typed - all variables must have declared types
- Primitive types: byte, short, int, long, float, double, boolean, char
- Reference types: Objects, Arrays, Strings - stored as memory addresses
- Arrays: Fixed size, contiguous memory, O(1) access by index
- Linked Lists: Dynamic size, scattered memory, O(n) sequential access

### Examples and Explanations
Array vs Linked List Comparison:
Arrays:
- Fixed size, cannot be extended
- Direct access by index: O(1)
- Contiguous memory allocation

Linked Lists:
- Dynamic size, can grow/shrink
- Sequential access: O(n)
- Scattered memory with pointers

Java Class Example:
```java
public class Node {
    int data;
    Node next;
    
    public Node(int data) {
        this.data = data;
        this.next = null;
    }
}
```