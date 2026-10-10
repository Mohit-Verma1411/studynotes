---
id: coa-u2
title: COA Unit 2 — CPU Design, Control Unit, Microprogramming, CISC & RISC
subject: coa
unit: 2
date: 2026-02-14
featured: true
tags: registers, stack, bus, interrupts, amdahl, microprogrammed control, cisc, risc
description: General register and stack organization, the common bus system, computer instructions, timing and control, I/O and the interrupt cycle, Amdahl's law, microprogrammed control — control memory, address sequencing, microinstruction formats — plus hardwired vs microprogrammed control and CISC vs RISC.
---

# General Register Organization

The ==general register organization== is the CPU design where several registers feed into an **ALU** through multiplexers, and the **control unit** supplies a *control word* that selects which two operands the ALU processes and where the result goes.

<div class="hw">
<div class="hw-row"><div class="hw-box hw-alu">ALU (arithmetic-logic)</div></div>
<div class="hw-row">
<div class="hw-box">R0</div><div class="hw-box">R1</div><div class="hw-box">…</div><div class="hw-box">R(n−1)</div><div class="hw-box">MUX A</div><div class="hw-box">MUX B</div>
</div>
<div class="hw-row"><div class="hw-box">Control word: SELA (select A) · SELB (select B) · OPR (operation) · SELD (destination)</div></div>
</div>

- **SELA / SELB** — choose the two source registers (multiplexer select bits).
- **OPR** — select the ALU operation (add, subtract, AND, OR, XOR, shift…).
- **SELD** — choose the destination register for the result.

A **control word** for a 3-operand instruction `R3 ← R1 + R2` would be: `SELA=001` (R1), `SELB=010` (R2), `OPR=ADD`, `SELD=011` (R3). The control unit decodes each field and enables the right data paths; **hardwired and microprogrammed** control units differ only in *how* these control words are generated.

# Stack Organization

A ==stack== is a **Last-In-First-Out (LIFO)** structure with two operations:

| Operation | Effect |
|---|---|
| **PUSH** | place an item on top |
| **POP** | remove the top item (and read it) |

## Register stack

A stack of registers with a `SP` (stack pointer) that always points to the top item.

```text
PUSH: SP ← SP + 1 ;  M[SP] ← data      (if SP == FULL → stack-full flag)
POP : data ← M[SP]  ;  SP ← SP − 1     (if SP == 0 → stack-empty flag)
```

Eight registers: `FULL` when SP = 7, `EMPTY` when SP = 0 (common implementation uses "full descending" stacks).

## Memory stack

The same logic with a memory address range for the stack; `SP` holds the address of the top element. Memory is *not* cleared on push/pop — a new push simply overwrites the old top.

## Uses of the stack

- Subroutine call/return (PUSH return address, POP to restore PC).
- Expression evaluation (postfix — see Data Structures notes).
- Reversing data, matching brackets, and handling interrupts.
- Function parameters and local variables (call frame) in high-level compilers.

# Common Bus System

A ==bus== is a set of common lines that transfer data between registers. To avoid dedicated wires between every pair of registers, all registers connect to a **common bus** through **three-state buffers**; the selection lines enable exactly **one** source at a time.

<div class="hw">
<div class="hw-row">Common bus (8/16/32 lines) — only one source enabled at a time</div>
<div class="hw-row">
<div class="hw-box">R0</div><div class="hw-box">R1</div><div class="hw-box">R2</div><div class="hw-box">R3</div><div class="hw-box">PC</div><div class="hw-box">AR</div><div class="hw-box">M[AR]→DR</div><div class="hw-box">INPR</div>
</div>
<div class="hw-row"><div class="hw-box">Select lines S2 S1 S0 → select which register's 3-state buffers drive the bus</div></div>
</div>

- Each register's output passes through **3-state buffers** (high impedance = disconnected).
- A 3-to-8 decoder decodes the **selection code** (e.g. `S2S1S0 = 101` selects AR) and enables that register's buffers.
- The **destination** register receives bus data when its **load (LD)** input is pulsed by the control unit.
- Memory is handled the same way: `M[AR]` can be placed on the bus, and `DR` can load from the bus — this is exactly how the Basic Computer of Mano moves data.

