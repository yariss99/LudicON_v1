---
> **NORMATIVE AUTHORITY:** This document is superseded. Use PVC-001 v2.0 as the single authoritative Validation subsystem specification.

Status: Historical — Superseded by PVC-001 v2.0
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001, PVC-002, PVC-003, PVC-004, PPS-001, PPS-004, PPS-005, PPS-006, PDC, SPEC_INDEX.md
Related Documents: PPS-002, PAP-004, ADL-001
Requires Declared: PPS-003 (Architectural Prompt Grammar) — Absent
Extends: PVC-001, PVC-002, PVC-003, PVC-004
Superseded By: PVC-001 v2.0 (Prompt Validation Framework)
Last Updated: July 2026
---
# PVC-005 — Validation Context & Profile Resolution (VCPR)

# 1. Document Metadata

| Field | Value |
|-------|-------|
| **Title** | Validation Context & Profile Resolution (VCPR) |
| **Code** | PVC-005 |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Owner** | LUDI ON Chief System Architect / PPEF |
| **Purpose** | Define how Validation Contexts are identified, how Validation Profiles are selected, and how profile conflicts are resolved before PVE execution, ensuring deterministic, context-aware, reproducible validation |
| **Scope** | Validation Context model & taxonomy; profile resolution architecture; detection precedence; selection; inheritance; conflict resolution; execution plan generation; repository integration; traceability; metrics; extensibility; compliance |
| **Location** | `docs/engineering/PVC-005_VALIDATION_CONTEXT_PROFILE_RESOLUTION.md` |
| **Out of scope** | Rule predicate logic (PVC-002); PVE module internals beyond plan consumption (PVC-003); Teacher Approval |

**Extends:** PVC-001 · PVC-002 · PVC-003 · PVC-004  
**Mandatory references:** PPS-001 · PPS-004 · PPS-005 · PPS-006  
**Declared Absent:** PPS-003  

> Exactly **one** active Validation Context SHALL apply per Resolution.  
> Resolution SHALL produce an **Execution Plan** consumed by PVE Initialization/Profile Selection.  
> VCPR does **not** redesign ECOS architecture.


# 2. Validation Context Model

A **Validation Context** is a first-class Engineering Object describing the situational frame in which Profile Resolution occurs.

Every Validation Context SHALL define:

| Field | Requirement |
|-------|-------------|
| **Context Identifier** | Unique (`VCTX-<NAME>`) |
| **Canonical Name** | Stable name (PPS-005 aligned) |
| **Description** | Semantic description |
| **Purpose** | Why this context exists |
| **Lifecycle** | Draft→Approved→Active→Deprecated→Archived |
| **Activation Conditions** | Deterministic predicates for detection |
| **Target Audience** | Roles (Author, EL, CSA, CI, …) |
| **Repository Scope** | Paths/artefact kinds in scope |

**Relationship to Prompt Context (PPS-004):** Prompt Context is a Prompt component. Validation Context is the **validation-session frame**. They MAY overlap in facts but are distinct OE-level concerns; VCPR Context SHALL NOT redefine Prompt Context buckets.


# 3. Validation Context Taxonomy

| Identifier | Canonical Name | Purpose (summary) | Default Profile seed |
|------------|----------------|-------------------|----------------------|
| **VCTX-DEVELOPMENT** | Development | Local authoring feedback | PVP-DEVELOPMENT |
| **VCTX-AUTHORING** | Authoring | Structured drafting before Review | PVP-FOUNDATION |
| **VCTX-REVIEW** | Review | Pre-Approval human review gate | PVP-FOUNDATION + Governance subset |
| **VCTX-ENGINEERING** | Engineering | ES/engineering deliverable validation | PVP-ENGINEERING |
| **VCTX-GOVERNANCE** | Governance | PPS/PAP/ADL artefact validation | PVP-GOVERNANCE |
| **VCTX-REPO-AUDIT** | Repository Audit | Index/registry/path audit | PVP-REPOSITORY |
| **VCTX-RC** | Release Candidate | Pre-release candidate gate | PVP-RELEASE |
| **VCTX-PROD-RELEASE** | Production Release | Official merge/release gate | PVP-RELEASE |
| **VCTX-CERTIFICATION** | Certification | Certified elevation | PVP-CERTIFICATION |
| **VCTX-MAINTENANCE** | Maintenance | Patch/clarify without Release elevation | PVP-ENGINEERING (narrow) |
| **VCTX-MIGRATION** | Migration | Dual-tree / version migration validation | PVP-REPOSITORY + PVP-ENGINEERING |
| **VCTX-EMERGENCY** | Emergency | Hotfix path with explicit waiver logging | PVP-FOUNDATION (+ mandatory ADR follow-up flag) |

