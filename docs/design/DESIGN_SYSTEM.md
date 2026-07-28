---
Status: Draft
Version: 1.0
Owner: LUDI ON Product Team
Depends On: PRODUCT_VISION.md, LUDI_ON_PROJECT_BIBLE.md
Related Documents: COLOR_SYSTEM.md, TYPOGRAPHY.md, LUDI_BLOCKS.md, ICONOGRAPHY.md
Last Updated: July 2026
---

# LUDI ON — Design System

> **Superseded for PRIMA product UI by [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md).**  
> Keep this file for historical LUDI ON notes; new work must follow DESIGN-001.

---

## Purpose

Single reference for visual and interaction standards across Dashboard and PRIMA.

Legacy guide: `docs/UI_GUIDELINES.md` (development-focused). This document is the **design source of truth**.

---

## Design Philosophy

LUDI ON serves teachers under time pressure. The interface must feel:

- **Clear** — one primary action per screen
- **Calm** — generous whitespace, soft shadows
- **Professional** — trustworthy for schools
- **Efficient** — minimum interactions for outcomes
- **Premium** — Linear · Notion · Canva quality bar

---

## Two Visual Modes

| Mode | Context | Background | Density |
|------|---------|------------|---------|
| **Studio** | Dashboard | `#F8FAFC` | Structured grid, builder cards |
| **PRIMA** | PRIMA experience | `#FFFFFF` | Centered, breathing, single focus |

Transition between modes must feel like entering a **different world**.

---

## Golden Principles

1. Simplicity before complexity
2. Save teachers time
3. AI recommends — teachers decide
4. One primary action per screen
5. Consistency over novelty
6. Romanian-first copy
7. No admin-panel aesthetics

---

## Spacing System

8px base grid. Common values: 8, 16, 24, 32, 48, 64, 80.

---

## Radius

| Token | Value | Use |
|-------|-------|-----|
| `sm` | 12px | Chips, small controls |
| `md` | 20px | Builder cards |
| `lg` | 24px | Sections, PRIMA card |
| `full` | 999px | Search bar, pills |

---

## Shadows

Soft, indigo-tinted on interactive elements. Avoid harsh borders; prefer shadow + ring on hover.

---

## Motion

- Duration: 200–300ms default; PRIMA welcome stagger up to 800ms
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for premium feel
- No aggressive bounce or flash
- Hover: subtle lift (-4px to -6px max)

---

## Component Documentation

Detailed specs in sibling documents:

- `LUDI_BLOCKS.md` — Layout blocks and patterns
- `TYPOGRAPHY.md` — Type scale
- `COLOR_SYSTEM.md` — Palette
- `ICONOGRAPHY.md` — Icons and emoji policy
- `ROBOT_ASSISTANTS.md` — PRIMA voice and presence

---

## Accessibility (Target)

- WCAG 2.1 AA contrast for text
- Focus rings on all interactive elements
- Reduced motion respect (`prefers-reduced-motion`)

---

## Next Recommended Document

→ [`COLOR_SYSTEM.md`](./COLOR_SYSTEM.md) — Official color palette and usage rules.
