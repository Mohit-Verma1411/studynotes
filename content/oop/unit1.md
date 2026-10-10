---
id: oop-u1
title: OOP Unit 1 — C++ Fundamentals & Object Oriented Concepts
subject: oop
unit: 1
date: 2026-02-10
featured: true
tags: c++, classes, encapsulation, polymorphism, inheritance, recursion
description: Introduction to C++, the standard library, header files, namespaces, control flow, functions and recursion, then the core object oriented concepts — encapsulation, polymorphism, overloading, inheritance, abstract classes, access specifiers and class scope.
---

# Introduction to C++

==C++== is a general-purpose, middle-level, compiled programming language created by **Bjarne Stroustrup** at Bell Laboratories. It began in 1979 as *"C with Classes"* and was renamed **C++** in 1983 (the `++` is the increment operator).

> [!DEFINITION]
> C++ is a **statically typed**, **case sensitive**, **free-form** language that combines the efficiency and low-level control of C with high-level object oriented features such as classes, inheritance and polymorphism.

## Why C++ is called a middle-level language

| Level | Meaning | C++ support |
|---|---|---|
| Low level | Direct hardware/memory access | pointers, bitwise operators, `new`/`delete` |
| High level | Abstraction, reuse, safety | classes, templates, exceptions, STL |

## Key features

- **Object oriented** — classes, objects, inheritance, polymorphism, encapsulation.
- **Compiled & portable** — source is compiled to machine code; the same program runs on many platforms after recompiling.
- **Rich standard library** — strings, containers, algorithms, streams, files.
- **Fast** — no garbage collector; you control memory.
- **Supports both procedural and OO styles** — hence "multi-paradigm".
- **Operator overloading** and **function overloading**.
- **Exception handling** with `try`, `catch`, `throw`.
- **Templates** for generic programming.

## C vs C++

| Point | C | C++ |
|---|---|---|
| Paradigm | Procedural | Procedural + Object oriented |
| Data security | Low (global data) | High (encapsulation) |
| Functions | Top-level only | Member functions and top-level |
| Overloading | Not allowed | Allowed |
| Memory | `malloc`/`free` | `new`/`delete` |
| Reference variables | No | Yes |
| Namespace | No | Yes |

## Applications of C++

- Operating systems and device drivers
- Games and game engines (Unreal Engine)
- Embedded and real-time systems
- Databases (MySQL, MongoDB internals)
- Browsers (Chrome, Firefox components)
- Compilers and interpreters
- Banking, telecom and simulation software

# Structure of a Simple C++ Program

```cpp
// first.cpp - the smallest useful C++ program
#include <iostream>          // 1. header file for input/output
using namespace std;         // 2. bring std names into scope

int main()                   // 3. execution always starts at main()
{
    cout << "Hello, World!" << endl;   // 4. statement ends with ;
    return 0;                // 5. 0 means success
}
```

Every C++ program is a collection of one or more **functions**, and execution begins at `main()`. Statements end with a semicolon (`;`). C++ is **case sensitive**, so `Main`, `main` and `MAIN` are different.

## Comments

```cpp
// single line comment  (C++ style)
/* multi-line
   comment (C style) */
```

# The C++ Standard Library

The ==standard library== is a set of pre-written classes and functions shipped with every C++ compiler. Its most used parts are the **iostream** library for I/O and the **STL** (Standard Template Library) for containers and algorithms.

| Header | Purpose | Common names |
|---|---|---|
| `<iostream>` | console input/output | `cin`, `cout`, `cerr` |
| `<iomanip>` | output formatting | `setw`, `setprecision` |
| `<string>` | `std::string` class | `string` |
| `<vector>` | dynamic array | `vector` |
| `<array>` | fixed-size array wrapper | `array` |
| `<algorithm>` | sorting/searching | `sort`, `find` |
| `<map>`, `<set>` | associative containers | `map`, `set` |
| `<cmath>` | math functions | `sqrt`, `pow` |
| `<fstream>` | file I/O | `ifstream`, `ofstream` |
| `<cstdlib>` | general utilities | `atoi`, `rand`, `exit` |

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> marks = {72, 90, 65, 88};
    sort(marks.begin(), marks.end());     // ascending
    for (int m : marks) cout << m << " "; // 65 72 88 90
    cout << "\nTotal: ";
    int sum = 0;
    for (int m : marks) sum += m;
    cout << sum << endl;
    return 0;
}
```

> [!TIP]
> Prefer `std::cout` over `using namespace std;` in large projects, because `using namespace std;` can cause name clashes. For small programs and exams it is perfectly fine.

# Header Files

A ==header file== contains declarations (function prototypes, class definitions, macros, constants) that can be shared by many `.cpp` files.

## Two kinds of headers

| Kind | Included with | Example | Search path |
|---|---|---|---|
| Standard (system) | `#include <name>` | `#include <iostream>` | compiler's include directories |
| User-defined | `#include "name.h"` | `#include "student.h"` | current directory first |