Future contexts SHALL register under `validation/contexts/` without breaking Active identifiers.


# 4. Profile Resolution Architecture

| Stage | Responsibility |
|-------|----------------|
| **Context Detection** | Determine single active VCTX (§5) |
| **Profile Discovery** | Load candidate Profiles from context defaults + explicit request (§6) |
| **Dependency Resolution** | Resolve Profile Requires / Parents (PVC-004) |
| **Inheritance Resolution** | Compute inherited Effective RuleSets (§7) |
| **Conflict Resolution** | Eliminate Conflicts With; apply priorities (§8) |
| **Execution Plan Generation** | Emit ordered plan for PVE (§9) |
| **Repository Synchronization** | Persist Resolution record; checklist for indexes (§10) |

**Owner module mapping (PVC-003):** Context Detection + Resolution run **before** PVE Profile Selection, or as the first sub-stage of Initialization/Context Acquisition. PVE SHALL treat the Execution Plan as authoritative Profile input.


# 5. Context Detection

Sources (evaluated to produce candidates):

| Source | Signal |
|--------|--------|
| **Explicit Context** | Request parameter `VCTX-*` |
| **Repository State** | Paths touched (ppef/, docs/engineering/, packages/) |
| **Workflow Stage** | Draft/Review/Approved/Release/CI job name |
| **Artifact Type** | Prompt / ES / ADR / Profile / Rule / Registry |
| **Lifecycle State** | Target Status |
| **User Role** | Executor role (Author/EL/CSA/CI) |
| **Automation Trigger** | Continuous Validation event (PVC-001 §9) |
| **Default Context** | `VCTX-DEVELOPMENT` if no signal |

### Precedence (highest wins)

1. Explicit Context (if valid Active VCTX)  
2. Automation Trigger mapped context (Release/CI → VCTX-PROD-RELEASE or VCTX-RC as configured)  
3. Workflow Stage  
4. Artifact Type + Lifecycle State composite map  
5. Repository State heuristics  
6. User Role default  
7. Default Context  

If Explicit Context conflicts with Automation Trigger for Official merge jobs, **Automation Trigger prevails** and Explicit SHALL be recorded as Override Attempt (Fail if unauthorized).

Exactly one Context remains. Ambiguity after precedence ⇒ Fail Resolution (no Execution Plan).


# 6. Profile Selection

Given active Context, select Profiles:

| Kind | Semantics |
|------|-----------|
| **Default Profiles** | Seed from taxonomy table §3 |
| **Inherited Profiles** | Parents of selected Profiles (PVC-004) |
| **Conditional Profiles** | Added if Context Activation Conditions / artefact predicates true |
| **Optional Profiles** | Added only if Explicitly requested |
| **Mandatory Profiles** | Always included for Context (e.g. Certification ⇒ PVP-CERTIFICATION) |
| **Custom Profiles** | Allowed if Active and Parent declared; MUST pass Conflict Resolution |
| **Composite Profiles** | Merge Profiles per PVC-004 merge rules |

**Determinism:** Same Context + Request + Snapshot + registries ⇒ same selected Profile Identifier set (before conflict elimination).