> [!EXAMPLE]
> To copy PC into AR: set selection lines to the PC code, pulse the `LD` (load) input of AR. One bus transfer, one clock pulse. Register-to-register transfers between any two registers need just select + load.

# Computer Instructions

An ==instruction== is a command the CPU understands; it usually contains an **opcode** (what to do) and **operands/addresses** (where the data is).

## Instruction formats (Basic Computer, 16-bit)

| Type | Bits | Meaning |
|---|---|---|
| Memory-reference | 15–12 opcode, 11–0 address | operand in memory |
| Register-reference | 15 = 0/opcode 111, rest = operation | operate on AC |
| Input-Output | 15–12 = 1111, rest = I/O command | INPR/OUTR control |

## Common instruction types

- **Data transfer:** `LOAD`, `STORE`, `MOV`, `PUSH`, `POP`
- **Arithmetic:** `ADD`, `SUB`, `MUL`, `DIV`, `INC`, `DEC`
- **Logical:** `AND`, `OR`, `XOR`, `NOT`, shifts
- **Control transfer:** `JUMP`, `CALL`, `RETURN`, `BRANCH` (conditional)
- **I/O:** `IN`, `OUT`
- **Program control:** `HALT`, `NOP`

# Timing and Control

The CPU must sequence every microoperation with clock pulses. A **sequence counter (SC)** and **decoder** generate the timing signals `T0, T1, T2, …`.

## Fetch cycle (basic computer)

| Timing | Micro-operation |
|---|---|
| `T0` | AR ← PC (put program counter on address bus) |
| `T1` | IR ← M[AR] ; PC ← PC + 1 (read instruction, increment PC) |
| `T2` | Decode IR; D0…D7 = opcode decoder; if indirect bit, fetch operand address |

Then the **execute** cycle for that instruction (e.g. `ADD`): DR ← M[AR]; AC ← AC + DR.

**Instruction cycle = fetch → (indirect) → execute → (interrupt).**

Two ways to build the control unit:

| | Hardwired control | Microprogrammed control |
|---|---|---|
| Implementation | logic gates + flip-flops | control memory (ROM) |
| Changeability | fixed at design time | change microinstructions, not hardware |
| Speed | fast | slower (ROM access per microstep) |
| Cost for complex ISAs | high, error-prone | low, structured |
| Used in | RISC, simple CPUs | complex ISAs historically (CISC) |

# Input, Output and Interrupts

- **Programmed I/O** — the CPU polls/wait-loops for an I/O device; simple but wastes CPU time.
- **Interrupt I/O** — the device *signals* the CPU when ready; the CPU finishes the current instruction and services the device.
- **DMA** — a controller moves blocks of data directly to/from memory without CPU involvement per byte.

## Types of interrupts

| Type | Cause |
|---|---|
| Internal (software/trap) | division by zero, system calls, `INT` instruction |
| External (hardware) | device requesting service, timer, power failure |
| Maskable | can be disabled by software |
| Non-maskable (NMI) | must always be serviced (e.g. power loss) |

## The interrupt cycle (Mano Basic Computer)

When the CPU is enabled for interrupts (`IEN=1`) and an interrupt arrives (`R` flip-flop set):

| Timing | Micro-operation | Purpose |
|---|---|---|
| `T0` | AR ← 0 ; TR ← PC | prepare memory location 0; save return address |
| `T1` | M[0] ← TR ; PC ← 0 | store return address at address 0 |
| `T2` | PC ← PC + 1 ; IEN ← 0 ; R ← 0 | jump to address 1; disable further interrupts |

The interrupt service routine starts at address **1** (which usually contains a `JUMP` to the real handler). At the end, the handler restores the return address and re-enables interrupts.

