# Blueprint Review & Approval (IT-004)

Pedagogical validation workspace before Generation.

Not a form. Not a document viewer. Teachers review a professional Instructional Blueprint, refine it through natural language (Decision Engine only), then approve.

## Route

`/blueprint/review/:blueprintId` · handoff via `/blueprint/review/new`

## Layout

| Left | Center | Right |
|------|--------|-------|
| Blueprint Navigation | Section cards + AI review + versions | Sticky Validation Panel |

## Services

- `BlueprintValidator`
- `ConsistencyAnalyzer` (Decision Engine consistency)
- `VersionManager`
- `ApprovalManager`
- `ReviewOrchestrator`

## Rules

- Never regenerate the Blueprint inside this screen
- All modifications → Decision Engine
- Approve only when Validation is Ready
- Approval freezes version + unlocks Generation Workspace
- Studio Generation stays locked until `generationUnlocked`

## Tests

```bash
npm run test:blueprint-review
```
