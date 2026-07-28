# Lesson Builder

Flagship educational application of PRIMA. Teachers plan, generate, edit, validate, version, and publish lessons — **always inside a Project Workspace**.

## Routes

| Path | Description |
|------|-------------|
| `/lesson-builder/:projectId` | Create or open latest lesson in project |
| `/lesson-builder/:projectId/:lessonId` | Full Lesson Builder editor |
| `/studio/:projectId/lessons` | Project Workspace list → opens builder |

## Capabilities

- Create / Edit / Duplicate / Import / Archive / Publish
- Generate with AI (complete lesson or section)
- Improve, differentiate, adapt difficulty
- Suggest resources, assessment, homework, reflection
- Drag & drop lesson blocks + reusable templates
- Inline AI assistance (project-scoped prompts)
- Comments, autosave, version history / compare / restore
- Validation Engine report (score, warnings, repair suggestions)
- Publish blocked until validation passes

## Lesson structure

General → Objectives → Competencies → Prerequisites → Resources → Phases → Activities/Blocks → Differentiation → Assessment → Homework → Reflection → Teacher Notes

Phases: Introduction, Motivation, Knowledge Construction, Practice, Assessment, Reflection, Closure.

## Core integration

`lessonCoreBridge` builds a Prompt Builder package from Project + Lesson context, then simulates AI actions. Every lesson syncs to Project Workspace artifacts via `syncLessonToWorkspace`.

Engines referenced: Workflow, Context, Prompt Builder, AI Orchestrator, Validation, Memory, Tools, Runtime.

## Folder layout

```
src/features/lesson-builder/
  types.ts / constants.ts
  LessonBuilderPage.tsx
  hooks/useLessonBuilder.tsx
  services/
    lessonBuilderRepository.ts
    lessonValidation.ts
    lessonCoreBridge.ts
  components/
  styles/
```

## Persistence

`localStorage` keys:

- `prima.lesson-builder.lessons.v1`
- `prima.lesson-builder.versions.v1`

Every save bumps version and stores a snapshot.
