---
Status: Draft
Version: 1.0
Owner: LUDI ON Product Team
Depends On: DESIGN_SYSTEM.md
Related Documents: TYPOGRAPHY.md, COLOR_SYSTEM.md, ../product/PRIMA_CONVERSATION_BLUEPRINT.md
Last Updated: July 2026
---

# LUDI ON — LUDI Blocks

Reusable layout and UI patterns. Named **LUDI Blocks** for consistency across Dashboard and PRIMA.

---

## Dashboard Blocks

### `Block.Hero`

Centered welcome hierarchy: title → mission → action → helper → builders.

Max readable widths: title 760px, helper 600px.

### `Block.BuilderCard`

220px min-height white card · 60px icon circle · 22px title · 16px description · full-card click target.

### `Block.SectionRow`

Secondary sections (Continuă proiectul, Resurse): compact horizontal rows, subtle headers.

### `Block.FloatingHeader`

Glass-style nav: logo, search pill (56px), notifications, profile.

---

## PRIMA Blocks

### `Block.PRIMAShell`

Full-viewport centered layout. Max width 760px. No dashboard chrome.

### `Block.PRIMACard`

Single premium card. Soft shadow `0 8px 40px rgba(15,23,42,0.08)`. Rounded 24px.

### `Block.PRIMAWelcome`

Animated stagger: header → message → checklist → CTA last.

### `Block.PRIMAChecklistItem`

Rounded row, blue check circle, hover tint.

### `Block.PRIMACTA`

Primary blue button + secondary text link below.

---

## Future Blocks (Planned)

| Block | Use |
|-------|-----|
| `Block.ConversationTurn` | PRIMA message + teacher reply |
| `Block.BlueprintSection` | Collapsible blueprint viewer |
| `Block.GenerationProgress` | Soft progress during AI generation |
| `Block.ResourcePreview` | Editable artifact preview |

---

## Composition Rules

- One primary CTA per block
- Never nest more than 2 card levels deep
- PRIMA blocks never include dashboard navigation

---

## Next Recommended Document

→ [`TYPOGRAPHY.md`](./TYPOGRAPHY.md) — Type scale and font usage.
