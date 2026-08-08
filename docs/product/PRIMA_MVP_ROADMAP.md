---
Status: Official — MVP & Release Roadmap
Version: 1.0
Owner: LUDI ON Product Team
Depends On: PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md, PRIMA-DOC-002_PRODUCT_MANIFEST.md, LUDI_ON_PROJECT_BIBLE.md, INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md
Related Documents: PRIMA_CONSTITUTIONAL_DECISION_MODEL.md, ../design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md, ../../ROADMAP.md
Last Updated: July 2026
---

# PRIMA MVP Roadmap

**Version:** 1.0  
**Status:** Official — Minimum Viable Product & Incremental Release Plan

> **Prevent feature overload. Ship the smallest product that delivers exceptional value.**

Every feature increases complexity. Only essential capabilities belong in early versions. PRIMA must evolve as a **focused educational operating system** — capabilities grow **without** growing cognitive load.

This is the **shipping authority** for scope and sequencing. The legacy `PRODUCT_ROADMAP.md` it superseded was removed in the August 2026 cleanup. Strategic direction above it sits in [`PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md`](./PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md).

---

## The Fundamental Question

If teachers could only use **five capabilities** — which five would make PRIMA indispensable?

| # | Capability | Why indispensable |
|---|------------|-------------------|
| **1** | **Talk to PRIMA about what I want to teach** | Intention without forms — the only natural entry |
| **2** | **See and approve a pedagogical Blueprint** | Trust — design before content; teacher control |
| **3** | **Get editable classroom materials from that plan** | Immediate prep value — tomorrow's lesson exists |
| **4** | **Continue yesterday's Project** | Continuity — planning is multi-day reality |
| **5** | **Reuse and export what I already made** | Compound time savings — Library + Export |

Everything else is secondary until these five are excellent.

---

## Core Product Vision (MVP)

**MVP vision in one sentence:**

> A Romanian teacher opens PRIMA, describes tomorrow's lesson, approves a clear pedagogical plan, receives editable materials, saves them, and comes back tomorrow without starting over.

**Not MVP:** A platform of builders, communities, analytics, or multi-role school suites.

**Category:** Educational design partner — not LMS, not content marketplace, not chatbot toy.

---

## Core Teacher Journey (MVP)

```
Arrive Home
    → Continuă or express intention (lesson)
        → Partner with PRIMA (conversation)
            → Review & approve Blueprint
                → Receive Lesson materials
                    → Edit → Export → Save to Library
                        → Return → Continuă or Reuse
```

**Out of MVP journey:** Multi-builder selection · Community share · Mentor co-design · School dashboards · Student delivery.

---

## Core Objects (MVP)

| Object | MVP? | Notes |
|--------|------|-------|
| **Project** | Critical | Single working context |
| **Conversation** | Critical | Intent capture |
| **Blueprint** | Critical | Design gate |
| **Lesson (resource)** | Critical | First generated resource type |
| **Library Item** | Critical | Save / reopen / duplicate |
| **Teacher Notes** | Important | Simple free-text in Project |
| **Worksheet** | Important | Version 1.0 — same Project path |
| **Assessment** | Nice → 1.0 soft / 2.0 full | After Lesson quality proven |
| **Game / Story / Presentation** | Future Vision | Same creation path — later resource types |
| **Collection** | Important | Implicit: resources under one Project |
| **Reflection** | Nice to Have | Light post-export prompt — non-blocking |

---

## Version Definitions

### Version 0.1 — Foundation that feels like the product

**Promise:** Teacher can enter PRIMA, feel Home as intention + continuity, and see the mental model (Project / Plan / Resurse) — even if AI is partially stubbed.

| Include | Exclude |
|---------|---------|
| Auth (basic) | Statistics widgets |
| Home: Continuă + intention (Lecție) | Builder grids |
| Project shell | Multiple resource types |
| Design system Studio + Partner modes | Community |
| Romanian UI | Settings complexity |
| Documentation freeze for MVP scope | Dark mode |

**Immediate value:** Orientation trust — *"I understand where I am."*

---

### Version 0.5 — First complete design loop

**Promise:** End-to-end for **one** intention — **Pregătesc o lecție** — conversation → Blueprint approve → generate Lesson → edit → export PDF → Library save → Continuă.

| Include | Exclude |
|---------|---------|
| Full Clarification + Recommendation decisions | Fișă / Joc / Evaluare builders |
| Blueprint review + approval gate | Memory across months |
| Generation (Lesson) | Sharing / marketplace |
| Export PDF (DOCX if cheap) | Analytics |
| Library save + reopen | School leader features |
| Decision Model Wait / Clarification basics | Import external materials |

**Immediate value:** Tomorrow's lesson prepared in one session.

---

### Version 1.0 — Daily workspace teachers keep using

