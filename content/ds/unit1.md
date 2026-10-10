---
id: ds-u1
title: DS Unit 1 — Complexity, Recursion, Arrays & Searching/Sorting
subject: ds
unit: 1
date: 2026-02-09
featured: true
tags: arrays, sparse matrix, linear search, binary search, bubble sort, selection sort, insertion sort, big-o
description: Introduction to data structures, built-in vs user-defined types, algorithm analysis with worst/best/average case, Big-O/Omega/Theta notation, recursion, 1D/2D arrays and sparse matrices, linear and binary search, and selection, insertion and bubble sort — with algorithms, charts and C++ examples.
---

# Introduction to Data Structures

A ==data structure== is an organized way of storing and managing data so that operations (insert, delete, search, sort, update) are efficient. A good choice of data structure is often the difference between an O(n) and an O(log n) program.

## Data types

| Category | Meaning | Examples |
|---|---|---|
| **Built-in / primitive** | supplied by the language | `int`, `float`, `char`, `bool`, pointer |
| **Derived** | built from primitives | arrays, strings, functions |
| **User-defined** | defined by the programmer | `struct`, `class`, `union`, `enum`, linked structures |

## Linear vs Non-linear structures

| Linear | Non-linear |
|---|---|
| elements in a sequence | elements in a hierarchy |
| one-to-one relation | one-to-many relation |
| arrays, linked lists, stacks, queues | trees, graphs |

## Applications of data structures

- **Arrays** — matrices, lookup tables, buffers.
- **Stacks** — expression evaluation, function calls (recursion), undo, backtracking.
- **Queues** — scheduling (CPU, print spooling), BFS, buffers.
- **Linked lists** — dynamic memory, symbol tables, polynomial arithmetic.
- **Trees** — file systems, databases (B-trees), compilers (syntax trees).
- **Graphs** — networks, maps/GPS, social graphs, circuit design.

# Algorithm Analysis

An ==algorithm== is a finite sequence of well-defined steps to solve a problem. Analysis answers: **how much time? how much space?**

## Cases of analysis

| Case | When | Example (binary search) |
|---|---|---|
| **Best case** | data is favourable; fewest steps | key at the middle — O(1) |
| **Worst case** | data is unfavourable; most steps | key missing — O(log n) |
| **Average case** | expected over all inputs | O(log n) |

- **Time complexity** — number of basic operations as a function of input size `n`.
- **Space complexity** — memory used (input data + auxiliary space + stack) as a function of `n`.

## Asymptotic notations

| Notation | Meaning | Like "bounds" |
|---|---|---|
| **Big-O O(...)** | upper bound (worst case growth) | ≤ |
| **Omega Ω(...)** | lower bound (best case growth) | ≥ |
| **Theta Θ(...)** | tight bound (both) | = |

> [!DEFINITION]
> f(n) = O(g(n)) if ∃ c, n₀ such that **0 ≤ f(n) ≤ c·g(n)** for all n ≥ n₀ ("f grows no faster than g").
> f(n) = Ω(g(n)) if **f(n) ≥ c·g(n)** for n ≥ n₀.
> f(n) = Θ(g(n)) if both hold.

## Common growth rates (chart)

| n | log₂ n | n | n log₂ n | n² | 2ⁿ |
|---|---|---|---|---|---|
| 10 | 3 | 10 | 33 | 100 | 1,024 |
| 100 | 7 | 100 | 664 | 10⁴ | 1.3×10³⁰ |
| 1,000 | 10 | 10³ | 9,966 | 10⁶ | — |
| 10⁶ | 20 | 10⁶ | 2×10⁷ | 10¹² | — |

Ordered from fastest to slowest:

> O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(n³) &lt; O(2ⁿ) &lt; O(n!)

> [!TIP]
> Rule of thumb for counting steps: look at the **innermost loop** body. One loop over n → O(n); nested loops → O(n²); halving the search space each step → O(log n).

# Basics of Recursion

==Recursion== occurs when a function calls **itself** on a smaller instance. Two mandatory parts:

- **Base case** — stops the recursion (return without calling itself).
- **Recursive case** — reduces the problem size and calls itself.

```cpp
int sum(int n) {                 // sum of 1..n
    if (n == 0) return 0;        // base case
    return n + sum(n - 1);       // recursive case
}
```

