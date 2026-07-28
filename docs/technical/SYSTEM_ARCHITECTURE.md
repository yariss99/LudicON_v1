---
Status: Draft
Version: 1.0
Owner: LUDI ON Product Team
Depends On: LUDI_ON_PROJECT_BIBLE.md, PRIMA_ENGINE.md, ../product/LUDI_ON_SOLUTION_ARCHITECTURE.md, ../product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md
Related Documents: FOLDER_STRUCTURE.md, ../product/PRIMA_GENERATION_ENGINE.md, ../AI_ARCHITECTURE.md
Last Updated: July 2026
---

# LUDI ON — System Architecture

---

## Purpose

Technical map of LUDI ON — how frontend, PRIMA, and AI engines connect.

**Official layer/module structure:** [`../product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md`](../product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md) (technology-independent). This file may name current stack choices; on conflict, the Reference Technical Architecture prevails.

Logical solution composition: [`../product/LUDI_ON_SOLUTION_ARCHITECTURE.md`](../product/LUDI_ON_SOLUTION_ARCHITECTURE.md). Detailed AI module specs remain in `docs/AI_ARCHITECTURE.md`. This document orients engineers to the full stack.

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│  Dashboard │ PRIMA Experience │ Library │ Settings      │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                   Application Layer (future API)           │
│  Session · Auth · Projects · Library · Export              │
└───────────────────────────┬───────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    AI Orchestrator                         │
└───┬─────────┬─────────┬─────────┬─────────┬──────────────┘
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
 PRIMA    Pedagogy  Content  Resource  Validation
 Engine   Engine    Engine   Engine    Engine
    │
    ├── Conversation · Decision · Memory · Knowledge
    └── Instructional Blueprint
```

---

## Frontend (Current)

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| i18n | `/src/i18n/` (Romanian v1) |

---

## PRIMA Frontend Modules

| Path | Responsibility |
|------|----------------|
| `/src/pages/prima/` | PRIMA page routes |
| `/src/components/PRIMA/` | PRIMA layout and UI blocks |
| `/src/i18n/ro/prima.ts` | PRIMA copy |

---

## AI Engines (Planned Integration)

| Engine | Input | Output |
|--------|-------|--------|
| PRIMA | Conversation + profile | Instructional Blueprint |
| Pedagogy | Blueprint | Validated blueprint |
| Content | Blueprint | Activity content objects |
| Resource | Content + blueprint | PDF, PPTX, etc. |
| Validation | All artifacts | Pass / revision directives |

---

## Data Flow — Lecție (Target)

```
Dashboard click → PRIMA Welcome → Conversation API
→ Session Model → Decision Engine → Blueprint API
→ Teacher approval → Orchestrator → Content + Resource
→ Edit UI → Export → Library storage
```

---

## Key Technical Principles

1. **Structured contracts** between engines (JSON schemas)
2. **No engine owns UI state** of another engine
3. **Blueprint is immutable** during generation unless teacher revises
4. **Romanian locale** default at API boundary

---

## Legacy References

- `docs/AI_ARCHITECTURE.md` — detailed engine responsibilities
- `docs/AI_RULES.md` — development rules for AI-assisted coding
- `docs/LUDI_ON_BLUEPRINT/PLATFORM_STRUCTURE.md` — platform feature tree

---

## Next Recommended Document

→ [`FOLDER_STRUCTURE.md`](./FOLDER_STRUCTURE.md) — Repository layout conventions.
