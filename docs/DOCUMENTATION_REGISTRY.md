---
Status: Official — Document Registry
Code: DOC-002
Version: 1.2.0
Owner: LUDI ON Chief Software Architect / Documentation Architect
Depends On: DOC-001@^2.0.0
Last Updated: August 2026
Authority: Catalog of record for governed PRIMA documents. Contains no product definitions.
---

# PRIMA Document Registry

**Code:** DOC-002  
**Governed by:** [`PRIMA_DOCUMENTATION_ARCHITECTURE.md`](./PRIMA_DOCUMENTATION_ARCHITECTURE.md) (DOC-001 v2.0.0)

> This registry is an **index**, not a specification.  
> Normative meaning lives in the linked documents.  
> Engineering aliases: [`engineering/SPEC_INDEX.md`](./engineering/SPEC_INDEX.md).

---

## How to use

1. Reserve a code here as **Draft** before writing.  
2. Approve the document and set status to **Approved**.  
3. Never duplicate definitions into this file.

**Lifecycle:** Draft · Review · Approved · Deprecated · Archived · Historical  
(`Official` in legacy headers ≡ `Approved`.)

**Layers (DOC-001):** BIB(0) · CON(1) · CS(2) · FS(3) · UX(4) · TS(5) · API(6) · AT(7) · IT(8) · DN(9) · DOC(meta)

**Authority order:** Foundation Suite (`PRIMA-DOC-*`) → DOCUMENT-000 → layers above.

---

## Meta (DOC)

| Code | Alias | Title | Layer | Path | Status | Version | Owner |
|------|-------|-------|------:|------|--------|---------|-------|
| DOC-001 | — | PRIMA Documentation Architecture | DOC | [`PRIMA_DOCUMENTATION_ARCHITECTURE.md`](./PRIMA_DOCUMENTATION_ARCHITECTURE.md) | Approved | 2.0.0 | Documentation Architect |
| DOC-002 | — | PRIMA Document Registry | DOC | [`DOCUMENTATION_REGISTRY.md`](./DOCUMENTATION_REGISTRY.md) | Approved | 1.1.0 | Documentation Architect |

---

## Foundation Suite (PRIMA-DOC-000 … 006)

Supreme. Above every layer below, including DOCUMENT-000. Registered under native `PRIMA-DOC-*` codes;
these are not `DOC-*` meta codes and do not consume the DOC counter.

Read in the order given — later documents assume the vocabulary and constraints of earlier ones.
Suite membership, reading order and derivation rule are declared in
[`product/PRIMA_FOUNDATION_SUITE.md`](./product/PRIMA_FOUNDATION_SUITE.md).

**Conflict rule:** PRIMA-DOC-000 prevails on substance · within the Suite, earlier constrains later ·
lower specifications yield to the Suite on foundation questions · PRIMA-DOC-000-AP prevails on authorship
and amendment procedure.

| Order | Code | Title | Domain | Path | Status | Version |
|------:|------|-------|--------|------|--------|---------|
| — | PRIMA-FOUNDATION-SUITE | PRIMA Foundation Suite | Registry | [`product/PRIMA_FOUNDATION_SUITE.md`](./product/PRIMA_FOUNDATION_SUITE.md) | Approved | 1.0 |
| 1 | PRIMA-DOC-000 | The Founding Charter of PRIMA | Constitution | [`product/PRIMA-DOC-000_FOUNDING_CHARTER.md`](./product/PRIMA-DOC-000_FOUNDING_CHARTER.md) | Approved | 2.0 |
| 2 | PRIMA-DOC-001 | Product Vision & Strategic Direction | Strategy | [`product/PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md`](./product/PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md) | Approved | 1.0 |
| 3 | PRIMA-DOC-002 | Product Manifest | Product | [`product/PRIMA-DOC-002_PRODUCT_MANIFEST.md`](./product/PRIMA-DOC-002_PRODUCT_MANIFEST.md) | Approved | 1.0 |
| 4 | PRIMA-DOC-003 | Pedagogical Framework | Pedagogy | [`product/PRIMA-DOC-003_PEDAGOGICAL_FRAMEWORK.md`](./product/PRIMA-DOC-003_PEDAGOGICAL_FRAMEWORK.md) | Approved | 1.0 |
| 5 | PRIMA-DOC-004 | AI Constitution | Intelligence | [`product/PRIMA-DOC-004_AI_CONSTITUTION.md`](./product/PRIMA-DOC-004_AI_CONSTITUTION.md) | Approved | 1.0 |
| 6 | PRIMA-DOC-005 | UX Design Standards | Experience | [`product/PRIMA-DOC-005_UX_DESIGN_STANDARDS.md`](./product/PRIMA-DOC-005_UX_DESIGN_STANDARDS.md) | Approved | 1.0 |
| 7 | PRIMA-DOC-006 | Engineering Standards | Engineering | [`product/PRIMA-DOC-006_ENGINEERING_STANDARDS.md`](./product/PRIMA-DOC-006_ENGINEERING_STANDARDS.md) | Approved | 1.0 |
| — | PRIMA-DOC-000-AP | Authoring Protocol for the Founding Charter | Procedure | [`product/PRIMA-DOC-000-AP_AUTHORING_PROTOCOL.md`](./product/PRIMA-DOC-000-AP_AUTHORING_PROTOCOL.md) | Approved | 1.0 |

