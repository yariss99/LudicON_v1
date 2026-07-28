---
Status: Official — Engineering Specification ADL-001
Version: 1.0
Owner: LUDI ON Chief System Architect
Depends On: PDC, PAS, POSS, AGR-001, SPEC_INDEX.md, INV-001, RIM-001, PAP-004, PPS-001, PPS-002
Related Documents: PRIMA_ARCHITECTURAL_PRINCIPLES.md, PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md, PAP-004_ARCHITECTURE_THINKING_PROTOCOL.md, PPS-001_PROMPT_ENGINEERING_STANDARD.md, PPS-002_ARCHITECTURAL_PROMPT_PATTERN_LANGUAGE.md
Last Updated: July 2026
---

# Architectural Decision Lifecycle

**Code:** ADL-001  
**Title:** Architectural Decision Lifecycle  
**Version:** 1.0  
**Status:** Official  
**ADR home:** `docs/engineering/adr/`  

> This specification defines **how architectural decisions are proposed, approved, implemented, verified, frozen, and retired**.  
> It does **not** redesign PRIMA architecture.  
> It does **not** itself constitute an Architecture Decision Record.

**Authority note:** Binding decisions today also exist inside AGR, CEA, CM, and ES documents. Those remain authoritative. Formal ADRs SHALL record and govern **subsequent** or **extracted** decisions under this lifecycle. Conflict between an ADR and POSS/PAS/PDC/CM-001 SHALL be resolved by amending the higher document first; ADRs MUST NOT silently override constitution.

---

# 1. Purpose

ADL-001 SHALL:

1. Establish a single lifecycle for architectural decisions affecting PRIMA ECOS.  
2. Mandate a uniform ADR structure and impact analysis.  
3. Bind decisions to specifications, contracts, runtime modules, cognitive objects, APIs, tests, and documentation.  
4. Enable traceability from decision → implementation → verification → freeze.  
5. Prevent silent architectural drift and undocumented runtime paths.

ADL-001 SHALL NOT:

- Replace POSS, PAS, PDC, CM-001, or ES-\* as sources of truth for their domains.  
- Authorize redesign of approved Engines, Cognitive Objects, or contracts.  
- Serve as a substitute for Engineering Specifications.

---

# 2. Scope

| In scope | Out of scope |
|----------|--------------|
| Decisions that change structure, boundaries, contracts, runtime topology, cognitive object coupling, governance, security posture, or repository layout | Day-to-day implementation tactics inside an approved ES |
| ADRs under `docs/engineering/adr/` | Product copy, UI microcopy |
| Impact analysis and compliance gates | LLM prompt tuning |
| Ownership and transition criteria | Creating product features without architectural effect |

**Applicability:** Any change that would alter INV-001 inventory classification, RIM-001 dependency edges, Engine ownership, CO coupling, or public contracts MUST follow this lifecycle.

---

# 3. Decision Categories

Every ADR SHALL declare exactly one **primary category** and MAY list secondary categories.

| Code | Category | Meaning | Typical authority parents |
|------|----------|---------|---------------------------|
| **CAT-STR** | Strategic | Product/platform direction with multi-year effect | Bible, AP, POSS |
| **CAT-ARC** | Architectural | Structure, boundaries, layers, Engine set | PAS, CEA, AP |
| **CAT-RUN** | Runtime | Kernel, buses, Composition Root, adapters | ES-002…004, SUP-CR |
| **CAT-COG** | Cognitive | CM-001 elaboration, CO catalog, pipeline cognition | CM-001, ES-007 |
| **CAT-REP** | Repository | Monorepo layout, workspaces, dual-tree policy | ES-001, AGR-001 |
| **CAT-CTR** | Contract | Typed contracts, envelopes, validators | `@prima/contracts`, ES-\* |
| **CAT-API** | API | Command/Query/HTTP/Engine service surfaces | DOC-CMD, DOC-QRY, ES-004/009 |
| **CAT-SEC** | Security | Authority, privacy, classification, threat controls | DOC-POL, Context privacy |
| **CAT-PERF** | Performance | Caching, throughput, latency budgets affecting design | ES-009 cache, PAS |
| **CAT-GOV** | Governance | AGR, ADL, ownership, release, compliance | PDC, AGR, ADL-001 |

**Rule:** CAT-STR and CAT-ARC decisions that contradict POSS/PAS/CM-001 MUST be rejected or must trigger a constitutional amendment before ADR Approval.

---

# 4. Decision States

```
Draft → Review → Approved → Implemented → Verified → Frozen
                                              ↘ Deprecated → Archived
                                         Frozen → Deprecated → Archived
```

## 4.1 State definitions

