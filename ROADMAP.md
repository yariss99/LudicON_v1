# Roadmap

Product sequencing and version intent for LUDI ON / PRIMA. This file is a pointer, not the roadmap itself.

## Authoritative product roadmap

**Shipping cuts and scope:** [`docs/product/PRIMA_MVP_ROADMAP.md`](docs/product/PRIMA_MVP_ROADMAP.md)

Strategic direction sits above it in
[`docs/product/PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md`](docs/product/PRIMA-DOC-001_PRODUCT_VISION_STRATEGIC_DIRECTION.md).
On conflict about *what ships when*, the MVP Roadmap prevails.

## North star

A teacher describes educational intent. PRIMA partners on the design. The teacher approves the Instructional
Blueprint. That approval authorises generation of editable resources. The teacher edits, exports or
publishes, reflects — and the reflection makes the next design shorter.

## Engineering foundation

| Item | Status |
|---|---|
| ES-001 repository structure and standards | Done |
| Migrate the app out of `src/` into `apps/web` | **Done** |
| npm workspaces + Turborepo tooling | Done |
| Shared tsconfigs, strict from day one (`packages/config`) | Done |
| Domain schemas as the single source of truth (`packages/domain`) | Done |
| `DataProvider` seam + repositories (`packages/data-access`) | Done |
| Design tokens and theming (`packages/ui` styles) | Done |
| Delete the unused `packages/` island and dead features | Done |
| API contracts (`packages/contracts`) — errors, HTTP, queue messages | Done |
| Extract shared components into `packages/ui` | In progress |
| Migrate routing from `react-router-dom` to TanStack Router | In progress — route tree not generated; `apps/web` does not build |
| `apps/api` — Hono + Clerk + Drizzle/PostgreSQL | In progress — modules written, no `package.json` yet |
| `apps/worker` — BullMQ generation and export jobs | In progress |
| Docker Compose for local Postgres + Redis | Done — `docker-compose.yml` with `web` / `api` / `full` profiles, a Dockerfile per app, root `.env.example` |
| CI workflows | Not started — `.github/workflows/` has no YAML |
| Test runner and coverage | Not started — none configured |

Status as of 2026-08-07, while the refactor is still landing. Current state per component:
[`ARCHITECTURE.md`](ARCHITECTURE.md#current-status).

Technology choices and their rationale:
[`docs/engineering/ARCHITECTURE_DECISIONS.md`](docs/engineering/ARCHITECTURE_DECISIONS.md).

## Open product questions

Unresolved decisions that shape the above are tracked in
[`docs/research/OPEN_QUESTIONS.md`](docs/research/OPEN_QUESTIONS.md) — LLM provider strategy, EU data
residency, licensing model, and the first activity type beyond *Lecție*.
