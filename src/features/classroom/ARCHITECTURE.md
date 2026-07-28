# Mission 07 — Classroom Intelligence

## Intent

Help teachers learn from **their own teaching**. Reveal useful patterns. Never profile students. Never make decisions.

## Pillars

| Pillar | Behavior |
|--------|----------|
| Experience Memory | Every learning experience keeps version history; teacher can reopen any version |
| Class Insights | Trends from teacher reflections (collaborative work, outdoor learning, short assessments…) |
| Suggestions | Drawn only from teacher history — never student profiling |
| Experience Evolution | Visual timeline of how one experience improved |
| Search | Competency, topic, method, resource, school year, feedback |

## Hard rules

- No individual student identifiers in types, seed, UI, or search
- Insights aggregate class-level notes the teacher wrote
- Restoring a version always requires teacher confirmation

## Code

- Types: `src/types/classroom.ts`
- Seed: `src/data/classroomSeed.ts`
- Engines: `src/engines/classroom/`
- Service: `src/services/classroomService.ts`
- UI: `src/features/classroom/`

## Route

`/classroom`

Living Workspace snapshots via `classroomService.snapshotExperience` when the teacher changes resources.
