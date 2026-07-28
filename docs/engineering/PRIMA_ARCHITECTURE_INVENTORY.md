---
Status: Official — Architecture Inventory
Version: 1.0
Owner: LUDI ON Chief System Architect
Depends On: SPEC_INDEX.md, PAS, POSS, PDC, PRIMA-CM-001
Last Updated: July 2026
Authority: Inventory of approved artifacts as present in repository — no redesign
---

# PRIMA Architecture Inventory

**Title:** PRIMA Architecture Inventory  
**Version:** 1.0  
**Status:** Official  
**Scope:** Educational Cognitive Operating System (ECOS) / PRIMA as present in `F:/LudicON_v1`  
**Method:** Catalog of approved documents, contracts, runtime, modules, and tests. No alternative architecture.

**Legend**

| Field | Values |
|-------|--------|
| **Status** | Official · FINAL · Official (defers) · Scaffold · Planned · Transitional · Superseded-by-precedence |
| **Implemented** | Yes · Partial · No |
| **Tested** | Yes · Partial · No |
| **Doc completeness** | Complete · Partial · Stub · Absent |

---

# 1. Approved Documents

## 1.1 Product Constitution & Governance

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| DOC-BIBLE | LUDI ON Project Bible | Product SSOT — mission, terminology, teacher authority | Official | — | N/A | N/A | Complete |
| DOC-AP | PRIMA Architectural Principles | Immutable architectural beliefs | Official | Bible | N/A | N/A | Complete |
| DOC-POSS | PRIMA Educational Operating System | EOS constitution — pipeline, engines, gates | Official | Bible, AP, CM-001 | Partial | No | Complete |
| DOC-PAS-REF | PRIMA Reference Technical Architecture | L0–L6 technical reference (PAS) | Official | POSS, Engines | Partial | No | Complete |
| DOC-CL | PRIMA Constitutional Language | Canonical names and meanings | Official | POSS | Partial | No | Complete |
| DOC-CAP | Constitutional Capability Model | Capabilities catalog | Official | CL | No | No | Complete |
| DOC-DOM | Constitutional Domain Model | Domain entities / aggregates | Official | CL | Partial | No | Complete |
| DOC-EVT | Constitutional Event Model | Domain/system events | Official | CL, DOM | Partial | Partial | Complete |
| DOC-CMD | Constitutional Command Model | Commands and authority | Official | CL, DOM, POL | Partial | Partial | Complete |
| DOC-UC | Constitutional Use Case Model | Use cases | Official | CMD, DOM | No | No | Complete |
| DOC-DEC | Constitutional Decision Model | Decision catalog | Official | POL | No | No | Complete |
| DOC-SM | Constitutional State Machine Model | Aggregate / pipeline state machines | Official | DOM, POSS | No | No | Complete |
| DOC-SVC | Constitutional Service Contract Model | SVC-\* façades | Official | Engines | No | No | Complete |
| DOC-QRY | Constitutional Query Model | Queries / read models | Official | DOM | No | No | Complete |
| DOC-POL | Constitutional Policies | Policies including Teacher Authority | Official | CL | No | No | Complete |
| DOC-CEA | Constitutional Engine Architecture | ENG-00…ENG-10 identity & boundaries | Official | POSS | Partial | Partial | Complete |
| DOC-CA | PRIMA Canonical Artifacts | Product artifact registry | Official | AP, DOM | No | No | Complete |
| DOC-IB | Instructional Blueprint Specification | Blueprint section schema authority | Official | Bible, AP | No | No | Complete |

## 1.2 Solution Architecture

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| DOC-SA-IDX | LUDI ON Solution Architecture | Solution index | Official | Bible | Partial | No | Complete |
| DOC-SA-01 | System Context | System context | Official | SA-IDX | No | No | Complete |
| DOC-SA-02 | Capability Model (solution) | Solution capabilities | Official | SA-IDX | No | No | Complete |
| DOC-SA-03 | Component Model | Components | Official | SA-IDX | Partial | No | Complete |
| DOC-SA-04 | Interaction Model | Interactions | Official | SA-IDX | No | No | Complete |
| DOC-SA-05 | Workflow Model | Workflows | Official | SA-IDX, POSS | No | No | Complete |
| DOC-SA-06 | State Model (solution) | Solution states | Official | SA-IDX, SM | No | No | Complete |
| DOC-SA-07 | Error Model | Errors | Official | SA-IDX, Failure | No | No | Complete |

