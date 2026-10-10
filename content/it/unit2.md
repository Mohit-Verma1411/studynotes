---
id: it-u2
title: IT Unit 2 — Expressions, Operators, Control Flow & Strings
subject: it
unit: 2
date: 2026-02-13
featured: true
tags: python, operators, precedence, type conversion, input output, if elif else, loops, strings, string methods
description: Statements, expressions, type conversion, input/output, operator precedence, arithmetic/relational/logical/assignment/augmented/identity operators, evaluating expressions, if-elif-else and loops, plus strings — operations, traversal and all the built-in string methods with example programs.
---

# Statements and Expressions

- A ==statement== is one instruction the interpreter executes: `name = "Aman"`, `print(x)`, `if x > 0:`.
- An ==expression== is a combination of values, variables and operators that **produces a value**: `2 + 3 * 4`, `x ** 2`, `len(s)`.

```python
x = 10                       # statement
y = x * 2 + 5                # statement; RHS is an expression → 25
print(y)                     # statement (calls a function)
```

# Input and Output

| Function | Purpose |
|---|---|
| `input(prompt)` | always returns a **string** from the keyboard |
| `print(*values, sep=' ', end='\n')` | writes values to the console |

```python
name = input("Enter your name: ")     # returns a string
age = int(input("Enter age: "))       # convert string -> int
print("Hello", name, "Age", age, sep=" | ")
```

> [!WARNING]
> `input()` returns a **string**. Comparing it with a number, or adding it mathematically, fails until you convert with `int()`, `float()` or `str()`.

# Type Conversion

| Kind | Meaning | Example |
|---|---|---|
| **Implicit** | Python converts automatically (only widening) | `5 + 2.0` → `7.0` |
| **Explicit** (casting) | you convert deliberately | `int("42")`, `float("3.14")`, `str(100)` |

```python
s = "3.75"
marks = float(s)                    # 3.75
total = int("10") + 5               # 15
text = str(100) + " students"       # "100 students"
x = int("abc")                      # ValueError: invalid literal
```

Python data types have an implicit precedence when mixed: `bool < int < float < complex`.

# Operators and Precedence

## Arithmetic operators

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+ - *` | add, subtract, multiply | `7 - 3 * 2` | 1 |
| `/` | true division | `7 / 2` | 3.5 |
| `//` | floor division | `7 // 2`, `-7 // 2` | 3, −4 |
| `%` | modulus (remainder) | `7 % 2` | 1 |
| `**` | exponent | `2 ** 10` | 1024 |

## Relational (comparison) operators

`==`, `!=`, `>`, `<`, `>=`, `<=` — result is a **bool** (`True`/`False`). Strings compare **lexicographically**.

```python
print(5 > 3)      # True
print(5 == 3)     # False
print("abc" < "abd")   # True (a==a, b==b, c<d)
```

## Logical operators

| Operator | Meaning | Truth table |
|---|---|---|
| `and` | True if **both** True | `T and T = T`, else F |
| `or` | True if **either** True | `F or F = F`, else T |
| `not` | negates | `not True = False` |

```python
age = 20
has_id = True
print(age >= 18 and has_id)   # True
print(age > 60 or age < 12)   # False
print(not has_id)             # False
```

## Assignment operators

`=` assigns; **augmented assignment** combines an operation with assignment:

```python
x = 10
x += 5     # x = x + 5 → 15
x -= 2     # 13
x *= 3     # 39
x /= 2     # 19.5
x //= 2    # 9.0
x %= 4     # 1.0
x **= 3    # 1.0
```

## Identity operators — `is` and `is not`

Compare whether two names refer to the **same object in memory** (not whether values are equal).

```python
a = [1, 2, 3]
b = a            # b refers to the SAME list
c = [1, 2, 3]    # a different list with equal values
print(a is b)    # True
print(a is c)    # False
print(a == c)    # True   (value equality)
```

> [!WARNING]
> Use `is`/`is not` for **None** and identity checks; use `==`/`!=` for comparing values. For small integers Python interns values, so `5 is 5` may be `True` — don't rely on it.

# Operator Precedence (high → low)

| Level | Operators |
|---|---|
| 1 | `( )` parentheses, `**` |
| 2 | unary `+x -x`, `~x` |
| 3 | `* / // %` |
| 4 | `+ -` |
| 5 | `== != > < >= <=` |
| 6 | `not` |
| 7 | `and` |
| 8 | `or` |

> [!TIP]
> Evaluate `2 + 3 * 4 ** 2` = `2 + 3 * 16` = `2 + 48` = **50**. When in doubt, add parentheses — they are free and make intent clear.

# Flow of Control

## Conditional statements

```python
marks = int(input("Marks: "))

if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
elif marks >= 60:
    grade = "C"
else:
    grade = "D"
print("Grade:", grade)
```

- `if` / `elif` / `else` — mutually exclusive branches.
- Nested `if` is allowed (an `if` inside an `if` block).
- Any truthy value (non-zero number, non-empty string/list) makes a condition `True`.

