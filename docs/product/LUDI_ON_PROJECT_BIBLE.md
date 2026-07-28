---
Status: Official
Version: 1.0
Owner: LUDI ON Product Team
Depends On: DOCUMENT-000_PRIMA_MANIFESTO.md
Related Documents: DOCUMENT-000_PRIMA_MANIFESTO.md, PRODUCT_VISION.md, PRODUCT_ROADMAP.md, PRIMA_ENGINE.md, SYSTEM_ARCHITECTURE.md
Last Updated: July 2026
---

# LUDI ON — Project Bible

Philosophical identity: [`DOCUMENT-000 — The PRIMA Manifesto`](./DOCUMENT-000_PRIMA_MANIFESTO.md). On conflict of purpose or ethics, the Manifesto prevails.

The single entry point for understanding what LUDI ON is, who it serves, what it includes, and how its parts fit together.

This document is the **Single Source of Truth** for product intent. Detailed specifications live in linked documents under `/docs/product/`.

---

## What LUDI ON Is

LUDI ON is an **AI-assisted instructional design platform** for teachers.

Teachers describe what they want students to learn. The platform — through **PRIMA** — helps them design a structured **Learning Experience**, produce an **Instructional Blueprint**, and generate classroom-ready materials only after **teacher approval**.

LUDI ON is **not** a lesson generator, a chatbot wrapper, or a template marketplace with AI fill-in-the-blanks.

---

## Terminology

The following terms have one fixed meaning across all LUDI ON documentation.

| Term | Definition |
|------|------------|
| **AI-assisted instructional design** | The product category LUDI ON occupies: AI supports instructional planning; the teacher retains authority over design decisions and final output. |
| **PRIMA** | *Pedagogical Reasoning and Instructional Model Architecture* — the pedagogical intelligence core of LUDI ON. PRIMA discovers intent, reasons about design, and produces Instructional Blueprints. |
| **Dashboard** | The teacher's creative workspace: select an activity type, resume in-progress work, access the library, and view recommendations. Not the PRIMA conversation environment. |
| **PRIMA Experience** | The separate, focused environment where teachers partner with PRIMA through conversation, blueprint review, and generation. Entered intentionally from the Dashboard; no Dashboard navigation chrome. |
| **Instructional Blueprint** | The structured pedagogical plan — objectives, phases, differentiation, assessment, resources — produced by PRIMA and approved by the teacher before **Generation** begins. |
| **Learning Experience** | The designed instructional outcome: what students will do, learn, and demonstrate in the classroom. Described in the Instructional Blueprint; realized in generated materials after approval. |
| **Generation** | The execution phase after blueprint approval: platform AI engines produce editable classroom content and exportable resources from the approved Instructional Blueprint. Generation is not instructional design. |

---

## Mission

LUDI ON serves **Romanian primary, preschool, and special education teachers** who need to prepare structured classroom activities without sacrificing pedagogical quality or spending disproportionate time on planning.

**Problem:** Designing differentiated, coherent learning experiences requires instructional design skill and significant preparation time that many teachers cannot sustain daily.

**Solution:** PRIMA conducts a guided conversation to capture teacher intent, applies pedagogical reasoning to produce an Instructional Blueprint, and coordinates **Generation** of classroom-ready materials — worksheets, presentations, activities — traceable to that blueprint.

**Teacher control:** The teacher confirms or corrects PRIMA's understanding during discovery, reviews and approves the Instructional Blueprint before any **Generation** runs, edits all generated output, and decides what is exported or reused. PRIMA recommends; the teacher decides.

---

## Core Product Promise

> *Describe what you want to teach. PRIMA helps you design how students will learn it.*

---

## The Two Worlds of LUDI ON

| World | Purpose | Character |
|-------|---------|-------------|
| **Dashboard** | Select what to build, resume work, access library and recommendations | Calm creative workspace |
| **PRIMA Experience** | Discover intent, design the Learning Experience, approve blueprint, initiate Generation | Focused pedagogical partnership |

