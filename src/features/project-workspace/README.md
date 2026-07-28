# Project Workspace

The heart of PRIMA Teacher Studio. **Every educational artifact belongs to a Project** — nothing is created in isolation.

## Routes

| Path | Description |
|------|-------------|
| `/studio/:projectId` | Redirects to overview |
| `/studio/:projectId/:tab` | Workspace tab |
| `/projects/:projectId/*` | Alias of the same workspace |

Tabs: `overview`, `lessons`, `worksheets`, `assessments`, `stories`, `games`, `presentations`, `resources`, `ai`, `versions`, `activity`, `settings`.

## Structure

```
Project
 └─ Units
     └─ Lessons / Worksheets / Assessments / Stories / Games /
        Presentations / Resources / Notes
     └─ Versions (per change)
     └─ Activity timeline
```

## Folder layout

```
src/features/project-workspace/
  types.ts
  constants.ts
  ProjectWorkspacePage.tsx
  hooks/useProjectWorkspace.tsx
  services/
    projectWorkspaceRepository.ts   # local persistence + versioning
    projectCoreBridge.ts            # project-scoped Core context / AI
  layout/
  components/
  pages/
  styles/
```

## State & persistence

- Canonical `Project` comes from `ProjectContext` / `projectService`.
- Workspace artifacts, units, versions, activity, and metadata live in `localStorage` via `projectWorkspaceRepository`.
- Every create/update archives a version snapshot (history, restore, compare, rollback).

## AI integration (project-scoped)

`projectCoreBridge` builds a `ProjectCoreContext` (project id, subject, grade, curriculum, competencies, active tab/artifact, intent) before any generate step.

Simulated pipeline awareness:

1. Workflow / Context
2. Prompt Builder (no free-floating prompts)
3. AI Orchestrator
4. Validation Engine
5. Memory / Tools / Runtime

UI entry: **Sugestii PRIMA** tab + “Generează cu AI” on artifact tabs.

Lessons open the flagship **Lesson Builder** at `/lesson-builder/:projectId/:lessonId`.

Assessments open the **Assessment Builder** at `/assessment-builder/:projectId/:assessmentId` (always linked to a lesson).

Stories open the **Story Builder** at `/story-builder/:projectId/:storyId` (always linked to a lesson).

Games open the **Game Builder** at `/game-builder/:projectId/:gameId` (always linked to a lesson, seeded from PRIMA resources).

Presentations open the **Presentation Builder** at `/presentation-builder/:projectId/:presentationId` (seeded from lessons, stories, worksheets, assessments, or the project).

Resources open the **Intelligent Resource Center** (embedded in the tab, or full-screen at `/resource-center?project=:projectId`) — indexed knowledge repository across PRIMA assets.

AI tab embeds the **Teacher AI Assistant** co-pilot (`/assistant`) — context-aware, validated, tool-integrated.

## Design

Visual language matches Teacher Studio (DM Sans + Source Serif 4, calm atelier tokens). Romanian UI copy.
