---
id: coa-u1
title: COA Unit 1 — Data Representation, Computer Arithmetic & Memory
subject: coa
unit: 1
date: 2026-02-11
featured: true
tags: von neumann, binary, booth algorithm, floating point, memory hierarchy, tlb, mips
description: Computer systems, organization vs architecture, Von Neumann design, computer generations; fixed point, floating point and decimal arithmetic; Booth's multiplication algorithm; memory hierarchy, memory types and the TLB — with flowcharts and a hardware implementation diagram.
---

# Introduction to Computer Systems

A ==computer system== is a combination of hardware and software that accepts **data**, processes it, stores it and produces **information**. It has four basic functional units:

- **Input unit** — accepts instructions and data (keyboard, mouse, scanner).
- **Memory unit** — stores data and programs (registers, cache, RAM, secondary storage).
- **ALU (Arithmetic and Logic Unit)** — performs arithmetic and logical operations.
- **Control unit (CU)** — directs the sequence of operations; CU + ALU + registers = the **CPU**.
- **Output unit** — presents results (monitor, printer).

<div class="flow">
<div class="fnode">Input unit</div>
<div class="farrow">→</div>
<div class="fnode fmain">Memory unit (stores program + data)</div>
<div class="farrow">↕</div>
<div class="fnode">ALU &nbsp;·&nbsp; Control unit (registers) — CPU</div>
<div class="farrow">→</div>
<div class="fnode">Output unit</div>
</div>

Two other definitions you must know:

- ==Bit== — one binary digit (0 or 1); the smallest unit of data.
- ==Byte== — a group of 8 bits; the standard unit of memory.
- **Word** — a fixed-size group of bits the CPU handles as a unit (usually 16, 32 or 64 bits).

| Unit | Approximate size |
|---|---|
| 1 KB | 2<sup>10</sup> = 1,024 bytes |
| 1 MB | 2<sup>20</sup> ≈ 1.05 × 10<sup>6</sup> bytes |
| 1 GB | 2<sup>30</sup> ≈ 1.07 × 10<sup>9</sup> bytes |
| 1 TB | 2<sup>40</sup> ≈ 1.10 × 10<sup>12</sup> bytes |

# Organization vs Architecture

| Point | Computer **Organization** | Computer **Architecture** |
|---|---|---|
| Concern | **How** the hardware is implemented | **What** the machine looks like to a programmer |
| Deals with | data path, control signals, memory technology, I/O circuits | instruction set, addressing modes, word size, registers |
| Question | *How do we build it?* | *What features does it have?* |
| Changeable | often (technologies change) | rarely (software depends on it) |

> [!EXAMPLE]
> Two machines with the *same architecture* (same instruction set) can have *different organizations* — one fast, one cheap. Software written for one runs on both.

# Von Neumann Architecture

Proposed by **John von Neumann (1945)**, it is built on the ==stored-program concept==: **both the program (instructions) and the data are stored together in the same memory**, and the CPU fetches instructions one at a time.

<div class="flow">
<div class="fnode fmain">Main memory — stores instructions + data (single address space)</div>
<div class="farrow">↕</div>
<div class="fnode">Control unit</div>
<div class="farrow">↕</div>
<div class="fnode">ALU &nbsp;·&nbsp; Registers (AC, MBR, MAR, PC, IR)</div>
<div class="farrow">↑ ↓</div>
<div class="fnode">I/O devices</div>
</div>

Main characteristics:

- Instructions and data are stored in **the same memory**.
- Memory is **addressable by location**; execution is **sequential** (PC-based).
- CPU has: **PC** (program counter), **IR** (instruction register), **MAR** (memory address register), **MBR/MDR** (memory buffer/data register), **AC** (accumulator).
- Data moves between CPU, memory and I/O over **buses** (data, address, control).

> [!WARNING]
> **Von Neumann bottleneck** — because instructions and data share one bus and one memory, the CPU often waits for the memory: the single "instruction & data stream" limits throughput. Harvard architecture (separate instruction and data memories) avoids it. Modern CPUs use caches and separate pipelines to soften the problem.

# Evolution and Computer Generations