| State | Meaning |
|-------|---------|
| **Draft** | Decision proposed; incomplete impact analysis permitted |
| **Review** | Complete ADR submitted for formal review |
| **Approved** | Authorized for implementation; binding intent |
| **Implemented** | Code/docs changes landed per ADR |
| **Verified** | Tests and compliance checks confirm intent |
| **Frozen** | Stable; change requires new ADR (supersession) |
| **Deprecated** | No longer preferred; still referenced for history |
| **Archived** | Historical only; no new dependents MAY bind to it |

## 4.2 Mandatory transition criteria

### Draft → Review

SHALL be satisfied:

- ADR identifier assigned (`ADR-NNN`)  
- Title, category, status=`Review` candidate fields complete  
- Context and Decision Statement non-empty  
- Impact analysis sections present (may mark “None” explicitly)  
- Traceability parent/dependent fields present  
- No placeholder `TODO` / `TBD` in Decision Statement  

### Review → Approved

SHALL be satisfied:

- Compliance rules (§9) all pass  
- Product Owner approval recorded for CAT-STR, CAT-COG (Teacher Authority impact), CAT-SEC  
- Chief System Architect approval recorded for all categories  
- Engineering Lead acknowledgment recorded for CAT-RUN, CAT-CTR, CAT-API, CAT-REP  
- Affected ES/CM identifiers listed  
- Rollback strategy defined  
- No unresolved contradiction with POSS/PAS/PDC/CM-001/ES FINAL docs  

### Approved → Implemented

SHALL be satisfied:

- Implementation commits linked (SHAs or PR URLs)  
- Affected modules updated or explicitly marked “no code change”  
- Contract/version bumps performed when CAT-CTR applies  
- SPEC_INDEX / INV-001 / RIM-001 updated when inventory edges change  

### Implemented → Verified

SHALL be satisfied:

- Declared tests executed and passing  
- New COV / contract validators green when applicable  
- Undocumented runtime paths introduced by the change are documented or eliminated  
- QA sign-off recorded when CAT-API, CAT-SEC, or pipeline behaviour changes  

### Verified → Frozen

SHALL be satisfied:

- Verification evidence retained in ADR  
- No open blocking defects against the decision  
- Stability note set (align RIM Stability S1/S2 as applicable)  

### Frozen → Deprecated

SHALL be satisfied:

- Superseding ADR identifier exists and is at least **Approved**  
- Migration requirements for dependents documented  
- Consumers notified via ADR + SPEC_INDEX note  

### Deprecated → Archived

SHALL be satisfied:

- No active runtime module declares the deprecated decision as current authority  
- Superseding ADR is **Frozen** or **Verified**  
- Archive date recorded  

**Illegal transitions:** Any skip (e.g., Draft → Approved, Approved → Frozen) is VOID. Implementation MUST NOT proceed on Draft or Review.

---

# 5. Decision Ownership

| Role | Responsibilities |
|------|------------------|
| **Product Owner** | Approves CAT-STR; approves any decision affecting Teacher Authority, Export, or product promises; may veto CAT-COG/CAT-SEC; sets priority relative to roadmap |
| **Chief System Architect** | Owns ADL-001; assigns ADR ids; ensures consistency with POSS/PAS/PDC/CM-001/ES; approves all ADRs; maintains INV/RIM currency; rejects redesign disguised as ADR |
| **Engineering Lead** | Assesses implementability; owns runtime/repo/contract impact accuracy; sequences ES work; confirms migration/rollback feasibility |
| **Implementation Agent** | Implements only **Approved** ADRs; links commits; updates contracts/tests/docs as listed; MUST NOT invent parallel models; MUST escalate contradictions |
| **QA** | Verifies acceptance criteria and tests for Verified transition; blocks Verified if tests fail or Teacher Authority paths are untested when affected |

**RACI (summary)**

| Activity | PO | CSA | EL | Agent | QA |
|----------|----|-----|----|-------|-----|
| Draft ADR | C | A | C | R | I |
| Approve ADR | A* | A | C | I | I |
| Implement | I | C | A | R | I |
| Verify | I | C | C | C | A/R |
| Freeze / Deprecate | C | A | C | R | C |

\*PO is Accountable for CAT-STR/SEC/Teacher-impact; Consulted otherwise.

---

# 6. Mandatory ADR Structure

Every ADR file SHALL use the following sections in order. Section bodies MUST NOT be empty; use `None.` when applicable.

