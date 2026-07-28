---
Status: Official — Architecture Thinking Protocol PAP-004
Version: 1.0
Owner: LUDI ON Chief System Architect
Depends On: DOC-AP, PDC, POSS, PAS, ADL-001, INV-001, RIM-001, SPEC_INDEX.md
Related Documents: AGR-001, CM-001, ES-*
Last Updated: July 2026
---

# Architecture Thinking Protocol (ATP)

**Code:** PAP-004  
**Title:** Architecture Thinking Protocol (ATP)  
**Version:** 1.0  
**Status:** Official — Mandatory  
**Class:** Protocol (not an Engineering Specification)

> ATP governs **how architectural reasoning SHALL proceed** before any architectural deliverable is produced.  
> ATP does **not** redefine PRIMA architecture.  
> ATP does **not** replace POSS, PAS, PDC, CM-001, ES-\*, or ADL-001.  
> No architectural deliverable is valid unless Phases 1–5 are completed before Phase 6 Generation.

**Applicability:** Every future architectural deliverable — including but not limited to ES amendments, ADRs, INV/RIM updates, contract changes, Engine specs, cognitive model amendments, governance docs, and architecture-affecting implementation support.

---

# Phase 1 — Architectural Context Acquisition

**Objective:** Establish factual context. Assumptions are forbidden.

Before creating any artifact, the Chief System Architect (or Implementation Agent acting under CSA authority) SHALL identify and record:

| Required identification | Source of truth |
|-------------------------|-----------------|
| Existing specifications | SPEC_INDEX, POSS, PAS, PDC, CM-\*, ES-\*, AGR-\*, ADL-001, PAP-004 |
| Affected contracts | `@prima/contracts`, constitutional CMD/EVT/POL/QRY/SVC docs, RIM contract nodes |
| Runtime dependencies | Live workspaces + scaffolds per RIM-001 / INV-001 |
| Cognitive dependencies | CM-001, ES-007 CO-\*, ES-007-CTX, ES-008 |
| Repository location | Exact path under repo conventions (ES-001, PAS module map) |
| Architectural owner | Engine / subsystem / role per CEA, SUP-MAP, RIM ownership |

**Exit criteria (Phase 1 complete):**

- Context record lists concrete identifiers (not prose guesses).  
- INV-001 / RIM-001 consulted for the subject area.  
- “Unknown” items are explicitly marked **Unknown** — invention to fill gaps is forbidden.  
- No assumption about undocumented runtime paths.

**Forbidden:** Proceeding to Phase 2 with unresolved “probably exists” claims.

---

# Phase 2 — Impact Analysis

**Objective:** Bound change versus invariance.

The actor SHALL determine and record:

| Question | Required answer form |
|----------|----------------------|
| What changes? | Explicit list of artifacts/behaviours |
| What remains invariant? | Explicit list bound to constitutional invariants (Teacher Authority, CO coupling, Engine isolation, Knowledge≠Memory≠Context, Generation-after-Approval) |
| What modules consume this artifact? | Consumer ids from RIM-001 |
| What modules depend on it? | Dependency ids from RIM-001 / package.json where live |
| Can backward compatibility be preserved? | Yes / No / Partial — with migration note if No or Partial |

**Exit criteria:**

- Impact table complete.  
- Invariants named; none silently weakened.  
- Compatibility decision stated.

**Link:** When change is architecture-affecting under ADL-001 §2, an ADR path SHALL be identified (existing Approved ADR or new Draft required before merge).

---

# Phase 3 — Consistency Verification

**Objective:** Prevent conflicting terminology and constitutional violation.

Validate the intended work against:

| Authority | Check |
|-----------|-------|
| Product Constitution (Bible, AP, POSS, CL, CEA, …) | No contradiction; no renamed approved concepts |
| Development Constitution (PDC) | Dependency and quality rules respected |
| Engineering Specifications (ES-\*) | No parallel ES for the same concern |
| Runtime Specifications | Kernel/Bus/SDK/Engine contracts respected |
| Contracts | Typed surfaces remain coherent; COV/validators considered |
| Repository conventions | Location, naming, workspace rules per ES-001 / SUP-MAP |

**Exit criteria:**

- Consistency checklist signed (CSA).  
- Conflicting terminology = **fail**; work stops or constitutional amendment is planned first.  
- Dual registries (e.g., Canonical Artifacts vs CO) use existing bridge rules — no third vocabulary.

---

# Phase 4 — Evolution Decision

**Objective:** Classify the work. Exactly **one primary category** SHALL be selected.

| Code | Primary category | Meaning |
|------|------------------|---------|
| **EV-NEW** | new capability | Capability absent from INV-001 as implemented |
| **EV-EXT** | extension | Additive growth of an approved artifact |
| **EV-REF** | refactoring | Internal restructuring without external contract change |
| **EV-GOV** | governance | Process, ADR, AGR, ownership, compliance |
| **EV-DOC** | documentation | Spec/doc only; no runtime behaviour change |
| **EV-IMP** | implementation support | Code realizing an already Approved ES/ADR |
| **EV-MIG** | migration | Move/dual-tree/version migration |
| **EV-FIX** | bug fix | Defect correction preserving intended contracts |

**Rules:**

- Secondary categories MAY be listed; primary MUST be unique.  
- EV-NEW that invents Engines/COs/models already rejected by CEA/CM/ES is forbidden.  
- EV-IMP without Approved ES/ADR (when ADL-001 requires one) is forbidden.  
- EV-DOC MUST NOT smuggle runtime redesign.

**Exit criteria:** Primary category recorded with justification of one sentence maximum (identifier-level, not essay).

---

# Phase 5 — Deliverable Planning

