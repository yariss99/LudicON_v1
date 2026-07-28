---
> **NORMATIVE AUTHORITY:** This document is superseded. Use PVC-001 v2.0 as the single authoritative Validation subsystem specification.

Status: Historical — Superseded by PVC-001 v2.0
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001, PPS-001, PPS-004, PPS-005, PPS-006, PAP-004, ADL-001, PDC, SPEC_INDEX.md
Related Documents: PPS-002
Requires Declared: PPS-003 (Architectural Prompt Grammar) — Absent; grammar-scoped rules SHALL use Status Deferred or Advisory until PPS-003 Active
Extends: PVC-001 Prompt Validation Framework
Superseded By: PVC-001 v2.0 (Prompt Validation Framework)
Last Updated: July 2026
---
# PVC-002 — Prompt Validation Rules Specification (PVRS)

# 1. Document Metadata

| Field | Value |
|-------|-------|
| **Title** | Prompt Validation Rules Specification (PVRS) |
| **Code** | PVC-002 |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Owner** | LUDI ON Chief System Architect / PPEF |
| **Purpose** | Define the architecture, structure, lifecycle, and execution model of every Validation Rule used by PVF (PVC-001) |
| **Scope** | Rule taxonomy, model, lifecycle, execution, severity, dependencies, registry, traceability, metrics, extensibility, compliance |
| **Location** | `docs/engineering/PVC-002_PROMPT_VALIDATION_RULES_SPECIFICATION.md` |
| **Out of scope** | ECOS ENG-07 pedagogical validation rules; Teacher classroom content rules |

**Mandatory references:** PPS-001 · PPS-004 · PPS-005 · PPS-006 · PVC-001  
**Declared Absent:** PPS-003 — Architectural Prompt Grammar  
**Extends:** PVC-001 (PVF levels, profiles, pipeline, reports remain authoritative for orchestration)

> A Validation Rule is a first-class Engineering Artifact.  
> Rules evaluate; they do **not** Approve.  
> PVRS does **not** redesign PRIMA ECOS architecture.


# 2. Validation Rule Concept

## 2.1 Definition

A **Validation Rule** is a deterministic, versioned, owned Engineering Artifact that evaluates a target (Prompt, Family, Pattern, Standard, Deliverable, Execution, or Repository Artifact) against a named predicate and emits Pass or Fail with Severity.

## 2.2 Purpose

- Encode reusable validation logic for PVF levels PVL-1…PVL-6.  
- Make compliance machine-checkable and human-auditable.  
- Bind failures to Resolution Guidance without granting governance Approval.

## 2.3 Responsibilities

| Responsibility | Normative |
|----------------|-----------|
| Evaluate predicate | SHALL |
| Emit Outcome + Severity | SHALL |
| Cite References | SHALL |
| Mutate target architecture | SHALL NOT |
| Grant Teacher Approval / Active without Governor | SHALL NOT |
| Invent undefined ontology terms | SHALL NOT |

## 2.4 Repository Role

Rules are stored and indexed under `docs/engineering/ppef/validation/rules/` and listed in the Rules Registry. They are Consumed by the Validation Engine (PVC-001) during Pipeline execution.

## 2.5 Lifecycle

See §5 (Draft→Approved→Active→Deprecated→Archived).

## 2.6 Execution Scope

A Rule SHALL declare Validation Scope ∈ {Prompt, Family, Pattern, Standard, Artifact, Execution, Repository, Cross-Cutting}.  
Execution occurs only when Trigger matches and Preconditions hold.


# 3. Validation Rule Taxonomy

| Category | Code | Responsibility |
|----------|------|----------------|
| **Structural Rules** | VRC-STR | PPS-001 structure/sections; optional grammar when PPS-003 Active |
| **Metadata Rules** | VRC-META | Identity, owner, version, status, profile metadata |
| **Ontology Rules** | VRC-ONT | PPS-005 Canonical Names, OE edges, PO invariants |
| **Semantic Rules** | VRC-SEM | PPS-006 domains, roles, interactions, PSM integrity |
| **Repository Rules** | VRC-REP | Paths, registry, indexes, orphans, Synchronizes |
| **Governance Rules** | VRC-GOV | ADL/PAP/APPL/PDC gates; authority separation |
| **Performance Rules** | VRC-PRF | Duration budgets, cost limits (non-blocking default) |
| **Quality Rules** | VRC-QUA | Completeness, determinism, reuse, quality indexes |
| **Security Rules** | VRC-SEC | Constraint integrity, no authority forgery, privacy of Context |
| **Compatibility Rules** | VRC-CMP | SemVer, supersession, backward compatibility, family conflicts |

