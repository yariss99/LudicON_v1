---
Status: Official — Enterprise Intelligence Architecture Specification
Version: 1.0
Owner: LUDI ON Product Team
Depends On: LUDI_ON_PROJECT_BIBLE.md, PRIMA_ARCHITECTURAL_PRINCIPLES.md, PRIMA_DOMAIN_MODEL.md, PRIMA_CANONICAL_ARTIFACTS.md, PRIMA_DECISION_FRAMEWORK.md, PRIMA_FAILURE_MODEL.md, solution/PRIMA_SYSTEM_CONTEXT.md, solution/PRIMA_CAPABILITY_MODEL.md, solution/PRIMA_COMPONENT_MODEL.md, solution/PRIMA_INTERACTION_MODEL.md, solution/PRIMA_WORKFLOW_MODEL.md, solution/PRIMA_STATE_MODEL.md
Related Documents: PRIMA_ENGINE.md, PRIMA_DECISION_ENGINE.md, PRIMA_KNOWLEDGE_ENGINE.md, PRIMA_MEMORY_ENGINE.md, PRIMA_GENERATION_ENGINE.md, PRIMA_VALIDATION_ENGINE.md, LUDI_ON_SOLUTION_ARCHITECTURE.md
Last Updated: July 2026
---

# PRIMA Intelligence Model

**Version:** 1.0  
**Status:** Official — Enterprise Intelligence Architecture Specification

---

## Purpose

This document defines the **official intelligence architecture** of the PRIMA platform within LUDI ON.

It answers one architectural question:

> *How does PRIMA think?*

Not technically — **architecturally**.

The Intelligence Model specifies the **cognitive philosophy**, **layered intelligence structure**, **reasoning and knowledge principles**, **human-AI collaboration model**, and **governance constraints** that govern how PRIMA understands, reasons, recommends, validates, reflects, and evolves — while **always preserving teacher authority**.

This document is **implementation-independent**, **model-independent**, and **technology-neutral**. It remains valid regardless of which reasoning engine, language model, or AI technology implements PRIMA in the future.

Product-level engine specifications ([`PRIMA_ENGINE.md`](./PRIMA_ENGINE.md) and related engine documents) **implement** this model; they do not supersede it.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| Intelligence philosophy and foundational principles | Model selection, prompts, inference parameters |
| Layered intelligence architecture | API design, SDKs, code modules |
| Cognitive functions and reasoning principles | Infrastructure, GPUs, cloud services |
| Context and intent understanding (conceptual) | UI micro-copy and visual design |
| Recommendation, validation, and reflection models | Specific LLM or vendor references |
| Explainability and human-AI collaboration | Algorithm pseudocode |
| Learning evolution and intelligence governance | Training pipelines and fine-tuning detail |

**Audience:** Chief architects, AI product leaders, instructional designers, compliance reviewers, and engineering leads who must ensure all present and future AI capabilities conform to PRIMA's intelligence architecture.

---

## Intelligence Philosophy

PRIMA is **not** an autonomous teacher.  
PRIMA is **not** an autonomous decision-maker.  
PRIMA is an **Intelligent Pedagogical Design Partner**.

