---
Status: Official — Engineering Specification PPS-002
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PPS-001, PAP-004, ADL-001, PDC, SPEC_INDEX.md, INV-001, RIM-001
Related Documents: POSS, PAS, CM-001, ES-*
Last Updated: July 2026
---

# PPS-002 — Architectural Prompt Pattern Language (APPL)

**Code:** PPS-002  
**Title:** Architectural Prompt Pattern Language (APPL)  
**Version:** 1.0  
**Status:** Official — Pattern language for PPEF  
**Framework:** PRIMA Prompt Engineering Framework (PPEF)

> APPL is the standardized design language for constructing architectural prompts.  
> Prompt patterns are reusable structures analogous to software design patterns.  
> Every architectural prompt in PPEF SHALL select patterns per this specification.  
> This document does **not** redesign PRIMA architecture.

---

# 1. Purpose

Prompt patterns SHALL:

1. Provide **reusable architectural structures** for PPEF prompts.  
2. Improve **consistency** across PAP, APP, PPS, and future families.  
3. **Reduce ambiguity** in intent, deliverable shape, and acceptance.  
4. **Accelerate engineering** by encoding proven reasoning and output forms.  
5. Remain compatible with **PPS-001**, **PAP-004**, and **ADL-001**.

Patterns SHALL NOT authorize parallel architectural models or renaming of approved concepts.

---

# 2. Scope

| Family | SHALL use APPL |
|--------|----------------|
| **PAP** | Yes — primary consumer |
| **APP** | Yes — when deliverables are architectural or engineering |
| **PPS** | Yes — when creating/amending PPEF standards or prompts |
| **Future PPEF families** | Yes — upon registration under PPS-001 §15 |

**Out of scope:** Teacher-facing classroom content prompts; ephemeral chat without repository deliverable.

---

# 3. Pattern Definition Standard

Every APPL pattern SHALL include the following sections. Vacuous sections are forbidden; use `None.` when applicable.

| Field | Requirement |
|-------|-------------|
| **Identifier** | `APP-Pattern-NNN` (unique in registry) |
| **Pattern Name** | Stable English name |
| **Intent** | One-paragraph purpose |
| **Applicability** | When the pattern SHALL / SHOULD / MUST NOT be used |
| **Context** | Preconditions (specs, repo state) |
| **Problem Statement** | Problem the pattern solves |
| **Forces** | Competing concerns |
| **Solution** | Structural solution (phases, sections, rules) |
| **Expected Deliverable** | Artifact type and shape |
| **Repository Impact** | Typical paths / indexes updated |
| **Known Limitations** | Explicit non-goals |
| **Acceptance Criteria** | Objective verification |
| **Example Usage** | Identifier-level scenario (no long samples unless PO requests) |
| **Related Patterns** | Complements / conflicts |

---

# 4. Core Architectural Prompt Patterns

The following catalog is **mandatory**. Patterns are **Certified** at PPS-002 v1.0.

---

## APP-Pattern-001 — Specification Creation Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-001 |
| **Pattern Name** | Specification Creation Pattern |
| **Intent** | Create a new engineering specification (or protocol/standard) that does not yet exist under SPEC_INDEX. |
| **Applicability** | SHALL when INV-001/SPEC_INDEX shows Absent/unassigned id; MUST NOT when an ES/protocol already owns the concern (use APP-Pattern-002). |
| **Context** | SPEC_INDEX, INV-001, RIM-001, parent constitution (POSS/PAS/PDC/CM), PAP-004 Phases 1–5 complete. |
| **Problem Statement** | New normative artifacts are invented ad hoc with inconsistent structure and missing indexes. |
| **Forces** | Completeness vs speed; uniqueness of identifiers; no parallel models; repository readiness. |
| **Solution** | Apply PAP-004; assign unique id via CSA; write full normative document; update SPEC_INDEX, INV-001, RIM-001; register tests/contracts if required; no Draft unless PO requests. |
| **Expected Deliverable** | New Official/FINAL document at declared path with document control. |
| **Repository Impact** | `docs/engineering/*` or declared path; SPEC_INDEX; INV/RIM; optional contracts/tests. |
| **Known Limitations** | Does not implement runtime; does not create ADRs unless ADL-001 requires (compose APP-Pattern-010). |
| **Acceptance Criteria** | Id unique; indexed; terminology protected; acceptance objective; no parallel concern. |
| **Example Usage** | Creating ES for ENG-01 when absent. |
| **Related Patterns** | APP-Pattern-002 (extension); APP-Pattern-006 (governance); APP-Pattern-010 (ADR). |

