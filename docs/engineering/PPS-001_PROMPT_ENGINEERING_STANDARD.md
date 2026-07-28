---
Status: Official — Engineering Specification PPS-001
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PDC, PAP-004, ADL-001, POSS, PAS, CM-001, SPEC_INDEX.md, INV-001, RIM-001
Related Documents: AGR-001, ES-*
Last Updated: July 2026
---

# PPS-001 — Prompt Engineering Standard

**Code:** PPS-001  
**Title:** Prompt Engineering Standard  
**Version:** 1.0  
**Status:** Official — Constitutional for PPEF  
**Framework:** PRIMA Prompt Engineering Framework (PPEF)

> Every prompt created within PPEF SHALL comply with this standard.  
> Architectural prompts SHALL produce deterministic engineering deliverables.  
> Prompts SHALL reduce ambiguity and preserve architectural consistency.  
> This standard does **not** redesign PRIMA architecture.

---

# 1. Purpose

PPS-001 defines the normative rules for **architectural and engineering prompts** used to evolve, review, validate, and document the PRIMA Educational Cognitive Operating System (ECOS).

Architectural prompts within PRIMA SHALL:

1. Produce **deterministic engineering deliverables** suitable for direct repository commit.  
2. **Reduce ambiguity** to zero on identifiers, ownership, location, and acceptance.  
3. **Preserve architectural consistency** with POSS, PAS, PDC, CM-001, ES-\*, contracts, and repository conventions.  
4. Operate under **PAP-004 Architecture Thinking Protocol** when the deliverable is architectural.  
5. Remain **implementation-agent consumable** without requiring inventiveness.

PPS-001 SHALL NOT authorize prompts that invent parallel models, rename approved concepts, or bypass Teacher Authority invariants.

---

# 2. Scope

## 2.1 Governed prompt families

| Family | Code prefix | Meaning |
|--------|-------------|---------|
| **PAP** | `PAP-NNN` | Architecture / protocol prompts (e.g., PAP-004 ATP) |
| **APP** | `APP-NNN` | Application / product-engineering prompts under PPEF |
| **PPS** | `PPS-NNN` | Prompt standards and meta-prompts (this document is PPS-001) |
| **Future PPEF families** | Assigned by CSA | SHALL register in SPEC_INDEX and comply with PPS-001 §15 |

## 2.2 In scope

- Prompts that produce or amend specs, protocols, ADRs, contracts, runtime design, reviews, migrations, tests, and repository structure.  
- Prompt templates stored under the PPEF repository location (§14).  

## 2.3 Out of scope

- Teacher-facing product copy and classroom content generation prompts (governed by product Prompt/Voice policies — not PPEF constitutional prompts).  
- Ephemeral chat without repository deliverable intent.  

---

# 3. Prompt Classification

Every prompt SHALL declare exactly **one primary category**. Secondary categories MAY be listed.

| Code | Category | Typical deliverable |
|------|----------|---------------------|
| **PC-ARC** | Architecture | Structure, boundaries, graphs, inventories |
| **PC-ENG** | Engineering | ES-\*, runtime design, Engine specs |
| **PC-GOV** | Governance | ADL, AGR follow-ups, ownership, compliance |
| **PC-REV** | Review | Architecture reviews, consistency audits |
| **PC-VAL** | Validation | Compliance/validation protocols |
| **PC-MIG** | Migration | Dual-tree, version, package migrations |
| **PC-QUA** | Quality | Quality attributes, non-functional gates |
| **PC-TST** | Testing | Test strategies, test specs |
| **PC-REP** | Repository | Layout, workspaces, module maps |
| **PC-DOC** | Documentation | Indexes, cross-refs, doc integration |
| **PC-RUN** | Runtime | Kernel, buses, Composition Root, adapters |
| **PC-COG** | Cognitive | CM-001, ES-007 CO-\*, cognition protocols |

**Rule:** A prompt MUST NOT claim two primary categories.

---

# 4. Mandatory Prompt Structure

Every PPEF prompt SHALL contain the following sections, in order. Empty sections are forbidden; use `None.` when applicable.

