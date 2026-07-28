# infrastructure/

PAS **L6 Infrastructure** — adapters that implement Integration Ports.

| Folder | Purpose |
|--------|---------|
| `persistence/` | Persistence adapters |
| `messaging/` | Event bus / message adapters |
| `identity/` | Authentication / identity providers |
| `workers/` | AI inference & export workers behind Ports |

**Owner:** Platform Engineering  

**Allowed:** Implement `packages/contracts` ports; map to/from domain types at the edge.  
**Forbidden:** Owning business Policies; Approving Blueprints; being imported by `packages/domain`.  

**Status:** Scaffold only (ES-001). No vendor lock-in in this foundation.
