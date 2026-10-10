---
id: math-formulas
title: Math — Probability & Statistics Formula Sheet
subject: math
unit: 0
date: 2026-02-17
featured: false
tags: formula sheet, probability, bayes, expectation, variance, revision
description: One-page quick-revision card — every formula from Unit I (probability laws, conditional probability, independence, Bayes' theorem, random variables, PMF, CDF, moments, expectation, variance and standard deviation) with one-line usage notes.
---

# Quick Reference Card — Probability

## Counting & basics

| Fact | Formula |
|---|---|
| Complement | P(E′) = 1 − P(E) |
| Classical probability | P(E) = n(E) / n(S) |
| Certain / impossible | P(S) = 1 ; P(∅) = 0 |
| Axioms | 0 ≤ P(E) ≤ 1; P(S) = 1; additivity |

## Additive law (OR)

| Situation | Formula |
|---|---|
| Any two events | P(A ∪ B) = P(A) + P(B) − P(A ∩ B) |
| Mutually exclusive | P(A ∪ B) = P(A) + P(B) |
| Three events | P(A) + P(B) + P(C) − P(A∩B) − P(B∩C) − P(A∩C) + P(A∩B∩C) |

## Conditional probability & independence

<div class="formula">
P(A | B) = <span class="frac"><span class="num">P(A ∩ B)</span><span class="den">P(B)</span></span>
</div>

| Fact | Formula |
|---|---|
| Multiplication rule | P(A ∩ B) = P(B)·P(A|B) = P(A)·P(B|A) |
| Independence | P(A ∩ B) = P(A)·P(B) ⇔ P(A|B) = P(A) ⇔ P(B|A) = P(B) |
| Independent "OR" | P(A ∪ B) = P(A) + P(B) − P(A)·P(B) |

## Bayes' theorem

<div class="formula big">
P(Ak | B) = <span class="frac"><span class="num">P(Ak)·P(B | Ak)</span><span class="den">Σ<sub>j</sub> P(Aj)·P(B | Aj)</span></span>
</div>

> [!TIP]
> Divide the **required branch product** by the **sum of branch products** (the total probability of B). The Aj must partition the sample space.

# Quick Reference Card — Random Variables

| Concept | Formula | Example value |
|---|---|---|
| PMF | p(x) = P(X = x), Σ p(x) = 1 | heads in 3 tosses: 1/8,3/8,3/8,1/8 |
| CDF | F(x) = P(X ≤ x) = Σ<sub>t≤x</sub> p(t) | F(2) = 7/8 |
| Mean / expectation | E(X) = Σ x·p(x) | 1.5 |
| r-th moment | μ′r = E(X<sup>r</sup>) = Σ x<sup>r</sup> p(x) | E(X²) = 3 |
| Variance | Var(X) = E(X²) − [E(X)]² | 0.75 |
| Standard deviation | σ = √Var(X) | 0.866 |

## Linearity rules

| Rule | Formula |
|---|---|
| Linear transform | E(aX + b) = aE(X) + b |
| Variance transform | Var(aX + b) = a²Var(X) |
| Sum of means | E(X + Y) = E(X) + E(Y) (always) |
| Sum of variances (independent) | Var(X + Y) = Var(X) + Var(Y) |
| Difference (independent) | Var(X − Y) = Var(X) + Var(Y) |

## Worked mini-example (single fair die)

X = 1,2,…,6 each with p = 1/6.

<div class="formula">
E(X) = <span class="frac"><span class="num">1+2+3+4+5+6</span><span class="den">6</span></span> = 3.5
</div>

<div class="formula">
E(X²) = <span class="frac"><span class="num">1+4+9+16+25+36</span><span class="den">6</span></span> = <span class="frac"><span class="num">91</span><span class="den">6</span></span>
</div>

<div class="formula">
Var(X) = <span class="frac"><span class="num">91</span><span class="den">6</span></span> − (3.5)² = <span class="frac"><span class="num">35</span><span class="den">12</span></span> ≈ 2.917,&nbsp; σ = √(<span class="frac"><span class="num">35</span><span class="den">12</span></span>) ≈ 1.708
</div>

# Common pitfalls

| Mistake | Correction |
|---|---|
| Quoting P(A∪B) = P(A) + P(B) always | subtract P(A∩B) unless mutually exclusive |
| Treating P(A|B) = P(B|A) | Bayes' theorem reverses them |
| Using Var(X) = E(X²) − E(X) | it is **E(X²) − [E(X)]²** |
| Forgetting Σp(x) = 1 check | verify your PMF — it finds mistakes fast |
| Confusing sample space with event | S is the *whole* set; an event is a subset |
| Independence ≠ disjointness | disjoint (mutually exclusive) events are never independent (unless zero-probability) |

# Last-minute revision list

1. Can you write P(A∪B), P(A∩B), P(A|B), P(B|A) for the same example?
2. Can you derive Bayes' theorem from the multiplication rule in one line?
3. Can you compute E(X), E(X²), Var(X), σ from any PMF table?
4. Do you know when Var(X+Y) = Var(X)+Var(Y) requires independence?
5. Can you state the three Kolmogorov axioms?