---

## APP-Pattern-002 — Specification Extension Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-002 |
| **Pattern Name** | Specification Extension Pattern |
| **Intent** | Safely extend an existing approved specification without redesign. |
| **Applicability** | SHALL when target ES/CM/protocol exists; MUST NOT invent a competing document. |
| **Context** | Target document Status Official/FINAL; RIM dependents known; SemVer/impact stated. |
| **Problem Statement** | Extensions silently break dependents or fork documents. |
| **Forces** | Backward compatibility; consumer blast radius; constitutional invariants. |
| **Solution** | Diff-scoped amendment; list Affected artifacts; preserve identifiers; bump version per document rules; update dependents; run declared tests. |
| **Expected Deliverable** | Amended specification + index/inventory updates. |
| **Repository Impact** | Target path; SPEC_INDEX if metadata changes; INV/RIM edges; contracts/tests as listed. |
| **Known Limitations** | Cannot change primary mission of the target without ADR + possible MAJOR. |
| **Acceptance Criteria** | No renamed protected terms; dependents listed; compatibility decision explicit; tests Pass if contracts touched. |
| **Example Usage** | Extending ES-007 with additional COV rule. |
| **Related Patterns** | APP-Pattern-001; APP-Pattern-005; APP-Pattern-008. |

---

## APP-Pattern-003 — Architecture Review Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-003 |
| **Pattern Name** | Architecture Review Pattern |
| **Intent** | Perform architectural analysis **without modifying** architecture. |
| **Applicability** | SHALL for reviews, audits, hotspot analysis; MUST NOT emit redesign proposals as normative changes. |
| **Context** | INV-001, RIM-001, SPEC_INDEX, target artifacts. |
| **Problem Statement** | Reviews mutate docs or invent alternatives mid-analysis. |
| **Forces** | Honesty vs action bias; observation vs prescription. |
| **Solution** | Read-only deliverable: findings, contradictions, risks, evidence paths; optional `Architectural Review` section; no new Engines/COs/ES unless separately tasked. |
| **Expected Deliverable** | Review report or AGR-style record; Status does not alter target specs. |
| **Repository Impact** | May add review doc under `docs/engineering/`; MUST NOT rewrite constitution silently. |
| **Known Limitations** | Does not approve ADRs; does not implement fixes. |
| **Acceptance Criteria** | No architecture mutation; evidence cited; findings identifier-tagged. |
| **Example Usage** | Consistency review across CEA vs legacy engine docs. |
| **Related Patterns** | APP-Pattern-007; APP-Pattern-009; APP-Pattern-010. |

---

## APP-Pattern-004 — Repository Analysis Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-004 |
| **Pattern Name** | Repository Analysis Pattern |
| **Intent** | Analyze repository structure as present on disk. |
| **Applicability** | SHALL for inventories, workspace audits, dual-tree detection; MUST NOT invent packages. |
| **Context** | Actual tree: `packages/`, `apps/`, `docs/`, `infrastructure/`, `src/`, root `package.json`. |
| **Problem Statement** | Documentation claims diverge from repository reality. |
| **Forces** | Doc truth vs disk truth; transitional UI vs PAS. |
| **Solution** | Enumerate paths; classify Live/Scaffold/Absent; compare to INV-001/RIM-001; report deltas. |
| **Expected Deliverable** | Analysis tables and/or INV/RIM update proposal (update only if tasked). |
| **Repository Impact** | Read-heavy; write only if Product Owner tasked inventory refresh. |
| **Known Limitations** | Does not migrate `src/` or create workspaces. |
| **Acceptance Criteria** | Every claim maps to a path; no assumed packages. |
| **Example Usage** | Refresh of live workspace list. |
| **Related Patterns** | APP-Pattern-005; APP-Pattern-003. |

---

## APP-Pattern-005 — Dependency Mapping Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-005 |
| **Pattern Name** | Dependency Mapping Pattern |
| **Intent** | Identify architectural and package dependencies. |
| **Applicability** | SHALL for RIM graphs, contract/runtime edges, CO lineage; MUST NOT invent cycles. |
| **Context** | package.json dependencies; ES Depends On; ES-007 CO coupling; RIM-001. |
| **Problem Statement** | Hidden dependents cause breakages. |
| **Forces** | Spec deps vs npm deps vs cognitive lineage. |
| **Solution** | Produce directed graphs; separate spec/runtime/CO/contract; mark isolated nodes and bottlenecks. |
| **Expected Deliverable** | Dependency graphs + hotspot list. |
| **Repository Impact** | Typically RIM-001 or companion map. |
| **Known Limitations** | Does not enforce boundary CI. |
| **Acceptance Criteria** | Acyclic npm graph verified or cycles reported; edges cite evidence. |
| **Example Usage** | Mapping `@prima/contracts` blast radius. |
| **Related Patterns** | APP-Pattern-004; APP-Pattern-009. |

