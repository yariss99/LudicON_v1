# apps/

Deployable applications (PAS Presentation + Application shells).

| App | Purpose | PAS |
|-----|---------|-----|
| `teacher-workspace/` | Teacher-facing Educational OS client | L0–L1 / MOD-01 |

**Rules (PDC):** Apps may depend on `packages/ui`, application façades, and `contracts`. Apps must not import Engine internals, Domain persistence, or Infrastructure adapters directly.
