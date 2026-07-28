---
Status: Official — Engineering Specification PPS-005
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PPS-001, PPS-002, PPS-004, PAP-004, ADL-001, PDC, SPEC_INDEX.md
Related Documents: INV-001, RIM-001, PRIMA_CONSTITUTIONAL_LANGUAGE.md
Last Updated: July 2026
---

# PPS-005 — Prompt Ontology (PO)

**Code:** PPS-005  
**Title:** Prompt Ontology (PO)  
**Version:** 1.0  
**Status:** Official — Canonical semantic model for PPEF  
**Framework:** PRIMA Prompt Engineering Framework (PPEF)

> PO defines the **shared semantic vocabulary** for every concept, relationship, entity, and architectural object used in PPEF.  
> PO enables consistent interpretation by humans, AI systems, and repository tooling.  
> PO does **not** redesign PRIMA ECOS architecture.  
> Conceptual identity of Prompt Objects remains owned by **PPS-004 PMM**; PO provides the **semantic vocabulary and relationship algebra** over that model and related PPEF artifacts.

**PPEF semantic stack**

| Layer | Role |
|-------|------|
| **PPS-005 PO** | Shared vocabulary, entities, relationships, constraints, glossary |
| PPS-004 PMM | What a Prompt Object is (meta model) |
| PPS-001 | How prompts are written |
| PPS-002 APPL | Reusable patterns |
| PAP-004 ATP | Reasoning protocol |

On vocabulary conflict within PPEF → **PPS-005 prevails**.  
On Prompt Object structure → **PPS-004 prevails**.  
On ECOS constitutional terms (Engine, CO-\*, Teacher Approval) → **Constitutional Language / CM / ES prevail**; PO SHALL reuse them, not redefine them.

---

# 1. Purpose

The Prompt Ontology (PO) is the official semantic vocabulary of PPEF.

PO SHALL:

1. **Eliminate semantic ambiguity** across standards, patterns, protocols, and executions.  
2. **Ensure terminology consistency** for humans, AI executors, and tooling.  
3. **Enable machine reasoning** via explicit entities, relationships, and invariants.  
4. Remain **extensible** without breaking Certified vocabulary (§11).

---

# 2. Scope

PO SHALL govern semantics for:

| Domain | Examples |
|--------|----------|
| Prompt Engineering Standards | PPS-001, PPS-004, PPS-005 |
| Architectural Prompt Patterns | PPS-002 / APP-Pattern-\* |
| Protocols | PAP-004 ATP |
| Templates | ADR template, future PPEF templates |
| Validation | PPS-V\*, APPL-V\*, PMM-I\*, ATP Phase 7 |
| Certification | Pattern/prompt certification levels |
| Governance | ADL-001 ADR linkage, ownership, lifecycle |
| Future prompt families | Registered under PPS-001 §15 |

PO SHALL NOT govern Teacher classroom content ontology or ECOS pedagogical entity definitions beyond **reference** to constitutional names.

---

# 3. Ontology Principles

| ID | Principle | Normative statement |
|----|-----------|---------------------|
| **PO-P01** | Single meaning per concept | Each Canonical Name SHALL have exactly one Definition |
| **PO-P02** | No duplicated concepts | Two entities MUST NOT share the same Definition under different Canonical Names |
| **PO-P03** | No synonym ambiguity | Allowed Synonyms MAY exist; only Canonical Name is normative in PPEF docs |
| **PO-P04** | Explicit relationships | Edges SHALL use §5 types only |
| **PO-P05** | Extensible vocabulary | New terms REQUIRE ontology governance (§8) |
| **PO-P06** | Backward compatibility | MINOR/PATCH MUST NOT change Certified Definitions |

---

# 4. Core Ontological Entities

Each entity below is first-class. Attributes listed are mandatory unless marked optional.

---

### OE-01 Prompt

| Field | Content |
|-------|---------|
| **Definition** | First-class PPEF Engineering Artifact encoding an executable instruction set that produces one primary Deliverable (PPS-004) |
| **Purpose** | Unit of governed architectural/engineering prompting |
| **Attributes** | Identifier, Name, Version, Status, Owner, TaxonomyClass, PrimaryCategory, Criticality, Determinism |
| **Relationships** | OWNS←Owner; PART_OF→Family; IMPLEMENTS→Pattern/Protocol/Standard; DEPENDS_ON→Dependency; GENERATES→Deliverable; REQUIRES→Validation; CONSUMES→Context |
| **Lifecycle** | Draft→Review→Approved→Active→Deprecated→Archived (PPS-004 §5) |

