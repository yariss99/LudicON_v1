---
Status: Official — Engineering Specification PPS-006
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PPS-005, PPS-004, PPS-001, PPS-002, PAP-004, ADL-001, PDC, SPEC_INDEX.md
Related Documents: INV-001, RIM-001
Last Updated: July 2026
---

# PPS-006 — Prompt Semantic Model (PSM)

**Code:** PPS-006  
**Title:** Prompt Semantic Model (PSM)  
**Version:** 1.0  
**Status:** Official — Semantic execution model of PPEF  
**Framework:** PRIMA Prompt Engineering Framework (PPEF)

> PSM defines **how** Prompt Ontology entities **interact** to produce coherent architectural behaviour.  
> PPS-005 PO defines **vocabulary** (what things are called).  
> PPS-004 PMM defines **object structure** (what a Prompt is).  
> PSM defines **semantic behaviour** (how meaning is acquired and preserved during execution).  
> PSM does **not** redesign PRIMA ECOS architecture.

**PPEF stack (behavioural view)**

| Layer | Role |
|-------|------|
| PPS-005 PO | Vocabulary & entity types |
| PPS-004 PMM | Prompt Object identity & components |
| **PPS-006 PSM** | Semantic domains, roles, interactions, state meaning, integrity |
| PAP-004 ATP | Ordered reasoning before Generation |
| PPS-001 / PPS-002 | Writing standard & patterns |

On behavioural conflict within PPEF → **PPS-006 prevails**.  
On term definitions → **PPS-005 prevails**.  
On ECOS constitution → POSS/PAS/CM/ES prevail by reference.

---

# 1. Purpose

The Prompt Semantic Model (PSM) is the **semantic execution layer** of PPEF.

PSM SHALL:

1. Describe how prompt entities **acquire and preserve semantic meaning through interaction**.  
2. Specify **behaviour** (domains, roles, interactions, transitions, effects) rather than vocabulary.  
3. Constrain AI and human executors so Execution remains **deterministic, traceable, and architecture-preserving**.  
4. Bind semantic effects to **repository artifacts** without inventing parallel models.

---

# 2. Semantic Domains

Every Prompt Execution SHALL declare one **primary semantic domain**. Secondary domains MAY apply.

| Code | Domain | Semantic meaning in execution |
|------|--------|------------------------------|
| **SD-ARC** | Architecture | Structure, boundaries, inventories, graphs; no silent redesign |
| **SD-REP** | Repository | Paths, workspaces, indexes, dual-tree; disk truth prevails |
| **SD-GOV** | Governance | Ownership, ADR, lifecycle gates, compliance authority |
| **SD-ENG** | Engineering | ES production/amendment; normative specs |
| **SD-VAL** | Validation | Pass/Fail evaluation; no Approval authority |
| **SD-CRT** | Certification | Elevation to Certified; requires Pass Validation |
| **SD-EVO** | Evolution | Extension, migration, versioning, supersession |
| **SD-REA** | Reasoning | PAP-004 phases; pattern selection; impact analysis |
| **SD-EXE** | Execution | Generation act; deliverable materialization |
| **SD-KNO** | Knowledge | Binding to approved specs/contracts as evidence; not inventing ECOS Knowledge Packs unless tasked |

**Rule:** SD-VAL MUST NOT be treated as SD-GOV Approval. SD-EXE MUST NOT begin before SD-REA completion when the Prompt is architectural (PAP-004).

---

# 3. Semantic Roles

Every participant in a Prompt Object’s lifecycle SHALL act in one or more semantic roles. Exactly one role is **primary** per actor per Execution.

| Role | Code | Semantic duty |
|------|------|---------------|
| **Producer** | SR-PRO | Creates or amends the primary Deliverable |
| **Consumer** | SR-CON | Uses Prompt or Deliverable without write authority on constitution |
| **Coordinator** | SR-CRD | Sequences multi-artifact updates (indexes, INV/RIM) |
| **Validator** | SR-VAL | Applies Validation rules; emits Pass/Fail |
| **Reviewer** | SR-REV | Issues Review Decision (Approve/Reject) |
| **Governor** | SR-GOV | Enforces ownership, ADR, certification, deprecation |
| **Observer** | SR-OBS | Records Execution evidence without mutating meaning |
| **Resolver** | SR-RES | Resolves Conflicts With / Unknowns; MAY block Execution |
| **Planner** | SR-PLN | Completes PAP-004 Phases 1–5 / deliverable plan |
| **Executor** | SR-EXE | Performs Generation under Constraints |

**Binding:** Implementation Agent is typically SR-EXE + SR-PRO. CSA is typically SR-GOV + SR-REV. QA is typically SR-VAL. Product Owner is SR-REV for Teacher Authority / strategic scope.

