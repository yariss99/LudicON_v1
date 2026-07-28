---
> **NORMATIVE AUTHORITY:** This document is superseded. Use PVC-001 v2.0 as the single authoritative Validation subsystem specification.

Status: Historical — Superseded by PVC-001 v2.0
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001, PVC-002, PPS-001, PPS-004, PPS-005, PPS-006, PAP-004, PDC, SPEC_INDEX.md
Related Documents: PPS-002, PVC-004, PVC-005
Requires Declared: PPS-003 (Architectural Prompt Grammar) — Absent
Extends: PVC-001, PVC-002
Superseded By: PVC-001 v2.0 (Prompt Validation Framework)
Last Updated: July 2026
---
# PVC-003 — Prompt Validation Engine (PVE)

# 1. Document Metadata

| Field | Value |
|-------|-------|
| **Title** | Prompt Validation Engine (PVE) |
| **Code** | PVC-003 |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Owner** | LUDI ON Chief System Architect / PPEF |
| **Purpose** | Define architecture, execution model, orchestration, and lifecycle of the Validation Engine that executes every PPEF validation process with deterministic, reproducible, and traceable outcomes |
| **Scope** | Engine components, execution lifecycle, rule execution modes, error handling, performance, repository integration, traceability, extensibility, compliance |
| **Location** | `docs/engineering/PVC-003_PROMPT_VALIDATION_ENGINE.md` |
| **Out of scope** | Concrete programming language implementation; ECOS ENG-07 pedagogical Validation Engine; Teacher Authority Approval acts |

**Extends:** PVC-001 (PVF) · PVC-002 (PVRS)  
**Mandatory references:** PPS-001 · PPS-004 · PPS-005 · PPS-006  
**Declared Absent:** PPS-003  

> PVE **coordinates** Rules, Profiles, and repository artefacts.  
> PVE **executes** validation; it does **not** Approve, Certify by itself, or redesign ECOS architecture.  
> Outcomes SHALL be deterministic given pinned Rule Versions + Repository Snapshot.


# 2. Validation Engine Architecture

## 2.1 Definition

The **Prompt Validation Engine (PVE)** is the central execution component of the Prompt Validation Framework (PVC-001). It loads Validation Profiles and Rules (PVC-002), evaluates targets against PVL-1…PVL-6, aggregates Findings, evaluates compliance, emits Validation Reports, and synchronizes registries.

## 2.2 Responsibilities

| Responsibility | Normative |
|----------------|-----------|
| Orchestrate Pipeline PVL-1…PVL-6 | SHALL |
| Load and pin Active Rules per Profile | SHALL |
| Resolve rule dependencies deterministically | SHALL |
| Execute rules and emit Findings | SHALL |
| Aggregate Results and Compliance Score | SHALL |
| Generate Validation Reports | SHALL |
| Record Execution in Validation Registry | SHALL |
| Grant Teacher Approval or architectural redesign | SHALL NOT |
| Treat Validation Pass as governance Approval | SHALL NOT |
| Invent undefined ontology terms | SHALL NOT |

## 2.3 Internal components

See §3.

## 2.4 Interfaces

| Interface | Direction | Contract |
|-----------|-----------|----------|
| **I-Profile** | In | Profile name → RuleSet + blocking policy (profiles.md) |
| **I-Rules** | In | Rule catalog / rule files (PVC-002) |
| **I-Target** | In | Prompt / Artifact / Execution serialization + Context |
| **I-Report** | Out | Validation Report (§PVC-001 §8) |
| **I-Registry** | Out | Validation execution row |
| **I-Sync** | Out | Index/registry synchronization directives |
| **I-Metrics** | Out | Counters for PVC-002 §11 / PVC-001 §11 |

## 2.5 Execution boundaries

| Inside PVE | Outside PVE |
|------------|-------------|
| Rule evaluation | Human Reviewer Approves |
| Pipeline orchestration | ADR content authoring |
| Report generation | ECOS Engine business logic |
| Registry writes for Validations | Unrelated app UI (`src/`) |

## 2.6 Repository integration

PVE reads/writes only PPEF validation paths and declared index targets (§8). It SHALL NOT mutate constitutional ECOS specs except when the **target Deliverable** of a Prompt under validation is itself that spec (read-only during Validation).


# 3. Engine Components

| Module | Responsibility |
|--------|----------------|
| **Validation Coordinator** | Owns lifecycle (§4); sequences modules; enforces short-circuit on blocking Fail |
| **Rule Loader** | Loads Active Rules for Profile; pins Versions; rejects Conflicts With |
| **Execution Scheduler** | Orders rules (PVC-002 §8); selects sequential/parallel/conditional plans |
| **Dependency Resolver** | Builds Requires/Extends graph; topological order; fail on cycles |
| **Result Aggregator** | Collects Findings; computes Compliance Score; overall Pass/Fail |
| **Error Manager** | Classifies failures (§6); applies retry/block policy |
| **Logging Service** | Structured logs for stages, timings, errors (Observer semantics) |
| **Traceability Manager** | Ensures Execution Identifier and mandatory trace fields (§9) |
| **Compliance Evaluator** | Applies Profile blocking severities; Certification pin checks |
| **Repository Connector** | Reads catalogs/profiles; writes reports/registry; emits Synchronizes checklist |