The transition from Dashboard to PRIMA Experience must be deliberate. The teacher leaves the workspace and enters PRIMA's environment.

---

## PRIMA — Pedagogical Intelligence

**PRIMA** is the intelligence core of LUDI ON. It owns discovery, reasoning, blueprint composition, and the handoff to **Generation**. It does not replace teacher judgment or publish content without teacher approval.

PRIMA is decomposed into specialized engines. Each engine has a single responsibility. Full architecture: [`PRIMA_ENGINE.md`](./PRIMA_ENGINE.md).

| Engine | Role |
|--------|------|
| **Conversation** | Captures instructional intent through guided dialogue |
| **Reflection** | Mirrors understanding, presents reasoning, captures post-session signals |
| **Decision** | Applies pedagogical logic; composes the Instructional Blueprint |
| **Knowledge** | Provides curriculum, frameworks, and domain pedagogy |
| **Memory** | Retains session and cross-session teacher context for personalization |
| **Prompt** | Governs PRIMA voice, tone, and teacher-facing language |
| **Generation** | Coordinates execution of an approved Instructional Blueprint through platform AI engines |
| **Validation** | Validates generated resources against approved Blueprint before teacher preview |

A **PRIMA Orchestrator** sequences engines, maintains session integrity, and enforces the blueprint approval gate. It contains no pedagogical logic. Full specification: [`PRIMA_ORCHESTRATOR.md`](./PRIMA_ORCHESTRATOR.md).

---

## Instructional Blueprint

The **Instructional Blueprint** is the mandatory contract between instructional design and **Generation**.

It specifies the complete Learning Experience design — objectives, activity phases, differentiation, assessment approach, and resource requirements — before any worksheet, slide, or game content is produced.

| Rule | Description |
|------|-------------|
| **Approval required** | No **Generation** runs without teacher-approved blueprint |
| **Traceability** | Blueprint sections map to discovery conversation |
| **Editability** | Teacher may revise any section before approval |
| **Versioning** | States are explicit: draft → reviewed → approved |

Schema detail: [`product/INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md`](./product/INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md).

---

## Product Principles

These principles are immutable. Product and engineering decisions must align with them.

### Teacher First

Teachers are instructional designers, not data entry operators. The platform adapts to teacher expertise and classroom context. PRIMA listens before it structures.

### Pedagogy Before Technology

Instructional quality is the primary success criterion. AI capability serves sound learning design — not the reverse. Every output must be defensible in pedagogical terms.

### Conversation Before Forms

Discovery happens through dialogue in the **PRIMA Experience**, not through wizards, numbered steps, or configuration forms. Information PRIMA can infer responsibly must not be requested as explicit input.

### Blueprint Before Generation

Instructional design is complete, visible, and approved in the **Instructional Blueprint** before **Generation** begins. Design and execution are separate phases with a explicit gate between them.

### Inference Before Questions

PRIMA asks only what it cannot know or cannot responsibly assume. When confidence is sufficient — especially for returning teachers — PRIMA confirms rather than re-interviews.

### Teacher Approval Before Generation

The teacher explicitly approves the Instructional Blueprint. **Generation** is blocked until approval. No classroom materials are produced from an unreviewed plan.

### Everything Editable

All generated artifacts remain editable objects. Teachers own the final result. AI drafts; teachers finalize.

### Romanian-First Experience

The primary interface language is Romanian. Curriculum alignment, copy quality, and classroom conventions reflect Romanian primary and preschool education. Other locales require an explicit product decision.

---

## Product Scope

Scope boundaries for **Version 1.0**. Items outside this scope are not committed for the initial release.

### In Scope (Version 1.0)