| Generation | Technology | Main feature | Examples |
|---|---|---|---|
| First (1940s–50s) | Vacuum tubes | machine language, punched cards | ENIAC, UNIVAC |
| Second (1950s–60s) | Transistors | assembly language, magnetic core memory | IBM 7090 |
| Third (1960s–70s) | ICs | high-level languages, operating systems | IBM 360, PDP-8 |
| Fourth (1970s–90s) | LSI / VLSI microprocessors | microcomputer revolution, PCs | Intel 8086, 80386 |
| Fifth (1990s–) | ULSI / parallel & AI | parallel processing, multicore, AI | modern multicores, GPUs |

# Number Systems Recap

| System | Base | Digits | Example |
|---|---|---|---|
| Binary | 2 | 0, 1 | `1010₂ = 10` |
| Octal | 8 | 0–7 | `12₈ = 10` |
| Decimal | 10 | 0–9 | `10` |
| Hexadecimal | 16 | 0–9, A–F | `A16 = 161` |

Conversions you must be fluent in:

```text
Decimal → Binary : divide by 2, collect remainders bottom-to-top.
  25 → 11001
Binary → Decimal : multiply each bit by its position weight.
  11001 → 16+8+0+0+1 = 25
Binary → Hex     : group 4 bits from the right.
  11001 → 0001 1001 → 19₁₆
Hex → Binary     : expand each hex digit to 4 bits.
  A3 → 1010 0011
```

# Fixed Point Representation

A fixed-point number has a **fixed** number of bits for the integer part and a **fixed** number for the fractional part (the binary point position is fixed by convention).

Example — Q4.4 format (4 integer bits + 4 fractional bits): the value `0011.1010` = 2 + 1 + 0.5 + 0.125 = **3.625**.

## Representing negative integers

| Scheme | Idea | Example for −5 (8-bit) | Drawback |
|---|---|---|---|
| Sign-magnitude | 1 sign bit + magnitude | `10000101` | two zeros (+0, −0) |
| 1's complement | invert all bits | `11111010` | two zeros, end-around carry |
| **2's complement** | invert + add 1 | `11111011` | one zero; standard in hardware |

2's complement is used everywhere because **addition and subtraction share one circuit** (subtraction = add the 2's complement).

```text
 5  = 00000101
−5  = invert → 11111010, +1 → 11111011
 5 + (−5) = 00000101 + 11111011 = 1 00000000 → 0 (carry out is discarded)
```

**Overflow** happens when the result of an operation exceeds the representable range. Detect it by comparing the **carry into the sign bit** and the **carry out of the sign bit** — if they differ, overflow.

```text
120 + 120 in 8-bit signed (max 127):
  01111000 + 01111000 = 11110000 → looks negative → OVERFLOW
```

# Floating Point Representation (IEEE 754)

Floating point stores a number in normalized scientific form: **±1.mantissa × 2<sup>exponent</sup>**, using three fields:

<div class="flow">
<div class="fnode fmain">Single precision (32 bits)</div>
<div class="fnode">Sign (1 bit) &nbsp;|&nbsp; Exponent (8 bits, biased by 127) &nbsp;|&nbsp; Mantissa/Fraction (23 bits)</div>
<div class="fnode fmain">Double precision (64 bits)</div>
<div class="fnode">Sign (1 bit) &nbsp;|&nbsp; Exponent (11 bits, biased by 1023) &nbsp;|&nbsp; Mantissa/Fraction (52 bits)</div>
</div>

- The leading `1.` of the mantissa is **implicit** (the hidden bit) — it is not stored.
- Exponent is stored **biased** (excess-127) so it can be compared like an unsigned number.
- Special values: exponent all 0s → zero/denormal; all 1s with mantissa 0 → ±infinity; all 1s with mantissa ≠ 0 → NaN.

> [!EXAMPLE]
> Convert **4.5** to single precision.
> `4.5 = 100.1₂ = 1.001 × 2²` → sign 0, exponent = 2 + 127 = 129 = `10000001`,
> fraction = `0010...0` (23 bits).
> Result: `0 10000001 00100000000000000000000` = `0x40900000`.