### OE-02 Prompt Family

| Field | Content |
|-------|---------|
| **Definition** | Named collection of Prompts sharing prefix and governance (PAP, APP, PPS, …) |
| **Purpose** | Namespace and registry grouping |
| **Attributes** | FamilyCode, Prefix, RegistryPath, Status |
| **Relationships** | CONTAINS←Prompt (inverse PART_OF); OWNS←CSA |
| **Lifecycle** | Registered→Active→Deprecated→Archived |

### OE-03 Prompt Pattern

| Field | Content |
|-------|---------|
| **Definition** | Reusable APPL structure (APP-Pattern-NNN) defining Intent/Solution/Acceptance for prompt construction |
| **Purpose** | Standardize how prompts are composed |
| **Attributes** | PatternId, Name, CertificationLevel, Stability |
| **Relationships** | PART_OF→Family (APPL); IMPLEMENTS←Prompt; EXTENDS→Pattern (optional) |
| **Lifecycle** | Draft→Review→Approved→Certified→Deprecated→Archived (PPS-002) |

### OE-04 Prompt Protocol

| Field | Content |
|-------|---------|
| **Definition** | Mandatory ordered reasoning/process definition (e.g. PAP-004 ATP) |
| **Purpose** | Constrain Reasoning Scope before Generation |
| **Attributes** | ProtocolId, Phases, MandatoryFlag |
| **Relationships** | REQUIRES←Prompt (Reasoning Scope); REFERENCES→Standards |
| **Lifecycle** | Same as Standard (Official/Active/Deprecated) |

### OE-05 Prompt Standard

| Field | Content |
|-------|---------|
| **Definition** | Normative PPEF specification (PPS-\*) governing prompts |
| **Purpose** | Constitutional rules for PPEF |
| **Attributes** | StandardId, Version, Status |
| **Relationships** | EXTENDS/REFERENCES among Standards; IMPLEMENTS←Prompt |
| **Lifecycle** | Draft→Official/Active→Deprecated→Archived |

### OE-06 Prompt Template

| Field | Content |
|-------|---------|
| **Definition** | Skeleton artifact used to instantiate Prompts or ADRs |
| **Purpose** | Structural reuse without execution authority |
| **Attributes** | TemplateId, TargetKind |
| **Relationships** | GENERATES→PromptInstance (when filled); REFERENCES→Standard |
| **Lifecycle** | Active→Deprecated→Archived |

### OE-07 Prompt Instance

| Field | Content |
|-------|---------|
| **Definition** | Concrete filled Prompt Object at a Version ready for or used in Execution |
| **Purpose** | Distinguish definition revision from a runnable binding |
| **Attributes** | InstanceId, PromptIdentifier, VersionPin, BoundContextHash (optional) |
| **Relationships** | IS_A→Prompt; PRODUCES→Execution |
| **Lifecycle** | Bound→Executed→Superseded |

### OE-08 Prompt Execution

| Field | Content |
|-------|---------|
| **Definition** | Single run of a Prompt Instance by an executor (human or AI agent) |
| **Purpose** | Traceability of Generation acts |
| **Attributes** | ExecutionId, Timestamp, ExecutorRole, PromptVersion, ResultStatus |
| **Relationships** | CONSUMES→Instance; PRODUCES→Deliverable; REQUIRES→Validation |
| **Lifecycle** | Started→Completed→Failed→Audited |

### OE-09 Prompt Deliverable

| Field | Content |
|-------|---------|
| **Definition** | Primary Engineering Artifact produced by an Execution |
| **Purpose** | Repository-ready output (spec, ADR, report, contract, …) |
| **Attributes** | DeliverableId, ArtifactType, RepositoryPath, AcceptanceStatus |
| **Relationships** | GENERATES←Prompt/Execution; VALIDATES←Validation; REFERENCES→Specs |
| **Lifecycle** | Draft→Committed→Verified→Superseded (artifact-specific) |

### OE-10 Prompt Constraint

| Field | Content |
|-------|---------|
| **Definition** | Hard limit on Prompt behaviour (immutables, terminology, compatibility) |
| **Purpose** | Protect architectural integrity during Execution |
| **Attributes** | ConstraintId, Class, NormativeStrength (SHALL/MUST NOT) |
| **Relationships** | PART_OF→Prompt; REFERENCES→ECOS invariants |
| **Lifecycle** | Active with Prompt Version |

### OE-11 Prompt Context

