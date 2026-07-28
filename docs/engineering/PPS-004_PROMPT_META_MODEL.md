---
Status: Official — Engineering Specification PPS-004
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PPS-001, PPS-002, PAP-004, ADL-001, PDC, SPEC_INDEX.md
Related Documents: INV-001, RIM-001
Last Updated: July 2026
---

# PPS-004 — Prompt Meta Model (PMM)

**Code:** PPS-004  
**Title:** Prompt Meta Model (PMM)  
**Version:** 1.0  
**Status:** Official — Canonical conceptual model for PPEF prompts  
**Framework:** PRIMA Prompt Engineering Framework (PPEF)

> PMM defines **WHAT a prompt IS** as a first-class engineering object.  
> PPS-001 defines **HOW prompts are written** (structure and quality).  
> PPS-002 defines **reusable patterns** for constructing prompts.  
> PAP-004 defines **reasoning phases** before architectural generation.  
> PMM does **not** redesign PRIMA architecture.

**Precedence within PPEF**

| Layer | Authority |
|-------|-----------|
| **PPS-004 PMM** | Conceptual identity, components, relationships, taxonomy, invariants |
| PPS-001 | Writing standard, validation before execution, SemVer for prompt files |
| PPS-002 APPL | Pattern selection and composition |
| PAP-004 ATP | Reasoning protocol for architectural deliverables |
| ADL-001 | ADR lifecycle when architecture-affecting |

Conflict on *identity/semantics of Prompt* → **PPS-004 prevails**.  
Conflict on *section layout of a prompt file* → **PPS-001 prevails**.

---

# 1. Purpose

The Prompt Meta Model (PMM) is the **highest abstraction layer** for all architectural prompt definitions in PPEF.

PMM SHALL:

1. Establish **Prompt** as a first-class architectural / engineering object.  
2. Define mandatory **identity, components, relationships, lifecycle, taxonomy, and attributes**.  
3. Provide a stable conceptual foundation so future prompt families inherit without breaking existing prompts.  
4. Enable traceability from Prompt Object → repository artifact → deliverable → validation.  

PMM SHALL NOT prescribe prose templates (PPS-001) or pattern catalogs (PPS-002) beyond conceptual mapping.

---

# 2. Meta Object Definition

## 2.1 Prompt as Engineering Artifact

A **Prompt** is an Engineering Artifact that encodes an executable architectural or engineering instruction set whose execution produces a declared primary deliverable under PPEF governance.

A Prompt is **not**:

- an Engineering Specification (ES)  
- an ADR  
- a Cognitive Object (CO-\*)  
- a runtime module  
- a Teacher-facing classroom generation instruction  

Those may be **Generated** or **Referenced** by a Prompt; they are not the Prompt object itself.

## 2.2 Mandatory identity

Every Prompt Object SHALL carry:

| Identity field | Semantics |
|----------------|-----------|
| **Identifier** | Globally unique PPEF id (e.g. `PAP-004`, `APP-012`, `PPS-001`) |
| **Name** | Human-readable stable name |
| **Version** | SemVer per PPS-001 §12 |
| **Status** | Lifecycle state per §5 |
| **Owner** | Exactly one accountable owner role or named steward (CSA default for architectural prompts) |
| **Lifecycle** | Binding to the Prompt Lifecycle Model (§5); one lifecycle instance per Prompt Object |

**Identity invariant:** Identifier + Version uniquely identify an immutable published revision; Status transitions do not alone change Version (PPS-001).

---

# 3. Prompt Components

Every Prompt Object SHALL include the following conceptual components. Each has formal semantics independent of file formatting.

| Component | Semantic definition |
|-----------|---------------------|
| **Context** | The bounded set of approved specifications, repository state facts, implementation statuses, confirmed assumptions, and explicit unknowns that frame valid execution |
| **Intent** | The architectural or engineering purpose the Prompt exists to achieve; maps to a single primary deliverable type |
| **Constraints** | Hard limits on mutation: immutables, protected terminology, compatibility, repository conventions, implementation limitations |
| **Reasoning Scope** | The mandatory cognitive/process envelope (e.g. PAP-004 phases; APPL primary pattern; ADR requirement) that MUST precede or bound Generation |
| **Execution Rules** | Normative rules governing how an executor SHALL behave during Generation (determinism, no invention, role limits) |
| **Deliverable** | The single primary Engineering Artifact (or declared set with one primary) the Prompt is authorized to produce |
| **Validation** | Pre-execution and post-generation checks that MUST Pass (PPS-V\*, APPL-V\*, ATP Phase 7, tests) |
| **Acceptance** | Objective, independently verifiable conditions under which execution is complete and compliant |
| **Repository Impact** | The set of repository paths, indexes, and modules that SHALL be created or updated |
| **Dependencies** | Other Prompt Objects and non-prompt authorities required for valid Context |

