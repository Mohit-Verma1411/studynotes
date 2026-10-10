---
id: math-u1
title: Math Unit I — Probability & Discrete Random Variables
subject: math
unit: 1
date: 2026-02-06
featured: true
tags: probability, additive law, conditional probability, independent events, bayes theorem, random variables, pmf, expectation, variance
description: Basic probability — sample spaces, the additive law, conditional probability, independent events and Bayes' theorem — then discrete random variables: probability distributions, PMF, distribution function, expectation, moments, variance and standard deviation — with formulas and solved examples.
---

# Basic Probability

## Random experiment, sample space, event

| Term | Meaning | Example (toss a coin twice) |
|---|---|---|
| ==Random experiment== | process with more than one possible outcome, repeatable | tossing a coin 2 times |
| ==Outcome== | one possible result | `H T` |
| ==Sample space== S | set of all outcomes | {HH, HT, TH, TT} |
| ==Event== E | a subset of S | E = "at least one head" = {HH, HT, TH} |

## Ways to define probability

| Definition | Formula | Idea |
|---|---|---|
| **Classical** (equally likely) | P(E) = n(E) / n(S) | count favourable ÷ total outcomes |
| **Relative frequency** | P(E) ≈ n(E) / N as N → ∞ | long-run proportion of success |
| **Axiomatic (Kolmogorov)** | three axioms | see below |

**Axioms:**

> 1. 0 ≤ P(E) ≤ 1 for every event E.
> 2. P(S) = 1 (something must happen).
> 3. For mutually exclusive events: P(E1 ∪ E2 ∪ …) = P(E1) + P(E2) + …

> [!EXAMPLE]
> Roll a fair die. P(even) = n{2,4,6}/6 = 3/6 = **1/2**. P(7) = 0 (impossible). P(≤6) = 1 (certain).

## Complement rule

P(E′) = 1 − P(E), where E′ = "not E". *Useful when "not" is easier to count.*

> [!EXAMPLE]
> P("at least one head" in 3 tosses) = 1 − P(no head) = 1 − (1/2)³ = 7/8.

# Additive Law of Probability

For **any two events A and B:**

<div class="formula big">
P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
</div>

If **A and B are mutually exclusive** (A ∩ B = ∅), the law reduces to:

<div class="formula big">
P(A ∪ B) = P(A) + P(B)
</div>

> [!EXAMPLE]
> P(A) = 0.5, P(B) = 0.4, P(A ∩ B) = 0.2 → P(A ∪ B) = 0.5 + 0.4 − 0.2 = **0.7**.
> If instead A and B cannot occur together: P(A ∪ B) = 0.5 + 0.4 = **0.9**.

## Three events

P(A ∪ B ∪ C) = P(A) + P(B) + P(C) − P(A∩B) − P(B∩C) − P(A∩C) + P(A∩B∩C)

> [!TIP]
> The additive law is your **first tool** for "at least one" and "or" questions. Subtract the overlap once so it is not counted twice.

# Conditional Probability

The probability of **A given that B has occurred:**

<div class="formula big">
P(A | B) = <span class="frac"><span class="num">P(A ∩ B)</span><span class="den">P(B)</span></span> ,&nbsp; P(B) &gt; 0
</div>

Equivalently: **P(A ∩ B) = P(B) · P(A | B)** (the *multiplication rule*).

> [!EXAMPLE]
> In a class of 60 students, 24 like cricket (C) and 18 of those also like football (F).
> P(F | C) = P(F ∩ C) / P(C) = (18/60) / (24/60) = 18/24 = **3/4**.

> [!WARNING]
> P(A|B) ≠ P(B|A) in general. "Chance you have the disease given a positive test" is *not* the same as "chance of a positive test given the disease."

# Independent Events

Events A and B are ==independent== if the occurrence of one does **not** change the probability of the other:

<div class="formula big">
P(A ∩ B) = P(A) · P(B) &nbsp;&nbsp;⇔&nbsp;&nbsp; P(A | B) = P(A)
</div>

| Situation | Formula |
|---|---|
| Independent events | P(A ∩ B) = P(A)·P(B) |
| Mutually exclusive events | P(A ∩ B) = 0 (they are *never* independent unless one has P = 0) |
| Both A and B "at least one" | P(A ∪ B) = P(A) + P(B) − P(A)·P(B) |

> [!EXAMPLE]
> Toss a coin twice. A = {first is H}, B = {second is H}.
> P(A ∩ B) = P(HH) = 1/4 = (1/2)(1/2) ✔ → **independent**.
> But A = {first H}, C = {exactly one H}: P(A ∩ C) = P(HT) = 1/4, while P(A)P(C) = (1/2)(1/2) = 1/4 — equal again here; in general always verify with the formula.

# Bayes' Theorem

Bayes' theorem **reverses conditional probabilities**. If events A1, A2, …, An are mutually exclusive and exhaustive (they partition S):

<div class="formula big">
P(Ak | B) = <span class="frac"><span class="num">P(Ak) · P(B | Ak)</span><span class="den">Σ P(Aj) · P(B | Aj)</span></span>
</div>

Where P(Aj) are the **prior** probabilities and P(Aj | B) are the **posterior** probabilities.

> [!EXAMPLE]
> Two machines: A makes 60% of items (1% defective), B makes 40% (2% defective). An item is found defective (D).
> P(A|D) = <span class="frac"><span class="num">(0.6)(0.01)</span><span class="den">(0.6)(0.01) + (0.4)(0.02)</span></span>
> = <span class="frac"><span class="num">0.006</span><span class="den">0.014</span></span> = **3/7 ≈ 0.4286**.