<div class="flow">
<div class="fnode">Instruction cycle ends (execute done)</div>
<div class="farrow">↓</div>
<div class="fdiamond">Interrupt? (IEN=1 and R=1)</div>
<div class="farrow">No → next fetch</div>
<div class="farrow">Yes ↓</div>
<div class="fnode">T0: AR←0, TR←PC &nbsp;→&nbsp; T1: M[0]←TR, PC←0 &nbsp;→&nbsp; T2: PC←PC+1, IEN←0, R←0</div>
<div class="farrow">↓</div>
<div class="fnode">Execute interrupt service routine at address 1 → return to saved address</div>
</div>

# Design Drivers

## Design for the common case

Hardware should favor the **most frequent** operation. Examples:

- Make the **register-register** path fastest (most instructions use registers).
- **Instruction prefetch** and **pipelined fetch** because fetches happen every cycle.
- Fast **cache** on the memory the CPU touches most (locality).
- In x86, the most common instruction lengths get short encodings.

## Amdahl's law

The overall speed-up is limited by the fraction `f` of the task that is improved, no matter how fast you make the rest:

> Speedup = 1 / [(1 − f) + f / s]   where s = speed-up of the improved part.

> [!EXAMPLE]
> 40% of a program (f = 0.4) becomes 5× faster (s = 5):
> Speedup = 1 / [0.6 + 0.4/5] = 1 / 0.68 = **1.47×**.
> Even with s → ∞ you only reach 1/0.6 = 1.67× — the **unimproved 60%** dominates.

> [!WARNING]
> Amdahl's law is the classic exam trap: never quote just the "5×" — quote the small **bound** (1.67×) and the actual 1.47×.

# Microprogrammed Control Organization

A **microprogrammed control unit** implements the control logic as a **microprogram** stored in ==control memory== (a fast ROM). Each microinstruction controls one clock step.

- **Microinstruction** — one row of control memory; sets control signals for one step.
- **Microoperation** — an elementary operation (register transfer) caused by control bits.
- **Microprogram** — the sequence of microinstructions that implements a machine instruction.

<div class="hw">
<div class="hw-row"><div class="hw-box hw-alu">Control memory (ROM) — microinstructions</div></div>
<div class="hw-row"><div class="hw-box">Next-address generator + incrementer + branch logic</div><div class="hw-arrow">→</div><div class="hw-box">Control address register (CAR)</div><div class="hw-arrow">→</div><div class="hw-box">Control memory</div><div class="hw-arrow">→</div><div class="hw-box">MIR — microinstruction register → control signals</div></div>
</div>

## Microinstruction format

Each microinstruction usually has three functional groups:
**control bits** (micro-operations to perform), **condition select (CD)**, **branch control (BR)** and the **next address (AD)**.

<div class="fields">
<span class="field f1">F1 (op 1)</span><span class="field f1">F2 (op 2)</span><span class="field f1">F3 (op 3)</span><span class="field cd">CD (condition)</span><span class="field br">BR (branch)</span><span class="field ad">AD (address)</span>
</div>

- **F1…F3** — select micro-operations (encoded; decoded into control signals).
- **CD** — which status bit is tested (I, S, Z, or none).
- **BR** — branch type (JMP, CALL, RET, MAP, none).
- **AD** — branch/next address.

## Address sequencing

The next microinstruction address comes from one of four sources:

1. **Incrementer** — next sequential microinstruction (`CAR + 1`).
2. **Mapping logic** (MAP) — opcode of the machine instruction selects the start of its microprogram.
3. **Branch/subroutine logic** — conditional branch taken from `AD`; subroutine calls/returns via a **return address stack**.
4. **Reset** — first microinstruction (address 0).

<div class="flow">
<div class="fnode">Machine instruction → opcode → mapping ROM gives microaddress</div>
<div class="farrow">↓</div>
<div class="fdiamond">Conditional branch? (CD bit)</div>
<div class="farrow">No ↓</div>
<div class="fnode">Next = CAR + 1 (incrementer)</div>
<div class="farrow">Yes ↓</div>
<div class="fnode">Next = AD from microinstruction (or subroutine call/return via stack)</div>
<div class="farrow">↓</div>
<div class="fnode fmain">Load CAR → fetch microinstruction → execute → repeat</div>
</div>