All modules are mandatory for a conforming PVE implementation (runtime or documented manual procedure). Manual execution SHALL simulate the same lifecycle and outputs.


# 4. Execution Lifecycle

Canonical stages:

```
Initialization
→ Context Acquisition
→ Profile Selection
→ Rule Discovery
→ Dependency Resolution
→ Rule Execution
→ Result Aggregation
→ Compliance Evaluation
→ Report Generation
→ Repository Synchronization
→ Completion
```

| Stage | Inputs | Outputs | Preconditions | Postconditions |
|-------|--------|---------|---------------|----------------|
| **Initialization** | Request (target id, profile, executor) | ExecutionId, FrameworkVersion pin | Request well-formed | Execution record Started |
| **Context Acquisition** | Target, repo state | Bound Context + Repository Snapshot | Target readable | Snapshot pinned |
| **Profile Selection** | Profile name | Profile config | Profile exists | Blocking policy bound |
| **Rule Discovery** | Profile | Candidate Rule set | Rules Registry available | Candidates listed |
| **Dependency Resolution** | Candidates | Ordered executable set | No Conflicts With; graph acyclic | Schedule fixed |
| **Rule Execution** | Ordered rules + Context | Findings | Schedule non-empty or explicit empty-Pass policy | Each rule Outcome recorded |
| **Result Aggregation** | Findings | Score, counts | All scheduled rules terminal | Aggregate available |
| **Compliance Evaluation** | Aggregate + Profile | Overall Pass\|Fail | Aggregate complete | Gate decision set |
| **Report Generation** | All prior | Validation Report | Trace fields present | Report persisted |
| **Repository Synchronization** | Report + Impact | Registry row; sync checklist | Report Pass or Fail finalized | Registry updated |
| **Completion** | — | Terminal status Completed\|Failed | Sync attempted | Metrics updated; Execution closed |

**Architectural Prompts:** When target requires PAP-004, Context Acquisition SHALL verify Reasoning Scope evidence before Rule Execution of PVC-R007-class rules.


# 5. Rule Execution Model

| Mode | Specification |
|------|---------------|
| **Sequential execution** | Default within a PVL level by Priority then RuleId |
| **Parallel execution** | MAY run independent rules (no Requires edge between them) within a level; Results join before level completes |
| **Conditional execution** | Rule skipped if Preconditions false → Outcome `Skipped` (not Pass); Skipped MUST NOT count as Pass for Certification pins unless Profile allows |
| **Dependency-aware execution** | Requires/Extends respected via topological order; failure of Required rule ⇒ dependents Fail High (precondition) unless short-circuit |
| **Execution ordering** | (1) PVL ascending (2) dependency topology (3) Priority (4) RuleId |
| **Blocking rules** | Critical/High Fail per Profile ⇒ Coordinator MAY short-circuit remaining rules/levels |
| **Recovery behaviour** | See §6; no silent Pass after evaluator error |

**Reproducibility:** Scheduler plan SHALL be recorded on the Report (ordered RuleId+Version list).


# 6. Error Handling

| Failure class | Handling | Retry | Blocking |
|---------------|----------|-------|----------|
| **Execution failures** (coordinator crash) | Fail Execution; Error Manager records; partial Findings preserved | MAY retry once from last completed stage | Blocks Completion as Pass |
| **Rule failures** (predicate Fail) | Finding Fail + Severity | No retry | Per Severity/Profile |
| **Dependency failures** (missing Required rule/target) | Fail High Finding on dependent | No retry until dependency fixed | Blocks |
| **Repository failures** (read/write registry/report) | Fail High; retry write | Retry up to 2 with backoff | Blocks Synchronization Complete |
| **Unexpected exceptions** | Treat as evaluator-error Fail High | Retry once | Blocks Pass |

**Recovery strategy:** Prefer fail-closed; never invent Pass.  
**Retry policy:** Idempotent stages only (Report write, Registry append with same ExecutionId).  
**Blocking conditions:** Any Critical/High unresolved at Compliance Evaluation ⇒ overall Fail.


# 7. Performance Model

| Concern | Specification |
|---------|---------------|
| **Execution efficiency** | Prefer dependency-aware scheduling; short-circuit on blocking Fail for Release/Certification unless diagnostics mode |
| **Caching strategy** | MAY cache immutable Rule definitions by Version; MUST NOT cache Outcomes across different Snapshots |
| **Incremental validation** | MAY re-validate only rules whose Scope intersects changed paths when continuous trigger is narrow; Full Profile required for Release/Certification |
| **Selective validation** | Foundation Profile for Draft; stronger Profiles as gates increase |
| **Parallel processing** | Allowed for independent rules (§5); MUST preserve determinism of aggregate |
| **Scalability** | Rule catalog growth via PVC-002; Engine MUST scale by Profile subsetting not by dropping mandatory PVL order |