```markdown
---
ID: ADR-NNN
Title: <short imperative or descriptive title>
Status: Draft | Review | Approved | Implemented | Verified | Frozen | Deprecated | Archived
Category: CAT-…
Secondary Categories: []
Date Created: YYYY-MM-DD
Date Approved: YYYY-MM-DD | —
Owners:
  Product Owner: <name or role>
  Chief System Architect: <name or role>
  Engineering Lead: <name or role>
Supersedes: ADR-… | None
Superseded By: ADR-… | None
---

# ADR-NNN — <Title>

## 1. Context
## 2. Decision Drivers
## 3. Decision Statement
## 4. Consequences
### 4.1 Positive
### 4.2 Negative
### 4.3 Neutral
## 5. Alternatives Considered
## 6. Decision Impact Analysis
### 6.1 Affected Specifications
### 6.2 Affected Contracts
### 6.3 Affected Runtime Modules
### 6.4 Affected Cognitive Objects
### 6.5 Affected APIs
### 6.6 Affected Tests
### 6.7 Affected Documentation
### 6.8 Migration Requirements
### 6.9 Rollback Strategy
## 7. Traceability
### 7.1 Parent Decisions
### 7.2 Dependent Decisions
### 7.3 Superseded Decisions
### 7.4 Implementation Commits
### 7.5 Repository Modules
## 8. Compliance Checklist
## 9. Verification Evidence
## 10. Notes
```

**Filename convention:** `docs/engineering/adr/ADR-NNN_<short_snake_or_kebab_title>.md`  
**Index:** `docs/engineering/adr/README.md` SHALL list all ADRs with Status and Category.

---

# 7. Decision Impact Analysis

Every ADR SHALL identify impact as follows. Each subsection SHALL list identifiers from INV-001 / RIM-001 / SPEC_INDEX or state `None.`

| Subsection | SHALL list |
|------------|------------|
| **Affected Specifications** | POSS, PAS, PDC, CM-*, ES-*, AGR-*, ADL-001, INV-001, RIM-001, constitutional docs |
| **Affected Contracts** | `@prima/contracts` modules, SVC-*, Command/Event types |
| **Affected Runtime Modules** | `@prima/*` packages, engine packages, apps, infrastructure |
| **Affected Cognitive Objects** | CO-01…CO-20 and coupling rules COV-* |
| **Affected APIs** | Command Bus, Query, HTTP, Engine service APIs, Kernel APIs |
| **Affected Tests** | `test:*` scripts, test files, new cases required |
| **Affected Documentation** | Paths under `docs/` requiring amendment |
| **Migration Requirements** | Steps for existing data, packages, dual-tree, version bumps |
| **Rollback Strategy** | How to revert safely; which commits/tags; freeze impact |

**Rule:** If Impact Analysis omits a live workspace package that RIM-001 shows as dependent, Approval is forbidden.

---

# 8. Traceability

Every ADR SHALL reference:

| Field | Requirement |
|-------|-------------|
| **Parent decisions** | Higher ADRs, AGR decisions, or constitutional docs that authorize this ADR |
| **Dependent decisions** | Known follow-on ADRs (may be planned ids) |
| **Superseded decisions** | Explicit ADR ids or `None.` |
| **Implementation commits** | Git SHAs and/or PR links after Implemented |
| **Repository modules** | Paths matching RIM-001 module ids |

**Bidirectional rule:** When ADR-B depends on ADR-A, ADR-A’s Dependent Decisions section SHOULD list ADR-B once ADR-B reaches Review.

---

# 9. Compliance Rules

Before **Approved**, the following MUST validate to true:

| ID | Rule |
|----|------|
| **ADL-C01** | Decision Statement does not rename approved Engines, CO ids, or constitutional terms |
| **ADL-C02** | Decision does not introduce a parallel model for an existing ES/CM concern |
| **ADL-C03** | Decision does not contradict POSS/PAS/PDC/CM-001 without a linked constitutional amendment |
| **ADL-C04** | Teacher Authority (Approve / Authorize Generate / Export) remains teacher-bound if touched |
| **ADL-C05** | Impact Analysis complete per §7 |
| **ADL-C06** | Traceability parent present |
| **ADL-C07** | Rollback strategy present and actionable |
| **ADL-C08** | Category code valid per §3 |
| **ADL-C09** | No Engine↔Engine direct-call authorization introduced |
| **ADL-C10** | Knowledge ≠ Memory ≠ Context separations preserved if those domains touched |
| **ADL-C11** | Generation remains consequence of Approval lineage if pipeline touched |
| **ADL-C12** | SPEC_INDEX update plan present when new ES/code identifiers are introduced |

Failure of any ADL-C\* rule ⇒ MUST NOT transition to Approved.

---

# 10. Repository Integration

## 10.1 Engineering Specifications (ES-*)

- ADRs MAY mandate a new ES or an amendment to an existing ES.  
- An ADR SHALL NOT replace an ES.  
- ES Status FINAL/Official remains authoritative for its subject until amended.  
- When an ADR is Implemented, affected ES documents SHALL be updated in the same change set or an immediately subsequent change set linked in Traceability.