| Field | Content |
|-------|---------|
| **Definition** | Bounded factual frame: approved specs, repo state, implementation status, assumptions, missing information |
| **Purpose** | Eliminate hidden assumptions |
| **Attributes** | ContextId, CompletenessFlag |
| **Relationships** | PART_OF→Prompt; REFERENCES→Repository Artifacts / Specs |
| **Lifecycle** | Assembled→FrozenForExecution→Superseded |

### OE-12 Prompt Dependency

| Field | Content |
|-------|---------|
| **Definition** | Required Prompt or non-prompt authority for valid Context |
| **Purpose** | Integrity of Depends On / Requires edges |
| **Attributes** | DependencyId, TargetRef, Strength (DependsOn\|Requires) |
| **Relationships** | PART_OF→Prompt; DEPENDS_ON→Target |
| **Lifecycle** | Active while Prompt Active |

### OE-13 Prompt Validation

| Field | Content |
|-------|---------|
| **Definition** | Evaluation of a Prompt or Deliverable against named rules (PPS-V\*, APPL-V\*, …) |
| **Purpose** | Gate Approval/Active/Acceptance |
| **Attributes** | ValidationId, RuleSetId, Outcome (Pass\|Fail), EvidenceRef |
| **Relationships** | VALIDATES→Artifact; REQUIRES←Execution/Approval; CERTIFIES→Certification |
| **Lifecycle** | Requested→Completed→Archived |

### OE-14 Prompt Review

| Field | Content |
|-------|---------|
| **Definition** | Human governance review act on Prompt or Deliverable |
| **Purpose** | Authorize state transitions (Review→Approved, etc.) |
| **Attributes** | ReviewId, ReviewerRole, Decision |
| **Relationships** | REFERENCES→Prompt/Deliverable; OWNS←Reviewer role |
| **Lifecycle** | Open→Decided→Closed |

### OE-15 Prompt Certification

| Field | Content |
|-------|---------|
| **Definition** | Formal recognition that a Pattern or Prompt meets Certified criteria |
| **Purpose** | Mark mandatory catalog members |
| **Attributes** | CertificationId, Level (Approved\|Certified), EvidenceValidationId |
| **Relationships** | CERTIFIES→Pattern/Prompt; REQUIRES→Validation |
| **Lifecycle** | Granted→Revoked→Archived |

### OE-16 Prompt Lifecycle

| Field | Content |
|-------|---------|
| **Definition** | State machine governing Prompt Status transitions |
| **Purpose** | Single lifecycle per Prompt (PMM-I02) |
| **Attributes** | LifecycleId, CurrentState, AllowedTransitions |
| **Relationships** | PART_OF→Prompt |
| **Lifecycle** | N/A (meta); states per PPS-004 |

### OE-17 Prompt Owner

| Field | Content |
|-------|---------|
| **Definition** | Exactly one accountable steward role or person for a Prompt |
| **Purpose** | Accountability and approval authority binding |
| **Attributes** | OwnerId, Role (CSA\|EL\|PO\|…) |
| **Relationships** | OWNS→Prompt |
| **Lifecycle** | Assigned→Transferred→Released |

### OE-18 Prompt Consumer

| Field | Content |
|-------|---------|
| **Definition** | Role or system that executes or depends on Prompt outputs |
| **Purpose** | Clarify audience (Implementation Agent, CSA, tooling) |
| **Attributes** | ConsumerId, ConsumerKind |
| **Relationships** | CONSUMES→Prompt/Deliverable |
| **Lifecycle** | Active association |

### OE-19 Prompt Repository Artifact

| Field | Content |
|-------|---------|
| **Definition** | Concrete repository path realizing a Prompt-related entity |
| **Purpose** | Map ontology to disk (RIM alignment) |
| **Attributes** | Path, ArtifactKind, PackageOrDocRoot |
| **Relationships** | IMPLEMENTS/SERIALIZES→Prompt/Standard/Pattern; GENERATES←Execution |
| **Lifecycle** | Present→Moved→Deleted (governed) |

---

# 5. Semantic Relationships

