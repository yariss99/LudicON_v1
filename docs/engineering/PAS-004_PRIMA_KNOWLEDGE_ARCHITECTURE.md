---
Status: Official — Engineering Specification PAS-004
Version: 1.0
Owner: LUDI ON Chief Knowledge Architect
Depends On: PAS-001, PAS-002, PAS-003, POSS, ES-008, PRIMA_CONSTITUTIONAL_LANGUAGE.md, PRIMA_CONSTITUTIONAL_DOMAIN_MODEL.md, PRIMA_CONSTITUTIONAL_CAPABILITY_MODEL.md
Related Documents: ES-009, PAS-005_PRIMA_AI_ARCHITECTURE.md, PRIMA_KNOWLEDGE_MODEL.md, PRIMA_CONSTITUTIONAL_SERVICE_CONTRACT_MODEL.md, PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md, PDC, SPEC_INDEX.md, ADL-001
Extends: PAS-001, PAS-002, PAS-003
Last Updated: July 2026
---

# PAS-004 — PRIMA Knowledge Architecture (PKA)

# 1. Document Metadata

| Field | Value |
|-------|-------|
| **Title** | PRIMA Knowledge Architecture (PKA) |
| **Code** | PAS-004 |
| **Version** | 1.0 |
| **Status** | Official — Canonical / constitutional Knowledge Architecture of PRIMA |
| **Owner** | LUDI ON Chief Knowledge Architect |
| **Purpose** | Define how educational knowledge is represented, organized, versioned, interconnected, discovered, validated, reasoned about, and consumed by humans and AI — independent of storage technologies |
| **Repository Location** | `docs/engineering/PAS-004_PRIMA_KNOWLEDGE_ARCHITECTURE.md` |
| **Scope** | Conceptual Knowledge Layer; Knowledge Model; taxonomy; relationships; conceptual graph; lifecycle; governance; discovery; consumption; quality |
| **Out of scope** | Relational/vector/graph DB products; search engine vendors; file formats; HTTP APIs; LLM weights; Memory Domain internals; Generated Resources as Knowledge |

> PAS-004 **extends** PAS-001, PAS-002, and PAS-003.  
> PAS-004 is the **constitutional Knowledge Architecture**.  
> **ES-008** remains the Canonical Knowledge Model for EOS units, KD-* catalogs, and typed contracts; PAS-004 owns platform Knowledge Architecture consolidation for the PAS series. On unit identity conflict, **ES-008 + Constitutional Language** win for artifact identity; PAS-004 wins for architecture/governance consolidation.  
> **Hard separations:** Knowledge ≠ Memory ≠ Context ≠ Reasoning ≠ Generated Resources ≠ AI parametric weights.  
> Knowledge is **pull** (requested); never pedagogical push.  
> No implementation technology SHALL be normative in this specification.

---

# 2. Knowledge Vision

## 2.1 Purpose

Make educational substance **explicit, attributable, versioned, and reusable** so Teachers and EOS Engines can ground design in evidence rather than invention.

## 2.2 Knowledge Philosophy

Knowledge is **authority of educational meaning**, not a byproduct of model fluency. Models are workers; Knowledge Packs are curated authority. Unsupported Marks are first-class — silence is forbidden when evidence is missing.

## 2.3 Educational Mission

- Align design with curriculum and pedagogical integrity.  
- Enable explainable Strategies and Blueprints.  
- Preserve teacher trust through provenance.  
- Support Romanian curriculum reality first without locking architecture to one corpus format.

## 2.4 AI Knowledge Strategy

| Rule | Statement |
|------|-----------|
| **Consume** | AI workers MAY consume Knowledge Packages as evidence |
| **Propose** | AI MAY propose Generated-candidate Objects |
| **Never redefine** | AI MUST NOT redefine published Knowledge authority |
| **Never invent silently** | Missing evidence ⇒ Unsupported Mark, not hallucinated Knowledge |
| **Never Approve** | Knowledge consumption never grants Teacher Approval |