**Promise:** PRIMA is the weekly planning habit — Projects, reuse, second resource type, returning-teacher speed, reliability.

| Include | Exclude (still) |
|---------|-----------------|
| Worksheet as second resource **from same Blueprint** | Game / Story / Presentation as primary |
| Library duplicate / adapt (Reuse decision) | Community marketplace |
| Light Memory (grade, recent subjects, skip known questions) | LMS / SIS / student portal |
| Project states + polish | Nested collaboration |
| PPTX export optional | Surveillance analytics |
| Settings: profile defaults only | Multi-language |

**Immediate value:** Week 2 is faster than week 1 — Continuă + Reuse.

---

### Version 2.0 — Depth without new complexity

**Promise:** More resource types and collaboration **attach to Projects** — Home and mental model unchanged.

| Include | Guardrail |
|---------|-----------|
| Assessment + Presentation resources | Same single creation path — no new builders |
| Educational Game resource | Intention language only |
| Improve existing resource flow | Scoped Blueprint revision |
| Optional share (export link / file) | Opt-in; no social feed required |
| Mentor duplicate-to-edit | No surveillance |
| Learning Project (multi-phase) | Same Project chrome |

**Immediate value:** One Project covers a full teaching package — without a new product to learn.

---

## Prioritization Matrix

Classification: **Critical** · **Important** · **Nice to Have** · **Future Vision**

### Core Product Vision & Journey

| Item | Priority | Decision |
|------|----------|----------|
| Intention → Blueprint → Approve → Generate | Critical | Defines PRIMA; without it, category collapses |
| Continuă previous Project | Critical | Real teacher behavior is multi-session |
| Builder portal Home | Future Vision (rejected) | Increases cognitive load; Redesign forbids |
| Multi-activity onboarding tour | Nice to Have | Prefer first-value Project instead |

### Core Workflows

| Workflow | Priority | Version | Decision |
|----------|----------|---------|----------|
| Create Lesson (full loop) | Critical | 0.5 | Five-capability core |
| Continuă Project | Critical | 0.1 shell / 0.5 real | Continuity |
| Export resource | Critical | 0.5 | Without export, classroom value incomplete |
| Save / reopen Library | Critical | 0.5 | Compound value |
| Reuse / duplicate Blueprint | Important | 1.0 | Highest ROI for retention |
| Generate Worksheet from existing Blueprint | Important | 1.0 | Proves single-creation model |
| Improve existing resource | Important | 2.0 | Iteration after daily habit forms |
| Create Assessment | Nice → Important | 1.0 light / 2.0 | After Lesson+Fișă quality |
| Create Game / Story | Future Vision | 2.0 | Same path — later |
| Import external material | Future Vision | 2.0+ | Complexity; defer |
| Community share feed | Future Vision | Post-2.0 | Distracts from design partner |

### Essential Screens / Workspaces

| Workspace | Priority | Version | Decision |
|-----------|----------|---------|----------|
| Home (intention + Continuă) | Critical | 0.1 | Redesign Home |
| AI / Partner Workspace | Critical | 0.5 | Conversation |
| Blueprint Workspace | Critical | 0.5 | Trust gate |
| Resource Workspace (Lesson) | Critical | 0.5 | Edit materials |
| Project Workspace | Critical | 0.1–0.5 | Central context |
| Library Workspace | Critical | 0.5 | Reuse |
| Settings (minimal) | Important | 1.0 | Defaults only |
| Statistics Dashboard | Future Vision (rejected) | — | No educational value at 20:00 |
| Community Hub | Future Vision | Post-2.0 | — |

### Essential AI Features

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Clarification questions (one at a time) | Critical | 0.5 | Decision Model DM-T01 |
| Blueprint composition | Critical | 0.5 | Core intelligence |
| Explain (*De ce?*) | Critical | 0.5 | Trust / CP-09 |
| Validation findings (coherence) | Critical | 0.5 | Quality before generate |
| Wait during edit | Critical | 0.5 | EP-08 |
| Generation from approved Blueprint only | Critical | 0.5 | Non-negotiable |
| Memory / compressed discovery | Important | 1.0 | Retention accelerator |
| Next-best-action hint (one) | Important | 1.0 | Decision Model surface |
| Reflection packaging | Nice to Have | 1.0–2.0 | Non-gating |
| Autonomous multi-agent spectacle | Future Vision (rejected) | — | Complexity without teacher value |

### Essential Library

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Save Project/resources | Critical | 0.5 | — |
| Reopen | Critical | 0.5 | — |
| Duplicate as template | Important | 1.0 | Reuse capability #5 |
| Search / filter simple | Important | 1.0 | — |
| Ratings / marketplace | Future Vision | Post-2.0 | — |
| School shared library | Future Vision | 2.0+ | Opt-in later |

