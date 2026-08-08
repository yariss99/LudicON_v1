# PRIMA / LUDI ON

An AI-native pedagogical design studio for Romanian primary-school teachers, delivered as **LUDI ON**.

A teacher states an intention in their own words. PRIMA holds a discovery conversation, proposes an
**Instructional Blueprint**, and waits. Nothing is generated until the teacher approves that blueprint at a
binding gate. Approval then authorises generation of editable resources — worksheets, presentations,
assessments, games — which the teacher edits, publishes or exports, and later reflects on. The reflection
feeds memory that shortens the next discovery.

It is not an LMS, not a lesson generator, and not a chatbot. AI proposes and explains; it never finalises a
pedagogical commitment and never publishes to students on its own.

Product interface language is Romanian. Specifications are written in English.

## Repository layout

npm workspaces + Turborepo. Node >= 22.14.

| Workspace | Package | Role |
|---|---|---|
| `apps/web` | `@ludicon/web` | React 19 SPA — Vite, TanStack Router/Query/Store/Table/Virtual/Form/Hotkeys, Tailwind v4 |
| `apps/api` | `@ludicon/api` | Hono 4 + Clerk + Drizzle/PostgreSQL + Zod + pino |
| `apps/worker` | `@ludicon/worker` | BullMQ workers for generation and export jobs |
| `packages/domain` | `@ludicon/domain` | Zod v4 schemas + inferred types. Single source of truth for domain shapes |
| `packages/contracts` | `@ludicon/contracts` | API request/response contracts, error taxonomy, queue messages |
| `packages/data-access` | `@ludicon/data-access` | `DataProvider` seam + repositories + query keys |
| `packages/ui` | `@ludicon/ui` | Design system: palette → semantic tokens → Tailwind `@theme`, light/dark/system |
| `packages/config` | `@ludicon/config` | Shared tsconfigs (strict, `noUncheckedIndexedAccess`) |

See [ARCHITECTURE.md](ARCHITECTURE.md) for the layering and the data-flow seam, and
[its status section](ARCHITECTURE.md#current-status) for what is actually built.

**This tree is mid-refactor.** Several workspaces are being written right now. Nothing below should be
read as a promise that a command works — check the tree.

## Running it

```bash
npm install
npm run dev:web        # frontend only, localStorage-backed — no services required
```

The web app runs against `LocalStorageProvider` by default (`VITE_DATA_PROVIDER=local`), so no database,
Redis or API is needed to work on the product surface.

| Command | What it does |
|---|---|
| `npm run dev:web` | Vite dev server on `:5173` |
| `npm run dev:api` | Hono API in watch mode |
| `npm run dev:stack` | web + api + worker |
| `npm run dev` | every workspace with a `dev` task |
| `npm run build` | Turborepo build across workspaces |
| `npm run typecheck` | `tsc --noEmit` per workspace |
| `npm run lint` | oxlint per workspace |
| `npm run format` / `format:check` | Prettier |
| `npm run docker:web` / `docker:api` / `docker:full` / `docker:down` | Compose profiles |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle Kit against `@ludicon/api` |

**Known gap.** `apps/web` does not build yet. The TanStack Router entry point (`src/main.tsx`,
`src/router.tsx`) is in place, but the file-based route tree (`src/routes/`, `routeTree.gen.ts`) has not
been generated and 59 files still import `react-router-dom`, which is no longer a declared dependency of
`@ludicon/web`. That migration is active work.

Other commands depend on workspaces still being written — a script whose target workspace has no
`package.json` resolves to nothing and does no work. Verify before relying on one:

```bash
npm query '.workspace' | grep '"name"'   # which workspaces npm actually sees
```

Full setup, environment variables and workspace conventions: [DEVELOPMENT.md](DEVELOPMENT.md).

## Specification stack

Four layers of specification exist. On conflict, the higher layer wins.

### Foundation Suite — supreme

Newest and most authoritative. Registered in [`docs/DOCUMENTATION_REGISTRY.md`](docs/DOCUMENTATION_REGISTRY.md).

| Code | Document |
|---|---|
| PRIMA-DOC-000 | [Founding Charter](docs/product/PRIMA-DOC-000_FOUNDING_CHARTER.md) — supreme governance instrument |
| PRIMA-DOC-000-AP | [Authoring Protocol](docs/product/PRIMA-DOC-000-AP_AUTHORING_PROTOCOL.md) |
| PRIMA-DOC-001 | [Product Vision & Strategic Direction](docs/product/PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md) |
| PRIMA-DOC-002 | [Product Manifest](docs/product/PRIMA-DOC-002_PRODUCT_MANIFEST.md) |
| PRIMA-DOC-003 | [Pedagogical Framework](docs/product/PRIMA-DOC-003_PEDAGOGICAL_FRAMEWORK.md) |
| PRIMA-DOC-004 | [AI Constitution](docs/product/PRIMA-DOC-004_AI_CONSTITUTION.md) |
| PRIMA-DOC-005 | [UX Design Standards](docs/product/PRIMA-DOC-005_UX_DESIGN_STANDARDS.md) |
| PRIMA-DOC-006 | [Engineering Standards](docs/product/PRIMA-DOC-006_ENGINEERING_STANDARDS.md) |
| — | [Foundation Suite index](docs/product/PRIMA_FOUNDATION_SUITE.md) |

### Identity and product

| Code | Document |
|---|---|
| DOCUMENT-000 | [The PRIMA Manifesto](docs/product/DOCUMENT-000_PRIMA_MANIFESTO.md) — permanent identity and voice |
| BIB-001 | [LUDI ON Project Bible](docs/product/LUDI_ON_PROJECT_BIBLE.md) |
| CON-003 / POSS | [Educational Operating System](docs/product/PRIMA_EDUCATIONAL_OPERATING_SYSTEM.md) |
| CS-005 | [Instructional Blueprint Specification](docs/product/INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md) — the durable educational object |
| — | [MVP Roadmap](docs/product/PRIMA_MVP_ROADMAP.md) — authoritative for scope cuts |

### Design

[Design Book](docs/design/) chapters 1–12 are the design constitution. Chapter 2 (PRIMA Design Language)
governs; [DESIGN-001](docs/design/DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) carries the executable tokens.
Chapter 10 is the screen library, chapter 11 the Teacher Desk ("Biroul meu"), chapter 12 the Lesson Design
Studio.

### Engineering

| Code | Document |
|---|---|
| CON-004 / PDC | [Development Constitution](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md) |
| UX-001 | [Teacher Language First](docs/engineering/UX-001_TEACHER_LANGUAGE_FIRST.md) — no architecture jargon in the interface |
| — | [Architecture Decisions](docs/engineering/ARCHITECTURE_DECISIONS.md) — why this stack |
| — | [Spec index](docs/engineering/SPEC_INDEX.md) |

Documentation map: [docs/README.md](docs/README.md).

## Hard product constraints

These are operative, not aspirational. They come from the Design Book and UX-001.

1. One primary action per screen.
2. Never make the teacher navigate — bring the work to them.
3. Everything AI-drafted is editable.
4. Interface copy is educational Romanian. The words *Engine*, *Pipeline* and *Blueprint* must not appear in
   the UI. Internal route and type names may use them.
5. The emotional arc runs Curiosity → Confidence → Flow → Achievement → Reflection → Growth.
6. Success is measured as time saved, teacher confidence and pedagogical quality — not clicks, engagement or
   time-in-app.

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [ROADMAP.md](ROADMAP.md)

## License

See [LICENSE](LICENSE).
