---
id: ds-u2
title: DS Unit 2 — Stacks, Expressions, Merge/Quick Sort & Queues
subject: ds
unit: 2
date: 2026-02-15
featured: true
tags: stack, infix, prefix, postfix, merge sort, quick sort, queue, circular queue, priority queue
description: Stacks with array/linked-list implementation and operations; infix, prefix and postfix conversions and evaluation; merge sort and quick sort with worked traces; linear, circular and priority queues with implementations and applications.
---

# Stacks

A ==stack== is a linear structure that allows insertions and deletions **only at one end (the top)** — **Last-In-First-Out (LIFO)**.

## Operations

| Operation | Action | Array implementation |
|---|---|---|
| **PUSH(x)** | insert x on top | `if top == MAX-1 → overflow; a[++top] = x;` |
| **POP()** | remove top element | `if top == -1 → underflow; return a[top--];` |
| **PEEK/PEEKTOP()** | read top, no removal | `return a[top];` |
| **isEmpty()** | check empty | `top == -1` |
| **isFull()** | check full | `top == MAX-1` |

`top = -1` is the empty-stack sentinel; PUSH increments top, POP decrements it.

## Array implementation

```cpp
class Stack {
    int *a, top, cap;
public:
    Stack(int cap_) : cap(cap_), top(-1) { a = new int[cap]; }
    ~Stack() { delete[] a; }
    void push(int x) {
        if (top == cap - 1) { cout << "Overflow!\n"; return; }
        a[++top] = x;
    }
    int pop() {
        if (top < 0) { cout << "Underflow!\n"; return -1; }
        return a[top--];
    }
    bool isEmpty() const { return top < 0; }
};
```

## Linked-List implementation

Memory is allocated per node — no overflow until heap exhaustion. `top` is the head pointer.

## Applications

- Function calls and **recursion** (activation records).
- **Expression evaluation** (postfix) and conversions.
- Undo/redo in editors, back/forward in browsers, backtracking (maze, N-queens).
- Balanced parentheses / delimiter matching.

# Polish Notation — Infix, Prefix, Postfix

| Form | Operator position | Example |
|---|---|---|
| **Infix** | between operands | `A + B * C` |
| **Prefix** (Polish) | before operands | `+ A * B C` |
| **Postfix** (Reverse Polish) | after operands | `A B C * +` |

- Humans read infix; **computers prefer postfix** (no precedence, no parentheses, single left-to-right scan).
- Same expression: **infix** `(A + B) * C` = **prefix** `* + A B C` = **postfix** `A B + C *`.

## Rules for infix → postfix

1. Scan left to right; operands go straight to output.
2. On an operator: pop output any operators on the stack with **higher or equal** precedence; then push it.
3. On `(`: push. On `)`: pop until `(` (discard the `(`).
4. End: pop everything remaining.

Precedence (high→low): `^` (exponent) > `* /` > `+ -`; associativity matters for `^` (right).

## Worked example: `A + B * C − D → A B C * + D −`

| Symbol | Action | Stack | Output |
|---|---|---|---|
| A | operand → output | | A |
| + | push | + | A |
| B | operand | + | A B |
| * | push (higher than +) | + * | A B |
| C | operand | + * | A B C |
| − | pop `*`, pop `+`, push `−` | − | A B C * + |
| D | operand | − | A B C * + D |
| end | pop all | | A B C * + D − |

## Rules for infix → prefix

Reverse the infix string (swap `(` ↔ `)`), convert to **postfix**, then reverse the result.

> A + B * C &rarr; reverse `C * B + A` &rarr; postfix `C B * A +` &rarr; reverse `+ A * B C` ✔

## Postfix evaluation

1. Scan left to right. Operand → push.
2. Operator → pop two operands (b = pop, a = pop), compute `a op b`, push result.
3. End — top of stack is the answer.