**Objective:** Define the generation plan before writing content or code.

The plan SHALL define:

| Plan element | Requirement |
|--------------|-------------|
| Artifact type | Spec · Protocol · ADR · Contract · Runtime · Test · Doc index · Other (named) |
| Repository location | Exact path |
| Dependencies | Upstream artifacts that MUST exist first |
| Implementation sequence | Ordered steps |
| Required tests | Commands/files; or `None` with justification |
| Required documentation updates | SPEC_INDEX, INV-001, RIM-001, related ES/CM, adr index as applicable |
| Acceptance criteria | Verifiable conditions for done |

**Exit criteria:**

- Plan is sufficient for an Implementation Agent to execute without invention.  
- Orphan risk addressed (every new artifact has index/owner/consumers or explicit “index update” step).

---

# Phase 6 — Generation

**Objective:** Produce the deliverable.

Generation SHALL begin only when Phases 1–5 exit criteria are met.

During Generation:

- Approved terminology SHALL be used exclusively.  
- No parallel models.  
- No redesign of approved components.  
- Normative language for specifications and protocols (SHALL / MUST / …).  
- Examples only if explicitly requested by the Product Owner.

**Exit criteria:** Deliverable exists at the planned repository location.

---

# Phase 7 — Architectural Validation

**Objective:** Verify the generated artifact before declaring completion.

| Validation | Requirement |
|------------|-------------|
| Terminology | Matches Constitutional Language / ES names |
| Traceability | Upstream/downstream refs resolvable |
| Identifier uniqueness | No colliding ES/ADR/CO/ENG/PAP ids |
| Repository compatibility | Path and package layout valid |
| Contract compatibility | No silent contract break; version/migration if needed |
| Pipeline compatibility | PIPE-ECP / Command / Event rules intact |
| Cross-reference integrity | Links and SPEC_INDEX entries correct |

**Exit criteria:** Validation record shows all checks Pass; failures block Phase 8 completion.

---

# Phase 8 — Repository Integration

**Objective:** Eliminate orphans and update the navigable graph.

Identify and update every artifact that MUST change, including as applicable:

- SPEC_INDEX  
- INV-001  
- RIM-001  
- ADL-001 ADR index  
- Related ES/CM/CEA docs  
- `packages/*/README` and workspace manifests  
- Tests and CI scripts  

**Rule:** No orphan artifacts SHALL remain — every new architectural artifact SHALL have owner, index entry, and declared consumers or an explicit “not consumed yet (scaffold)” note in INV/RIM.

**Exit criteria:** Integration checklist complete; RIM/INV edges reflect reality.

---

# Mandatory Architectural Thinking Rules

| ID | Rule |
|----|------|
| **ATP-R01** | Phases 1–5 SHALL be completed before Phase 6 Generation for every architectural deliverable. |
| **ATP-R02** | Assumptions are forbidden in Phase 1; unknowns SHALL be marked Unknown. |
| **ATP-R03** | Exactly one primary Evolution category (Phase 4) SHALL be selected. |
| **ATP-R04** | Conflicting terminology SHALL fail Phase 3; work MUST NOT proceed. |
| **ATP-R05** | Approved architecture SHALL NOT be redesigned via ATP; ATP sequences reasoning only. |
| **ATP-R06** | Parallel models for an existing concern are forbidden. |
| **ATP-R07** | Teacher Authority, Engine isolation, Knowledge≠Memory≠Context, and Generation-after-Approval invariants SHALL remain listed as invariant when touched. |
| **ATP-R08** | Architecture-affecting changes in ADL-001 scope SHALL identify or create the required ADR before merge. |
| **ATP-R09** | Phase 7 Validation failure blocks completion. |
| **ATP-R10** | Phase 8 SHALL leave no orphan artifacts. |
| **ATP-R11** | Implementation Agents MUST follow the Phase 5 plan; deviation REQUIRES CSA re-entry at Phase 2. |
| **ATP-R12** | ATP itself is not an ES; ES documents remain the implementation authority for their subjects. |
| **ATP-R13** | PAP-004 is mandatory for CSA and for any agent producing architectural deliverables in this repository. |
| **ATP-R14** | Emergency hotfixes that skip ATP SHALL be followed by ATP Phases 1–8 and ADR (if required) within 5 business days. |
| **ATP-R15** | Ambiguity after Phase 5 SHALL be resolved before Generation — never during Generation by invention. |

---

# Relationship to Other Governance Artifacts

| Artifact | Relationship |
|----------|--------------|
| ADL-001 | Decision lifecycle for ADRs; ATP precedes ADR drafting and all other architectural deliverables |
| AGR-001 | Gate decisions; ATP used when executing AGR follow-ups |
| INV-001 / RIM-001 | Phase 1/2/8 inputs and outputs |
| PDC | Development constitution; Phase 3 authority |
| ES-\* | Implementation specifications produced under ATP — not replaced by ATP |

---

# Minimal ATP Record (required evidence)

For each architectural deliverable, retain a short record (in ADR, ES preamble, or companion note) containing:

1. Phase 1 identifiers  
2. Phase 2 impact summary  
3. Phase 3 consistency result (Pass/Fail)  
4. Phase 4 primary category  
5. Phase 5 plan pointers  
6. Phase 7 validation result  
7. Phase 8 integration list  

Absence of this record ⇒ deliverable is non-compliant with PAP-004.

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PAP-004 |
| **Title** | Architecture Thinking Protocol (ATP) |
| **Version** | 1.0 |
| **Status** | Official — Mandatory |
| **Location** | `docs/engineering/PAP-004_ARCHITECTURE_THINKING_PROTOCOL.md` |