---

## Foundational Identity (DOCUMENT-000)

Below the Foundation Suite, above every numbered layer. Philosophical identity and voice; prevails on
purpose, ethics, teacher/AI role, language, and data — except where PRIMA-DOC-000 speaks.

| Code | Alias | Title | Path | Status |
|------|-------|-------|------|--------|
| DOCUMENT-000 | Manifesto | The PRIMA Manifesto | [`product/DOCUMENT-000_PRIMA_MANIFESTO.md`](./product/DOCUMENT-000_PRIMA_MANIFESTO.md) | Approved |

---

## Level 0 — Project Bible (BIB)

| Code | Alias | Title | Path | Status |
|------|-------|-------|------|--------|
| BIB-001 | Bible | LUDI ON Project Bible | [`product/LUDI_ON_PROJECT_BIBLE.md`](./product/LUDI_ON_PROJECT_BIBLE.md) | Approved |

---

## Level 1 — Constitution (CON)

| Code | Alias | Title | Path | Status |
|------|-------|-------|------|--------|
| CON-001 | DNA | PRIMA Product DNA | [`product/PRIMA_PRODUCT_DNA.md`](./product/PRIMA_PRODUCT_DNA.md) | Approved |
| CON-002 | AP | PRIMA Architectural Principles | [`product/PRIMA_ARCHITECTURAL_PRINCIPLES.md`](./product/PRIMA_ARCHITECTURAL_PRINCIPLES.md) | Approved |
| CON-003 | POSS | PRIMA Educational Operating System | [`product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md`](./product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md) | Approved |
| CON-004 | PDC | PRIMA Development Constitution | [`engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md`](./engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md) | Approved |

---

## Level 2 — Canonical Specifications (CS)

Full PAS/ES/PPEF alias tables: [`engineering/SPEC_INDEX.md`](./engineering/SPEC_INDEX.md).

| Code | Alias | Title | Path | Status |
|------|-------|-------|------|--------|
| CS-001 | CA | PRIMA Canonical Artifacts | [`product/PRIMA_CANONICAL_ARTIFACTS.md`](./product/PRIMA_CANONICAL_ARTIFACTS.md) | Approved |
| CS-002 | CL | Constitutional Language | [`product/PRIMA_CONSTITUTIONAL_LANGUAGE.md`](./product/PRIMA_CONSTITUTIONAL_LANGUAGE.md) | Approved |
| CS-003 | CM-001 | PRIMA Cognitive Model | [`product/PRIMA_COGNITIVE_MODEL.md`](./product/PRIMA_COGNITIVE_MODEL.md) | Approved |
| CS-004 | CEA | Constitutional Engine Architecture | [`product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md`](./product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md) | Approved |
| CS-005 | IB | Instructional Blueprint Specification | [`product/INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md`](./product/INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md) | Approved |
| CS-010 | PAS-001 | PRIMA System Architecture | [`engineering/PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md`](./engineering/PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md) | Approved |

---

## Levels 3–8 — FS / UX / TS / API / AT / IT

Rows are added as documents are authored under DOC-001.  
Until migrated, treat missions/blueprints as **IT/UX candidates** — register before treating them as Approved FS/UX.

