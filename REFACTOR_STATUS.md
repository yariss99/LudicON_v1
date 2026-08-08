# Refactor status

Branch: `refactor/tanstack-fullstack`. `main` is untouched — everything deleted here is recoverable
from history.

This file is deliberately honest about what is **built and verified** versus what is **not yet done**.
Delete it once the migration completes.

## Verified working

`npm install` resolves all workspaces. These typecheck clean under `strict` +
`noUncheckedIndexedAccess`:

| Workspace | State |
|---|---|
| `packages/config` | Shared tsconfigs. Strict from day one. |
| `packages/domain` | Zod v4 schemas + branded ids. **0 errors** |
| `packages/contracts` | API contracts, error taxonomy, queue messages. **0 errors** |
| `packages/data-access` | `DataProvider` seam, both providers, repositories, query keys. **0 errors** |
| `packages/ui` | Token layer + 33 components. **0 errors** |
| `apps/worker` | BullMQ workers, graceful shutdown, DLQ. **0 errors** |
| Docker | `docker compose config` passes for all three profiles. |

## Not finished

| Item | State |
|---|---|
| `apps/api` | ~29 source files written; **no `package.json` yet**, so it is not a workspace and has never been typechecked or run. |
| `apps/web` routing | **`src/routes/` does not exist.** `router.tsx` imports `./routeTree.gen`, which the Vite plugin only generates once routes exist. The app does not build. |
| `apps/web` features | 423 files, **59 still import `react-router-dom`**, 19 feature directories still on the old data layer. |
| Builder unification | Not started. 5 builders, ~17,140 LOC, ~56% duplicated. |
| Desk / Studio redesign | Not started. Specs extracted (see below). |
| i18n | Not started. 424 hardcoded Romanian strings across 177 files. |
| CI | `.github/workflows/` still has no YAML. |
| Tests | None configured (out of scope by request). |

## The immediate next step

Create `apps/web/src/routes/` with `__root.tsx` and the route files. Until that exists the web app
cannot build, because `routeTree.gen.ts` is generated from that directory.

Route map to rebuild (from the old `App.tsx`, with the redundancy removed):

```
__root.tsx                                  shell + providers
_studio.tsx                                 layout route (sidebar + topbar + PRIMA rail)
  _studio/index.tsx                         Teacher Desk  ("Biroul meu")
  _studio/projects.tsx  library.tsx  activity.tsx  calendar.tsx  notifications.tsx  settings.tsx
create.experience.tsx                       intent capture
design.$lessonPlanId.tsx                    Lesson Design Studio (was /blueprint/review)
materials.$lessonPlanId.tsx                 generation (was /generation)
materials.$lessonPlanId.$assetKind.tsx      asset editing (was /asset-studio)
projects.$projectId.tsx                     project workspace
builder.$projectId.$kind.$documentId.tsx    ONE generic builder replacing all five
library.tsx  knowledge.tsx  publishing.tsx  reflection.tsx  assistant.tsx
```

Collapse in passing: `/blueprint/review` was a 5-line re-export of `lesson-blueprint`, and
`/studio/:projectId/*` and `/projects/:projectId/*` rendered the same component.

## Reference material

Full inspection output and specs live in the session scratchpad:
`/private/tmp/claude-501/-Users-teodorproca-Desktop-LudicON-v1/7ee4e58f-7581-4b2d-bf59-18f12e861762/scratchpad/`

- `DESIGN_SPEC.md` — extracted design constitution: exact palette, type scale, spacing, motion,
  a11y minimums, the Teacher Desk and Lesson Design Studio specs, and the canonical Romanian copy.
- `API_GOTCHAS.md` — **read before writing TanStack code.** Table v9 is a rewrite (`useTable`, not
  `useReactTable`; no `getCoreRowModel()`). Router needs no Zod adapter on v4. Query mutation
  callbacks changed shape.
- `ARCHITECTURE.md` — target architecture, stack rationale, and the nine concrete duplications the
  domain model was built to kill.
- `FINDINGS.md` — measured facts about the pre-refactor codebase.
- `DOCS_TRIAGE.md` — the documentation cluster map.
- `verify.sh` — install → typecheck → lint → build → hardcoded-colour audit → type-safety audit.

## Constraints that are easy to violate

From the design constitution, and enforced nowhere but review:

- **No architecture jargon in visible UI copy** — no "Blueprint", "Engine", "Pipeline",
  "Validation", "AI", "Error", "Invalid", "Required", "No data". Internal names are fine.
- **No purple.** Stated five times across the design book.
- **One primary CTA per screen**, above the fold.
- **Status is never colour-only** — colour + icon + text.
- Body text ≥16px, touch targets ≥44px, focus ring always visible.
- The design score is a support metric, **never** rendered as a grade or traffic-light red.
- There is **no "today's focus" band** in the Teacher Desk spec, despite the old app having one.