## 2.5 Knowledge Lifecycle (vision)

Import/Create → Validate → Review → Publish → Consume (Package assembly) → Revise (new Version) → Deprecate → Archive/Retire — with governance at every state transition.

---

# 3. Knowledge Architecture Principles

### KAP-01 — Knowledge before Data

| Field | Content |
|-------|---------|
| **Purpose** | Meaning precedes storage shape |
| **Architectural Consequences** | Knowledge Model is defined before persistence Ports; schemas serve the model |

### KAP-02 — Knowledge is Explicit

| Field | Content |
|-------|---------|
| **Purpose** | Educational claims are named Objects, not buried prose |
| **Architectural Consequences** | Implicit “what the model knows” is not Knowledge |

### KAP-03 — Knowledge is Versioned

| Field | Content |
|-------|---------|
| **Purpose** | Every Active use pins identifiable Versions |
| **Architectural Consequences** | Packs/Objects carry immutable Version identities; edits mint new Versions |

### KAP-04 — Knowledge is Traceable

| Field | Content |
|-------|---------|
| **Purpose** | Every claim cites Provenance |
| **Architectural Consequences** | Provenance Record mandatory for Authoritative/Derived trust |

### KAP-05 — Knowledge is Explainable

| Field | Content |
|-------|---------|
| **Purpose** | Teachers can understand why evidence was used |
| **Architectural Consequences** | Packages expose Object/Pack Version citations to design rationale |

### KAP-06 — Knowledge is Reusable

| Field | Content |
|-------|---------|
| **Purpose** | Same Objects serve many cognitive acts |
| **Architectural Consequences** | Packs are corpus releases; Packages are act-scoped assemblies |

### KAP-07 — Knowledge is Composable

| Field | Content |
|-------|---------|
| **Purpose** | Objects combine via explicit Relationships |
| **Architectural Consequences** | Composition is Relationship-mediated, not copy-paste mutation |

### KAP-08 — Knowledge is Domain Owned

| Field | Content |
|-------|---------|
| **Purpose** | Business ownership is singular (PAS-002 Knowledge Domain / SVC-04) |
| **Architectural Consequences** | Other Domains reference by ID; they do not own Knowledge write models |

### KAP-09 — Knowledge is AI Consumable

| Field | Content |
|-------|---------|
| **Purpose** | Structured, typed evidence for Engines/workers |
| **Architectural Consequences** | Machine-readable metadata + human-readable statements; pull APIs only |

### KAP-10 — Knowledge ≠ Memory / Context / Resources

| Field | Content |
|-------|---------|
| **Purpose** | Prevent category collapse |
| **Architectural Consequences** | Memory writes forbidden into Knowledge; Generated Resources are not Knowledge Objects; Context binds situation, does not publish Packs |

### KAP-11 — Fail Visible on Absence

| Field | Content |
|-------|---------|
| **Purpose** | Preserve integrity when evidence missing |
| **Architectural Consequences** | Unsupported Mark required; silent invention forbidden |

### KAP-12 — Technology Independence

| Field | Content |
|-------|---------|
| **Purpose** | Architecture outlives stores and indexes |
| **Architectural Consequences** | No normative vector/graph/relational/search vendor requirements |

---

# 4. Knowledge Model

## 4.1 Core concepts (formal)

| Concept | Formal definition |
|---------|-------------------|
| **Knowledge Object** | Atomic, durable, attributable educational unit with identity, Version, Provenance, Type, and State |
| **Knowledge Type** | Classifying kind of Object (curriculum node, pedagogical pattern, assessment design knowledge, etc.) within a KD-* Knowledge Domain |
| **Knowledge Collection** | Named grouping of Objects for curation; realized primarily as **Knowledge Pack** (versioned curated release) |
| **Knowledge Relationship** | Explicit typed edge between Objects/Packs with semantics, cardinality, and ownership |
| **Knowledge Metadata** | Descriptive attributes (title, locale, audience, trust level, tags, KD domain) that do not replace Provenance |
| **Knowledge Version** | Immutable identity of an Object or Pack content revision; Active consumption pins Versions |
| **Knowledge Owner** | Stewardship role + owning Bounded Context (**Knowledge** / SVC-04); not the consuming Teacher |
| **Knowledge State** | Lifecycle state of Object/Pack (see §8) |
| **Knowledge Provenance** | Record citing source system/document, steward, import path, and Version lineage |
| **Knowledge Context** | Situational binding under which a **Knowledge Package** is assembled for one cognitive act — not a Pack |

