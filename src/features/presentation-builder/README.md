# Presentation Builder

Classroom presentations generated from PRIMA Projects, Lessons, Stories, Worksheets, and Assessments. Teachers never start from an empty deck — content is seeded from existing educational artifacts.

## Routes

| Path | Description |
|------|-------------|
| `/presentation-builder/:projectId` | Create or open latest presentation |
| `/presentation-builder/:projectId/:presentationId` | Full Presentation Builder |
| `/studio/:projectId/presentations` | Project Workspace list → opens builder |

## Presentation kinds

Lesson · Interactive Lesson · Teacher · Student · Project · Science Investigation · Historical Timeline · Mathematics · Story · Revision

## Slide types

Title, Objectives, Introduction, Explanation, Diagram, Image, Video, Timeline, Activity, Question, Discussion, Reflection, Assessment, Summary, Homework

## Capabilities

- Slide editor + outline with drag & drop reorder
- Theme Manager (atelier, chalkboard, lab, storybook, high contrast)
- Speaker notes, multimedia suggestions, animation hints
- Preview + Presenter Mode (keyboard navigation)
- AI: generate entire deck / slides, improve, summarize lesson, notes, diagrams, visuals, animations, adapt, translate
- Validation Engine gate (pedagogical flow, readability, timing, curriculum)
- Export: PPTX outline, PDF/print HTML, Interactive HTML, Presenter, Student, Print
- Version history / compare / restore
- Sync to Project Workspace artifact `presentation`

## Folder

```
src/features/presentation-builder/
  types.ts / constants.ts
  PresentationBuilderPage.tsx
  hooks/usePresentationBuilder.tsx
  services/
    presentationBuilderRepository.ts
    presentationValidation.ts
    presentationExport.ts
    presentationCoreBridge.ts
  components/
  styles/
```
