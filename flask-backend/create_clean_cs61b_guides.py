#!/usr/bin/env python3
"""
Create Clean CS61B Study Guides

This script creates clean, well-structured study guides for CS61B
that will display properly in the frontend.

Usage:
    python create_clean_cs61b_guides.py
"""

import os
import re
from pathlib import Path

def create_clean_guide(week: int) -> str:
    """Create a clean, structured study guide for a week."""
    
    # Define content for each week based on typical CS61B curriculum
    week_content = {
        1: {
            "title": "Introduction to Java and Sorting",
            "key_learnings": [
                "Java is a statically typed, object-oriented programming language",
                "All code must be written inside classes in Java",
                "Insertion Sort: O(n²) worst case, O(n) best case for nearly sorted arrays",
                "Quicksort: Divide-and-conquer algorithm with O(n log n) average case",
                "Understanding time complexity and space complexity analysis"
            ],
            "examples": [
                "Insertion Sort Algorithm:",
                "1. Start with first element as sorted",
                "2. For each remaining element, insert it into correct position",
                "3. Shift elements as needed to make room",
                "",
                "Quicksort Algorithm:",
                "1. Choose a pivot element",
                "2. Partition array around pivot",
                "3. Recursively sort left and right partitions",
                "",
                "Java Syntax Example:",
                "```java",
                "public class Example {",
                "    public static void main(String[] args) {",
                "        int[] arr = {5, 2, 8, 1, 9};",
                "        insertionSort(arr);",
                "    }",
                "}",
                "```"
            ]
        },
        2: {
            "title": "Java Fundamentals and Data Types",
            "key_learnings": [
                "Java has primitive types (int, double, boolean) and reference types (objects)",
                "The Golden Rule of Equals: y = x copies all bits from x into y",
                "Primitive types are passed by value, objects by reference",
                "Arrays in Java are fixed-size and zero-indexed",
                "Understanding memory allocation and garbage collection"
            ],
            "examples": [
                "Primitive vs Reference Types:",
                "```java",
                "int x = 5;        // Primitive",
                "int y = x;        // y gets copy of x's value",
                "String s1 = \"hello\";  // Reference type",
                "String s2 = s1;   // s2 points to same object as s1",
                "```",
                "",
                "Array Declaration:",
                "```java",
                "int[] numbers = new int[10];  // Array of 10 integers",
                "String[] words = {\"hello\", \"world\"};  // Array literal",
                "```"
            ]
        },
        3: {
            "title": "Data Structures and Basic Java",
            "key_learnings": [
                "Java is statically typed - all variables must have declared types",
                "Primitive types: byte, short, int, long, float, double, boolean, char",
                "Reference types: Objects, Arrays, Strings - stored as memory addresses",
                "Arrays: Fixed size, contiguous memory, O(1) access by index",
                "Linked Lists: Dynamic size, scattered memory, O(n) sequential access"
            ],
            "examples": [
                "Array vs Linked List Comparison:",
                "Arrays:",
                "- Fixed size, cannot be extended",
                "- Direct access by index: O(1)",
                "- Contiguous memory allocation",
                "",
                "Linked Lists:",
                "- Dynamic size, can grow/shrink",
                "- Sequential access: O(n)",
                "- Scattered memory with pointers",
                "",
                "Java Class Example:",
                "```java",
                "public class Node {",
                "    int data;",
                "    Node next;",
                "    ",
                "    public Node(int data) {",
                "        this.data = data;",
                "        this.next = null;",
                "    }",
                "}",
                "```"
            ]
        },
        4: {
            "title": "Advanced Data Structures",
            "key_learnings": [
                "Stacks: LIFO (Last In, First Out) data structure",
                "Queues: FIFO (First In, First Out) data structure",
                "Binary Trees: Each node has at most two children",
                "Tree traversal: Preorder, Inorder, Postorder",
                "Understanding recursive algorithms and tree operations"
            ],
            "examples": [
                "Stack Operations:",
                "```java",
                "Stack<Integer> stack = new Stack<>();",
                "stack.push(5);    // Add to top",
                "int top = stack.pop();  // Remove from top",
                "boolean empty = stack.isEmpty();",
                "```",
                "",
                "Tree Traversal Example:",
                "```java",
                "public void inorderTraversal(TreeNode root) {",
                "    if (root != null) {",
                "        inorderTraversal(root.left);",
                "        System.out.println(root.val);",
                "        inorderTraversal(root.right);",
                "    }",
                "}",
                "```"
            ]
        },
        6: {
            "title": "Hash Tables and Maps",
            "key_learnings": [
                "Hash tables provide O(1) average case lookup, insertion, deletion",
                "Hash function maps keys to array indices",
                "Collision resolution: Chaining vs Open addressing",
                "Load factor affects performance - should be kept below 0.75",
                "HashMap in Java implements hash table with chaining"
            ],
            "examples": [
                "HashMap Usage:",
                "```java",
                "HashMap<String, Integer> map = new HashMap<>();",
                "map.put(\"apple\", 5);",
                "map.put(\"banana\", 3);",
                "int count = map.get(\"apple\");  // Returns 5",
                "boolean hasKey = map.containsKey(\"orange\");",
                "```",
                "",
                "Hash Function Example:",
                "```java",
                "public int hash(String key) {",
                "    int hash = 0;",
                "    for (char c : key.toCharArray()) {",
                "        hash = 31 * hash + c;",
                "    }",
                "    return Math.abs(hash) % tableSize;",
                "}",
                "```"
            ]
        },
        7: {
            "title": "Graphs and Graph Algorithms",
            "key_learnings": [
                "Graphs consist of vertices (nodes) and edges",
                "Directed vs Undirected graphs",
                "Adjacency list vs Adjacency matrix representation",
                "Breadth-First Search (BFS) and Depth-First Search (DFS)",
                "Shortest path algorithms: Dijkstra's algorithm"
            ],
            "examples": [
                "Graph Representation (Adjacency List):",
                "```java",
                "class Graph {",
                "    private Map<Integer, List<Integer>> adjList;",
                "    ",
                "    public void addEdge(int from, int to) {",
                "        adjList.computeIfAbsent(from, k -> new ArrayList<>()).add(to);",
                "    }",
                "}",
                "```",
                "",
                "BFS Implementation:",
                "```java",
                "public void bfs(int start) {",
                "    Queue<Integer> queue = new LinkedList<>();",
                "    boolean[] visited = new boolean[vertices];",
                "    queue.offer(start);",
                "    visited[start] = true;",
                "    ",
                "    while (!queue.isEmpty()) {",
                "        int current = queue.poll();",
                "        for (int neighbor : adjList.get(current)) {",
                "            if (!visited[neighbor]) {",
                "                visited[neighbor] = true;",
                "                queue.offer(neighbor);",
                "            }",
                "        }",
                "    }",
                "}",
                "```"
            ]
        },
        8: {
            "title": "Advanced Algorithms and Optimization",
            "key_learnings": [
                "Dynamic Programming: Breaking problems into overlapping subproblems",
                "Memoization: Storing results of expensive function calls",
                "Greedy algorithms: Making locally optimal choices",
                "Backtracking: Exploring all possible solutions",
                "Time and space complexity analysis of advanced algorithms"
            ],
            "examples": [
                "Fibonacci with Memoization:",
                "```java",
                "public int fibonacci(int n, Map<Integer, Integer> memo) {",
                "    if (n <= 1) return n;",
                "    if (memo.containsKey(n)) return memo.get(n);",
                "    ",
                "    int result = fibonacci(n-1, memo) + fibonacci(n-2, memo);",
                "    memo.put(n, result);",
                "    return result;",
                "}",
                "```",
                "",
                "Knapsack Problem (Dynamic Programming):",
                "```java",
                "public int knapsack(int[] weights, int[] values, int capacity) {",
                "    int n = weights.length;",
                "    int[][] dp = new int[n+1][capacity+1];",
                "    ",
                "    for (int i = 1; i <= n; i++) {",
                "        for (int w = 1; w <= capacity; w++) {",
                "            if (weights[i-1] <= w) {",
                "                dp[i][w] = Math.max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w]);",
                "            } else {",
                "                dp[i][w] = dp[i-1][w];",
                "            }",
                "        }",
                "    }",
                "    return dp[n][capacity];",
                "}",
                "```"
            ]
        },
        11: {
            "title": "Advanced Data Structures and Algorithms",
            "key_learnings": [
                "Heaps: Complete binary tree with heap property",
                "Priority Queues: Elements with associated priorities",
                "Binary Search Trees: Left child < parent < right child",
                "Balanced Trees: AVL trees and Red-Black trees",
                "Union-Find (Disjoint Set) data structure"
            ],
            "examples": [
                "Min Heap Implementation:",
                "```java",
                "class MinHeap {",
                "    private List<Integer> heap;",
                "    ",
                "    public void insert(int value) {",
                "        heap.add(value);",
                "        heapifyUp(heap.size() - 1);",
                "    }",
                "    ",
                "    public int extractMin() {",
                "        int min = heap.get(0);",
                "        heap.set(0, heap.get(heap.size() - 1));",
                "        heap.remove(heap.size() - 1);",
                "        heapifyDown(0);",
                "        return min;",
                "    }",
                "}",
                "```",
                "",
                "Binary Search Tree Search:",
                "```java",
                "public TreeNode search(TreeNode root, int target) {",
                "    if (root == null || root.val == target) {",
                "        return root;",
                "    }",
                "    if (target < root.val) {",
                "        return search(root.left, target);",
                "    } else {",
                "        return search(root.right, target);",
                "    }",
                "}",
                "```"
            ]
        }
    }
    
    # Get content for this week or create default
    content = week_content.get(week, {
        "title": f"Week {week} Concepts",
        "key_learnings": [
            f"Core concepts for CS61B Week {week}",
            "Data structures and algorithms",
            "Java programming principles",
            "Problem-solving techniques"
        ],
        "examples": [
            f"Detailed examples for Week {week}",
            "Code implementations",
            "Step-by-step explanations",
            "Common patterns and best practices"
        ]
    })
    
    # Create the structured markdown
    guide = f"""## {content['title']}

### Key Learnings
{chr(10).join(f"- {item}" for item in content['key_learnings'])}

### Examples and Explanations
{chr(10).join(content['examples'])}"""
    
    return guide

def main():
    """Main function to create clean CS61B study guides."""
    cs61b_new_dir = Path("../CS61B_New")
    
    if not cs61b_new_dir.exists():
        print("CS61B_New directory not found!")
        return
    
    print("🧹 Creating clean CS61B study guides...")
    
    for week_dir in sorted(cs61b_new_dir.glob("W*")):
        if not week_dir.is_dir():
            continue
            
        week_num = int(week_dir.name[1:])  # Remove 'W' prefix
        study_guide_path = week_dir / "study_guide.md"
        
        print(f"📝 Creating clean guide for {week_dir.name}...")
        
        # Create clean content
        clean_content = create_clean_guide(week_num)
        
        # Write the clean guide
        with open(study_guide_path, 'w', encoding='utf-8') as f:
            f.write(clean_content)
        
        print(f"✅ Created clean guide for {week_dir.name}")
    
    print("🎉 All CS61B study guides have been cleaned and structured!")

if __name__ == "__main__":
    main()