**Ambiguity ban:** Two actors MUST NOT both claim exclusive SR-GOV on the same Prompt without transfer recorded (PO-I01 / PSM integrity).

---

# 4. Semantic Interactions

Interactions are behavioural edges. They refine PO relationship types with **runtime semantics**.

| Interaction | Direction | Preconditions | Postconditions | Expected effects |
|-------------|-----------|---------------|----------------|------------------|
| **Consumes** | Actor/Prompt → Context\|Dependency\|Artifact | Target Present; not Archived if Required | Context bound for Execution | Meaning narrowed to approved facts |
| **Produces** | Execution → Deliverable | Reasoning complete; Validation pre-exec Pass | Primary Deliverable exists at path | Repository gains artifact |
| **Transforms** | Execution → Artifact′ | Source artifact identified; Extends/Migrates allowed | Artifact′ version/path updated | Semantic identity preserved; content evolved |
| **Validates** | Validator → Artifact | RuleSet known | Outcome Pass\|Fail + Evidence | Gate opens or blocks |
| **Approves** | Reviewer → Prompt\|ADR\|Deliverable | Review state; authority role | Status→Approved (or rejected) | Execution authorization |
| **Extends** | Prompt → Spec/Prompt | Target exists | Additive change only | No parallel model |
| **Constrains** | Constraint → Execution | Constraints listed | Execution within bounds | Invariants preserved |
| **Triggers** | Event\|Requires → Execution\|Validation | Precondition satisfied | Downstream act starts | Ordered pipeline |
| **Synchronizes** | Coordinator → Indexes/Registry | Produces completed | INV/RIM/SPEC_INDEX/registry aligned | No orphans |
| **Observes** | Observer → Execution | Execution id exists | Audit record | Traceability only |

**Mapping to PO:** Consumes↔CONSUMES; Produces↔PRODUCES/GENERATES; Validates↔VALIDATES; Extends↔EXTENDS; Approves⊂ Review/Governor acts; Constrains↔Constraint PART_OF; Triggers↔REQUIRES; Observes↔REFERENCES (weak).

---

# 5. Semantic State Transitions

Semantic meaning of a Prompt Object / Execution changes with state. PSM states align to PPEF lifecycles and extend Execution meaning.

| State | Semantic meaning | Allowed interactions | Forbidden |
|-------|------------------|----------------------|-----------|
| **Draft** | Intent incomplete; meaning not binding | Observe, Constrains (drafting) | Produces (production), Approves, Certifies |
| **Review** | Meaning proposed for governance | Validates, Observes, Approves/Rejects | Production Produces |
| **Approved** | Meaning authorized; not yet generally executable | Triggers→Active, Synchronizes registry | Silent Produces without Active when policy requires Active |
| **Executed** | Generation performed; Deliverable materialised | Produces, Observes, Triggers→Validates | Redefine Intent mid-flight |
| **Validated** | Deliverable/Prompt Pass against RuleSet | Triggers→Certify or Accept | Treat Fail as Pass |
| **Certified** | Mandatory/catalog meaning locked | Extends only via governed revision | Breaking change without MAJOR/supersession |
| **Archived** | Historical meaning only | Observes, References | Consumes as Required dependency |

**Transition semantics**

```
Draft → Review → Approved → (Active) → Executed → Validated → Certified?
                                      ↘ Failed Validation → Review/Draft
Certified|Validated → Deprecated → Archived
```

**Notes:**  
- **Active** (PPS-004) is the executability gate between Approved and Executed.  
- **Certified** applies primarily to Patterns/Standards; Prompts MAY be Certified when catalogued as mandatory.  
- Semantic meaning MUST NOT flip without an explicit interaction (Approves, Validates, Produces, Synchronizes).

---

# 6. Semantic Integrity Rules

| ID | Invariant |
|----|-----------|
| **PSM-I01** | **No semantic cycles** in DEPENDS_ON / REQUIRES / EXTENDS / IMPLEMENTS graphs among Active Prompts |
| **PSM-I02** | **No orphan semantic objects** — every Active Prompt, Deliverable, Validation, Certification maps to a Repository Artifact or explicit registry entry |
| **PSM-I03** | **No conflicting ownership** — exactly one Owner; no dual SR-GOV without transfer |
| **PSM-I04** | **No ambiguous responsibilities** — primary semantic role per actor per Execution |
| **PSM-I05** | **No parallel Intent** — two Active Prompts MUST NOT Conflict With unresolved for the same Intent scope |
| **PSM-I06** | **Validation ≠ Approval** — Validates MUST NOT imply Approves |
| **PSM-I07** | **Execution after Reasoning** — for architectural Prompts, SD-EXE MUST follow SD-REA (PAP-004 Phases 1–5) |
| **PSM-I08** | **Architecture preservation** — no interaction MAY redesign approved ECOS Engines/COs/constitutional terms |

