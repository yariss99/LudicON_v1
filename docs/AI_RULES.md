# LUDI ON – AI Development Rules

**Version:** 1.0

**Status:** Official

**Owner:** LUDI ON Core Team

**Last Update:** July 2026

---

# Purpose

This document defines how AI assistants must contribute to the LUDI ON project.

The goal is to ensure consistency, maintainability, and high-quality code.

---

# Core Rules

## 1. Understand Before Changing

Always analyze the existing implementation before modifying any file.

Never rewrite components unnecessarily.

---

## 2. Small Changes

Modify only the files required to complete the requested task.

Avoid unrelated refactoring.

---

## 3. Preserve Existing Behaviour

Never break working functionality.

If a behaviour changes, explain why.

---

## 4. Build First

Every completed task must successfully pass the project build.

No implementation is complete without verification.

---

## 5. Reuse Before Creating

Prefer existing components.

Avoid duplicate code.

---

## 6. Respect Documentation

Always follow:

- PRODUCT.md
- ROADMAP.md
- UI_GUIDELINES.md

If documentation and implementation differ, notify the developer.

---

## 7. Explain Decisions

When implementing a feature, briefly explain:

- what changed
- why it changed
- which files were modified

---

## 8. Teacher First

Every implementation must improve the teacher's experience.

Avoid unnecessary complexity.

---

## 9. Keep Components Small

Prefer multiple focused components instead of one large file.

---

## 10. Think Before Coding

Before writing code ask:

Does this improve the product?

Does it respect the Design System?

Does it save teachers time?

If not,

reconsider the implementation.

---

# Forbidden

Never

- rewrite the entire project
- rename files without reason
- modify unrelated components
- remove working functionality
- ignore build errors

---

# Definition of Done

A task is complete only if:

✓ Build passes

✓ No TypeScript errors

✓ UI remains consistent

✓ Existing functionality still works

✓ Code is readable

✓ Changes are explained