## 1.3 Cognitive & Intelligence Elaborations

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| CM-001 | PRIMA Cognitive Model | How PRIMA thinks — highest cognitive layer | Official | Bible, AP | Partial | Partial | Complete |
| DOC-CC | PRIMA Cognitive Core | Elaborating cognitive operating model | Official (defers to CM-001) | CM-001 | Partial | No | Complete |
| DOC-IM | PRIMA Intelligence Model | Intelligence layers | Official | CM-001 siblings | No | No | Complete |
| DOC-RF | PRIMA Reasoning Framework | Reasoning strategies | Official | CM-001 | No | No | Complete |
| DOC-CTX-P | PRIMA Context Model (product) | Context stack philosophy | Official (defers to ES-007 Context detail) | CM-001, ES-007 | Partial | Partial | Complete |
| DOC-KN-P | PRIMA Knowledge Model (product) | Knowledge philosophy | Official (defers to ES-008) | ES-008 | Partial | Partial | Complete |
| DOC-DF | PRIMA Decision Framework | Authority / decisions | Official | DEC, POL | No | No | Complete |
| DOC-FM | PRIMA Failure Model | Cognitive failure integrity | Official | POSS | No | No | Complete |
| DOC-IK | PRIMA Intelligence Kernel | Kernel narrative (legacy alignment) | Official | POSS | Partial | Partial | Partial |

## 1.4 Product Engine Narratives (align to CEA)

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| DOC-ENG-LEG | PRIMA Engine (legacy catalog) | Early engine narrative | Official — align to CEA | CEA | Partial | No | Partial |
| DOC-ORCH-P | PRIMA Orchestrator (product) | Orchestrator product spec | Official — align ENG-00 | CEA, ES-002 | Partial | Partial | Partial |
| DOC-KE-P | PRIMA Knowledge Engine (product) | Product KE narrative | Official — align ES-009 | ES-009 | Yes | Yes | Partial |
| DOC-ME-P | PRIMA Memory Engine (product) | Memory product spec | Official | CEA ENG-10 | No | No | Partial |
| DOC-VE-P | PRIMA Validation Engine (product) | Validation product spec | Official | CEA ENG-07 | No | No | Partial |
| DOC-GE-P | PRIMA Generation Engine (product) | Generation product spec | Official | CEA ENG-08 | No | No | Partial |
| DOC-DE-P | PRIMA Decision Engine (product) | Legacy — dissolved per CEA | Superseded-by-precedence | CEA | No | No | Partial |

## 1.5 Supporting Product Documents

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| DOC-UL | Ubiquitous Language | Defers to Constitutional Language | Official (defers) | CL | N/A | N/A | Partial |
| DOC-DM-LEG | Domain Model (legacy) | Align to Constitutional Domain | Official (align) | DOC-DOM | Partial | No | Partial |
| DOC-BP | PRIMA Blueprint (product) | Blueprint narrative | Official | DOC-IB | No | No | Partial |
| DOC-TX | Teacher Experience | Teacher UX journey | Official | Bible | Partial | No | Partial |
| DOC-DS | Design System (product) | Product design | Official | — | Partial | No | Partial |
| DOC-PV | Product Vision | Vision | Official | Bible | N/A | N/A | Complete |
| DOC-PR | Product Roadmap | Roadmap | Official | Bible | N/A | N/A | Partial |
| DOC-MVP | PRIMA MVP Roadmap | MVP sequencing | Official | POSS | Partial | No | Partial |
| DOC-ACR | Architecture Consistency Review | Consistency audit | Official | Stack | N/A | N/A | Complete |
| DOC-S1 | Sprint1 Refactor Plan | Delivery plan | Official | — | Partial | No | Partial |
| DOC-PD / DOC-PRE | Product Design / Redesign | Product design notes | Official | — | Partial | No | Partial |
| DOC-CB | Conversation Blueprint | Conversation structure | Official | POSS | No | No | Partial |

## 1.6 Technical Documents

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| DOC-TECH-SA | technical/SYSTEM_ARCHITECTURE.md | Technical overview | Planned / thin | PAS-REF | Partial | No | Partial |
| DOC-TECH-FS | technical/FOLDER_STRUCTURE.md | Folder notes | Partial | ES-001 | Partial | No | Partial |
| DOC-TECH-API | technical/API.md | HTTP/API | Planned | — | No | No | Absent |
| DOC-TECH-EVT | technical/EVENTS.md | Technical events | Planned | DOC-EVT | No | No | Absent |
| DOC-TECH-STO | technical/STORAGE.md | Storage | Planned | — | No | No | Absent |
| DOC-TECH-DEP | technical/DEPLOYMENT.md | Deployment | Planned | — | No | No | Absent |
| DOC-TECH-SEC | technical/SECURITY.md | Security | Planned | — | No | No | Absent |
| DOC-TECH-MON | technical/MONITORING.md | Monitoring | Planned | — | No | No | Absent |

