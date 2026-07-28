# PRIMA / LUDI ON

**Educational Operating System (EOS)** for teachers — design before generation, Teacher Authority at every binding gate.

This repository is the **production monorepo foundation** for PRIMA (ES-001). It will evolve for years.

## Specification stack

| Code | Document |
|------|----------|
| **DOCUMENT-000** | [The PRIMA Manifesto](docs/product/DOCUMENT-000_PRIMA_MANIFESTO.md) — permanent identity |
| **DB-CH01** | [Creative Direction](docs/design/DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) — permanent visual identity |
| **DB-CH02** | [PRIMA Design Language (PDL)](docs/design/DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) — visual constitution |
| **DB-CH03** | [Pedagogical Design System (PDS)](docs/design/DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) — pedagogical components |
| **DB-CH04** | [Experience Patterns](docs/design/DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) — workflow grammar |
| **DB-CH05** | [Teacher Journeys](docs/design/DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) — intention → outcome |
| **DB-CH06** | [Motion & Interaction](docs/design/DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md) — motion language |
| **DB-CH07** | [Accessibility & Inclusive Design](docs/design/DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md) — a11y constitution |
| **DB-CH08** | [Responsive & Adaptive Experience](docs/design/DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md) — device continuity |
| **DB-CH09** | [PAIM — AI Interaction Model](docs/design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md) — how teachers experience intelligence |
| **DB-CH10** | [Product Blueprint & Screen Library](docs/design/DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) — master screen inventory |
| **POSS** | [Educational Operating System](docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md) + constitutional models |
| **PAS** | [Reference Technical Architecture](docs/product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md) |
| **PDC** | [Development Constitution](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md) |
| **ES-001** | [Repository Foundation](docs/engineering/ES-001_REPOSITORY_FOUNDATION.md) |

Full index: [docs/engineering/SPEC_INDEX.md](docs/engineering/SPEC_INDEX.md)

## Repository layout (foundation)

```
apps/             Deployable apps (teacher-workspace)
packages/         domain · contracts · application · eos · engines · ui · …
infrastructure/   Persistence, messaging, identity, workers (adapters)
docs/             Product (POSS/PAS) + engineering (PDC/ES-*)
config/ tools/ scripts/ tests/ .github/
```

Current Teacher UI still lives in transitional `src/` until migration into `apps/teacher-workspace/` (see [DEVELOPMENT.md](DEVELOPMENT.md)).

## Quick links

- [ARCHITECTURE.md](ARCHITECTURE.md) — how structure maps to PAS  
- [DEVELOPMENT.md](DEVELOPMENT.md) — local development  
- [CONTRIBUTING.md](CONTRIBUTING.md) — PRs, commits, DoR/DoD  
- [ROADMAP.md](ROADMAP.md) — product direction  
- [docs/README.md](docs/README.md) — documentation map  

## Status

ES-001 established repository structure and standards.  
ES-002 delivers the runnable **EOS Kernel** (`@prima/eos`) and contracts (`@prima/contracts`).  
ES-003 delivers the **Event Bus** (`@prima/event-bus`) — immutable event transport backbone.  
ES-004 delivers the **Command Bus** (`@prima/command-bus`) — CQRS write pipeline.  
ES-006 delivers the **Engine SDK** (`@prima/engine-sdk`) — mandatory Engine contract.  
ES-007 defines the **Canonical Context Model** (constitutional; typed in `@prima/contracts`).  
ES-008 defines the **Canonical Knowledge Model** (constitutional; typed in `@prima/contracts`).  

Teacher UI remains transitional in `src/` until migration to `apps/teacher-workspace`.  
Workspaces: `packages/contracts`, `packages/eos`, `packages/event-bus`, `packages/command-bus`, `packages/engine-sdk`.

## License

See [LICENSE](LICENSE).
