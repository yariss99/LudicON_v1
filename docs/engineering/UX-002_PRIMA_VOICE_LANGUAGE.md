# UX-002 — Apply PRIMA Voice & Language Guide

Status: Implemented (UI copy)

Priority: Critical

## Objective

Every visible screen, dialog, notification and interaction uses educational Romanian — the language of a trusted teaching colleague — not AI / engineering vocabulary.

## Non-goals

- No new product functionality
- No business-logic changes
- No architecture changes
- Internal code identifiers (`Blueprint`, engines, pipelines) may remain

## Canon reference

- Teacher glossary: `src/i18n/ro/teacherLanguage.ts`
- Prior pass: `UX-001_TEACHER_LANGUAGE_FIRST.md`
- Product voice: `docs/product/PRIMA_DESIGN_SYSTEM.md` (Copy & Voice)

## Forbidden → preferred (visible UI)

| Avoid | Prefer |
|-------|--------|
| Generate | Creează materialele |
| Generation Workspace | Pregătirea materialelor |
| Asset Studio | Materialele lecției |
| Blueprint / Canvas | Proiectul lecției / Planul lecției |
| Learning Experience | Lecția mea / Lecție |
| Validation / Pipeline / Engine / AI / LLM | (never expose) — educational phrasing |
| Missing information | Mai avem nevoie de câteva informații pentru a continua. |
| Validation failed | Hai să verificăm împreună un aspect al lecției. |

## Conversation shape

1. Confirm understanding  
2. Explain why  
3. Guide the next step (one question)

## Verification

- A teacher understands each page in under ~10 seconds
- No technical implementation details in the UI
- Buttons describe teacher actions
- Loading / empty / error states use educational reassurance
