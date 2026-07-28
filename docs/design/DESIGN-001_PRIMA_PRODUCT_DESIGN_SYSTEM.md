# DESIGN-001 — PRIMA Design System & High-Fidelity Product Prototype

Status: Official — Executable Design System  
Priority: Highest  
Version: 1.0  
Last Updated: July 2026

**Permanent specification:** [DESIGN-002 — PRIMA Design Specification](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md)

References: PRIMA_CANON · UX-001 · UX-002 · DESIGN-002 · FEATURE-001 · AI Core · Learning Canvas

---

## 0. Purpose

This document is the **runtime companion** to DESIGN-002: tokens, shell, components, and living showcase.

DESIGN-002 defines product philosophy, IA, identity, journeys, and validation gates.  
This document marks the transition from **building pages** to **designing one continuous teaching experience**.

A React developer should implement screens from DESIGN-002 using the foundations below.

**Runtime foundation**

| Layer | Path |
|-------|------|
| Tokens | `src/styles/prima-design-tokens.css` · `src/index.css` `@theme` |
| Components | `src/design-system/` |
| Living showcase | `/design-system` |
| Shell layout | `TeachingShell` + `PrimaPanel` |

---

## 1. Product philosophy

Teachers do not think in pages, modules, or studios.

Teachers think in **lessons**.

PRIMA behaves as **one continuous workspace**:

> “My teaching desk.”

Everything begins here. Everything returns here.

| Forget | Prefer |
|--------|--------|
| Dashboard | Biroul meu |
| Modules / Pages | Current lesson task |
| Studios / Workspace | Materialul la care lucrez |
| ChatGPT / Assistant | **PRIMA** |

The interface must never remind teachers that they are “using software” or “using AI.”

---

## 2. Mental model — two permanent areas

```
┌──────────────────────────────────────────────────────────────┐
│  Header (lesson context · auto-save · subtle chrome)         │
├────────────────────────────────────────────┬─────────────────┤
│                                            │                 │
│  TEACHER WORKSPACE (fluid)                 │  PRIMA          │
│  Lesson · Worksheet · Presentation · …     │  360–400px      │
│                                            │  sticky         │
│                                            │  independent    │
│                                            │  scroll         │
│                                            │                 │
└────────────────────────────────────────────┴─────────────────┘
```

### Left — Teacher Workspace

- The teacher always works here.
- Content changes by task; **interaction model stays identical**.
- Tasks: Lesson · Worksheet · Presentation · Assessment · Educational Game · Rubric.

### Right — PRIMA

- Always visible on desktop (sticky, independently scrollable).
- Width: **360–400px**.
- Contains: conversation · suggestions · pedagogical observations · warnings · recommendations · insights · quick actions.
- Observes. Suggests. Helps. **Never interrupts.**
- No unnecessary modals.

---

## 3. The four questions (every screen)

| Question | Design obligation |
|----------|-------------------|
| Where am I? | Persistent lesson context in header |
| What am I working on? | Clear title + one purpose sentence |
| What should I do next? | One primary action always visible |
| Can I safely continue? | Autosave status · calm errors · undo |

If unanswered, the screen is unfinished.

---

## 4. The face of PRIMA — identity mark

**Not** a robot · cartoon · human avatar.

**Is** an elegant symbolic presence: calm · warm · intelligent · trustworthy · minimal · timeless.

### Symbol: Guiding Star (Compass Light)

A soft 8-point star / compass rose formed by two overlapping diamonds, with a gentle center pulse.

| Property | Value |
|----------|-------|
| Geometry | Two rotated squares (45°), soft corners |
| Fill | `prima.primary` at 92% opacity |
| Center | Soft warm glow `prima.accent` 12% |
| Pulse | 2.4s ease-in-out opacity 0.55 → 1 → 0.55 |
| Size | 20 / 28 / 36 px contexts |
| Clear space | ≥ 0.5× mark width |

Teachers should recognize PRIMA without reading the word.

**Implementation:** `src/design-system/PrimaMark.tsx`

---

## 5. Design language

The entire interface should feel like:

> **A beautifully organized teaching desk.**

Not software. Not AI. Not administration. **Teaching.**

Qualities: calm · clarity · professionalism · confidence · space.

---

## 6. Color system

Educational. Professional. Not childish. Avoid saturated / neon colors. **No purple brand accents** in product UI.

