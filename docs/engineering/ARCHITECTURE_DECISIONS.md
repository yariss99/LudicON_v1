---
Status: Official — Architecture Decision Record
Title: Monorepo & Runtime Stack Decisions
Version: 1.0
Owner: LUDI ON Engineering
Depends On: PRIMA-DOC-006_ENGINEERING_STANDARDS.md
Related Documents: ADL-001_ARCHITECTURAL_DECISION_LIFECYCLE.md, ../../ARCHITECTURE.md
Last Updated: August 2026
Authority: Records the technology choices made in the monorepo refactor and the reasoning behind them. Not a specification of behaviour.
---

# Architecture Decisions — Monorepo & Runtime Stack

Seven decisions taken when the repository moved from a single Vite SPA plus an unused 18-workspace
`packages/` tree to an npm-workspaces monorepo. Each entry states the decision, what else was considered,
why the choice was made, and what it costs.

These are consolidated records, deliberately short. The full per-decision ADR ceremony
([`adr/TEMPLATE.md`](./adr/TEMPLATE.md), governed by
[ADL-001](./ADL-001_ARCHITECTURAL_DECISION_LIFECYCLE.md)) applies to changes to the constitutional Core, not
to tooling selection. Historical Core freeze decisions are in [`../architecture/adr/`](../architecture/adr/).

Structure on disk: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md).

---

## Context

The pre-refactor repository measured:

| | |
|---|---|
| `src/` — the running app | 673 files, 75,155 LOC |
| `packages/` — 18 declared workspaces | 271 files, 33,580 LOC |
| Imports of `@prima/*` from the app | **zero** |
| Packages ever built | **none** — `dist/` absent everywhere |
| CI workflows | **none** — `.github/workflows/` held only a README |
| `apps/`, `infrastructure/`, `tools/`, `config/`, `scripts/`, `tests/` | READMEs only, 0 LOC |

Two architectures existed side by side with no shared code: `packages/*` and a 12,290-LOC parallel
reimplementation of the same concepts in `src/engines/*`. The `packages/` tree was competent and had 185
test cases, but nothing imported it and it had never been compiled.

The decisions below start from that: pick one architecture, make the seams real, and add a backend the
frontend can actually reach.

---

## AD-001 — npm workspaces + Turborepo

**Decision.** Use npm workspaces for package linking and Turborepo for task orchestration and caching.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| pnpm workspaces | pnpm is not installed on the development host. Adopting it adds a prerequisite to every clone, CI job and Docker build, in exchange for disk savings and stricter hoisting this repo does not currently need. |
| Nx | A workspace-management framework with generators, plugins and its own project graph. Its value appears at a scale — many teams, many apps, enforced module boundaries — that a three-app repo has not reached. The cost is real: another config surface and another upgrade treadmill. |
| Yarn Berry | Same prerequisite problem as pnpm, plus PnP resolution issues with tooling that expects `node_modules`. |
| No monorepo tooling — plain npm workspaces only | Workable, but every `build` and `typecheck` would re-run for every workspace on every change. Turborepo's task graph and cache are the whole reason to add it. |

**Why.** npm already ran 18 workspaces in this repository, so workspace linking was proven here. Turborepo
is additive: it reads `package.json` scripts and adds a dependency graph plus caching. Removing it later
leaves working npm scripts behind. That is a cheap exit.

**Trade-offs.** npm's flat `node_modules` permits phantom dependencies — importing a package you did not
declare, which resolves by accident. pnpm would prevent that. We accept the risk and rely on review.
`npm install` is also slower and larger on disk than pnpm.

---

## AD-002 — Hono for the API

**Decision.** `apps/api` is a Hono 4 application, with Clerk for authentication and pino for logging.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| NestJS | Brings dependency injection, decorators, modules and a CLI. That structure pays for itself in a large service with many teams. Here it is weight: more concepts to learn than the API has endpoints, and decorator-based DI fights TypeScript inference rather than using it. |
| tRPC | Gives excellent end-to-end types, but couples the client to the server's procedure definitions and produces an RPC surface rather than an HTTP API. A future mobile client, an integration partner or a curl command all become harder. |
| Express | Mature and familiar, but its typing is weak, middleware types do not compose, and it is tied to Node's HTTP server. |
| Fastify | A reasonable choice — fast, schema-first, good plugin model. Rejected on inference: Hono's `hc<AppType>` gives typed client calls derived from the route definitions themselves, which Fastify does not match. |

**Why.** Hono has the best type inference of the small TypeScript frameworks. `hc<AppType>` yields
end-to-end types without tRPC's coupling, because the wire format stays ordinary HTTP. It is small, has no
required runtime dependencies beyond the adapter, and runs unchanged on Node, Bun, Deno and edge runtimes,
which keeps deployment options open.

**Trade-offs.** A smaller ecosystem than Express or NestJS: fewer ready-made middlewares, fewer answered
questions. No opinionated structure, so conventions must be enforced by review rather than by the framework.

