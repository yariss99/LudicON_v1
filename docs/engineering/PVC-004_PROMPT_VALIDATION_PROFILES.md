---
> **NORMATIVE AUTHORITY:** This document is superseded. Use PVC-001 v2.0 as the single authoritative Validation subsystem specification.

Status: Historical — Superseded by PVC-001 v2.0
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001, PVC-002, PVC-003, PPS-001, PPS-004, PPS-005, PPS-006, PDC, SPEC_INDEX.md
Related Documents: PPS-002, PAP-004
Requires Declared: PPS-003 (Architectural Prompt Grammar) — Absent
Extends: PVC-001, PVC-002, PVC-003
Superseded By: PVC-001 v2.0 (Prompt Validation Framework)
Last Updated: July 2026
---
# PVC-004 — Prompt Validation Profiles (PVP)

# 1. Document Metadata

| Field | Value |
|-------|-------|
| **Title** | Prompt Validation Profiles (PVP) |
| **Code** | PVC-004 |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Owner** | LUDI ON Chief System Architect / PPEF |
| **Purpose** | Define architecture, lifecycle, composition, and execution semantics of Validation Profiles consumed by the Prompt Validation Engine (PVC-003) |
| **Scope** | Profile model, taxonomy, composition, execution semantics, lifecycle, repository integration, traceability, metrics, extensibility, compliance |
| **Location** | `docs/engineering/PVC-004_PROMPT_VALIDATION_PROFILES.md` |
| **Out of scope** | Implementation language of PVE; ECOS ENG-07 profiles; Teacher Approval policies |

**Extends:** PVC-001 · PVC-002 · PVC-003  
**Mandatory references:** PPS-001 · PPS-004 · PPS-005 · PPS-006  
**Declared Absent:** PPS-003  

> A Validation Profile selects **which** Rules run, **when**, and **with which** blocking parameters.  
> Profiles do **not** Approve.  
> Composition and selection SHALL be **deterministic**.


# 2. Validation Profile Concept

## 2.1 Definition

A **Validation Profile** is a first-class Engineering Artifact that binds a named RuleSet (and execution parameters) to a Validation Engine run against a target Prompt, Family, Artifact, or Execution.

## 2.2 Purpose

- Standardize gate strength (Foundation → Certification).  
- Ensure reproducible Rule discovery and ordering.  
- Encode blocking policy and severity thresholds for Compliance Evaluation (PVC-003).

## 2.3 Responsibilities

| Responsibility | Normative |
|----------------|-----------|
| Declare included/excluded Rules | SHALL |
| Declare execution mode and order policy | SHALL |
| Declare severity threshold and blocking policy | SHALL |
| Reference only registered Active (or pinned) Rules | SHALL |
| Execute rules itself | SHALL NOT (PVE executes) |
| Grant Approval / Certify without Pass Validation | SHALL NOT |
| Include Conflicts With among selected Rules | SHALL NOT (load MUST fail) |

## 2.4 Execution Scope

Profiles apply to Validation Engine Executions. Target Scope MAY restrict eligible targets (Prompt, Pattern, Standard, Repository, Cross-Cutting).

## 2.5 Repository Role

Stored under `ppef/validation/profiles/`; indexed in SPEC_INDEX / ppef/registry; loaded via PVE I-Profile.

## 2.6 Lifecycle

See §7.

## 2.7 Inheritance Behaviour

A Profile MAY declare a **Parent Profile**. Child Includes Parent’s Included Rule Sets then applies own Inclusion/Exclusion/Overrides. Inheritance depth SHALL be finite and acyclic. Final effective RuleSet SHALL be computed deterministically (§5).


# 3. Validation Profile Model

Every Validation Profile SHALL define:

