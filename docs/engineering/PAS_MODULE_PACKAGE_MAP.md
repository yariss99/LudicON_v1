---
Status: Official — PAS Module ↔ Package Map (AGR-001 B-04)
Version: 1.0
Owner: LUDI ON Engineering
Depends On: PAS-001, PAS (RTA/CEA), ES-001
Related Documents: PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md, SPEC_INDEX.md
Last Updated: July 2026
---

# PAS Module ↔ Package Map

Mapping only — no new Modules invented. Domain ownership aligns with [`PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md`](./PAS-001_PRIMA_SYSTEM_ARCHITECTURE.md) §6 / §11.

| PAS Module | Package / home | Notes |
|------------|----------------|-------|
| MOD-00 Orchestration Kernel | `packages/eos` | ES-002 |
| MOD-01 Teacher Workspace | `apps/teacher-workspace` (← migrate `src/`) | Presentation |
| MOD-02 Project Continuity | `packages/project` | Stub scaffold |
| MOD-03 Design Session | `packages/application` + engines context/intent/understanding/strategy | Session use cases |
| MOD-04 LE Design | `packages/engines/blueprint` + application | |
| MOD-05 Knowledge | `packages/engines/knowledge` (`@prima/engine-knowledge`, ES-009) | |
| MOD-06 Validation | `packages/engines/validation` | |
| MOD-07 Generation | `packages/engines/generation` | |
| MOD-08 Delivery & Portfolio | `packages/delivery` | Stub scaffold |
| MOD-09 Memory | `packages/engines/memory` | |
| MOD-10 Reflection | `packages/engines/reflection` | |
| MOD-11 Teacher Authority | `packages/authority` | Stub — Policy façade, not pedagogy |
| MOD-12 Platform Governance | `packages/governance` | Stub scaffold |
| MOD-13 Extension Host | `infrastructure/extensions` | Reserved |
| Query / Read Models | `packages/query` | Stub — CQRS query side |
| Contracts | `packages/contracts` | Commands/Events/Ports/Kernel contracts |
| Domain | `packages/domain` | Aggregates/Policies |
| UI kit | `packages/ui` | |