## 4.2 Constitutional triad (normative)

| Unit | Kind | Meaning |
|------|------|---------|
| **Knowledge Object** | Durable entity | Atomic attributable claim or curriculum node |
| **Knowledge Pack** | Durable aggregate | Versioned curated release of Objects |
| **Knowledge Package** | Ephemeral value | Assembled evidence slice for one cognitive act |

## 4.3 Trust levels

| Level | Meaning |
|-------|---------|
| **Authoritative** | Curated, published, provenance-complete |
| **Derived** | Computed from Authoritative with lineage |
| **Advisory** | Useful, non-binding |
| **Generated-candidate** | AI-proposed; not Knowledge until curated Publish |
| **Untrusted** | Quarantined import pending validation |

## 4.4 Knowledge Domains (KD-*)

Architecture adopts ES-008 KD-01…KD-15 catalog (Curriculum, Pedagogical, Assessment Knowledge, Methodological, Institutional, Legal, Resource Knowledge patterns, etc.). Student Knowledge remains Future/inactive. Teacher personal craft is Memory unless curated into shared Packs.

---

# 5. Knowledge Object Taxonomy

Informal catalog names are **evaluated** and mapped to Official Types. Forbidden aliases MUST NOT become Object identities.

| Candidate | Verdict | Purpose | Owner Domain | Lifecycle | Relationships | Metadata |
|-----------|---------|---------|--------------|-----------|---------------|----------|
| Lesson | **Map** → Curriculum/Learning design knowledge nodes; not Generated lesson Resource | Represent lesson-scoped curriculum/pedagogy claims | Knowledge (KD-01/02) | Pack lifecycle | PartOf curriculum; Supports objectives | Locale, grade, subject |
| Learning Scenario | **Reject name** → Pedagogical / Blueprint-pattern knowledge | Scenario forbidden as Official Name | Knowledge (KD-02) | Pack lifecycle | Implements methodology | Pattern family |
| Activity | **Map** → Activity pattern knowledge (KD-02/07) | Reusable activity patterns | Knowledge | Pack lifecycle | Supports Strategy; RelatedTo competency | Duration class, modality |
| Assessment | **Split** → Assessment **design knowledge** (KD-03) ≠ Assessment Resource (Generation) | Rubrics, item patterns, criteria knowledge | Knowledge | Pack lifecycle | Evaluates competency; Requires rubric | Trust Authoritative/Advisory |
| Rubric | **Keep** as Assessment Knowledge Object Type | Scoring/criteria knowledge | Knowledge (KD-03) | Pack lifecycle | Evaluates; Supports Assessment Design | Scale, criteria |
| Competency | **Keep** (KD-01) | Competency/standard nodes | Knowledge | Pack lifecycle | Requires prerequisites; PartOf curriculum | Standard codes |
| Curriculum Element | **Keep** (KD-01) | Subjects, objectives, units | Knowledge | Pack lifecycle | Contains; AlignsTo standards | Curriculum year |
| Learning Resource | **Reject as Knowledge** if instance Resource | Instance Resources ∈ Generation; **Resource Knowledge** = patterns only (KD-07) | Knowledge (patterns) / Generation (instances) | Distinct | Patterns Supports Generation | Pattern vs instance flag |
| Digital Asset | **Not Knowledge** by default | Binary assets are Infrastructure/Content | Content/Infra | Asset lifecycle | References from Resources | MIME, license |
| Prompt Template | **PPEF / Platform Knowledge (KD-14)** when curated | Prompt engineering artifacts ≠ curriculum | System Governance + PPEF / Knowledge meta | PPEF + Pack rules | References PAS/PPS | PPEF ids |
| AI Strategy | **Reject as Knowledge authority** | Instructional Strategy is Design Aggregate; AI worker catalogs = KD-12 non-curriculum | Instructional Design / KD-12 | Separate | — | Capability catalogs |
| Methodology | **Keep** (KD-04) | Methodological frameworks | Knowledge | Pack lifecycle | Implements; Supports pedagogy | Framework id |
| Pedagogical Pattern | **Keep** (KD-02) | Reusable pedagogical structures | Knowledge | Pack lifecycle | Extends; RelatedTo techniques | Pattern id |
| Teaching Technique | **Keep** (KD-02/04) | Techniques under patterns | Knowledge | Pack lifecycle | PartOf pattern | Audience |
| Observation | **Not Pack Knowledge** by default | Classroom observation → Reflection/Future CAP-F09 | Teacher Interaction / Future | Interaction records | May DerivedFrom evidence | Privacy class |
| Reflection | **Not Knowledge** | ReflectionRecord ∈ Reflection Service | Teacher Interaction | Non-blocking | May Propose Memory | — |
| Feedback | **Not Knowledge** | Teacher/learner feedback ≠ Pack | TI / Future LX | — | — | — |
| Evidence | **Keep as Provenance / Package contents** | Citations inside Packages | Knowledge | Act-scoped / Pack | DerivedFrom sources | Provenance Record |
| Best Practice | **Keep** as Advisory Pedagogical/Methodological Object | Non-binding guidance | Knowledge | Pack lifecycle | Advisory trust | Scope |

