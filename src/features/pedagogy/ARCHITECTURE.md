# Mission 06 — Pedagogical Intelligence Engine (legacy surface)

## Status

**Superseded as canonical model by [FEATURE-003 — PIE](../../../docs/engineering/FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md).**

- Canonical analysis API: `src/engines/pie/` (`analyzeLessonDesign`)
- Contracts: `@prima/contracts` → `prima-pedagogical-intelligence`
- This Mission 06 panel remains the Living Workspace review UI until migrated onto `PieAnalysisReport`.

## Intent

Educational intelligence for teachers — **not** generative AI.

The engine reasons over a learning experience and returns a supportive review. FEATURE-003 expands this to ten dimensions, explainable recommendations, and continuous re-analysis on lesson edits.

## Legacy checks (Mission 06)

| Check | What it does |
|-------|----------------|
| Pedagogical | Detects Attention, Discovery, Practice, Reflection, Assessment |
| Time | Estimates duration; gently warns if over available minutes |
| Balance | Lecture / worksheet / individual / digital / active mix |
| Differentiation | Advanced path, support path, group & individual work |
| Assessment | Formative, summative, reflection, feedback moments |

## Tone

- Always positive
- Never critical or grading
- Teacher decides — every finding is optional

## Code

| Layer | Path |
|-------|------|
| **PIE (canonical)** | `src/engines/pie/` |
| Legacy types | `src/types/pedagogy.ts` |
| Legacy engine | `src/engines/pedagogy/` |
| UI | `src/features/pedagogy/` |

Entry today: Living Workspace right column (`/studio/:projectId`).  
Target: Lesson Blueprint Studio + PRIMA panel consume FEATURE-003 reports.