**Mapping note:** PPS-001 §4 sections are the **serialization** of these components into a prompt file. PMM components remain authoritative if serialization labels differ cosmetically.

---

# 4. Prompt Relationships

Relationships are directed edges between Prompt Objects (unless noted). Lifecycle behaviour applies to the **source** unless stated.

| Relationship | Direction | Meaning | Lifecycle behaviour |
|--------------|-----------|---------|---------------------|
| **Depends On** | A → B | A requires B’s Active (or Certified) revision for Context integrity | A MUST NOT become Active if B is Deprecated/Archived without migration |
| **Extends** | A → B | A specializes B without replacing B’s Identifier | A inherits B’s constraints unless explicitly narrowed; B remains valid |
| **Implements** | A → B | A is an executable prompt realizing pattern/standard/protocol B | A MUST declare B in Dependencies; B Certified/Active required |
| **Supersedes** | A → B | A replaces B as current authority for the same Intent family | B SHALL transition toward Deprecated then Archived; new executions MUST use A |
| **Requires** | A → B | Execution of A is illegal unless B has produced its deliverable or is satisfied | Stronger than Depends On: runtime precondition |
| **Conflicts With** | A ↔ B | A and B MUST NOT both be Active for the same Intent scope | CSA MUST resolve before either is Active |
| **References** | A → B | Informational citation; no lifecycle coupling | MAY reference Deprecated for history |
| **Generates** | A → X | A’s Deliverable type is artifact class X (spec, ADR, …); X need not be a Prompt | Does not create ownership of X’s later lifecycle |

**Rule:** Relationship graphs among Prompts SHOULD be acyclic for Depends On / Extends / Implements / Requires. Cycles MUST be broken before Active.

---

# 5. Prompt Lifecycle Model

```
Draft → Review → Approved → Active → Deprecated → Archived
```

| State | Meaning |
|-------|---------|
| **Draft** | Identity exists; components incomplete |
| **Review** | Complete for compliance review |
| **Approved** | Authorized; not yet released for general execution |
| **Active** | Executable for repository-producing runs |
| **Deprecated** | Superseded or withdrawn; MUST NOT be newly executed |
| **Archived** | Historical only |

## 5.1 Transition criteria

| Transition | SHALL satisfy |
|------------|---------------|
| Draft → Review | Identity complete; all §3 components present; PPS-001 structure if file-serialized |
| Review → Approved | PPS-V01…V10 Pass; owner assigned; no Conflicts With unresolved; CSA approval (PO if Teacher Authority / strategic) |
| Approved → Active | Registry entry; SPEC_INDEX/ppef registry updated when family-level; executor guidance available |
| Active → Deprecated | Supersedes target named OR obsolescence recorded; dependents notified via Depends On scan |
| Deprecated → Archived | No Active prompt Requires/Depends On this Prompt without migration; archive date set |

**Illegal:** Draft → Active; Active → Archived without Deprecated; execution of Draft/Review/Deprecated/Archived for production commits.

---

# 6. Prompt Taxonomy

Every Prompt Object SHALL declare exactly one **primary taxonomy class**. Future classes MAY be added under §10.

| Class | Code | Meaning |
|-------|------|---------|
| **Standard** | TAX-STD | Defines normative PPEF/engineering standards (e.g. PPS-001) |
| **Protocol** | TAX-PRO | Defines mandatory process/reasoning protocols (e.g. PAP-004) |
| **Pattern** | TAX-PAT | Defines reusable APPL patterns (PPS-002 catalog members) |
| **Template** | TAX-TPL | Skeleton for instantiating prompts or ADRs |
| **Specification Prompt** | TAX-ESP | Produces or amends ES / engineering specs |
| **Governance Prompt** | TAX-GOV | Produces governance artifacts (ADL, AGR follow-ups, ownership) |
| **Validation Prompt** | TAX-VAL | Produces verification/compliance results |
| **Migration Prompt** | TAX-MIG | Produces migration plans or controlled evolution |
| **Review Prompt** | TAX-REV | Produces read-only architectural analysis |
| **Future** | TAX-\* | Registered extension classes |

**Related:** PPS-001 PC-\* categories classify *purpose domain*; taxonomy classifies *object kind*. Both SHALL be present on serialized prompts (category + taxonomy).

---

# 7. Prompt Attributes

Every Prompt Object SHALL declare:

| Attribute | Scale / meaning |
|-----------|-----------------|
| **Complexity** | Low · Medium · High — structural span of Context and Deliverable |
| **Criticality** | C1 Platform · C2 Pipeline · C3 Enabling · C4 Supporting (align RIM) |
| **Determinism** | Full · Conditional — Full = same inputs imply same deliverable shape; Conditional requires listed branches |
| **Repository Scope** | Single-path · Multi-path · Cross-cutting (indexes + multiple packages) |
| **Execution Cost** | Low · Medium · High — expected agent/compute effort |
| **Reuse Potential** | Unique · Reusable · Patternized — Patternized implies Implements TAX-PAT |
| **Certification Level** | None · Approved · Certified — Certified = mandatory catalog / constitutional |
| **Stability** | S1 Stable · S2 Evolving · S3 Unstable · S4 Experimental |