---

# 2. Approved Contracts

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| CTR-PKG | `@prima/contracts` | Constitutional & Kernel contracts package | Official | PDC, ES-\* | Yes | Yes | Complete |
| CTR-KERNEL | Kernel / Engine / Lifecycle / Health / Config | EOS Kernel contracts | Official | ES-002 | Yes | Yes | Complete |
| CTR-EVENT | Event envelope + Event Bus interface | Event transport contracts | Official | ES-003 | Yes | Yes | Complete |
| CTR-COMMAND | Command envelope + Command Bus interface | Command transport contracts | Official | ES-004 | Yes | Yes | Complete |
| CTR-ENGINE | EngineContract / capability manifest | Engine SDK contracts | Official | ES-006 | Yes | Yes | Complete |
| CTR-CTX | PrimaContext (ES-007 Context detail) | Working Context typed model | Official | ES-007 | Yes | Yes | Complete |
| CTR-KN | PrimaKnowledge\* (ES-008) | Knowledge Object/Pack/Package typed model | Official | ES-008 | Yes | Yes | Complete |
| CTR-CO | Cognitive Objects (ES-007) | CO-01…CO-20 envelope + COV validators | FINAL | ES-007, CM-001 | Yes | Yes | Complete |
| CTR-KE-API | Knowledge Engine service types | Import/query/resolve API types | Official | ES-009 | Yes | Yes | Complete |
| CTR-SVC | Constitutional Service Contracts | SVC-\* business façades | Official (doc) | DOC-SVC | No | No | Complete |
| CTR-CA | Canonical Artifacts contracts | Product artifact shapes | Official (doc) | DOC-CA | No | No | Complete |

---

# 3. Runtime Specifications

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| RT-ES-002 | EOS Kernel runtime | Kernel lifecycle, registry, health | Official | ES-002, CTR-KERNEL | Yes | Yes | Complete |
| RT-ES-003 | Event Bus runtime | In-memory Event Bus | Official | ES-003 | Yes | Yes | Complete |
| RT-ES-004 | Command Bus runtime | In-memory Command Bus | Official | ES-004 | Yes | Yes | Complete |
| RT-ES-006 | Engine SDK runtime | BasePrimaEngine | Official | ES-006 | Yes | Yes | Complete |
| RT-ES-009 | Knowledge Engine runtime | ENG-02 knowledge as a service | Official | ES-009, ES-008 | Yes | Yes | Complete |
| RT-COMP | Composition Root standard | Wiring rules | Official | B-05, ES-002 | Partial | No | Complete |
| RT-INFRA | Infrastructure adapters | Persistence, messaging, workers, identity, extensions | Scaffold | PAS L6 | No | No | Stub |
| RT-WORKERS | AI / integration workers | Model workers behind Ports | Scaffold | Infra | No | No | Stub |

---

# 4. Cognitive Models

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| CM-001 | Cognitive Model | Constitutional cognition | Official | Bible, AP | Partial | Partial | Complete |
| CM-CORE | Cognitive Core | Module elaboration under CM-001 | Official | CM-001 | Partial | No | Complete |
| CM-CO | Cognitive Objects Model (ES-007) | CO-01…CO-20 | FINAL | CM-001 | Yes (envelope) | Yes | Complete |
| CM-CTX | Context Object detail | CO-01 dimensions | Official | ES-007 | Yes (types) | Yes | Complete |
| CM-KN | Knowledge Model (ES-008) | Knowledge units | Official | ES-007 | Yes (types) | Yes | Complete |
| CM-PIPE | Educational Cognitive Pipeline | POSS §3 pipeline S\* stages | Official | POSS, CM-001 | No (orchestration) | No | Complete |
| CM-MEM | Cognitive Memory types | Working/episodic/… in CM-001 | Official | CM-001 | No | No | Complete |
| CM-STATE | Cognitive States | CM-001 Ch.6 | Official | CM-001, DOC-SM | No | No | Complete |

---

