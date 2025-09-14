## Advanced Algorithms and Optimization

### Key Learnings
- Dynamic Programming: Breaking problems into overlapping subproblems
- Memoization: Storing results of expensive function calls
- Greedy algorithms: Making locally optimal choices
- Backtracking: Exploring all possible solutions
- Time and space complexity analysis of advanced algorithms

### Examples and Explanations
Fibonacci with Memoization:
```java
public int fibonacci(int n, Map<Integer, Integer> memo) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    
    int result = fibonacci(n-1, memo) + fibonacci(n-2, memo);
    memo.put(n, result);
    return result;
}
```

Knapsack Problem (Dynamic Programming):
```java
public int knapsack(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[][] dp = new int[n+1][capacity+1];
    
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= capacity; w++) {
            if (weights[i-1] <= w) {
                dp[i][w] = Math.max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w]);
            } else {
                dp[i][w] = dp[i-1][w];
            }
        }
    }
    return dp[n][capacity];
}
```