Every Rule SHALL declare exactly one primary Category. Secondary categories MAY be listed.


# 4. Validation Rule Model

Every Validation Rule SHALL define:

| Field | Requirement |
|-------|-------------|
| **Rule Identifier** | Unique global id (`PVC-Rnnn` or imported family ids) |
| **Canonical Name** | Stable English name (PPS-005 aligned) |
| **Description** | One-paragraph semantic description |
| **Purpose** | Why the rule exists |
| **Category** | VRC-* primary |
| **Severity** | Critical\|High\|Medium\|Low\|Advisory |
| **Priority** | Integer 1…100 (lower runs earlier within level) |
| **Validation Scope** | Target kind(s) |
| **Preconditions** | Conditions required before evaluation |
| **Validation Logic** | Deterministic algorithm / predicate |
| **Expected Result** | Pass meaning |
| **Failure Conditions** | Exact Fail predicates |
| **Resolution Guidance** | Normative remediation |
| **Dependencies** | Requires / Conflicts / Extends / Related (§8) |
| **References** | Spec sections (PPS/PVC/PAP/ADL) |
| **Owner** | Exactly one Owner (default CSA) |
| **Lifecycle** | State per §5 |
| **Version** | SemVer |

**Serialization:** One rule per file `ppef/validation/rules/PVC-Rnnn_<slug>.md` OR catalog rows in `ppef/validation/rules/CATALOG.md` that include all fields. Catalog form is permitted for v1.0; file-per-rule MAY be adopted without MAJOR if CATALOG remains authoritative index.


# 5. Rule Lifecycle

```
Draft → Approved → Active → Deprecated → Archived
```

| State | Meaning |
|-------|---------|
| **Draft** | Incomplete; MUST NOT execute in Release/Certification |
| **Approved** | Authorized; not yet in default Profiles |
| **Active** | Executable by Validation Engine when selected by Profile |
| **Deprecated** | MUST NOT be newly selected; existing Profiles SHOULD migrate |
| **Archived** | Historical only |

### Transition criteria

| Transition | SHALL satisfy |
|------------|---------------|
| Draft → Approved | All §4 fields complete; Owner set; no Conflicts With unresolved; CSA review |
| Approved → Active | Registered in Rules Registry; Profile binding or available for selection; Version ≥ 1.0.0 |
| Active → Deprecated | Supersedes target named OR obsolescence recorded; dependents listed |
| Deprecated → Archived | No Active Profile Requires the rule without replacement |

**Illegal:** Draft → Active; Archived execution in blocking Profiles.


# 6. Rule Execution Model

| Element | Specification |
|---------|---------------|
| **Execution Trigger** | Pipeline stage (PVL-n), continuous event (PVC-001 §9), or manual Validation request |
| **Execution Context** | Profile, Repository Snapshot, Prompt/Artifact Version, Framework Version (PVC-001/PVC-002) |
| **Inputs** | Target serialization; Context buckets; Dependency closure |
| **Processing** | Evaluate Preconditions → apply Validation Logic → compare Expected Result |
| **Outputs** | Finding {RuleId, Outcome Pass\|Fail, Severity, EvidenceRef, Message} |
| **Postconditions** | Finding appended to Report; metrics counters updated |
| **Error Handling** | Evaluator error ⇒ Fail with Severity High (unless Advisory rule) + Evidence “evaluator-error” |
| **Blocking Behaviour** | Per Severity (§7) and Profile blocking policy (PVC-001 §6) |

**Determinism:** Same Inputs + Rule Version ⇒ same Outcome. Non-deterministic sources MUST be pinned in Execution Context (e.g. commit SHA).


