---
Status: Official — Architecture Gate Review AGR-001
Version: 1.0
Reviewer Role: Chief Software Architect (independent)
Subject: PRIMA-ES-001 Repository Foundation
Decision: GO WITH RECOMMENDATIONS
Last Updated: July 2026
---

# AGR-001 — Repository Foundation Review

**Subject:** ES-001 Repository Foundation (as present on disk + normative docs)  
**References:** POSS · PAS · PDC · ES-001  
**Review stance:** Independent Architecture Review Board readiness for authorizing **PRIMA-ES-002 (EOS Kernel)**  
**Date:** July 2026  

---

# 1. Executive Summary

ES-001 produces a **directionally correct** monorepo skeleton aligned to PAS layers and constitutional Engines. That is necessary. It is **not sufficient** as a 10-year foundation in its current state.

**What works:** Explicit rejection of `packages/core`, Assessment, and Recommendation; Engine-per-folder isolation; Domain-inward dependency doctrine; PDC hard prohibitions; governance entry docs; Architecture Change issue path.

**What fails a rigorous gate:** The repository is still a **dual-system** (`src/` Vite app is the only runnable truth; `apps/`/`packages/` are README theatre). PAS Modules **MOD-02, MOD-08, MOD-11, MOD-12** have no package homes. CQRS **Query side** is absent from the tree. Dependency rules are **unenforced**. Ownership is **unnamed**. Event-driven architecture exists on paper only. Cross-cutting planes (Security, Observability, Audit) have no structural home. Extensibility (Extension Host) is deferred without a reserved seam.

**Decision:** **GO WITH RECOMMENDATIONS** — proceed to plan ES-002 only after **blocking** backlog items (B-01…B-05) are accepted into the foundation or explicitly scheduled as ES-001.1 **before any EOS Kernel code lands outside transitional `src/`**.

A clean **GO** would require enforceable boundaries and a single application home. A **NO GO** would be warranted if the team intended to implement Engines inside `src/` while claiming PAS compliance — that path is rejected by this review.

---

# 2. Repository Review

## 2.1 Top-level folders

| Folder | Verdict |
|--------|---------|
| `apps/`, `packages/`, `infrastructure/`, `docs/`, `tests/`, `.github/` | Sound PAS mapping |
| `config/`, `tools/`, `scripts/` | Acceptable |
| `src/` + `public/` retained as “transitional” | **Architectural smell** — two homes for the Teacher app |
| Root still owns the only `package.json` | Foundation is **not yet a monorepo** — it is a **documentation overlay** on a single-app repo |

## 2.2 Strengths

- Layer vocabulary matches PAS (L0–L6) without inventing Engines.
- Engine catalog matches POSS/PAS; rejected anti-packages documented.
- `contracts` vs `domain` split avoids the classic `core` swamp.
- `infrastructure/` correctly kept outside Domain.
- Spec index (POSS/PAS/PDC/ES) creates traceability for EA boards.
- PR/Issue templates encode Architecture Change discipline.

## 2.3 Weaknesses

1. **Skeleton without package identity** — no workspace manifests, no per-package manifests, nothing to version or boundary-check.
2. **Incomplete PAS module coverage** — Delivery & Portfolio, Teacher Authority, Project Continuity, Platform Governance missing as first-class packages or explicit “lives inside X” mappings.
3. **No Query / Read Model package** — PAS CQRS query side orphaned; risk that Read Models land in UI or `application` ad hoc.
4. **`packages/config` vs `config/`** — naming collision invites dump-yard behaviour.
5. **Ownership is role labels, not people/teams** — “Domain Maintainers” is not operable at 20+ engineers.
6. **No ADR / decision log** under engineering — constitutional docs exist; *implementation decisions* have no ledger.
7. **No composition root** reserved (wiring L6→Ports→EOS) — ES-002 will invent one under pressure.
8. **Docs sprawl** — product constitutional stack is strong; engineering onboarding still thin on “day-1 clone → productive contribution”.

## 2.4 Missing elements