| Code | Alias | Title | Layer | Path | Status |
|------|-------|-------|------:|------|--------|
| UX-DB-01 | DB-CH01 | Design Book Ch.1 — Creative Direction | UX | [`design/DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md`](./design/DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) | Approved |
| UX-DB-02 | DB-CH02 / PDL | Design Book Ch.2 — PRIMA Design Language | UX | [`design/DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md`](./design/DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) | Approved |
| UX-DB-03 | DB-CH03 / PDS | Design Book Ch.3 — Pedagogical Design System | UX | [`design/DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md`](./design/DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) | Approved |
| UX-DB-04 | DB-CH04 | Design Book Ch.4 — Experience Patterns | UX | [`design/DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md`](./design/DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) | Approved |
| UX-DB-05 | DB-CH05 | Design Book Ch.5 — Teacher Journeys | UX | [`design/DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md`](./design/DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) | Approved |
| UX-DB-06 | DB-CH06 | Design Book Ch.6 — Motion & Interaction System | UX | [`design/DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md`](./design/DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md) | Approved |
| UX-DB-07 | DB-CH07 | Design Book Ch.7 — Accessibility & Inclusive Design | UX | [`design/DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md`](./design/DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md) | Approved |
| UX-DB-08 | DB-CH08 | Design Book Ch.8 — Responsive & Adaptive Experience | UX | [`design/DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md`](./design/DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md) | Approved |
| UX-DB-09 | DB-CH09 / PAIM | Design Book Ch.9 — PRIMA AI Interaction Model | UX | [`design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md`](./design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md) | Approved |
| UX-DB-10 | DB-CH10 | Design Book Ch.10 — Product Blueprint & Screen Library | UX | [`design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md`](./design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) | Approved |
| UX-DB-11 | DB-CH11 | Design Book Ch.11 — Teacher Desk (HOME-001) | UX | [`design/DESIGN_BOOK_CH11_TEACHER_DESK.md`](./design/DESIGN_BOOK_CH11_TEACHER_DESK.md) | Approved |
| UX-DB-12 | DB-CH12 | Design Book Ch.12 — Lesson Design Studio (LESSON-001) | UX | [`design/DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md`](./design/DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md) | Approved |

TS engineering aliases continue via SPEC_INDEX (`ES-*`, `PPS-*`, `PVC-*`, …). Design Book aliases also in SPEC_INDEX.

---

## Level 9 — Development Notes (DN) — non-normative

| Area | Path | Note |
|------|------|------|
| Research | [`docs/research/`](./research/) | Ideas, future features, open questions. Never a `Depends On` authority |

`docs/session_logs/` was removed in the August 2026 documentation cleanup.

---

## Companion indexes (not second registries of meaning)

| Name | Path | Role |
|------|------|------|
| SPEC_INDEX | [`engineering/SPEC_INDEX.md`](./engineering/SPEC_INDEX.md) | Engineering alias companion |
| Documentation map | [`README.md`](./README.md) | Human entry point; mirrors this registry, defines nothing |
| ADR index | [`architecture/adr/README.md`](./architecture/adr/README.md) | Historical PRIMA Core freeze decisions |

INV-001 (`engineering/PRIMA_ARCHITECTURE_INVENTORY.md`) was removed in the August 2026 cleanup — it
inventoried a repository structure that no longer exists. The current structure is described in
[`../ARCHITECTURE.md`](../ARCHITECTURE.md) and
[`engineering/ARCHITECTURE_DECISIONS.md`](./engineering/ARCHITECTURE_DECISIONS.md).

---

## Removed from this registry (August 2026)

| Code | Document | Reason |
|------|----------|--------|
| INV-001 | PRIMA Architecture Inventory | Inventoried the pre-refactor tree; superseded by `ARCHITECTURE.md` |
| — | `docs/session_logs/` (DN area) | Directory deleted |

72 documents under `docs/` were deleted in the same pass, all describing dead architectures. Apart from
INV-001 above, none held a code in the tables of this registry.

---

## Next code counters

| Prefix | Next free |
|--------|-----------|
| PRIMA-DOC | 007 (Suite amendment requires Founding Council adoption under PRIMA-DOC-000-AP) |
| DOC | 003 |
| BIB | 002 |
| CON | 005 |
| CS | 006 (010+ PAS family mapping) |
| FS | 001 |
| UX | 001 |
| TS | 001 |
| API | 001 |
| AT | 001 |
| IT | 001 |
| DN | 001 |