Ranges (binary32): ≈ ±3.4 × 10<sup>38</sup>, smallest normal ≈ 1.2 × 10<sup>−38</sup>, ~7 significant decimal digits.

> [!WARNING]
> Floating point is **approximate**: 0.1 cannot be represented exactly in binary, so many decimal fractions round. This is why money should be kept as integers (cents/paise) in business software.

# Decimal Arithmetic (BCD)

==BCD (Binary Coded Decimal)== stores each decimal digit in 4 bits — `25` becomes `0010 0101`. It is used in calculators and financial systems because conversion to/from decimal is trivial and exact.

- **Unpacked BCD**: one digit per byte.
- **Packed BCD**: two digits per byte.

**BCD addition**: add the 4-bit groups; if the result is > 9 (or a carry occurs), add **6 (0110)** to correct it.

> [!EXAMPLE]
> 15 + 27 in BCD:
> `0001 0101` + `0010 0111` = `0011 1100`; low nibble `1100` = 12 &gt; 9 so add 6:
> `1100 + 0110 = 0001 0010` (carry 1 into the next digit) → `0100 0010` = **42**. ✔

<div class="flow">
<div class="fnode">Start — add BCD digits (4-bit each)</div>
<div class="farrow">↓</div>
<div class="fdiamond">Sum > 9 or carry? (0000–1001)</div>
<div class="farrow">→ Yes ↓</div>
<div class="fnode">Add 0110 (6) correction, propagate carry</div>
<div class="farrow">↓</div>
<div class="fnode">Valid BCD result</div>
</div>

# Binary Addition and Subtraction

**Addition** follows the normal rules (0+0=0, 0+1=1, 1+1=10 with carry). **Subtraction** in 2's complement: take the 2's complement of the subtrahend and **add** it.

> [!EXAMPLE]
> 9 − 5: 5 = `00000101`, −5 = `11111011`; `00001001 + 11111011 = 1 00000100` → ignore carry → **4**. ✔

**Overflow rule for 2's complement addition:** with operands of the *same sign* the result must have that sign; if A and B are positive and the sum is negative (or vice-versa), overflow has occurred.

# Multiplication — Booth's Algorithm

Any binary multiplier can repeatedly do: *shift-add* (like long multiplication). For n-bit × n-bit this needs n additions — slow. **Booth's algorithm** is a signed multiplication method that **skips runs of 1s** in the multiplier using the idea of *recoding*: `0111...1` blocks are replaced by one subtraction and one addition.

## Booth's recoding idea

For a run of k ones starting at position i: `+2^i + 2^(i+1) + … + 2^(i+k−1) = 2^(i+k) − 2^i`. So a run of 1s needs only **one subtraction and one addition** instead of k additions.

The algorithm inspects two bits of the multiplier at a time:

| Pair (Q0 Q-1) | Operation |
|---|---|
| 00 | no operation (shift) |
| 01 | **A = A + M** |
| 10 | **A = A − M** |
| 11 | no operation (shift) |

After every step the **combined (A, Q, Q-1)** is **arithmetically shifted right** (MSB of A replicates), and the count decreases.

## Algorithm (flowchart)

<div class="flow">
<div class="fnode">Start: A = 0, Q-1 = 0, count = n; M = multiplicand, Q = multiplier</div>
<div class="farrow">↓</div>
<div class="fdiamond">count = 0?</div>
<div class="farrow">No ↓</div>
<div class="fdiamond">Q0 Q-1 = ?</div>
<div class="farrow">↓ 01 → A=A+M &nbsp;·&nbsp; 10 → A=A−M &nbsp;·&nbsp; 00 or 11 → no-op</div>
<div class="fnode">Arithmetic right shift (A, Q, Q-1)</div>
<div class="farrow">↓</div>
<div class="fnode">count = count − 1 → repeat</div>
<div class="farrow">← back to count test ↑</div>
<div class="fnode fmain">Done: product = A : Q</div>
</div>

## Hardware implementation