# 5. Engineering Specifications

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| PDC | Development Constitution | Binding development rules | Official | PAS, POSS | Partial | No | Complete |
| ES-001 | Repository Foundation | Monorepo foundation | Official | PDC, PAS | Partial | No | Complete |
| ES-002 | EOS Kernel | Kernel | Official | ES-001 | Yes | Yes | Complete |
| ES-003 | Event Bus | Event Bus | Official | ES-002 | Yes | Yes | Complete |
| ES-004 | Command Bus | Command Bus | Official | ES-003 | Yes | Yes | Complete |
| ES-005 | *(unassigned)* | — | Absent | — | No | No | Absent |
| ES-006 | Engine SDK & Engine Contract | Engine base contract | Official | ES-002 | Yes | Yes | Complete |
| ES-007 | Cognitive Objects Model | CO catalog + envelope | FINAL | CM-001, ES-006 | Yes | Yes | Complete |
| ES-007-CTX | Context Object Detail | PrimaContext dimensions | Official | ES-007 | Yes | Yes | Complete |
| ES-008 | Canonical Knowledge Model | Knowledge units | Official | ES-007 | Yes | Yes | Complete |
| ES-009 | Knowledge Engine (ENG-02) | Knowledge Engine | Official | ES-006, ES-008 | Yes | Yes | Complete |
| ES-010+ | Engine ES for ENG-00/01/03–10 | Per-engine engineering specs | Absent | CEA, ES-006 | No | No | Absent |
| AGR-001 | Architecture Gate Review — ES-001 | Gate decision | Official — GO WITH RECOMMENDATIONS | ES-001 | N/A | N/A | Complete |
| SUP-CR | Composition Root | Wiring standard | Official | AGR B-05 | Partial | No | Complete |
| SUP-MAP | PAS Module ↔ Package Map | Module mapping | Official | AGR B-04 | Partial | No | Complete |

---

# 6. Architecture Decision Records

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| ADR-LOG | `docs/engineering/adr/` | ADR repository | Absent (AGR B-08) | PDC | No | No | Absent |
| AGR-001 | GO WITH RECOMMENDATIONS | Authorize foundation path + B-01…B-16 backlog | Official | ES-001 | Partial | No | Complete |
| DEC-CEA | Engine catalog keep/reject | ENG set; reject Assessment/Recommendation Engines | Official (in CEA) | POSS | Yes (structure) | No | Complete |
| DEC-CM-001 | CM-001 precedence over Cognitive Core | Cognitive authority | Official | CM-001 | Yes (docs) | No | Complete |
| DEC-ES-007 | ES-007 = Cognitive Objects; Context = CO-01 detail | Model identity | FINAL | ES-007 | Yes | Yes | Complete |

**Note:** No formal ADR files exist. Binding decisions live inside AGR/CEA/CM/ES documents.

---

# 7. APIs

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| API-HTTP | Teacher Workspace HTTP/REST API | External application API | Planned | DOC-TECH-API | No | No | Absent |
| API-CMD | Command Bus API | Write-side application API | Official | ES-004, DOC-CMD | Partial (bus only; handlers sparse) | Yes (bus) | Partial |
| API-QRY | Query / Read Model API | CQRS read side | Official (doc) | DOC-QRY | No | No | Complete (doc) / Absent (runtime) |
| API-EVT | Event Bus publish/subscribe API | Internal messaging | Official | ES-003 | Yes | Yes | Complete |
| API-KE | Knowledge Engine pull API | knowledge.import/search/resolve/… | Official | ES-009 | Yes | Yes | Complete |
| API-ENG | Engine lifecycle API | initialize/configure/start/… | Official | ES-006 | Yes | Yes | Complete |
| API-KERNEL | EosKernel API | register/start/stop/health | Official | ES-002 | Yes | Yes | Complete |

---

# 8. Pipelines

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| PIPE-ECP | Educational Cognitive Pipeline | Understand→Strategize→Design→…→Memory | Official | POSS, CM-001 | No | No | Complete |
| PIPE-CO | Cognitive Object coupling chain | CO-20→…→CO-16 lineage | FINAL | ES-007 | Partial (validators) | Yes | Complete |
| PIPE-CMD | Command handling pipeline | Validate→Authorize→Handle→Events | Official | ES-004 | Yes (bus) | Yes | Complete |
| PIPE-EVT | Event delivery pipeline | Sync/async/DLQ/ordering | Official | ES-003 | Yes | Yes | Complete |
| PIPE-VAL-SELF | Blueprint Self-Validation | Pre-review critique | Official | ENG-07, DOC-SM | No | No | Complete (constitutional) |
| PIPE-VAL-REAL | Realization Validation | Post-generation critique | Official | ENG-07 | No | No | Complete (constitutional) |
| PIPE-GEN | Generation under Approval | Authorize→Generate→Validate | Official | ENG-08, POL | No | No | Complete (constitutional) |
| PIPE-REF-MEM | Reflection→Memory learning | Controlled learning loop | Official | ENG-09/10, CM-001 | No | No | Complete |
| PIPE-CI | CI / release pipeline | Build-test-release | Partial (scripts) | ES-001, AGR B-15 | Partial | Partial | Stub |

---

# 9. Contracts (typed & constitutional — consolidated index)

