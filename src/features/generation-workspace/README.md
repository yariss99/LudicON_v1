# Generation Workspace (IT-005)

Creative production studio that transforms an **approved** Instructional Blueprint into synchronized educational assets.

## Rules

- Generation never starts from free prompts
- Generation always starts from the approved Blueprint
- Every asset links to Blueprint Version + Generation Version
- Outdated assets are marked when the Blueprint version changes

## Route

`/generation/:blueprintId`

Unauthenticated / unapproved access redirects to Blueprint Review.

## Layout

| Left | Center | Right |
|------|--------|-------|
| Asset Catalog | Generation Canvas + pipeline + preview | Inspector, Quality, Queue |

## Services

- `GenerationOrchestrator`
- `AssetRegistry`
- `AssetVersionManager`
- `DependencyTracker`
- `QualityEvaluator`
- `QueueManager`

## Tests

```bash
npm run test:generation
```
