# Teacher Desk — Architecture

## Role

`features/home` is the heart of PRIMA: the **Teacher Desk**.

It answers four questions in one glance:

1. Where am I? → Spaces (left)
2. What can I create? → Prompt + Quick Actions (center)
3. What was I doing? → Continue Working (center)
4. What next? → Today’s Focus + AI Coach (center / right)

## Layout

```
┌──────────┬────────────────────────────┬────────────┐
│ Spaces   │ Hero + Prompt              │ AI Coach   │
│          │ Quick Actions              │            │
│          │ Continue Working           │            │
│          │ Today’s Focus              │            │
└──────────┴────────────────────────────┴────────────┘
```

Responsive: Spaces become a horizontal rail on small screens; Coach stacks below.

## Key decisions

| Decision | Why |
|----------|-----|
| No AppShell sidebar on Home | Desk is the product surface — not an admin shell |
| Spaces are quick access only | Classes / Projects / Favorites / Archive — no deep menus |
| Prompt launches Studio planning | Intention → living workspace, not a form |
| AI Coach is suggestion cards | Colleague, not chatbot |
| Empty state language | “Let’s create your first learning experience.” — never “No data” |

## Experience Engine path (Sprint 03)

```
Desk prompt
  → Intent Panel (teacher removes artifacts)
  → Pedagogical thinking
  → Living Workspace
```

See `features/studio/EXPERIENCE_ENGINE.md`.

## Dependencies

- `useProjects` — continue / favorites / archive counts
- `useStudioPlanning` — compose → intent → planning → workspace
- `PromptInput` — shared intention input

## Non-goals

- Dashboard widgets
- LMS navigation trees
- Chat transcript UI on the desk
- Instant generation without Intent Panel
