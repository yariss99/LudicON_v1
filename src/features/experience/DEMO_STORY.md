# Mission X — The 3-Minute Demo

## Story arc

| Scene | Experience |
|-------|------------|
| 1 | Immersive welcome — greeting + one input only |
| 2 | Teacher types a natural intention |
| 3 | Intent Engine thinking (~5s) — pedagogical language |
| 4 | Living Workspace — cards grow in |
| 5 | Click Game → activity suggestions → instant update |
| 6 | Rename Worksheet — live sync |
| 7–8 | Leave & return → “Welcome back… Continue?” |

## Architecture choices

1. **`/` is ExperienceHome** — the story *is* the product, not a tutorial overlay.
2. **`beginExperience` skips Intent Panel** — for the 3-minute arc, nothing competes with understanding.
3. **Thinking steps are fixed copy** — confidence through clarity, not “loading”.
4. **`sessionMemory` in localStorage** — PRIMA remembers across visits.
5. **Game panel + inline rename** — prove the workspace is alive without leaving the story.

Desk (three-column) remains available later via `/desk` if needed as a denser daily surface.
