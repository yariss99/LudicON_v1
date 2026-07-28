---
Status: Official — Engineering Specification ES-001
Version: 1.0
Owner: LUDI ON Engineering
Depends On: PRIMA_DEVELOPMENT_CONSTITUTION.md (PDC), docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md (POSS), docs/product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md (PAS), docs/product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md
Related Documents: SPEC_INDEX.md, technical/FOLDER_STRUCTURE.md
Last Updated: July 2026
---

# ES-001 — Repository Foundation

**Version:** 1.0  
**Status:** Official — Permanent repository foundation  
**Horizon:** 5–10 years  

> This Engineering Specification defines the **production-grade repository foundation** for PRIMA.  
> It implements **POSS**, **PAS**, and **PDC** faithfully.  
> **No business functionality**, APIs, UI components, or databases are introduced here.

**Normative references**

| Code | Meaning in this repository |
|------|----------------------------|
| **POSS** | PRIMA Operating System Specification → `docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md` + constitutional models |
| **PAS-001** | PRIMA System Architecture (PSA) → `docs/engineering/PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md` |
| **PAS** | PRIMA Architecture Specification family → PAS-001 + `docs/product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md` + Engine Architecture |
| **PDC** | PRIMA Development Constitution → `docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md` |

**Rules**

- Do **not** redesign architecture.
- Do **not** invent Engines, Modules, or Layers beyond PAS/POSS.
- Prefer the **simplest** layout that preserves PAS dependency direction (inward to Domain).

---

# 1. Repository Tree

```
LudicON_v1/                          # PRIMA / LUDI ON monorepo root
├── apps/                            # Deployable applications (Presentation + App shells)
│   ├── teacher-workspace/           # Teacher-facing app (PAS L0–L1) — migration target for current src/
│   └── README.md
├── packages/                        # Shared libraries mapped to PAS layers / Engines
│   ├── domain/                      # L4 Domain — aggregates, policies, invariants
│   ├── contracts/                   # Constitutional Commands, Events, Ports, DTOs (no infra)
│   ├── application/                 # L1 Application — use-case boundaries
│   ├── eos/                         # L2 EOS Orchestration kernel
│   ├── engines/                     # L3 Engines (one folder/package per Engine)
│   │   ├── context/
│   │   ├── knowledge/
│   │   ├── intent/
│   │   ├── understanding/
│   │   ├── strategy/
│   │   ├── blueprint/
│   │   ├── validation/
│   │   ├── generation/
│   │   ├── reflection/
│   │   └── memory/
│   ├── ui/                          # Design-system primitives for Teacher Workspace (no domain rules)
│   ├── testing/                     # Shared test fixtures & harness helpers
│   ├── config/                      # Shared configuration schemas (not secrets)
│   └── README.md
├── infrastructure/                  # L6 adapters (empty foundation — implementations later)
│   ├── persistence/
│   ├── messaging/
│   ├── identity/
│   ├── workers/                     # AI / export workers behind Ports
│   └── README.md
├── docs/                            # All documentation (product + engineering + design)
│   ├── product/                     # POSS / constitutional / PAS sources of truth
│   ├── engineering/                 # ES-* specs, PDC, development standards
│   ├── design/
│   ├── technical/                   # Implementation-oriented maps (defer to PAS)
│   ├── research/
│   └── session_logs/
├── config/                          # Repo-wide tool config (lint, format, CI policy files)
├── tools/                           # Developer CLIs and codegen (no business logic)
├── scripts/                         # Automation scripts (bootstrap, check, release helpers)
├── tests/                           # Cross-package integration / e2e / contract tests
├── .github/                         # CI, PR/Issue templates, community health
├── src/                             # TRANSITIONAL — current Vite Teacher UI; migrate → apps/teacher-workspace
├── public/                          # TRANSITIONAL static assets for current app
├── ARCHITECTURE.md                  # Entry → PAS + ES-001
├── DEVELOPMENT.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── ROADMAP.md
├── LICENSE
└── README.md
```

**Rejected top-level ideas**

