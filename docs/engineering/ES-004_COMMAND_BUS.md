---
Status: Official — Engineering Specification ES-004
Version: 1.0
Owner: LUDI ON Engineering
Depends On: POSS, PAS, PDC, ES-001, ES-002, ES-003
Related Documents: PRIMA_CONSTITUTIONAL_COMMAND_MODEL.md, COMPOSITION_ROOT.md
Last Updated: July 2026
---

# ES-004 — Command Bus

**Version:** 1.0  
**Status:** Official — Permanent CQRS write pipeline  
**Packages:** `@prima/contracts` (command contracts), `@prima/command-bus` (runtime)

> Commands are **intentions**.  
> The Command Bus **coordinates** validation, authorization, and exactly-one handler execution.  
> It contains **no business logic**.

---

# 1. Design

| Field | Content |
|-------|---------|
| **Mission** | Execute state-changing intentions through a single observable pipeline |
| **Responsibilities** | Envelope creation; route to one handler; run validation/authorization stages; timeouts/cancellation; results; lifecycle events |
| **Non-responsibilities** | Pedagogy; Policy rule bodies; Teacher Authority decisions (delegated to `CommandAuthorizer`); Domain invariants (handlers/validators) |
| **Architecture** | Contracts + in-memory bus; future distributed dispatcher implements same `CommandBus` interface |
| **Lifecycle** | create → register handlers/validators/authorizers → dispatch → result |
| **Execution pipeline** | Received → Structural → Authorize → Preconditions → Policy → Business → Blueprint → Execute → Completed |
| **Future evolution** | Outbox, saga compensation hooks, remote handlers — without changing Command model |

---

# 2. Command model

`Command`: commandId, commandType, payload, metadata, priority, correlationId, causationId, timestamp, version, tenantId?, userContext?, executionContext?, aggregateId?, source.

Draft → frozen Command via `createCommand` / `dispatch`.

---

# 3. Dispatch pipeline

```mermaid
flowchart TD
  D[dispatch] --> R[CommandReceived]
  R --> S[Structural Validation]
  S -->|fail| RJ[CommandRejected]
  S --> A[Authorization]
  A -->|fail| AF[CommandAuthorizationFailed]
  A --> V[Preconditions / Policy / Business / Blueprint]
  V -->|fail| RJ
  V --> H{Handler exists?}
  H -->|no| MH[CommandHandlerMissing]
  H --> E[CommandExecuting]
  E -->|ok| X[CommandExecuted / Completed]
  E -->|error| F[CommandFailed]
  E -->|timeout| T[CommandTimedOut]
```

Exactly **one** `CommandHandler` per `commandType`. Handlers never call each other.

---

# 4. Validation model

Pluggable `CommandValidator` with stages:

- structuralValidation (built-in required fields)
- preconditions
- policyValidation
- businessValidation
- blueprintValidation

Bus only sequences stages; validators own rules.

---

# 5. Execution model

- Timeout via `timeoutMs` / AbortSignal  
- Cancellation via signal  
- Handler isolation  
- Domain Events published through `context.publishDomainEvent` → platform Event Bus  
- Transactions / rollback / compensation: **owned by handlers & infrastructure Unit of Work** — bus does not embed DB transactions (technology-independent)  
- Fail-closed: **no authorizer registered ⇒ authorization_failed**

---

# 6. Result model

Statuses: `success` | `validation_failed` | `authorization_failed` | `business_error` | `timeout` | `cancelled` | `handler_missing` | `failed`  

Includes issues, warnings, execution metadata (duration, stages, handler name).

---

# 7. Event catalog (lifecycle)

CommandReceived · CommandValidated · CommandRejected · CommandAuthorized · CommandAuthorizationFailed · CommandExecuting · CommandExecuted · CommandFailed · CommandCompleted · CommandTimedOut · CommandCancelled · CommandHandlerMissing  

Published as `category: system` on the Event Bus when enabled.

Successful handlers publish **Domain** events separately.

---

# 8. Diagrams

```mermaid
sequenceDiagram
  participant App as Application
  participant CB as CommandBus
  participant Auth as Authorizer
  participant Val as Validators
  participant H as Handler
  participant EB as EventBus
  App->>CB: dispatch(Command)
  CB->>EB: CommandReceived
  CB->>Val: structural
  CB->>Auth: authorize
  CB->>Val: business/policy/...
  CB->>H: handle
  H->>EB: DomainEvent
  CB->>EB: CommandCompleted
  CB-->>App: CommandResult
```

```mermaid
flowchart LR
  subgraph Handlers
    H1[ApproveBlueprint]
    H2[StartResourceGeneration]
  end
  CB[CommandBus] --> H1
  CB --> H2
  H1 -.->|forbidden| H2
```

---

# 9. Testing

`npm run test:command-bus` — handler routing, authz fail-closed/deny, validation, business errors, timeout, lifecycle events, domain event publish.

---

# 10. Architecture validation

| Criterion | Result |
|-----------|--------|
| CQRS compliance | Pass — write side only; queries out of scope |
| Loose coupling | Pass — one handler; anonymous via types |
| Single responsibility | Pass — coordination only |
| Replaceability | Pass — `CommandBus` interface |
| Scalability | Pass — future remote dispatcher |
| Future readiness | Pass — stages, outbox-ready domain publish |

---

## Composition root

1. Create EventBus  
2. Create CommandBus `{ eventBus }`  
3. Register `CommandAuthorizer` (Teacher Authority / SVC-10 façade)  
4. Register domain validators  
5. Register one handler per constitutional Command  
6. Application Layer dispatches only — never calls handlers directly  