## Why headers are used

- **Reuse** — write once, include anywhere.
- **Separation** — interface (`.h`) stays separate from implementation (`.cpp`).
- **Faster compilation** — change a `.cpp` without recompiling everything.

## Example: a user-defined header

```cpp
// student.h
#ifndef STUDENT_H            // include guard: prevents double inclusion
#define STUDENT_H

#include <string>

class Student {
public:
    Student(std::string n, int m);
    void display() const;
private:
    std::string name;
    int marks;
};

#endif
```

```cpp
// student.cpp
#include <iostream>
#include "student.h"

Student::Student(std::string n, int m) : name(n), marks(m) {}

void Student::display() const {
    std::cout << name << " scored " << marks << "\n";
}
```

```cpp
// main.cpp
#include "student.h"

int main() {
    Student s("Riya", 91);
    s.display();
    return 0;
}
```

> [!WARNING]
> Without an include guard (`#ifndef`/`#define`/`#endif`) or `#pragma once`, a header included twice causes "redefinition" compiler errors.

# Namespaces

A ==namespace== is a named region that groups declarations so that names in different libraries do not collide.

## Syntax

```cpp
namespace Math {
    const double PI = 3.14159;
    double area(double r) { return PI * r * r; }
}

namespace Physics {
    const double PI = 3.14159;   // no clash: different namespace
}

int main() {
    std::cout << Math::area(2) << "\n";   // fully qualified name
    return 0;
}
```

## using-declaration vs using-directive

| Form | Example | Effect |
|---|---|---|
| using-declaration | `using std::cout;` | brings **one** name into scope |
| using-directive | `using namespace std;` | brings **all** names of the namespace into scope |

## Other namespace features

- **Nested namespaces:** `namespace A { namespace B { int x; } }` &rarr; use `A::B::x`.
- **Namespace alias:** `namespace io = std::ios;`
- **Anonymous namespace:** names have internal linkage (like `static`).
- **Global namespace:** names declared outside every namespace; accessed with `::name`.

> [!NOTE]
> `std` is the namespace of the C++ standard library. Everything in `<iostream>`, `<string>`, etc. lives inside `std`.

# Control Flow

## Variables and assignment statements

A ==variable== is a named memory location that stores a value. Declaration reserves the memory; **initialization** gives it a first value; **assignment** changes it later.

```cpp
int age = 18;        // declaration + initialization
double pi;           // declaration only (garbage value!)
pi = 3.14159;        // assignment
const int MAX = 100; // constant: cannot be changed
int a = 5, b = a + 3;
```

## Fundamental data types

| Type | Typical size | Range (typical) | Example |
|---|---|---|---|
| `bool` | 1 byte | `true` / `false` | `bool ok = true;` |
| `char` | 1 byte | -128 to 127 | `char c = 'A';` |
| `int` | 4 bytes | -2,147,483,648 to 2,147,483,647 | `int n = 42;` |
| `float` | 4 bytes | ~7 digits precision | `float r = 2.5f;` |
| `double` | 8 bytes | ~15 digits precision | `double d = 3.14;` |
| `void` | — | no value | function return type |

Modifiers: `short`, `long`, `signed`, `unsigned`.

## Conditional execution

```cpp
int marks = 76;

if (marks >= 90) {
    cout << "Grade A";
} else if (marks >= 75) {
    cout << "Grade B";
} else if (marks >= 60) {
    cout << "Grade C";
} else {
    cout << "Grade D";
}
```

### switch statement

```cpp
char op = '+';
switch (op) {
    case '+': cout << "Addition"; break;
    case '-': cout << "Subtraction"; break;
    default:  cout << "Unknown operator";
}
```

### Ternary (conditional) operator

```cpp
int a = 10, b = 20;
int larger = (a > b) ? a : b;   // 20
```

## Looping

| Loop | Use when | Test happens |
|---|---|---|
| `for` | number of iterations is known | before each iteration |
| `while` | repeats while a condition holds | before each iteration |
| `do…while` | body must run at least once | after each iteration |

```cpp
for (int i = 1; i <= 5; i++) cout << i << " ";    // 1 2 3 4 5

int n = 5;
while (n > 0) { cout << n << " "; n--; }          // 5 4 3 2 1

int k = 0;
do { cout << k << " "; k++; } while (k < 3);      // 0 1 2

for (int x : {10, 20, 30}) cout << x << " ";      // range-based for
```

`break` exits the loop immediately; `continue` skips to the next iteration.

## Function calls

```cpp
int add(int a, int b) { return a + b; }        // definition

int main() {
    int s = add(3, 4);                         // call by value
    cout << s;                                  // 7
    return 0;
}
```