## 10.2 Runtime Specifications

- CAT-RUN ADRs SHALL name ES-002/003/004/006/009 (or future Engine ES) as Affected Specifications.  
- Runtime package versions SHALL bump when public behaviour changes.  
- Composition Root changes SHALL cite SUP-CR.

## 10.3 Contracts

- CAT-CTR ADRs SHALL list exact files under `packages/contracts/src/`.  
- Validators (including COV-*) SHALL be extended when coupling rules change.  
- Contract tests SHALL be listed under Affected Tests.

## 10.4 Pipelines

- Changes to PIPE-ECP, Command pipeline, Event pipeline, or Validation/Generation pipelines SHALL declare pipeline ids from INV-001.  
- ADRs that advance Orchestrator gating SHALL reference CO-17/CO-18.

## 10.5 Tests

- Verified requires evidence from Affected Tests.  
- `npm run test:packages` (or declared subset) SHALL pass for platform spine changes.  
- New illegal paths MUST gain tests when CAT-REP/CAT-CTR introduce boundaries.

## 10.6 Inventory and Intelligence Map

- INV-001 and RIM-001 SHALL be updated when modules, edges, or ownership change.  
- Hotspots MAY be re-ranked by CSA after Frozen ADRs that close risks.

## 10.7 ADR storage

```
docs/engineering/adr/
  README.md                 # index of ADR-NNN + status
  ADR-NNN_<title>.md        # records
  TEMPLATE.md               # copy source for Draft
```

## 10.8 PPEF / ATP integration

- Architectural ADR drafting SHALL observe **PAP-004** Phases 1–5 before Generation of the ADR body.  
- ADR-oriented prompts SHALL use **APP-Pattern-010** (PPS-002) as primary pattern.  
- PPEF prompts that authorize architecture-affecting work SHALL declare the ADR requirement per PPS-V10 / ADL-G02.

---

# 11. Architectural Decision Governance Rules

| ID | Rule |
|----|------|
| **ADL-G01** | All architectural decisions in scope of §2 SHALL be recorded as ADRs under `docs/engineering/adr/`. |
| **ADL-G02** | Implementation Agents MUST NOT merge architecture-affecting changes without an ADR in state **Approved** or later (except emergency hotfix followed by ADR within 5 business days). |
| **ADL-G03** | ADRs MUST use normative language in Decision Statement (SHALL / SHALL NOT / MUST / MUST NOT). |
| **ADL-G04** | ADRs MUST NOT redesign approved architecture; they MAY refine, constrain, sequence, or supersede via explicit amendment paths. |
| **ADL-G05** | Only the Chief System Architect MAY assign ADR numbers. |
| **ADL-G06** | Frozen ADRs MUST NOT be edited except for metadata corrections that do not change Decision Statement; substantive change REQUIRES supersession. |
| **ADL-G07** | Deprecated ADRs MUST name a superseding ADR. |
| **ADL-G08** | AGR decisions (e.g., AGR-001) are parent authorities; follow-up work SHALL be ADRs or ES amendments linked to the AGR. |
| **ADL-G09** | Dual-tree, boundary CI, and Composition Root decisions remain governed by AGR-001 backlog until closed by ADR/ES. |
| **ADL-G10** | Cognitive Object catalog changes REQUIRE CAT-COG primary category and CM-001 / ES-007 Affected Specifications. |
| **ADL-G11** | Contract breaks REQUIRE major version discipline in `@prima/contracts` and migration requirements. |
| **ADL-G12** | Security and Teacher Authority decisions REQUIRE Product Owner Approval. |
| **ADL-G13** | An ADR that fails compliance (§9) is void for implementation. |
| **ADL-G14** | SPEC_INDEX SHALL reference ADL-001 and the ADR index. |
| **ADL-G15** | Ambiguity in an Approved ADR SHALL be resolved by CSA clarification note or superseding ADR — never by silent implementation invention. |

---

# 12. Relationship to Existing Decision Artifacts

| Artifact | Relationship to ADL-001 |
|----------|-------------------------|
| AGR-001 | Parent gate decision; follow-ups become ADRs |
| CEA Engine keep/reject | Parent architectural decision; extract to ADR when amended |
| ES-007 FINAL Cognitive Objects | Parent cognitive decision; CO changes via ADR + ES amendment |
| INV-001 / RIM-001 | Consumers of ADR outcomes; updated on Implement/Verify |
| Embedded “DEC-\*” notes in docs | Historical; new durable decisions SHALL use ADRs |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | ADL-001 |
| **Title** | Architectural Decision Lifecycle |
| **Version** | 1.0 |
| **Status** | Official |
| **Location** | `docs/engineering/ADL-001_ARCHITECTURAL_DECISION_LIFECYCLE.md` |