### Essential Projects

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Create Project from intention | Critical | 0.1–0.5 | — |
| Project contains Blueprint + resources | Critical | 0.5 | — |
| Project states (teacher language) | Important | 0.5 | Clarity |
| Rename / archive | Important | 1.0 | Hygiene |
| Multi-teacher live collab | Future Vision | Post-2.0 | — |

### Essential Blueprint Functions

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Draft composition | Critical | 0.5 | — |
| Section review + edit | Critical | 0.5 | Teacher ownership |
| Approval gate | Critical | 0.5 | Bible non-negotiable |
| Version on re-approve | Important | 1.0 | Lineage |
| Full ED-01–ED-09 richness | Important | 0.5 core / 1.0 polish | MVP: intent, flow, activities, assessment design, resources |
| Curriculum pack deep alignment | Nice to Have | 1.0–2.0 | Start with teacher-confirmed subject/grade |

### Export Capabilities

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| PDF export | Critical | 0.5 | Classroom default |
| DOCX export | Important | 0.5–1.0 | Edit outside |
| PPTX export | Nice to Have | 1.0 | Presentation later |
| Bulk Project export | Nice to Have | 2.0 | — |
| LMS push | Future Vision | — | Out of Bible scope |

### Collaboration

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Solo teacher design | Critical | 0.5 | MVP is individual |
| Share file/link | Nice to Have | 2.0 | Controlled distribution |
| Mentor co-view | Future Vision | 2.0 | — |
| School admin monitoring | Future Vision (rejected for MVP+) | — | Trust destroyer |

### Settings

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Display name, language RO | Critical | 0.1 | — |
| Default grade / subject | Important | 1.0 | Speeds discovery |
| Memory reset | Important | 1.0 | Control |
| Theme / dark mode | Nice to Have | 2.0 | Design System future |
| Pedagogical "settings" forms | Future Vision (rejected) | — | Belongs in conversation |

### Authentication

| Feature | Priority | Version | Decision |
|---------|----------|---------|----------|
| Email/password or magic link | Critical | 0.1 | Persist Projects |
| Session restore | Critical | 0.5 | Continuă |
| OAuth (Google) | Important | 1.0 | Teacher convenience |
| SSO school | Future Vision | 2.0+ | Institutional |
| Guest mode without save | Nice to Have | 0.5 optional | Risk of lost work — prefer light auth |

---

## What Explicitly Does Not Belong in MVP

From Project Bible + Redesign — **do not schedule** before Version 2.0 unless this document is formally amended:

- LMS, SIS, student/parent portals  
- School administration, timetables, payroll  
- Messaging platforms, video conferencing  
- Auto-publish to students  
- Builder mega-menu / activity-type portal as Home identity  
- Home statistics / vanity metrics  
- Community marketplace as core loop  
- Multi-language product (non-RO)  
- Dark mode as launch blocker  

---

## MVP Success Metrics

Measurable goals — teacher outcomes, not vanity.

| Metric | Definition | Target by Version |
|--------|------------|-------------------|
| **Teacher satisfaction** | Post-session: *"Util pentru mâine?"* (1–5) | ≥4.2 by 1.0 |
| **Time saved** | Self-report vs without PRIMA; session length | Full Lesson loop ≤15 min (0.5); ≤8 min returning (1.0) |
| **Blueprint reuse** | % sessions from Library duplicate | ≥25% of returning teachers by 1.0 |
| **Daily / weekly active use** | WAU among activated teachers | ≥40% weekly return by 1.0 |
| **Lesson quality confidence** | *"Aș preda asta mâine"* after export | ≥80% agree by 0.5 |
| **AI adoption** | Sessions reaching Blueprint approval | ≥60% of started Lesson intentions by 0.5 |
| **Ten-minute activation** | First session → approved Blueprint or export | ≥50% first-time by 1.0 |
| **Approval without fear** | Generation only after explicit approve (bug = 0) | 100% — invariant |

**North star (aligned):** Pedagogically sound Lesson in under **5 minutes** when context is known (returning teacher) — with understanding of *what* and *why*.

---

## Development Roadmap

Every increment must ship **immediate teacher value**. No "plumbing-only" releases without a visible step forward.

### Sprint 1 — Home without tools

| Deliver | Value |
|---------|-------|
| Auth basic | Persist identity |
| Home: Continuă + *"Pregătesc o lecție"* | Intention over builders |
| Project shell + empty states | Mental model |
| Romanian chrome per Design System | Trust |

**Exit:** Teacher creates a named Project from intention.

---

### Sprint 2 — Partner conversation

| Deliver | Value |
|---------|-------|
| Partner Workspace | Focused dialogue |
| Clarification loop (Decision Model) | Understanding before action |
| Teacher Intent capture | Foundation for Blueprint |
| Wait / no steppers | Experience integrity |

