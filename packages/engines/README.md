# packages/engines

Constitutional Engines (PAS L3). One folder per Engine. Engines collaborate **only** via Orchestrator or Domain Events — never via private peer APIs.

| Folder | Engine | ENG |
|--------|--------|-----|
| `context` | Context Engine | ENG-01 |
| `knowledge` | Knowledge Engine | ENG-02 |
| `intent` | Intent Engine | ENG-03 |
| `understanding` | Understanding Engine | ENG-04 |
| `strategy` | Instructional Strategy Engine | ENG-05 |
| `blueprint` | Blueprint Engine | ENG-06 |
| `validation` | Validation Engine (artifact gate) | ENG-07 |
| `generation` | Generation Engine | ENG-08 |
| `reflection` | Reflection Engine | ENG-09 |
| `memory` | Memory Engine | ENG-10 |
| `quality` | Quality Engine | — |
| `tools` | Tool & Capability Engine | ENG-TOOLS |
| `workflow` | Workflow Engine | ENG-WF |
| `recommendation` | Recommendation Engine | — |

See [`PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md`](../../docs/product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md).

**Implementation:** All Engines MUST extend `@prima/engine-sdk` `BasePrimaEngine` (ES-006) and remain registerable as ES-002 `Engine` with the EOS Kernel.