<div class="hw">
<div class="hw-row">
<div class="hw-box hw-alu">Adder / Subtractor (n-bit ALU)</div>
<div class="hw-arrow">↔</div>
<div class="hw-box">A register (n bits, starts 0)</div>
</div>
<div class="hw-row">
<div class="hw-box">M register — multiplicand</div>
<div class="hw-arrow">→</div>
<div class="hw-box hw-alu">ALU</div>
<div class="hw-arrow">→</div>
<div class="hw-box">A register</div>
</div>
<div class="hw-row">
<div class="hw-box">Q register — multiplier (n bits)</div>
<div class="hw-arrow">→</div>
<div class="hw-box hw-small">Q-1 flip-flop</div>
<div class="hw-note">Control logic watches Q0 Q-1, drives Add / Subtract / Arithmetic shift; A and Q shift together (A·Q holds the product).</div>
</div>
</div>

## Worked example: 7 × 3 = 21

M = 0111 (7), Q = 0011 (3), A = 0000, Q-1 = 0, count = 4.

| Count | Q0 Q-1 | Operation | A | Q | Q-1 |
|---|---|---|---|---|---|
| 4 | 10 | A = A − M = 0000 − 0111 = 1001 | 1001 | 0011 | 0 |
| 3 | — | shift right | 1100 | 1001 | 1 |
| 2 | 11 | no-op (shift) | 1110 | 0100 | 1 |
| 1 | 01 | A = A + M = 1110 + 0111 = 0101 | 0101 | 0100 | 1 |
| 0 | — | shift right → done | 0010 | 1010 | 0 |
| 0 | — | shift right (final) | **0001** | **0101** | 0 |

Result `A:Q = 0001 0101` = **21** ✔

> [!NOTE]
> Booth's algorithm works with **signed** (2's complement) numbers directly and speeds up multiplication when the multiplier contains long runs of 1s. The worst case (alternating bits like `1010…`) needs the same number of operations as plain shift-and-add.

# Multiprocessors and Multicomputers

| | Multiprocessor | Multicomputer |
|---|---|---|
| CPUs | multiple CPUs share **one memory** (tightly coupled) | each computer has **its own memory** (loosely coupled) |
| Communication | shared memory / bus | message passing over a network |
| Failure | one CPU failure affects the whole system | more fault tolerant |
| Programming | parallel programming (threads, shared variables) | distributed programming (send/receive) |
| Also called | shared-memory system | cluster |

**Flynn's taxonomy** classifies machines by instruction stream × data stream:

| Class | Meaning | Example |
|---|---|---|
| SISD | single instruction, single data | ordinary single-core PC |
| SIMD | single instruction, multiple data | GPU vector units |
| MISD | multiple instructions, single data | rare (fault-tolerant designs) |
| MIMD | multiple instructions, multiple data | multiprocessors, multicomputers |

# Performance Measures — MIPS and MFLOPS

- **CPI** (cycles per instruction) = average clock cycles per instruction.
- **CPU time** = instruction count × CPI × clock cycle time.
- ==MIPS== = millions of instructions executed per second = `clock_rate / (CPI × 10⁶)`.
- ==MFLOPS== = millions of floating-point operations per second = `floating point ops / (execution time × 10⁶)`.

> [!EXAMPLE]
> A 2 GHz (2 × 10⁹ Hz) processor at CPI = 2 executes:
> MIPS = 2 × 10⁹ / (2 × 10⁶) = **1000 MIPS**.
> If it performs 6 × 10⁷ floating point ops in 0.05 s → MFLOPS = 6 × 10⁷ / (0.05 × 10⁶) = **1200 MFLOPS**.

> [!WARNING]
> MIPS is a **questionable** metric: a machine can achieve high MIPS on easy instructions but take longer on real programs, and MIPS varies between ISAs. MFLOPS is fairer for scientific workloads. The reliable measure is the **execution time** of a benchmark.

**Amdahl's law** (full treatment in Unit 2) warns that the speed-up of a whole system is limited by the fraction of work that **cannot** be sped up.

# Memory Organization

## Memory hierarchy

The hierarchy exploits the principle of **locality** (programs reuse recent data/instructions). Fast, expensive memory is placed closest to the CPU; slow, cheap, huge storage at the bottom.

