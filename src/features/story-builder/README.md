# Story Builder

Curriculum-aligned educational storytelling for PRIMA. **Stories always belong to a Lesson and a Project.**

## Routes

| Path | Description |
|------|-------------|
| `/story-builder/:projectId` | Create or open latest story |
| `/story-builder/:projectId/:storyId` | Full Story Builder |
| `/studio/:projectId/stories` | Project Workspace list → opens builder |

## Story kinds

Narrative, Interactive, Choose Your Own Adventure, STEM, Historical, Scientific, Mathematics, Language, Social-Emotional, Digital Storybook.

## Scene types

Introduction, Dialogue, Challenge, Puzzle, Decision, Exploration, Mini Game, Reflection, Assessment, Ending.

## Capabilities

- Characters, setting, arc, scenes with drag & drop
- Branching editor (decision → target scenes)
- Interactive preview with clickable choices
- AI: story, characters, dialogues, scenes, challenges, grade/reading adaptation, differentiation, illustration prompts, audio scripts
- Pedagogical: objectives, competencies, cross-curricular, vocabulary, accessibility
- Validation Engine (reading level, alignment, coherence, time)
- Export: HTML, PDF, presentation, print, teacher, student
- Version history / compare / restore

## Core integration

`storyCoreBridge` builds lesson+project scoped prompts and syncs story artifacts into Project Workspace.

## Folder

```
src/features/story-builder/
  types.ts / constants.ts
  StoryBuilderPage.tsx
  hooks/useStoryBuilder.tsx
  services/
  components/
  styles/
```