| Type | Direction | Cardinality | Lifecycle behaviour | Repository implications |
|------|-----------|-------------|---------------------|-------------------------|
| **IS_A** | Child → Parent | N:1 | Child inherits parent constraints | Classification only |
| **PART_OF** | Part → Whole | N:1 | Part lifecycle ≤ whole | Nested paths / sections |
| **DEPENDS_ON** | A → B | N:M | A Active requires B not Archived | Registry edge mandatory |
| **EXTENDS** | A → B | N:1 | A additive; B remains | Version bump on A |
| **IMPLEMENTS** | A → B | N:M | A realizes B | Cite B id in metadata |
| **VALIDATES** | V → Artifact | N:1 | V Completed before gate | Evidence file/test log |
| **GENERATES** | Prompt/Exec → Deliverable | 1:1 primary | Primary deliverable unique | Path in Document Control |
| **REFERENCES** | A → B | N:M | Weak; no state coupling | Citation only |
| **SUPERSEDES** | A → B | 1:1 | B → Deprecated | Index update both |
| **REQUIRES** | A → B | N:M | Precondition for Execution | Fail closed if missing |
| **OWNS** | Owner → Prompt | 1:N | Transfer recorded | Metadata Owner field |
| **CONSUMES** | Consumer → Prompt/Deliverable | N:M | Read/execute | No write authority alone |
| **PRODUCES** | Execution → Deliverable | 1:N | Secondary allowed; one primary | Commit set listed |
| **CERTIFIES** | Certification → Pattern/Prompt | N:1 | Requires prior Pass Validation | Registry CertificationLevel |
| **DEPRECATES** | Actor/Prompt → Target | 1:N | Target Deprecated | Ban new Executions |

**Alignment:** PPS-004 relationship names map to this algebra (Depends On→DEPENDS_ON, etc.). PO types are canonical for machine graphs.

---

# 6. Semantic Constraints

| ID | Invariant |
|----|-----------|
| **PO-I01** | Every Prompt SHALL have exactly one Owner |
| **PO-I02** | Every primary Deliverable SHALL originate from exactly one Prompt Execution (or declared single-Prompt Generation without separate Execution record in MVP tooling) |
| **PO-I03** | Every Pattern SHALL belong to exactly one Prompt Family |
| **PO-I04** | Every Validation SHALL target exactly one Artifact |
| **PO-I05** | Every Certification SHALL reference exactly one Pass Validation |
| **PO-I06** | Every Prompt SHALL have exactly one Prompt Lifecycle |
| **PO-I07** | Canonical Names in §7 are exclusive for PPEF documentation |
| **PO-I08** | ECOS constitutional terms reused by reference MUST NOT be redefined |

---

# 7. Controlled Vocabulary

| Canonical Name | Definition | Allowed Synonyms | Deprecated Terms | Usage | Repository References |
|----------------|------------|------------------|------------------|-------|------------------------|
| **Prompt** | OE-01 | Prompt Object | “instruction blob”, “chat” | PPEF unit | PPS-004, registry |
| **Prompt Family** | OE-02 | Family | “group” (ambiguous) | PAP/APP/PPS | ppef/README |
| **Prompt Pattern** | OE-03 | APPL Pattern | “template” (≠ Template) | APP-Pattern-\* | PPS-002 |
| **Prompt Protocol** | OE-04 | Protocol | — | PAP-004 | PAP-004 |
| **Prompt Standard** | OE-05 | Standard | — | PPS-\* | SPEC_INDEX |
| **Prompt Template** | OE-06 | Template | “pattern” | Skeletons | adr/TEMPLATE |
| **Prompt Instance** | OE-07 | Instance | “copy” | Bound version | Executions |
| **Prompt Execution** | OE-08 | Execution, Run | “session” (ambiguous) | Trace | ATP record |
| **Prompt Deliverable** | OE-09 | Deliverable | “output” (vague) | Primary artifact | Document Control |
| **Prompt Constraint** | OE-10 | Constraint | — | Immutables | PPS-001 §6 |
| **Prompt Context** | OE-11 | Context | “background” | Five buckets | PPS-001 §5 |
| **Prompt Dependency** | OE-12 | Dependency | — | Edges | PPS-004 §4 |
| **Prompt Validation** | OE-13 | Validation | “check” | Gates | PPS-V\* |
| **Prompt Review** | OE-14 | Review | — | Approval acts | ADL/PPS governance |
| **Prompt Certification** | OE-15 | Certification | “badge” | Certified catalog | PPS-002 |
| **Prompt Lifecycle** | OE-16 | Lifecycle | — | States | PPS-004 §5 |
| **Prompt Owner** | OE-17 | Owner | “author” (≠ owner) | Accountability | Metadata |
| **Prompt Consumer** | OE-18 | Consumer | “user” (ambiguous) | Executor/reader | RACI |
| **Prompt Repository Artifact** | OE-19 | Repository Artifact | “file” | Path mapping | RIM-001 |
| **APPL** | Architectural Prompt Pattern Language | Pattern Language | — | PPS-002 | PPS-002 |
| **PMM** | Prompt Meta Model | Meta Model | — | PPS-004 | PPS-004 |
| **PO** | Prompt Ontology | Ontology | — | This spec | PPS-005 |
| **ATP** | Architecture Thinking Protocol | Thinking Protocol | — | PAP-004 | PAP-004 |
| **PPEF** | PRIMA Prompt Engineering Framework | — | “prompt framework” (generic) | Umbrella | ppef/ |

