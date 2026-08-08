---
Status: Official — Specification Index
Version: 1.0
Owner: LUDI ON Engineering
Last Updated: July 2026
---

# PRIMA Specification Index

| Code | Full name | Authoritative document(s) |
|------|-----------|---------------------------|
| **DOCUMENT-000** | The PRIMA Manifesto — **permanent philosophical identity** (Absolute) | [`../product/DOCUMENT-000_PRIMA_MANIFESTO.md`](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) |
| **POSS** | PRIMA Operating System Specification | [`../product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md`](../product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md) and the Constitutional models under `docs/product/PRIMA_CONSTITUTIONAL_*.md` |
| **PAS-001** | PRIMA System Architecture (PSA) — **constitutional platform architecture** | [`PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md`](./PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md) |
| **PAS-002** | PRIMA Domain Architecture (PDA) — **canonical business domains** | [`PAS-002_PRIMA_DOMAIN_ARCHITECTURE.md`](./PAS-002_PRIMA_DOMAIN_ARCHITECTURE.md) |
| **PAS-003** | PRIMA Service Architecture — **canonical logical services** | [`PAS-003_PRIMA_SERVICE_ARCHITECTURE.md`](./PAS-003_PRIMA_SERVICE_ARCHITECTURE.md) |
| **PAS-004** | PRIMA Knowledge Architecture (PKA) — **canonical Knowledge Layer** | [`PAS-004_PRIMA_KNOWLEDGE_ARCHITECTURE.md`](./PAS-004_PRIMA_KNOWLEDGE_ARCHITECTURE.md) · model detail: [`ES-008_KNOWLEDGE_MODEL.md`](./ES-008_KNOWLEDGE_MODEL.md) |
| **PAS-005** | PRIMA AI Architecture (PAIA) — **canonical AI Layer** | [`PAS-005_PRIMA_AI_ARCHITECTURE.md`](./PAS-005_PRIMA_AI_ARCHITECTURE.md) |
| **AI-001** | PRIMA Reasoning Pipeline — **canonical per-message pedagogical reasoning** | [`AI-001_PRIMA_REASONING_PIPELINE.md`](./AI-001_PRIMA_REASONING_PIPELINE.md) · runtime: `src/engines/reasoning/` |
| **AI-002** | Pedagogical Decision Engine (MVP) — **rule-based next action** | Runtime: `src/features/create-learning-experience/decision-engine/` |
| **AI-002.5** | Pedagogical Validation Layer — **approve/reject before verbalization** | Runtime: `src/engines/validation/` |
| **AI-003** | Pedagogical Inference Engine (MVP) — **HIGH-confidence rule inference** | Runtime: `src/engines/inference/` |
| **UX-001** | Teacher Language First — **educational UI language** | [`UX-001_TEACHER_LANGUAGE_FIRST.md`](./UX-001_TEACHER_LANGUAGE_FIRST.md) · glossary: `src/i18n/ro/teacherLanguage.ts` |
| **UX-002** | PRIMA Voice & Language — **full UI copy alignment** | [`UX-002_PRIMA_VOICE_LANGUAGE.md`](./UX-002_PRIMA_VOICE_LANGUAGE.md) · glossary: `src/i18n/ro/teacherLanguage.ts` |
| **FEATURE-001** | Lesson Blueprint Studio — **editable lesson workspace** | [`FEATURE-001_LESSON_BLUEPRINT_STUDIO.md`](./FEATURE-001_LESSON_BLUEPRINT_STUDIO.md) · `src/features/lesson-blueprint/` |
| **FEATURE-002** | Pedagogical Object Model (POM) — **canonical educational resource model** | [`FEATURE-002_PEDAGOGICAL_OBJECT_MODEL.md`](./FEATURE-002_PEDAGOGICAL_OBJECT_MODEL.md) · contracts: `@prima/contracts` `prima-pedagogical-objects` |
| **FEATURE-003** | Pedagogical Intelligence Engine (PIE) — **central lesson quality reasoning** | [`FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md`](./FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md) · runtime: `src/engines/pie/` · contracts: `prima-pedagogical-intelligence` |
| **FEATURE-004** | Universal Pedagogical Editor (UPE) — **single creative workspace for all POM resources** | [`FEATURE-004_UNIVERSAL_PEDAGOGICAL_EDITOR.md`](./FEATURE-004_UNIVERSAL_PEDAGOGICAL_EDITOR.md) · runtime: `src/features/universal-editor/` · route: `/editor/:objectId` |
| **FEATURE-005** | Publishing & Delivery Engine (PDE) — **destination-oriented delivery of pedagogical objects** | [`FEATURE-005_PUBLISHING_DELIVERY_ENGINE.md`](./FEATURE-005_PUBLISHING_DELIVERY_ENGINE.md) · runtime: `src/engines/pde/` · UI: `/publishing` |
| **FEATURE-006** | Reflective Practice & Teaching Insights (RPTI) — **private professional growth after each lesson** | [`FEATURE-006_REFLECTIVE_PRACTICE_TEACHING_INSIGHTS.md`](./FEATURE-006_REFLECTIVE_PRACTICE_TEACHING_INSIGHTS.md) · runtime: `src/engines/rpti/` · UI: `/reflection` |
| **FEATURE-007** | Knowledge Hub & Pedagogical Memory (KHPM) — **long-term pedagogical knowledge graph** | [`FEATURE-007_KNOWLEDGE_HUB_PEDAGOGICAL_MEMORY.md`](./FEATURE-007_KNOWLEDGE_HUB_PEDAGOGICAL_MEMORY.md) · runtime: `src/engines/khpm/` · UI: `/knowledge` |
| **FEATURE-008** | Student Learning Intelligence (SLI) — **evidence-based instructional support (no ranking)** | [`FEATURE-008_STUDENT_LEARNING_INTELLIGENCE.md`](./FEATURE-008_STUDENT_LEARNING_INTELLIGENCE.md) · runtime: `src/engines/sli/` · UI: `/learning` |
| **DESIGN-002** | PRIMA Design Specification v1.0 — **permanent UX/UI source of truth** (13 chapters) | [`../design/DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md`](../design/DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md) |
| **DESIGN-001** | PRIMA Design System & Hi-Fi Prototype — executable tokens + components | [`../design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md`](../design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · runtime: `src/design-system/` · showcase: `/design-system` |
| **DB-CH01** | Design Book Ch.1 — Creative Direction — **permanent visual identity** (Absolute) | [`../design/DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md`](../design/DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) |
| **DB-CH02** | Design Book Ch.2 — PRIMA Design Language (PDL) — **visual constitution / grammar** (Critical) | [`../design/DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md`](../design/DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) |
| **DB-CH03** | Design Book Ch.3 — Pedagogical Design System (PDS) — **pedagogical component catalog** (Critical) | [`../design/DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md`](../design/DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) · POM: FEATURE-002 · runtime: `src/design-system/` |
| **DB-CH04** | Design Book Ch.4 — Experience Patterns — **workflow grammar** (Critical) | [`../design/DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md`](../design/DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) |
| **DB-CH05** | Design Book Ch.5 — Teacher Journeys — **intention → outcome arcs** (Critical) | [`../design/DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md`](../design/DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) |
| **DB-CH06** | Design Book Ch.6 — Motion & Interaction System — **motion language** (Critical) | [`../design/DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md`](../design/DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md) · tokens: `src/styles/prima-design-tokens.css` |
| **DB-CH07** | Design Book Ch.7 — Accessibility & Inclusive Design — **a11y constitution** (Critical) | [`../design/DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md`](../design/DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md) |
| **DB-CH08** | Design Book Ch.8 — Responsive & Adaptive Experience — **device/mode continuity** (Critical) | [`../design/DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md`](../design/DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md) |
| **DB-CH09** | Design Book Ch.9 — PRIMA AI Interaction Model (PAIM) — **how teachers experience intelligence** (Absolute) | [`../design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md`](../design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md) |
| **DB-CH10** | Design Book Ch.10 — Product Blueprint & Screen Library — **master screen inventory** (Absolute) | [`../design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md`](../design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) |
| **DB-CH11** | Design Book Ch.11 — Teacher Desk (HOME-001 / Biroul meu) visual constitution | [`../design/DESIGN_BOOK_CH11_TEACHER_DESK.md`](../design/DESIGN_BOOK_CH11_TEACHER_DESK.md) · runtime: `src/features/teacher-desk/` · `/` · `/desk` |
| **DB-CH12** | Design Book Ch.12 — Lesson Design Studio (LESSON-001) visual constitution | [`../design/DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md`](../design/DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md) · FEATURE-001 · `/blueprint/review/:id` |
| **PAS-006** | PRIMA Learning Architecture (PLA) — **canonical pedagogical Learning Layer** | [`PAS-006_PRIMA_LEARNING_ARCHITECTURE.md`](./PAS-006_PRIMA_LEARNING_ARCHITECTURE.md) |
| **PAS** | PRIMA Architecture Specification family | Primary: PAS-001 · Domains: PAS-002 · Services: PAS-003 · Knowledge: PAS-004 · AI: PAS-005 · Learning: PAS-006 · Technical: [`../product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md`](../product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md) · Engines: [`../product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md`](../product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md) |
| **PDC** | PRIMA Development Constitution | [`PRIMA_DEVELOPMENT_CONSTITUTION.md`](./PRIMA_DEVELOPMENT_CONSTITUTION.md) |
| **ES-001** | Repository Foundation | [`ES-001_REPOSITORY_FOUNDATION.md`](./ES-001_REPOSITORY_FOUNDATION.md) |
| **ES-002** | EOS Kernel | [`ES-002_EOS_KERNEL.md`](./ES-002_EOS_KERNEL.md) |
| **ES-003** | Event Bus | [`ES-003_EVENT_BUS.md`](./ES-003_EVENT_BUS.md) |
| **ES-004** | Command Bus | [`ES-004_COMMAND_BUS.md`](./ES-004_COMMAND_BUS.md) |
| **ES-006** | Engine SDK & Engine Contract | [`ES-006_ENGINE_SDK.md`](./ES-006_ENGINE_SDK.md) |
| **ES-007** | Cognitive Objects Model | [`ES-007_COGNITIVE_OBJECTS_MODEL.md`](./ES-007_COGNITIVE_OBJECTS_MODEL.md) · Context detail: [`ES-007_CONTEXT_MODEL.md`](./ES-007_CONTEXT_MODEL.md) |
| **ES-008** | Canonical Knowledge Model | [`ES-008_KNOWLEDGE_MODEL.md`](./ES-008_KNOWLEDGE_MODEL.md) |
| **ES-009** | Knowledge Engine (ENG-02) | [`ES-009_KNOWLEDGE_ENGINE.md`](./ES-009_KNOWLEDGE_ENGINE.md) |
| **ADL-001** | Architectural Decision Lifecycle | [`ADL-001_ARCHITECTURAL_DECISION_LIFECYCLE.md`](./ADL-001_ARCHITECTURAL_DECISION_LIFECYCLE.md) · ADR index: [`adr/README.md`](./adr/README.md) |
| **AD** | Monorepo & Runtime Stack Decisions — npm workspaces, Hono, Drizzle, BullMQ, TanStack, Zod, DataProvider | [`ARCHITECTURE_DECISIONS.md`](./ARCHITECTURE_DECISIONS.md) · structure: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) |
| **PAP-004** | Architecture Thinking Protocol (ATP) | [`PAP-004_ARCHITECTURE_THINKING_PROTOCOL.md`](./PAP-004_ARCHITECTURE_THINKING_PROTOCOL.md) |
| **PPS-001** | Prompt Engineering Standard (PPEF) | [`PPS-001_PROMPT_ENGINEERING_STANDARD.md`](./PPS-001_PROMPT_ENGINEERING_STANDARD.md) · index: [`ppef/README.md`](./ppef/README.md) |
| **PPS-002** | Architectural Prompt Pattern Language (APPL) | [`PPS-002_ARCHITECTURAL_PROMPT_PATTERN_LANGUAGE.md`](./PPS-002_ARCHITECTURAL_PROMPT_PATTERN_LANGUAGE.md) |
| **PPS-004** | Prompt Meta Model (PMM) | [`PPS-004_PROMPT_META_MODEL.md`](./PPS-004_PROMPT_META_MODEL.md) |
| **PPS-005** | Prompt Ontology (PO) | [`PPS-005_PROMPT_ONTOLOGY.md`](./PPS-005_PROMPT_ONTOLOGY.md) |
| **PPS-006** | Prompt Semantic Model (PSM) | [`PPS-006_PROMPT_SEMANTIC_MODEL.md`](./PPS-006_PROMPT_SEMANTIC_MODEL.md) |
| **PVC-001** | Prompt Validation Framework (PVF) v2.0 — **authoritative Validation subsystem** | [`PVC-001_PROMPT_VALIDATION_FRAMEWORK.md`](./PVC-001_PROMPT_VALIDATION_FRAMEWORK.md) · [`ppef/validation/`](./ppef/validation/) |
| **PVC-002…005** | Rules Spec · Engine · Profiles · Context Resolution — superseded by PVC-001 v2.0, **removed August 2026** | Catalogs survive: [`ppef/validation/rules/`](./ppef/validation/rules/) · [`ppef/validation/profiles/`](./ppef/validation/profiles/) · [`ppef/validation/contexts/`](./ppef/validation/contexts/) |