| Idea | Verdict |
|------|---------|
| `packages/core` | **Reject** — becomes a dumping ground; Domain + Contracts replace it |
| `packages/assessment` | **Reject** — not a PAS module |
| `packages/recommendation` | **Reject** — dissolved in POSS/PAS |
| Top-level `persistence/` peer to `packages/` | **Reject** — Persistence ∈ Infrastructure (PAS L6) |
| Premature multi-app split | **Keep** only `teacher-workspace` until product requires more |

---

# 2. Top-level folder responsibilities

| Folder | Purpose | Owner |
|--------|---------|-------|
| `apps/` | Runnable Presentation/Application shells | App team + Product |
| `packages/` | Libraries implementing PAS layers & Engines | Domain/Engine owners |
| `infrastructure/` | Port adapters (persistence, bus, IdP, workers) | Platform Engineering |
| `docs/` | Normative & descriptive documentation | Product + Engineering |
| `config/` | Shared toolchain configuration | Engineering |
| `tools/` | Dev productivity binaries/scripts-as-packages | Engineering |
| `scripts/` | One-off / CI shell automation | Engineering |
| `tests/` | Cross-cutting verification | QA + Engineering |
| `.github/` | Collaboration & CI entrypoints | Engineering |
| `src/` *(transitional)* | Legacy single-app tree until migration completes | Frontend |

---

# 3. Package catalog

## 3.1 Challenge

| Candidate | Verdict |
|-----------|---------|
| `packages/core` | **Reject** — split Domain vs Contracts |
| `packages/domain` | **Keep** — PAS L4 |
| `packages/eos` | **Keep** — Orchestrator / gates |
| `packages/engines/*` | **Keep** — one Engine per package folder |
| `packages/shared` | **Reject name** — use `contracts` + tiny helpers inside `domain`/`testing`; avoid vague “shared” |
| `packages/ui` | **Keep** — Presentation primitives only |
| `packages/knowledge` | **Fold into** `engines/knowledge` + Domain KnowledgePack types |
| `packages/testing` | **Keep** |
| `packages/config` | **Keep** — schemas only |
| `packages/application` | **Add** — PAS L1 |
| `packages/contracts` | **Add** — Commands/Events/Ports without infra |

## 3.2 Package specifications

### `packages/domain`

| Field | Content |
|-------|---------|
| **Purpose** | Pure Domain Layer (PAS L4) |
| **Owner** | Domain Maintainers |
| **Dependencies** | None (or only language std / approved pure utils) |
| **Forbidden** | UI, eos runtime, engines, infrastructure, apps, AI SDKs |
| **Evolution** | Grows with constitutional Aggregates only |

### `packages/contracts`

| Field | Content |
|-------|---------|
| **Purpose** | Constitutional Command/Event/Query/Port *shapes* shared across boundaries |
| **Owner** | Architecture Maintainers |
| **Dependencies** | `domain` types only (where needed) |
| **Forbidden** | Infrastructure, UI, Engine implementations |
| **Evolution** | Versioned carefully; breaking changes = major |

### `packages/application`

| Field | Content |
|-------|---------|
| **Purpose** | Application Layer use-case handlers (PAS L1) |
| **Owner** | Application Maintainers |
| **Dependencies** | `contracts`, `domain`, `eos` (orchestration ports) |
| **Forbidden** | UI frameworks; infrastructure concrete adapters; Engine internals |
| **Evolution** | One handler family per UC / Command group |

### `packages/eos`

| Field | Content |
|-------|---------|
| **Purpose** | EOS Orchestration kernel (PAS L2 / ENG-00) |
| **Owner** | EOS Maintainers |
| **Dependencies** | `contracts`, `domain` (policies/state legality); Engine *ports* only |
| **Forbidden** | Pedagogy composition; UI; persistence schemas; AI SDKs |
| **Evolution** | Gate/policy enforcement remains; workers stay replaceable |

### `packages/engines/<name>`