- The **system stack** stores each pending call (activation record: parameters, locals, return address).
- **Stack overflow** occurs when recursion is too deep (no base case / huge depth).
- Every recursive program can be rewritten iteratively (using an explicit stack), and vice versa.
- **Tail recursion** (recursive call is the last statement) can be optimized into a loop by the compiler.

> [!EXAMPLE]
> `sum(4) = 4 + sum(3) = 4 + 3 + sum(2) = 4 + 3 + 2 + sum(1) = 4+3+2+1+0 = 10`. Each call is pushed, then popped back in reverse.

# Arrays

An ==array== is a collection of **homogeneous** elements stored in **contiguous memory**, accessed by an **index**. Elements are at fixed, computable addresses, so access is O(1).

```cpp
int a[5] = {10, 20, 30, 40, 50};   // 1-D array
// base address of a = &a[0];  a[i] is at base + i * sizeof(int)
```

## One-dimensional arrays

Formula: `address(a[i]) = base + i × size`

| Operation | Cost |
|---|---|
| access a[i] | O(1) |
| insert at position i (shifting) | O(n) |
| delete at position i | O(n) |
| linear search | O(n) |

## Two-dimensional arrays

`int a[R][C]` has R rows and C columns. Memory is laid out either way:

| Layout | Address of a[i][j] |
|---|---|
| **Row-major** (C, C++, Java) | `base + (i × C + j) × size` |
| **Column-major** (Fortran) | `base + (j × R + i) × size` |

```cpp
int marks[3][2] = { {71, 82}, {66, 90}, {88, 79} };
// marks[2][1]  (row-major): base + (2*2 + 1) * sizeof(int)
```

## Multi-dimensional arrays

For an n-dimensional array with dimensions d₁×d₂×…×dₙ (row-major):

> address = base + ((i₁·d₂·d₃…dₙ) + (i₂·d₃…dₙ) + … + iₙ) × size

More simply: treat it as nested arrays and apply the 2-D formula recursively.

# Sparse Matrices

A matrix is ==sparse== when most of its elements are **zero**. Storing every zero wastes huge amounts of memory, so we store **only non-zero elements**.

```text
A 6×6 matrix with 8 non-zero entries:
  0 0 3 0 0 0
  0 5 0 0 0 0
  0 0 0 0 0 9
  1 0 0 0 0 0
  0 0 0 2 0 6
  0 0 0 0 0 0
```

## Triplet (coordinate) representation — array of (row, col, value)

| Row | Col | Value |
|---|---|---|
| 0 | 2 | 3 |
| 1 | 1 | 5 |
| 2 | 5 | 9 |
| 3 | 0 | 1 |
| 4 | 3 | 2 |
| 4 | 5 | 6 |

```cpp
struct Triple { int row, col, val; };
// sparse = {rows=6, cols=6, nz=8, data[8]}
```

## Linked-list representation

Each non-zero element is a node with `(row, col, value)` and links; rows/columns can be threaded into row-headers and column-headers so insertion and deletion stay efficient.

**Space saved**: n×m elements vs (3 × nz + headers). When nz ≪ n×m, huge savings.

**Applications**: adjacency matrices of graphs, FEM/mesh problems, page-rank style web matrices, scientific computing.

# Searching

## Linear search

Scan the array **from the first element** until the key is found or the array ends.

```text
for i = 0 to n-1:
    if a[i] == key: return i       // found
return -1                           // not found
```

```cpp
int linearSearch(int a[], int n, int key) {
    for (int i = 0; i < n; i++)
        if (a[i] == key) return i;
    return -1;
}
```

| Case | Comparisons |
|---|---|
| Best | O(1) — key at a[0] |
| Worst | O(n) — key missing or at the end |
| Average | O(n) — (n+1)/2 |

Works on **unsorted** array; simple; no preprocessing needed.

## Binary search

The array must be **sorted**. Compare the key with the **middle**; discard one half each step.

```text
low=0, high=n-1
while low <= high:
    mid = (low + high) / 2
    if a[mid] == key: return mid
    else if a[mid] < key: low = mid + 1
    else: high = mid - 1
return -1
```

```cpp
int binarySearch(int a[], int n, int key) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] == key) return mid;
        else if (a[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
```

| Case | Comparisons |
|---|---|
| Best | O(1) — key at mid initially |
| Worst / Average | O(log n) |