*See §2. This section enumerates contract surfaces by layer.*

| Layer | Contract surface | Package / Doc | Impl | Tested |
|-------|------------------|---------------|------|--------|
| L2 Kernel | Engine, KernelContext, Lifecycle, Health | `@prima/contracts` | Yes | Yes |
| Messaging | PrimaEvent, EventBus, EventDraft | `@prima/contracts` + `@prima/event-bus` | Yes | Yes |
| Commands | PrimaCommand, CommandBus, Authorizer | `@prima/contracts` + `@prima/command-bus` | Yes | Yes |
| Engine SDK | EngineCapabilityManifest, EngineContract | `@prima/contracts` + `@prima/engine-sdk` | Yes | Yes |
| Cognition | CognitiveObjectEnvelope, COV-\* | `@prima/contracts` | Yes | Yes |
| Context | PrimaContext, CTX-\* | `@prima/contracts` | Yes | Yes |
| Knowledge | KnowledgeObject/Pack/Package | `@prima/contracts` | Yes | Yes |
| Knowledge Engine | KnowledgeImport/Query/Resolve… | `@prima/contracts` | Yes | Yes |
| Domain Commands/Events | Constitutional catalogs | docs only | No | No |
| Policies | POL-\* | docs only | No | No |
| Queries | QRY-\* / RM-\* | docs only | No | No |
| Service façades | SVC-\* | docs only | No | No |

---

# 10. Test Specifications

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| TST-CONTRACTS | `@prima/contracts` tests | Context, Knowledge, Cognitive Objects MVP | Live | CTR-\* | Yes | Yes | Stub (inline) |
| TST-EOS | `@prima/eos` tests | Kernel lifecycle | Live | ES-002 | Yes | Yes | Stub |
| TST-EB | `@prima/event-bus` tests | Bus behaviour | Live | ES-003 | Yes | Yes | Stub |
| TST-CB | `@prima/command-bus` tests | Command bus | Live | ES-004 | Yes | Yes | Stub |
| TST-SDK | `@prima/engine-sdk` tests | SDK contract suite | Live | ES-006 | Yes | Yes | Stub |
| TST-KE | `@prima/engine-knowledge` tests | Knowledge Engine | Live | ES-009 | Yes | Yes | Stub |
| TST-ROOT | `npm run test:packages` | Aggregate package tests | Live | workspaces | Yes | Yes | Stub |
| TST-E2E | End-to-end Teacher journey | Pipeline E2E | Absent | PIPE-ECP | No | No | Absent |
| TST-BOUND | Dependency boundary / illegal import | AGR B-03/B-10 | Absent | PDC | No | No | Absent |
| TST-COV | Formal test specification docs | ES-level test plans beyond inline | Absent | ES-\* | Partial (inline) | Yes (runtime pkgs) | Absent |
| TST-UI | Teacher UI tests | `src/` / apps | Absent / minimal | Transitional UI | No | No | Absent |

---

# 11. Repository Modules

## 11.1 npm workspaces (live)

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| MOD-CTR | `@prima/contracts` | Contracts | Live | — | Yes | Yes | Complete |
| MOD-EOS | `@prima/eos` | EOS Kernel (ENG-00 runtime core) | Live | contracts, event-bus | Yes | Yes | Complete |
| MOD-EB | `@prima/event-bus` | Event Bus | Live | contracts | Yes | Yes | Complete |
| MOD-CB | `@prima/command-bus` | Command Bus | Live | contracts, event-bus | Yes | Yes | Complete |
| MOD-SDK | `@prima/engine-sdk` | Engine SDK | Live | contracts | Yes | Yes | Complete |
| MOD-KE | `@prima/engine-knowledge` | Knowledge Engine ENG-02 | Live | contracts, sdk, event-bus | Yes | Yes | Complete |

