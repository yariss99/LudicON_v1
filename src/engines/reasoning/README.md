# AI-001 — PRIMA Reasoning Pipeline

**Status:** Canonical Specification (implemented)  
**Owner:** PRIMA Socratic Engine  
**Priority:** Critical

Every teacher message must pass through the same reasoning pipeline.  
The LLM is **not** allowed to answer immediately.  
Every response must first pass through PRIMA's pedagogical reasoning.

## Pipeline

```
Teacher Message
  → Intent Detection
  → Context Resolution
  → Memory Retrieval
  → Knowledge Graph Validation
  → Canvas Synchronization
  → Pedagogical Inference (AI-003)
  → Pedagogical State Update
  → Decision Engine
  → Pedagogical Validation (AI-002.5)
  → Conversation Planning
  → LLM Response Generation
  → Teacher
```

## Law

1. No stage may be skipped.
2. Decision Engine output is sealed before LLM verbalization.
3. The LLM may only verbalize the sealed Conversation Plan.
4. The LLM may not change the pedagogical question, objective, or canvas facts.
5. Learning Canvas always reflects the latest synchronized state.

## Entry points

| Surface | Entry |
|---------|--------|
| Apps / Create Experience | `processTeacherTurn` → `runReasoningPipeline` |
| Direct | `runReasoningPipeline` from `src/engines/reasoning` |

## Folder

```
src/engines/reasoning/
  reasoningPipeline.ts
  types.ts
  index.ts
  stages/
    intentDetection.ts
    contextResolution.ts
    memoryRetrieval.ts
    knowledgeValidation.ts
    pedagogicalState.ts
    llmVerbalizer.ts
  tests/
  README.md
```

## Related

- IT-003 Decision Engine (`src/engines/decision`) — owns Step 7 internals
- CE-004 Pedagogical Conversation Engine — UI voice for Steps 8–9
- PAS-005 — constitutional AI Architecture
- Spec: `docs/engineering/AI-001_PRIMA_REASONING_PIPELINE.md`
