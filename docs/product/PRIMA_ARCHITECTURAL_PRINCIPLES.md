---
Status: Enterprise Architecture Governance Specification
Version: 1.0
Owner: LUDI ON Product Team
Depends On: LUDI_ON_PROJECT_BIBLE.md
Related Documents: PRIMA_ENGINE.md, INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md, PRIMA_ORCHESTRATOR.md, All PRIMA engine specifications
Last Updated: July 2026
---

# PRIMA Architectural Principles

**The constitutional document of the PRIMA architecture.**

---

## Purpose

This document defines the **immutable architectural beliefs** that govern every structural decision inside PRIMA and LUDI ON's pedagogical intelligence layer.

It answers one question:

> *What principles govern the architecture of PRIMA?*

It does **not** answer how PRIMA works, how it is implemented, or how AI generates content. Those belong to engine specifications and technical documentation.

### Why Architectural Principles Exist

Software platforms decay when every new feature renegotiates fundamentals. PRIMA is decomposed into many engines, workflows, and future capabilities. Without constitutional principles:

- Engines absorb each other's responsibilities
- Quality gates are bypassed under delivery pressure
- Teacher authority erodes through hidden automation
- Implementation details become accidental architecture

**Principles exist so architecture remains stable while implementation evolves.**

### Why Principles Outlive Technology

Models, APIs, databases, and UI frameworks change. The separation between design and execution, teacher authority, and blueprint fidelity must not. Principles bind **structure and governance** — not vendors, languages, or model families.

A principle written today must remain valid in fifteen years, even when the implementation beneath it is unrecognizable.

### Authority

This document is the **highest authority for architectural decisions** within PRIMA. It sits alongside the Project Bible as governance foundation:

| Document | Governs |
|----------|---------|
| **PRIMA Architectural Principles** (this document) | Architectural structure, engine boundaries, governance |
| **LUDI ON Project Bible** | Product intent, scope, terminology, mission |

Individual engine specifications **must comply** with these principles. Where conflict appears, resolution follows the Decision Framework below.

---

## Architecture Philosophy

PRIMA is architected as a **teacher-centered, blueprint-driven, human-governed** pedagogical intelligence system.

| Belief | Meaning |
|--------|---------|
| **Teacher-centered** | Architecture serves teacher authority — not algorithmic convenience |
| **Blueprint-driven** | The Instructional Blueprint is the contract between reasoning and execution |
| **Evidence-based** | Design decisions draw on knowledge and captured intent — not invention |
| **Explainable** | Every significant output traces to evidence teachers can understand |
| **Deterministic** | Same approved design produces structurally consistent execution expectations |
| **Modular** | Independent engines with single responsibilities and explicit contracts |
| **Human-governed** | Teachers approve, edit, override, and own outcomes |
| **Technology-independent** | Architecture describes roles and flows — not implementations |

PRIMA is **not** a chatbot, **not** a lesson generator, and **not** an autonomous instructor. It is an **instructional design partnership** encoded in architecture.

---

## Principle Categories

Twelve categories organize approximately **forty-eight permanent principles**. Each principle includes: **Name**, **Statement**, **Rationale**, **Architectural implication**, and **Related engines**.

---

## I. Foundational Principles

**Category purpose:** Define what PRIMA is at the highest level — the beliefs from which all other principles derive.

---

### FP-01 — Instructional Design Platform

| Field | Content |
|-------|---------|
| **Statement** | PRIMA is an instructional design architecture, not a content generation architecture. |
| **Rationale** | LUDI ON's category is AI-assisted instructional design. Collapsing design into generation destroys product identity and teacher trust. |
| **Architectural implication** | All workflows separate discovery and reasoning from execution. Generation is downstream. |
| **Related engines** | All |

---

### FP-02 — Pedagogy Before Technology

| Field | Content |
|-------|---------|
| **Statement** | Instructional quality is the primary architectural success criterion — not speed, volume, or model capability. |
| **Rationale** | Technology serves pedagogy. When they conflict, pedagogy prevails in architectural design. |
| **Architectural implication** | Decision and Validation engines enforce coherence before speed optimizations. |
| **Related engines** | Decision, Validation, Generation |

---

### FP-03 — Single Learning Experience Contract

| Field | Content |
|-------|---------|
| **Statement** | Every Learning Experience has exactly one authoritative Instructional Blueprint per design iteration. |
| **Rationale** | Multiple parallel design sources create inconsistency and untraceable output. |
| **Architectural implication** | Blueprint is canonical; no shadow design state. |
| **Related engines** | Decision, Orchestrator, Blueprint (artifact) |

---

### FP-04 — Romanian Classroom First

