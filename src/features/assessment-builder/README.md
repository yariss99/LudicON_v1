# Assessment Builder

Complete assessment design environment on PRIMA Core. **Every assessment belongs to a Lesson and a Project.**

## Routes

| Path | Description |
|------|-------------|
| `/assessment-builder/:projectId` | Create or open latest assessment |
| `/assessment-builder/:projectId/:assessmentId` | Full Assessment Builder |
| `/studio/:projectId/assessments` | Project Workspace list → opens builder |

## Supported assessment kinds

Initial, Formative, Summative, Diagnostic, Competency, Practical, Observation Grid, Rubric, Portfolio, Self, Peer.

## Question types

Multiple choice, short/long answer, fill blank, matching, ordering, classification, calculation, creative writing, drawing, observation, project task.

## Capabilities

- Question groups + reusable question bank
- Rubric editor, scoring modes (auto/manual/rubric/weighted/competency/custom)
- AI: complete assessment, bank, variants, difficulty, rubrics, keys, feedback, competency mapping, duplicate detection, improvements
- Validation Engine (alignment, difficulty, balance, coverage, time, quality)
- Analytics (difficulty, Bloom, competencies, success rate, quality score)
- Export: PDF, DOCX, HTML, printable, LMS package
- Version history / compare / restore

## Core integration

`assessmentCoreBridge` builds project+lesson scoped prompts and syncs artifacts into Project Workspace.

## Folder

```
src/features/assessment-builder/
  types.ts / constants.ts
  AssessmentBuilderPage.tsx
  hooks/useAssessmentBuilder.tsx
  services/
  components/
  styles/
```