| Token | Hex | Role |
|-------|-----|------|
| `--prima-primary` | `#2563EB` | Primary actions, PRIMA mark |
| `--prima-primary-hover` | `#1D4ED8` | Hover |
| `--prima-secondary` | `#059669` | Success, saved, aligned |
| `--prima-accent` | `#D97706` | Attention, suggestions |
| `--prima-danger` | `#DC2626` soft on `#FEF2F2` | Errors (gentle) |
| `--prima-bg` | `#F4F5F7` | Warm light gray canvas |
| `--prima-surface` | `#FFFFFF` | Cards, panels |
| `--prima-text` | `#0F172A` | Headings |
| `--prima-text-muted` | `#64748B` | Body / helper |
| `--prima-border` | `rgba(15,23,42,0.08)` | Rings |
| `--prima-panel` | `#FAFBFC` | PRIMA panel background |

Semantic mapping: Primary=Blue · Secondary=Green · Accent=Amber · Error=Soft red · Background=Warm light gray.

---

## 7. Typography

Maximum **three font sizes** visible simultaneously.

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `title` | 24–28px | 600 | Page / lesson title |
| `body` | 15–16px | 400 | Default reading |
| `meta` | 12–13px | 500 | Status, labels |

Typeface: Inter (existing platform) · fallbacks `ui-sans-serif, system-ui, sans-serif`.

Rules: sentence case Romanian · high contrast for body · never ALL CAPS chrome · line length ~65ch in reading contexts.

---

## 8. Spacing & grid

**8px base grid.** Allowed: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80.

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |

No arbitrary margins outside the scale.

---

## 9. Radius & elevation

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 10px | Inputs, chips |
| `--radius-md` | 16px | Cards |
| `--radius-lg` | 24px | Panels, sections |
| `--radius-full` | 999px | Buttons, pills |

| Elevation | Value |
|-----------|-------|
| `--shadow-soft` | `0 8px 30px rgba(15,23,42,0.04)` |
| `--shadow-hover` | `0 12px 40px rgba(15,23,42,0.08)` |

Soft shadows only. No multi-layer neon glow.

---

## 10. Iconography

Simple · rounded · minimal · educational.

Icons **support** understanding — never replace text.

Stroke ~1.75 · size 16 / 20 · color `prima-text-muted` unless active.

---

## 11. Component library

All components live under `src/design-system/` and must be reused — do not reinvent per feature.

| Component | Purpose |
|-----------|---------|
| `PrimaMark` | Identity symbol + optional pulse |
| `TeachingShell` | Two-column desk: workspace + PRIMA |
| `PrimaPanel` | Right rail container |
| `PrimaButton` | Primary / secondary / ghost / danger |
| `PrimaCard` | Surface with soft shadow |
| `EditableSection` | Collapse / expand lesson section |
| `SectionHeader` | Title + optional action |
| `SummaryCard` | Sticky lesson summary rows |
| `StatusBadge` | Saved / syncing / needs attention |
| `ProgressIndicator` | Soft linear / step progress |
| `Timeline` | Lesson flow / version history |
| `EmptyState` | Calm incomplete guidance |
| `FloatingSuggestion` | Non-blocking PRIMA tip |
| `InlineEditor` | Focused field editing |
| `TeacherNote` | Soft note surface |
| `NotificationToast` | Transient confirmation |
| `LoadingBlock` | Pulse skeleton |
| `Dialog` | Rare confirmation only |

### Button rules

- One primary per view (blue filled, large).
- Secondary: outline / ring.
- Labels = teacher actions (UX-002): *Creează materialele*, *Continuă*, never *Generate / Submit*.

### Empty state copy

> Poți completa această secțiune acum sau mai târziu.  
> Button: **Adaugă informații**

Never: No data · Missing · Required · Error · Invalid.

### Error copy

> Mai avem nevoie de câteva informații pentru această secțiune.

---

## 12. Adaptive assistance (PRIMA panel behavior)

PRIMA continuously understands teacher actions — quietly.

| Teacher action | PRIMA response |
|----------------|----------------|
| Deletes an objective | Soft tip: evaluation still references it — offer update |
| Adds differentiated activity | Offer remedial worksheet |
| Changes duration | Recalculate activity timings |

Rules:

1. Appear as `FloatingSuggestion` inside PRIMA panel — not modal.
2. One suggestion at a time.
3. Teacher dismisses or accepts; never auto-mutates without consent.
4. Language = educational Romanian colleague (UX-001/002).

---

## 13. Microinteractions & motion

Motion explains. Motion never entertains.