| | Linear search | Binary search |
|---|---|---|
| Data must be sorted | no | **yes** |
| Time | O(n) | O(log n) |
| Extra cost | none | must sort first |
| Works on linked list | yes | impractical |

# Sorting — Selection, Insertion, Bubble

## Selection sort

Repeatedly find the **minimum** of the unsorted part and swap it to its place.

```text
for i = 0 to n-2:
    minIdx = i
    for j = i+1 to n-1:
        if a[j] < a[minIdx]: minIdx = j
    swap a[i], a[minIdx]
```

```cpp
void selectionSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[minIdx]) minIdx = j;
        std::swap(a[i], a[minIdx]);
    }
}
```

**Example** `64 25 12 22 11` → `11 25 12 22 64` → `11 12 22 25 64`. Always O(n²) comparisons; **minimum number of swaps** (at most n−1). Not stable by default.

## Insertion sort

Build the sorted part **one element at a time**: pick an element and insert it into its correct place among the already-sorted elements, shifting the rest.

```text
for i = 1 to n-1:
    key = a[i];  j = i-1
    while j >= 0 and a[j] > key:
        a[j+1] = a[j];  j--
    a[j+1] = key
```

```cpp
void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}
```

**Example** `5 2 4 6 1 3` → after pass 1: `2 5 4 6 1 3` → … → `1 2 3 4 5 6`. Best case **O(n)** (already sorted), worst/average **O(n²)**. **Stable**, great for nearly-sorted data, excellent for small arrays.

## Bubble sort

Repeatedly swap adjacent **out-of-order** pairs; after each pass the largest element "bubbles" to the end.

```text
for i = 0 to n-2:
    for j = 0 to n-2-i:
        if a[j] > a[j+1]: swap a[j], a[j+1]
```

```cpp
void bubbleSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - 1 - i; j++)
            if (a[j] > a[j + 1]) std::swap(a[j], a[j + 1]);
}
```

With an early-exit flag it becomes O(n) on sorted input; worst/average **O(n²)**. **Stable**, extremely simple, but rarely used in practice.

## Comparison chart

| Sort | Best | Average | Worst | Space | Stable? |
|---|---|---|---|---|---|
| Selection | O(n²) | O(n²) | O(n²) | O(1) | no (typical) |
| Insertion | **O(n)** | O(n²) | O(n²) | O(1) | yes |
| Bubble | O(n) | O(n²) | O(n²) | O(1) | yes |
| Merge (Unit 2) | O(n log n) | O(n log n) | O(n log n) | O(n) | yes |
| Quick (Unit 2) | O(n log n) | O(n log n) | O(n²) | O(log n) | no |

> [!WARNING]
> "Which sort for nearly-sorted data?" → **Insertion sort** (O(n) best case, stable). "Which sort if memory is scarce?" → **Selection sort** (O(1) extra space, O(n) swaps). Never quote selection sort as stable.

# Quick Revision

| Data structure | Key idea | Typical cost |
|---|---|---|
| Array | contiguous, indexed | access O(1), insert/delete O(n) |
| Sparse matrix | store only non-zeros | memory O(nz) |
| Linear search | scan all | O(n) |
| Binary search | halve sorted range | O(log n) |
| Selection sort | pick min each pass | O(n²) |
| Insertion sort | insert into sorted part | O(n)–O(n²) |
| Bubble sort | swap adjacent pairs | O(n)–O(n²) |

# Practice Questions

1. Define data structure. Compare built-in, derived and user-defined data types.
2. Explain best, worst and average case analysis with an example for linear search.
3. What is the difference between O, Ω and Θ? Arrange the common growth functions in increasing order.
4. Write a recursive C++ function to compute a<sup>n</sup>. Show the call stack for `power(2,4)`.
5. Find the address of `a[4][7]` in a 5×10 row-major integer array with base address 1000 (4 bytes per int).
6. Represent the given sparse matrix as triplets and as a linked list.
7. Run binary search on `2 5 8 12 16 23 38 56 72 91` to find 23; list each mid.
8. Trace selection, insertion and bubble sort on `29 10 14 37 13`; count the comparisons.
9. When is insertion sort better than merge sort? Justify with complexity.
10. Why can't binary search run on an unsorted array or a linked list efficiently?