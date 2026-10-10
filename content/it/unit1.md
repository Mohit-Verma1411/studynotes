---
id: it-u1
title: IT Unit 1 — Python Basics, Tokens, Data Types & Errors
subject: it
unit: 1
date: 2026-02-08
featured: true
tags: python, interactive mode, script mode, tokens, identifiers, comments, data types, errors
description: Introduction to Python, its features, interactive vs script execution modes, character set, indentation, tokens (keywords, identifiers, literals, operators, punctuators), variables, comments, number data types and the three kinds of errors — with example programs.
---

# Introduction to Python

==Python== is a high-level, general-purpose, **interpreted** programming language created by **Guido van Rossum** (1991). It emphasizes code **readability** and fast **development**.

## Features of Python

- **Interpreted** — executes line by line; no separate compilation step.
- **Object oriented** — supports classes, objects, inheritance, polymorphism.
- **Simple and readable** — clean syntax, uses **indentation** instead of braces.
- **Dynamically typed** — the type of a variable is decided at runtime; you don't declare types.
- **Cross-platform** — Windows, Linux, macOS.
- **Huge standard library** — files, math, networking, databases, web.
- **Free and open source**, huge community.
- **Extensible & embeddable** — can call C/C++ libraries.

## Execution modes

| Mode | How | Example |
|---|---|---|
| **Interactive** | type one statement, see the result immediately (REPL — Read-Evaluate-Print-Loop) | `>>> 2 + 3` gives `5` at once |
| **Script** | write a `.py` file, run the whole program | `python program.py` |

```bash
# interactive
>>> print("Hello")
Hello

# script mode  (hello.py)
print("Hello, World!")         # run with:  python hello.py
```

> [!TIP]
> Use **interactive mode** for quick experiments and testing one-liners; use **script mode** for real programs.

## Python character set

The valid set of characters includes:

- Letters: **A–Z, a–z** (and Unicode alphabets in Python 3)
- Digits: **0–9**
- Whitespace: space, tab, newline
- Operators and special symbols: `+ - * / % ** // = < > <= >= == != ( ) [ ] { } , . : ; @ # ' " \n _`

## Indentation

==Indentation== (leading spaces/tabs) is **syntactically meaningful**: it groups statements into blocks. Consistent indentation is mandatory.

```python
marks = 85
if marks >= 75:
    print("Distinction")   # inside the if-block (indented)
print("Done")              # outside the block
```

> [!WARNING]
> Mixing tabs and spaces, or inconsistent indent levels, raises `IndentationError`. Use **4 spaces** consistently.

# Python Tokens

A ==token== is the smallest meaningful unit of a program. The scanner breaks source text into tokens.

| Token type | Examples |
|---|---|
| **Keyword** | `if`, `else`, `while`, `for`, `def`, `class`, `import`, `return`, `True`, `False`, `None`, `and`, `or`, `not`, `in`, `is`, `lambda` |
| **Identifier** | names you define: `age`, `total_marks`, `_count`, `Student` |
| **Literal** | `23`, `3.14`, `"hi"`, `'c'`, `True`, `None` |
| **Operator** | `+ - * / % // ** = == < > <= >= and or not` |
| **Punctuator** | `( ) [ ] { } , : ; .` |

# Variables

A ==variable== is a **name that refers to a value** stored in memory. No declaration or type is needed — assignment creates and (re)types it.

```python
age = 19                # integer variable
name = "Aman"           # string variable
marks = 88.5            # float variable
age = "nineteen"        # legal! variable can change type (dynamic typing)
```

**Identifier rules:**

- May contain letters, digits and `_`; must **not start with a digit**.
- Cannot be a **keyword** (`if`, `for`, `class`, …).
- Case sensitive: `Age` and `age` differ.
- Use meaningful names: `student_name`, not `sn`.
- Convention: `snake_case` for variables/functions, `PascalCase` for classes.