| Field | Requirement |
|-------|-------------|
| **Profile Identifier** | Unique (`PVP-<Name>` or `PVP-NNN`) |
| **Canonical Name** | Stable name |
| **Description** | Semantic description |
| **Purpose** | Why the profile exists |
| **Target Scope** | Eligible target kinds |
| **Execution Context** | Required Context buckets / Snapshot policy |
| **Included Rule Sets** | RuleIds, prefixes, or named sets |
| **Excluded Rule Sets** | Explicit exclusions (win over include) |
| **Execution Order** | `PVL-strict` \| `dependency-then-priority` (default) |
| **Execution Mode** | `sequential` \| `parallel-independent` \| `hybrid` |
| **Severity Threshold** | Minimum severity that counts as Finding for Fail aggregation (default: Low; Advisory never alone fails) |
| **Blocking Policy** | Severities that block / short-circuit (e.g. Critical+High) |
| **Dependencies** | Parent Profile; Requires Profiles; Conflicts With Profiles |
| **Owner** | Exactly one |
| **Version** | SemVer |
| **Lifecycle** | §7 state |
| **Repository Location** | Path under `validation/profiles/` |


# 4. Validation Profile Taxonomy

### Foundation Profile — `PVP-FOUNDATION`

| Field | Content |
|-------|---------|
| **Purpose** | Gate Draft→Review structural/meta integrity |
| **Target Users** | Authors, Implementation Agents |
| **Execution Goals** | PVL-1, PVL-2 Pass |
| **Mandatory Rules** | PVC-R001…R004; PPS-V01…V08 as applicable |
| **Optional Rules** | PVC-R013 (Advisory) |
| **Blocking Behaviour** | Critical, High |

### Engineering Profile — `PVP-ENGINEERING`

| Field | Content |
|-------|---------|
| **Purpose** | Validate ES-producing / engineering Prompts |
| **Target Users** | Engineering Lead, CSA, Agents |
| **Execution Goals** | PVL-1…PVL-5 |
| **Mandatory Rules** | Foundation set + PVC-R005…R010; PPS-V09…V10 |
| **Optional Rules** | VRC-PRF rules if registered |
| **Blocking Behaviour** | Critical, High |

### Governance Profile — `PVP-GOVERNANCE`

| Field | Content |
|-------|---------|
| **Purpose** | Validate governance artefacts (PPS/PAP/ADL-linked) |
| **Target Users** | CSA, Product Owner (review) |
| **Execution Goals** | PVL-1…4, PVL-6 |
| **Mandatory Rules** | Engineering ontology/semantic core + PVC-R011…R014; ATP/ADL imports |
| **Optional Rules** | Related quality rules |
| **Blocking Behaviour** | Critical, High |

### Repository Profile — `PVP-REPOSITORY`

| Field | Content |
|-------|---------|
| **Purpose** | Validate path/index/registry consistency |
| **Target Users** | Agents performing Synchronizes |
| **Execution Goals** | PVL-1, PVL-5, PVL-6 (repo subset) |
| **Mandatory Rules** | PVC-R001, R009, R010, R011 as applicable |
| **Optional Rules** | None required |
| **Blocking Behaviour** | Critical, High |

### Release Profile — `PVP-RELEASE`

| Field | Content |
|-------|---------|
| **Purpose** | Pre-merge Official commit gate |
| **Target Users** | EL, CSA, CI |
| **Execution Goals** | Full PVL-1…PVL-6 |
| **Mandatory Rules** | Union of applicable Foundation/Engineering/Governance/Repository mandatory sets for target |
| **Optional Rules** | Medium-severity quality rules (blocking if Fail) |
| **Blocking Behaviour** | Critical, High, Medium |

### Certification Profile — `PVP-CERTIFICATION`

| Field | Content |
|-------|---------|
| **Purpose** | Elevate Pattern/Prompt to Certified |
| **Target Users** | CSA |
| **Execution Goals** | Full levels + evidence pin |
| **Mandatory Rules** | Release set + PVC-R015; pin exact Rule Versions |
| **Optional Rules** | None (all selected are mandatory for Pass) |
| **Blocking Behaviour** | Any Fail |

### Development Profile — `PVP-DEVELOPMENT`

| Field | Content |
|-------|---------|
| **Purpose** | Fast local feedback during authoring |
| **Target Users** | Implementation Agents |
| **Execution Goals** | Subset of Foundation (+ selective Engineering) |
| **Mandatory Rules** | PVC-R001, R002 |
| **Optional Rules** | PVC-R003…R010 selectable |
| **Blocking Behaviour** | Critical only (High recorded, non-blocking unless configured) |

### Experimental Profile — `PVP-EXPERIMENTAL`