| # | Section | Content requirement |
|---|---------|---------------------|
| 1 | **Identifier** | Unique id (`PAP-NNN` / `APP-NNN` / family code) |
| 2 | **Title** | Short precise title |
| 3 | **Version** | SemVer per §12 |
| 4 | **Purpose** | Why the prompt exists; deliverable intent |
| 5 | **Context** | Approved specs, repo state, implementation status, assumptions, missing information (§5) |
| 6 | **Inputs** | Required inputs from Product Owner / repository |
| 7 | **Constraints** | Immutables, terminology, compatibility, conventions, limitations (§6) |
| 8 | **Required reasoning scope** | PAP-004 phases required; ADR requirement if any |
| 9 | **Expected deliverable** | Artifact type, path, sections, detail level (§7) |
| 10 | **Acceptance criteria** | Objective, verifiable conditions (§8) |
| 11 | **Repository impact** | Files/indexes/modules to create or update |
| 12 | **Normative rules** | SHALL/MUST rules specific to this prompt |
| 13 | **Completion criteria** | When execution is finished (distinct from acceptance if needed) |

---

# 5. Context Rules

Prompts SHALL provide context in five explicit buckets. Mixing buckets is forbidden.

| Bucket | SHALL contain |
|--------|---------------|
| **Approved specifications** | SPEC_INDEX ids (POSS, PAS, PDC, CM-\*, ES-\*, ADL-001, PAP-004, …) |
| **Repository state** | Paths, workspaces, RIM-001 nodes relevant to the task |
| **Implementation status** | Live / Partial / Scaffold / Absent per INV-001 |
| **Assumptions** | Only Product Owner–confirmed assumptions; else `None.` |
| **Missing information** | Explicit Unknowns; MUST NOT be silently filled |

**Rules:**

- No hidden assumptions SHALL be introduced during execution.  
- If Missing information blocks determinism, the prompt SHALL require clarification or mark the deliverable blocked — not invent content.  
- Approved specifications take precedence over repository accidents.

---

# 6. Constraint Rules

Every prompt SHALL explicitly identify:

| Constraint class | Requirement |
|------------------|-------------|
| **Immutable artifacts** | What MUST NOT change (e.g., ENG catalog, CO ids, Teacher Authority) |
| **Protected terminology** | Constitutional Language / ES names that MUST be reused |
| **Backward compatibility** | Preserve / Break+migrate / N/A — stated explicitly |
| **Repository conventions** | ES-001 layout, naming, workspace rules |
| **Implementation limitations** | e.g., no peer Engine calls; Ports only; no new ES number collision |

Prompts SHALL include the standing constraints unless explicitly overridden by an Approved ADR:

- No redesign of approved architecture  
- No parallel models  
- No renaming of approved concepts  
- Generation remains consequence of Approval lineage when pipeline touched  
- Knowledge ≠ Memory ≠ Context  

---

# 7. Deliverable Rules

Every prompt SHALL specify:

| Element | Requirement |
|---------|-------------|
| **Artifact type** | Spec · Protocol · ADR · Contract · Runtime · Test · Index · Prompt · Other (named) |
| **Required sections** | Outline matching target document type |
| **Expected level of detail** | Normative completeness for repository commit |
| **Normative language** | SHALL / MUST / SHOULD / MAY for specs and protocols |
| **Repository readiness** | Final-quality; no drafts unless Product Owner explicitly requests Draft |

**Forbidden outputs unless explicitly requested:** drafts, placeholders, TODO, speculative alternatives, examples.

---

# 8. Acceptance Criteria

Every prompt SHALL define measurable completion conditions.

Acceptance SHALL be:

1. **Objective** — no subjective taste criteria.  
2. **Independently verifiable** — second agent or human can check without original author.  
3. **Bound to artifacts** — paths, identifiers, test commands, index entries.  

Minimum acceptance set for architectural prompts:

- Deliverable exists at declared path  
- SPEC_INDEX (or declared index) updated when required  
- Terminology matches protected set  
- Acceptance checklist items all Pass  