## Iterative statements (loops)

```python
# for loop — definite iteration
for i in range(1, 6):
    print(i, end=" ")          # 1 2 3 4 5

# range(start, stop, step)
for i in range(10, 0, -2):
    print(i, end=" ")          # 10 8 6 4 2

# while loop — indefinite iteration
n = 5
while n > 0:
    print(n, end=" ")
    n -= 1                     # 5 4 3 2 1

# break / continue
for i in range(1, 10):
    if i == 3: continue        # skip 3
    if i == 7: break           # stop at 7
    print(i, end=" ")          # 1 2 4 5 6
```

> [!NOTE]
> `range(n)` → 0..n−1; `range(a, b)` → a..b−1; `range(a, b, s)` → step s. It is lazy (produces numbers on demand).

# Strings

A ==string== is an **immutable sequence of characters** enclosed in `' '`, `" "`, or `''' '''`.

```python
s1 = 'hello'
s2 = "world"
s3 = '''multi
line'''
```

## String operations

| Operation | Example | Result |
|---|---|---|
| Concatenation `+` | `"Py" + "thon"` | `"Python"` |
| Repetition `*` | `"Ha" * 3` | `"HaHaHa"` |
| Membership `in` / `not in` | `"ell" in "hello"` | `True` |
| Slicing `[start:stop:step]` | `"hello"[1:4]` | `"ell"` |

```python
word = "Python"
print(word[0])        # P
print(word[-1])       # n   (negative index: from the end)
print(word[0:4])      # Pyth  (start:stop — stop is exclusive)
print(word[::2])      # Pto   (every 2nd character)
print(word[::-1])     # nohtyP (reversed)
```

> [!WARNING]
> Strings are **immutable** — `word[0] = "J"` raises `TypeError`. "Changing" a string means creating a new one: `word = "J" + word[1:]`.

## Traversing a string using loops

```python
name = "Riya"
for ch in name:              # character by character
    print(ch, end="-")       # R-i-y-a-

for i in range(len(name)):   # index based
    print(name[i], end=" ")  # R i y a
```

## Built-in functions and string methods

```python
s = "hello world"

len(s)                # 11
s.capitalize()        # "Hello world"
s.title()             # "Hello World"
s.upper()             # "HELLO WORLD"
s.lower()             # "hello world"
s.count("l")          # 3
s.find("world")       # 6  (first index or -1)
s.index("world")      # 6  (raises ValueError if absent)
s.endswith("world")   # True
s.startswith("hello") # True
"abc123".isalnum()    # True  (letters + digits)
"abc".isalpha()       # True  (only letters)
"123".isdigit()       # True  (only digits)
"abc".islower()       # True
"ABC".isupper()       # True
"   ".isspace()       # True
"  hi  ".lstrip()     # "hi  "  (strip left)
"  hi  ".rstrip()     # "  hi"
"  hi  ".strip()      # "hi"
s.replace("world", "Python")   # "hello Python"
"-".join(["a", "b", "c"])      # "a-b-c"
"name:age:city".partition(":") # ("name", ":", "age:city")
"a b c".split()                # ['a', 'b', 'c']  (split on space)
```

> [!EXAMPLE]
> Count vowels in a string:
> ```python
> text = "python programming"
> count = 0
> for ch in text.lower():
>     if ch in "aeiou":
>         count += 1
> print(count)      # 4
> ```

> [!TIP]
> `find()` returns **−1** when absent; `index()` raises an error. Use `find()` when the value may be missing, `index()` when you know it exists.

# Quick Revision

| Concept | One-liner |
|---|---|
| Expression vs statement | expression yields a value; statement is an action |
| Type conversion | implicit (automatic) vs explicit (`int()`, `float()`, `str()`) |
| `// % **` | floor divide, remainder, exponent |
| `is` vs `==` | identity (same object) vs value equality |
| Precedence | `**` → `* / // %` → `+ -` → comparisons → `not and or` |
| `if/elif/else` | multi-way conditional |
| Loops | `for` (range/sequence) and `while` (condition) |
| String immutability | cannot modify — create a new string |
| Slicing | `[start:stop:step]`, negative indices, `[::-1]` reverse |

# Practice Questions

1. What is the difference between a statement and an expression? Give three examples of each.
2. Trace `value = 2 + 3 * 4 ** 2 - 8 / 4 % 3` giving each step with precedence.
3. Write a program reading `n` and printing the sum of the first `n` natural numbers.
4. Write a marks→grade program using `if/elif/else`.
5. Explain `is` vs `==` with two lists. When should each be used?
6. Write output of `"Py" * 2 + "thon"`, `"abc"[::-1]`, `"hello world".title()`.
7. Write a program to count vowels and consonants in a string using a `for` loop.
8. Show the difference between `"  x  ".strip()`, `.lstrip()` and `.rstrip()`.
9. Convert `"1,2,3,4"` into the list `[1, 2, 3, 4]` using `split()` and `int()`.
10. Why can `s[0] = 'J'` fail? How do you actually "change" a string?