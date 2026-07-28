# Mission 05 — Teacher Timeline

## Intent

Replace folder browsing with **time navigation**. Teachers think in weeks; PRIMA shows the school year as a living timeline.

## Hierarchy

```
School Year → Semester → Month → Week → Lesson
```

Lessons carry related resources. Moving a lesson **suggests** moving those resources — never automatic; the teacher confirms.

## Status

| Status | Meaning |
|--------|---------|
| Completed | Taught / closed |
| In Progress | This stretch of work |
| Upcoming | Planned ahead |
| Needs Review | Teacher wants another look |

## Navigation

Sticky week chips — one click jumps and scrolls to that week lane.

## Memory

Entries from the previous school year (notes, activities, results, reflection) attach to week numbers. Surface is optional (“Last year”) — never noisy.

## Persistence

`LocalStorageTimelineRepository` under `prima.timeline.v1`. Seed in `src/data/timelineSeed.ts`. Service: `timelineService`.

## Route

`/timeline`

## Design north star

Apple Calendar clarity × Notion Timeline calm × educational planning spine.