---

## APP-Pattern-006 — Governance Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-006 |
| **Pattern Name** | Governance Pattern |
| **Intent** | Generate governance artifacts (lifecycles, protocols, standards, ownership rules). |
| **Applicability** | SHALL for ADL/PAP/PPS/AGR follow-ups; MUST NOT redefine Engine pedagogy. |
| **Context** | PDC, ADL-001, PAP-004, PPS-001, AGR-001. |
| **Problem Statement** | Governance emerges inconsistently without normative language. |
| **Forces** | Control vs velocity; role clarity. |
| **Solution** | Normative rules (SHALL/MUST); roles RACI; states/transitions; compliance ids; index registration. |
| **Expected Deliverable** | Governance Official document + index entries. |
| **Repository Impact** | `docs/engineering/` governance paths; SPEC_INDEX; ppef registry if prompt-related. |
| **Known Limitations** | Does not replace Product Constitution. |
| **Acceptance Criteria** | Roles defined; compliance rules numbered; no architecture redesign. |
| **Example Usage** | Creating ADL-001 or PPS-001. |
| **Related Patterns** | APP-Pattern-001; APP-Pattern-010. |

---

## APP-Pattern-007 — Validation Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-007 |
| **Pattern Name** | Validation Pattern |
| **Intent** | Verify engineering artifacts against normative rules. |
| **Applicability** | SHALL for compliance checks, COV, PPS-V\*, ATP Phase 7; MUST NOT grant Teacher Approval. |
| **Context** | Target artifact + governing specs + tests. |
| **Problem Statement** | Artifacts ship without verifiable Pass/Fail. |
| **Forces** | Critique vs authority; automation vs judgment. |
| **Solution** | Checklist of validators; execute tests where available; emit Pass/Fail with evidence; fail closed on Teacher Authority misuse. |
| **Expected Deliverable** | Validation report or green test evidence. |
| **Repository Impact** | May add tests; MUST NOT mutate approved design authority. |
| **Known Limitations** | Validation ≠ Approval (CO-09 ≠ CO-10). |
| **Acceptance Criteria** | Each rule Pass/Fail; evidence paths listed. |
| **Example Usage** | Validating a new ES against PPS/PAP/ADL. |
| **Related Patterns** | APP-Pattern-003; APP-Pattern-009. |

---

## APP-Pattern-008 — Migration Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-008 |
| **Pattern Name** | Migration Pattern |
| **Intent** | Support controlled architectural evolution (layout, versions, dual-tree, contract majors). |
| **Applicability** | SHALL for EV-MIG work; MUST NOT big-bang rewrite without ADR when ADL-001 applies. |
| **Context** | AGR B-01 dual-tree; SemVer; RIM hotspots; rollback plan. |
| **Problem Statement** | Migrations leave dual authorities or orphans. |
| **Forces** | Continuity vs cleanliness; rollback. |
| **Solution** | Sequence; compatibility windows; rollback; update INV/RIM; no orphan paths; ADR if required. |
| **Expected Deliverable** | Migration plan and/or executed migration with verification. |
| **Repository Impact** | `src/`↔apps, workspaces, contracts versions, docs precedence notes. |
| **Known Limitations** | Does not redesign Engines mid-migration. |
| **Acceptance Criteria** | Rollback tested or documented; single authority after cutover; indexes updated. |
| **Example Usage** | Migrating Teacher UI to `apps/teacher-workspace`. |
| **Related Patterns** | APP-Pattern-002; APP-Pattern-010; APP-Pattern-007. |

---

