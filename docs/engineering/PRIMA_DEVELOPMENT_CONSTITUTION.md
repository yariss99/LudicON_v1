---
Status: Official — PRIMA Development Constitution (PDC)
Version: 1.0
Owner: LUDI ON Engineering
Depends On: docs/product/DOCUMENT-000_PRIMA_MANIFESTO.md, docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md, docs/product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md, docs/product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md, docs/product/PRIMA_CONSTITUTIONAL_POLICIES.md
Related Documents: ES-001_REPOSITORY_FOUNDATION.md, SPEC_INDEX.md
Last Updated: July 2026
---

# PRIMA Development Constitution (PDC)

**Version:** 1.0  
**Status:** Official — Binding on all engineering work  
**Horizon:** ≥ 10 years  

> The PDC governs **how** PRIMA is built.  
> DOCUMENT-000 (Manifesto) governs **why PRIMA exists** and what it must never become.  
> POSS governs **what the Educational Operating System is**.  
> PAS governs **technical structure**.  
> On conflict: **DOCUMENT-000 > POSS > PAS > PDC > local convenience**.

---

## PDC Principles

| ID | Principle |
|----|-----------|
| **PDC-01** | Faithfully implement POSS and PAS — never redesign them in code |
| **PDC-02** | No new Engines, Modules, or Layers without a constitutional/PAS amendment |
| **PDC-03** | Dependencies point inward to Domain |
| **PDC-04** | Engines collaborate only via Orchestrator or Domain Events |
| **PDC-05** | Teacher Authority exclusive acts are never automated or faked in tests as production truth |
| **PDC-06** | Fail visible — never convert failures into silent success |
| **PDC-07** | Technology choices live in Infrastructure adapters — Domain stays pure |
| **PDC-08** | AI models are workers behind Ports — never the architecture |
| **PDC-09** | Simplest solution that preserves architecture wins |
| **PDC-10** | Documentation of public package intent is mandatory |

---

## Hard prohibitions

1. UI calling Engines, persistence, or AI workers directly.  
2. Generation mutating Blueprint authority.  
3. Memory writing Knowledge packs.  
4. Auto-Approve, auto-Authorize Generate, or auto-Export.  
5. Assessment or Recommendation packages/engines.  
6. `packages/core` catch-all.  
7. Feature flags that bypass Policies.

---

## Change control

| Change type | Required |
|-------------|----------|
| Bugfix / UI polish inside PAS | Normal PR |
| New package aligning to existing PAS module | PR + ARCHITECTURE note |
| New Engine / Layer / Module | **Architecture Change** issue + POSS/PAS doc update first |
| Policy relaxation | Product + constitutional review |

---

## Package README obligation

Every package under `packages/` and `apps/` MUST contain a `README.md` with: Purpose, Owner, Allowed deps, Forbidden deps, PAS mapping.
