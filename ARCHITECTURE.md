# Architecture

PRIMA’s technical structure is defined by the **PRIMA Architecture Specification (PAS)**. This file is an entry point — it does not redefine architecture.

## Normative sources

1. **PAS — Reference Technical Architecture**  
   [`docs/product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md`](docs/product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md)

2. **PAS — Engine Architecture**  
   [`docs/product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md`](docs/product/PRIMA_CONSTITUTIONAL_ENGINE_ARCHITECTURE.md)

3. **POSS — Educational Operating System**  
   [`docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md`](docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md)

4. **Repository mapping (ES-001)**  
   [`docs/engineering/ES-001_REPOSITORY_FOUNDATION.md`](docs/engineering/ES-001_REPOSITORY_FOUNDATION.md)

5. **Development Constitution (PDC)**  
   [`docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md`](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md)

## Layer → folder map

| PAS Layer | Repository location |
|-----------|---------------------|
| L0 Presentation | `apps/teacher-workspace`, `packages/ui` |
| L1 Application | `packages/application` |
| L2 EOS Orchestration | `packages/eos` |
| L3 Engines | `packages/engines/*` |
| L4 Domain | `packages/domain` |
| L5 Integration Ports | Declared in `packages/contracts` |
| L6 Infrastructure | `infrastructure/*` |

## Dependency rule

Dependencies point **inward** to Domain. Engines do not call each other privately. UI never calls Engines or Infrastructure directly.

## Change control

New Engines, Layers, or Modules require a POSS/PAS amendment **before** code. See PDC and the Architecture Change issue template.