| Field | Content |
|-------|---------|
| **Purpose** | One constitutional Engine (PAS L3 / ENG-01…10) |
| **Owner** | Named Engine Maintainer |
| **Dependencies** | `domain`, `contracts`; Ports for workers; **no** peer Engine private APIs |
| **Forbidden** | Teacher Approve/Authorize grants; other Engines’ internals; UI |
| **Evolution** | Replaceable behind contracts; no new Engines without POSS/PAS change |

### `packages/ui`

| Field | Content |
|-------|---------|
| **Purpose** | Design-system primitives for Teacher Workspace |
| **Owner** | Design System + Frontend |
| **Dependencies** | None of domain/eos/engines (presentation-only) |
| **Forbidden** | Domain rules, Policies, Engine calls |
| **Evolution** | Tokens/components only |

### `packages/testing`

| Field | Content |
|-------|---------|
| **Purpose** | Fixtures, fakes, contract-test helpers |
| **Owner** | Engineering |
| **Dependencies** | `contracts`, `domain` (test doubles) |
| **Forbidden** | Production runtime coupling |
| **Evolution** | Grow with contract tests |

### `packages/config`

| Field | Content |
|-------|---------|
| **Purpose** | Shared configuration *schemas* and defaults documentation |
| **Owner** | Platform Engineering |
| **Dependencies** | Minimal |
| **Forbidden** | Secrets; Policy bypass flags |
| **Evolution** | Feature flags must not violate PDC/POSS Policies |

---

# 4. Folder responsibility matrix (detail)

| Path | Purpose | Owner | Allowed deps | Forbidden deps | Future |
|------|---------|-------|--------------|----------------|--------|
| `apps/teacher-workspace` | Teacher Presentation + App shell | Frontend | `ui`, `application`/`contracts` clients | Domain persistence, Engine internals | Absorb `src/` |
| `packages/domain` | Aggregates & Policies | Domain | — | All outer | Constitutional entities only |
| `packages/contracts` | Boundary types | Architecture | `domain` | Infra/UI | Versioned API of the monorepo |
| `packages/application` | Use cases | Application | contracts, eos ports, domain | UI, infra concrete | UC coverage |
| `packages/eos` | Orchestrator | EOS | contracts, domain, engine ports | UI, AI SDK | Saga/workflow |
| `packages/engines/*` | Engines | Per Engine | domain, contracts, ports | Peer internals | Independent versioning |
| `packages/ui` | UI kit | Design | — | Domain | Design system |
| `infrastructure/*` | L6 adapters | Platform | contracts ports | Called *from* domain | Swap vendors |
| `docs/product` | POSS / constitution | Product | — | Code ownership | Prevails on meaning |
| `docs/engineering` | ES / PDC | Engineering | — | Redefining POSS | ES-002+ |
| `config/` | Tooling config | Engineering | — | Business rules | CI alignment |
| `tools/` | Dev tools | Engineering | — | Production Engines | Codegen |
| `scripts/` | Automation | Engineering | — | Hidden prod logic | Release |
| `tests/` | Cross-package tests | QA/Eng | packages | Bypassing eos gates in “happy” fakes that lie | Contract + e2e |
| `src/` | Transitional UI | Frontend | current stack | New domain logic here | Delete after migration |

---

# 5. Repository conventions

## 5.1 Folder naming

- **kebab-case** for directories: `teacher-workspace`, `learning-experience` (if added).
- Engine folders match constitutional names: `blueprint`, `validation`, …
- No abbreviations unless constitutional (`eos`).

## 5.2 File naming

- Documentation: `SCREAMING_SNAKE` or `Title_Case` only for existing product docs; new engineering docs: `ES-XXX_NAME.md`, `PRIMA_*.md`.
- Source (when added later): language-idiomatic within package; **never** put Domain types in UI files.

## 5.3 Import rules

| Importer | May import |
|----------|------------|
| `apps/*` | `ui`, `application` façades, `contracts` |
| `application` | `contracts`, `domain`, `eos` ports |
| `eos` | `contracts`, `domain`, engine ports |
| `engines/*` | `domain`, `contracts` |
| `domain` | nothing outer |
| `infrastructure` | `contracts` (implement ports) |
| `ui` | nothing from domain/eos/engines |

