---
Status: Official — Canonical Specification
Version: 1.0
Code: AI-001
Owner: PRIMA Socratic Engine
Priority: Critical
Last Updated: July 2026
---

# AI-001 — PRIMA Reasoning Pipeline

## Mission

Every teacher message must pass through the same reasoning pipeline.

The LLM is **not** allowed to answer immediately.

Every response must first pass through PRIMA's pedagogical reasoning.

## Reasoning Pipeline

```
Teacher Message
       ↓
Intent Detection
       ↓
Context Resolution
       ↓
Memory Retrieval
       ↓
Knowledge Graph Validation
       ↓
Canvas Synchronization
       ↓
Pedagogical Inference (AI-003)
       ↓
Pedagogical State Update
       ↓
Decision Engine
       ↓
Pedagogical Validation (AI-002.5)
       ↓
Conversation Planning
       ↓
LLM Response Generation
       ↓
Teacher
```

## Stage contracts

| Step | Stage | Output |
|------|-------|--------|
| 1 | Intent Detection | Intent · Confidence · Detected entities |
| 2 | Context Resolution | Conversation Context |
| 3 | Memory Retrieval | Relevant Memory Package |
| 4 | Knowledge Validation | Knowledge Package |
| 5 | Canvas Synchronization | Updated Learning Canvas |
| 6 | Pedagogical Inference | HIGH-confidence inferred facts (AI-003) |
| 7 | Pedagogical State | Known / Inferred / Required / Optional / Completed / Needs Review |
| 8 | Decision Engine | Best Next Pedagogical Decision |
| 9 | Pedagogical Validation | Approved / Rejected · ValidationIssue[] |
| 10 | Conversation Planner | Understanding · Canvas Update · Explanation · One Question |
| 11 | LLM | Natural language verbalization of the sealed decision only (suppressed if validation rejects) |

## Non-bypass law

1. Stages run in fixed order (`REASONING_PIPELINE_ORDER`).
2. Conversation Plan is sealed before Stage 9.
3. Stage 9 may verbalize only; it must not change decision, question, or canvas facts.
4. Application entry points (`processTeacherTurn`) SHALL invoke `runReasoningPipeline`.

## Implementation

- Runtime: [`apps/web/src/engines/reasoning/`](../../apps/web/src/engines/reasoning/)
- Decision internals (IT-003): [`apps/web/src/engines/decision/`](../../apps/web/src/engines/decision/)
- Constitutional AI Architecture: [`PAS-005_PRIMA_AI_ARCHITECTURE.md`](./PAS-005_PRIMA_AI_ARCHITECTURE.md)

## Success

- Every response follows exactly the same reasoning pipeline.
- Conversation remains pedagogically coherent.
- The Learning Canvas always reflects the latest state.
- The LLM never bypasses PRIMA logic.