| Missing | Why it matters |
|---------|----------------|
| Workspace / package manifests | Without them, “packages” are fiction |
| `CODEOWNERS` | Ownership unenforceable in PR |
| Dependency lint / boundary CI | PDC-03 is aspirational |
| `packages/query` or `packages/read-models` (or explicit home) | CQRS incomplete |
| `packages/authority` or mapped home for MOD-11 | Teacher Authority diluted into “eos + policy” without seam |
| `packages/delivery` (MOD-08) | Export/Library will attach to Generation wrongly |
| `packages/project` or mapped home for MOD-02 | Project Continuity will leak into app |
| Observability / Audit adapter folders | Cross-cutting planes have no L6 home |
| Extension Host reserved path | Plugin ecosystem will bolt onto Engines |
| Migration deadline for `src/` | Dual-tree becomes permanent by inertia |
| Event contract layout inside `contracts/` | “Event Driven” has no folder grammar |
| Secrets / security baseline docs | Enterprise expectation |

## 2.5 Architectural smells

| Smell | Severity |
|-------|----------|
| **Dual Teacher app** (`src/` vs `apps/teacher-workspace`) | **Critical** for ES-002 targeting |
| **README-only packages** presented as “production-grade foundation” | **High** — overclaim vs reality |
| **Engine folders without publish boundary** | **High** — isolation is psychological |
| **Vague “shared” risk relocating into `contracts` or `testing`** | **Medium** |
| **Premature Engine fan-out (10 empty engines)** without composition root | **Medium** — fine if disciplined; dangerous if teams fill them in parallel without EOS |
| **Top-level `infrastructure/` vs future `packages/adapters-*`** inconsistency risk | **Low** if documented as permanent |

---

# 3. Architecture Compliance

## Domain First

| | |
|--|--|
| **Status** | **PARTIAL PASS** |
| **Evidence** | `packages/domain` declared pure; dependency diagrams point inward; PDC-03/07. |
| **Violations** | No Domain code/types exist; real product types still live under transitional `src/types` / UI data — Domain is not first *in the running system*. |
| **Recommendations** | Freeze new domain concepts in `src/`; mandate Domain package as sole Aggregate home before ES-002 features. |

## EOS First

| | |
|--|--|
| **Status** | **PARTIAL PASS** |
| **Evidence** | `packages/eos` present; Orchestrator called out in ARCHITECTURE.md; PDC-04. |
| **Violations** | No executable orchestration path; ES-002 not gated by a composition-root standard; risk Engines are implemented before Orchestrator exists (folder temptation). |
| **Recommendations** | Hard rule: **no Engine production code merges before EOS Kernel skeleton + gate interfaces exist.** |

## Engine Isolation

| | |
|--|--|
| **Status** | **PASS (design) / FAIL (enforceability)** |
| **Evidence** | Ten engine folders; peer private API forbidden in READMEs. |
| **Violations** | Zero technical enforcement; shared `contracts` could become an Engine RPC dump. |
| **Recommendations** | Per-engine package boundaries + import lint deny list `engines/* → engines/*`. |

## Event Driven

| | |
|--|--|
| **Status** | **FAIL (structural)** |
| **Evidence** | Contracts mention Events; messaging adapter folder exists; POSS Event Model lives in docs only. |
| **Violations** | No `contracts/events` (or equivalent) layout; no projection/read-model home; no outbox/inbox seam; “Event Driven” is slogan-level in ES-001. |
| **Recommendations** | Define event package grammar + projection owner before Engine implementations emit events. |

## Teacher First

| | |
|--|--|
| **Status** | **PASS (intent) / WEAK (structure)** |
| **Evidence** | Teacher Workspace app; PDC-05; Authority prohibitions; PR checklist. |
| **Violations** | MOD-11 Teacher Authority has no dedicated package/module folder; easy to “bury” in eos and lose audit clarity. Teacher UI remains in legacy `src/` — Teacher journey code is not in the PAS home. |
| **Recommendations** | Explicit `authority` (or documented eos subfolder with ownership) + migrate Teacher surfaces on a dated plan. |