| Area | Included |
|------|----------|
| **Users** | Romanian primary, preschool, and special education teachers |
| **Dashboard** | Creative workspace, builder selection, continue working, library access, recommendations |
| **PRIMA Experience** | Welcome, conversational discovery, blueprint review and approval, Generation handoff |
| **Activity types** | Lecție (first end-to-end); additional builders per roadmap |
| **Instructional Blueprint** | Structured design artifact with teacher approval gate |
| **Generation** | Editable classroom content and exportable resources from approved blueprint |
| **Library** | Save, reopen, and reuse teacher-created activities |
| **Language** | Romanian primary interface |
| **Documentation** | Product specifications before major feature implementation |

### Out of Scope (Version 1.0)

| Area | Rationale |
|------|-----------|
| **Learning Management System (LMS)** | LUDI ON designs activities; it does not manage courses, enrollments, or gradebooks |
| **School Administration** | No school-wide configuration, timetables, or institutional management |
| **Student Information System (SIS)** | No student records, attendance, or demographic data |
| **Student Portal** | No direct student access to activities (future consideration) |
| **Parent Portal** | No parent-facing progress or communication (future consideration) |
| **Video Conferencing** | No live teaching or virtual classroom functionality |
| **Teacher Payroll** | No HR, compensation, or staffing functions |
| **Messaging Platform** | No teacher–student or teacher–parent messaging |
| **Auto-publish to students** | Teachers review and export; platform does not deliver content to learners autonomously |
| **Generic global EdTech** | Romanian curriculum and classroom context first |

Future scope is tracked in [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md) and [`../research/FUTURE_FEATURES.md`](../research/FUTURE_FEATURES.md). Inclusion there does not imply Version 1.0 commitment.

---

## Target Users (Version 1.0)

| Segment | Description |
|---------|-------------|
| Primary school teachers | Grades 0–IV, Romania |
| Preschool teachers | Kindergarten and early years |
| Special education teachers | Adapted instructional design needs |

Primary interface language: **Romanian**.

---

## Documentation Governance

| Rule | Description |
|------|-------------|
| **Documentation before code** | No major feature ships without an approved product document |
| **Single source of truth** | This document owns product intent. `/docs/product/` owns feature specifications. `/docs/technical/` owns implementation. |
| **Architectural constitution** | [`PRIMA_ARCHITECTURAL_PRINCIPLES.md`](./product/PRIMA_ARCHITECTURAL_PRINCIPLES.md) governs all PRIMA architectural decisions and prevails over engine specs and implementation on architectural conflict. |
| **Conflict resolution** | Product intent: this Bible prevails over subordinate product docs. Architecture: Architectural Principles prevail over engine and implementation docs. See Decision Framework in Architectural Principles. |
| **Interconnected docs** | Every document links forward via *Next Recommended Document* |
| **Session logs** | Significant work sessions are recorded in `/docs/session_logs/` |

### Document Map

```
/docs/product/     → What we build and why (PRIMA, vision, roadmap)
/docs/design/      → How it looks and feels
/docs/technical/   → How it works in code
/docs/research/    → Ideas not yet committed
/docs/session_logs/ → History of decisions and work
```

Legacy documents in `/docs/` and `/docs/LUDI_ON_BLUEPRINT/` remain reference material until fully migrated. On conflict with this Bible, this Bible prevails.

---

## Non-Negotiables

Operational rules that enforce Product Principles in the product experience.

| Rule | Enforces |
|------|----------|
| Never expose "Step 1 of N" in the PRIMA Experience | Conversation Before Forms |
| Never treat teachers as form fillers | Teacher First |
| Never run **Generation** without teacher-approved Instructional Blueprint | Teacher Approval Before Generation |
| Never change Romanian-first UX without explicit product decision | Romanian-First Experience |
| Never ship teacher-facing UI that resembles an administration panel | Teacher First |

---

## Next Recommended Document

→ [`PRODUCT_VISION.md`](./PRODUCT_VISION.md) — Long-term product direction and strategic boundaries.
