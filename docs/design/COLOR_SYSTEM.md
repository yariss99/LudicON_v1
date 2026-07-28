---
Status: Draft
Version: 1.0
Owner: LUDI ON Product Team
Depends On: DESIGN_SYSTEM.md
Related Documents: TYPOGRAPHY.md, ICONOGRAPHY.md
Last Updated: July 2026
---

# LUDI ON — Color System

---

## Brand Palette

| Token | Hex | Use |
|-------|-----|-----|
| `blue-primary` | `#2563EB` | Primary actions, links |
| `indigo` | `#4F46E5` | Gradients, PRIMA accent |
| `purple` | `#7C3AED` | Secondary accent, logo gradient |
| `emerald` | `#10B981` | Success, positive trends |
| `amber` | `#F59E0B` | Notifications dot |

---

## Neutrals

| Token | Hex | Use |
|-------|-----|-----|
| `background-studio` | `#F8FAFC` | Dashboard canvas |
| `background-prima` | `#FFFFFF` | PRIMA experience |
| `surface` | `#FFFFFF` | Cards |
| `text-primary` | `#0F172A` | Headings |
| `text-secondary` | `#64748B` | Body, helper text |
| `border-subtle` | `rgba(15,23,42,0.06)` | Rings, dividers |

---

## Semantic Colors

| Semantic | Color |
|----------|-------|
| Primary CTA | `blue-primary` |
| Hover ring | `blue-500/40` |
| Success trend | `emerald-600` on `emerald-50` |
| Notification | `amber-500` |
| Error (future) | `#EF4444` |

---

## Gradients

| Name | Use |
|------|-----|
| Logo | `blue-600 → indigo-600 → purple-600` |
| Ambient PRIMA | Soft `blue-50/40` blur |
| Builder icon wells | `primary/[0.08]` tint circles |

Avoid full-card gradients on Dashboard builders (v1 polish decision).

---

## Icon Well Tints (Builders)

Each builder type uses a unique `bg-{color}-600/[0.08]` circle with matching icon color.

---

## Contrast Requirements

- Body text on white: minimum 4.5:1
- CTA white on blue-600: verified AA

---

## Next Recommended Document

→ [`ICONOGRAPHY.md`](./ICONOGRAPHY.md) — Icon library and emoji usage.