## Replaceability

| | |
|--|--|
| **Status** | **PASS (design)** |
| **Evidence** | Ports in contracts; workers under infrastructure; AI behind Ports (PDC-08). |
| **Violations** | No port interface stubs; replaceability unproven. |
| **Recommendations** | ES-002 must introduce Port interfaces *before* first worker. |

## Documentation First

| | |
|--|--|
| **Status** | **PASS** |
| **Evidence** | Rich POSS/PAS/PDC/ES stack; root entry docs; SPEC_INDEX. |
| **Violations** | Over-documentation in product vs thin “how the empty packages become real”; dual ROADMAP files; no ADR stream. |
| **Recommendations** | ADR folder; single roadmap pointer; onboarding runbook. |

## Testability

| | |
|--|--|
| **Status** | **PARTIAL PASS** |
| **Evidence** | `tests/{contract,integration,e2e}`, `packages/testing`, PDC-05. |
| **Violations** | No test runner wiring; no sample contract test proving boundary rules; e2e targets non-existent app path. |
| **Recommendations** | One golden contract test that fails illegal imports — even before business logic. |

## Explainability

| | |
|--|--|
| **Status** | **PARTIAL PASS** |
| **Evidence** | Architecture maps; Engine READMEs cite Engine Architecture; PR checklist. |
| **Violations** | No requirement that runtime decisions emit explainability/audit payloads; Observability plane missing from tree. |
| **Recommendations** | Reserve `infrastructure/observability` + audit event conventions tied to Domain Events. |

---

# 4. Dependency Review

## Rules (as written)

Direction `apps → application → eos → engines → domain` with `contracts` shared and `infrastructure → ports` is **correct per PAS**.

## Violations found (as-built)

| ID | Violation | Notes |
|----|-----------|-------|
| D-01 | **No enforceable dependency graph** | Only one root `package.json` — all future code can import anything once added carelessly under `src/`. |
| D-02 | **Transitional UI is outside the declared graph** | `src/` is not bound by package import rules. |
| D-03 | **Missing module packages ⇒ hidden coupling later** | Delivery/Authority/Project will be stuffed into Generation/eos/app — latent layer violations. |
| D-04 | **`contracts` unbounded** | Without substructure, Commands/Events/Ports/DTOs will mix; becomes soft `shared`. |
| D-05 | **Circular dependency risk: engines ↔ contracts ↔ domain** | Not present yet; likely when DTOs leak Aggregate methods into contracts. |
| D-06 | **Bounded Context isolation incomplete** | Engines approximated BCs; SVC modules (Project, Delivery, Governance) not reflected → BC bleed into Engine packages. |

**Circular dependencies today:** None (no code).  
**Layer violations today:** Organizational — dual app home.  
**Shared code:** `packages/shared` correctly rejected; risk transferred to `contracts`/`testing` — **watchlist**.

---

# 5. Documentation Review

| Artifact | Quality | Gap |
|----------|---------|-----|
| Root README | Good entry | Overstates “production monorepo foundation” vs README scaffolds |
| ARCHITECTURE.md | Clear PAS map | No anti-corruption / composition-root section |
| DEVELOPMENT.md | Honest about transitional `src/` | No day-1 checklist; no ES-002 prerequisites |
| CONTRIBUTING.md | Solid branching/commits/DoR/DoD | Branch protection / CODEOWNERS not operationalized |
| CODE_OF_CONDUCT | Adequate | Enforcement contact placeholder |
| ROADMAP.md | Points to product | Engineering runway for foundation hardening missing |
| LICENSE | Proprietary OK | Fine |
| ES-001 | Thorough | Claims “production-grade” while deferring workspace tooling — **credibility gap** |
| PDC | Sharp prohibitions | Thin on review SLAs, ownership matrix, CI gates |
| Package READMEs | Consistent template | Owners are fictional roles |
| Onboarding | Weak | New hire cannot “contribute to packages” meaningfully |

**Missing documentation:** ADR process; dependency enforcement how-to; migration plan with date; security baseline; CODEOWNERS map; Query-side ownership; module↔package matrix completing PAS MOD-*.

