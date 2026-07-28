# Asset Studio (IT-006)

Synchronized educational design studio for generated assets.

Not a document editor — every edit stays linked to the approved Instructional Blueprint.

## Route

`/asset-studio/:workspaceId/:assetTypeId`

Open from Generation Workspace → **Open Asset Studio** (after an asset is completed).

## Layout

| Left | Center | Right |
|------|--------|-------|
| Asset Structure | Editing Canvas + Smart Commands | Inspector (alignment, comments, versions, export) |

## Services

- Alignment Service
- Revision Manager
- Export Service
- Comment Manager
- Asset Synchronizer
- Studio Orchestrator

## Tests

```bash
npm run test:asset-studio
```