**Minimum:** Every Context SHALL resolve to **≥1** Profile after selection (before conflict fail). Empty set ⇒ Fail.


# 7. Profile Inheritance

| Mode | Rule |
|------|------|
| **Single Inheritance** | Default; one Parent |
| **Multiple Inheritance** | Allowed only for explicit Composite / multi-Parent Profiles; linearize Parents in declared order |
| **Override Rules** | Child Exclusion > Child Inclusion > Parent Effective |
| **Inherited Rule Sets** | From Parent Effective RuleSet |
| **Inherited Policies** | Blocking Policy = **most restrictive** union (e.g. if any Parent blocks Medium, child does unless child explicitly narrows — narrowing REQUIRES CSA-approved Profile Version) |
| **Inherited Dependencies** | Union of Requires; Conflicts With retained |
| **Conflict Detection** | Cycles in Parent graph ⇒ Fail; Conflicts With among Effective Rules ⇒ Fail |


# 8. Conflict Resolution

Conflicts arise among Profiles, Rules, or Context signals.

| Priority dimension | Higher wins |
|--------------------|-------------|
| **Context Priority** | §5 precedence |
| **Profile Priority** | Certification > Release > Governance > Engineering > Repository > Foundation > Development > Experimental |
| **Rule Priority** | PVC-002 Priority field; then RuleId |
| **Dependency Priority** | Required Profile/Rule retained over Optional |
| **Repository Policies** | Official/Release jobs forbid Experimental/Development as sole Profile |
| **Manual Overrides** | CSA-recorded Override on Resolution record; MUST NOT silently drop Certification/Release mandatory Profiles |

**Algorithm (deterministic):**

1. Fix Context (§5).  
2. Build Profile candidate set (§6).  
3. Expand inheritance (§7).  
4. If Profile Conflicts With ⇒ drop lower Profile Priority; if equal ⇒ Fail.  
5. Compose Effective RuleSet per Profile then union with Exclusion wins on RuleId.  
6. If Rule Conflicts With remain ⇒ Fail Resolution.  
7. Emit Execution Plan (§9).  

Conflict resolution SHALL preserve repository integrity (no orphan Active Prompt authorization via Experimental).


# 9. Execution Plan Generation

The **Execution Plan** is the deterministic input to PVE.

| Element | Content |
|---------|---------|
| **Execution Sequence** | PVL-1→…→PVL-6 (PVC-001); stages from PVC-003 §4 |
| **Rule Ordering** | Dependency topology → Priority → RuleId |
| **Parallel Execution Groups** | Independent rules within level (PVC-003 §5) |
| **Blocking Rules** | Rules whose Severity ∈ Blocking Policy |
| **Optional Rules** | Marked optional; Fail does not block unless Profile says otherwise |
| **Termination Conditions** | Short-circuit on blocking Fail; Certification: no short-circuit of evidence rules without Fail |

Plan Identifier: `PLAN-<ResolutionId>`.  
PVE SHALL reject Executions without a Plan when VCPR is Active for the gate.


# 10. Repository Integration

```
docs/engineering/ppef/validation/contexts/
  README.md
  CATALOG.md
docs/engineering/ppef/validation/profiles/     # PVC-004
docs/engineering/ppef/validation/registry/     # resolutions + validations
docs/engineering/ppef/validation/resolutions/  # optional Resolution records
SPEC_INDEX → PVC-005
ppef/registry.md → PVC-005
```


# 11. Traceability

Every context resolution SHALL record:

| Field | Requirement |
|-------|-------------|
| **Resolution Identifier** | Unique `RES-…` |
| **Context** | VCTX id |
| **Selected Profiles** | Final list |
| **Applied Rules** | Effective RuleId@version list |
| **Resolver Version** | PVC-005 version |
| **Timestamp** | ISO-8601 |
| **Repository Snapshot** | Commit/manifest hash |
| **Execution Plan Identifier** | PLAN-… |


# 12. Metrics