**Supporting:** [`COMPOSITION_ROOT.md`](./COMPOSITION_ROOT.md) · [`PAS_MODULE_PACKAGE_MAP.md`](./PAS_MODULE_PACKAGE_MAP.md)

**Precedence:** Foundation Suite (PRIMA-DOC-000…006) → POSS → PAS-001 (PSA) → PAS technical (RTA/CEA) → PDC → Engineering Specifications (ES-*) → code.  
**PAS family:** PAS-001 System · PAS-002 Domain · PAS-003 Service · PAS-004 Knowledge · PAS-005 AI · **PAS-006 Learning**. All PAS-xxx SHALL reference PAS-001; domains → PAS-002; services → PAS-003; Knowledge → PAS-004; AI → PAS-005; Learning Experiences/pedagogy → PAS-006. RTA/CEA remain technology-independent technical/engine detail.  
**PPEF Validation:** PVC-001 v2.0 is the single authoritative Validation subsystem. PVC-002…PVC-005 were Historical and were removed in the August 2026 documentation cleanup; their operational catalogs under `ppef/validation/` remain.

**Removed August 2026:** AGR-001 (Repository Foundation Review), INV-001 (Architecture Inventory), RIM-001 (Repository Intelligence Map), AFPRR records, PVC-002…005. The first four described a repository structure that no longer exists — see [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) and [`ARCHITECTURE_DECISIONS.md`](./ARCHITECTURE_DECISIONS.md).