---

## AD-003 — Drizzle for the database layer

**Decision.** Drizzle ORM with PostgreSQL, migrations via Drizzle Kit.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| Prisma | Requires a separate schema language and a code generation step that must run before the project typechecks. That generated client is a build-order dependency in every environment, CI job and Docker layer. Prisma's query API also hides the SQL, which makes performance work indirect. |
| TypeORM | Decorator-based, with a long history of migration and typing sharp edges. |
| Kysely | A good query builder with excellent types, but no schema definition or migration story — those would have to be assembled separately. |
| Raw SQL with a thin client | Maximum control, no type safety, and every query becomes a place a schema change can silently break. |

**Why.** Drizzle schemas are TypeScript. There is no separate language, no generation step, and no
build-order dependency. Queries read like SQL, so a slow query can be reasoned about and optimised directly.
Migrations are generated as plain SQL files that can be read and edited before they run.

**Trade-offs.** Younger than Prisma, with a smaller ecosystem and a less mature migration tool — complex
migrations sometimes need hand-editing. Prisma Studio has no exact equivalent (`drizzle-kit studio` is
close but thinner). Relational queries are more verbose than Prisma's nested `include`.

---

## AD-004 — BullMQ + Redis for background work

**Decision.** `apps/worker` runs BullMQ workers backed by Redis.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| RabbitMQ | A full message broker with exchanges, routing topologies and delivery guarantees this workload does not need. It is another stateful service to run, monitor and back up, for jobs that are just "generate this resource" and "export that file". |
| Kafka | Built for event streaming at volume. Wildly oversized here. |
| PostgreSQL-backed queues (pg-boss, Graphile Worker) | Genuinely attractive: one fewer service, and jobs become transactional with the data they operate on. Rejected because the generation jobs are long-running and bursty, and holding connections and long transactions against the primary database for them puts pressure on the same resource that serves user requests. |
| In-process jobs, no queue | Generation calls a language model. A request that takes 30 seconds must not occupy an HTTP connection or die with a deploy. |

**Why.** BullMQ is the right size for the actual workload: a handful of job types, retries, rate limiting,
scheduled jobs, and a usable dashboard. Redis is a single well-understood dependency that also serves as a
cache and rate-limit store.

**Trade-offs.** Redis is not durable by default — job state can be lost on an unclean restart unless
persistence is configured deliberately. It is a second stateful service to operate. Queue state lives
outside PostgreSQL, so a job and the row it writes are not in one transaction; workers must be idempotent.

---

## AD-005 — TanStack Router SPA plus a separate API, not TanStack Start

**Decision.** `apps/web` is a client-rendered SPA using TanStack Router. It talks to `apps/api` over HTTP.
There is no server-rendering framework.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| TanStack Start | Would merge the web and API tiers into one deployable, blurring exactly the `apps/web` / `apps/api` / `apps/worker` boundary this refactor exists to create. |
| Next.js | Same objection, plus a large framework surface and a rendering model that must be reasoned about on every page. |
| Remix / React Router 7 framework mode | Server-first, same boundary objection. Also the codebase is leaving `react-router-dom`, not deepening its use. |
| Staying on `react-router-dom` | No type-safe routes, no loader/action data model, no built-in pending and error boundaries per route. The old app used the declarative `<BrowserRouter>` API with no loaders at all — there was nothing to preserve. |

**Why.** SSR buys almost nothing for an authenticated authoring tool. There is no SEO surface, no anonymous
first paint that matters, and no content to stream — every screen is behind a login and operates on the
teacher's own data. Meanwhile a backend with PostgreSQL and a job queue is required regardless, so a
separate API is not extra infrastructure, it is the infrastructure.

Keeping the tiers apart means the API is reachable by anything, the worker shares its contracts, and the
frontend can be served as static files from a CDN.

TanStack Router itself gives typed routes, typed search params, per-route pending and error components, and
`defaultPreload: "intent"` — prefetch on hover or focus, which suits deliberate navigation in an authoring
tool.

**Trade-offs.** No server rendering: first paint waits for the JavaScript bundle. Two deployables instead of
one, with CORS and token forwarding to configure. Migration cost is real and currently unpaid — 59 files
still import `react-router-dom` and the file-based route tree has not been generated, so the web app does
not build.

---

## AD-006 — Zod v4 as the single validation layer

**Decision.** Domain shapes are Zod v4 schemas in `packages/domain`, with TypeScript types inferred from
them. There is no separate `validation` package and no hand-written interface beside a schema.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| A dedicated `packages/validation` | An empty abstraction. The schemas in `domain` already *are* the validation; a wrapper package would have re-exported them and added an import hop. |
| Hand-written types plus runtime guards | This is what the old code did, and it is why the same concept existed eight times with different fields. Types and checks drift the moment they are written separately. |
| Valibot | Smaller bundle, similar ergonomics. Rejected on ecosystem: `@hono/zod-validator` and `drizzle-zod` exist and are used; the Valibot equivalents are less established. |
| TypeBox / JSON Schema | Better if a published OpenAPI document were the primary artifact. It is not, and TypeBox's inference is less pleasant at the call site. |