| Metric | Purpose | Calculation |
|--------|---------|-------------|
| **Context Detection Accuracy** | Quality of §5 | Correct Context / labelled samples |
| **Profile Resolution Time** | Cost | Mean resolve duration |
| **Conflict Frequency** | Friction | Resolutions with conflict steps / total |
| **Override Frequency** | Governance risk | Overrides / total |
| **Profile Reuse** | Adoption | Distinct Plans per Profile |
| **Resolution Determinism** | Integrity | Duplicate resolve equality rate |
| **Execution Success Rate** | Downstream | PVE Pass / Plans executed |


# 13. Extensibility

- New VCTX ids via MINOR + contexts/CATALOG.  
- New resolution strategies MUST plug after Context Detection and before Plan Generation without reordering PVL.  
- Backward compatibility: Active VCTX/Profile ids stable; behaviour breaks REQUIRE MAJOR.  


# 14. Compliance Rules

| ID | Rule |
|----|------|
| **VCPR-C01** | Every Validation SHALL execute within exactly one active Validation Context. |
| **VCPR-C02** | Every Validation Context SHALL resolve to at least one Validation Profile. |
| **VCPR-C03** | Profile resolution SHALL be deterministic. |
| **VCPR-C04** | Conflict resolution SHALL preserve repository integrity. |
| **VCPR-C05** | Every generated Execution Plan SHALL be traceable (§11). |
| **VCPR-C06** | Context Detection SHALL apply §5 precedence. |
| **VCPR-C07** | Inheritance SHALL follow §7; Parent cycles MUST Fail. |
| **VCPR-C08** | Conflicts With among Effective Rules MUST Fail Resolution. |
| **VCPR-C09** | Development/Experimental MUST NOT be sole Profile for Production Release Context. |
| **VCPR-C10** | Manual Overrides MUST be recorded on the Resolution. |
| **VCPR-C11** | PVE SHALL consume the Execution Plan as Profile input. |
| **VCPR-C12** | VCPR MUST NOT Approve or redesign architecture. |
| **VCPR-C13** | Grammar-Pass mandatory Profiles MUST NOT be required while PPS-003 Absent. |
| **VCPR-C14** | Empty Profile set after selection MUST Fail. |
| **VCPR-C15** | Ambiguous Context after precedence MUST Fail. |
| **VCPR-C16** | Certification Context SHALL include PVP-CERTIFICATION. |
| **VCPR-C17** | Resolution records SHALL be stored or linked from validation/registry. |
| **VCPR-C18** | Metrics MUST NOT override Fail Outcomes. |
| **VCPR-C19** | Extensibility MUST preserve compatibility (§13) or MAJOR. |
| **VCPR-C20** | SPEC_INDEX and ppef/registry.md SHALL list PVC-005. |


# 15. Dependencies

| Relation | Targets |
|----------|---------|
| **Requires** | PVC-001, PVC-002, PVC-003, PVC-004, PPS-001, PPS-004, PPS-005, PPS-006 |
| **Requires (Absent)** | PPS-003 |
| **Required By** | PVE Initialization/Context Acquisition; Release/Certification gates |
| **Supersedes** | Ad-hoc profile picking without Context |
| **Superseded By** | None |


# 16. Quality Checklist

| Check | Status |
|-------|--------|
| Context model complete | ✓ |
| Taxonomy defined | ✓ |
| Resolution architecture complete | ✓ |
| Inheritance defined | ✓ |
| Conflict resolution complete | ✓ |
| Execution plan defined | ✓ |
| Traceability complete | ✓ |
| Metrics complete | ✓ |
| Compliance rules VCPR-C01…C20 complete | ✓ |


## Document Control

| Item | Value |
|------|-------|
| **Code** | PVC-005 |
| **Title** | Validation Context & Profile Resolution (VCPR) |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Location** | `docs/engineering/PVC-005_VALIDATION_CONTEXT_PROFILE_RESOLUTION.md` |
