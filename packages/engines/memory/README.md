# @prima/engine-memory

**ENG-10** — Memory Engine for PRIMA.

Two complementary surfaces:

1. **PS-002 Teacher Memory Platform** — personalization preferences (`createTeacherMemoryPlatform`)
2. **Structured Memory Engine** — versioned educational / workflow / AI-decision memory (`createMemoryEngine`)

This is **not** chat history, conversation logs, or a prompt cache.

## Structured Memory Engine

### Memory types

| Type | Stores |
|------|--------|
| `session` | Active workflow, current lesson, pending actions |
| `workflow` | State, steps, rollback points, execution history |
| `teacher` | Strategies, structures, activity preferences |
| `project` | Timeline, lessons, exports |
| `lesson` | Competencies, objectives, activities, edits |
| `artifact` | Generated resource references |
| `ai-decision` | Request/result/validation/repair/feedback (structured) |
| `preference` | Key/value preferences |
| `knowledge` | Reusable patterns & templates |

### Lifecycle

`Create → Update (new version) → Archive → Restore → Delete`

### Snapshots

Immutable multi-record snapshots for rollback, comparison, workflow replay, AI debugging.

### Events

`MemoryCreated` · `MemoryUpdated` · `MemoryArchived` · `MemoryRestored` · `MemoryDeleted`

### Usage

```ts
import {
  createMemoryEngine,
  rememberWorkflow,
  rememberAiDecision,
} from '@prima/engine-memory';

const memory = createMemoryEngine();

rememberWorkflow(memory, {
  actorId: 'teacher-1',
  context: { teacherId: 'teacher-1', projectId: 'p-1' },
  payload: {
    workflowId: 'wf-1',
    workflowKind: 'create-lesson',
    currentState: 'Planning',
  },
});

memory.searchByWorkflow('wf-1');
memory.createSnapshot({ label: 'checkpoint', createdBy: 'teacher-1' });
```

### Integration

| System | Use |
|--------|-----|
| Workflow Engine | Persist state transitions as `workflow` memory |
| AI Orchestrator | Store `ai-decision` (not raw prompts) |
| Validation Engine | Attach validation status/score on AI memory |
| Context Engine | Query by teacher/project/competency for context assembly |

## PS-002 platform

See existing `createTeacherMemoryPlatform()` for preference personalization.

## Test

```bash
npm run test:memory
```