## 11.2 Package scaffolds (README / stub — not workspaces)

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| MOD-DOM | `packages/domain` | L4 domain | Scaffold | — | No | No | Stub |
| MOD-APP | `packages/application` | L1 application | Scaffold | — | No | No | Stub |
| MOD-UI | `packages/ui` | L0 UI kit | Scaffold | — | No | No | Stub |
| MOD-QRY | `packages/query` | CQRS read | Scaffold | — | No | No | Stub |
| MOD-PROJ | `packages/project` | MOD-02 Project Continuity | Scaffold | — | No | No | Stub |
| MOD-DEL | `packages/delivery` | MOD-08 Delivery | Scaffold | — | No | No | Stub |
| MOD-AUTH | `packages/authority` | MOD-11 Teacher Authority | Scaffold | — | No | No | Stub |
| MOD-GOV | `packages/governance` | MOD-12 Governance | Scaffold | — | No | No | Stub |
| MOD-TEST | `packages/testing` | Test doubles | Scaffold | — | No | No | Stub |
| MOD-CFG | `packages/config` | Config schemas | Scaffold | — | No | No | Stub |
| ENG-01-PKG | `packages/engines/context` | ENG-01 | Scaffold | sdk | No | No | Stub |
| ENG-03-PKG | `packages/engines/intent` | ENG-03 | Scaffold | sdk | No | No | Stub |
| ENG-04-PKG | `packages/engines/understanding` | ENG-04 | Scaffold | sdk | No | No | Stub |
| ENG-05-PKG | `packages/engines/strategy` | ENG-05 | Scaffold | sdk | No | No | Stub |
| ENG-06-PKG | `packages/engines/blueprint` | ENG-06 | Scaffold | sdk | No | No | Stub |
| ENG-07-PKG | `packages/engines/validation` | ENG-07 | Scaffold | sdk | No | No | Stub |
| ENG-08-PKG | `packages/engines/generation` | ENG-08 | Scaffold | sdk | No | No | Stub |
| ENG-09-PKG | `packages/engines/reflection` | ENG-09 | Scaffold | sdk | No | No | Stub |
| ENG-10-PKG | `packages/engines/memory` | ENG-10 | Scaffold | sdk | No | No | Stub |

## 11.3 Applications & infrastructure

| Identifier | Name | Purpose | Status | Dependencies | Impl | Tested | Doc |
|------------|------|---------|--------|--------------|------|--------|-----|
| APP-TW | `apps/teacher-workspace` | Target Teacher app | Scaffold README | PAS MOD-01 | No | No | Stub |
| APP-SRC | `src/` Vite Teacher UI | Transitional runnable UI | Transitional | — | Yes (UI) | No | Partial |
| INF-PERSIST | `infrastructure/persistence` | L6 persistence | Scaffold | — | No | No | Stub |
| INF-MSG | `infrastructure/messaging` | L6 messaging | Scaffold | — | No | No | Stub |
| INF-ID | `infrastructure/identity` | L6 identity | Scaffold | — | No | No | Stub |
| INF-WORK | `infrastructure/workers` | L6 workers | Scaffold | — | No | No | Stub |
| INF-EXT | `infrastructure/extensions` | Extension host seam | Scaffold | MOD-13 | No | No | Stub |

---

# 12. Gap Analysis

## 12.1 Missing engineering specifications

| Gap ID | Missing artifact | Authority source requiring it |
|--------|------------------|-------------------------------|
| G-ES-005 | ES-005 slot unused / undefined | SPEC_INDEX sequence gap |
| G-ES-ENG | ES specs for ENG-00 (orch productization), ENG-01, ENG-03…ENG-10 | CEA + ES-006 pattern (ES-009 exists only for ENG-02) |
| G-ES-AUTH | Teacher Authority / Policy runtime ES | DOC-POL, MOD-11 |
| G-ES-QRY | Query Bus / Read Model ES | DOC-QRY, MOD-QRY |
| G-ES-APP | Application Layer / Use-Case runtime ES | DOC-UC, MOD-APP |
| G-ES-001.1 | Foundation hardening ES for AGR B-01…B-05, B-16 | AGR-001 |

## 12.2 Missing runtime specifications

| Gap ID | Missing runtime | Notes |
|--------|-----------------|-------|
| G-RT-PIPE | Pipeline Orchestration runtime binding CO/CM states to Kernel | POSS PIPE-ECP not executable |
| G-RT-POL | Policy evaluation runtime | POL-\* doc-only |
| G-RT-HANDLERS | Command handlers for constitutional Commands | Bus exists; handlers absent |
| G-RT-PROJ | Event projections / Continuă read models | AGR B-06 |
| G-RT-INFRA | Persistence / distributed cache / identity adapters | Ports not wired |
| G-RT-COMP-ROOT | Executable composition root app bootstrap | Standard documented; app wiring Incomplete |

## 12.3 Missing contracts

| Gap ID | Missing contract | Notes |
|--------|------------------|-------|
| G-CTR-CMD-CAT | Typed constitutional Command catalog in `@prima/contracts` | DOC-CMD not typed |
| G-CTR-EVT-CAT | Typed constitutional Domain Event catalog | DOC-EVT not fully typed as domain catalog |
| G-CTR-POL | Policy contract types | DOC-POL |
| G-CTR-QRY | Query/ReadModel contract types | DOC-QRY |
| G-CTR-CO-PAYLOAD | Per-CO payload schemas beyond envelope | ES-007 envelope only; CO-02… payloads conceptual |
| G-CTR-BP | Instructional Blueprint typed schema | DOC-IB not in contracts |
| G-CTR-APPROVAL | TeacherApproval / GenerateAuthorization typed records | Named in CO-10/11; full payload pending |