# 7. Rule Severity Model

Aligned with PVC-001 §5; PVRS adds mandatory system behaviour:

| Severity | System behaviour |
|----------|------------------|
| **Critical** | Halt Pipeline (short-circuit allowed); overall Fail; Official commit MUST NOT proceed |
| **High** | Fail Validation; block Active/Execution/Certification gates |
| **Medium** | Fail Release Profile unless CSA waiver recorded on Report |
| **Low** | Record Finding; SHOULD fix before Release |
| **Advisory** | Record only; MUST NOT alone block |

Severity is immutable for a Rule Version; changing Severity REQUIRES new Rule Version (MINOR if lowering with CSA note; MAJOR if raising Impact class).


# 8. Rule Dependencies

| Relation | Direction | Meaning | Resolution |
|----------|-----------|---------|------------|
| **Requires** | A → B | A evaluates only if B Active (or Outcome available) | If B missing ⇒ A Fail High (precondition) |
| **Conflicts With** | A ↔ B | MUST NOT both be Active in same Profile | Profile load fails Deterministically (reject Profile) |
| **Supersedes** | A → B | A replaces B | B → Deprecated; Profiles using B SHOULD switch to A |
| **Extends** | A → B | A specializes B’s predicate | B MUST Pass before A runs if Requires implied |
| **Related Rules** | A → B | Informational | No execution coupling |

**Deterministic resolution order:** (1) reject Profile on Conflicts With; (2) topological order by Requires/Extends within PVL; (3) Priority ascending; (4) Rule Identifier lexicographic tie-break.


# 9. Rule Registry

## 9.1 Storage

```
docs/engineering/ppef/validation/rules/
  README.md           # index
  CATALOG.md          # authoritative fielded catalog (v1.0)
  PVC-R*.md           # optional per-rule files (future)
docs/engineering/ppef/validation/registry/
  README.md           # Validation execution registry (moved/aliased)
```

Legacy paths `validation/rules.md` and `validation/registry.md` SHALL redirect to the directories above (compatibility stubs).

## 9.2 Mandatory registry metadata

| Field | Requirement |
|-------|-------------|
| Rule Identifier | Unique |
| Canonical Name | Unique within Active set |
| Category | VRC-* |
| Severity | §7 |
| Lifecycle | §5 |
| Version | SemVer |
| Owner | Single |
| PVL mapping | PVL-1…6 |
| Profile membership | List or “selectable” |

## 9.3 Version management

- Patch: clarification without predicate change  
- Minor: additive Preconditions/Guidance  
- Major: predicate/Severity/Scope break  

Active Profiles pin Rule Versions or “latest Active compatible”; Certification Profile MUST pin exact Versions on the Report.


# 10. Rule Traceability

Every Rule SHALL be traceable to:

| Trace target | Requirement |
|--------------|-------------|
| **Framework** | PVC-001 / PVC-002 ids |
| **Standard** | PPS-001 and/or other PPS-* as applicable |
| **Grammar** | PPS-003 when Active; else Explicit Deferred |
| **Ontology** | PPS-005 terms/edges used |
| **Semantic Model** | PPS-006 interactions/invariants when VRC-SEM |
| **Repository Artifact** | Path of rule definition |
| **Validation Report** | Findings cite RuleId + Version |

Missing traceability ⇒ Rule MUST NOT be Active.


# 11. Rule Metrics

| Metric | Purpose | Calculation |
|--------|---------|-------------|
| **Execution Count** | Usage | Evaluations of RuleId |
| **Failure Rate** | Effectiveness | Fails / Executions |
| **Coverage** | Breadth | Targets hit / eligible targets in window |
| **Reuse Frequency** | Profiles using Rule | Count Profiles listing Rule |
| **Average Execution Time** | Cost | Mean duration |
| **False Positive Rate** | Tuning | CSA-confirmed incorrect Fails / Fails |
| **False Negative Rate** | Tuning | Escaped defects / eligible cases (audit sample) |

Metrics MUST NOT override Fail Outcomes. False Positive/Negative require human-labelled samples.


