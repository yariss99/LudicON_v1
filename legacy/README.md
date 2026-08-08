# Legacy — the first Project and its builders

Preserved verbatim. **Not compiled, not linted, not routed, not imported.** Nothing in
`apps/web` may import from this directory; if something here is worth keeping, port it
deliberately rather than reaching across.

## What this was

The first definition of a **Project**: a container for lesson-planning artefacts. A project
owned one `LessonPlan`, and `Document`s hung off it in six kinds — lesson plan, worksheet,
assessment, story, game, presentation. The authoring chain was:

```
QUICK_ACTIONS (sidebar dropdown)
  → /create/experience         create-flow/      wizard: kind → idea → class
  → /design/$lessonPlanId      design-studio/    block-based lesson planning + approval gate
  → /materials/$lessonPlanId   materials/        pick which materials to generate
  → /builder/$projectId/$kind/$documentId
                               builder/          config-driven editor, six kinds, one route
  → /projects/$projectId       workspace/        five-tab project detail
```

## Why it was retired

The product changed underneath it. A Project is now **an A4 evaluation paper authored in a
visual document editor**, printed and accompanied by an answer key. The old builder produces
structured prose: it has no spatial model, no pages, and no print path — the export worker was
always a stub. There is no useful shared abstraction between "a form that collects lesson
sections" and "a page you lay out", so the new implementation was built beside this rather
than grown out of it.

## What is worth reading before reinventing something

| Here | Why it is worth a look |
|---|---|
| `builder/registry.ts` + `createBuilder.tsx` | A clean config-driven registry that discharges a type parameter so six differently-typed builders sit behind one uniform value with no `any`. The new exercise registry follows the same shape. |
| `builder/useBuilder.ts` | Autosave at 700ms with dirty tracking, versions, publish/archive/duplicate. The new builder's autosave is modelled on this, minus the 50-deep full snapshots. |
| `builder/validation.ts` | Reusable `ValidationIssue` builders — `minimumItems`, `emptyFields`, `duplicates`, `collect`. Directly portable. |
| `builder/editors/ReorderControls.tsx` | `moveItem<T>()` and the argument that keyboard reordering is the *primary* affordance, not a drag fallback. The new command layer keeps this. |
| `builder/copy.ts` | The copy convention: one frozen object, with the UX-001 ban list stated in the docblock so it can be checked by reading one file. |
| `design-studio/lesson-analysis.ts` | Completion scoring over a block list. |
| `materials/prepare-materials.ts` | The fullest existing example of a transactional multi-entity write. |

## Data

The `ludicon.*.v2` collections these surfaces read were discarded at cutover by bumping
`SCHEMA_VERSION` to 3 with no migration registered from 2. Nothing here has data to open.

## Domain

`packages/domain` still carries `LessonPlan`, `PedagogicalBlock`, `ProjectState`,
`intendedKind` and `plannedMaterials` — `apps/api` references them and there was no reason to
churn the backend during the rewrite. They are unused by the new product.