**Why.** One declaration produces both the runtime check and the compile-time type, so they cannot disagree.
The same schema validates an API request in `apps/api`, a queue message in `apps/worker`, and a record read
back from storage in `packages/data-access`. Validating on read is what turns silent data corruption into a
named `DataIntegrityError`.

This directly replaces measured duplication: eight identical actor unions, nine validation issue/report
families using two different severity vocabularies, seven copies of a version wrapper, five copies of a
14-field document envelope, six non-aligned asset taxonomies, and twenty-five distinct status unions.

**Trade-offs.** Zod adds runtime cost and bundle weight — validating every read is not free. Zod v4 is a
recent major with breaking changes from v3, so third-party integrations must be checked for v4 support.
Deeply nested schemas can slow the TypeScript compiler.

---

## AD-007 — The DataProvider seam

**Decision.** All persistence goes through one interface, `DataProvider`. `LocalStorageProvider` implements
it today; `HttpProvider` implements it against `apps/api`. Selection is a single environment variable.

**Alternatives considered.**

| Alternative | Rejected because |
|---|---|
| Call `localStorage` directly, migrate later | This was the old design. It produced 52 call sites, 48 key strings across 31 files, five different storage idioms and seventeen unvalidated `JSON.parse(raw) as T` casts. Migrating would have meant editing all of it at once. |
| Repositories with no provider beneath them | Each repository would still encode where data lives. Swapping backends means rewriting every repository rather than adding one class. |
| Go straight to the API, drop local storage | Would make `apps/api` a prerequisite for any frontend work — a database and a Redis instance to run before touching a button. The API also does not exist yet. |
| A sync adapter that mirrors local to remote | Offline-first sync is a hard problem with conflict resolution and clock skew. Not warranted before the API exists. |

**Why.** The seam has to exist *before* the backend, or it never gets built. Writing `HttpProvider` now,
against the same interface, proves the abstraction holds rather than assuming it will.

The interface is **async even though localStorage is synchronous**, and that is the load-bearing detail.
The old code had exactly one async signature across 26 repository files. A fully synchronous persistence
layer cannot accept a server without rewriting every caller, because `const x = repo.get(id)` and
`const x = await repo.get(id)` are different code everywhere they appear. Making a synchronous
implementation pretend to be async is trivial; the reverse is a rewrite.

Both implementations validate through the same domain schema, so neither a stale local record nor an
unexpected server response reaches the UI unchecked.

**Trade-offs.** Every read is `await`ed and every component that touches data is async, including in local
mode where it need not be. The interface is a lowest common denominator — `get`, `list`, `put`, `remove`,
`transact` — so backend-specific capabilities (full-text search, server-side aggregation, partial updates)
either do not fit or require widening it. `transact` is genuinely weaker locally: localStorage cannot roll
back, so the local implementation snapshots and restores, which prevents half-applied writes but is not a
real transaction.

---

## Related decisions

| Decision | Reasoning |
|---|---|
| TypeScript pinned to `~6.0.3`, not 7.x | Verified installed and working. A major compiler bump in the middle of a structural refactor mixes two sources of breakage. |
| Strict mode on from day one, including `noUncheckedIndexedAccess` | The old code already passed `strict` with zero errors across 657 files, and a census found no `any`, no `as any`, no `as unknown as` and no `@ts-ignore` in `src/`. There was no debt to pay down first. `exactOptionalPropertyTypes` had 206 violations and is left off. |
| Packages consumed as TypeScript source (`"main": "./src/index.ts"`) | No build step between editing a package and seeing the change. Costs a slower typecheck in the consuming app; worth it for the edit loop. |
| The old `packages/` island deleted rather than migrated | 33,580 LOC that nothing imported, that had never been built, and that duplicated `src/engines/*`. Two architectures, no shared code. Keeping both was the original mistake. |
| `framer-motion` removed | Installed with zero imports. |

---

## Status

These are decisions, not descriptions of shipped code. As of 2026-08-07, while the refactor is still
landing:

| Decision | Implementation |
|---|---|
| AD-001 npm + Turborepo | In force |
| AD-002 Hono | `apps/api` under construction — modules, middleware and Drizzle schema written; no `package.json` yet |
| AD-003 Drizzle | Schema and migrate script written; no migrations generated |
| AD-004 BullMQ | `apps/worker` under construction — connection, job policy, dead-letter, two handlers |
| AD-005 TanStack Router SPA | Partial — router entry exists, route tree not generated, `apps/web` does not build |
| AD-006 Zod v4 | In force across domain, contracts, data-access and both app env schemas |
| AD-007 DataProvider | In force — both implementations written |

Current state per component: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md#current-status).
