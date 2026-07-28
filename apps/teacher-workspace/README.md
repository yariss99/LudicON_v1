# teacher-workspace

**Purpose:** Teacher-facing application shell (Continuă, Projects, Design Session surfaces, Blueprint review, Resource craft, Library).  
**Owner:** Frontend + Product  
**PAS mapping:** L0 Presentation, L1 Application entry, MOD-01 Teacher Workspace  

**Allowed dependencies:** `packages/ui`, `packages/application` (façades), `packages/contracts`  
**Forbidden dependencies:** `packages/engines/*` internals, `packages/domain` persistence paths, `infrastructure/*`, AI SDKs  

**Status:** Scaffold only (ES-001). Current production UI lives temporarily in repository-root `src/` until migration (documented in ES-001 / DEVELOPMENT.md).  

**Future evolution:** Absorb `src/` and `public/`; remain the sole Teacher client until product requires additional apps.
