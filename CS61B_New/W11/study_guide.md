## Advanced Data Structures and Algorithms

### Key Learnings
- Heaps: Complete binary tree with heap property
- Priority Queues: Elements with associated priorities
- Binary Search Trees: Left child < parent < right child
- Balanced Trees: AVL trees and Red-Black trees
- Union-Find (Disjoint Set) data structure

### Examples and Explanations
Min Heap Implementation:
```java
class MinHeap {
    private List<Integer> heap;
    
    public void insert(int value) {
        heap.add(value);
        heapifyUp(heap.size() - 1);
    }
    
    public int extractMin() {
        int min = heap.get(0);
        heap.set(0, heap.get(heap.size() - 1));
        heap.remove(heap.size() - 1);
        heapifyDown(0);
        return min;
    }
}
```

Binary Search Tree Search:
```java
public TreeNode search(TreeNode root, int target) {
    if (root == null || root.val == target) {
        return root;
    }
    if (target < root.val) {
        return search(root.left, target);
    } else {
        return search(root.right, target);
    }
}
```