| Belief | Architectural consequence |
|--------|---------------------------|
| **Teacher expertise is primary** | Intelligence amplifies capability — never replaces judgment |
| **Pedagogy before production** | Reasoning and blueprint design precede Generation ([`AP-04`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Partnership, not delegation** | PRIMA recommends; teacher approves ([`TP-01`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Transparency builds trust** | Reasoning is explainable — never concealed ([`EP-01`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Uncertainty is honest** | Intelligence surfaces ambiguity — never hallucinates certainty |
| **Evidence over invention** | Knowledge informs reasoning — curriculum is retrieved, not fabricated ([`KP-04`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Romanian classroom first** | Intelligence serves Romanian primary, preschool, and special education context ([`FP-04`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |

### Intelligence vs decision vs failure

| Model | Question answered | Specification |
|-------|-------------------|---------------|
| **Intelligence** | *How does PRIMA think, understand, and recommend?* | This document |
| **Decision** | *Who decides, and what authorizes action?* | [`PRIMA_DECISION_FRAMEWORK.md`](./PRIMA_DECISION_FRAMEWORK.md) |
| **Failure** | *How is integrity preserved when things go wrong?* | [`PRIMA_FAILURE_MODEL.md`](./PRIMA_FAILURE_MODEL.md) |
| **Workflow** | *What business process delivers value?* | [`PRIMA_WORKFLOW_MODEL.md`](./solution/PRIMA_WORKFLOW_MODEL.md) |

Intelligence **proposes and explains**. Decisions **authorize and record**. Failures **preserve and recover**.

---

## Foundational Principles

These principles translate [`PRIMA_ARCHITECTURAL_PRINCIPLES.md`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md) into intelligence-level commitments.

| ID | Principle | Source | Intelligence obligation |
|----|-----------|--------|-------------------------|
| **IP-01** | Pedagogy Before Technology | FP-02 | Instructional reasoning quality precedes automation speed |
| **IP-02** | Teacher Final Authority | TP-01 | No intelligence output becomes binding without teacher gate |
| **IP-03** | Design Before Execution | AP-04 | Instructional Blueprint reasoning precedes Generation intelligence |
| **IP-04** | Knowledge Never Decides | KP-02 | Evidence informs — never substitutes for teacher or blueprint authority |
| **IP-05** | Retrieved Not Invented | KP-04 | Curriculum claims trace to Knowledge Pack provenance |
| **IP-06** | Memory Never Overrides | ACR-04 | Personalization hints — not silent correction of teacher intent |
| **IP-07** | Generation Executes Never Decides | GP-01 | Execution intelligence renders — does not redesign |
| **IP-08** | Validation Never Redesigns | VP-03 | Measurement intelligence reports — does not mutate design |
| **IP-09** | Explainability Mandatory | EP-01 | Material recommendations carry rationale |
| **IP-10** | Transparency at Right Moment | EP-02 | Deep reasoning at review — not during raw imagination |
| **IP-11** | Technology Independence | AP-05 | Principles bind structure — not model vendor |
| **IP-12** | Educational Integrity First | FP-01 | Quality and appropriateness precede convenience |

---

## Intelligence Layers

PRIMA intelligence is organized in **ten conceptual layers**. Layers are **logical** — not deployment units. Upper layers depend on lower layers; Governance Intelligence constrains all.

```
Governance Intelligence ............ authority, gates, traceability (cross-cutting)
        ↑
Collaborative Intelligence ....... human-AI partnership
        ↑
Reflective Intelligence .......... mirroring, interpretation, improvement
        ↑
Validation Intelligence .......... quality and fidelity measurement
        ↑
Creative Intelligence ............ instructional design alternatives (not content generation)
        ↑
Decision Intelligence ............ architectural decision support (non-autonomous)
        ↑
Reasoning Intelligence ........... pedagogical logic and blueprint synthesis
        ↑
Knowledge Intelligence ........... curriculum and pedagogical evidence
        ↑
Contextual Intelligence .......... session, teacher, classroom, activity scope
        ↑
Pedagogical Intelligence ......... mission, values, instructional design ontology
```

---

### IL-01 — Pedagogical Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Anchor all intelligence in instructional design mission and pedagogical ontology |
| **Responsibilities** | Define what "good learning design" means; enforce Learning Experience centrality; maintain backward-design orientation |
| **Inputs** | Architectural Principles; Domain Model; Activity Type constraints; Platform Configuration |
| **Outputs** | Pedagogical reasoning norms; coherence criteria; design quality expectations |
| **Dependencies** | None — foundational layer |
| **Constraints** | Cannot be overridden by speed, automation, or model confidence |
| **Business Value** | Ensures PRIMA remains an instructional design platform — not a content spinner |

---

### IL-02 — Contextual Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Situate every intelligence act in teacher, classroom, session, and project context |
| **Responsibilities** | Assemble Conversation Context; apply Activity Type scope; integrate Memory Context hints; respect Project continuity |
| **Inputs** | Teacher utterances; Activity Type; Project; Memory Profile; Session State; Platform Configuration |
| **Outputs** | Scoped understanding; Teacher Intent candidates; session-scoped context bundle |
| **Dependencies** | IL-01 Pedagogical Intelligence |
| **Constraints** | Memory advisory only; no individual student surveillance ([`TP-05`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)); class context aggregate only |
| **Business Value** | Recommendations fit real classroom conditions — not generic templates |

**Capabilities:** ID-01, ID-02, PS-05, PS-01

---

### IL-03 — Knowledge Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Supply authoritative pedagogical and curriculum evidence to reasoning |
| **Responsibilities** | Scope Knowledge Pack retrieval; produce Knowledge Package; preserve provenance; respect pack versioning |
| **Inputs** | Teacher Intent; query scope; active Knowledge Pack version |
| **Outputs** | Knowledge Package (evidence artifact); competency candidates; strategy options; provenance references |
| **Dependencies** | IL-02 Contextual Intelligence |
| **Constraints** | KP-01 through KP-04; Knowledge Package read-only at consumption; never reaches Generation live ([`GP-05`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Business Value** | Curriculum-aligned design grounded in curated evidence — not model parametric knowledge alone |

**Capabilities:** Knowledge domain services; feeds ID-03

---

### IL-04 — Reasoning Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Transform understood intent and evidence into coherent instructional design logic |
| **Responsibilities** | Backward design; objective–activity–assessment alignment; constraint resolution; pedagogical alternative evaluation |
| **Inputs** | Teacher Intent; Decision Context; Knowledge Package; Memory Context |
| **Outputs** | Instructional Blueprint draft; reasoning summary; pedagogical flags; confidence signals |
| **Dependencies** | IL-02, IL-03 |
| **Constraints** | Decision Context ephemeral — never design authority ([`ACR-09`](./PRIMA_CANONICAL_ARTIFACTS.md)); one authoritative Blueprint per iteration ([`AC-07`](./PRIMA_DOMAIN_MODEL.md)) |
| **Business Value** | Structured pedagogical thinking at scale — teacher-reviewed before binding |

**Capabilities:** ID-03 Instructional Reasoning, ID-04 Blueprint Composition

---

### IL-05 — Decision Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Support architectural and pedagogical **decision preparation** — not autonomous authority |
| **Responsibilities** | Identify decision points; assemble decision inputs; surface alternatives; prepare gate preconditions |
| **Inputs** | Reasoning outputs; workflow phase; artifact states |
| **Outputs** | Decision-ready artifacts; alternative paths; precondition status |
| **Dependencies** | IL-04 Reasoning Intelligence |
| **Constraints** | Teacher Authority for binding decisions ([`PRIMA_DECISION_FRAMEWORK.md`](./PRIMA_DECISION_FRAMEWORK.md)); advisory vs binding distinction enforced |
| **Business Value** | Teachers decide with full information — not opaque automation |

**Capabilities:** Supports DEC-* registry; ID-05, ID-06 preparation

---

### IL-06 — Creative Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Generate and compare **instructional design alternatives** within blueprint composition |
| **Responsibilities** | Propose activity structures; differentiation strategies; assessment approaches; phase sequencing options |
| **Inputs** | Reasoning Intelligence outputs; Activity Type archetype rules; teacher preferences |
| **Outputs** | Blueprint section alternatives; trade-off summaries; design iteration options |
| **Dependencies** | IL-04 Reasoning Intelligence |
| **Constraints** | **Instructional design creativity only** — not classroom material text generation ([`GP-01`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)); teacher selects and approves |
| **Business Value** | Expands teacher design option space without removing authority |

**Capabilities:** ID-04, ID-07 Blueprint Evolution

---

### IL-07 — Validation Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Measure blueprint fidelity and pedagogical quality of execution outputs |
| **Responsibilities** | Apply Validation Rules; classify findings; assess severity; recommend teacher actions |
| **Inputs** | Generation Package; Blueprint Version; Validation Rules; Platform Configuration |
| **Outputs** | Validation Report; severity-classified findings; fidelity mapping |
| **Dependencies** | IL-04 (reference blueprint); approved Blueprint Version |
| **Constraints** | VP-01 through VP-05; measurement only — no redesign ([`VP-03`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Business Value** | Quality assurance teachers can trust — transparent and rule-traced |

**Capabilities:** QA-01, QA-02

---

### IL-08 — Reflective Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Mirror understanding; interpret reasoning and findings for teacher comprehension |
| **Responsibilities** | Produce Reflection Report; surface uncertainty; present design rationale; acknowledge teacher corrections |
| **Inputs** | Conversation Context; reasoning summaries; Validation Report; blueprint drafts |
| **Outputs** | Reflection Report; interpretive presentations |
| **Dependencies** | IL-04, IL-07 (when applicable) |
| **Constraints** | Non-gating — never substitutes for Teacher Approval ([`ACR-08`](./PRIMA_CANONICAL_ARTIFACTS.md), LC-08) |
| **Business Value** | Teachers understand PRIMA's thinking — partnership trust |

**Capabilities:** RF-01, RF-02, RF-03

---

### IL-09 — Collaborative Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Orchestrate human-AI partnership across discovery, review, editing, and recovery |
| **Responsibilities** | Dialogue partnership; clarification requests; confirmation vs interrogation balance; recovery explanation |
| **Inputs** | Teacher actions; intelligence layer outputs; workflow phase |
| **Outputs** | Teacher-facing partnership behaviour; clarification prompts; collaborative handoffs |
| **Dependencies** | All intelligence layers; Session Governance coordination |
| **Constraints** | Teacher leads; PRIMA assists; teacher approves ([`Human Collaboration`](#human-ai-collaboration) section) |
| **Business Value** | AI feels like a design colleague — not a black box or autopilot |

**Capabilities:** TE-02, INT-TE-02 through INT-TE-05

---

### IL-10 — Governance Intelligence

| Field | Content |
|-------|---------|
| **Purpose** | Ensure intelligence acts remain within architectural authority, traceability, and gate discipline |
| **Responsibilities** | Enforce design-before-execution; block unauthorized intelligence outputs from becoming authority; maintain audit trail |
| **Inputs** | Artifact states; gate definitions; Teacher Approval status; lifecycle constraints |
| **Outputs** | Gate signals; blocked transitions; Audit Record entries; lineage bindings |
| **Dependencies** | Cross-cutting — observes all layers |
| **Constraints** | WG-04 Teacher Approval mandatory; immutable approved versions; fail visible ([`PRIMA_FAILURE_MODEL.md`](./PRIMA_FAILURE_MODEL.md)) |
| **Business Value** | Intelligence remains governed — safe for institutional and classroom trust |

**Capabilities:** GV-01 through GV-06

---

## Cognitive Functions

Registered cognitive abilities. Each creates **educational value** within teacher partnership — none grants autonomous authority.

| ID | Cognitive function | Intelligence layer | Primary capability | Educational value |
|----|-------------------|------------------|-------------------|-------------------|
| **CF-01** | Understand teacher intent | IL-02 | ID-01, ID-02 | Captures what teacher wants students to learn |
| **CF-02** | Recognize educational context | IL-02 | ID-01, PS-05 | Situates design in grade, subject, classroom reality |
| **CF-03** | Build mental models of learning | IL-04 | ID-03 | Structures how students will learn and demonstrate |
| **CF-04** | Retrieve relevant knowledge | IL-03 | Knowledge services | Grounds design in curriculum evidence |
| **CF-05** | Apply pedagogical reasoning | IL-04 | ID-03 | Applies backward design and coherence logic |
| **CF-06** | Align to curriculum | IL-03, IL-04 | ID-03 | Maps objectives to frameworks and competencies |
| **CF-07** | Compose instructional designs | IL-04, IL-06 | ID-04 | Produces Instructional Blueprint structure |
| **CF-08** | Evaluate design alternatives | IL-06 | ID-04, ID-07 | Compares strategies before teacher commitment |
| **CF-09** | Identify ambiguity | IL-02, IL-09 | RF-01 | Prevents silent misunderstanding |
| **CF-10** | Detect uncertainty | IL-08 | RF-01, RF-02 | Surfaces low-confidence inferences |
| **CF-11** | Request clarification | IL-09 | ID-01 | Asks only what cannot be responsibly assumed |
| **CF-12** | Validate pedagogical quality | IL-07 | QA-02 | Measures design and output quality |
| **CF-13** | Validate blueprint fidelity | IL-07 | QA-01 | Ensures execution matches approved design |
| **CF-14** | Explain recommendations | IL-08 | RF-02 | Makes reasoning visible at review |
| **CF-15** | Support teacher reflection | IL-08 | RF-01, RF-03 | Helps teacher evaluate PRIMA understanding |
| **CF-16** | Coordinate generation fidelity | IL-07 (post-design) | GN-01, GN-03 | Executes approved design — does not redesign |
| **CF-17** | Preserve session continuity | IL-02, IL-10 | PS-01, GV-01 | Maintains design thread across sessions |
| **CF-18** | Learn from interaction history | IL-02 | PS-05 | Reduces repetition for returning teachers — advisory |
| **CF-19** | Suggest proactive improvements | IL-08 | RF-02 (future scope) | Non-prescriptive refinement hints at review |
| **CF-20** | Resolve instructional conflicts | IL-04, IL-05 | ID-03, ID-07 | Surfaces trade-offs — teacher resolves |
| **CF-21** | Bind execution to approved design | IL-10 | GN-03, GV-05 | Prevents design drift after approval |
| **CF-22** | Explain failure and recovery | IL-09, IL-10 | GV-06, RF-03 | Preserves trust under failure |

---

## Reasoning Principles

Permanent rules governing how PRIMA reasons — independent of implementation technology.

| ID | Principle | Meaning |
|----|-----------|---------|
| **RP-01** | Reason before generation | Instructional Blueprint approved before execution intelligence activates |
| **RP-02** | Understand before recommending | Intent normalization (WG-01) precedes design recommendations |
| **RP-03** | Clarify before assuming | Ambiguity triggers clarification — not silent default ([`CF-11`](#cognitive-functions)) |
| **RP-04** | Validate before finalizing | Validation intelligence precedes teacher acceptance of materials ([`VP-02`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **RP-05** | Explain before persuading | Design rationale presented at review — not hidden persuasion |
| **RP-06** | Reflect before improving | Teacher acknowledges understanding before design iteration proceeds |
| **RP-07** | Never hallucinate certainty | Confidence signals distinguish inference from fact |
| **RP-08** | Prefer evidence over confidence | Knowledge Package provenance beats model parametric certainty |
| **RP-09** | Preserve pedagogical coherence | Objectives, activities, and assessment must align within Blueprint |
| **RP-10** | Protect curriculum integrity | Curriculum claims require Knowledge Pack trace — not invention |
| **RP-11** | Teacher authority prevails | Explicit teacher statements override inference, memory, and defaults |
| **RP-12** | Backward design orientation | Objectives anchor activity and assessment design ([`Domain Model`](./PRIMA_DOMAIN_MODEL.md)) |
| **RP-13** | Single Learning Experience contract | One authoritative design iteration per Learning Experience ([`FP-03`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **RP-14** | Scoped reasoning passes | Decision Context bounds one reasoning invocation — not unbounded drift |

---

## Knowledge Principles

| ID | Principle | Source | Application |
|----|-----------|--------|-------------|
| **KN-01** | Authoritative corpus | KP-01 | Knowledge Pack is curated release — not ad hoc web retrieval |
| **KN-02** | Evidence not authority | KP-02 | Knowledge Package informs reasoning — never approves blueprint |
| **KN-03** | Version discipline | KP-03 | Active pack version fixed for reasoning pass |
| **KN-04** | Provenance required | KP-04 | Blueprint curriculum references trace to Knowledge Object provenance |
| **KN-05** | Session-scoped delivery | Canonical Artifacts | Knowledge Package ephemeral per query — not longitudinal authority |
| **KN-06** | No live knowledge at generation | GP-05 | Generation executes approved design — not live curriculum query |
| **KN-07** | Universal not personal | Domain Model | Knowledge Pack never contains teacher-specific data |

---

## Context Understanding

PRIMA contextual intelligence assembles a **multi-dimensional situational model** before reasoning. No dimension alone authorizes design — all inform scoped understanding.

| Context dimension | What PRIMA understands | Primary sources | Intelligence use |
|-------------------|------------------------|-----------------|------------------|
| **Teacher goals** | Intended Learning Experience outcome | Discovery dialogue → Teacher Intent | Anchors backward design |
| **Student needs** | Age, level, differentiation requirements | Teacher statements; Activity Type; Memory hints | Scopes activities and assessment |
| **Grade level** | Developmental appropriateness bounds | Activity Type; Platform Configuration; teacher input | Constrains strategies and validation |
| **Curriculum** | Frameworks, competencies, subject pedagogy | Knowledge Pack via Knowledge Package | Evidence for objective alignment |
| **Pedagogical constraints** | Time, grouping, resources, assessment policy | Teacher Intent; Platform Configuration | Feasibility of design alternatives |
| **Available resources** | Materials class, technology, classroom setup | Teacher Intent; Blueprint Resources section (design) | Activity design — not generated binaries |
| **Previous sessions** | Prior design iterations, preferences | Project; Memory Profile; Library lineage | Continuity and personalization hints |
| **Institutional context** | School type, special education needs | Teacher statements; Platform Configuration | Differentiation and accessibility |
| **Educational standards** | National curriculum alignment (Romania) | Knowledge Pack | Curriculum section provenance |
| **Learning objectives** | Measurable outcomes teacher seeks | Teacher Intent normalization | Backward design anchor |
| **Activity Type scope** | Builder archetype (Lecție, Joc, Fișă, etc.) | Project selection from Dashboard | Output shape and generation rules |

**Constraint:** Context understanding produces **Teacher Intent** and **Decision Context** — not Instructional Blueprint authority until reasoning and teacher review complete.

---

## Intent Understanding

PRIMA distinguishes **intent classes** to route discovery, reasoning depth, and clarification strategy. Intent recognition is **probabilistic**; routing is **governed** — ambiguous intents require clarification before reasoning.

### Intent taxonomy

| Intent class | Recognition goal | Required context | Clarification strategy | Business outcome |
|--------------|------------------|------------------|------------------------|------------------|
| **Information request** | Teacher seeks explanation — not design | Topic; audience | Confirm no design session needed; offer reference or exit | Knowledge surfaced — no Blueprint |
| **Lesson creation (Lecție)** | Design full Learning Experience for instruction | Subject, grade, duration, objectives | Confirm Activity Type; infer from dialogue; validate at WG-01 | Instructional Blueprint → Generation |
| **Assessment design** | Design evaluation approach within Learning Experience | Objectives; assessment type | Distinguish assessment design from generated quiz resource | Assessment section in Blueprint |
| **Game creation (Joc)** | Design playful learning activity structure | Learning goal; game constraints | Confirm game archetype rules; avoid conflating with worksheet | Activity-structured Blueprint |
| **Worksheet generation (Fișă)** | Design structured practice experience | Skills, difficulty, format intent | Clarify design vs raw fill-in request | Blueprint before worksheet Generation |
| **Reflection** | Teacher evaluates prior design or session | Prior Project or Library item | Scope reflection target; non-gating interpretive mode | Reflection Report — no authority |
| **Research** | Explore pedagogical options without commitment | Topic breadth | Offer exploratory dialogue; defer blueprint commit | Discovery without WG-02 |
| **Planning** | Multi-session or unit-level design scope | Timeline, unit structure | Clarify single vs multi-iteration Project scope | Project-scoped design arc |
| **Revision** | Modify existing approved or draft design | Blueprint version; change scope | Distinguish ID-07 evolution vs GN-02 regen | Revision Directives or new version |
| **Exploration** | Open-ended pedagogical brainstorming | Minimal | Low-structure discovery; confirm before composition | Delayed DEC-BP-01 |
| **Professional development** | Teacher learning about pedagogy — not classroom design | PD goal | Route to informational mode — not Generation path | No classroom Blueprint |
| **Mixed intents** | Multiple goals in one utterance | Full utterance parse | Decompose; prioritize; confirm sequence with teacher | Ordered intent normalization |
| **Ambiguous intents** | Insufficient signal for routing | Activity Type; prior context | RF-01 mirror; explicit teacher disambiguation | Hold at discovery — FAIL-INT-01 path |

### Intent understanding flow

```mermaid
flowchart LR
  UTTER[Teacher utterance] --> CAP[Capture in Conversation Context]
  CAP --> CLASS{Intent class?}
  CLASS -->|clear| NORM[Normalize Teacher Intent]
  CLASS -->|ambiguous| CLAR[CF-11 Clarification]
  CLASS -->|mixed| DECOMP[Decompose intents]
  CLAR --> CAP
  DECOMP --> CONFIRM[Teacher confirms priority]
  CONFIRM --> NORM
  NORM --> COMPLETE{WG-01 ready?}
  COMPLETE -->|yes| REASON[Authorize reasoning]
  COMPLETE -->|no| CAP
```

---

## Recommendation Principles

PRIMA recommendations — whether design alternatives, strategy options, or recovery paths — follow the **Recommendation Model**.

| ID | Principle | Description |
|----|-----------|-------------|
| **REC-01** | Evidence-based | Recommendations cite Knowledge Package or explicit teacher input |
| **REC-02** | Pedagogically justified | Every recommendation links to instructional rationale |
| **REC-03** | Curriculum aligned | Curriculum recommendations trace to Knowledge Pack provenance |
| **REC-04** | Context sensitive | Recommendations respect Activity Type, grade, and teacher constraints |
| **REC-05** | Transparent | Rationale accessible via Reflection Report at review |
| **REC-06** | Teacher controllable | Teacher may accept, modify, or reject — no lock-in |
| **REC-07** | Multiple alternatives | Significant design choices present ≥2 viable alternatives when applicable |
| **REC-08** | Confidence-aware | Low-confidence recommendations flagged for confirmation |
| **REC-09** | Non-prescriptive | Recommendations propose — never imply mandatory adoption |
| **REC-10** | Gate-separated | Execution recommendations require approved Blueprint — not before |

### Recommendation vs authority

| Output | Nature | Becomes authority when |
|--------|--------|------------------------|
| Strategy suggestion | Advisory | Teacher incorporates in Blueprint review |
| Blueprint draft section | Advisory | Teacher approves at DEC-BP-02 |
| Validation finding | Measurement | Teacher resolves at DEC-VAL-02 |
| Recovery option | Advisory | Teacher selects at DEC-REC-01 |
| Generated Resource draft | Execution output | Teacher finalizes at DEC-TI-01 |

---

## Validation Principles

Validation intelligence operates in **two phases**: pre-presentation coherence checks during reasoning, and post-generation measurement during execution.

### Pre-presentation (reasoning phase)

| Validation target | Question | Layer |
|-------------------|----------|-------|
| **Pedagogical coherence** | Do objectives, activities, and assessment align? | IL-04 |
| **Curriculum alignment** | Are competency claims evidenced? | IL-03, IL-04 |
| **Completeness** | Are required Blueprint sections present? | IL-04 |
| **Consistency** | Are internal contradictions resolved or surfaced? | IL-04 |
| **Safety (design-level)** | Are age and appropriateness constraints respected? | IL-04, IL-01 |

### Post-generation (execution phase)

| Validation target | Question | Capability |
|-------------------|----------|------------|
| **Blueprint fidelity** | Do materials match approved Blueprint Version? | QA-01 |
| **Pedagogical quality** | Do materials meet quality rules? | QA-02 |
| **Educational appropriateness** | Are findings severity-classified? | QA-02, VP-05 |
| **Consistency** | Cross-resource coherence within Generation Package | QA-01, QA-02 |

**Rule:** Validation intelligence **never redesigns** — it measures and reports ([`VP-03`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)). Teacher and design evolution paths handle remediation.

---

## Reflection Principles

Reflective intelligence is **interpretive** — it helps teachers understand PRIMA's thinking without granting gate authority.

| ID | Principle | Application |
|----|-----------|-------------|
| **REF-01** | Mirror before advance | RF-01 confirms understanding during discovery |
| **REF-02** | Explain at review | RF-02 presents design rationale at blueprint review |
| **REF-03** | Present findings interpretively | RF-03 translates Validation Report for teacher action |
| **REF-04** | Non-gating always | Reflection Report `acknowledged` ≠ Teacher Approval `granted` |
| **REF-05** | Correctable | Teacher corrections trigger revised mirroring — not defensive persistence |
| **REF-06** | Pattern recognition advisory | Repeated teacher preferences inform Memory — never override |
| **REF-07** | Improvement suggestions optional | Proactive refinements offered — teacher dismisses freely |

### Reflective intelligence cycle

```mermaid
flowchart LR
  OBSERVE[Observe interaction / output] --> INTERPRET[Interpret for teacher]
  INTERPRET --> PRESENT[Reflection Report]
  PRESENT --> TEACH[Teacher responds]
  TEACH -->|confirm| CONTINUE[Proceed in workflow]
  TEACH -->|correct| REVISE[Revise understanding]
  REVISE --> OBSERVE
  TEACH -->|acknowledge| CONTINUE
```

---

## Explainability

Every **material recommendation** must answer seven questions. Material recommendations are those affecting Blueprint composition, validation resolution, or recovery path selection.

| Question | Required content | Artifact / capability |
|----------|------------------|----------------------|
| **Why?** | Instructional rationale | Reflection Report; Blueprint annotations |
| **Based on what?** | Teacher statements + inferred context | Teacher Intent refs |
| **Which evidence?** | Knowledge Package provenance | Curriculum section citations |
| **Which constraints?** | Activity Type, grade, time, policy | Decision Context scope |
| **Which assumptions?** | Explicit inference flags | Confidence signals |
| **Which alternatives?** | Other viable design paths | IL-06 creative alternatives |
| **Which uncertainty?** | Low-confidence fields | RF-01, RF-02 flags |

### Explainability tiers

| Tier | When | Depth |
|------|------|-------|
| **Light mirror** | Discovery dialogue | Confirms understanding — minimal pedagogical detail |
| **Design exposition** | Blueprint review | Full backward-design rationale ([`EP-02`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)) |
| **Finding interpretation** | Post-validation | Rule-linked findings with recommended actions |
| **Recovery explanation** | Failure | What failed, what preserved, what options exist |

Explainability satisfies [`EP-01`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md) — it **never substitutes** for Teacher Approval.

---

## Human-AI Collaboration

Explicit partnership model governing all intelligence behaviour.

```
Teacher leads          →  PRIMA discovers and scopes
PRIMA assists          →  PRIMA reasons and proposes
Teacher approves       →  Teacher Approval artifact (WG-04)
PRIMA executes         →  Generation faithful to approved design
Teacher edits          →  Teacher owns Generated Resources
PRIMA validates        →  Measurement and findings presentation
Teacher decides        →  Override, regen, or accept
PRIMA explains         →  Reflection at every material transition
Teacher reflects       →  Teacher evaluates partnership quality
PRIMA learns           →  Memory advisory for future sessions
```

### Collaboration principles

| ID | Principle |
|----|-----------|
| **HAC-01** | Teacher initiates PRIMA Experience intentionally from Dashboard |
| **HAC-02** | Discovery is dialogue — not form extraction |
| **HAC-03** | PRIMA infers when confidence is high; confirms rather than re-interviews returning teachers |
| **HAC-04** | Teacher may interrupt, pause, or cancel at any phase |
| **HAC-05** | PRIMA never publishes, exports, or generates without explicit teacher gate |
| **HAC-06** | Editing partnership preserves teacher voice in final materials |
| **HAC-07** | Failure partnership presents options — teacher chooses recovery |

### Collaboration model diagram

```mermaid
flowchart TB
  subgraph Teacher["Teacher — Authority"]
    T1[Express intent]
    T2[Review and approve]
    T3[Edit and finalize]
    T4[Export decision]
  end

  subgraph PRIMA["PRIMA — Intelligence Partner"]
    P1[Understand context]
    P2[Reason and propose]
    P3[Execute faithfully]
    P4[Validate and explain]
  end

  T1 --> P1 --> P2
  P2 --> T2
  T2 -->|approved| P3
  P3 --> P4 --> T3 --> T4
  T2 -->|declined| P2
  P4 -->|blocking| T2
```

---

## Learning Evolution

PRIMA intelligence may **evolve** without altering foundational principles ([`IP-01`](./PRIMA_INTELLIGENCE_MODEL.md) through [`IP-12`](#foundational-principles)).

| Evolution vector | What may improve | What must not change |
|------------------|------------------|----------------------|
| **Pedagogical knowledge** | Knowledge Pack content, strategies, norms | KP-02 evidence-not-authority |
| **Curriculum coverage** | Expanded Knowledge Object corpus | Version discipline KN-03 |
| **Reasoning quality** | Coherence checks, alternative generation | RP-11 teacher authority |
| **Instructional strategies** | Creative Intelligence alternatives | Design-before-execution RP-01 |
| **Educational standards** | Alignment mappings in Knowledge Pack | Provenance KN-04 |
| **Personalization** | Memory Profile inference quality | Memory never overrides IP-06 |
| **Validation rules** | Validation Rule catalogue | VP-03 measurement-only |
| **Explainability depth** | Richer Reflection Report structure | EP-01 mandatory explainability |
| **Future AI technology** | Underlying inference implementation | All IP-* and IM-CR-* compliance |

Evolution follows **governance process** — not silent model swap. Architectural Principles amendment required for foundational change.

---

## Governance

### Intelligence governance authority

| Role | Authority |
|------|-----------|
| **LUDI ON Product Team** | Official Intelligence Model; principle registry |
| **Lead Intelligence Architect** | Propose layer and cognitive function changes |
| **Architectural review board** | Approve changes affecting teacher authority or gates |
| **Knowledge curation governance** | Knowledge Pack content quality — separate from intelligence architecture |

### Reasoning policy evolution

1. Propose change with educational value statement  
2. Verify no conflict with Architectural Principles  
3. Map to intelligence layer and cognitive function  
4. Update Decision Framework if authority affected  
5. Update engine specifications as implementation layer — not before architecture approval  

### Explainability preservation

Any intelligence enhancement must **maintain or improve** explainability tier coverage. Reduction of explainability requires Principles-level review.

### Educational integrity protection

| Integrity domain | Protection mechanism |
|------------------|---------------------|
| Curriculum accuracy | Knowledge Pack curation + provenance KN-04 |
| Age appropriateness | Validation Rules + QA-02 severity |
| Teacher authority | WG-04, TP-01, IM-CR-01 |
| Design fidelity | QA-01 + ACR-10 binding |
| Pedagogical coherence | IL-04 reasoning checks + RP-09 |

### Future AI technology compatibility

New AI technologies may implement cognitive functions **only through**:

- Registered intelligence layers  
- Canonical artifact inputs and outputs  
- Decision Framework authority rules  
- Failure Model recovery constraints  
- Compliance rules IM-CR-01 through IM-CR-10  

Technology swap requires **conformance verification** — not architecture rewrite ([`AP-05`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md)).

---

## Intelligence Diagrams

### Diagram 1 — Overall intelligence architecture

```mermaid
flowchart TB
  subgraph Gov["IL-10 Governance Intelligence"]
    G[Gates · Audit · Lineage]
  end

  subgraph Collab["IL-09 Collaborative Intelligence"]
    C[Human-AI Partnership]
  end

  subgraph Upper["Design Intelligence"]
    REF[IL-08 Reflective]
    VAL[IL-07 Validation]
    CRE[IL-06 Creative]
    DEC[IL-05 Decision Support]
    REA[IL-04 Reasoning]
  end

  subgraph Lower["Foundation Intelligence"]
    KN[IL-03 Knowledge]
    CTX[IL-02 Contextual]
    PED[IL-01 Pedagogical]
  end

  PED --> CTX --> KN --> REA
  REA --> DEC --> CRE
  CRE --> VAL --> REF --> C
  G -.-> PED & CTX & REA & VAL & C
  C --> T[Teacher Authority]
```

---

### Diagram 2 — Cognitive layer model

```mermaid
flowchart LR
  subgraph Input["Inputs"]
    TEACHER[Teacher]
    PACK[Knowledge Pack]
    MEMORY[Memory Profile]
    CONFIG[Platform Configuration]
  end

  subgraph Cognition["Cognitive Functions"]
    CF1[CF-01 Intent]
    CF4[CF-04 Retrieve]
    CF5[CF-05 Reason]
    CF7[CF-07 Compose]
    CF12[CF-12 Validate]
    CF14[CF-14 Explain]
  end

  subgraph Output["Outputs"]
    TI[Teacher Intent]
    BP[Instructional Blueprint]
    VR[Validation Report]
    RR[Reflection Report]
  end

  TEACHER --> CF1 --> TI
  PACK --> CF4 --> CF5
  MEMORY --> CF1
  CONFIG --> CF5
  TI --> CF5 --> CF7 --> BP
  BP --> CF12 --> VR
  CF5 & CF12 --> CF14 --> RR
```

---

### Diagram 3 — Reasoning flow

```mermaid
flowchart TB
  START[Teacher Intent complete] --> ASSEMBLE[Assemble Decision Context]
  ASSEMBLE --> KP[Knowledge Package evidence]
  ASSEMBLE --> MEM[Memory Context hints]

  KP --> REASON[Backward design reasoning]
  MEM --> REASON
  REASON --> COHERE{Coherent?}
  COHERE -->|no| FLAGS[Surface conflicts / ambiguity]
  FLAGS --> CLAR[Teacher clarification]
  CLAR --> REASON
  COHERE -->|yes| COMPOSE[Compose Blueprint draft]
  COMPOSE --> PREVAL[Pre-presentation validation]
  PREVAL --> REVIEW[Present for teacher review — RF-02]
```

---

### Diagram 4 — Recommendation flow

```mermaid
flowchart LR
  NEED[Design need identified] --> EVID[Gather evidence]
  EVID --> ALT[Generate alternatives — IL-06]
  ALT --> EVAL[Evaluate trade-offs]
  EVAL --> RANK[Rank by coherence + context fit]
  RANK --> CONF{Confidence?}
  CONF -->|high| PROPOSE[Present primary + alternative]
  CONF -->|low| CONFIRM[Flag for teacher confirmation]
  PROPOSE --> TEACH[Teacher selects / modifies]
  CONFIRM --> TEACH
  TEACH --> BP[Blueprint section update]
```

---

### Diagram 5 — Validation flow

```mermaid
flowchart TB
  subgraph Design["Design phase"]
    D1[Blueprint draft] --> D2[Coherence check]
    D2 --> D3[Present to teacher]
  end

  subgraph Execution["Execution phase"]
    APP[Approved Blueprint Version] --> GEN[Generation Package]
    GEN --> FID[QA-01 Fidelity measure]
    GEN --> QUAL[QA-02 Quality measure]
    FID --> REPORT[Validation Report]
    QUAL --> REPORT
    REPORT --> RF3[RF-03 Present findings]
    RF3 --> TEACH[Teacher resolution]
  end

  D3 --> APP
```

---

### Diagram 6 — Reflective intelligence cycle

```mermaid
flowchart TB
  DISC[Discovery] --> RF1[RF-01 Mirror understanding]
  RF1 --> DISC

  REVIEW[Blueprint review] --> RF2[RF-02 Design explainability]
  RF2 --> APPROVE{Teacher approval?}

  VALID[Validation complete] --> RF3[RF-03 Finding presentation]
  RF3 --> RESOLVE[Teacher resolution]

  APPROVE -->|yes| EXEC[Generation arc]
  APPROVE -->|no| EVOLVE[Design evolution]
```

---

### Diagram 7 — Knowledge flow

```mermaid
flowchart LR
  subgraph Corpus["Knowledge Domain"]
    KO[Knowledge Objects]
    KPACK[Knowledge Pack release]
  end

  subgraph Session["Reasoning pass"]
    QUERY[Scoped query]
    KPKG[Knowledge Package artifact]
    DC[Decision Context]
    REASON[Reasoning Intelligence]
    BP[Instructional Blueprint — provenance refs]
  end

  KO --> KPACK --> QUERY --> KPKG
  KPKG --> DC --> REASON --> BP
  KPKG -.->|never| GEN[Generation Engine live]
```

---

### Diagram 8 — Governance flow

```mermaid
flowchart TB
  INT[Intelligence output proposed] --> GATE{Governance check}

  GATE -->|advisory| ART[Artifact as draft / report]
  GATE -->|requires approval| WAIT[Hold for teacher gate]
  GATE -->|unauthorized| BLOCK[Block — FAIL-GOV-02]

  ART --> AUDIT[Audit Record]
  WAIT --> TA[Teacher Approval]
  TA -->|granted| AUTH[Authorized artifact state]
  TA -->|declined| REVISE[Design revision]
  AUTH --> AUDIT
  BLOCK --> AUDIT
```

---

## Compliance Rules

| ID | Rule |
|----|------|
| **IM-CR-01** | Teacher authority is never overridden by intelligence inference |
| **IM-CR-02** | Reasoning precedes generation — Instructional Blueprint approval mandatory |
| **IM-CR-03** | Validation precedes teacher acceptance of execution outputs |
| **IM-CR-04** | Material recommendations must be explainable per Explainability section |
| **IM-CR-05** | Uncertainty must be explicit — never presented as fact |
| **IM-CR-06** | Educational integrity has priority over automation speed |
| **IM-CR-07** | Pedagogical quality has priority over output volume |
| **IM-CR-08** | Knowledge evidence must not be fabricated — KN-04 provenance required |
| **IM-CR-09** | Reflection never grants gate authority — REF-04 |
| **IM-CR-10** | Intelligence Model must remain independent of any specific AI technology |

---

## Summary

The **PRIMA Intelligence Model** defines the official **intelligence architecture** of the PRIMA platform — how PRIMA **thinks** as an Intelligent Pedagogical Design Partner.

The model establishes:

- **Ten intelligence layers** from Pedagogical foundation through Governance cross-cut  
- **Twenty-two cognitive functions** creating educational value without autonomous authority  
- **Fourteen reasoning principles** governing pedagogical logic  
- **Ten recommendation principles** ensuring evidence-based, teacher-controllable proposals  
- **Seven reflection principles** maintaining interpretive, non-gating partnership  
- **Explicit human-AI collaboration** — teacher leads; PRIMA assists, explains, and learns advisedly  
- **Governed evolution** compatible with future AI technologies without principle erosion  

PRIMA intelligence **amplifies teacher capability** — it does not replace teacher judgment, hide reasoning, or conceal uncertainty.

All present and future AI capabilities — regardless of model, vendor, or implementation — **must conform to this Intelligence Model**, the [`PRIMA_DECISION_FRAMEWORK.md`](./PRIMA_DECISION_FRAMEWORK.md), and the [`PRIMA_FAILURE_MODEL.md`](./PRIMA_FAILURE_MODEL.md).

This document is the **conceptual foundation** for every intelligent behaviour in the PRIMA platform.

---

## Document Authority

| Layer | Relationship |
|-------|--------------|
| [`PRIMA_ARCHITECTURAL_PRINCIPLES.md`](./PRIMA_ARCHITECTURAL_PRINCIPLES.md) | Constitutional — Foundational Principles derive from here |
| [`PRIMA_DOMAIN_MODEL.md`](./PRIMA_DOMAIN_MODEL.md) | Entity and pedagogical ontology for context understanding |
| [`PRIMA_CANONICAL_ARTIFACTS.md`](./PRIMA_CANONICAL_ARTIFACTS.md) | Intelligence inputs and outputs as artifacts |
| [`PRIMA_DECISION_FRAMEWORK.md`](./PRIMA_DECISION_FRAMEWORK.md) | Authority and binding decisions |
| [`PRIMA_FAILURE_MODEL.md`](./PRIMA_FAILURE_MODEL.md) | Intelligence behaviour under failure |
| [`PRIMA_CAPABILITY_MODEL.md`](./solution/PRIMA_CAPABILITY_MODEL.md) | Business capabilities deliver cognitive functions |
| [`PRIMA_ENGINE.md`](./PRIMA_ENGINE.md) | Product implementation of intelligence layers |

---

## Next Recommended Document

→ [`PRIMA_ARCHITECTURE_CONSISTENCY_REVIEW.md`](./PRIMA_ARCHITECTURE_CONSISTENCY_REVIEW.md) — Cross-document consistency audit including intelligence, decision, and failure alignment.