# 8. Repository Integration

| Artefact | PVE interaction |
|----------|-----------------|
| **Validation Registry** | `ppef/validation/registry/` — append Execution row |
| **Rule Registry / Catalog** | `ppef/validation/rules/CATALOG.md` (+ optional rule files) — read/pin |
| **Profiles** | `ppef/validation/profiles.md` — read |
| **Reports** | `ppef/validation/reports/` — write Report |
| **SPEC_INDEX** | Read for existence checks; write only via Synchronizes checklist when Impact requires (human/agent applies) |
| **ppef/registry.md** | Read for Active Prompt registration (PVC-R009); write via Synchronizes when registering |

PVE SHALL emit an explicit Synchronizes checklist; automated writers MAY apply it when authorized. Orphan prevention remains mandatory (PVC-R010).


# 9. Traceability

Every Execution SHALL record:

| Field | Requirement |
|-------|-------------|
| **Execution Identifier** | Unique (`VAL-…` / UUID) |
| **Prompt Identifier** | Target id |
| **Profile** | Profile name |
| **Executed Rules** | Ordered list RuleId@version + Outcome |
| **Timestamp** | Start and end ISO-8601 |
| **Duration** | Elapsed time |
| **Outcome** | Pass \| Fail |
| **Repository Snapshot** | Commit SHA or manifest hash |

Missing fields ⇒ Report MUST NOT be used for Certification (PVC-001 §10).


# 10. Extensibility

New execution modules SHALL:

1. Register behind Coordinator without breaking §4 stage order.  
2. Expose capabilities via Interfaces (§2.4) or additive optional stages after Compliance Evaluation and before Report Generation only.  
3. Preserve deterministic aggregation.  
4. Remain compatible with PVC-001 PVL order and PVC-002 dependency resolution.  

Removing or reordering mandatory stages REQUIRES PVC-003 MAJOR.


# 11. Compliance Rules

| ID | Rule |
|----|------|
| **PVE-C01** | All PPEF Validations SHALL be executed by a conforming PVE (automated or manual simulation of §4). |
| **PVE-C02** | PVE SHALL implement all modules in §3. |
| **PVE-C03** | Lifecycle stages SHALL execute in §4 order. |
| **PVE-C04** | Rule ordering SHALL follow §5. |
| **PVE-C05** | Outcomes SHALL be deterministic for pinned Rules + Snapshot. |
| **PVE-C06** | Error handling SHALL fail closed (§6). |
| **PVE-C07** | PVE MUST NOT Approve or redesign architecture. |
| **PVE-C08** | Validates MUST NOT be treated as Approves. |
| **PVE-C09** | Traceability fields (§9) MUST be recorded. |
| **PVE-C10** | Reports SHALL conform to PVC-001 §8. |
| **PVE-C11** | Registry rows SHALL be appended for every Completion. |
| **PVE-C12** | Conflicts With in a Profile MUST reject load. |
| **PVE-C13** | Grammar Pass MUST NOT be claimed while PPS-003 Absent. |
| **PVE-C14** | Caching MUST NOT reuse Outcomes across Snapshots. |
| **PVE-C15** | Incremental validation MUST NOT replace Full Profile for Release/Certification. |
| **PVE-C16** | Extensibility MUST preserve backward compatibility (§10) or MAJOR. |
| **PVE-C17** | PVE extends PVC-001/PVC-002; MUST NOT contradict them. |
| **PVE-C18** | Parallel execution MUST NOT violate Requires edges. |
| **PVE-C19** | Evaluator errors MUST surface as Fail High (or policy Severity). |
| **PVE-C20** | SPEC_INDEX and ppef/registry.md SHALL list PVC-003. |


# 12. Dependencies

| Relation | Targets |
|----------|---------|
| **Requires** | PVC-001, PVC-002, PPS-001, PPS-004, PPS-005, PPS-006 |
| **Requires (Absent)** | PPS-003 |
| **Required By** | All blocking Validations; Release; Certification; continuous Validation events |
| **Supersedes** | None |
| **Superseded By** | None |


# 13. Quality Checklist

| Check | Status |
|-------|--------|
| Engine architecture defined | ✓ |
| Execution lifecycle complete | ✓ |
| Rule execution model defined | ✓ |
| Error handling complete | ✓ |
| Repository integration complete | ✓ |
| Traceability complete | ✓ |
| Compliance rules PVE-C01…C20 complete | ✓ |


## Document Control

| Item | Value |
|------|-------|
| **Code** | PVC-003 |
| **Title** | Prompt Validation Engine (PVE) |
| **Version** | 1.0 |
| **Status** | Historical — Superseded by PVC-001 v2.0 |
| **Location** | `docs/engineering/PVC-003_PROMPT_VALIDATION_ENGINE.md` |