| Interaction | Spec |
|-------------|------|
| Hover card | Elevation → `--shadow-hover`, 150ms |
| Click button | Scale 0.98 → 1, 120ms |
| Expand / collapse | 200–250ms ease-out height + opacity |
| Autosave | Fade confirmation 300ms |
| Timeline reorder | Transform 200ms |
| Suggestion enter | Fade + 6px rise, 220ms |
| PrimaMark pulse | 2.4s loop, opacity only |

Forbidden: bounce, spin-as-personality, parallax, confetti, glow blooms.

---

## 14. Responsive strategy

| Viewport | Layout |
|----------|--------|
| Desktop ≥1280 | Full TeachingShell (workspace + PRIMA 380px) |
| Tablet 768–1279 | Adaptive two-column; PRIMA may collapse to drawer toggle |
| Mobile <768 | Reading / reviewing; limited editing; PRIMA as bottom sheet |

---

## 15. Accessibility

- Contrast ≥ WCAG AA for text.
- Focus rings: `2px solid var(--prima-primary)` offset 2px.
- Hit targets ≥ 40px.
- `prefers-reduced-motion`: disable pulse and non-essential transitions.
- Screen reader: PRIMA panel labelled `aria-label="PRIMA"`.
- Never convey meaning by color alone.

---

## 16. High-fidelity layouts (wireframe contracts)

### 16.1 Teaching Desk (home)

- Full-bleed calm canvas `--prima-bg`.
- Greeting + one question: *Cu ce dorești să lucrezi astăzi?*
- Primary: **Creează o lecție**.
- Recent lessons as quiet list — not a dashboard of widgets.
- PRIMA panel: daily insight + continue suggestion.

### 16.2 Conversation → Lesson

- Workspace: guided conversation + living plan reflection.
- PRIMA: structured reply (understand → why → one question).
- On lesson ready → navigate to Proiectul lecției (FEATURE-001).

### 16.3 Proiectul lecției (FEATURE-001)

- Workspace: editable sections (70%).
- Summary sticky inside workspace or right of content; **PRIMA panel remains** for adaptive tips.
- Primary: **Creează materialele**.

### 16.4 Material preparation

- Workspace: material catalog + preview.
- PRIMA: quality observations, alignment tips.
- No free-prompt generation outside Blueprint workflow.

### 16.5 Material editing

- Workspace: structure + editor.
- PRIMA: alignment warnings, soft suggestions.

---

## 17. Teacher journeys

### Journey A — Prepare tomorrow’s lesson

1. Open Biroul meu  
2. Creează o lecție  
3. Conversation with PRIMA  
4. Proiectul lecției opens  
5. Edit / approve  
6. Creează materialele  
7. Review resources  
8. Return to Biroul meu  

### Journey B — Improve an existing lesson

1. Open recent lesson from desk  
2. Edit objectives  
3. PRIMA suggests assessment alignment  
4. Accept → materials marked for refresh  

---

## 18. UX rationale

| Choice | Why |
|--------|-----|
| Permanent PRIMA rail | Partner presence without chat-app metaphor |
| Teaching desk metaphor | Matches teacher cognition |
| Soft blue primary | Trust + education without childish palette |
| Autosave as status | Removes fear; no “Save or lose work” anxiety |
| Adaptive tips not modals | Respects flow; teacher authority |

---

## 19. Implementation notes (React)

1. Wrap lesson flows in `<TeachingShell prima={<PrimaPanel …/>}>…</TeachingShell>`.
2. Import colors/spacing from CSS variables — do not hardcode hex in features.
3. Prefer `PrimaButton` / `PrimaCard` over ad-hoc Tailwind one-offs for new UI.
4. Copy only from `src/i18n/ro/teacherLanguage.ts` patterns (UX-001/002).
5. Generation must remain Blueprint-gated (FEATURE-001).
6. Showcase at `/design-system` is the visual QA surface for components.

### Migration path

| Phase | Work |
|-------|------|
| Now | Tokens + shell + showcase + mark |
| Next | Migrate Lesson Blueprint into TeachingShell |
| Then | Migrate Create Experience + Generation |
| Later | Retire dashboard/module chrome |

---

## 20. Definition of done

- [x] Complete visual identity (Guiding Star)
- [x] Complete Design System specification
- [x] Tokenized colors, type, space, motion
- [x] Reusable component foundation
- [x] TeachingShell + PrimaPanel layout contract
- [x] Living showcase for developers
- [ ] Full feature migration onto shell (follow-on sprints)

**Success:** Teachers understand every screen in ≤5 seconds; PRIMA feels calm, intelligent, and always available; the product no longer feels like an AI application — it feels like a teacher’s natural digital desk.