| Field | Content |
|-------|---------|
| **Statement** | Architecture defaults to Romanian primary and preschool education context unless an explicit product decision extends locale. |
| **Rationale** | Generic global EdTech architecture produces generic output unsuitable for LUDI ON's mission. |
| **Architectural implication** | Knowledge packs, Prompt voice, and Validation profiles default Romanian. |
| **Related engines** | Knowledge, Prompt, Validation |

---

## II. Architectural Principles

**Category purpose:** Govern system structure — modularity, boundaries, and separation of concerns.

---

### AP-01 — Engine Independence

| Field | Content |
|-------|---------|
| **Statement** | Each engine has exactly one domain of responsibility and must not absorb another engine's role. |
| **Rationale** | Monolithic intelligence becomes unmaintainable and untestable at platform scale. |
| **Architectural implication** | New capabilities extend engines or add engines — never merge responsibilities. |
| **Related engines** | All |

---

### AP-02 — Star Topology Coordination

| Field | Content |
|-------|---------|
| **Statement** | Engines do not activate each other directly. All coordination flows through the PRIMA Orchestrator. |
| **Rationale** | Direct engine-to-engine coupling creates N² dependencies and gate bypass risk. |
| **Architectural implication** | Orchestrator is mandatory coordination layer; no mesh architecture. |
| **Related engines** | Orchestrator, All |

---

### AP-03 — Artifact-Based Communication

| Field | Content |
|-------|---------|
| **Statement** | Engines communicate through structured artifacts — not shared mutable internal state. |
| **Rationale** | Implicit shared state produces race conditions and untraceable behaviour. |
| **Architectural implication** | Session model, Blueprint, validation package, and reports are explicit contracts. |
| **Related engines** | All |

---

### AP-04 — Design–Execution Separation

| Field | Content |
|-------|---------|
| **Statement** | Instructional design and content execution are separate architectural phases with an explicit gate. |
| **Rationale** | Combined phases prevent teacher review and produce unapproved pedagogy in materials. |
| **Architectural implication** | Decision owns design; Generation owns execution; gate enforced by Orchestrator. |
| **Related engines** | Decision, Generation, Orchestrator |

---

### AP-05 — Technology Independence

| Field | Content |
|-------|---------|
| **Statement** | Product architecture documents describe roles and behaviours — never implementations, vendors, or model identities. |
| **Rationale** | Implementation binds to today's technology; architecture must survive replacement. |
| **Architectural implication** | Engine specs are product architecture; technical docs are subordinate. |
| **Related engines** | All |

---

## III. Teacher Principles

**Category purpose:** Encode teacher authority and agency as architectural requirements — not UX preferences.

---

### TP-01 — Teacher Final Authority

| Field | Content |
|-------|---------|
| **Statement** | The teacher is the final authority on design approval, content acceptance, and export. |
| **Rationale** | AI partners; teachers own classroom outcomes and professional judgment. |
| **Architectural implication** | No auto-approval, auto-export, or auto-publish paths. |
| **Related engines** | Orchestrator, Decision, Generation, Validation |

---

### TP-02 — Explicit Approval Gate

| Field | Content |
|-------|---------|
| **Statement** | Generation requires explicit teacher approval of the Instructional Blueprint. |
| **Rationale** | Implicit or assumed approval destroys trust and pedagogical accountability. |
| **Architectural implication** | Orchestrator blocks Generation until `approved` state with teacher event. |
| **Related engines** | Orchestrator, Decision |

---

### TP-03 — Everything Editable

| Field | Content |
|-------|---------|
| **Statement** | All generated outputs are structured editable objects — never irreversible final artifacts at generation time. |
| **Rationale** | Teachers adapt materials to classroom reality; frozen output rejects professionalism. |
| **Architectural implication** | Generation produces drafts; export follows teacher finalization. |
| **Related engines** | Generation, Validation |

---

### TP-04 — Override With Acknowledgment

| Field | Content |
|-------|---------|
| **Statement** | Teachers may override non-critical validation warnings with explicit acknowledgment. |
| **Rationale** | Professional teachers sometimes accept trade-offs; architecture must allow it visibly. |
| **Architectural implication** | Validation severity model distinguishes block vs acknowledge; Orchestrator logs overrides. |
| **Related engines** | Validation, Orchestrator |

---

### TP-05 — No Surveillance Architecture

| Field | Content |
|-------|---------|
| **Statement** | Architecture must not capture student identities, performance data, or classroom surveillance signals. |
| **Rationale** | PRIMA serves teacher design — not student monitoring or SIS functions. |
| **Architectural implication** | Memory holds aggregate class context only; no student PII paths. |
| **Related engines** | Memory, All |