**Rule:** Taxonomy Types live inside Knowledge Objects; they do not create parallel Domains outside PAS-002 Knowledge.

---

# 6. Knowledge Relationships

| Relationship | Semantics | Cardinality | Ownership | Lifecycle |
|--------------|-----------|-------------|-----------|-----------|
| **Contains** | Pack/Collection includes Object | 1..* Objects per Pack Version | Knowledge Pack owner | Bound to Pack Version |
| **Depends On** | Object requires another for validity | 0..* | Declared on dependent | Validated at Publish |
| **References** | Soft citation without hard dependency | 0..* | Citing Object | May survive target Deprecate with warning |
| **Implements** | Pattern/technique realizes a methodology | 0..* | Implementing Object | Publish-time check |
| **Evaluates** | Assessment knowledge evaluates competency/objective | 0..* | Assessment Knowledge Object | Publish-time check |
| **Extends** | Specialization of another Object | 0..1 parent preferred | Child Object | Acyclic |
| **Generates** | **Forbidden** as Knowledge→Resource authority edge | — | — | Resources Generated under Approval, not by Knowledge |
| **Supports** | Advises design/strategy without mandating | 0..* | Supporting Object | Advisory OK |
| **Requires** | Hard prerequisite | 0..* | Dependent | Blocks Publish if missing Authoritative target |
| **Derived From** | Derived trust lineage | 1..* sources | Derived Object | Mandatory Provenance |
| **Related To** | Associative non-hierarchical | 0..* | Either; recorded once | Weak |
| **Equivalent To** | Same meaning alternate coding | 0..* | Stewardship | Sync on Deprecate |
| **Supersedes** | Newer Version/Object replaces older | 1 superseded | Successor | Prior Archived/Deprecated |

**Rules:** Relationships are explicit; inference may suggest candidates but MUST NOT silently invent Published edges. Cycles in Depends On / Extends / Requires SHALL Fail validation.

---

# 7. Knowledge Graph

Conceptual graph only — **no** graph database product implied.

## 7.1 Nodes

Knowledge Objects, Knowledge Packs (as release nodes), Competency/Curriculum nodes, Pattern nodes, Provenance anchors, Unsupported Marks (as explicit absence nodes in Packages).

