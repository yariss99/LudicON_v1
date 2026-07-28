# Development

## Prerequisites

- Git  
- Node.js LTS (current app tooling)  
- Package manager already used by the root app (`npm` via existing `package.json`)

Workspace tooling for `apps/` + `packages/` is **deferred** to a later Engineering Specification. ES-001 defines folders and ownership only.

## Packages (current workspaces)

| Package | Role |
|---------|------|
| `@prima/contracts` | Kernel / Engine / Event Bus contracts |
| `@prima/eos` | EOS Kernel runtime |
| `@prima/event-bus` | Event Bus runtime |
| `@prima/command-bus` | Command Bus runtime |
| `@prima/engine-sdk` | Engine SDK (`BasePrimaEngine`) |

```bash
npm run build:packages
npm run test:packages
```

Composition root rules: [docs/engineering/COMPOSITION_ROOT.md](docs/engineering/COMPOSITION_ROOT.md).

## Transitional layout

| Path | Role |
|------|------|
| `src/` | Current Teacher UI (Vite). Do not add Domain/Engine logic here. |
| `apps/teacher-workspace/` | Target home for the Teacher app after migration |
| `packages/*` | Library scaffolds — empty of business code until later ES |

## Running the current UI (transitional)

```bash
npm install
npm run dev
```

Follow scripts in root `package.json`.

## Where to put new work

| Kind of work | Location |
|--------------|----------|
| Domain types / policies | `packages/domain` (when implementation ES opens) |
| Commands / Events / Ports | `packages/contracts` |
| Orchestration | `packages/eos` |
| Engine behaviour | `packages/engines/<name>` |
| UI primitives | `packages/ui` |
| Adapters | `infrastructure/*` |
| Cross-package tests | `tests/` |
| Product meaning | `docs/product/` |
| Engineering process | `docs/engineering/` |

## Standards

- [PDC](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md)  
- [CONTRIBUTING.md](CONTRIBUTING.md)  
- [ES-001](docs/engineering/ES-001_REPOSITORY_FOUNDATION.md)

## Quality gates (target)

- Lint / format via repo `config/` + root tooling  
- Typecheck for touched packages  
- Tests appropriate to layer (Domain unit, Engine contract, Integration through EOS)  
- No PAS/PDC violations in PR checklist