---

## IV. Knowledge Principles

**Category purpose:** Govern universal pedagogical knowledge — distinct from personalization and decision.

---

### KP-01 — Knowledge Is Authoritative

| Field | Content |
|-------|---------|
| **Statement** | Pedagogical and curriculum facts come from governed knowledge objects — not runtime invention. |
| **Rationale** | Parametric model knowledge is neither auditable nor curriculum-aligned. |
| **Architectural implication** | Knowledge Engine returns provenance-bearing objects; gaps reported honestly. |
| **Related engines** | Knowledge, Decision |

---

### KP-02 — Knowledge Never Decides

| Field | Content |
|-------|---------|
| **Statement** | Knowledge Engine supplies candidates and constraints; Decision Engine selects and combines. |
| **Rationale** | Conflating facts with judgment removes teacher-facing explainability. |
| **Architectural implication** | No knowledge-to-generation or knowledge-to-blueprint direct writes. |
| **Related engines** | Knowledge, Decision |

---

### KP-03 — Versioned Knowledge Packs

| Field | Content |
|-------|---------|
| **Statement** | All knowledge retrieval is scoped to an identifiable pack version and school year. |
| **Rationale** | Curriculum changes; reasoning must know which knowledge era applies. |
| **Architectural implication** | Orchestrator provides pack context; Decision queries within version scope. |
| **Related engines** | Knowledge, Orchestrator, Decision |

---

### KP-04 — Retrieved Not Invented

| Field | Content |
|-------|---------|
| **Statement** | Missing knowledge is reported as a gap — never fabricated to complete a design. |
| **Rationale** | Invented curriculum alignment is worse than honest uncertainty. |
| **Architectural implication** | Knowledge returns gap flags; Decision surfaces to teacher via Reflection. |
| **Related engines** | Knowledge, Decision, Reflection |

---

## V. Memory Principles

**Category purpose:** Govern teacher-specific continuity — distinct from universal knowledge.

---

### MP-01 — Memory Assists Never Overrides

| Field | Content |
|-------|---------|
| **Statement** | Memory supplies hints and defaults; explicit current-session teacher statements always win. |
| **Rationale** | Silent override from stale memory destroys trust. |
| **Architectural implication** | Decision reads memory as non-binding input; Conversation confirms medium-confidence memory. |
| **Related engines** | Memory, Decision, Conversation |

---

### MP-02 — Memory Belongs to the Teacher

| Field | Content |
|-------|---------|
| **Statement** | Durable memory is teacher-owned data with inspect, edit, pause, export, and delete rights. |
| **Rationale** | Personalization without ownership is surveillance. |
| **Architectural implication** | Memory Engine enforces governance; Settings expose memory controls. |
| **Related engines** | Memory, Orchestrator |

---

### MP-03 — Memory–Knowledge Separation

| Field | Content |
|-------|---------|
| **Statement** | Universal pedagogical facts live in Knowledge; personal teacher context lives in Memory — never mixed. |
| **Rationale** | Mixed stores create privacy risk and non-repeatable reasoning. |
| **Architectural implication** | No direct link between Memory and Knowledge engines. |
| **Related engines** | Memory, Knowledge |

---

### MP-04 — Selective Retrieval

| Field | Content |
|-------|---------|
| **Statement** | Memory retrieval is scoped to session context — unrelated memories are excluded. |
| **Rationale** | Memory dumps produce wrong defaults and false personalization. |
| **Architectural implication** | Memory Engine builds selective context package per session start. |
| **Related engines** | Memory, Orchestrator |

---

## VI. Blueprint Principles

**Category purpose:** Govern the Instructional Blueprint as the canonical design artifact.

---

### BP-01 — Blueprint Before Generation

| Field | Content |
|-------|---------|
| **Statement** | No generation runs without an approved Instructional Blueprint. |
| **Rationale** | The Project Bible's core architectural gate; execution without design is prohibited. |
| **Architectural implication** | Orchestrator enforces; Generation rejects unapproved blueprints. |
| **Related engines** | Orchestrator, Generation, Decision |

---

### BP-02 — Blueprint Is Technology Independent

| Field | Content |
|-------|---------|
| **Statement** | Blueprint contains pedagogical design only — never generated text, slides, prompts, or implementation artifacts. |
| **Rationale** | Mixing design with execution artifacts breaks regeneration and versioning. |
| **Architectural implication** | Blueprint Specification defines boundaries; Validation checks fidelity. |
| **Related engines** | Decision, Generation, Validation |

---

### BP-03 — Blueprint Is Versioned

