# Architecture

An npm-workspaces + Turborepo monorepo. One React SPA, one HTTP API, one queue worker, and five shared
packages. Dependencies point inward toward `packages/domain`; nothing points back out.

For the reasoning behind each technology choice, see
[`docs/engineering/ARCHITECTURE_DECISIONS.md`](docs/engineering/ARCHITECTURE_DECISIONS.md).

## Layer → folder map

| Layer | Location | Depends on |
|---|---|---|
| Presentation | `apps/web` | ui, data-access, contracts, domain |
| Design system | `packages/ui` | nothing in this repo |
| Data access | `packages/data-access` | domain |
| API contracts | `packages/contracts` | domain |
| Domain | `packages/domain` | nothing |
| HTTP service | `apps/api` | contracts, domain |
| Background work | `apps/worker` | contracts, domain |
| Build config | `packages/config` | nothing |

`packages/domain` has no dependency other than Zod. That is the invariant that keeps the graph acyclic:
every other package may import it, it may import none of them.

## Data flow

```
UI component
  → TanStack Query (cache, invalidation, optimistic updates)
    → repository            packages/data-access
      → DataProvider        the seam
        → LocalStorageProvider   browser localStorage      (today)
        → HttpProvider           apps/api → Postgres, BullMQ/Redis   (later)
```

Everything above `DataProvider` is written once and never learns where data lives.

## Why the DataProvider seam exists

The pre-refactor tree had no seam. Persistence facts were spread across the whole app:

| Measured before | |
|---|---|
| Repository/service files | 26 |
| `localStorage` call sites | 52 |
| Storage key strings | 48, across 31 files |
| Distinct storage idioms | 5 |
| `load<T>`/`save<T>` copy-pasted | 13 files |
| Blind `JSON.parse(raw) as T` | 17 |
| Writes wrapped in `try/catch` | 7 of 23 |
| Async persistence signatures | **1** |

That last row is the important one. A codebase whose persistence layer is entirely synchronous cannot accept
a server without rewriting every caller, because `const x = repo.get(id)` and `const x = await repo.get(id)`
are different code at every call site. Adding a backend would have meant touching all 52 sites and hoping.

So `DataProvider` is deliberately **async even though localStorage is synchronous**. Making a synchronous
implementation pretend to be async is trivial. Retrofitting async onto a synchronous API surface is not.

The interface is defined in [`packages/data-access/src/provider.ts`](packages/data-access/src/provider.ts):

| Method | Contract |
|---|---|
| `get` | Resolves `null` for a missing record. Never throws for "absent". |
| `list` | Whole collection, optionally filtered/sorted/paged via `ListQuery`. |
| `put` | Insert or replace. Returns the persisted record. |
| `remove` | Idempotent. |
| `transact` | Several writes as one unit. |

Two failure modes are named rather than swallowed: `DataIntegrityError` when persisted data fails its schema
on read, and `DataWriteError` when the backend refuses a write (quota, network, permission).

Both implementations validate through the **same Zod schema** from `packages/domain`. Locally that catches
data written by an older build; over HTTP it stops the server quietly handing the UI a shape it does not
expect.

### Swapping localStorage for the API

```
VITE_DATA_PROVIDER=local   # LocalStorageProvider  (default)
VITE_DATA_PROVIDER=http    # HttpProvider against VITE_API_URL
```

Nothing else changes. No repository, no query, no component is edited. `HttpProvider` takes a
`getToken()` callback — async, because Clerk mints tokens on demand — and sets `Authorization: Bearer`.

`transact` is the one place the two implementations genuinely differ. localStorage cannot roll back, so the
local implementation snapshots and restores on failure; the HTTP implementation maps it to a server
transaction. Local behaviour is weaker, but it still prevents half-applied multi-record writes, which the
old read-modify-write code could not do at all.

## Domain package

Zod v4 schemas with types inferred from them, so runtime validation and compile-time types cannot drift.
This package exists because the old tree had the same concepts declared many times over:

| Duplication found | Replaced by |
|---|---|
| 8 byte-identical `*Actor` unions | one `Actor` |
| 9 `Validation{Issue,Report}` families, 2 severity vocabularies | one `ValidationIssue` / `ValidationReport` |
| 7 copies of the `*Version` snapshot wrapper | generic `Version<T>` |
| 5 copies of a 14-field document envelope | generic `DocumentEnvelope` |
| 6 non-aligned asset taxonomies (`game` vs `educational_game`) | one `AssetKind` |
| 25 distinct `*Status` unions | shared status primitives |

## Repositories and query keys

`createRepository()` binds a collection name and a domain schema to a `DataProvider`. Collection names are
declared exactly once, in `COLLECTIONS`.

Query keys live in one hierarchical factory (`queryKeys`) rather than as hand-written arrays in features.
Invalidating `queryKeys.projects.all()` necessarily covers every list and detail key beneath it because they
share its prefix. Keys are `as const` so TanStack Query's tag inference keeps `setQueryData` typed at the
call site.