## Horizontal vs Vertical microprogramming

| | **Horizontal** | **Vertical** |
|---|---|---|
| Control bits | many bits, one per control signal (wide) | few bits, encoded (narrow) |
| Parallelism | many micro-ops per instruction | one micro-op per instruction |
| Decoding | little-to-none | heavy (decoder needed) |
| Word size | long | short |
| ROM size / speed | large but fast | smaller but slower per microstep |
| Flexibility | high | lower |
| Contrast | like RISC thinking | like CISC thinking |

## Microprogram sequencer

A **microprogram sequencer** is the hardware that generates the next address:

```text
Sources: incrementer / branch address / mapping ROM / subroutine stack
     |
     v
 MUX (selected by branch logic) → CAR → control memory → MIR → control signals
```

# Hardwired vs Microprogrammed Control

| Point | Hardwired | Microprogrammed |
|---|---|---|
| Nature | sequential logic circuit | program in control memory |
| Design | difficult, unstructured | simple, regular |
| Modify | redesign hardware | update microprogram |
| Speed | fast | slower (memory read per step) |
| Cost (complex ISAs) | high | low |
| Best for | RISC, fixed simple CPUs | complex/CISC instruction sets |

# CISC and RISC

## CISC — Complex Instruction Set Computer

- **Many complex instructions**, some spanning multiple clock cycles.
- **Variable-length instructions**, fewer instructions per program.
- Rich addressing modes; instructions can operate on **memory directly**.
- Hardware (microprogram) does the heavy lifting — smaller code size.
- Examples: Intel x86 family.

## RISC — Reduced Instruction Set Computer

- **Small, simple, uniform** instruction set — most complete in **one clock cycle**.
- **Fixed-length** instructions; **load-store** architecture (only LOAD/STORE touch memory).
- **Many registers** (~32); **pipelining** friendly; compiler does the optimization.
- **Hardwired control** (fast); no microprogram for instructions.
- Examples: ARM, MIPS, RISC-V.

| Feature | CISC | RISC |
|---|---|---|
| Instruction size | variable | fixed (32-bit) |
| Clock cycles/instruction | many | one (typically) |
| Addressing modes | many | few |
| Memory access | instructions may access memory | only load/store |
| Registers | fewer | many |
| Control | microprogrammed | hardwired |
| Pipelining | harder | easy |
| Code size | small | larger |
| Examples | x86, 68000 | ARM, MIPS, RISC-V |

> [!TIP]
> Exam favourite: "Compare CISC and RISC." Anchor your answer on **five axes**: instruction complexity/size, cycles per instruction, where operations happen (memory vs registers), control unit type, and register count.

# Quick Revision

| Concept | One-liner |
|---|---|
| Control word | SELA · SELB · OPR · SELD selects ALU operands/destination |
| Stack | LIFO; PUSH increments SP, POP decrements |
| Common bus | shared lines + 3-state buffers, one source at a time |
| Interrupt cycle | save PC at M[0], jump to 1, disable further interrupts |
| Amdahl's law | Speedup = 1/[(1−f) + f/s] |
| Microinstruction | (F1,F2,F3,CD,BR,AD) one-step control row in ROM |
| Horizontal vs vertical | wide & parallel vs narrow & encoded |
| Hardwired vs micro | fast logic vs stored program |
| CISC vs RISC | rich complex vs simple load-store pipelined |

# Practice Questions

1. Explain general register organization of a CPU with the control word fields.
2. Write PUSH/POP microsequences for a register stack and a memory stack. List four uses of a stack.
3. Draw the common bus system for 8 registers with three-state buffers and selection lines.
4. Explain the interrupt cycle of the Basic Computer with the timing signals.
5. State and prove-by-example Amdahl's law. When is the speed-up bound reached?
6. Explain the microinstruction format and the four sources of next address.
7. Compare horizontal and vertical microprogramming.
8. Compare hardwired and microprogrammed control units.
9. Compare CISC and RISC on at least six points.
10. Draw the microprogram sequencer block diagram and trace one branch.