### Call by value vs call by reference

```cpp
void byValue(int x) { x = 100; }      // original unchanged
void byRef(int &x)  { x = 100; }      // original changed

int main() {
    int n = 5;
    byValue(n); cout << n << " ";      // 5
    byRef(n);   cout << n << "\n";     // 100
}
```

### Function overloading

Two or more functions may share a name if their **parameter lists differ**.

```cpp
int    area(int side)          { return side * side; }
double area(double r)          { return 3.14159 * r * r; }
int    area(int l, int b)      { return l * b; }
```

### Default arguments

```cpp
int power(int base, int exp = 2) {   // exp defaults to 2
    int r = 1;
    for (int i = 0; i < exp; i++) r *= base;
    return r;
}
// power(5) -> 25 ; power(2, 10) -> 1024
```

## Recursion

==Recursion== is a technique where a function calls itself on a smaller version of the same problem. Every recursive function needs a **base case** (to stop) and a **recursive case** (to make progress).

```cpp
// Factorial: n! = n * (n-1)!
long factorial(int n) {
    if (n <= 1) return 1;          // base case
    return n * factorial(n - 1);   // recursive case
}
// factorial(5) = 5*4*3*2*1 = 120
```

### How the calls unwind for `factorial(4)`

```text
factorial(4)
 -> 4 * factorial(3)
        -> 3 * factorial(2)
               -> 2 * factorial(1)
                      -> 1  (base case returns)
               <- 2 * 1 = 2
        <- 3 * 2 = 6
 <- 4 * 6 = 24
```

### Fibonacci series

```cpp
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
// 0 1 1 2 3 5 8 13 ...
```

### Tower of Hanoi

```cpp
void hanoi(int n, char from, char to, char via) {
    if (n == 1) { cout << "Move disk 1: " << from << " -> " << to << "\n"; return; }
    hanoi(n - 1, from, via, to);
    cout << "Move disk " << n << ": " << from << " -> " << to << "\n";
    hanoi(n - 1, via, to, from);
}
```

**Recursion vs iteration**

| Point | Recursion | Iteration |
|---|---|---|
| Memory | uses the call stack | uses a loop variable |
| Speed | usually slower | usually faster |
| Code | shorter, closer to the maths | longer, but explicit |
| Risk | stack overflow if too deep | none |

# Object Oriented Concepts

==OOP== organises a program around **objects** — self-contained units that bundle data and the functions that operate on that data — instead of around functions and global data.

## Objects and classes

- A ==class== is a user-defined data type: a **blueprint** describing data members and member functions.
- An ==object== is a **variable of a class** — a real instance created from the blueprint.

```cpp
class Student {
private:
    string name;
    int marks;
public:
    void setData(string n, int m) { name = n; marks = m; }
    void display() const { cout << name << " : " << marks << "\n"; }
};

int main() {
    Student s1;                 // s1 is an object
    s1.setData("Aman", 84);
    s1.display();
    return 0;
}
```

## Encapsulation

==Encapsulation== means wrapping data and the functions that manipulate it into a single unit (the class), and **hiding** the internal data from outside code. Data is made `private`; controlled access is provided through public member functions.

Benefits: data security, modularity, easier maintenance.

```cpp
class BankAccount {
private:
    double balance;                       // hidden
public:
    BankAccount() : balance(0) {}
    void deposit(double amt) { if (amt > 0) balance += amt; }
    double getBalance() const { return balance; }
};
```

## Polymorphism

==Polymorphism== ("many forms") lets the same name or interface behave differently in different situations.

| Type | When resolved | Achieved by |
|---|---|---|
| Compile-time (static) | at compile time | function overloading, operator overloading, templates |
| Run-time (dynamic) | at run time | virtual functions + inheritance |

```cpp
class Shape {
public:
    virtual void draw() const { cout << "Some shape\n"; }
};

class Circle : public Shape {
public:
    void draw() const override { cout << "Circle\n"; }
};

class Square : public Shape {
public:
    void draw() const override { cout << "Square\n"; }
};

int main() {
    Shape* shapes[2];
    shapes[0] = new Circle();
    shapes[1] = new Square();
    for (int i = 0; i < 2; i++) shapes[i]->draw();   // Circle, Square
}
```

> [!TIP]
> Without the keyword `virtual`, the call `shapes[i]->draw()` would bind to `Shape::draw` at compile time — that is the whole point of run-time polymorphism.

## Overloading

**Function overloading** — same name, different parameter list (shown earlier).

**Operator overloading** — give a new meaning to an existing operator for a user-defined type.

