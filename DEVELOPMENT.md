# Development

## Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| Node.js | >= 22.14.0 | everything. `engine-strict=true` is set, so npm will refuse to install below this |
| npm | ships with Node 22 | workspaces. Do not use pnpm or yarn — the lockfile is npm's |
| Git | any recent | — |
| Docker | any recent | PostgreSQL and Redis via `docker-compose.yml`. Not needed for frontend work |

## Install

```bash
npm install
```

One install at the root covers every workspace. There is no per-package install step.

## Running

```bash
npm run dev:web        # frontend only — localStorage-backed, no services needed
```

Frontend-only is the normal loop. The web app defaults to `VITE_DATA_PROVIDER=local`, so there is no
database, no Redis, no API, and no auth to configure.

| Command | Scope |
|---|---|
| `npm run dev` | every workspace declaring a `dev` task |
| `npm run dev:web` | `@ludicon/web` |
| `npm run dev:api` | `@ludicon/api` — see *Not yet runnable* below |
| `npm run dev:stack` | web + api + worker — see *Not yet runnable* below |
| `npm run build` | Turborepo `build`, respecting `dependsOn: ["^build"]` |
| `npm run typecheck` | `tsc --noEmit` per workspace |
| `npm run lint` | `oxlint src` per workspace |
| `npm run format` / `format:check` | Prettier over `**/*.{ts,tsx,json,md,css}` |
| `npm run clean` | per-workspace clean, then removes `node_modules` and `.turbo` |
| `npm run docker:web` / `docker:api` / `docker:full` / `docker:down` | Compose profiles: `web` alone, `web + api + postgres`, or everything including `worker` and `redis` |

Turborepo caches `build` (outputs `dist/**`, `build/**`) and treats `tsconfig.base.json` and `.env` as global
dependencies. Markdown is excluded from build inputs, so editing docs never invalidates a build.

### Not yet runnable

Snapshot as of **2026-08-07**. The tree is mid-refactor; re-check before concluding a script is broken.

| Script | Blocked by |
|---|---|
| `dev:api`, `dev:stack`, `db:generate`, `db:migrate`, `db:studio` | `apps/api` has source but no `package.json`, so npm does not see it as a workspace and `--filter=@ludicon/api` resolves to nothing |
| `docker:api`, `docker:full` | The compose file, the per-app Dockerfiles and the root `.env.example` all exist, but the `api` service builds a workspace that npm cannot yet resolve |

`apps/web` does not build yet either: `src/main.tsx` and `src/router.tsx` are TanStack Router, but the
file-based route tree (`src/routes/`, `routeTree.gen.ts`) has not been generated and 59 files still import
`react-router-dom`, which is no longer a declared dependency of `@ludicon/web`.

```bash
npm query '.workspace' | grep '"name"'   # which workspaces npm actually resolves
ls docker-compose.yml apps/api/package.json apps/web/src/routes 2>&1
```

## Environment

Two example files exist and cover different scopes:

| File | Scope |
|---|---|
| [`.env.example`](.env.example) | Root — Docker Compose interpolation and container injection: ports, Postgres, Redis, log level, Clerk keys |
| [`apps/worker/.env.example`](apps/worker/.env.example) | Worker process |

Copy the root one to `.env` when you need Docker. For frontend-only work you need neither.

Client variables are validated at module load in
[`apps/web/src/lib/env.ts`](apps/web/src/lib/env.ts); the app throws a readable error rather than surfacing
`undefined` three layers deep.

Create `apps/web/.env.local`:

| Variable | Default | Meaning |
|---|---|---|
| `VITE_DATA_PROVIDER` | `local` | `local` = localStorage, `http` = API via `HttpProvider` |
| `VITE_API_URL` | `http://localhost:3000/v1` | Only used when the provider is `http` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `""` | Auth is enforced only once this is non-empty |
| `VITE_ENABLE_DEVTOOLS` | `true` | TanStack Router/Query devtools |

Only `VITE_`-prefixed variables reach the browser bundle. Never put a secret in one.

Server-side variables (`DATABASE_URL`, `REDIS_URL`, Clerk secret key, `LOG_LEVEL`) are documented in the
root `.env.example` and validated in `apps/api/src/env.ts` and `apps/worker/src/env.ts`.

**Warning:** `.gitignore` does not currently list `.env*` or `.turbo`. Until it does, a local `.env` will
show up in `git status` and can be committed by accident.

