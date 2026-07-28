# LUDI ON – AI Architecture

**Version:** 1.0

**Status:** Historical Draft — Superseded for authority by PAS-005

**Owner:** LUDI ON Core Team

**Last Update:** July 2026

> **NORMATIVE AUTHORITY:** Use [`docs/engineering/PAS-005_PRIMA_AI_ARCHITECTURE.md`](../engineering/PAS-005_PRIMA_AI_ARCHITECTURE.md) (**PAS-005**) as the canonical AI Architecture. This file is retained as historical draft and SHALL align or yield on conflict with PAS-005 + POSS/CEA.

---

# Purpose

This document defined an early draft architecture of the LUDI ON artificial intelligence system.

The goal is to separate pedagogical decisions, AI reasoning, content generation and resource generation into independent modules.

This architecture must remain scalable, modular and maintainable.

**Current law:** AI are **workers** under the Educational Operating System; Engines and Orchestrator are defined by POSS/CEA; PAS-005 is the constitutional AI Architecture.

---

# Architecture Overview

LUDI ON's AI system is organized as a pipeline of specialized engines coordinated by a single entry point. Each module owns a distinct responsibility and communicates through structured data contracts rather than shared internal state.

The **AI Orchestrator** receives teacher input from the Activity Builder and initiates a generation workflow. It passes the normalized request to the **PRIMA Engine**, which interprets intent and produces an instructional blueprint: learning objectives, activity structure, and constraints derived from the teacher's description.

The blueprint flows to the **Pedagogy Engine**, which applies educational principles—age appropriateness, instructional strategy, differentiation, and assessment alignment—to refine the design before any content is written.

The **Content Engine** generates the core learning experience: activity text, game mechanics, questions, scenarios, and interactive elements defined by the refined blueprint.

The **Resource Engine** transforms the approved activity into deliverable classroom materials such as worksheets, presentations, flashcards, and PDFs.

Before output reaches the teacher, the **Validation Engine** evaluates the full result against pedagogical rules, completeness checks, and platform constraints. Failed validations trigger targeted revisions within the responsible module rather than restarting the entire pipeline.

The **Future Learning Memory** records anonymized patterns from completed workflows—preferences, recurring configurations, and successful design choices—to improve recommendations in later sessions. It does not alter the current generation path; it operates asynchronously after delivery.

This separation ensures that pedagogical reasoning never depends on content formatting, resource export never influences instructional design, and the teacher always receives editable output at each stage.

---

# AI Modules

## 1. AI Orchestrator

The central coordination layer for all AI operations in LUDI ON.

**Responsibilities**

- Accept requests from the Activity Builder and external API entry points.
- Normalize teacher input into a structured generation request.
- Sequence engine calls in the correct order and manage workflow state.
- Route validation failures back to the responsible module for revision.
- Aggregate final output and return it to the application layer.

**Inputs:** Teacher configuration, activity type, subject, grade level, free-text description.

**Outputs:** A complete, validated activity package ready for teacher review and editing.

The Orchestrator contains no pedagogical or generative logic. It delegates all domain work to specialized engines.

---

## 2. PRIMA Engine

**P**edagogical **R**easoning and **I**nstructional **M**odel **A**rchitecture.

The reasoning layer that translates teacher intent into a structured instructional plan.

**Responsibilities**

- Interpret natural-language descriptions and wizard selections.
- Identify learning objectives implied or stated by the teacher.
- Define activity structure: phases, interactions, duration, and participant roles.
- Establish constraints passed to downstream engines (topic scope, difficulty, format).

**Inputs:** Normalized generation request from the Orchestrator.

**Outputs:** Instructional blueprint—a machine-readable plan that describes what the activity must achieve, not the final content.

PRIMA performs reasoning and planning only. It does not generate classroom text, visual assets, or exportable files.

---

## 3. Pedagogy Engine

The module that ensures every generated activity follows sound educational principles.

**Responsibilities**

- Apply age-appropriate instructional strategies based on grade level and subject.
- Recommend teaching methods, differentiation options, and assessment approaches.
- Align activity design with established pedagogical frameworks used by LUDI ON.
- Flag design choices that conflict with educational best practices before content generation begins.

**Inputs:** Instructional blueprint from PRIMA, teacher profile context (grade, subject, special needs flags).