---

# 8. Repository Mapping

| Prompt Meta Object | Typical repository artifact |
|--------------------|----------------------------|
| Prompt Object (serialized) | `docs/engineering/ppef/{pap\|app}/*.md` or `docs/engineering/Pxx-*.md` |
| TAX-STD / TAX-PRO | `docs/engineering/PPS-*.md`, `PAP-*.md` |
| TAX-PAT | PPS-002 §4 + `ppef/registry.md` |
| TAX-TPL | `docs/engineering/adr/TEMPLATE.md`, future `ppef/templates/` |
| Registry of Prompt Objects | `docs/engineering/ppef/registry.md` |
| Index | SPEC_INDEX.md · ppef/README.md |
| Generates → ES | `docs/engineering/ES-*.md` |
| Generates → ADR | `docs/engineering/adr/ADR-*.md` |
| Generates → Contract | `packages/contracts/src/*.ts` |
| Generates → Test | `packages/*/tests` or `src/tests` |
| Attributes / relationships | Front matter + registry columns |

**Rule:** A Prompt Object without registry listing MUST NOT be Active.

---

# 9. Meta Constraints (Invariants)

| ID | Invariant |
|----|-----------|
| **PMM-I01** | Every Prompt SHALL have exactly one Owner. |
| **PMM-I02** | Every Prompt SHALL have exactly one Lifecycle instance (§5). |
| **PMM-I03** | Every Prompt SHALL produce exactly one **primary** Deliverable (additional secondary artifacts MAY be listed under Repository Impact). |
| **PMM-I04** | Every Prompt SHALL be traceable: Identifier → registry → Dependencies → Deliverable path. |
| **PMM-I05** | Every Prompt SHALL declare Context distinct from Assumptions and Missing information. |
| **PMM-I06** | No Prompt SHALL redesign approved PRIMA architecture or invent parallel models. |
| **PMM-I07** | No two Active Prompts SHALL Conflict With the same Intent scope unresolved. |
| **PMM-I08** | Identifier uniqueness is global across PPEF. |

Violation of any PMM-I\* ⇒ Prompt MUST NOT be Approved or Active.

---

# 10. Extensibility

Future prompt types SHALL inherit from PMM as follows:

1. **Subtype** by adding taxonomy class (TAX-\*) and optional components — MUST NOT remove §3 mandatory components.  
2. **Inheritance** of identity, lifecycle, relationships, and invariants is mandatory.  
3. **Backward compatibility:** MINOR/PATCH changes to PPS-004 MUST NOT invalidate existing Active Prompt Objects.  
4. **Breaking** meta changes REQUIRE PPS-004 MAJOR and migration of Active prompts.  
5. New families register under PPS-001 §15 and appear in `ppef/registry.md`.  
6. Subtypes MAY add attributes; they MUST NOT redefine Criticality/Determinism scales incompatibly without MAJOR.

---

# Prompt Meta Model Compliance Rules

| ID | Rule |
|----|------|
| **PMM-C01** | Every PPEF architectural prompt SHALL be an instance of the Prompt Meta Object (§2). |
| **PMM-C02** | Mandatory identity fields SHALL be present (§2.2). |
| **PMM-C03** | Mandatory components SHALL be present with PMM semantics (§3). |
| **PMM-C04** | Relationships SHALL use only defined types and obey lifecycle behaviour (§4). |
| **PMM-C05** | Lifecycle transitions SHALL meet §5.1 criteria. |
| **PMM-C06** | Exactly one primary taxonomy class SHALL be declared (§6). |
| **PMM-C07** | Mandatory attributes SHALL be declared (§7). |
| **PMM-C08** | Active Prompts SHALL be mapped and registered per §8. |
| **PMM-C09** | Meta invariants PMM-I01…I08 MUST hold. |
| **PMM-C10** | Extensions MUST preserve backward compatibility (§10). |
| **PMM-C11** | PPS-001 serialization SHALL not contradict PMM component semantics. |
| **PMM-C12** | PPS-002 patterns are TAX-PAT objects; prompts Implements them via §4. |
| **PMM-C13** | PAP-004 is TAX-PRO; architectural prompts SHALL declare Reasoning Scope accordingly. |
| **PMM-C14** | Non-compliant Prompt Objects MUST NOT be executed for repository commits. |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PPS-004 |
| **Title** | Prompt Meta Model (PMM) |
| **Version** | 1.0 |
| **Status** | Official |
| **Location** | `docs/engineering/PPS-004_PROMPT_META_MODEL.md` |
