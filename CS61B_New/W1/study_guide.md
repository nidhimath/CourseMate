## Introduction to Java and Sorting

### Key Learnings
- Java is a statically typed, object-oriented programming language
- All code must be written inside classes in Java
- Insertion Sort: O(n²) worst case, O(n) best case for nearly sorted arrays
- Quicksort: Divide-and-conquer algorithm with O(n log n) average case
- Understanding time complexity and space complexity analysis

### Examples and Explanations
Insertion Sort Algorithm:
1. Start with first element as sorted
2. For each remaining element, insert it into correct position
3. Shift elements as needed to make room

Quicksort Algorithm:
1. Choose a pivot element
2. Partition array around pivot
3. Recursively sort left and right partitions

Java Syntax Example:
```java
public class Example {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};
        insertionSort(arr);
    }
}
```