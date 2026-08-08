# PRIMA / LUDI ON documentation

Specifications for an AI-native pedagogical design studio for Romanian primary teachers.

Product interface language is Romanian. Specifications are written in English.

**Governance:** [`PRIMA_DOCUMENTATION_ARCHITECTURE.md`](./PRIMA_DOCUMENTATION_ARCHITECTURE.md) (DOC-001) ·
**Registry of record:** [`DOCUMENTATION_REGISTRY.md`](./DOCUMENTATION_REGISTRY.md) (DOC-002)

---

## Start here

| If you want to know | Read |
|---|---|
| What PRIMA must never do | [PRIMA-DOC-000 Founding Charter](./product/PRIMA-DOC-000_FOUNDING_CHARTER.md) |
| Who PRIMA is, in its own voice | [DOCUMENT-000 The PRIMA Manifesto](./product/DOCUMENT-000_PRIMA_MANIFESTO.md) |
| What makes a feature worthy | [PRIMA-DOC-002 Product Manifest](./product/PRIMA-DOC-002_PRODUCT_MANIFEST.md) |
| What ships and when | [PRIMA_MVP_ROADMAP](./product/PRIMA_MVP_ROADMAP.md) |
| How a screen must look and behave | [Design Book](./design/) chapters 1–12 |
| How the code is laid out | [`../ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Why this technology stack | [ARCHITECTURE_DECISIONS](./engineering/ARCHITECTURE_DECISIONS.md) |

---

## Authority order

Four generations of specification were written over the project's life. Only the layers below are current.
On conflict, higher wins.

```
1  Foundation Suite         PRIMA-DOC-000 … 006   supreme; DOC-000 prevails on substance
2  Identity                 DOCUMENT-000          voice, ethics, teacher/AI roles
3  Constitutional / EOS     POSS, constitutional models, ES-*, PAS-*, PDC
4  Design Book              DB-CH01 … CH12        + DESIGN-001 executable tokens
5  Engineering specs        FEATURE-*, AI-*, UX-*, PPS-*, PVC-*
```

Anything not reachable from this list is not authoritative.

---

## Foundation Suite (PRIMA-DOC-000 … 006)

The newest and most authoritative layer. Read in order — later documents assume the vocabulary and
constraints of earlier ones.

Index and derivation rule: [`product/PRIMA_FOUNDATION_SUITE.md`](./product/PRIMA_FOUNDATION_SUITE.md)

| # | Code | Document | Permanent question |
|---|---|---|---|
| 1 | PRIMA-DOC-000 | [Founding Charter](./product/PRIMA-DOC-000_FOUNDING_CHARTER.md) | What must never be violated? |
| 2 | PRIMA-DOC-001 | [Product Vision & Strategic Direction](./product/PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md) | What future are we building? |
| 3 | PRIMA-DOC-002 | [Product Manifest](./product/PRIMA-DOC-002_PRODUCT_MANIFEST.md) | What makes a feature worthy? |
| 4 | PRIMA-DOC-003 | [Pedagogical Framework](./product/PRIMA-DOC-003_PEDAGOGICAL_FRAMEWORK.md) | How is worthy learning conceived? |
| 5 | PRIMA-DOC-004 | [AI Constitution](./product/PRIMA-DOC-004_AI_CONSTITUTION.md) | How may assistance collaborate with educators? |
| 6 | PRIMA-DOC-005 | [UX Design Standards](./product/PRIMA-DOC-005_UX_DESIGN_STANDARDS.md) | How must interaction support educational work? |
| 7 | PRIMA-DOC-006 | [Engineering Standards](./product/PRIMA-DOC-006_ENGINEERING_STANDARDS.md) | How must systems sustain mission and trust? |

**Procedural companion:** [PRIMA-DOC-000-AP Authoring Protocol](./product/PRIMA-DOC-000-AP_AUTHORING_PROTOCOL.md)
— governs how these and all derived documents are drafted and amended.

---

## Product (`product/`)

| Group | Documents |
|---|---|
| Identity | [DOCUMENT-000 Manifesto](./product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Product DNA](./product/PRIMA_PRODUCT_DNA.md) · [Project Bible](./product/LUDI_ON_PROJECT_BIBLE.md) |
| Educational OS | [POSS](./product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md) · [Cognitive Model](./product/PRIMA_COGNITIVE_MODEL.md) · [Intelligence Kernel](./product/PRIMA_INTELLIGENCE_KERNEL.md) |
| The educational object | [Instructional Blueprint Specification](./product/INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md) · [Canonical Artifacts](./product/PRIMA_CANONICAL_ARTIFACTS.md) |
| Constitutional models | Language · Capability · Domain · Command · Event · Use Case · Decision · State Machine · Service Contract · Query · Policies · Engine Architecture |
| Architecture | [Architectural Principles](./product/PRIMA_ARCHITECTURAL_PRINCIPLES.md) · [Reference Technical Architecture](./product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md) |
| Roadmap | [MVP Roadmap](./product/PRIMA_MVP_ROADMAP.md) |
| PRIMA Adapt | [Product Definition](./product/PRIMA_ADAPT_PRODUCT_DEFINITION.md) (draft) |

The constitutional models are conceptual specifications, not a description of the current code. The
implemented domain lives in `packages/domain`; see [`../ARCHITECTURE.md`](../ARCHITECTURE.md).

---

## Design (`design/`)

The Design Book (chapters 1–12) is the design constitution.
Index and authority order: [`design/README.md`](./design/README.md).

| | |
|---|---|
| Visual constitution | DB-CH02 PRIMA Design Language |
| Executable tokens | [DESIGN-001](./design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) |
| Screen library | DB-CH10 — 12 domains, 25 fields per screen |
| Teacher journeys | DB-CH05 — 8 journeys with emotional timelines |
| The two carrying surfaces | DB-CH11 Teacher Desk ("Biroul meu") · DB-CH12 Lesson Design Studio |
| PRIMA Adapt UX | [PRIMA_ADAPT_UX_SPECIFICATION](./design/PRIMA_ADAPT_UX_SPECIFICATION.md) |

[DESIGN-002](./design/DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md) is DESIGN-001's declared companion. It
substantially overlaps the Design Book and is pending a manual merge; treat the Design Book as authoritative
where they disagree.

---

## Engineering (`engineering/`)

Alias tables for every `ES-*`, `PAS-*`, `PPS-*`, `PVC-*` and Design Book code:
[`engineering/SPEC_INDEX.md`](./engineering/SPEC_INDEX.md).

| Group | Documents |
|---|---|
| Current stack | [ARCHITECTURE_DECISIONS](./engineering/ARCHITECTURE_DECISIONS.md) — why npm workspaces, Hono, Drizzle, BullMQ, TanStack, Zod, the DataProvider seam |
| Process | [PDC Development Constitution](./engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md) · [ADL-001 Decision Lifecycle](./engineering/ADL-001_ARCHITECTURAL_DECISION_LIFECYCLE.md) · [Composition Root](./engineering/COMPOSITION_ROOT.md) |
| Language | [UX-001 Teacher Language First](./engineering/UX-001_TEACHER_LANGUAGE_FIRST.md) · [UX-002 PRIMA Voice](./engineering/UX-002_PRIMA_VOICE_LANGUAGE.md) |
| System architecture | PAS-001 … PAS-006 · [Module/Package map](./engineering/PAS_MODULE_PACKAGE_MAP.md) |
| Engineering specs | ES-001 … ES-009 |
| Features | FEATURE-001 … FEATURE-008 |
| AI | [AI-001 Reasoning Pipeline](./engineering/AI-001_PRIMA_REASONING_PIPELINE.md) · AI-ADAPT-001 · ARCH-ADAPT-001 · IMPL-ADAPT-001 |
| Prompt framework (PPEF) | PPS-001/002/004/005/006 · [PVC-001 Validation Framework](./engineering/PVC-001_PROMPT_VALIDATION_FRAMEWORK.md) · catalogs under [`engineering/ppef/`](./engineering/ppef/) |

PVC-002 … PVC-005 were superseded by PVC-001 v2.0 and have been removed.

### Architecture Decision Records

| Location | Scope |
|---|---|
| [`engineering/ARCHITECTURE_DECISIONS.md`](./engineering/ARCHITECTURE_DECISIONS.md) | The current monorepo and runtime stack |
| [`architecture/adr/`](./architecture/adr/) | ADR-001 … ADR-008, the PRIMA Core freeze decisions. Historical — they describe the conceptual Core, not the shipped monorepo |
| [`engineering/adr/`](./engineering/adr/) | Legacy index and [template](./engineering/adr/TEMPLATE.md) for new engineering ADRs |

---

## Research (`research/`)

Non-normative development notes. Never a `Depends On` authority.

| File | Contents |
|---|---|
| [IDEAS](./research/IDEAS.md) | Exploratory concepts, not yet approved |
| [FUTURE_FEATURES](./research/FUTURE_FEATURES.md) | Approved for future development, not scheduled |
| [OPEN_QUESTIONS](./research/OPEN_QUESTIONS.md) | Unresolved decisions — LLM provider strategy, EU data residency, licensing model, dark mode priority |

---

## Conventions

- Every governed document carries a metadata header: status, version, owner, dependencies, last updated.
- Reserve a code in [`DOCUMENTATION_REGISTRY.md`](./DOCUMENTATION_REGISTRY.md) before writing a governed
  document. Approve it, then set the status.
- Never duplicate a definition. Link to the document that owns it.
- Documentation before implementation for anything constitutional or structural.

## Repository history note

This tree accumulated four generations of specification with nothing removed. In the cleanup accompanying
the monorepo refactor, 72 documents describing dead architectures were deleted: the LUDI ON platform
blueprint, the enterprise "Solution Architecture" stack (`product/solution/`), the G1 engine specifications
(`PRIMA_ENGINE`, `PRIMA_DECISION_ENGINE` and siblings), the G2 enterprise models, superseded design system
files, and point-in-time audits of a repository structure that no longer exists.

If a document is not linked from this page or the registry, check the registry before assuming it is live.