| Field | Content |
|-------|---------|
| **Statement** | Every Blueprint change produces identifiable version lineage from draft through archive. |
| **Rationale** | Traceability requires history; generation runs bind to blueprint version. |
| **Architectural implication** | Orchestrator synchronizes version across Decision, Generation, Validation. |
| **Related engines** | Orchestrator, Decision, Generation, Validation |

---

### BP-04 — Blueprint Is Teacher-Owned

| Field | Content |
|-------|---------|
| **Statement** | Teacher approves, revises, and may re-open Blueprint design; platform holds on teacher's behalf. |
| **Rationale** | Design ownership is professional and legal prerequisite for classroom use. |
| **Architectural implication** | Decision composes; teacher approves; Generation never writes Blueprint. |
| **Related engines** | Decision, Orchestrator, Teacher (actor) |

---

### BP-05 — Canonical Blueprint Definition

| Field | Content |
|-------|---------|
| **Statement** | All engines interpret Blueprint structure per INSTRUCTIONAL_BLUEPRINT_SPECIFICATION — no independent redefinition. |
| **Rationale** | Fragmented definitions produce engine disagreement and invalid output. |
| **Architectural implication** | Blueprint Specification is subordinate only to this document and Project Bible for structure. |
| **Related engines** | All |

---

## VII. Decision Principles

**Category purpose:** Govern pedagogical reasoning — the mind of PRIMA.

---

### DP-01 — Decision Never Generates

| Field | Content |
|-------|---------|
| **Statement** | Decision Engine produces Blueprint and directives — never classroom content text. |
| **Rationale** | Reasoning and execution must remain separable. |
| **Architectural implication** | Generation owns all learner-facing text production. |
| **Related engines** | Decision, Generation |

---

### DP-02 — Decision Never Stores Memory

| Field | Content |
|-------|---------|
| **Statement** | Decision reads Memory; Memory Engine alone writes durable teacher preferences. |
| **Rationale** | Session corrections must not silently become long-term profile. |
| **Architectural implication** | Post-session signals route async to Memory — not through Decision writes. |
| **Related engines** | Decision, Memory |

---

### DP-03 — Decision Never Speaks Directly

| Field | Content |
|-------|---------|
| **Statement** | Decision produces structured reasoning; Reflection and Prompt deliver teacher-facing language. |
| **Rationale** | Voice consistency and pedagogical tone belong to Prompt; reasoning belongs to Decision. |
| **Architectural implication** | No Decision-to-UI direct path. |
| **Related engines** | Decision, Reflection, Prompt |

---

### DP-04 — Backward Design Mandatory

| Field | Content |
|-------|---------|
| **Statement** | Decision reasons from objectives through activities to assessment — not from templates toward filler objectives. |
| **Rationale** | Forward-fill produces incoherent instruction. |
| **Architectural implication** | Decision composition order enforced; Layer 5 validates alignment. |
| **Related engines** | Decision, Knowledge |

---

### DP-05 — Teacher Overrides Inference

| Field | Content |
|-------|---------|
| **Statement** | Explicit teacher statements and corrections override inference, memory, and knowledge defaults. |
| **Rationale** | Teacher authority is constitutional. |
| **Architectural implication** | Decision priority hierarchy places teacher intent above preferences. |
| **Related engines** | Decision, Memory, Conversation |

---

### DP-06 — Incremental Revision

| Field | Content |
|-------|---------|
| **Statement** | Blueprint edits trigger scoped re-decision — never full discovery restart unless critical gaps exist. |
| **Rationale** | Respect teacher time; preserve stable design decisions. |
| **Architectural implication** | Decision re-decision scope maps edit type to affected sections. |
| **Related engines** | Decision, Orchestrator |

---

## VIII. Generation Principles

**Category purpose:** Govern execution of approved design into materials.

---

### GP-01 — Generation Executes Never Decides

| Field | Content |
|-------|---------|
| **Statement** | Generation faithfully implements approved Blueprint — never alters pedagogical intent. |
| **Rationale** | Execution bias toward "fixing" design corrupts approved plans. |
| **Architectural implication** | Pedagogy change routes to Decision revision — not Generation override. |
| **Related engines** | Generation, Decision |

---

### GP-02 — Blueprint Fidelity

| Field | Content |
|-------|---------|
| **Statement** | Every generated block traces to a Blueprint section; untraceable content is invalid. |
| **Rationale** | Traceability enables validation, regen, and explainability. |
| **Architectural implication** | Generation metadata includes block-to-section map. |
| **Related engines** | Generation, Validation |

---

### GP-03 — Draft Not Final

| Field | Content |
|-------|---------|
| **Statement** | Generation output is always draft until teacher finalizes in editing and export. |
| **Rationale** | AI drafts; teachers finalize — constitutional teacher principle at execution layer. |
| **Architectural implication** | No auto-export path from Generation completion. |
| **Related engines** | Generation, Orchestrator |