<div class="flow">
<div class="fnode fmain">Registers (CPU internal, ≈ 1 ns, few hundred bytes)</div>
<div class="farrow">↑ faster · smaller · costlier per byte ↓</div>
<div class="fnode">Cache L1 / L2 / L3 (SRAM, a few MB)</div>
<div class="farrow">↕</div>
<div class="fnode">Main memory (DRAM, GBs)</div>
<div class="farrow">↕</div>
<div class="fnode">Secondary storage (SSD / HDD — TBs)</div>
</div>

| Level | Technology | Typical size | Access time |
|---|---|---|---|
| Register | flip-flops | 100s B | ~1 ns |
| Cache | SRAM | KB–MB | 1–10 ns |
| Main memory | DRAM | GB | ~100 ns |
| Disk / SSD | magnetic / flash | TB | ms |

## Types of memory

| Type | Volatile? | Use |
|---|---|---|
| **SRAM** | yes | cache (fast, 6 transistors/bit) |
| **DRAM** | yes (needs refresh) | main memory (1 transistor + capacitor/bit) |
| **ROM** | no | firmware (programmed once) |
| **PROM** | no | one-time programmable |
| **EPROM** | no | erasable with UV light |
| **EEPROM / Flash** | no | electrically erasable; USB drives, SSDs, BIOS |

## TLB (Translation Lookaside Buffer)

==TLB== is a small, very fast **cache of page-table entries**. When the CPU produces a **virtual address**, the MMU must translate it to a **physical address** using the page table (kept in main memory). Walking the page table on every access is slow, so recent translations are cached in the TLB.

<div class="flow">
<div class="fnode">CPU issues virtual address</div>
<div class="farrow">↓</div>
<div class="fdiamond">TLB hit? (tag = page number)</div>
<div class="farrow">→ Hit ↓</div>
<div class="fnode fmain">Frame number obtained instantly → physical address → cache/memory</div>
<div class="farrow">← Miss (else) ↓</div>
<div class="fnode">Walk the page table in memory → load entry into TLB</div>
</div>

- **TLB hit** — translation is fast (no memory access for the page table).
- **TLB miss** — the MMU must access the page table (extra memory accesses) or raise a **page fault** if the page is not in memory.
- Like caches, the TLB uses **associative or set-associative** lookup and **LRU** replacement.

> [!TIP]
> Remember the chain: **Virtual address → TLB (translation cache) → page table (in memory) → physical address → cache → main memory.** TLB speeds up address translation; cache speeds up data access — they are different caches at different levels.

# Quick Revision

| Topic | One-line answer |
|---|---|
| Organization vs architecture | how it's built vs what it offers |
| Von Neumann | program + data in one memory, sequential fetch-execute |
| 2's complement | invert + add 1; single add/sub circuit |
| IEEE 754 | ±1.m × 2<sup>e</sup>, biased exponent, hidden bit |
| BCD correction | add 6 when a nibble sum > 9 |
| Booth's algorithm | signed multiply; recodes runs of 1s; uses 00/01/10/11 pairs |
| MIPS / MFLOPS | performance rates based on instructions / float ops |
| Memory hierarchy | registers → cache → RAM → disk (faster, smaller, costlier upward) |
| TLB | cache of page table entries for address translation |

# Practice Questions

1. Distinguish computer organization from computer architecture with examples.
2. Explain the Von Neumann architecture with a block diagram. What is the Von Neumann bottleneck?
3. Represent −13 in 8-bit sign-magnitude, 1's complement and 2's complement. Add 13 and −13 in 2's complement.
4. Convert 6.75 to IEEE 754 single precision.
5. Add 28 + 19 in BCD and show the correction step.
6. Multiply (−6) × 5 using Booth's algorithm. Show all steps.
7. Draw the flowchart of Booth's algorithm and label its hardware registers.
8. Explain Flynn's taxonomy. Differentiate a multiprocessor from a multicomputer.
9. Compute MIPS for a 2.4 GHz machine with CPI = 3.
10. Draw the memory hierarchy. Explain why TLB is needed and what happens on a TLB miss.