```cpp
class Complex {
    double re, im;
public:
    Complex(double r = 0, double i = 0) : re(r), im(i) {}
    Complex operator+(const Complex& c) const {
        return Complex(re + c.re, im + c.im);
    }
    void show() const { cout << re << " + " << im << "i\n"; }
};

int main() {
    Complex a(1, 2), b(3, 4);
    Complex c = a + b;          // calls operator+
    c.show();                   // 4 + 6i
}
```

Rules: you cannot create new operators, cannot change precedence, and a few operators (`::`, `.`, `.*`, `?:`, `sizeof`) cannot be overloaded.

## Inheritance

==Inheritance== lets a new class (**derived** or child) acquire the properties of an existing class (**base** or parent). It models an *is-a* relationship and promotes reuse.

```cpp
class Animal {                  // base
public:
    void eat() const { cout << "eating\n"; }
};

class Dog : public Animal {     // derived
public:
    void bark() const { cout << "barking\n"; }
};

int main() {
    Dog d;
    d.eat();     // inherited
    d.bark();    // own
}
```

Types of inheritance (covered in Unit 2): single, multiple, multilevel, hierarchical, hybrid.

## Abstract classes

An ==abstract class== is a class that contains at least one ==pure virtual function== and therefore **cannot be instantiated**. It defines an interface for derived classes.

```cpp
class Shape {
public:
    virtual double area() const = 0;   // pure virtual
    virtual ~Shape() {}
};

class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};
```

A pure virtual function is declared by assigning `= 0`.

## Access specifiers

| Specifier | Same class | Derived class | Outside code |
|---|---|---|---|
| `private` | yes | no | no |
| `protected` | yes | yes | no |
| `public` | yes | yes | yes |

## Class scope and accessing class members

A class body defines a **scope**. Names declared in it are visible to all member functions. Outside the class, members are reached with the **dot operator** on an object, or the **arrow operator** on a pointer.

```cpp
Student s;
s.display();          // dot on an object
Student* p = &s;
p->display();         // arrow on a pointer
```

Inside a member function you may refer to members directly; `this->member` is also valid. The `::` scope resolution operator links a member function defined outside the class:

```cpp
void Student::display() const { cout << name; }
```

## Constant class members

```cpp
class Circle {
    const double pi;          // const data member
public:
    Circle() : pi(3.14159) {} // must be initialised in the initialiser list
    double area(double r) const { return pi * r * r; }  // const member function
};
```

- A **const data member** cannot be changed after construction and must be initialised in the constructor's initialiser list.
- A **const member function** promises not to modify the object; it may be called on `const` objects.
- A `const` object can only call `const` member functions.

## Structure vs Class

| Point | `struct` | `class` |
|---|---|---|
| Default access | `public` | `private` |
| Default inheritance | `public` | `private` |
| Typical use | plain data grouping (POD) | full object with behaviour |
| Members | data and functions allowed | data and functions allowed |

In C++ the two are otherwise identical.

## Macro vs Inline function

| Point | Macro (`#define`) | Inline function |
|---|---|---|
| Processed by | preprocessor (text replacement) | compiler |
| Type checking | none | full type checking |
| Debugging | hard | easy, behaves like a function |
| Side effects | `SQR(x++)` increments twice | evaluated once |
| Syntax | `#define SQR(x) ((x)*(x))` | `inline int sqr(int x){return x*x;}` |

```cpp
#define SQR(x) ((x)*(x))              // macro
inline int square(int x) { return x * x; }  // inline function
```

> [!WARNING]
> `SQR(i++)` expands to `((i++)*(i++))`, which increments `i` twice. The inline function `square(i++)` increments once. Prefer inline functions.

# Quick Revision

| Concept | One-line meaning |
|---|---|
| Encapsulation | bundle data + methods, hide data |
| Abstraction | show only essential features |
| Polymorphism | same interface, many behaviours |
| Overloading | same name, different parameters |
| Inheritance | derived class reuses base class |
| Abstract class | has a pure virtual function, cannot be instantiated |
| `this` | pointer to the current object (Unit 2) |
| Virtual function | enables run-time polymorphism |

> [!EXAMPLE]
> **Exam favourite:** "Differentiate compile-time and run-time polymorphism with one example each." Compile-time = function/operator overloading resolved by the compiler. Run-time = `virtual` functions resolved through a base-class pointer at run time.

# Practice Questions

1. List any five features of C++ and explain any two.
2. What is a namespace? Illustrate with a program using two namespaces that both define `PI`.
3. Explain the difference between `#include <file>` and `#include "file"`.
4. Write a recursive function to compute the sum of the first `n` natural numbers.
5. Differentiate between function overloading and operator overloading with examples.
6. Explain the four access specifiers with a suitable class example.
7. Compare a macro with an inline function; give one program where the macro gives a wrong result.
8. What is an abstract class? Why can it not be instantiated?
9. Explain encapsulation and data hiding with a `BankAccount` example.
10. Trace the output of `factorial(4)` and draw the call stack.