---

### GP-04 — Scoped Regeneration

| Field | Content |
|-------|---------|
| **Statement** | Failed or unsatisfactory output regenerates at minimum scope — block or resource — not full pipeline by default. |
| **Rationale** | Preserves teacher edits and reduces waste. |
| **Architectural implication** | Orchestrator authorizes scoped regen; Generation supports partial modes. |
| **Related engines** | Generation, Orchestrator, Validation |

---

### GP-05 — Indirect Knowledge and Memory

| Field | Content |
|-------|---------|
| **Statement** | Generation consumes Blueprint and directives only — no live Knowledge or Memory queries. |
| **Rationale** | Execution must reflect approved design, not re-derive it from new lookups. |
| **Architectural implication** | vocabulary_ceiling and preferences encoded in Blueprint at approval. |
| **Related engines** | Generation, Knowledge, Memory, Decision |

---

## IX. Validation Principles

**Category purpose:** Govern independent quality assurance after generation.

---

### VP-01 — Validation Is Independent

| Field | Content |
|-------|---------|
| **Statement** | Validation Engine is separate from Generation and Decision — it measures, never fixes. |
| **Rationale** | Self-validation by executors is structurally biased. |
| **Architectural implication** | Validation reports findings; Orchestrator routes recovery. |
| **Related engines** | Validation, Generation, Orchestrator |

---

### VP-02 — Validate Before Preview

| Field | Content |
|-------|---------|
| **Statement** | Teachers receive generation preview only after Validation completes — or with explicit critical-issue disclosure. |
| **Rationale** | Unvetted drafts erode trust and safety. |
| **Architectural implication** | Orchestrator gates preview on validation outcome. |
| **Related engines** | Validation, Orchestrator, Prompt |

---

### VP-03 — Validation Never Redesigns

| Field | Content |
|-------|---------|
| **Statement** | Validation never modifies Blueprint, objectives, or generated content. |
| **Rationale** | Quality assurance is not design authority. |
| **Architectural implication** | Failures produce reports and recommendations only. |
| **Related engines** | Validation, Decision, Generation |

---

### VP-04 — Blueprint as Validation Reference

| Field | Content |
|-------|---------|
| **Statement** | Post-generation validation measures fidelity to approved Blueprint — not independent aesthetic criteria. |
| **Rationale** | Teachers approved a design; validation confirms implementation match. |
| **Architectural implication** | Validation Rules derive from Blueprint Validation Rules section. |
| **Related engines** | Validation, Blueprint (artifact) |

---

### VP-05 — Severity-Governed Gating

| Field | Content |
|-------|---------|
| **Statement** | Critical findings may block preview; warnings inform; teacher override is logged. |
| **Rationale** | Safety and severe misalignment require stronger gates than cosmetic issues. |
| **Architectural implication** | Validation severity model drives Orchestrator transitions. |
| **Related engines** | Validation, Orchestrator |

---

## X. Orchestration Principles

**Category purpose:** Govern workflow coordination — the operating system of PRIMA.

---

### OP-01 — Single Coordinator

| Field | Content |
|-------|---------|
| **Statement** | PRIMA Orchestrator is the sole engine activation authority within a PRIMA session. |
| **Rationale** | Distributed coordination produces gate bypass and unrecoverable states. |
| **Architectural implication** | All workflow logic centralizes in Orchestrator specification. |
| **Related engines** | Orchestrator, All |

---

### OP-02 — State Before Action

| Field | Content |
|-------|---------|
| **Statement** | No engine activates without valid workflow and Blueprint state for that activation. |
| **Rationale** | Invalid sequencing causes undefined behaviour. |
| **Architectural implication** | State invariants (e.g., Generation requires `approved`) are enforced. |
| **Related engines** | Orchestrator |

---

### OP-03 — Events Drive Transitions

| Field | Content |
|-------|---------|
| **Statement** | Workflow advances on explicit events — teacher actions and engine completions — not assumptions. |
| **Rationale** | Assumed completion produces race conditions and lost teacher actions. |
| **Architectural implication** | Event catalog governs state machine in Orchestrator spec. |
| **Related engines** | Orchestrator, All |

---

### OP-04 — Observable Workflows

| Field | Content |
|-------|---------|
| **Statement** | State transitions, engine activations, approvals, and overrides produce audit records. |
| **Rationale** | Explainability and compliance require traceable workflow history. |
| **Architectural implication** | Orchestrator maintains audit trail consumable by Reflection and support. |
| **Related engines** | Orchestrator, Reflection |