---

# 9. Prompt Metadata

Mandatory metadata (YAML front matter or equivalent header):

| Field | Requirement |
|-------|-------------|
| `Identifier` | Unique PPEF id |
| `Version` | SemVer |
| `Owner` | Role or named owner |
| `Status` | Draft · Review · Approved · Active · Deprecated · Archived |
| `Dependencies` | Prompt ids + spec ids |
| `Affected artifacts` | INV/RIM/SPEC ids and paths |
| `Prompt family` | PAP · APP · PPS · registered future family |
| `Primary category` | PC-\* code |
| `Priority` | P0 · P1 · P2 · P3 |
| `Repository location` | Path to prompt file |
| `Last review` | YYYY-MM-DD |

Status **Active** means approved for execution. Draft/Review prompts MUST NOT be used for production repository generation.

---

# 10. Prompt Quality Rules

Every Active prompt SHALL satisfy:

| Attribute | Meaning |
|-----------|---------|
| **Completeness** | All §4 sections present and non-vacuous |
| **Consistency** | Aligns with PPS-001, PAP-004, ADL-001, constitutional terms |
| **Traceability** | Dependencies and affected artifacts resolvable |
| **Determinism** | Same inputs ⇒ same deliverable shape and acceptance |
| **Maintainability** | Versioned; change history via SemVer + review date |
| **Repository compatibility** | Paths and naming fit ES-001 / SPEC_INDEX |
| **Extensibility** | New families possible without breaking §15 rules |
| **Reviewability** | Acceptance criteria enable independent review |

Failure of any attribute ⇒ prompt MUST NOT be Approved/Active.

---

# 11. Validation Rules

Before execution, every prompt SHALL pass validation:

| ID | Validation |
|----|------------|
| **PPS-V01** | Context completeness (§5 buckets present) |
| **PPS-V02** | Identifier uniqueness across PPEF registry |
| **PPS-V03** | Dependency integrity (referenced specs/prompts exist or are explicitly planned) |
| **PPS-V04** | Terminology consistency with Constitutional Language / ES |
| **PPS-V05** | Repository compatibility (location, naming) |
| **PPS-V06** | Primary category exactly one |
| **PPS-V07** | Acceptance criteria objective and verifiable |
| **PPS-V08** | Constraints include immutables and protected terminology |
| **PPS-V09** | If architectural deliverable: PAP-004 reasoning scope declared |
| **PPS-V10** | If architecture-affecting under ADL-001: ADR requirement declared |

Validation failure ⇒ execution MUST NOT start.

---

# 12. Versioning

Prompts SHALL use Semantic Versioning `MAJOR.MINOR.PATCH`.

| Level | SHALL change when |
|-------|-------------------|
| **MAJOR** | Breaking change to Expected deliverable shape, Acceptance criteria, or Normative rules that invalidate prior executions |
| **MINOR** | Additive sections, new optional constraints, expanded context — backward compatible |
| **PATCH** | Clarifications, typo fixes, metadata corrections that do not change behaviour |

**Rules:**

- Status transitions do not alone bump version.  
- Deprecated prompts keep version; supersession references new Identifier or new MAJOR.  
- Executors SHALL declare which prompt Version was used in the deliverable’s document control or ATP record.

---

# 13. Governance

| Action | Authorized role |
|--------|-----------------|
| **Create** prompts | Chief System Architect; Engineering Lead (Draft only) |
| **Modify** prompts | CSA; EL for Draft/Review; Active requires CSA |
| **Approve** prompts (→ Active) | Chief System Architect; Product Owner for PC-GOV affecting Teacher Authority or CAT-STR scope |
| **Deprecate** prompts | Chief System Architect |
| **Archive** prompts | Chief System Architect after supersession or obsolescence |

Implementation Agents MAY execute **Active** prompts only. They MUST NOT approve or silently modify prompt normative sections.

---

# 14. Repository Integration

## 14.1 Storage layout