**Outputs:** Pedagogically validated blueprint with strategy annotations and refinement directives.

The Pedagogy Engine advises and constrains design. It does not replace the teacher's judgment; all recommendations remain editable.

---

## 4. Content Engine

The generative module responsible for the core learning experience.

**Responsibilities**

- Generate activity text, instructions, and learner-facing content.
- Produce game mechanics, questions, answer sets, and interactive elements.
- Build scenarios, characters, and narrative elements when the activity type requires them.
- Format output as structured, editable content objects consumed by the application UI.

**Inputs:** Pedagogically validated blueprint, content templates for the selected activity type.

**Outputs:** Structured content package (activity body, game configuration, metadata).

The Content Engine generates instructional material only. It does not produce exportable resource files or make final pedagogical approval decisions.

---

## 5. Resource Engine

The module that transforms activities into classroom-ready deliverables.

**Responsibilities**

- Generate worksheets, presentations, flashcards, quizzes, and PDF exports from approved activity content.
- Apply layout and formatting rules consistent with the LUDI ON design system.
- Produce multiple resource formats from a single activity definition.
- Return resources as downloadable or previewable assets linked to the parent activity.

**Inputs:** Structured content package from the Content Engine, resource type selections from the teacher.

**Outputs:** Resource files and preview metadata attached to the activity record.

The Resource Engine operates on finalized content. It does not modify instructional design or pedagogical structure.

---

## 6. Validation Engine

The quality gate that runs before any output is presented to the teacher.

**Responsibilities**

- Verify completeness: all required fields, phases, and resources are present.
- Check pedagogical compliance against rules defined by the Pedagogy Engine.
- Detect inconsistencies between blueprint intent and generated content.
- Validate age appropriateness, language clarity, and platform format constraints.
- Return structured pass/fail results with specific revision instructions per module.

**Inputs:** Full generation output (blueprint, content package, resources).

**Outputs:** Validation report; on failure, targeted revision requests routed through the Orchestrator.

The Validation Engine evaluates output. It does not generate or modify content directly.

---

## 7. Future Learning Memory

A persistent layer for improving AI assistance over time.

**Responsibilities**

- Record anonymized workflow patterns: frequently used configurations, successful activity structures, and teacher edit patterns.
- Store preference signals derived from teacher acceptance, rejection, and manual edits.
- Supply contextual hints to PRIMA and the Pedagogy Engine during future generation requests.
- Operate asynchronously after activity delivery without blocking the current workflow.

**Inputs:** Completed workflow metadata, teacher edit diffs, activity acceptance signals.

**Outputs:** Preference and pattern queries consumed by PRIMA and the Pedagogy Engine on subsequent requests.

Future Learning Memory supports personalization and recommendation quality. It does not autonomously change generated output or override teacher decisions.

---

# Data Flow

The generation workflow follows a linear pipeline with a validation loop at the end.

```
Teacher Input (Activity Builder)
        │
        ▼
┌───────────────────┐
│  AI Orchestrator  │  ← workflow entry and exit point
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   PRIMA Engine    │  → Instructional Blueprint
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Pedagogy Engine   │  → Validated Blueprint
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Content Engine   │  → Content Package
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Resource Engine   │  → Resource Assets
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Validation Engine │  → Pass / Revision Request
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
  Pass        Fail
    │           │
    ▼           └──► Orchestrator routes revision to target engine
Teacher Review
    │
    ▼
Future Learning Memory (async, post-delivery)
```

**Stage contracts**

| Stage | Producer | Consumer | Artifact |
|-------|----------|----------|----------|
| Intent interpretation | AI Orchestrator | PRIMA Engine | Generation Request |
| Instructional planning | PRIMA Engine | Pedagogy Engine | Instructional Blueprint |
| Pedagogical refinement | Pedagogy Engine | Content Engine | Validated Blueprint |
| Content generation | Content Engine | Resource Engine | Content Package |
| Resource generation | Resource Engine | Validation Engine | Resource Assets |
| Quality assurance | Validation Engine | AI Orchestrator | Validation Report |
| Personalization (async) | Future Learning Memory | PRIMA / Pedagogy Engine | Preference Hints |

Each artifact is a structured, versioned data object. Modules do not read each other's internal state; they consume and produce defined contracts only.