**Exit:** Teacher completes discovery feeling heard — Intent complete.

---

### Sprint 3 — Blueprint trust

| Deliver | Value |
|---------|-------|
| Blueprint composition (core sections) | Visible design |
| Blueprint Workspace review + edit | Teacher ownership |
| Validation findings (basic) | Quality |
| Approval gate | Non-negotiable |

**Exit:** Teacher can approve a Blueprint; generation still blocked without approval.

---

### Sprint 4 — Materials in hand

| Deliver | Value |
|---------|-------|
| Lesson generation from approved Blueprint | Classroom value |
| Resource Workspace edit | Ownership |
| PDF export | Tomorrow-ready |
| Library save + Continuă wiring | Continuity |

**Exit:** **Version 0.5 candidate** — full Lesson loop.

---

### Version 0.1 Release

Sprints 1 (+ partial Sprint 2 UI). Ship Home + Project shell + Design System. Stub Partner if needed with honest "în curând" only if Continuă path is real.

**Gate:** No builder grid. No stats. Romanian. Build green.

---

### Version 0.5 Release

Sprints 1–4 complete. One intention. One resource type (Lesson). Full loop.

**Gate:** Approval before generation · Export works · Library reopen · Satisfaction smoke test with ≥5 teachers.

---

### Version 1.0 Release

| Add after 0.5 | Why |
|---------------|-----|
| Worksheet from same Blueprint | Proves single creation path |
| Library duplicate / adapt | Capability #5 excellence |
| Light Memory | Returning-teacher speed |
| Polish, reliability, OAuth | Habit formation |
| Minimal Settings defaults | Less re-asking |

**Gate:** WAU / reuse / satisfaction targets met in closed beta.

---

### Version 2.0 Release

| Add | Why |
|-----|-----|
| Assessment + Presentation (+ Game if capacity) | Package completeness |
| Improve-resource flow | Iteration |
| Soft share | Collaboration without platform theater |
| Learning Project optional | Depth — same chrome |

**Gate:** Home still answers *"Ce pregătești azi?"* — no new top-level mental model.

---

## Complexity Budget

| Rule | Meaning |
|------|---------|
| **One creation path** | Never reintroduce Builders as Home |
| **One Project context** | New resource types attach inside Project |
| **Capability vs chrome** | New power must not add navigation anchors |
| **Kill list active** | Each release removes or hides one piece of noise |
| **Bible out-of-scope** | Remains out until explicit amendment |

---

## Relationship to Other Documents

| Document | Role |
|----------|------|
| [`PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md`](./PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md) | Strategic direction this roadmap serves |
| [`PRIMA-DOC-002_PRODUCT_MANIFEST.md`](./PRIMA-DOC-002_PRODUCT_MANIFEST.md) | What makes a feature worthy of shipping |
| [`LUDI_ON_PROJECT_BIBLE.md`](./LUDI_ON_PROJECT_BIBLE.md) | Scope boundaries — MVP must not violate |
| [`PRIMA_CONSTITUTIONAL_DECISION_MODEL.md`](./PRIMA_CONSTITUTIONAL_DECISION_MODEL.md) | Which AI actions ship when |
| [`../design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md`](../design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) | Screen inventory each release draws from |
| [`../design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md`](../design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) | Visual bar for each release |
| [`../../ROADMAP.md`](../../ROADMAP.md) | Engineering foundation status |

---

## Summary

| Version | Teacher gets |
|---------|--------------|
| **0.1** | Home + Project — understands the workspace |
| **0.5** | Full Lesson loop — indispensable core five |
| **1.0** | Daily habit — Continuă, Reuse, Fișă, Memory |
| **2.0** | Deeper package — same simplicity |

**Five capabilities. One path. No bloat.**

PRIMA grows as an elegant educational operating system — not as a complex educational platform.

---

## Compliance Rules

| ID | Rule |
|----|------|
| **MVP-CR-01** | No feature ships in 0.x/1.0 without Critical or Important classification here |
| **MVP-CR-02** | Version 0.5 = Lesson loop only — additional resource types do not block 0.5 |
| **MVP-CR-03** | Generation without Blueprint approval is a release blocker (severity) |
| **MVP-CR-04** | Home must not ship builder grids or statistics in any version covered here |
| **MVP-CR-05** | Version 2.0 additions must attach to Project — no new top-level product metaphors |
| **MVP-CR-06** | Bible out-of-scope items require Bible amendment before scheduling |

---

## Next Recommended Work

1. Execute Sprint 1 against current Dashboard — strip stats/builders; ship intention Home  
2. Align engineering backlog tickets 1:1 with Sprints 1–4  
3. Recruit 5 pilot teachers for Version 0.5 exit criteria