## APP-Pattern-009 — Quality Assessment Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-009 |
| **Pattern Name** | Quality Assessment Pattern |
| **Intent** | Measure architectural quality against declared attributes. |
| **Applicability** | SHALL for quality gates, hotspot ranking, readiness scoring; MUST NOT change architecture. |
| **Context** | CM-001 quality attrs; RIM hotspots; INV gaps; test coverage. |
| **Problem Statement** | Quality claims are subjective. |
| **Forces** | Metrics vs judgment; coverage vs depth. |
| **Solution** | Score against named attributes (explainability, isolation, test coverage, doc completeness); evidence per score. |
| **Expected Deliverable** | Quality assessment tables + risk ordering. |
| **Repository Impact** | Review/quality docs; optional INV summary update. |
| **Known Limitations** | Scores are advisory unless PO binds them to gates. |
| **Acceptance Criteria** | Attributes named; evidence cited; no silent redesign. |
| **Example Usage** | Ranking HS-01…HS-15 residual risk. |
| **Related Patterns** | APP-Pattern-003; APP-Pattern-005; APP-Pattern-007. |

---

## APP-Pattern-010 — Decision Support Pattern

| Field | Content |
|-------|---------|
| **Identifier** | APP-Pattern-010 |
| **Pattern Name** | Decision Support Pattern |
| **Intent** | Support architectural decision making via ADL-001-compliant ADR drafting or decision framing. |
| **Applicability** | SHALL when ADL-001 scope applies; MUST NOT implement before Approved. |
| **Context** | ADL-001 structure; parent AGR/ES; impact analysis sections. |
| **Problem Statement** | Decisions lack impact analysis and compliance. |
| **Forces** | Speed vs governance; options vs single decision. |
| **Solution** | Produce ADR Draft using ADL template; fill impact/traceability/compliance; stop at Draft/Review unless approval roles act. |
| **Expected Deliverable** | ADR file under `docs/engineering/adr/` or decision brief leading to ADR. |
| **Repository Impact** | `adr/`; ADR index; later ES/code only after Approved. |
| **Known Limitations** | Pattern does not Approve; PO/CSA roles do. |
| **Acceptance Criteria** | ADL mandatory sections present; ADL-C\* checklist included; no implementation commits claimed. |
| **Example Usage** | Drafting ADR for dual-tree policy closure. |
| **Related Patterns** | APP-Pattern-006; APP-Pattern-003; APP-Pattern-008. |

---

# 5. Pattern Selection Rules

1. The architect SHALL select **exactly one primary pattern**.  
2. Secondary patterns MAY supplement; they MUST NOT contradict the primary.  
3. Selection SHALL use Applicability fields and Evolution category (PAP-004 Phase 4):  

| Evolution (PAP-004) | Primary pattern SHOULD be |
|---------------------|---------------------------|
| EV-NEW | APP-Pattern-001 |
| EV-EXT | APP-Pattern-002 |
| EV-REF | APP-Pattern-002 or APP-Pattern-008 |
| EV-GOV | APP-Pattern-006 |
| EV-DOC | APP-Pattern-001/002 scoped to docs |
| EV-IMP | APP-Pattern-007 (+ implementation ES, not a new pattern id) |
| EV-MIG | APP-Pattern-008 |
| EV-FIX | APP-Pattern-007 (verify) then targeted APP-Pattern-002 |

4. If APP-Pattern-003 is primary, Generation MUST NOT mutate architecture.  
5. If uncertain between 001 and 002, SPEC_INDEX presence decides: exists → 002; absent → 001.

---

# 6. Pattern Composition

## 6.1 Valid compositions

| Primary | Allowed secondary |
|---------|-------------------|
| 001 | 005, 006, 007, 010 |
| 002 | 005, 007, 008, 010 |
| 003 | 004, 005, 007, 009 |
| 004 | 005, 009 |
| 005 | 003, 009 |
| 006 | 001, 010, 007 |
| 007 | 003, 009 |
| 008 | 002, 005, 007, 010 |
| 009 | 003, 005, 007 |
| 010 | 003, 006, 007 |

## 6.2 Prohibited compositions

| Composition | Reason |
|-------------|--------|
| 003 primary + 001 secondary that creates new architecture in same execution | Review must not create |
| 001 + 002 as co-primary | Exactly one primary |
| 010 claiming Implemented without Approved ADR | Violates ADL-001 |
| 008 + silent 001 inventing parallel target | Migration must not fork authority |
| Any pattern + parallel model introduction | PPS-001 / ATP forbidden |

---

# 7. Pattern Lifecycle

```
Draft → Review → Approved → Certified → Deprecated → Archived
```

| State | Meaning |
|-------|---------|
| **Draft** | Pattern text incomplete |
| **Review** | Submitted for CSA review |
| **Approved** | Authorized for use in prompts |
| **Certified** | Mandatory catalog member; validated in production PPEF use |
| **Deprecated** | Superseded; MUST NOT be selected as primary for new prompts |
| **Archived** | Historical only |

