---
Status: Official — Document Registry
Code: DOC-002
Version: 1.1.0
Owner: LUDI ON Chief Software Architect / Documentation Architect
Depends On: DOC-001@^2.0.0
Last Updated: July 2026
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

---

## Meta (DOC)

| Code | Alias | Title | Layer | Path | Status | Version | Owner |
|------|-------|-------|------:|------|--------|---------|-------|
| DOC-001 | — | PRIMA Documentation Architecture | DOC | [`PRIMA_DOCUMENTATION_ARCHITECTURE.md`](./PRIMA_DOCUMENTATION_ARCHITECTURE.md) | Approved | 2.0.0 | Documentation Architect |
| DOC-002 | — | PRIMA Document Registry | DOC | [`DOCUMENTATION_REGISTRY.md`](./DOCUMENTATION_REGISTRY.md) | Approved | 1.1.0 | Documentation Architect |

---

## Foundational Identity (DOCUMENT-000)

Above all layers. Philosophical identity; prevails on purpose, ethics, teacher/AI role, language, and data.

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
| Session logs | `docs/session_logs/` | DN family; never `Depends On` authority |
| Research | `docs/research/` | Ideas only |

---

## Companion indexes (not second registries of meaning)

| Name | Path | Role |
|------|------|------|
| SPEC_INDEX | [`engineering/SPEC_INDEX.md`](./engineering/SPEC_INDEX.md) | Engineering alias companion |
| INV-001 | [`engineering/PRIMA_ARCHITECTURE_INVENTORY.md`](./engineering/PRIMA_ARCHITECTURE_INVENTORY.md) | Architecture inventory |

---

## Next code counters

| Prefix | Next free |
|--------|-----------|
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
