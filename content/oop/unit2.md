---
id: oop-u2
title: OOP Unit 2 — Friends, this, Memory, Constructors & Inheritance
subject: oop
unit: 2
date: 2026-02-12
featured: true
tags: c++, friend, this, new delete, static, constructors, destructors, inheritance
description: Friend functions and friend classes, the this pointer, new/delete, static members, constructors and destructors, and inheritance — types, overriding, access modes and base class constructor/destructor effects.
---

# Friend Function and Friend Classes

## Friend function

A ==friend function== is a **non-member function** that has permission to access the `private` and `protected` members of a class. It is declared inside the class with the keyword `friend` and defined outside.

```cpp
class Box {
private:
    double side;
public:
    Box(double s) : side(s) {}
    friend double volume(Box b);    // grants access
};

double volume(Box b) {              // not a member function!
    return b.side * b.side * b.side;
}

int main() {
    Box b(3);
    cout << volume(b) << "\n";      // 27
}
```

Key rules:

- Declared with `friend` inside the class; **defined outside** without `friend` or `Box::`.
- It is **not** a member function, so it has no `this` pointer and cannot be invoked with a dot.
- Friendship is **granted by the class, not taken** — it is not mutual and not inherited.
- A friend function can be made a friend of **two classes** at once (handy for operators like `+` between two types).

### Friend of two classes

```cpp
class B;                                  // forward declaration

class A {
    int x;
public:
    A(int v) : x(v) {}
    friend int sum(A, B);                 // friend of A
};

class B {
    int y;
public:
    B(int v) : y(v) {}
    friend int sum(A, B);                 // friend of B
};

int sum(A a, B b) { return a.x + b.y; }
```

## Friend class

If class `B` is declared a **friend class** of class `A`, **every member function of B** can access the private members of `A`.

```cpp
class B;                                  // forward declaration

class A {
    int secret;
public:
    A() : secret(42) {}
    friend class B;                       // B can peek into A
};

class B {
public:
    int reveal(A a) { return a.secret; }  // legal now
};
```

> [!NOTE]
> Friend classes should be used sparingly; they weaken encapsulation. They are useful when two classes are tightly coupled, e.g. a `List` and its `Node`.

# The this Pointer

Every non-static member function receives a hidden pointer ==`this`== that points to the **object on which the function was called**. Inside a member function, `this->member` and `member` are equivalent.

Uses of `this`:

- Resolve **name shadowing** (parameter has the same name as a member).
- **Chain** method calls (`return *this;`).
- Access the object's **address** (`return this;`).

```cpp
class Counter {
    int count;
public:
    Counter() : count(0) {}
    Counter& set(int count) {     // parameter shadows member
        this->count = count;      // disambiguation
        return *this;             // enables chaining
    }
    void show() const { cout << count << "\n"; }
};

int main() {
    Counter c;
    c.set(5).set(9);   // chaining
    c.show();          // 9
}
```

> [!WARNING]
> `this` is a **const pointer** — you can change the object it points to but not make `this` point elsewhere. Static member functions do **not** have a `this` pointer.

# Dynamic Memory Allocation and Deallocation

Static allocation (local variables, arrays) happens at compile time on the **stack**. Dynamic allocation happens at **run time** on the **heap (free store)** using `new` and `delete`.

| Operator | Purpose | Example |
|---|---|---|
| `new <type>` | allocate one object | `int *p = new int;` |
| `new <type>(value)` | allocate + initialise | `int *p = new int(7);` |
| `new <type>[n]` | allocate an array | `int *a = new int[10];` |
| `delete <ptr>` | free one object | `delete p;` |
| `delete[] <ptr>` | free an array | `delete[] a;` |
| `new` on a class | allocates + calls constructor | `Box *b = new Box(3);` |

```cpp
#include <iostream>
using namespace std;

int main() {
    int *p = new int(21);        // one int, value 21
    cout << *p << "\n";
    delete p;                    // free it

    int n = 5;
    int *arr = new int[n];       // dynamic array
    for (int i = 0; i < n; i++) arr[i] = i * i;
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << "\n";
    delete[] arr;                // free the array (delete[], not delete)
    return 0;
}
```

> [!WARNING]
> Every `new` must be matched by a `delete`; every `new[]` must be matched by `delete[]`. Leaks happen when allocated memory is never freed; a mismatch (using `delete` on an array) is undefined behaviour.

**Why use `new`/`delete` instead of `malloc`/`free`?**

- `new` calls the **constructor**; `delete` calls the **destructor**.
- `new` returns the correct typed pointer (no `malloc` casts).
- Operators can be overloaded for a class to control allocation.

# Static Class Members

`static` members **belong to the class**, not to any single object. There is exactly one copy shared by all objects, and they exist even before any object is created.

```cpp
class Student {
    string name;
    static int total;                 // declaration (counts students)
public:
    Student(string n) : name(n) { total++; }
    static int count() { return total; }
};

int Student::total = 0;               // definition & initialisation

int main() {
    Student a("Aman"), b("Riya"), c("Dev");
    cout << Student::count() << "\n"; // 3  (called on the class)
}
```