Core catalog APP-Pattern-001…010 at PPS-002 v1.0 is **Certified**.

Transitions SHALL follow CSA approval. Certified patterns REQUIRE MAJOR PPS-002 bump or superseding pattern id to break behaviour.

---

# 8. Pattern Validation

Every pattern SHALL define measurable validation criteria. Catalog-wide validators:

| ID | Criterion |
|----|-----------|
| **APPL-V01** | All §3 fields present |
| **APPL-V02** | Identifier unique in `ppef/registry.md` |
| **APPL-V03** | Applicability includes MUST NOT cases |
| **APPL-V04** | Acceptance criteria objective |
| **APPL-V05** | No redesign authorization in Solution |
| **APPL-V06** | Related Patterns listed |
| **APPL-V07** | Compatible with PPS-001 structure when used to author prompts |
| **APPL-V08** | Compatible with PAP-004 for architectural deliverables |

A pattern failing APPL-V\* MUST NOT be Approved/Certified.

---

# 9. Repository Integration

| Integrate with | Pattern usage |
|----------------|---------------|
| **Engineering Specifications** | 001/002 primary |
| **Runtime Specifications** | 002/007/008; runtime paths from RIM |
| **Contracts** | 002/007; list contract files in impact |
| **Pipelines** | 005/008; INV pipeline ids |
| **Governance** | 006/010; ADL/PAP/PPS |
| **Documentation** | 001/002/004; SPEC_INDEX/INV/RIM |
| **PPEF registry** | All patterns registered |
| **Prompts** | Prompt metadata SHALL declare `PrimaryPattern` and optional `SecondaryPatterns` |

Storage:

```
docs/engineering/PPS-002_ARCHITECTURAL_PROMPT_PATTERN_LANGUAGE.md  # this spec
docs/engineering/ppef/patterns/   # optional extractions pattern files (future)
docs/engineering/ppef/registry.md # pattern ids listed
```

---

# 10. Future Evolution

1. New patterns SHALL use next `APP-Pattern-NNN` id assigned by CSA.  
2. New patterns SHALL pass §3 and APPL-V\*.  
3. **No approved/certified pattern SHALL be broken** by MINOR/PATCH revisions of PPS-002.  
4. Breaking pattern behaviour REQUIRES new pattern id or PPS-002 MAJOR + deprecation of old pattern.  
5. Future families MUST map selection rules into §5 or an additive annex without invalidating §6 compositions.  
6. Patterns MUST remain architecture-preserving (no parallel models).

---

# Architectural Prompt Pattern Compliance Rules

| ID | Rule |
|----|------|
| **APPL-C01** | Architectural prompts in PPEF SHALL declare a primary APPL pattern. |
| **APPL-C02** | Exactly one primary pattern SHALL be selected. |
| **APPL-C03** | Secondary patterns MAY be used only per §6.1 and MUST obey §6.2. |
| **APPL-C04** | Patterns SHALL comply with the definition standard in §3. |
| **APPL-C05** | Core catalog APP-Pattern-001…010 is mandatory and Certified. |
| **APPL-C06** | APP-Pattern-003 executions MUST NOT modify architecture. |
| **APPL-C07** | APP-Pattern-010 MUST follow ADL-001; MUST NOT implement before Approved. |
| **APPL-C08** | Pattern selection SHALL align with PAP-004 Evolution category. |
| **APPL-C09** | Patterns MUST NOT redesign approved architecture or invent parallel models. |
| **APPL-C10** | Patterns MUST NOT rename protected terminology. |
| **APPL-C11** | Pattern lifecycle states SHALL be respected; Deprecated MUST NOT be primary. |
| **APPL-C12** | APPL-V01…V08 MUST Pass before Approved/Certified. |
| **APPL-C13** | Prompt metadata SHOULD include PrimaryPattern and SecondaryPatterns. |
| **APPL-C14** | Future patterns MUST NOT break Certified patterns (§10). |
| **APPL-C15** | PPS-001 compliance remains mandatory for all prompts using APPL. |
| **APPL-C16** | Repository integration updates (indexes/registry) SHALL occur when patterns are added. |
| **APPL-C17** | Non-compliant pattern usage MUST NOT produce repository commits. |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PPS-002 |
| **Title** | Architectural Prompt Pattern Language (APPL) |
| **Version** | 1.0 |
| **Status** | Official |
| **Location** | `docs/engineering/PPS-002_ARCHITECTURAL_PROMPT_PATTERN_LANGUAGE.md` |