```python
# valid identifiers
_name, total_marks2, page_Count, MinValue
# invalid identifiers
2name, my-name, class, if, name!
```

# Comments

==Comments== are ignored by the interpreter — they explain code to humans.

```python
# single line comment

"""
Multi-line comment /
docstring — conventionally placed
at the top of a file or function.
"""
```

- `#` starts a comment that runs to the end of the line.
- Triple-quoted strings (`"""…"""` or `'''…'''`) act as multi-line comments/docstrings.
- Comments help debugging: you can temporarily disable a line by commenting it.

# Number Data Types

| Type | Description | Examples | Notes |
|---|---|---|---|
| `int` | whole numbers (unlimited precision) | `42`, `-7`, `0`, `10**100` | no size limit in Python 3 |
| `float` | decimals / real numbers | `3.14`, `-0.5`, `2.0`, `1e6` | stored as double precision |
| `complex` | a + bj | `3 + 4j`, `complex(2, 5)` | `j`/`J` is the imaginary unit |

```python
a = 10            # int
b = 3.142         # float
c = 2 + 5j        # complex

print(type(a))    # <class 'int'>
print(type(b))    # <class 'float'>
print(type(c))    # <class 'complex'>
print(c.real, c.imag)   # 2.0 5.0
```

> [!NOTE]
> `type(x)` returns the data type of `x` — one of the most used built-in functions during learning.

## Arithmetic that produces numbers

```python
print(7 // 2)    # 3      floor division
print(7 % 2)     # 1      remainder
print(2 ** 5)    # 32     exponent
print(10 / 4)    # 2.5    true division (always float)
print(5 + 2.0)   # 7.0    int + float -> float
```

# Errors in Python

| Error | What it is | Example |
|---|---|---|
| **Syntax error** | violates the **grammar** of Python; the program **cannot run** | `print("hi"` (missing `)`), `if x > 5 print(x)` |
| **Logical error** | the program **runs** but gives a **wrong result**; no message | computing average as `sum / n - 1` instead of `sum / n` |
| **Runtime error** (exception) | the program **crashes while running** | `10 / 0` → `ZeroDivisionError`, `int("abc")` → `ValueError` |

```python
# 1. Syntax error — Python refuses to run
# print("Hello"

# 2. Logical error — runs, wrong answer
n = 3
result = 100 / n - 4        # meant 100 / (n - 4)? gives 29.33 instead of error/intent
print(result)

# 3. Runtime error
# print(10 / 0)             # ZeroDivisionError: division by zero
```

> [!TIP]
> To fix a **logical error**, trace values with `print()` or use `type()` to check what variables actually contain. Read the full **traceback** for runtime errors — the last line names the exception and the exact line number.

# Quick Revision

| Concept | One-liner |
|---|---|
| Python | interpreted, OO, high-level, indentation-based |
| Interactive mode | REPL — immediate results |
| Script mode | run a `.py` file |
| Tokens | keywords, identifiers, literals, operators, punctuators |
| Variables | dynamically typed names bound to values |
| `int` / `float` / `complex` | whole / decimal / a+bj numbers |
| Comments | `#` and `""" docstrings """` |
| Error types | syntax (won't run), logical (wrong result), runtime (crash) |

# Practice Questions

1. Write any five features of Python.
2. Distinguish interactive mode from script mode with an example program each.
3. List the five categories of tokens. Give three examples of each.
4. Which of these are valid identifiers: `2score`, `_name`, `student name`, `for`, `Marks2`, `class`? Justify.
5. What is the role of indentation in Python? What error occurs if indentation is wrong?
6. Explain `int`, `float` and `complex` with examples and find their `type()`.
7. Predict the output of `7 // 2`, `7 % 2`, `7 / 2`, `2 ** 3`, `"a" * 3`.
8. Differentiate syntax, logical and runtime errors with one program for each.
9. Write a script that reads a student's name and two marks and prints the average.
10. Why is Python called dynamically typed? Contrast with a statically typed language like C++.