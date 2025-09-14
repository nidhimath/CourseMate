## Hash Tables and Maps

### Key Learnings
- Hash tables provide O(1) average case lookup, insertion, deletion
- Hash function maps keys to array indices
- Collision resolution: Chaining vs Open addressing
- Load factor affects performance - should be kept below 0.75
- HashMap in Java implements hash table with chaining

### Examples and Explanations
HashMap Usage:
```java
HashMap<String, Integer> map = new HashMap<>();
map.put("apple", 5);
map.put("banana", 3);
int count = map.get("apple");  // Returns 5
boolean hasKey = map.containsKey("orange");
```

Hash Function Example:
```java
public int hash(String key) {
    int hash = 0;
    for (char c : key.toCharArray()) {
        hash = 31 * hash + c;
    }
    return Math.abs(hash) % tableSize;
}
```