---

# 6. Governance Review

| Area | Assessment |
|------|------------|
| Naming consistency | Good kebab-case; **config collision** (`config/` vs `packages/config`) |
| Folder ownership | Documented, not enforceable |
| Module ownership | Engines OK; PAS modules incomplete |
| Versioning readiness | SemVer described; **no packages to version** |
| Release readiness | **Not ready** — no CI workflows, no changelog automation, no artifacts |
| Branch strategy | Written; not proven via protected `main` evidence in-repo |
| Traceability | SPEC_INDEX strong; code↔doc traceability nonexistent yet |
| Engineering discipline | Templates help; without CI + CODEOWNERS, discipline is voluntary |

**Verdict:** Governance is **policy-grade**, not **operating-grade**.

---

# 7. Risk Assessment

| Risk | Rating | Rationale |
|------|--------|-----------|
| Dual-tree permanence (`src/` forever) | **Critical** | ES-002/engines implemented beside UI; PAS dies |
| Engines implemented before EOS | **Critical** | Violates EOS First; illegal skips become cultural |
| Missing Delivery/Authority/Project packages | **High** | Wrong ownership of Export/Approve/Project |
| Unenforceable dependencies | **High** | 20–50 devs will violate within months |
| `contracts` becomes shared dump | **High** | Erodes Domain purity |
| Event/projection gap | **High** | CQRS collapses into request/response mush |
| Overclaim “production foundation” | **Medium** | EA trust / false security |
| AI workers wired from UI under schedule pressure | **High** (AI Integration) | Classic shortcut; PDC forbids but tree doesn’t stop it |
| Plugin ecosystem without Extension Host seam | **Medium** | Later rewrite |
| Multi-app (Student/Parent) without app template | **Medium** | Copy-paste Teacher app |
| Knowledge risk (doc sprawl, no ADR) | **Medium** | Decisions lost |
| Cloud portability | **Low** today | No vendor lock-in yet — good |
| Multi-country / i18n structure | **Medium** | Locale only transitional in `src/i18n`; no platform package |
| Marketplace | **Low** now | Correctly deferred; needs Extension Host later |
| Release/version chaos | **Medium** | No tooling |

---

# 8. Improvement Backlog

| ID | Title | Description | Business Impact | Technical Impact | Priority | Effort | Dependencies |
|----|-------|-------------|-----------------|------------------|----------|--------|--------------|
| **B-01** | Dual-tree policy + migration date | Publish hard rule: no new feature work in `src/` except bugfix; dated move to `apps/teacher-workspace` | Protects Teacher journey integrity | Unblocks real monorepo | **P0 Blocking** | M | Product agree |
| **B-02** | Workspace + package manifests | Introduce workspace tooling; each package real; root scripts | Enables scale hiring | Real boundaries | **P0 Blocking** | M | B-01 optional but preferred |
| **B-03** | Dependency boundary CI | Import lint deny Engine↔Engine, UI→Domain, Domain→Infra | Prevents silent PAS death | Enforces PDC-03 | **P0 Blocking** | S–M | B-02 |
| **B-04** | Complete PAS module package map | Add or explicitly map MOD-02 Project, MOD-08 Delivery, MOD-11 Authority, MOD-12 Governance, Query/read-models | Correct ownership of Approve/Export/Continuă | Stops mis-placement | **P0 Blocking** | S | PAS (no redesign—mapping only) |
| **B-05** | Composition root standard | Document where L6 wires Ports into EOS/Application | Avoids ES-002 improvisation | Clean replaceability | **P0 Blocking** | S | PAS |
| **B-06** | Event & projection grammar | Substructure under `contracts` + projection owner package | Explainability & Continuă views | Real Event Driven | **P1** | M | B-02 |
| **B-07** | CODEOWNERS + named teams | Map folders to teams | Review quality at 20–50 people | PR routing | **P1** | S | Org chart |
| **B-08** | ADR log | `docs/engineering/adr/` | Knowledge retention | Decision traceability | **P1** | S | — |
| **B-09** | Observability & audit L6 homes | Folders + conventions | Enterprise ops / Teacher trust | Cross-cutting planes | **P1** | S | B-05 |
| **B-10** | Golden illegal-import test | Failing test proving boundaries | Discipline | Testability | **P1** | S | B-03 |
| **B-11** | Rename disambiguate config | `config/toolchain` vs `packages/config-schemas` | DX clarity | Fewer dump yards | **P2** | S | — |
| **B-12** | Extension Host reserved path | `infrastructure/extensions` or `packages/extension-host` stub | Future plugins/marketplace | Avoid Engine bolting | **P2** | S | PAS future MOD-13 |
| **B-13** | App template for future workspaces | Cookiecutter/notes for Student/Parent | Multi-audience EOS | Controlled growth | **P2** | M | B-01 |
| **B-14** | Localization platform package | Beyond UI strings | Multi-language/country | Consistency | **P2** | M | Product i18n |
| **B-15** | CI release pipeline stub | Tag → changelog → artifacts | Release readiness | Governance | **P2** | M | B-02 |
| **B-16** | ES-001 claim correction | Soften “production-grade monorepo” until B-02/B-03 done | EA credibility | Honesty | **P0** | XS | — |