```cpp
int evalPostfix(const string& expr) {
    Stack s(100);                      // assume Stack holds ints
    for (char c : expr) {
        if (isdigit(c)) s.push(c - '0');
        else {
            int b = s.pop(), a = s.pop();
            if (c == '+') s.push(a + b);
            if (c == '-') s.push(a - b);
            if (c == '*') s.push(a * b);
            if (c == '/') s.push(a / b);
        }
    }
    return s.pop();
}
// "23 4 +"  →  27 ;  "6 2 / 3 +"  →  6
```

> [!TIP]
> Prefix can be evaluated by scanning **right to left** with the same algorithm.

# Merge Sort

==Merge sort== is a **divide and conquer**, **stable** sorting algorithm: split the array in half repeatedly, sort the halves, then **merge** them.

```text
MergeSort(a, low, high):
    if low < high:
        mid = (low + high) / 2
        MergeSort(a, low, mid)
        MergeSort(a, mid+1, high)
        Merge(a, low, mid, high)     // merge two sorted halves
```

```cpp
void merge(int a[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int *L = new int[n1], *R = new int[n2];
    for (int i = 0; i < n1; i++) L[i] = a[l + i];
    for (int j = 0; j < n2; j++) R[j] = a[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) a[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) a[k++] = L[i++];
    while (j < n2) a[k++] = R[j++];
    delete[] L; delete[] R;
}

void mergeSort(int a[], int l, int r) {
    if (l < r) {
        int m = (l + r) / 2;
        mergeSort(a, l, m);
        mergeSort(a, m + 1, r);
        merge(a, l, m, r);
    }
}
```

**Worked trace** `38 27 43 3`

```text
[38 27 43 3]
├─ [38 27] ─ [38] [27] ─ merge → [27 38]
└─ [43 3]  ─ [43] [3]  ─ merge → [3 43]
        merge [27 38] + [3 43] → [3 27 38 43]
```

| Complexity | Value |
|---|---|
| Best / Average / Worst | **O(n log n)** |
| Space | O(n) auxiliary |

# Quick Sort

==Quick sort== is a **divide and conquer**, **in-place** (O(log n) stack space) algorithm: pick a **pivot**, partition the array so smaller elements go left and larger go right, then recurse on both parts.

```text
QuickSort(a, low, high):
    if low < high:
        pi = Partition(a, low, high)   // pivot lands in place
        QuickSort(a, low, pi-1)
        QuickSort(a, pi+1, high)

Partition (Lomuto, pivot = a[high]):
    i = low - 1
    for j = low to high-1:
        if a[j] < pivot: i++; swap a[i], a[j]
    swap a[i+1], a[high]
    return i+1
```

```cpp
int partition(int a[], int lo, int hi) {
    int pivot = a[hi], i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) { i++; std::swap(a[i], a[j]); }
    }
    std::swap(a[i + 1], a[hi]);
    return i + 1;
}

void quickSort(int a[], int lo, int hi) {
    if (lo < hi) {
        int pi = partition(a, lo, hi);
        quickSort(a, lo, pi - 1);
        quickSort(a, pi + 1, hi);
    }
}
```

**Worked trace** `10 80 30 90 40 50 70` (pivot = last element)

| Pass | Partition result | Recursive calls |
|---|---|---|
| 1 | `10 30 40 50 70 90 80` (pivot 70 at index 4) | left `10 30 40 50`, right `90 80` |
| 2 | left → `10 30 40 50` (pivot 50); right → `80 90` | … |
| 3 | sorted: `10 30 40 50 70 80 90` | — |

| Complexity | Value |
|---|---|
| Best / Average | **O(n log n)** |
| Worst | **O(n²)** (already sorted with bad pivot choice — pick middle/random pivot) |
| Space | O(log n) (stack) |

> [!WARNING]
> Classic interview/exam trap: quick sort worst case is O(n²) when the pivot is always the smallest/largest element (e.g., already-sorted input with a naive pivot). Merge sort is always O(n log n) but needs O(n) extra space. Choose accordingly.

# Queues

A ==queue== is a linear structure with insertions at the **rear** and deletions at the **front** — **First-In-First-Out (FIFO)**.