## 5.4 Module boundaries

Align packages to PAS modules (MOD-*) and Engines (ENG-*).  
Cross-module collaboration via **Contracts + Events + Orchestrator** only.

## 5.5 Dependency direction

```
apps → application → eos → engines → domain
                  ↘ contracts ↗
infrastructure → implements contracts (ports)
ui → apps only (presentation)
```

Dependencies point **inward** to `domain` (PAS RTA-05).

## 5.6 Shared code rules

- Prefer `contracts` over ad-hoc shared folders.
- No `packages/shared` catch-all.
- Duplication of *types* is worse than a contracts dependency; duplication of *policy* is forbidden — Policies live in Domain/docs.

## 5.7 Asset organization

- App-static assets: `apps/<app>/public` (after migration).
- Design references: `docs/design/`.
- No binary secrets in git.

## 5.8 Documentation placement

| Kind | Place |
|------|-------|
| Product / POSS / constitutional | `docs/product/` |
| PAS / RTA / Engines | `docs/product/` |
| Engineering specs (ES-*) / PDC | `docs/engineering/` |
| Repo entry guides | Repository root `*.md` |
| Session notes | `docs/session_logs/` |
| Research (non-normative) | `docs/research/` |

---

# 6. Initial documentation (this ES mandates)

Root: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `ARCHITECTURE.md`, `DEVELOPMENT.md`, `ROADMAP.md`, `LICENSE`  
Engineering: this file, `PRIMA_DEVELOPMENT_CONSTITUTION.md`, `SPEC_INDEX.md`

---

# 7. Development standards (summary)

See `CONTRIBUTING.md`, `DEVELOPMENT.md`, and PDC for full text.

| Topic | Rule |
|-------|------|
| Branches | `main` protected; `feature/*`, `fix/*`, `docs/*`, `chore/*` |
| Commits | Conventional Commits |
| PRs | Template required; PAS/PDC checklist |
| Issues | Bug / Feature / Architecture Change templates |
| Versioning | SemVer for packages; app versions separate |
| Releases | Tagged; changelog; no release without DoD |

---

# 8. Quality standards (summary)

| Topic | Rule |
|-------|------|
| Testing | Unit (domain/engines), contract, integration in `tests/`; e2e for Teacher journeys later |
| Code review | Two perspectives when touching eos/domain; Architecture Change for PAS deviations |
| DoR / DoD | Defined in CONTRIBUTING |
| Static analysis / format / lint | Configured under `config/` + root tooling (evolve; no stack lock-in in ES-001) |
| Docs coverage | Public packages require README; Engine packages require mission pointer to Engine Architecture |

---

# 9. Architecture validation

| Criterion | Result |
|-----------|--------|
| Folder ↔ PAS layers | Mapped L0–L6 |
| Coupling | Engines isolated; no `core` blob |
| Scalability | Apps/packages/infra split; engines independently evolvable |
| DX | Clear owners; root guides; transitional `src/` documented |
| Maintainability | Docs split product vs engineering; conventions explicit |
| POSS/PAS/PDC fidelity | No new Engines/Modules; Assessment rejected |

**Verdict:** Foundation is **enterprise-ready**, **architecture-preserving**, and **safe for 5–10 years** of evolution.

---

# 10. Deliverable index

| # | Deliverable | Location |
|---|-------------|----------|
| 1 | Repository Tree | §1 + disk scaffold |
| 2 | Folder Responsibility Matrix | §2–§4 |
| 3 | Repository Standards | §5 |
| 4 | Development Standards | CONTRIBUTING / DEVELOPMENT / PDC |
| 5 | Initial Documentation | Root + `docs/engineering/` |
| 6 | Architecture Validation | §9 |

---

## Explicit non-goals (ES-001)

- Application code, React components, APIs, databases  
- Workspace toolchain lock-in (pnpm/npm/yarn choice deferred to a later ES)  
- Migrating `src/` in this change set (documented only)
