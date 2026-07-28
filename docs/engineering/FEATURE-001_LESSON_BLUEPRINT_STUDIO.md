# FEATURE-001 — Lesson Blueprint Studio

Status: Implemented (Product Spec v1.0)

Priority: Highest

## Vision

Lesson Blueprint Studio is the heart of PRIMA. Conversation helps teachers think; the Blueprint helps them build. Every teaching resource originates here.

## Route

`/blueprint/review/:blueprintId` · Module: `src/features/lesson-blueprint/`

**UI name:** Designul lecției  
**Visual constitution:** [Design Book Ch.12](../design/DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md) · [LESSON-001 Blueprint](../design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) · [PAIM](../design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)

## Spec coverage

| Area | Status |
|------|--------|
| Auto-open after conversation | ✓ |
| Header (title / auto-save / last modified) | ✓ |
| Informații generale (+ durată, tip) | ✓ |
| Competențe (cards, reorder) | ✓ |
| Obiective (numbered, DnD, duplicate) | ✓ |
| Desfășurarea lecției (timeline + rich fields) | ✓ |
| Evaluare (structured card) | ✓ |
| Materiale de creat (expanded checklist) | ✓ |
| Sticky summary sidebar | ✓ |
| Primary blue **Creează materialele** | ✓ |
| Auto-save + sync status | ✓ |
| Version history + restore | ✓ |
| Undo / Redo (Ctrl/Cmd+Z) | ✓ |
| Progress overlay → generation | ✓ |
| Responsive (tablet stack, mobile read-only) | ✓ |
| Collaboration / comments | Reserved (future) |

## Canonical data

Edits persist on `BlueprintReviewDocument` (`blueprint` + `studioExtensions` + `plannedMaterials`). Generation unlocks only through this workflow (`approveForTeachingMaterials`).

Materials created from this project become **Pedagogical Objects** ([FEATURE-002](./FEATURE-002_PEDAGOGICAL_OBJECT_MODEL.md)) with `lessonReference` → this lesson project. Planned material ids are intents to create POM object types — not file formats.

Pedagogical quality analysis for this project is owned by **[FEATURE-003 PIE](./FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md)** (`pieInputFromBlueprint` → `analyzeLessonDesign`).

## Language

Teacher Romanian only — see UX-001 / UX-002.