## 12.4 Missing APIs

| Gap ID | Missing API | Notes |
|--------|-------------|-------|
| G-API-HTTP | Teacher Workspace HTTP API | technical/API.md Absent |
| G-API-QRY | Query API runtime | package stub |
| G-API-AUTHZ | Authorization façade API | authority stub |
| G-API-EXPORT | Export / Delivery API | delivery stub |
| G-API-SESSION | Design session / Continuă API | application stub |

## 12.5 Missing cognitive objects (payload depth)

| Gap ID | Object | Gap |
|--------|--------|-----|
| G-CO-PAY | CO-02…CO-20 | Envelope + coupling validated; normative field-level payloads not typed except CO-01 (Context) and CO-05 (via ES-008 Knowledge Package) |
| G-CO-EXPORT | Export Authorization / Export Package | Canonical Artifacts has Export; not in CO catalog as first-class CO (craft/export authority remains Teacher — catalog gap vs CA) |
| G-CO-LE | Learning Experience object binding | Domain entity exists; not a CO id |

## 12.6 Missing state machines (runtime)

| Gap ID | State machine | Doc | Runtime |
|--------|---------------|-----|---------|
| G-SM-PIPE | Pipeline position machine | DOC-SM / POSS | Not implemented |
| G-SM-INTENT | Educational Intent lifecycle | DOC-SM | Not implemented |
| G-SM-STRAT | Strategy lifecycle | DOC-SM | Not implemented |
| G-SM-BP | Blueprint / Version / Approval | DOC-SM | Not implemented |
| G-SM-VAL | ValidationReport states | DOC-SM | Not implemented |
| G-SM-GEN | Generation Package states | DOC-SM | Not implemented |
| G-SM-MEM | Memory Item acceptance | DOC-SM | Not implemented |

## 12.7 Missing protocols

| Gap ID | Protocol | Notes |
|--------|----------|-------|
| G-PROTO-ENG | Inter-engine collaboration protocol (Commands/Events only) | Declared; not enforced in CI |
| G-PROTO-PORT | Port/Adapter registration protocol at Composition Root | Partial doc |
| G-PROTO-FAIL | Fail-visible recovery protocol runtime | DOC-FM / POSS — not coded |
| G-PROTO-TRACE | Reasoning Trace append protocol | CO-18 defined; no runtime writer |
| G-PROTO-SEM | SemanticSearchPort for Knowledge | Reserved in ES-009; unimplemented |

## 12.8 Missing governance documents

| Gap ID | Missing | Notes |
|--------|---------|-------|
| G-GOV-ADR | ADR log directory + template | AGR B-08 |
| G-GOV-OWN | CODEOWNERS / named teams | AGR B-07 |
| G-GOV-BOUND | Dependency boundary CI policy as enforced gate | AGR B-03 |
| G-GOV-DUAL | Dual-tree (`src/` vs apps) migration policy dated | AGR B-01 |
| G-GOV-REL | Release / changelog governance | AGR B-15 |
| G-GOV-OBS | Observability & audit plane conventions | AGR B-09 |
| G-GOV-SEC | Security engineering spec | technical/SECURITY Absent |

---

# 13. Architectural Completion Roadmap

Ordered by implementation priority. No redesign. Extends approved architecture only.

