## Java Fundamentals and Data Types

### Key Learnings
- Java has primitive types (int, double, boolean) and reference types (objects)
- The Golden Rule of Equals: y = x copies all bits from x into y
- Primitive types are passed by value, objects by reference
- Arrays in Java are fixed-size and zero-indexed
- Understanding memory allocation and garbage collection

### Examples and Explanations
Primitive vs Reference Types:
```java
int x = 5;        // Primitive
int y = x;        // y gets copy of x's value
String s1 = "hello";  // Reference type
String s2 = s1;   // s2 points to same object as s1
```

Array Declaration:
```java
int[] numbers = new int[10];  // Array of 10 integers
String[] words = {"hello", "world"};  // Array literal
```