| Field | Content |
|-------|---------|
| **Purpose** | Trial new Rules without Release impact |
| **Target Users** | CSA, EL |
| **Execution Goals** | Non-blocking evaluation of Draft/Approved Rules |
| **Mandatory Rules** | None |
| **Optional Rules** | Any Draft/Approved/Active experimental set |
| **Blocking Behaviour** | None (Advisory aggregate); MUST NOT authorize Official |

### Custom Profile — `PVP-CUSTOM-*`

| Field | Content |
|-------|---------|
| **Purpose** | Organization-specific gates |
| **Target Users** | Declared Owner |
| **Execution Goals** | Declared |
| **Mandatory Rules** | Declared; MUST reference registered Rules only |
| **Optional Rules** | Declared |
| **Blocking Behaviour** | Declared; MUST state Parent Profile |


# 5. Profile Composition

Composition produces the **Effective RuleSet**. Algorithm (deterministic):

1. **Start** with empty set.  
2. **Inherit:** If Parent declared, compute Parent Effective RuleSet recursively (cycle ⇒ load Fail).  
3. **Include:** Add Included Rule Sets (expand prefixes to Active Rules at pin policy).  
4. **Exclude:** Remove Excluded Rule Sets (exclusion wins).  
5. **Conditional Rules:** Include only if declared conditions true (evaluated against Context).  
6. **Shared Rule Sets:** Expand named shared sets from `profiles/shared/` if referenced.  
7. **Overrides:** Apply field overrides (Severity pin for Profile-local view MUST NOT mutate Rule artifact; Profile MAY raise effective blocking threshold only).  
8. **Conflict Resolution:** If Conflicts With among remaining Rules ⇒ **Profile load Fail**. Tie-break documentation: Exclusion > Inclusion > Inheritance.  
9. **Order:** Apply Execution Order policy (default dependency-then-priority per PVC-002/PVC-003).  

Composition SHALL be deterministic for the same Snapshot + Profile Version + pin policy.


# 6. Execution Semantics

How PVE SHALL interpret Profiles:

| Concern | Semantics |
|---------|-----------|
| **Profile Selection** | Request names Profile Identifier; missing ⇒ Fail Initialization |
| **Rule Discovery** | Effective RuleSet from §5 |
| **Execution Ordering** | Per Profile Execution Order + PVC-003 Scheduler |
| **Conditional Execution** | Preconditions + Conditional Rules; Skipped ≠ Pass for Certification |
| **Profile Switching** | New Execution required; MUST NOT mid-flight switch |
| **Nested Profiles** | Only via Parent inheritance (§2.7); no runtime nested Executions inside one ExecutionId |
| **Profile Merging** | Explicit merge Profile MAY declare multiple Parents in declared order; union then exclusions; Conflicts With ⇒ Fail |
| **Fallback Behaviour** | If Release requested but target Draft-only Rules needed ⇒ Fail; Development MUST NOT silently substitute for Release |


# 7. Profile Lifecycle

```
Draft → Review → Approved → Active → Deprecated → Archived
```

| Transition | Criteria |
|------------|----------|
| Draft → Review | Model fields complete; composition resolves without Conflicts |
| Review → Approved | CSA review; Effective RuleSet non-empty for non-Experimental; Owner set |
| Approved → Active | Registered under `validation/profiles/`; listed in profile index |
| Active → Deprecated | Replacement Profile named OR obsolescence recorded |
| Deprecated → Archived | No Active Prompt Requires this Profile |

**Illegal:** Draft/Experimental used as Release/Certification; Archived selection.


# 8. Repository Integration

```
docs/engineering/ppef/validation/profiles/
  README.md
  CATALOG.md                 # official family definitions
  shared/                    # optional shared rule sets
  PVP-*.md                   # optional per-profile files
docs/engineering/ppef/validation/profiles.md   # compatibility stub → profiles/
docs/engineering/ppef/validation/registry/     # execution history references Profile id
```

**Naming:** `PVP-<FAMILY>` for official families; `PVP-CUSTOM-<ORG>-<NAME>` for custom.  
**Indexing:** SPEC_INDEX **PVC-004**; `ppef/registry.md` entry; profiles/README lists Active Profiles.


# 9. Profile Traceability

Every Profile SHALL record:

| Field | Requirement |
|-------|-------------|
| Profile Identifier | Unique |
| Version | SemVer |
| Owner | Single |
| Creation Date | ISO date |
| Last Modification | ISO date |
| Referenced Rule Sets | Expanded or symbolic |
| Referenced Standards | PPS/PVC/PAP/ADL ids |
| Execution History | Via Validation Registry rows citing Profile |


# 10. Profile Metrics

| Metric | Purpose | Calculation |
|--------|---------|-------------|
| **Execution Frequency** | Usage | Executions selecting Profile / window |
| **Average Execution Time** | Cost | Mean duration |
| **Rule Coverage** | Breadth | Distinct Rules executed / Rules in Effective set |
| **Compliance Rate** | Quality | Pass / Executions |
| **Failure Distribution** | Risk | Counts by Severity |
| **Profile Reuse Index** | Adoption | Distinct targets validated |
| **Maintenance Frequency** | Churn | Versions published / window |

Metrics MUST NOT override Fail Outcomes.


# 11. Extensibility

- New official families REQUIRE PVC-004 MINOR + CATALOG entry + CSA Approval.  
- Custom Profiles SHALL declare Parent Profile (default `PVP-FOUNDATION`).  
- Inheritance SHALL preserve backward compatibility of Parent Effective semantics for unchanged Parents.  
- Removing an official Profile Identifier REQUIRES Deprecation then Archive; id MUST NOT be reused.


# 12. Compliance Rules

| ID | Rule |
|----|------|
| **PVP-C01** | Every Validation Profile SHALL conform to the Profile Model (§3). |
| **PVP-C02** | Every Profile SHALL define a clear Target Scope and Purpose. |
| **PVP-C03** | Profiles SHALL reference only registered Validation Rules (PVC-002). |
| **PVP-C04** | Profiles SHALL specify Execution Order, Mode, and Blocking Policy. |
| **PVP-C05** | Profiles SHALL declare Dependencies (including Parent when Custom). |
| **PVP-C06** | Composition SHALL be deterministic (§5). |
| **PVP-C07** | Conflicts With among Effective Rules MUST Fail Profile load. |
| **PVP-C08** | PVE SHALL interpret Profiles per §6. |
| **PVP-C09** | Lifecycle transitions SHALL meet §7. |
| **PVP-C10** | Only Active Profiles SHALL be used for Official/Release/Certification gates. |
| **PVP-C11** | Development/Experimental MUST NOT authorize Official commits. |
| **PVP-C12** | Certification Profile MUST pin Rule Versions. |
| **PVP-C13** | Profiles MUST NOT grant Approval semantics. |
| **PVP-C14** | Profiles MUST NOT require grammar-Pass while PPS-003 Absent. |
| **PVP-C15** | Traceability fields (§9) MUST be present for Active Profiles. |
| **PVP-C16** | Metrics MUST NOT override Validation Outcomes. |
| **PVP-C17** | Custom Profiles SHALL declare Parent Profiles (§11). |
| **PVP-C18** | Profile mid-flight switching is forbidden. |
| **PVP-C19** | PVP extends PVC-001/002/003 without contradiction. |
| **PVP-C20** | SPEC_INDEX and ppef/registry.md SHALL list PVC-004. |


# 13. Dependencies

| Relation | Targets |
|----------|---------|
| **Requires** | PVC-001, PVC-002, PVC-003, PPS-001, PPS-004, PPS-005, PPS-006 |
| **Requires (Absent)** | PPS-003 |
| **Required By** | PVE Profile Selection; all Validation Executions |
| **Supersedes** | Informal profile table in PVC-001 §6 (normative detail moves here; PVC-001 remains orchestration authority) |
| **Superseded By** | None |


# 14. Quality Checklist

| Check | Status |
|-------|--------|
| Profile model complete | ✓ |
| Taxonomy defined | ✓ |
| Composition rules defined | ✓ |
| Execution semantics complete | ✓ |
| Lifecycle complete | ✓ |
| Repository integration complete | ✓ |
| Metrics complete | ✓ |
| Compliance rules PVP-C01…C20 complete | ✓ |


## Document Control

| Item | Value |
|------|-------|
| **Code** | PVC-004 |
| **Title** | Prompt Validation Profiles (PVP) |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Location** | `docs/engineering/PVC-004_PROMPT_VALIDATION_PROFILES.md` |