## How the workspaces relate

```
apps/web ─────┬──> @ludicon/ui           design system
              ├──> @ludicon/data-access ──> @ludicon/domain
              ├──> @ludicon/contracts   ──> @ludicon/domain
              └──> @ludicon/domain

apps/api ─────┬──> @ludicon/contracts   ──> @ludicon/domain
              └──> @ludicon/domain

apps/worker ──┴──> @ludicon/contracts   ──> @ludicon/domain
```

Packages resolve through workspace links with `"*"` version ranges and are consumed as **TypeScript source**
(`"main": "./src/index.ts"`), not built artifacts. There is no build step between editing a package and
seeing the change in the app.

`packages/config` supplies the tsconfigs:

| Config | Used by | Adds |
|---|---|---|
| `tsconfig.base.json` (repo root) | everything, via the three below | strict, `noUncheckedIndexedAccess`, `noUnusedLocals`/`Parameters`, ES2023, bundler resolution |
| `packages/config/tsconfig.react.json` | `apps/web`, `packages/ui`, `packages/data-access` | DOM libs, `react-jsx`, `noEmit` |
| `packages/config/tsconfig.lib.json` | `packages/domain`, `packages/contracts` | composite, declarations + maps, `outDir: dist` |
| `packages/config/tsconfig.node.json` | `apps/api`, `apps/worker` | Node types, declarations, `outDir: dist` |

## Where to add new work

| Kind of change | Location |
|---|---|
| A new domain concept (entity, value object, enum) | `packages/domain/src/entities` or `primitives`, as a Zod schema |
| A new persisted collection | `COLLECTIONS` + a repository in `packages/data-access/src/repositories.ts` |
| A new query key | `packages/data-access/src/query-keys.ts` — never a hand-written array in a feature |
| API request/response shape, error code, queue message | `packages/contracts` |
| A reusable visual primitive | `packages/ui` |
| A colour, radius, shadow, spacing step | `packages/ui/src/styles/tokens.css` — then map it in `theme.css` |
| A teacher-facing screen or flow | `apps/web/src/features/<feature>` |
| An HTTP route | `apps/api` |
| A background job | `apps/worker` |
| A tsconfig or lint rule | `packages/config` or the root config |

### Adding a feature to the web app

1. Model the data in `packages/domain` first, as a Zod schema. Types are inferred, never hand-written
   alongside.
2. If it persists, add the collection and repository in `packages/data-access`, plus its query keys.
3. Create `apps/web/src/features/<feature>/` with its own components, hooks and local types. Features do not
   import each other's internals — shared code moves to a package.
4. Read and write through TanStack Query over the repository. No `localStorage` in feature code.
5. Style with semantic Tailwind utilities (`bg-card`, `text-muted-foreground`). No raw palette variables, no
   hex values.
6. Write Romanian interface copy. UX-001 forbids the words *Engine*, *Pipeline* and *Blueprint* in anything
   the teacher sees.

## Standards

- [PRIMA-DOC-006 Engineering Standards](docs/product/PRIMA-DOC-006_ENGINEERING_STANDARDS.md)
- [Development Constitution (PDC)](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md)
- [Architecture Decisions](docs/engineering/ARCHITECTURE_DECISIONS.md)
- [UX-001 Teacher Language First](docs/engineering/UX-001_TEACHER_LANGUAGE_FIRST.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## Quality gates

There is **no CI**. `.github/workflows/` contains a README and no workflow YAML. Until that changes, run the
checks locally before pushing:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

All four pass on the workspaces that exist today, except `build`, which is blocked on `apps/web` — see
[REFACTOR_STATUS.md](REFACTOR_STATUS.md).

**Formatting is code-only, deliberately.** `format` and `format:check` cover `**/*.{ts,tsx,json,css}`.
Markdown is excluded, and `docs/` is additionally listed in `.prettierignore`. The specification documents
are hand-formatted and table-heavy; Prettier re-aligns every table, which would produce a large,
unreviewable diff across roughly 107 files for no functional gain. If you want Prettier on markdown later,
add a `.prettierrc` with `proseWrap: "preserve"` first and inspect the diff before committing it.

One caveat remains:

- **No test runner is configured in any workspace.** The pre-refactor `packages/` island carried 185 test
  cases; that tree was deleted and its tests went with it. Choosing and wiring up a runner is open work.
