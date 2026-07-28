# packages/

Shared libraries implementing PAS layers and constitutional Engines.

| Package | PAS | Notes |
|---------|-----|-------|
| `domain` | L4 | Pure domain |
| `contracts` | Ports / Commands / Events / Kernel / EventBus | **ES-002/003 live** |
| `application` | L1 | Use-case boundary |
| `eos` | L2 / ENG-00 | **ES-002 live Kernel** |
| `event-bus` | Messaging backbone | **ES-003 live** |
| `command-bus` | CQRS write pipeline | **ES-004 live** |
| `engine-sdk` | Engine contract + BasePrimaEngine | **ES-006 live** |
| `engines/*` | L3 / ENG-01…10 | One Engine each |
| `ai-orchestrator` | AI gateway | Sole provider access |
| `runtime-orchestrator` | Core mediator | Pipeline coordination (no business logic) |
| `core-kernel` | Platform bootstrap | PRIMA Core lifecycle entry (ADR-007) |
| `composition` | Composition Root | Production wiring — real adapters, fail-closed |
| `engines/prompt` | P-C-005 | Prompt Builder & Compiler |
| `project` | MOD-02 | Stub |
| `delivery` | MOD-08 | Stub |
| `authority` | MOD-11 | Stub |
| `governance` | MOD-12 | Stub |
| `query` | CQRS read side | Stub |
| `ui` | L0 primitives | No domain rules |
| `testing` | Quality | Fixtures & doubles |
| `config` | Cross-cutting | Schemas only |

**Rejected:** `packages/core`, `packages/assessment`, `packages/recommendation`, vague `packages/shared`.

**Workspaces (npm):** `@prima/contracts`, `@prima/eos` — see root `package.json`.

Dependency direction: see [ES-001](../docs/engineering/ES-001_REPOSITORY_FOUNDATION.md) and [PDC](../docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md).