| Point | Static data member | Static member function |
|---|---|---|
| Owned by | the class (one copy) | the class |
| Access | `Class::member` or via any object | `Class::function()` |
| `this` pointer | — | none |
| Can access non-static members | no | no (no object context) |
| Must be defined outside the class (in C++ before C++17) | yes | — |

> [!TIP]
> `static` data members must be **defined outside the class** (`int Student::total = 0;`) because they need storage of their own. (Since C++17 you can write `inline static int total = 0;`.)

# Constructors

A ==constructor== is a special member function that is **automatically called when an object is created**. It has the same name as the class, no return type (not even `void`), and may be overloaded.

## 1. Default constructor

A constructor with **no parameters** (automatically supplied by the compiler if no constructor is written).

```cpp
class Point {
    int x, y;
public:
    Point() { x = 0; y = 0; }   // default constructor
    void show() const { cout << "(" << x << "," << y << ")\n"; }
};
```

## 2. Parameterized constructor

Takes arguments so an object can be created with initial values.

```cpp
class Point {
    int x, y;
public:
    Point(int a, int b) { x = a; y = b; }
    void show() const { cout << "(" << x << "," << y << ")\n"; }
};

Point p1(3, 5);        // implicit call
Point p2 = Point(1, 2);// explicit call
```

**Constructor initialiser list** – preferred because it initialises (does not assign) members:

```cpp
class Point {
    int x, y;
public:
    Point(int a, int b) : x(a), y(b) {}   // initialiser list
};
```

## 3. Copy constructor

Creates a new object as a **copy of an existing object**. The compiler provides a default (shallow) copy constructor.

```cpp
class Point {
    int x, y;
public:
    Point(int a, int b) : x(a), y(b) {}
    Point(const Point &p) {       // copy constructor
        x = p.x;
        y = p.y;
    }
    void show() const { cout << "(" << x << "," << y << ")\n"; }
};

int main() {
    Point p1(3, 5);
    Point p2 = p1;        // copy constructor invoked
    Point p3(p1);         // another way
}
```

> [!WARNING]
> **Shallow vs deep copy.** If a class owns memory via a pointer, the default copy copies only the *pointer* (shallow) — two objects then share the same memory and `delete` twice will crash. A user-defined copy constructor performing **deep copy** allocates its own memory.

```cpp
class IntArr {
    int *data;
    int n;
public:
    IntArr(int size) : n(size)
        { data = new int[n]; }
    IntArr(const IntArr &src) : n(src.n) {      // deep copy
        data = new int[n];
        for (int i = 0; i < n; i++) data[i] = src.data[i];
    }
    ~IntArr() { delete[] data; }
};

IntArr b = a;   // b gets its own copy of the array
```

## When is a copy constructor called?

- When an object is initialised from another: `Point p2 = p1;`
- When an object is **passed by value** to a function.
- When an object is **returned by value**.

# Destructors

A ==destructor== is a member function called **automatically when an object goes out of scope** (or when `delete` is used). It is named like the class with a tilde (`~ClassName`), takes **no parameters** and has **no return type** — it cannot be overloaded.

```cpp
class File {
    char *name;
public:
    File(const char *n) {
        name = new char[50];
        strcpy(name, n);
        cout << "Opening " << name << "\n";
    }
    ~File() {
        delete[] name;
        cout << "Closing file\n";
    }
};

int main() {
    File f("data.txt");
    // ... work ...
}   // destructor runs automatically here
```

Typical uses: release dynamically allocated memory, close files, release resources (locks, sockets, connections).

**Destruction order:** destructors run in the **reverse order of construction** — the last object created is destroyed first.

> [!TIP]
> If a class allocates memory with `new`, always write a destructor, a copy constructor and a copy assignment operator (the *rule of three*) to prevent double-delete and leaks.

# Introduction to Inheritance

==Inheritance== lets a derived class **reuse and extend** the members of a base class. It models an *is-a* relationship (`Dog` is an `Animal`) and supports code reuse, extensibility and overriding.

```cpp
class Account {                       // base class
protected:
    double balance;
public:
    Account() : balance(0) {}
    void deposit(double a) { balance += a; }
    void show() const { cout << "Balance: " << balance << "\n"; }
};

class Savings : public Account {      // derived class
public:
    void addInterest() { balance *= 1.04; }
};

int main() {
    Savings s;        // constructor chain runs
    s.deposit(1000);
    s.addInterest();
    s.show();         // Balance: 1040
}
```

## Types of inheritance

| Type | Meaning | Example |
|---|---|---|
| **Single** | one derived class from one base | `B : A` |
| **Multiple** | one class from two or more bases | `C : A, B` |
| **Multilevel** | chain of derivation | `A → B → C` |
| **Hierarchical** | many classes from one base | `B, C, D : A` |
| **Hybrid** | combination (e.g. multiple + multilevel) | `D : B, C` where `B, C : A` — often needs virtual base classes |