Effort: XS <1d · S 1–3d · M <2w · L >2w

---

# 9. Architecture Scorecard

Scores are for **the foundation as it exists**, not the quality of POSS/PAS prose.

| Dimension | Score | Justification |
|-----------|------:|---------------|
| Repository Design | **7** | Sensible tree; dual-tree and incomplete modules cost 3 points |
| Architecture Quality | **6** | Aligns to PAS on paper; incomplete module fidelity + no enforcement |
| Scalability | **5** | Folder fan-out OK; cannot scale teams without manifests/CI/CODEOWNERS |
| Maintainability | **6** | Clear intent; transitional `src/` and doc dualism erode it |
| Developer Experience | **4** | Empty packages + transitional app = confusing; onboarding weak |
| Documentation | **8** | Spec stack is strong; engineering runbooks thinner |
| Governance | **5** | Policies exist; operating mechanisms do not |
| Extensibility | **6** | Ports/workers correct idea; Extension Host/query seams missing |
| Testability | **4** | Folders only; no proving tests |
| Future Readiness | **5** | 10-year *direction* yes; 10-year *machinery* no |
| **Overall Architecture** | **6** | Acceptable conditional gate — not a clean enterprise pass |

---

# 10. Final Decision

## **GO WITH RECOMMENDATIONS**

### Justification

The repository foundation **does not invent a competing architecture**. It correctly mirrors PAS layers and constitutional Engines and encodes PDC prohibitions. That earns a conditional pass to continue the programme.

It is **not** yet robust enough—unaided—to underwrite thousands of commits. The dual Teacher app, missing PAS module homes, absent Query/Event grammar, and **zero dependency enforcement** are structural defects, not nitpicks. Authorizing ES-002 EOS Kernel code into this tree **without** closing **B-01…B-05 and B-16** predicts Engine-first implementation, UI-side shortcuts, and irreversible coupling.

### Conditions to authorize ES-002 implementation PRs

1. **B-16** merged (honest status language).  
2. **B-04** module↔package matrix published and stub folders/READMEs added (no new architectural concepts — mapping only).  
3. **B-05** composition-root standard accepted.  
4. **B-02 + B-03** either completed or filed as **ES-001.1** with explicit sequencing: **no Engine business logic merge until boundary CI is green**.  
5. Written rule: **EOS Kernel lands in `packages/eos` first**; Engines remain stubs until Orchestrator ports exist.

### Not chosen

- **GO** — would rubber-stamp an overclaimed foundation.  
- **NO GO** — would ignore that the *shape* is largely right and product architecture docs are already stronger than most enterprises at this stage.

---

## Review board one-liner

> **Approve direction; withhold unconstrained ES-002 coding until boundaries are real, modules are complete, and the dual-tree is on a kill schedule.**
