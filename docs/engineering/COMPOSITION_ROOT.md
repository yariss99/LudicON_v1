---
Status: Official — Composition Root Standard (AGR-001 B-05)
Version: 1.0
Owner: LUDI ON Engineering
Depends On: PAS, ES-002
Last Updated: July 2026
---

# Composition Root Standard

## Rule

The **Composition Root** is the only place that constructs Infrastructure adapters and wires them to Port implementations for Application / EOS / Engines.

| May wire | Must not wire |
|----------|---------------|
| Process entrypoints (`apps/*` server/bootstrap, future workers) | `packages/domain` |
| Explicit `bootstrap/` modules at app edge | `packages/engines/*` importing Infrastructure |
| Test harness composition roots | UI components |

## EOS Kernel + Event Bus + Command Bus wiring

1. Build `ConfigurationProvider`.  
2. Construct platform `EventBus` (`createEventBus` from `@prima/event-bus`).  
3. Construct `EosKernel` with `{ eventBus }` so Kernel events bridge onto the platform bus.  
4. Construct `CommandBus` with `{ eventBus }` (`createCommandBus` from `@prima/command-bus`).  
5. Register **CommandAuthorizer** (Teacher Authority façade — fail-closed if omitted).  
6. Register CommandValidators and exactly one CommandHandler per constitutional Command.  
7. Construct Engines via `@prima/engine-sdk` (`BasePrimaEngine` subclasses) with capability manifests — e.g. `createKnowledgeEngine({ eventBus })` from `@prima/engine-knowledge` (ES-009 / ENG-02).  
8. Register Engine instances (manual) or descriptor providers with the Kernel.  
9. Optionally register Infrastructure-backed Port implementations on `ServiceLocator` **before** `kernel.start()`.  
10. Application Layer **only** dispatches Commands — never invokes handlers or Engines directly.  
11. Subscribe domain/audit/telemetry consumers to the **platform** EventBus.  
12. `await kernel.start()` / `await kernel.stop()`; `await eventBus.stop()` on process shutdown.

Engines receive `KernelContext` (locator + config + clock + event bus). They must not import `infrastructure/*`.  
Handlers publish Domain Events via `CommandContext.publishDomainEvent` only.

## Forbidden

- Engines constructing persistence/AI clients directly.  
- Domain importing composition root.  
- Multiple competing roots without documented ownership.