# 12. Extensibility

Future rule categories SHALL:

1. Register new VRC-* code via PVC-002 MINOR.  
2. Provide ≥1 Active Rule instantiating the category.  
3. Map to existing PVL levels or request PVC-001 extension.  
4. Preserve §4 model fields.  
5. Avoid Conflicts With Certified core rules without Supersedes.

Backward compatibility SHALL be preserved for Active Rule Identifiers (no reuse of retired ids).


# 13. Compliance Rules

| ID | Rule |
|----|------|
| **PVRS-C01** | Every PVF Validation Rule SHALL conform to the Rule Model (§4). |
| **PVRS-C02** | Every Rule SHALL declare exactly one primary Category (§3). |
| **PVRS-C03** | Lifecycle transitions SHALL meet §5 criteria. |
| **PVRS-C04** | Only Active Rules SHALL execute in blocking Profiles. |
| **PVRS-C05** | Execution SHALL follow §6 and be deterministic. |
| **PVRS-C06** | Severity behaviour SHALL follow §7. |
| **PVRS-C07** | Dependency resolution SHALL be deterministic per §8. |
| **PVRS-C08** | Rules SHALL be indexed in the Rules Registry (§9). |
| **PVRS-C09** | Traceability (§10) MUST be complete for Active Rules. |
| **PVRS-C10** | Metrics MUST NOT override Validation Outcomes. |
| **PVRS-C11** | Rules MUST NOT Approve or redesign architecture. |
| **PVRS-C12** | Grammar Rules MUST NOT claim Pass while PPS-003 is Absent. |
| **PVRS-C13** | Imported rules (PPS-V\*, APPL-V\*, …) remain authoritative in source specs and SHALL be mirrored in the Registry. |
| **PVRS-C14** | Extensibility MUST preserve compatibility (§12) or require MAJOR. |
| **PVRS-C15** | Each Rule SHALL have exactly one Owner. |
| **PVRS-C16** | Rule Identifiers SHALL be globally unique and never reused after Archive. |
| **PVRS-C17** | Profiles with Conflicts With among selected Rules MUST NOT load. |
| **PVRS-C18** | Certification Reports MUST pin Rule Versions. |
| **PVRS-C19** | PVRS extends PVC-001; Pipeline ownership remains PVC-001. |
| **PVRS-C20** | SPEC_INDEX and ppef registries SHALL list PVC-002 (§15). |


# 14. Dependencies

| Relation | Targets |
|----------|---------|
| **Requires** | PVC-001, PPS-001, PPS-004, PPS-005, PPS-006 |
| **Requires (Absent)** | PPS-003 |
| **Required By** | Validation Engine; all Profiles; Certification; Release |
| **Supersedes** | None (specializes PVC-001 Rule Model §4) |
| **Superseded By** | None |


# 15. Repository Integration

| Requirement | Path |
|-------------|------|
| This specification | `docs/engineering/PVC-002_PROMPT_VALIDATION_RULES_SPECIFICATION.md` |
| Rules directory | `docs/engineering/ppef/validation/rules/` |
| Rules catalog | `docs/engineering/ppef/validation/rules/CATALOG.md` |
| Validation registry directory | `docs/engineering/ppef/validation/registry/` |
| SPEC_INDEX | Entry **PVC-002** |
| ppef/registry.md | Register PVC-002 |
| Compatibility stubs | `validation/rules.md` → rules/; `validation/registry.md` → registry/ |


# 16. Quality Checklist

| Check | Status |
|-------|--------|
| Rule model complete | ✓ |
| Taxonomy defined | ✓ |
| Lifecycle defined | ✓ |
| Execution model defined | ✓ |
| Severity model complete | ✓ |
| Registry defined | ✓ |
| Traceability complete | ✓ |
| Compliance rules PVRS-C01…C20 complete | ✓ |


## Document Control

| Item | Value |
|------|-------|
| **Code** | PVC-002 |
| **Title** | Prompt Validation Rules Specification (PVRS) |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Location** | `docs/engineering/PVC-002_PROMPT_VALIDATION_RULES_SPECIFICATION.md` |