## Operations

| Operation | Array implementation |
|---|---|
| **ENQUEUE(x)** | `if rear == MAX-1 → overflow; a[++rear] = x;` |
| **DEQUEUE()** | `if front > rear → underflow; return a[front++];` |
| **isEmpty()** | `front > rear` |

## Sequential linear queue problem

With `a[++rear]` insertion and `front++` removal, deleted cells at the front are **never reused** — the queue "drifts" to the right and reports overflow while the front is empty. → **Circular queue** fixes this.

# Circular Queue

The array wraps around: `rear = (rear + 1) % MAX`, `front = (front + 1) % MAX`. One slot is left empty to distinguish empty from full.

```cpp
class CircularQueue {
    int *a, front, rear, cap, count;
public:
    bool enqueue(int x) {
        if (count == cap) return false;      // full
        a[rear] = x;
        rear = (rear + 1) % cap;             // wrap
        count++;
        return true;
    }
    int dequeue() {
        if (count == 0) return -1;           // empty
        int x = a[front];
        front = (front + 1) % cap;           // wrap
        count--;
        return x;
    }
};
```

| Point | Linear queue | Circular queue |
|---|---|---|
| Space reuse | no — front cells wasted | yes — wraps around |
| full condition | `rear == MAX-1` | `count == cap` (or front–rear pattern) |
| Complexity | all O(1) | all O(1) |
| Use | teaching, simple | real buffers, scheduling |

# Priority Queue

In a ==priority queue==, **dequeue always removes the highest (or lowest) priority** element, regardless of arrival order. Implementations:

| Implementation | Enqueue | Dequeue | Notes |
|---|---|---|---|
| Unordered array/list | O(1) | O(n) scan for max | simple |
| Sorted array | O(n) insertion | O(1) | one end is fixed (unless deque) |
| **Binary heap** | **O(log n)** | **O(log n)** | the standard choice |
| Linked list | O(n) | O(1) | keep sorted |

```cpp
// Min-heap based priority queue (standard library)
#include <queue>
std::priority_queue<int, std::vector<int>, std::greater<int>> pq; // min at top
pq.push(30); pq.push(10); pq.push(20);
// top() = 10 ; pop() removes 10, then 20, then 30
```

**Applications of priority queues**: Dijkstra's shortest path, scheduling (OS), Huffman coding, A* search, patient triage.

# Applications of queues

- CPU / process **scheduling** (FCFS), print spooling.
- **Breadth-First Search** in graphs.
- Buffering: keyboard, network packets, producer-consumer.
- Waiting lines/queuing systems, breadth-first traversal of trees.

# Quick Revision

| Structure | Rule | Implementations | Typical cost |
|---|---|---|---|
| Stack | LIFO, push/pop at top | array, linked list | O(1) |
| Postfix eval | single scan + stack | | O(n) |
| Merge sort | divide, sort, merge | | O(n log n) time, O(n) space |
| Quick sort | pivot + partition | | O(n log n) avg |
| Linear queue | FIFO | array | O(1) but wasted space |
| Circular queue | wrap around | array % cap | O(1) |
| Priority queue | highest priority first | heap | O(log n) |

# Practice Questions

1. Implement a stack using an array; write PUSH, POP, PEEK with overflow/underflow checks.
2. Convert `A * (B + C) / D` to postfix, showing the stack at every step.
3. Evaluate `5 3 2 * + 8 4 / -` and state the result.
4. Convert `(A − B) * (C + D)` to prefix.
5. Trace merge sort on `12 11 13 5 6 7`; state its time and space complexity.
6. Trace quick sort on `9 4 7 3 8 2 5`; explain the worst case.
7. Differentiate a linear queue from a circular queue with a diagram.
8. Implement ENQUEUE/DEQUEUE for a circular queue with front/rear wraparound.
9. What is a priority queue? Compare array, sorted list and heap implementations.
10. Give five real applications of stacks and five of queues.