## Design system

Three layers, one direction:

```
palette.css   raw colour values
   ↓
tokens.css    semantic roles (--background, --card, --muted-foreground, …)
   ↓
theme.css     @theme inline → Tailwind utilities (bg-background, text-muted-foreground, …)
```

Components reference semantic roles only — never the raw palette, never a hex. `@theme inline` matters: it
emits `var(--background)` instead of a resolved value, which is what lets the theme switch at runtime rather
than being baked at build time.

`ThemeProvider` handles light / dark / system, persists the preference under `ludicon.theme`, and falls back
to `system` when storage is unavailable.

This replaces 279 CSS custom properties across 23 prefixes, including eleven feature-private sets
(`--ts-*`, `--lb-*`, `--ab-*`, `--sb-*`, `--gb-*`, `--pb-*`, `--pw-*`, `--rc-*`, `--ta-*`, `--atelier-*`)
that each re-declared the same eight values.

## What was removed

| Removed | Size |
|---|---|
| The unused `packages/` island — 18 workspaces, zero imports from the app | 33,580 LOC |
| 12 dead feature directories | ~9,700 LOC |
| 4 orphaned engines (`pedagogy`, `dna`, `confidence`, `classroom`) — routes redirected to `/` | 3,658 LOC |
| All of `src/pages/` (19 files) | — |
| `framer-motion` — installed, zero imports | — |

`apps/web/src` is now 423 TypeScript files / ~57,000 LOC, down from 673 files / 75,155 LOC.

The old `packages/` tree was competent code that nothing imported: the app imported zero `@prima/*` packages,
no Vite aliases or tsconfig paths pointed at it, nothing had ever been built (`dist/` absent everywhere), and
`src/engines/*` was a parallel 12,290-LOC reimplementation of the same concepts. Two architectures, no shared
code. Only one could survive.

## Type safety

`tsconfig.base.json` enables `strict`, `noImplicitOverride`, `noUncheckedIndexedAccess`,
`noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters` and `forceConsistentCasingInFileNames`
from day one.

This was affordable because the old code already passed `strict` with zero errors across 657 files, and a
census found no `: any`, no `as any`, no `as unknown as` and no `@ts-ignore` anywhere in `src/`. The problems
in the old tree were architectural, not type-level, so there was no remediation debt to pay down first.

`noUncheckedIndexedAccess` had 30 pre-existing violations and `exactOptionalPropertyTypes` had 206. The
former is enabled; the latter is not.

## Current status

Parts of this architecture are still being written. The table below is a snapshot taken on **2026-08-07**
and the tree was changing while it was written — verify before depending on any row.

| Component | State |
|---|---|
| `packages/domain` | Implemented — primitives + document, project, lesson-plan, resource entities |
| `packages/data-access` | Implemented — provider, both implementations, repository factory, query keys |
| `packages/config` | Implemented — base, lib, react, node tsconfigs |
| `packages/contracts` | Implemented — `errors.ts`, `http.ts`, `queue.ts` |
| `packages/ui` | Theme layer plus ~33 components, including a `prima/` set (status badge, empty state, theme toggle, design score meter) |
| `apps/web` | Code moved from `src/`. TanStack Router entry written; `src/routes/` and `routeTree.gen.ts` **not generated**; 59 files still import `react-router-dom`, which is no longer a declared dependency. **Does not build** |
| `apps/api` | Under construction — Drizzle schema, env, middleware, and project / lesson-plan / teacher modules exist. **No `package.json` yet**, so it is not a workspace and `dev:api` and `db:*` will not resolve |
| `apps/worker` | Under construction — `package.json`, BullMQ connection, job policy, dead-letter handling, generate-materials and export-document handlers |
| Docker | `docker-compose.yml` at the root with `web` / `api` / `worker` / `postgres` / `redis` services and `web`, `api`, `full` profiles; a Dockerfile per app; root `.env.example` documents the variables. `docker:api` and `docker:full` still depend on `apps/api` becoming a workspace |
| CI | `.github/workflows/` contains a README and no workflow YAML |
| Tests | No runner configured in any workspace |

To re-check:

```bash
npm query '.workspace' | grep '"name"'   # workspaces npm actually resolves
ls docker-compose.yml apps/api/package.json apps/web/src/routes 2>&1
grep -rl react-router-dom apps/web/src | wc -l
```

## Dependency rules

1. `packages/domain` imports nothing from this repo.
2. `apps/web` never imports from `apps/api` or `apps/worker`. It talks to the API over HTTP, through
   `HttpProvider`, using types from `packages/contracts`.
3. Features do not import each other's internals. Shared code moves to a package.
4. Components never read a raw palette variable or a hex. They use semantic tokens.
5. Persistence goes through a repository. No `localStorage` calls in feature code.