---

### OP-05 — Recoverable Execution

| Field | Content |
|-------|---------|
| **Statement** | Failures route to retry, pause, resume, or teacher intervention — never silent stall. |
| **Rationale** | Teachers must not lose work or face dead-end sessions. |
| **Architectural implication** | Orchestrator failure recovery policy is mandatory for all engines. |
| **Related engines** | Orchestrator, All |

---

## XI. Explainability Principles

**Category purpose:** Govern transparency and traceability across all engines.

---

### EP-01 — Explainability Is Mandatory

| Field | Content |
|-------|---------|
| **Statement** | Every major design decision and validation finding must be traceable to evidence. |
| **Rationale** | Unexplainable AI erodes teacher trust and professional acceptance. |
| **Architectural implication** | Decision reasoning summary; Knowledge provenance; Validation rule IDs in reports. |
| **Related engines** | Decision, Knowledge, Reflection, Validation |

---

### EP-02 — Transparency at the Right Moment

| Field | Content |
|-------|---------|
| **Statement** | Reasoning is presented when the teacher is ready to review — not during raw discovery imagination. |
| **Rationale** | Premature structure blocks creative intent expression. |
| **Architectural implication** | Conversation Stages 1–7 precede Stage 8 reasoning presentation. |
| **Related engines** | Conversation, Reflection, Decision, Orchestrator |

---

### EP-03 — Teacher-Friendly Expression

| Field | Content |
|-------|---------|
| **Statement** | Explainability reaches teachers in natural Romanian through Prompt — not internal codes or schemas. |
| **Rationale** | Transparency teachers cannot read is not transparency. |
| **Architectural implication** | Prompt Engine translates all evidence chains; competency codes opt-in only. |
| **Related engines** | Prompt, Reflection, Knowledge |

---

### EP-04 — End-to-End Traceability

| Field | Content |
|-------|---------|
| **Statement** | Discovery → Decision → Blueprint → Generation → Validation forms an unbroken trace chain. |
| **Rationale** | Broken chains prevent "why is this here?" answers. |
| **Architectural implication** | Block maps, version IDs, and provenance records link across phases. |
| **Related engines** | All |

---

## XII. Evolution Principles

**Category purpose:** Govern how PRIMA architecture changes over years without violating constitution.

---

### EV-01 — Principles Before Features

| Field | Content |
|-------|---------|
| **Statement** | New capabilities must demonstrate compliance with architectural principles before specification approval. |
| **Rationale** | Feature-driven architecture erosion is the primary long-term risk. |
| **Architectural implication** | Compliance review required for new engine specs and major workflows. |
| **Related engines** | Governance (all) |

---

### EV-02 — Add Engines Before Absorbing

| Field | Content |
|-------|---------|
| **Statement** | New domains of responsibility prefer new engines over expanding existing ones. |
| **Rationale** | Absorption violates single responsibility and creates hidden coupling. |
| **Architectural implication** | Engine split requires constitutional compliance check. |
| **Related engines** | All |

---

### EV-03 — Backward-Compatible Contracts

| Field | Content |
|-------|---------|
| **Statement** | Artifact contract changes require version bumps and migration path — never silent breaking changes. |
| **Rationale** | Teachers retain Library assets across platform versions. |
| **Architectural implication** | Blueprint and session model versioning governed explicitly. |
| **Related engines** | Orchestrator, Blueprint (artifact) |

---

### EV-04 — Documentation Before Implementation

| Field | Content |
|-------|---------|
| **Statement** | No major PRIMA capability ships without approved product architecture documentation. |
| **Rationale** | Project Bible governance; architecture drift prevention. |
| **Architectural implication** | Implementation is subordinate to specs in decision precedence. |
| **Related engines** | Governance (all) |

---

### EV-05 — Stable Principles Evolving Implementation

| Field | Content |
|-------|---------|
| **Statement** | Principles change rarely and deliberately; implementations change frequently. |
| **Rationale** | Stable constitution enables rapid iteration below it. |
| **Architectural implication** | Principle amendments require governance process — not sprint-level changes. |
| **Related engines** | Governance (all) |

---

## Principle Index