```cpp
// Multiple inheritance
class Student { protected: int roll; public: Student(int r) : roll(r) {} };
class Marks   { protected: int m;    public: Marks(int x) : m(x) {} };
class Report : public Student, public Marks {
public:
    Report(int r, int x) : Student(r), Marks(x) {}
    void show() const { cout << roll << " " << m << "\n"; }
};
```

> [!WARNING]
> Hybrid inheritance can duplicate the base sub-object (the "diamond problem"). Mark the shared base as `virtual`:
> `class Student : virtual public Person { ... };` so only one copy of `Person` exists.

## Overriding base class members

A derived class can **redefine** a base member function with the same signature. This is ==method overriding== (distinct from overloading — same name, same parameter list, different class).

```cpp
class Animal {
public:
    void speak() const { cout << "Some sound\n"; }
};

class Dog : public Animal {
public:
    void speak() const { cout << "Woof\n"; }   // override
};

int main() {
    Dog d;
    d.speak();            // Woof   (Dog's version)
    d.Animal::speak();    // Some sound (forced base call)
}
```

- If you hide a base function, its **other overloads are hidden too** — use `using Base::f;` to bring them back.
- Mark overrides with `override` (C++11) so the compiler checks correctness.

## Public, protected and private inheritance

The base's members keep their access *up to* the mode of inheritance:

| Base member | Public inheritance | Protected inheritance | Private inheritance |
|---|---|---|---|
| `public` | `public` | `protected` | `private` |
| `protected` | `protected` | `protected` | `private` |
| `private` | not accessible | not accessible | not accessible |

```cpp
class Base { public: int a; protected: int b; private: int c; };

class Pub : public Base      { /* a public,  b protected, c hidden */ };
class Pro : protected Base   { /* a & b protected,           c hidden */ };
class Pri : private Base     { /* a & b private,             c hidden */ };
```

```cpp
// Accessible from outside?
Base b;
b.a;   // OK
b.b;   // error, protected
b.c;   // error, private
```

> [!TIP]
> Public inheritance expresses *is-a*. Private inheritance expresses *implemented-in-terms-of* and is rare. Protected inheritance is rarely useful.

## Effect of base constructors and destructors in derived classes

**Construction order:** base class constructor runs **first**, then the derived class constructor. If the base constructor needs arguments, the derived class passes them in its **initialiser list**.

```cpp
class Base {
public:
    Base()               { cout << "Base default ctor\n"; }
    Base(int x)          { cout << "Base(int) ctor\n"; }
    ~Base()              { cout << "Base dtor\n"; }
};

class Derived : public Base {
public:
    Derived() : Base()         { cout << "Derived ctor\n"; }
    Derived(int y) : Base(y)   { cout << "Derived(int) ctor\n"; }
    ~Derived()                 { cout << "Derived dtor\n"; }
};

int main() {
    Derived d(5);
}
```

Output:

```text
Base(int) ctor
Derived(int) ctor
Derived dtor
Base dtor
```

Rules to remember:

- **Base ctor → derived ctor** (base first).
- **Derived dtor → base dtor** (destructors in reverse; derived first).
- If the base has only a parameterized constructor, the derived class **must** call it explicitly in the initialiser list, or the code will not compile.
- Each derived class constructor calls **one** base constructor; for multiple inheritance you list them comma-separated: `Derived() : Base1(x), Base2(y) {}`.

# Quick Revision

| Concept | One-line meaning |
|---|---|
| Friend function | non-member granted access to private members |
| `this` | pointer to the current object inside member functions |
| `new`/`delete` | run-time heap allocation/deallocation |
| Static member | belongs to the class, one copy for all objects |
| Constructor | runs automatically at object creation (default/parameterized/copy) |
| Destructor | runs automatically at object destruction |
| Overriding | derived class redefines a base function with the same signature |
| Public inheritance | base `public` stays `public` (is-a) |
| Ctor/dtor order | base ctor first; derived dtor first |

> [!EXAMPLE]
> **Exam favourite:** "Trace the output of the ctor/dtor program above and justify the order." Construction is bottom-up (base first), destruction is top-down (derived first), because the derived object must be valid while the base part is being built, and must finish its own cleanup before the base part is destroyed.

# Practice Questions

1. What is a friend function? Why is it not a member function? Give a program using a friend of two classes.
2. Explain `this` pointer with a program that chains member calls.
3. What is the difference between `delete p` and `delete[] p`?
4. Write a class `Array` with a deep-copying copy constructor and a destructor.
5. Explain static data members and static member functions with a `Counter` example.
6. Differentiate constructor from destructor. When is a copy constructor invoked?
7. List and draw the five types of inheritance. Explain the diamond problem.
8. Show what happens to `public`/`protected`/`private` base members under `public`, `protected` and `private` inheritance.
9. Explain the order of constructor and destructor calls when a derived class object is created and destroyed, with a program.
10. What is the difference between overloading and overriding? Give one example of each.