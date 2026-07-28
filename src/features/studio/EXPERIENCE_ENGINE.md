# Experience Engine — Architecture

## Emotional identity

PRIMA is not a generator and not an LMS.

The Experience Engine is the path from **intention** to a **Living Workspace**.

```
Teacher Desk
   ↓ natural language (one action)
Intent Panel (teacher controls artifacts)
   ↓ confirm
Pedagogical thinking (not loading)
   ↓
Living Workspace + AI Coach
```

## Why this sequence

| Step | Decision |
|------|----------|
| No immediate generation | Teachers stay in control; AI proposes a plan first |
| Intent Panel | Visible understanding; remove Lesson / Activities / Worksheet / Assessment / Presentation |
| Pedagogical microcopy | “Reviewing curriculum…” never “Loading…” / “Generating…” |
| Living Workspace | Artifacts are connected cards on a canvas — not a file list |
| Drag reorder | Soft ownership of structure without admin UI |
| AI Coach cards | Colleague suggestions — never a chat takeover |

## Components

- `IntentPanel` — confirm / remove proposed artifacts
- `PlanningAnimation` — educational reasoning steps
- `LivingCanvas` — infinite-canvas feel + HTML5 drag reorder
- `AISidebar` — suggestion-only coach
- `useStudioPlanning` — phase machine: `compose → intent → planning → workspace`

## Data

- Intent artifacts → `ParsedStudioIntent.artifacts`
- `studioService.createProjectFromIntent` builds only selected resources (+ Resources, AI Notes)

## Non-goals this sprint

- Real AI inference (mocked intent + timing)
- Full freeform infinite canvas physics
- Chat transcript UI