| ID | Name | Category |
|----|------|----------|
| FP-01 | Instructional Design Platform | Foundational |
| FP-02 | Pedagogy Before Technology | Foundational |
| FP-03 | Single Learning Experience Contract | Foundational |
| FP-04 | Romanian Classroom First | Foundational |
| AP-01 | Engine Independence | Architectural |
| AP-02 | Star Topology Coordination | Architectural |
| AP-03 | Artifact-Based Communication | Architectural |
| AP-04 | Design–Execution Separation | Architectural |
| AP-05 | Technology Independence | Architectural |
| TP-01 | Teacher Final Authority | Teacher |
| TP-02 | Explicit Approval Gate | Teacher |
| TP-03 | Everything Editable | Teacher |
| TP-04 | Override With Acknowledgment | Teacher |
| TP-05 | No Surveillance Architecture | Teacher |
| KP-01 | Knowledge Is Authoritative | Knowledge |
| KP-02 | Knowledge Never Decides | Knowledge |
| KP-03 | Versioned Knowledge Packs | Knowledge |
| KP-04 | Retrieved Not Invented | Knowledge |
| MP-01 | Memory Assists Never Overrides | Memory |
| MP-02 | Memory Belongs to the Teacher | Memory |
| MP-03 | Memory–Knowledge Separation | Memory |
| MP-04 | Selective Retrieval | Memory |
| BP-01 | Blueprint Before Generation | Blueprint |
| BP-02 | Blueprint Is Technology Independent | Blueprint |
| BP-03 | Blueprint Is Versioned | Blueprint |
| BP-04 | Blueprint Is Teacher-Owned | Blueprint |
| BP-05 | Canonical Blueprint Definition | Blueprint |
| DP-01 | Decision Never Generates | Decision |
| DP-02 | Decision Never Stores Memory | Decision |
| DP-03 | Decision Never Speaks Directly | Decision |
| DP-04 | Backward Design Mandatory | Decision |
| DP-05 | Teacher Overrides Inference | Decision |
| DP-06 | Incremental Revision | Decision |
| GP-01 | Generation Executes Never Decides | Generation |
| GP-02 | Blueprint Fidelity | Generation |
| GP-03 | Draft Not Final | Generation |
| GP-04 | Scoped Regeneration | Generation |
| GP-05 | Indirect Knowledge and Memory | Generation |
| VP-01 | Validation Is Independent | Validation |
| VP-02 | Validate Before Preview | Validation |
| VP-03 | Validation Never Redesigns | Validation |
| VP-04 | Blueprint as Validation Reference | Validation |
| VP-05 | Severity-Governed Gating | Validation |
| OP-01 | Single Coordinator | Orchestration |
| OP-02 | State Before Action | Orchestration |
| OP-03 | Events Drive Transitions | Orchestration |
| OP-04 | Observable Workflows | Orchestration |
| OP-05 | Recoverable Execution | Orchestration |
| EP-01 | Explainability Is Mandatory | Explainability |
| EP-02 | Transparency at the Right Moment | Explainability |
| EP-03 | Teacher-Friendly Expression | Explainability |
| EP-04 | End-to-End Traceability | Explainability |
| EV-01 | Principles Before Features | Evolution |
| EV-02 | Add Engines Before Absorbing | Evolution |
| EV-03 | Backward-Compatible Contracts | Evolution |
| EV-04 | Documentation Before Implementation | Evolution |
| EV-05 | Stable Principles Evolving Implementation | Evolution |

**Total: 48 principles.**

---

## Decision Framework

When documents, engines, or implementations conflict, resolve in **strict precedence order**:

```
1. PRIMA Architectural Principles (this document)
        ↓
2. LUDI_ON_PROJECT_BIBLE.md
        ↓
3. INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md
        ↓
4. Engine Specifications (PRIMA_*_ENGINE.md, PRIMA_ORCHESTRATOR.md)
        ↓
5. Technical Implementation (SYSTEM_ARCHITECTURE.md, code)
```

### Resolution Rules

| Situation | Action |
|-----------|--------|
| Implementation contradicts principle | Implementation must change |
| Engine spec contradicts principle | Engine spec must be revised |
| Engine specs contradict each other | Orchestrator and Blueprint specs mediate; principles decide |
| Product Bible contradicts principle on **architecture** | Principle prevails; Bible updated if product intent unchanged |
| Product Bible contradicts principle on **product intent** | Escalate to Product Team — principles are not changed silently |
| Blueprint spec contradicts principle | Blueprint spec revised to comply |

### Conflict Escalation

1. Document conflict in session log
2. Identify conflicting principles and documents
3. Apply precedence order
4. If product intent genuinely requires principle amendment — invoke Governance process
5. Never ship implementation that knowingly violates Tier 1–4 without recorded exception

---

## Governance

### Who May Introduce New Principles

| Actor | Authority |
|-------|-----------|
| **Lead Product Architect / Chief Enterprise Architect** | Propose new principles or categories |
| **LUDI ON Product Team** | Review and approve |
| **Individual engineers or feature teams** | May propose via documented RFC — not unilateral adoption |

### Who Approves Changes

