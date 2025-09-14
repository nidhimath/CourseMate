## Advanced Data Structures

### Key Learnings
- Stacks: LIFO (Last In, First Out) data structure
- Queues: FIFO (First In, First Out) data structure
- Binary Trees: Each node has at most two children
- Tree traversal: Preorder, Inorder, Postorder
- Understanding recursive algorithms and tree operations

### Examples and Explanations
Stack Operations:
```java
Stack<Integer> stack = new Stack<>();
stack.push(5);    // Add to top
int top = stack.pop();  // Remove from top
boolean empty = stack.isEmpty();
```

Tree Traversal Example:
```java
public void inorderTraversal(TreeNode root) {
    if (root != null) {
        inorderTraversal(root.left);
        System.out.println(root.val);
        inorderTraversal(root.right);
    }
}
```