## 7.2 Edges

Typed Relationships (§6) plus Pack membership Contains edges.

## 7.3 Inference Rules (logical)

- If A Requires B and B SupersededBy C (Authoritative), resolve to C with lineage note.  
- Derived Objects inherit restricted trust ≤ source trust.  
- Missing Required target ⇒ validation Fail or Unsupported Mark in Package assembly.  
- AI proposals create Generated-candidate nodes only — not Authoritative edges.

## 7.4 Traversal Rules

- Traversal is read-only relative to Published Versions.  
- Package assembly traverses from Context seeds (subject, competency, intent hints) within Pack allow-lists.  
- Depth/budget limits are policy — not storage concerns.

## 7.5 Reasoning Support

Knowledge supports Instructional Design and Validation reasoning by providing attributable evidence; Knowledge Graph does **not** itself decide Strategy or Approval.

## 7.6 Knowledge Discovery

Navigation and search operate over Published Packs/Objects (§10); discovery never mutates graph.

## 7.7 Impact Analysis

Supersede/Deprecate SHALL enumerate dependents (Depends On, Requires, Derived From) before state change.

## 7.8 Dependency Analysis

Publish validates Depends On / Requires closure within declared trust.

## 7.9 Learning Path Discovery

Path suggestions are Derived/Advisory projections over Competency Requires/Supports edges; runtime learner paths are Future BC-LX — not Knowledge Authority.

## 7.10 Explainability

Every Package SHALL list Object/Pack Versions and Relationships used; Teachers receive human-readable citations via Design rationale surfaces.

---

# 8. Knowledge Lifecycle

| Stage | Purpose | Owner |
|-------|---------|-------|
| **Creation** | Author or import Object/Pack draft | Knowledge stewards / importers (SVC-04) |
| **Review** | Pedagogical/curriculum review | Stewards + optional pedagogy reviewers |
| **Approval** | Governance approve to Publish (≠ Teacher Approval of Blueprints) | Knowledge Governance / SVC-11 policy + SVC-04 publish right |
| **Publication** | State → Published; searchable/consumable | SVC-04 |
| **Consumption** | Assemble Knowledge Package for cognitive act | ENG-02 / SVC-04 pull; consumers SVC-02/03/05 |
| **Revision** | Prepare next Version from Published | Stewards |
| **Versioning** | Mint immutable Version identities | SVC-04 |
| **Archiving** | Remove from default discovery; retain lineage | SVC-04 |
| **Retirement** | Terminal; no new consumption | SVC-04 + Governance audit |

**Quarantine:** External/plugin imports enter Untrusted until Publish after validation (ES-009 alignment).

**Teacher Approval** of Blueprints is **not** a Knowledge lifecycle stage.

---

# 9. Knowledge Governance

| Concern | Rule |
|---------|------|
| **Ownership** | Write ownership = Knowledge Domain (PAS-002) / SVC-04; stewards assigned per Pack |
| **Validation** | Provenance, relationship acyclicity, trust rules, KD constraints before Publish |
| **Review** | Human review for Authoritative Packs; Advisory may use lighter review if declared |
| **Approval** | Publish authorization under Governance policy — distinct from Teacher Approval |
| **Quality Assurance** | Quality attributes (§12) measured per Pack Version |
| **Version Control** | Immutable Versions; Supersedes links; no silent overwrite |
| **Traceability** | Provenance + Package citations + audit Events |
| **Auditability** | Publish/Deprecate/Retire audited via SVC-11 |

---

# 10. Knowledge Discovery

| Mode | Description |
|------|-------------|
| **Navigation** | Browse KD domains, Packs, Collections, hierarchy Contains |
| **Search** | Lexical search over Published metadata and statements |
| **Semantic Search** | Meaning-similarity retrieval via optional logical Port — technology-agnostic |
| **Recommendation** | Ranked hits for Context seeds — never auto-Apply as Strategy |
| **Similarity** | Related To / Equivalent To exploration |
| **Dependency Navigation** | Walk Requires / Depends On / Derived From |
| **Knowledge Exploration** | Steward tooling for graph inspection |
| **Contextual Discovery** | Package assembly constrained by Working Context dimensions |