**Rule:** No undefined term SHALL appear in PPEF documentation. New terms REQUIRE §8 governance before use.

---

# 8. Ontology Governance

| Action | Authorized | Criteria |
|--------|------------|----------|
| **Create** | CSA | Definition unique; PO-P01…P03; registry update |
| **Modify** | CSA | MINOR if additive; MAJOR if Definition changes |
| **Merge** | CSA | Duplicate concepts collapsed; deprecated name listed |
| **Deprecated** | CSA | SUPERSEDES/DEPRECATES edge; dependents migrated |
| **Archived** | CSA | No Active DEPENDS_ON without migration |

Ontology evolution SHALL preserve semantic integrity (PO-P06). Emergency terms MAY be Draft for ≤5 business days then Created or discarded.

---

# 9. Repository Integration

| Target | Mapping |
|--------|---------|
| **Engineering Specifications** | Prompt Standard / Deliverable paths under `docs/engineering/` |
| **Architecture Decision Records** | Deliverable type ADR; Template; ADL-001 lifecycle referenced, not redefined |
| **Runtime Specifications** | Referenced in Context; not OE redefined |
| **Contracts** | Possible Deliverable; REFERENCES `@prima/contracts` |
| **Knowledge Graph** | Future projection of OE-\* + §5 edges (INV/RIM adjacent) |
| **Repository Metadata** | Front matter + `ppef/registry.md` columns |
| **Validation Engine** | Future automation of OE-13; today: PPS-V\*/tests |
| **Certification Engine** | Future automation of OE-15; today: CSA + registry CertificationLevel |

---

# 10. Machine Readability

Conceptual definitions in PPS-005 are **serialization-independent**.

Future serializations SHALL preserve OE-\* and §5 edges:

| Target | Requirement |
|--------|-------------|
| **JSON-LD** | `@id` = Identifier; `@type` = OE class |
| **OWL/RDF** | Classes = OE-\*; ObjectProperties = §5 types |
| **Graph databases** | Nodes = entities; edges = relationships + cardinality |
| **Semantic APIs** | CRUD read of registry; write gated by §8 |
| **AI reasoning engines** | MUST bind to Canonical Names; MUST NOT invent synonyms as new entities |

Changing serialization MUST NOT change Definitions.

---

# 11. Future Evolution

| Change | Version impact |
|--------|----------------|
| Add entity/relationship/term without changing existing Definitions | MINOR |
| Clarify wording without semantic change | PATCH |
| Change Definition, cardinality, or invariant | MAJOR |
| Deprecate term | MINOR + Deprecated Terms column |

Extensions SHALL preserve compatibility. Breaking semantic changes SHALL require major version increments and dependent Prompt migrations.

---

# Prompt Ontology Compliance Rules

| ID | Rule |
|----|------|
| **PO-C01** | PPEF documentation SHALL use Canonical Names from §7. |
| **PO-C02** | Every Prompt SHALL instantiate OE-01 with PO-I01 and PO-I06. |
| **PO-C03** | Relationships SHALL use §5 types only. |
| **PO-C04** | Ontology principles PO-P01…P06 MUST hold. |
| **PO-C05** | Semantic constraints PO-I01…I08 MUST hold. |
| **PO-C06** | Patterns SHALL satisfy PO-I03. |
| **PO-C07** | Validations SHALL satisfy PO-I04; Certifications PO-I05. |
| **PO-C08** | Undefined terms MUST NOT appear in PPEF docs. |
| **PO-C09** | Ontology changes SHALL follow §8 governance. |
| **PO-C10** | Machine serializations MUST preserve conceptual Definitions (§10). |
| **PO-C11** | Versioning SHALL follow §11. |
| **PO-C12** | PO MUST NOT redefine ECOS constitutional terms. |
| **PO-C13** | PPS-004/PPS-001/PPS-002 artifacts SHALL be interpretable as OE instances. |
| **PO-C14** | Non-compliant vocabulary MUST NOT be used in Active Prompts. |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PPS-005 |
| **Title** | Prompt Ontology (PO) |
| **Version** | 1.0 |
| **Status** | Official |
| **Location** | `docs/engineering/PPS-005_PROMPT_ONTOLOGY.md` |