| Priority | ID | Work item | Closes gaps | Exit criteria |
|----------|-----|-----------|-------------|---------------|
| **P0** | R-01 | ES-001.1 Foundation hardening: dual-tree policy, workspaces completeness claim, boundary CI plan | G-ES-001.1, G-GOV-DUAL, G-GOV-BOUND | AGR B-01…B-05, B-16 accepted/closed |
| **P0** | R-02 | ADR log + template under `docs/engineering/adr/` | G-GOV-ADR, §6 | First ADRs filed for AGR-001, CEA engine set, ES-007 |
| **P0** | R-03 | Typed constitutional Command + Domain Event catalogs in `@prima/contracts` | G-CTR-CMD-CAT, G-CTR-EVT-CAT | Validators + tests for MVP command/event subset |
| **P0** | R-04 | Teacher Authority policy contracts + `packages/authority` MVP (Approve / Authorize Generate fail-closed) | G-ES-AUTH, G-CTR-POL, G-API-AUTHZ | Command Bus authorizer wired; CO-10/CO-11 enforceable |
| **P0** | R-05 | ES-010 Context Engine (ENG-01) — model already ES-007-CTX | G-ES-ENG, ENG-01-PKG | Engine implements CO-01 assembly; tests green |
| **P1** | R-06 | ES-011 Intent Engine (ENG-03) — CO-02 payloads typed | G-ES-ENG, G-CO-PAY | Intent lifecycle + tests |
| **P1** | R-07 | ES-012 Understanding Engine (ENG-04) — CO-03 | G-ES-ENG | Understanding Ready gate + tests |
| **P1** | R-08 | ES-013 Strategy Engine (ENG-05) — CO-04 | G-ES-ENG | Teacher Select confirm path + tests |
| **P1** | R-09 | ES-014 Blueprint Engine (ENG-06) — CO-07/08 + Blueprint typed schema | G-ES-ENG, G-CTR-BP, G-SM-BP | Draft/version mint + coupling COV-04 |
| **P1** | R-10 | Pipeline Position runtime (ENG-00 orchestration binding) | G-RT-PIPE, G-SM-PIPE, G-PROTO-TRACE | Illegal skips blocked; CO-17/18 written |
| **P1** | R-11 | Command handlers for MVP design Commands | G-RT-HANDLERS, API-CMD | Happy-path Intent→Understanding→Strategy→Blueprint |
| **P2** | R-12 | ES-015 Validation Engine (ENG-07) — CO-09 | G-ES-ENG, PIPE-VAL-\* | Self-validation Succeeded/Warned/Blocked |
| **P2** | R-13 | ES-016 Generation Engine (ENG-08) — CO-11/12/13 | G-ES-ENG, PIPE-GEN | Generation blocked without CO-10/11 |
| **P2** | R-14 | ES-017 Reflection + ES-018 Memory (ENG-09/10) | G-ES-ENG, PIPE-REF-MEM | Proposals only; accept path |
| **P2** | R-15 | Query ES + `packages/query` MVP read models | G-ES-QRY, G-API-QRY, G-RT-PROJ | Orientation / Continuă queries |
| **P2** | R-16 | Application Layer ES + use-case orchestration | G-ES-APP | Application dispatches Commands only |
| **P2** | R-17 | Migrate Teacher UI `src/` → `apps/teacher-workspace` | APP-SRC, APP-TW, B-01 | Single app home |
| **P3** | R-18 | HTTP API + technical/API.md | G-API-HTTP, DOC-TECH-\* | Versioned external API |
| **P3** | R-19 | Infrastructure adapters (persistence, identity) | G-RT-INFRA | Ports replaceable; Kernel unchanged |
| **P3** | R-20 | E2E Teacher journey tests + boundary golden tests | TST-E2E, TST-BOUND | CI gate |
| **P3** | R-21 | Observability/audit/security engineering docs + planes | G-GOV-OBS, G-GOV-SEC | Enterprise ops ready |
| **P3** | R-22 | Resolve ES-005 assignment or formally reserve | G-ES-005 | SPEC_INDEX explicit |
| **P3** | R-23 | CO payload schemas for remaining objects; Export authority object alignment vs Canonical Artifacts | G-CO-PAY, G-CO-EXPORT | Zero ambiguity for implementers |

---

# 14. Inventory Summary

| Class | Approved / present | Implemented | Tested | Major gaps |
|-------|-------------------|-------------|--------|------------|
| Product constitutional docs | High | Low–Partial | Low | Runtime binding |
| Engineering ES-001…004,006–009 | High | High (listed) | High | Engines ENG-01,03–10 ES missing |
| Cognitive (CM-001, CO, Context, Knowledge) | High | Envelope/types Yes | Yes | Pipeline runtime |
| Contracts package | High for platform | Yes | Yes | Domain command/event/policy catalogs |
| Engines | ENG-02 live; others scaffold | Partial | Partial | 9 engines |
| APIs | Internal buses Yes | Partial | Partial | HTTP/Query/Authority |
| ADR log | Absent | No | No | B-08 |
| Teacher app | Transitional `src/` | UI Yes / EOS No | No | Migration |

**Architectural posture:** Platform runtime spine (Kernel, Event Bus, Command Bus, Engine SDK, Knowledge Engine, Cognitive Objects contracts) is present and tested. Educational Cognitive Pipeline end-to-end remains documentation-complete and runtime-incomplete.

---

## Document Control

| Item | Value |
|------|-------|
| **Title** | PRIMA Architecture Inventory |
| **Version** | 1.0 |
| **Status** | Official |
| **Location** | `docs/engineering/PRIMA_ARCHITECTURE_INVENTORY.md` |
| **Update rule** | Amend on each ES merge / AGR decision / package workspace change |