Discovery NEVER publishes Packs and NEVER writes Memory.

---

# 11. Knowledge Consumption

| Consumer | How Knowledge is consumed |
|----------|---------------------------|
| **Teacher** | Sees citations/explanations in design rationale; does not manage Pack internals in MVP |
| **Student** | Future via authorized Learning Experiences — not direct Pack authority |
| **Parent** | Mediated Future — no Pack write |
| **Administrator** | Governance/config; may steward institutional Packs; cannot forge Teacher Approval |
| **AI Assistant / AI Agents** | Pull Packages/evidence as workers; Generated-candidate only until curated |
| **Reasoning Engine** | Conceptual: Design/Strategy Engines consume Packages — not redefine Knowledge |
| **Learning Engine** | Future learner runtime may consume Derived paths — under Authorization chain |
| **Analytics** | May consume Aggregated usage metadata — not alter Authoritative content |

**Primary Active consumers:** SVC-02 Design Session, SVC-03 Learning Experience Design, SVC-05 Validation — via SVC-04 / ENG-02 pull.

---

# 12. Knowledge Quality

| Attribute | Measure (logical) |
|-----------|-------------------|
| **Completeness** | Required metadata + Provenance present for trust level |
| **Consistency** | No conflicting Authoritative claims without Supersedes/Conflict mark |
| **Correctness** | Steward-validated alignment to declared source |
| **Traceability** | 100% Authoritative Objects with Provenance Records |
| **Reusability** | Objects referenced by ≥1 Package/Pack membership over window |
| **Explainability** | Packages expose citation lists usable in Teacher rationale |
| **Maintainability** | Impact analysis possible for Deprecate |
| **Freshness** | Age since Publish vs curriculum epoch policy |
| **Coverage** | Competency/curriculum nodes with supporting Objects per scope |

Quality metrics MUST NOT override Fail Visible Unsupported Marks.

---

# 13. Repository Mapping

Conceptual knowledge artefacts map to ES-001 foundation:

| Path | Role |
|------|------|
| **knowledge/** | Materialized Knowledge Packs/corpus when present — Knowledge Domain owned |
| **knowledge-objects/** | Object definitions within Packs / contracts types (`PrimaKnowledge*`) |
| **knowledge-graph/** | Conceptual relationship declarations / exportable graph snapshots (format non-normative) |
| **knowledge-patterns/** | Pedagogical/methodological pattern Packs (KD-02/04/07) |
| **knowledge-governance/** | Publish policies, steward lists, audit references |
| **knowledge-registry/** | Index of Pack Versions, trust, KD domain, lifecycle state |

Specs: this file (PAS-004) + ES-008 (model) + ES-009 (engine behaviour). Code: `packages/engines/knowledge`, `packages/contracts` Knowledge types.

---

# 14. Compliance Rules

| ID | Rule |
|----|------|
| **PKA-C01** | Every Knowledge Object SHALL have exactly one owner Domain (Knowledge). |
| **PKA-C02** | Every Knowledge Object and Pack SHALL be versioned. |
| **PKA-C03** | Every Authoritative Knowledge Object SHALL define Provenance. |
| **PKA-C04** | Knowledge SHALL remain independent from storage technology. |
| **PKA-C05** | Knowledge Relationships SHALL be explicit. |
| **PKA-C06** | Knowledge SHALL be explainable to Teachers via citations. |
| **PKA-C07** | Knowledge SHALL support AI reasoning as evidence only. |
| **PKA-C08** | Knowledge SHALL support human understanding. |
| **PKA-C09** | Knowledge ≠ Memory ≠ Context ≠ Generated Resources. |
| **PKA-C10** | AI MUST NOT redefine Published Knowledge authority. |
| **PKA-C11** | Missing evidence SHALL yield Unsupported Mark — not silent invention. |
| **PKA-C12** | Knowledge Package SHALL be act-scoped and ephemeral relative to Packs. |
| **PKA-C13** | Knowledge Pack SHALL be the curated release aggregate. |
| **PKA-C14** | “Scenario” MUST NOT be an Official Knowledge Object identity. |
| **PKA-C15** | Instance Learning Resources MUST NOT be classified as Knowledge Objects. |
| **PKA-C16** | Assessment instance scores MUST NOT live in Knowledge Packs. |
| **PKA-C17** | Publish Approval ≠ Teacher Approval of Blueprints. |
| **PKA-C18** | Cyclic Depends On / Requires / Extends SHALL Fail validation. |
| **PKA-C19** | Generated-candidate Objects SHALL NOT be searchable as Authoritative. |
| **PKA-C20** | External imports SHALL quarantine as Untrusted until Publish. |
| **PKA-C21** | Cross-domain consumers SHALL reference Knowledge by ID/Version only. |
| **PKA-C22** | SVC-04 / ENG-02 SHALL be pull-based — no pedagogical push. |
| **PKA-C23** | Memory Service SHALL NOT write Knowledge. |
| **PKA-C24** | Discovery SHALL NOT mutate Published content. |
| **PKA-C25** | Supersede/Deprecate SHALL perform impact analysis. |
| **PKA-C26** | Trust level SHALL be declared per Pack/Object. |
| **PKA-C27** | Derived Knowledge SHALL retain lineage via Derived From. |
| **PKA-C28** | PAS-004 SHALL extend PAS-001, PAS-002, and PAS-003. |
| **PKA-C29** | KD-* domain catalog SHALL align with ES-008. |
| **PKA-C30** | Prompt Templates as Knowledge SHALL follow PPEF + KD-14 rules when curated. |
| **PKA-C31** | Learning Path Discovery projections are Advisory unless constitutionally elevated. |
| **PKA-C32** | Quality metrics MUST NOT override integrity Fails. |
| **PKA-C33** | Archived/Retired Versions MUST remain lineage-resolvable. |
| **PKA-C34** | PAS-005+ specs consuming Knowledge Architecture SHALL reference PAS-004. |
| **PKA-C35** | On conflict with informal knowledge lists, Official Model (§4) and Taxonomy verdicts (§5) win. |

---

# 15. Dependencies

| Relation | Targets |
|----------|---------|
| **Requires** | PAS-001; PAS-002; PAS-003; POSS; ES-008; Constitutional Language; Constitutional Domain Model |
| **Required By** | PAS-005; PAS-006; PAS-007; Knowledge-consuming PAS/ES specs; ENG-02 conformance interpretations |
| **Supersedes** | Informal knowledge architectures that treat model weights or Generated Resources as Knowledge authority |
| **Superseded By** | None |
| **Extends** | PAS-001; PAS-002; PAS-003 |

---

# 16. Quality Checklist

| Check | Status |
|-------|--------|
| Knowledge philosophy defined | ✓ |
| Knowledge model complete | ✓ |
| Object taxonomy complete | ✓ |
| Relationships defined | ✓ |
| Knowledge graph specified | ✓ |
| Lifecycle complete | ✓ |
| Governance defined | ✓ |
| Discovery defined | ✓ |
| Consumption defined | ✓ |
| Quality metrics complete | ✓ |
| Repository mapping complete | ✓ |
| Compliance rules complete (PKA-C01…C35) | ✓ |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PAS-004 |
| **Title** | PRIMA Knowledge Architecture (PKA) |
| **Version** | 1.0 |
| **Status** | Official — Constitutional |
| **Location** | `docs/engineering/PAS-004_PRIMA_KNOWLEDGE_ARCHITECTURE.md` |
| **Authority** | Canonical Knowledge Architecture for PRIMA; extends PAS-001…003; aligns ES-008/ES-009 |
