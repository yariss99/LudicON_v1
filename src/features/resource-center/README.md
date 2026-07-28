# Intelligent Resource Center

PRIMA’s central **educational knowledge repository** — not a file manager. Every lesson, worksheet, assessment, story, game, presentation, media file, template, and AI-generated asset is indexed, categorized, versioned, related, and reusable across projects.

## Routes

| Path | Description |
|------|-------------|
| `/resource-center` | Full Intelligent Resource Center |
| `/resource-center/:resourceId` | Opens with asset selected |
| `/resource-center?project=:projectId` | Project-scoped view |
| `/library` | Teacher Studio library → Resource Center |
| `/studio/:projectId/resources` | Workspace tab (embedded Resource Center) |

## Asset types

Lessons · Worksheets · Assessments · Stories · Games · Presentations · Images · Videos · Audio · PDF · Office · Templates · AI generated · Teacher uploads · School shared

## Capabilities

- Automatic indexing from all PRIMA builders + workspace artifacts
- Smart search: keyword, competency, objective, grade, subject, author, tags, difficulty, time, semantic & NL
- Knowledge graph (projects ↔ lessons ↔ assets ↔ competencies ↔ teachers)
- Metadata editor, sharing scopes, version history / branch / merge / restore
- AI: suggest, similar, missing, reuse, merge duplicates, metadata, summarize, keywords, curriculum coverage
- Analytics: most used / effective, recent, unused, coverage, teacher activity, reuse stats
- Integration with PRIMA Core via prompt packages (KnowledgeEngine, Context, Orchestrator, …)

## Folder

```
src/features/resource-center/
  types.ts / constants.ts
  ResourceCenterPage.tsx
  hooks/useResourceCenter.tsx
  services/
    resourceCenterRepository.ts
    resourceIndexer.ts
    resourceSearch.ts
    resourceGraph.ts
    resourceAiBridge.ts
    resourceAnalytics.ts
  components/
  styles/
```
