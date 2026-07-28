# Educational Game Builder

Curriculum-aligned educational games for PRIMA. **Games always belong to a Lesson and a Project.** Teachers never start from an empty canvas — games are generated from existing PRIMA resources.

## Routes

| Path | Description |
|------|-------------|
| `/game-builder/:projectId` | Create or open latest game |
| `/game-builder/:projectId/:gameId` | Full Game Builder |
| `/studio/:projectId/games` | Project Workspace list → opens builder |

## Sources

Lesson · Worksheet · Assessment · Story · Competencies · Learning Objectives · Mechanics template

## Game types

Quiz, Escape Room, Memory, Matching, Drag & Drop, Treasure Hunt, Mission, Adventure, Board, Card, Puzzle, Timeline, Classification, Math/Language Challenge, Science Investigation, Collaborative Classroom.

## Mechanics library

Points, Badges, Stars, XP, Lives, Levels, Unlockables, Achievements, Random Events, Progress Tracking, Adaptive Difficulty.

## Capabilities

- Visual editor for levels, challenges, questions, rewards, hints
- Source-driven AI generation (never blank)
- Preview + student simulation (score/lives/levels)
- Validation Engine gate before publish
- Export: Interactive HTML, Web package, Classroom mode, Printable, QR launch
- Version history / compare / restore

## Folder

```
src/features/game-builder/
  types.ts / constants.ts
  GameBuilderPage.tsx
  hooks/useGameBuilder.tsx
  services/
  components/
  styles/
```