```
docs/engineering/ppef/
  README.md                 # PPEF index
  PPS-001_…md               # this standard (also linked from SPEC_INDEX)
  pap/                      # PAP family prompts
  app/                      # APP family prompts
  registry.md               # identifier registry
```

Canonical standard path: `docs/engineering/PPS-001_PROMPT_ENGINEERING_STANDARD.md`  
PPEF index SHALL link all Active prompts.

## 14.2 Integration matrix

| Integrate with | Prompt SHALL |
|----------------|--------------|
| **Engineering Specifications** | Name ES ids in Context/Dependencies; update ES when deliverable amends them |
| **Cognitive Models** | Use CM-001 / ES-007 terminology; PC-COG for cognition work |
| **Architecture Decision Records** | Declare ADR requirement per ADL-001 when in scope |
| **Runtime Specifications** | Reference ES-002…009 / Engine ES; no peer-Engine calls |
| **Contracts** | List contract files; require tests when contracts change |
| **Tests** | Name `npm run test:*` or test paths in Acceptance |
| **Pipelines** | Reference INV pipeline ids when sequencing/gates change |
| **Documentation** | Mandate SPEC_INDEX / INV-001 / RIM-001 updates when graph changes |
| **PAP-004 ATP** | Require Phases 1–5 before Generation for architectural deliverables |

---

# 15. Future Evolution

Future PPEF prompt families SHALL:

1. Register family code and prefix in SPEC_INDEX and `ppef/registry.md`.  
2. Comply with PPS-001 structure (§4), metadata (§9), validation (§11), and quality (§10).  
3. Preserve identifier uniqueness globally.  
4. Avoid breaking Active prompts: breaking changes REQUIRE MAJOR version or new Identifier.  
5. Remain compatible with PAP-004 and ADL-001.  
6. NOT introduce parallel architectural models.  

PPS-001 MINOR versions MAY add optional sections; MAJOR versions MAY require migration notes for Active prompts.

---

# Prompt Engineering Compliance Rules

| ID | Rule |
|----|------|
| **PPS-C01** | Every PPEF prompt SHALL comply with PPS-001. |
| **PPS-C02** | Every prompt SHALL use the mandatory structure in §4. |
| **PPS-C03** | Every prompt SHALL have exactly one primary category (§3). |
| **PPS-C04** | No hidden assumptions SHALL be introduced (§5). |
| **PPS-C05** | Immutable artifacts and protected terminology SHALL be stated (§6). |
| **PPS-C06** | Deliverables SHALL be repository-ready; drafts ONLY if explicitly requested (§7). |
| **PPS-C07** | Acceptance criteria SHALL be objective and independently verifiable (§8). |
| **PPS-C08** | Mandatory metadata SHALL be present (§9). |
| **PPS-C09** | Quality attributes in §10 MUST all Pass before Active status. |
| **PPS-C10** | Validation PPS-V01…V10 MUST Pass before execution (§11). |
| **PPS-C11** | Versioning SHALL follow SemVer rules in §12. |
| **PPS-C12** | Only authorized roles MAY create, approve, deprecate, or archive prompts (§13). |
| **PPS-C13** | Architectural prompt executions SHALL observe PAP-004. |
| **PPS-C14** | Architecture-affecting work SHALL observe ADL-001 when applicable. |
| **PPS-C15** | Prompts MUST NOT redesign approved architecture or invent parallel models. |
| **PPS-C16** | Prompts MUST NOT rename approved Engines, CO ids, or constitutional terms. |
| **PPS-C17** | Teacher Authority invariants MUST remain protected when pipeline/authority is in scope. |
| **PPS-C18** | Future families MUST register and remain PPS-001 compatible (§15). |
| **PPS-C19** | Executors SHOULD record prompt Identifier+Version on the produced artifact’s document control. |
| **PPS-C20** | Non-compliant prompts MUST NOT be executed for repository commits. |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PPS-001 |
| **Title** | Prompt Engineering Standard |
| **Version** | 1.0 |
| **Status** | Official — Constitutional for PPEF |
| **Location** | `docs/engineering/PPS-001_PROMPT_ENGINEERING_STANDARD.md` |