Violation ⇒ Execution MUST halt; Deliverable MUST NOT be committed as Official.

---

# 7. Repository Semantics

Semantic interactions modify repository artifacts as follows:

| Interaction | Repository effect |
|-------------|-------------------|
| Produces | Create/update file at Deliverable path; Document Control records Prompt Id+Version+Execution |
| Transforms | Version bump / amend in place per SemVer of target; dependents listed |
| Validates | Write evidence (test log, checklist) referenced by ValidationId |
| Approves | Update Status metadata; adr index or ppef registry as applicable |
| Synchronizes | Update SPEC_INDEX, INV-001, RIM-001, `ppef/registry.md` in same change set when edges change |
| Extends | Patch target Official doc; no new competing path |
| Constrains | No write outside allowed paths |
| Observes | Optional audit note; MUST NOT mutate constitution |

**Fail closed:** If Synchronizes is required by Repository Impact and omitted, semantic state MUST NOT advance to Validated/Certified for cross-cutting work.

---

# 8. Reasoning Semantics

AI systems and Implementation Agents SHALL interpret semantic relationships during prompt execution as follows:

1. **Bind names** to PPS-005 Canonical Names only.  
2. **Load Context** via Consumes; treat Missing information as hard Unknown — MUST NOT invent.  
3. **Apply Constrains** before any Produces.  
4. **Select primary domain/role/pattern**; refuse prohibited compositions (PPS-002 §6.2).  
5. **Run SD-REA** (PAP-004) when architectural; record Phase exits.  
6. **Interpret DEPENDS_ON/REQUIRES** as execution preconditions; missing Required target ⇒ block.  
7. **Interpret SUPERSEDES** as ban on executing Deprecated targets.  
8. **Interpret VALIDATES** as gate; Fail ⇒ no Approves simulation.  
9. **Produces** exactly one primary Deliverable; secondary only if listed in Repository Impact.  
10. **Synchronizes** indexes when Impact declares them.  
11. **Observes** by attaching Prompt Identifier+Version on Document Control (PPS-C19).  

AI executors MUST NOT:

- invent OE entities or synonyms as new ontology terms  
- treat fluency as Validation Pass  
- grant Teacher Approval or CO-10/CO-11 semantics  
- create parallel architectural models  

---

# 9. Future Semantic Extensions

| Extension | Compatibility rule |
|-----------|-------------------|
| New semantic domain | MINOR if additive; MUST map to existing interactions |
| New semantic role | MINOR; MUST NOT split Owner uniqueness |
| New interaction type | MINOR if mappable to PO §5; else MAJOR |
| Change of transition meaning | MAJOR |
| Domain-specific profiles (e.g. Security) | Annex; MUST preserve PSM-I\* |

Future domains SHALL NOT break Certified interaction semantics of PPS-006 v1.0 without MAJOR version and migration of Active Prompts.

---

# Prompt Semantic Compliance Rules

| ID | Rule |
|----|------|
| **PSM-C01** | Every Prompt Execution SHALL declare a primary Semantic Domain (§2). |
| **PSM-C02** | Every actor in an Execution SHALL have a primary Semantic Role (§3). |
| **PSM-C03** | Interactions SHALL use §4 types with stated pre/postconditions. |
| **PSM-C04** | Semantic state transitions SHALL obey §5. |
| **PSM-C05** | Integrity rules PSM-I01…I08 MUST hold. |
| **PSM-C06** | Repository effects SHALL follow §7; Synchronizes MUST NOT be skipped when required. |
| **PSM-C07** | AI/human executors SHALL follow Reasoning Semantics (§8). |
| **PSM-C08** | Validates MUST NOT be treated as Approves. |
| **PSM-C09** | Architectural Executions MUST complete SD-REA before SD-EXE. |
| **PSM-C10** | Extensions MUST preserve compatibility (§9) or bump MAJOR. |
| **PSM-C11** | PSM MUST NOT redefine PO vocabulary or PMM identity fields. |
| **PSM-C12** | Non-compliant Executions MUST NOT produce Official repository commits. |
| **PSM-C13** | Prompt metadata SHOULD declare PrimaryDomain and PrimaryPattern. |
| **PSM-C14** | Conflicting ownership or ambiguous responsibilities MUST block Active/Executed. |

---

## Document Control

| Item | Value |
|------|-------|
| **Code** | PPS-006 |
| **Title** | Prompt Semantic Model (PSM) |
| **Version** | 1.0 |
| **Status** | Official |
| **Location** | `docs/engineering/PPS-006_PROMPT_SEMANTIC_MODEL.md` |
