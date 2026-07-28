# PRIMA Workflow Catalog

Product definitions for workflows executed by **`@prima/engine-workflow`**.

The Workflow Engine owns the state machine.  
This catalog owns **what each workflow means**: purpose, phases, context, permissions, validation, recovery, and produced objects.

## Compatibility

| Item | Value |
|------|--------|
| Catalog version | `1.0.0` |
| Engine | `@prima/engine-workflow@0.1.x` |
| Initial state | Always `Idle` |
| Transitions | Shared `WORKFLOW_TRANSITIONS` — never forked per workflow |

## Folder structure

```
packages/engines/workflow/
  src/catalog/
    types.ts           # CatalogWorkflow interfaces
    shared.ts          # Shared happy paths & recovery
    phases.ts          # Pedagogical phase maps
    workflows.ts       # All catalog entries
    registry.ts        # WorkflowRegistry
    schemas.ts         # Validation against engine table
    json.ts            # JSON serialization
    catalog-meta.ts
    index.ts
  definitions/         # JSON exports
    catalog.json
    create-lesson.json
  docs/
    WORKFLOW_CATALOG.md  (this file)
```

## Catalog (executable)

| ID | Display name |
|----|----------------|
| `create-lesson` | Create Lesson |
| `create-worksheet` | Create Worksheet |
| `create-assessment` | Create Assessment |
| `create-quiz` | Create Quiz |
| `create-story` | Create Story |
| `create-presentation` | Create Presentation |
| `generate-image-prompt` | Generate Image Prompt |
| `improve-lesson` | Improve Existing Lesson |
| `adapt-lesson` | Adapt Lesson |
| `translate-resource` | Translate Resource |
| `summarize-resource` | Summarize Resource |
| `review-lesson` | Review Lesson |
| `publish-resource` | Publish Resource |
| `duplicate-project` | Duplicate Project |
| `export-resource` | Export Resource |
| `future-workflow` | Future Workflows (template, v0.0.0) |

## Engine usage

```ts
import {
  createWorkflowEngine,
  createDefaultWorkflowRegistry,
  toEngineDefinition,
} from '@prima/engine-workflow';

const registry = createDefaultWorkflowRegistry();
const definition = registry.toEngineDefinition('create-lesson');

const engine = createWorkflowEngine();
engine.startWorkflow({
  definition,
  teacher: { teacherId: 't-1' },
  actor: { role: 'teacher', id: 't-1' },
});
```

## Create Lesson phases → engine

| Phase | Engine state | Typical event |
|-------|--------------|---------------|
| Start | Initializing | CreateWorkflow |
| Select Subject / Grade / Load Curriculum | LoadingContext | LoadContext |
| Competencies / Objectives / Strategy | Planning | PlanningCompleted |
| Generate Lesson | Generating | Generate |
| Validate | Validating | GenerationCompleted |
| Teacher Review | Reviewing | ValidationPassed |
| Save Draft | Editing | Edit / SaveDraft |
| Ready | Ready | ValidationPassed |
| Publish | Publishing | Publish → Complete |

## Extending

1. Add a `CatalogWorkflow` in `workflows.ts` (new `id` / `kind`).
2. Keep `happyPathEvents` legal on `WORKFLOW_TRANSITIONS`.
3. Register via `WorkflowRegistry` (default catalog auto-includes `ALL_CATALOG_WORKFLOWS`).
4. **Do not** modify the Workflow Engine transition table for product variants.

## JSON

See `definitions/catalog.json` and per-workflow files under `definitions/`.