- **Addition** of new principle: Product Team unanimous approval; version minor bump
- **Amendment** of existing principle: Product Team + documented rationale; version minor bump
- **Deprecation** of principle: Product Team + migration plan for dependent specs; version major bump
- **Emergency exception** (time-bound): Product Team lead written approval; session log mandatory; exception expires or is ratified within 30 days

### Versioning

| Version change | Meaning |
|----------------|---------|
| **Patch** | Clarifications without semantic change |
| **Minor** | New principles added; non-breaking refinements |
| **Major** | Principle deprecated, materially amended, or precedence changed |

### Deprecation

Deprecated principles remain in document history with strikethrough, deprecation date, and successor principle ID. Dependent specs must update within one release cycle.

### Review Process

| Cadence | Activity |
|---------|----------|
| **Per new engine or major feature** | Compliance checklist against principle index |
| **Quarterly** | Architecture review — conflicts, exceptions, drift |
| **Annual** | Full constitution review — relevance for next school year |
| **On curriculum national change** | Knowledge and Validation principle alignment check |

---

## Compliance

Every future PRIMA document, module, and capability must be evaluated against this constitution.

### Compliance Checklist (New Capability)

| # | Question |
|---|----------|
| 1 | Which principles apply to this capability? |
| 2 | Does it violate any principle? If yes — stop or request exception. |
| 3 | Which engines are activated — does star topology hold? |
| 4 | Does it respect Blueprint gate and teacher approval? |
| 5 | Is explainability preserved end-to-end? |
| 6 | Does it keep design and execution separated? |
| 7 | Is documentation approved before implementation? |

### Document Types and Compliance

| Document type | Compliance requirement |
|---------------|------------------------|
| New engine specification | Map every responsibility to principles; no violations |
| Engine specification revision | Re-check affected principles |
| Workflow or UI flow spec | Orchestration and teacher principles |
| Technical architecture | Must not contradict AP-05, EV-03 |
| API or contract (future) | Subordinate to engine specs; artifact principles apply |

### Non-Compliance

Shipping known non-compliant architecture requires:

- Written exception with expiry
- Remediation plan
- Product Team approval
- Session log entry

Chronic non-compliance triggers architecture review and possible principle clarification — not silent acceptance.

---

## Future Evolution

### What Evolves Freely

- AI models and providers
- UI implementations and design system
- Export formats and rendering
- Performance optimizations
- Knowledge pack content
- Activity type expansions
- Analytics and recommendations

### What Evolves Deliberately

- Engine boundaries (via EV-02)
- Blueprint section model (via Blueprint Specification revision)
- Workflow states (via Orchestrator revision)
- New principles (via Governance)

### What Must Remain Stable

- Teacher final authority (TP-01)
- Blueprint before Generation (BP-01)
- Design–execution separation (AP-04)
- Engine independence (AP-01)
- Explainability mandatory (EP-01)
- Orchestrator single coordination (OP-01)

These are **constitutional** — amendment only through major version governance.

---

## Architectural Constitution

### The PRIMA Manifesto

PRIMA exists to help teachers **design** learning experiences — not to replace them.

We architect PRIMA as a **constellation of independent engines** coordinated by a single orchestrator, bound by an Instructional Blueprint that teachers own and approve.

We separate **reasoning from execution**, **facts from decisions**, **personalization from curriculum**, and **drafts from final materials**.

We measure quality through **independent validation**, explain every significant choice, and never hide personalization or uncertainty.

We build for **Romanian classrooms first**, in **Romanian language first**, with architecture that survives every technology generation.

We document before we implement. We principle before we feature. We coordinate before we couple.

**The teacher decides. PRIMA assists. The Blueprint governs. Generation executes. Validation protects.**

This is the architecture of instructional partnership — designed to remain true for the next fifteen years.

---

## Document Authority

| Tier | Document |
|------|----------|
| **Constitution** | PRIMA_ARCHITECTURAL_PRINCIPLES.md (this document) |
| **Product intent** | LUDI_ON_PROJECT_BIBLE.md |
| **Canonical artifact** | INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md |
| **Engine behaviour** | PRIMA_* engine specifications, PRIMA_ORCHESTRATOR.md |
| **Platform overview** | PRIMA_ENGINE.md, PRIMA_CONVERSATION_BLUEPRINT.md |
| **Implementation** | SYSTEM_ARCHITECTURE.md, code |

On architectural conflict: **this document prevails** over engine and implementation documents. Product intent conflicts escalate per Decision Framework.

---

## Next Recommended Document

→ [`LUDI_ON_PROJECT_BIBLE.md`](./LUDI_ON_PROJECT_BIBLE.md) — Product intent and scope that this constitution implements architecturally.