> [!TIP]
> Bayes' theorem exam recipe: (1) write the partition events and priors, (2) write the conditional probabilities P(B|Aj), (3) build the denominator as the weighted sum, (4) put the required term on top.

# Random Variables

A ==random variable (RV)== is a **function that assigns a real number to each outcome** of a random experiment. It is ==discrete== if it takes **only countably many values** (finite or countable set).

| RV | Experiment | Values X = |
|---|---|---|
| X = number of heads | toss 3 coins | 0, 1, 2, 3 |
| X = sum | roll two dice | 2, 3, …, 12 |
| X = demand per day | count orders | 0, 1, 2, … |

## Probability distribution and PMF

The ==probability mass function (PMF)== maps each value to its probability:

<div class="formula big">
p(x) = P(X = x),&nbsp; with &nbsp; p(x) ≥ 0 and Σ<sub>x</sub> p(x) = 1
</div>

> [!EXAMPLE]
> Number of heads in 3 tosses (X = 0,1,2,3):

| x | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| p(x) | 1/8 | 3/8 | 3/8 | 1/8 |

Check: 1/8 + 3/8 + 3/8 + 1/8 = **1** ✔

## Distribution (cumulative) function

<div class="formula big">
F(x) = P(X ≤ x) = Σ<sub>t ≤ x</sub> p(t)
</div>

For the example above:

| x | &lt;0 | 0 | 1 | 2 | 3 | ≥4 |
|---|---|---|---|---|---|---|
| F(x) | 0 | 1/8 | 4/8 | 7/8 | 1 | 1 |

Properties: F is non-decreasing, 0 ≤ F ≤ 1, F(−∞) = 0, F(+∞) = 1, and P(a < X ≤ b) = F(b) − F(a).

## Expectation (mean)

<div class="formula big">
E(X) = μ = Σ x · p(x)
</div>

## Moments

The **r-th moment about the origin**:

<div class="formula big">
μ′<sub>r</sub> = E(X<sup>r</sup>) = Σ x<sup>r</sup> · p(x)
</div>

So E(X) = μ′1 and E(X²) = μ′2.

## Variance and standard deviation

<div class="formula big">
Var(X) = σ² = E(X²) − [E(X)]²&nbsp;=&nbsp; Σ x²p(x) − μ²
</div>

<div class="formula big">
SD(X) = σ = √Var(X)
</div>

| Quantity | Meaning |
|---|---|
| E(X) | centre / average value of X |
| E(X²) | second moment (used for variance) |
| Var(X) | average squared distance from the mean (spread) |
| σ | standard deviation — spread in the same units as X |

> [!EXAMPLE]
> X = number of heads in 3 tosses: p = (1/8, 3/8, 3/8, 1/8) for x = (0,1,2,3).
> E(X) = 0·1/8 + 1·3/8 + 2·3/8 + 3·1/8 = 12/8 = **1.5**.
> E(X²) = 0 + 3/8 + 12/8 + 9/8 = 24/8 = **3**.
> Var(X) = 3 − (1.5)² = **0.75**; &nbsp; σ = √0.75 = √3/2 ≈ **0.866**.

> [!WARNING]
> Always use the **shortcut** Var(X) = E(X²) − μ² — it needs only two sums. The "definitional" form Σ(x−μ)²p(x) is more work and more error-prone in exams.

## Linearity rules (handy)

- E(aX + b) = a·E(X) + b
- Var(aX + b) = a²·Var(X)  (constant shift does not change spread)
- E(X + Y) = E(X) + E(Y) (always; independence not needed)
- For **independent** X, Y: Var(X + Y) = Var(X) + Var(Y)

# Quick Revision

<div class="formula big">
P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
</div>

<div class="formula big">
P(A | B) = P(A ∩ B) / P(B)&nbsp;&nbsp;;&nbsp;&nbsp; independent ⇔ P(A ∩ B) = P(A)·P(B)
</div>

<div class="formula big">
P(Ak | B) = P(Ak)·P(B | Ak) / Σ P(Aj)·P(B | Aj)
</div>

<div class="formula big">
E(X) = Σ x p(x) &nbsp;;&nbsp; Var(X) = E(X²) − μ² &nbsp;;&nbsp; σ = √Var(X)
</div>

# Practice Questions

1. Two dice are rolled. Find P(sum = 7) and P(sum ≥ 10).
2. P(A) = 0.6, P(B) = 0.5, P(A ∪ B) = 0.8. Find P(A ∩ B) and P(A | B).
3. A bag has 4 red and 6 blue balls. Two are drawn without replacement. Find P(second is red | first is red).
4. Prove that if P(A) > 0 and P(B) > 0, mutually exclusive events cannot be independent.
5. A diagnostic test is 98% accurate for sick people and 95% specific for healthy people; 2% of a population is sick. Given a positive test, find P(sick).
6. A discrete RV has PMF p(x) = k·x for x = 1,2,3,4. Find k, then E(X), Var(X), SD.
7. For a fair die, X = face value. Compute E(X), E(X²), Var(X).
8. Let F(x) be a CDF. Show that P(a < X ≤ b) = F(b) − F(a) and explain monotonicity.
9. X and Y are independent with Var(X) = 4, Var(Y) = 9. Find Var(2X − 3Y + 5).
10. The probability that a student passes maths is 0.7 and physics 0.6, both 0.5. Find P(passes at least one) and P(passes maths given physics).