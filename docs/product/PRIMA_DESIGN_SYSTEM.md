---
Status: Official — Visual & Interaction Design System
Version: 1.0
Owner: LUDI ON Product Team
Depends On: LUDI_ON_PROJECT_BIBLE.md, PRIMA_PRODUCT_DESIGN.md, PRIMA_TEACHER_EXPERIENCE.md, PRIMA_PRODUCT_REDESIGN.md
Related Documents: docs/design/COLOR_SYSTEM.md, docs/design/TYPOGRAPHY.md, docs/design/DESIGN_SYSTEM.md, docs/UI_GUIDELINES.md
Last Updated: July 2026
---

# PRIMA Design System

**Version:** 1.0  
**Status:** Official — Visual & Interaction Identity

> **How should PRIMA look and feel so that teachers immediately trust it?**

Calm. Clear. Professional. Quietly intelligent. Never busy. Never childish. Never administrative.

This document defines the complete visual and interaction language of PRIMA (delivered through LUDI ON). It guides every future screen, component, and interaction. It is **timeless by design** — a teacher opening PRIMA in 2035 should still find it elegant, professional, and calming.

Technology disappears. Pedagogy remains. The interface must **never compete** with educational thinking.

---

## 1. Design Philosophy

| Principle | Meaning |
|-----------|---------|
| **Design for calm** | Soft surfaces, quiet color, generous space — long sessions without fatigue |
| **Design for clarity** | One primary action; hierarchy obvious without decoration |
| **Design for focus** | One educational task per moment; chrome retreats during deep work |
| **Design for confidence** | Predictable patterns; clear states; no surprise motion |
| **Design for long sessions** | Readable type; low contrast chrome; no visual shouting |

**Avoid:** Visual noise · Decorative animation · Purposeless ornament · Feature grids · Admin-panel density · Mascot clutter · Glow effects as personality

**Quality bar:** Notion calm · Canva clarity · Figma precision · ChatGPT conversational restraint — applied to **instructional design**.

---

## 2. Experience Principles (Every Screen)

Every screen must answer four questions:

| Question | Design obligation |
|----------|-------------------|
| **Where am I?** | Persistent context: Home / Project name / Blueprint / Resource |
| **What am I doing?** | Clear title + one sentence of purpose |
| **What should I do next?** | One primary CTA — always visible |
| **What is most important?** | Visual weight on educational content — not chrome |

If a screen cannot answer all four, it is unfinished.

---

## 3. Visual Modes

Two emotional modes — same design system, different density.

| Mode | Context | Background | Character |
|------|---------|------------|-----------|
| **Studio** | Home, Library, Project overview | Soft neutral canvas `#F8FAFC` | Open, invitational, structured |
| **Partner** | AI conversation, Blueprint review | Clean `#FFFFFF` | Focused, breathing, single column |

Transition into Partner mode feels intentional — leaving the workspace desk to sit with a colleague. No Dashboard chrome in Partner mode ([`PRIMA_PRODUCT_REDESIGN.md`](./PRIMA_PRODUCT_REDESIGN.md)).

---

## 4. Typography

### Typeface

| Role | Choice | Rationale |
|------|--------|-----------|
| **UI primary** | Inter (400–700) or equivalent humanist sans | Excellent for long reading; already platform standard |
| **Fallback** | `ui-sans-serif, system-ui, sans-serif` | Native feel on school devices |
| **Code / rare monospace** | System mono | Only for IDs in Settings — never teacher creative surfaces |

**Rule:** No playful display fonts. No decorative serifs in product UI. Pedagogy is serious; type stays quiet.

### Type scale

| Token | Size | Weight | Line height | Use |
|-------|------|--------|-------------|-----|
| `display` | 36–40px | 700 | 1.1 | Home greeting (desktop only) |
| `title-lg` | 28px | 600 | 1.2 | Workspace titles |
| `title-md` | 22px | 600 | 1.25 | Section / Project titles |
| `title-sm` | 18px | 600 | 1.3 | Card titles, Blueprint section headers |
| `body-lg` | 17px | 400 | 1.6 | Partner conversation messages |
| `body` | 16px | 400 | 1.6 | Default body |
| `body-sm` | 14px | 400–500 | 1.5 | Meta, captions, helper |
| `label` | 12–13px | 500 | 1.4 | Field labels, badges (sentence case) |

### Typography rules

- ≤3 sizes visible on one screen  
- Sentence case in Romanian — never ALL CAPS for UI chrome  
- Headings `#0F172A` · Body `#64748B` · Emphasis slate-900 semibold  
- Truncation only for lists — never for Blueprint educational content  
- Line length for reading: 60–75 characters in Partner mode  

---

## 5. Spacing

**Base unit:** 8px.

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 8px | Tight related elements |
| `space-2` | 16px | Default component padding |
| `space-3` | 24px | Card padding, form gaps |
| `space-4` | 32px | Section separation |
| `space-5` | 48px | Major blocks |
| `space-6` | 64px | Workspace breathing room |
| `space-7` | 80px | Partner mode vertical rhythm |

**Rule:** Prefer whitespace over dividers. If two sections need a line, they may need more space instead.

---

## 6. Grid System

| Context | Grid | Max content width |
|---------|------|-------------------|
| **Home / Library** | 12-column · 24px gutter | 1200px |
| **Project overview** | 12-column · sidebar optional 280px | 1200px |
| **Partner (AI / Blueprint)** | Single column centered | 720px reading / 840px Blueprint |
| **Resource editor** | Fluid with optional 280px Blueprint rail | Full width − rail |

**Breakpoints**

| Name | Width | Behavior |
|------|-------|----------|
| `sm` | ≥640px | Comfortable phone landscape |
| `md` | ≥768px | Tablet — two-column Project lists |
| `lg` | ≥1024px | Full Studio layout |
| `xl` | ≥1280px | Max content width engaged |

Mobile: single column; primary CTA sticky bottom when scrolling long forms.

---

## 7. Color System

Calm educational palette. Primary blue for trust and action. Neutrals carry most of the UI. Accents are **semantic**, not decorative.

### Brand & action

| Token | Hex | Use |
|-------|-----|-----|
| `--color-primary` | `#2563EB` | Primary CTA, links, focus |
| `--color-primary-hover` | `#1D4ED8` | Hover / pressed |
| `--color-accent` | `#4F46E5` | PRIMA partner accent — sparingly |
| `--color-accent-soft` | `#EEF2FF` | Soft partner highlight wells |

**Restraint:** Purple (`#7C3AED`) reserved for logo mark only — not UI chrome, not gradients on every card. Avoid purple-on-white as default theme.

### Neutrals

| Token | Hex | Use |
|-------|-----|-----|
| `--color-canvas-studio` | `#F8FAFC` | Home / Library background |
| `--color-canvas-partner` | `#FFFFFF` | Partner / Blueprint background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-surface-muted` | `#F1F5F9` | Nested wells, disabled |
| `--color-text` | `#0F172A` | Headings, primary text |
| `--color-text-secondary` | `#64748B` | Body, helpers |
| `--color-text-muted` | `#94A3B8` | Placeholders, meta |
| `--color-border` | `rgba(15,23,42,0.08)` | Default borders |
| `--color-border-strong` | `rgba(15,23,42,0.14)` | Inputs focus-adjacent |

### Semantic

| Token | Hex | Use |
|-------|-----|-----|
| `--color-success` | `#059669` | Success, validation pass |
| `--color-success-soft` | `#ECFDF5` | Success backgrounds |
| `--color-warning` | `#D97706` | Caution, non-blocking findings |
| `--color-warning-soft` | `#FFFBEB` | Warning backgrounds |
| `--color-danger` | `#DC2626` | Errors, destructive |
| `--color-danger-soft` | `#FEF2F2` | Error backgrounds |
| `--color-info` | `#2563EB` | Informational callouts |
| `--color-info-soft` | `#EFF6FF` | Info backgrounds |

### Contrast

- Body text on white: ≥4.5:1 (WCAG AA)  
- Primary button white on `#2563EB`: AA verified  
- Never use muted text for critical actions or errors  

---

## 8. Elevation & Depth

Quiet depth — no multi-layer drama.

| Token | Value | Use |
|-------|-------|-----|
| `--elevation-0` | none | Flat canvas |
| `--elevation-1` | `0 1px 2px rgba(15,23,42,0.04)` | Inputs at rest |
| `--elevation-2` | `0 4px 24px rgba(15,23,42,0.06)` | Cards default |
| `--elevation-3` | `0 8px 32px rgba(15,23,42,0.08)` | Raised cards, dialogs |
| `--elevation-focus` | `0 0 0 3px rgba(37,99,235,0.25)` | Focus ring |

**Hover:** Lift ≤2px + slight elevation increase. No bounce. No glow.

---

## 9. Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 8px | Chips, small controls |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards, panels |
| `--radius-xl` | 24px | Large workspace cards, Partner surfaces |
| `--radius-full` | 999px | Avatars only — avoid pill CTAs as default |

**Avoid** rounded-full primary buttons as identity — prefer `--radius-md` for professional calm.

---

## 10. Motion

| Property | Value |
|----------|-------|
| Duration default | 180–220ms |
| Duration emphasis | 280–320ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Partner entrance | Soft fade ≤400ms — no stagger carnival |

**Allowed:** Fade, subtle slide (≤8px), focus ring, progress determinate bar.  
**Forbidden:** Bounce, elastic, confetti, infinite pulse on CTAs, parallax, decorative loops.

Motion supports **presence and hierarchy** — never entertainment.

---

## 11. Component Philosophy

Every component must:

| Requirement | Test |
|-------------|------|
| Reduce cognitive load | Can a tired teacher use it at 20:00? |
| Feel familiar | Matches patterns from documents/mail — not invent new grammar |
| Require no explanation | Label is enough |
| Support educational thinking | Does not distract from Blueprint/content |
| Stay visually consistent | Same tokens everywhere |

---

## 12. Cards

| Variant | Use |
|---------|-----|
| **Surface card** | Project overview items, Library items |
| **Intention card** | Home intention entry (not "builder" card) |
| **Blueprint section card** | One educational domain / section |
| **Resource card** | Lesson, worksheet, etc. within Project |

**Anatomy:** Optional icon well (soft tint) · Title · One helper line · Meta row · Primary action.

**Rules:**  
- Cards are for **interaction containers** — not decorative boxes around static text  
- No stacked colored borders  
- Prefer `--elevation-2` + subtle border over heavy shadow  
- Intention cards: equal visual weight; one row of 2–3 max on Home  

---

## 13. Buttons

| Variant | Use |
|---------|-----|
| **Primary** | One per view — approve, continue, create from intention |
| **Secondary** | Alternative path — export, save |
| **Ghost** | Tertiary — cancel, back |
| **Danger** | Destructive — delete Project (always confirm) |
| **Quiet** | Inline text actions — *De ce?*, *Editează* |

**Specs:** Height 40–44px · Padding 16–20px · Font 15–16px / 600 · Radius `--radius-md`.

**Rules:**  
- Exactly **one** primary button per screen region  
- Labels are verbs in Romanian: *Continuă*, *Aprobă planul*, *Generează fișa*  
- Never: *Submit*, *OK*, *Click here*  
- Disabled state: reduced opacity + no pointer — explain nearby if critical  

---

## 14. Inputs

| Type | Use |
|------|-----|
| Text / textarea | Intention, conversation, notes |
| Select | Rare — prefer conversation for pedagogical choices |
| Checkbox / radio | Explicit confirmations only |
| Search | Library / Projects — clear affordance |

**Specs:** Height 44px · Padding 12–16px · Border `--color-border` · Focus `--elevation-focus` + primary border.

**Rules:**  
- Labels above fields — never placeholder-only  
- Helper text below in `--color-text-secondary`  
- Errors below field in danger color + soft background on field  
- Textareas for teacher thinking: min 3 lines, auto-grow  

---

## 15. Icons

| Rule | Detail |
|------|--------|
| Style | Outline / 1.5–2px stroke · geometric · consistent set (e.g. Lucide) |
| Size | 16 / 20 / 24px |
| Color | Inherit text color or `--color-primary` for interactive |
| Icon wells | Soft tint circle — not saturated fills |
| Emoji | **Forbidden** in product chrome — educational content may include if teacher-authored |

Icons **support** labels — never replace critical navigation labels alone.

---

## 16. Illustrations

| Use | Guidance |
|-----|----------|
| Empty states | One soft, abstract educational metaphor — muted palette |
| Onboarding | Avoid — prefer first Project value instead |
| Marketing | Out of product UI scope |

**Forbidden:** Cartoon mascots as primary navigation · 3D glossy stock · Purple nebula backgrounds.

---

## 17. Feedback & Notifications

| Type | Pattern |
|------|---------|
| **Toast success** | Soft emerald · 3s · bottom or top-center · non-blocking |
| **Toast error** | Soft danger · persists until dismiss · actionable |
| **Inline validation** | Adjacent to field or Blueprint section |
| **Badge** | Sparse — Project state only (*Plan de revizuit*) |

**Notifications center:** Not on Home. Demoted to Settings / optional header icon — never red-dot anxiety on creative Home ([Redesign](./PRIMA_PRODUCT_REDESIGN.md)).

---

## 18. Dialogs

| Type | Use |
|------|-----|
| **Confirm** | Destructive or irreversible (delete, leave unsaved) |
| **Approve Blueprint** | Special calm dialog — title, summary, primary *Aprobă* |
| **Sheet (mobile)** | Filters, secondary actions |

**Rules:**  
- Max one dialog at a time  
- Escape / click-outside closes non-destructive only  
- Primary action right (LTR) · Ghost cancel left  
- No nested dialogs  

---

## 19. Navigation

| Pattern | Spec |
|---------|------|
| **Top anchors** | Acasă · Proiecte · Bibliotecă · (Setări) |
| **Active state** | Text weight 600 + primary underline or soft pill — not loud |
| **Project chrome** | Project title + Back to Home · hide global anchors in Partner mode |
| **Depth** | ≤3 clicks to primary goals |

No hamburger forests. No nested mega-menus. No builder portals.

---

## 20. Tables & Lists

| Pattern | Use |
|---------|-----|
| **List** | Default for Projects and Library — scannable rows |
| **Table** | Rare — Settings, admin-adjacent only |

**List row:** Title · Subject/grade meta · State chip · Relative time · Chevron.  
**Hover:** Soft surface-muted background.  
**Density:** Comfortable (48–56px row) — not data-grid dense.

---

## 21. Empty States

| Element | Content |
|---------|---------|
| Title | Honest — *"Niciun proiect încă"* |
| Body | One sentence of invitation |
| Action | One primary — *"Pregătește prima lecție"* |
| Illustration | Optional, quiet |

Never dump documentation links as the primary empty-state action.

---

## 22. Loading States

| Pattern | Use |
|---------|-----|
| **Skeleton** | Lists, cards — match final layout |
| **Inline spinner** | Button pending |
| **Partner progress** | Determinate or labeled: *"PRIMA îți structurează planul…"* |

**Rules:** Never blank white flash · Never unlabeled spinner >1s · Explain *what* is happening in Partner mode.

---

## 23. Error States

| Level | Treatment |
|-------|-----------|
| Field | Inline message |
| Section | Soft danger callout with fix suggestion |
| Page | Calm full-page — what happened · what to do · retry |
| Generation failure | Preserve Blueprint · offer retry · never lose Project |

Tone: supportive — never blame the teacher.

---

## 24. AI Components

PRIMA partner UI — conversational restraint, not chatbot theater.

| Component | Spec |
|-----------|------|
| **Message bubble (PRIMA)** | Left · surface-muted · body-lg · max-width 640px |
| **Message bubble (Teacher)** | Right · primary-soft or neutral elevated |
| **Suggestion chip** | Soft border · one line · max 3 visible |
| **Next action hint** | Quiet bar: one suggestion — dismissible |
| **De ce?** | Ghost text button adjacent to recommendations |
| **Confidence** | Plain language — never percentage theater |

**Forbidden:** Typing indicator abuse · avatar robots as centerpiece · "AI" badges everywhere · streaming fireworks.

---

## 25. Educational Components

| Component | Purpose |
|-----------|---------|
| **Objective block** | Clear statement + cognitive level label |
| **Activity block** | Purpose · timing · learner/teacher actions |
| **Assessment block** | Strategy · linked objectives |
| **Evidence chip** | Provenance hint — soft info |

Visual language mirrors Blueprint domains — calm cards, not worksheets until Resource Workspace.

---

## 26. Project Components

| Component | Spec |
|-----------|------|
| **Project header** | Title · state chip · primary next action |
| **Project resource list** | Icon + type + status (*Gol* / *Gata*) |
| **Add resource** | Secondary button — *"Adaugă fișă"* — uses existing Blueprint |
| **Project card (Home)** | Progress or state · *Continuă* |

State chips use semantic soft colors — never rainbow decoration.

---

## 27. Blueprint Components

| Component | Spec |
|-----------|------|
| **Section card** | Title · completeness indicator · edit · *De ce?* |
| **Completeness** | Quiet check / gap — not gamified score |
| **Finding callout** | Warning soft · plain language gap · CTA to fix |
| **Approve bar** | Sticky bottom or end of document · primary *Aprobă planul* |

Blueprint Workspace: reading width · section stack · educational language — **never** JSON or schema labels.

---

## 28. Accessibility

| Requirement | Standard |
|-------------|----------|
| Contrast | WCAG 2.1 AA minimum |
| Focus | Visible focus ring on all interactive elements |
| Keyboard | Full path for create → approve → export |
| Hit targets | ≥44×44px |
| Screen readers | Semantic headings · labels · live regions for Partner updates |
| Motion | Respect `prefers-reduced-motion` — disable non-essential animation |
| Language | Romanian primary · `lang="ro"` |

---

## 29. Responsive Behaviour

| Priority | Behavior |
|----------|----------|
| **Touch first on tablet** | Primary school teacher devices |
| **Home** | Intention field full width; Continuă cards stack |
| **Partner** | Full-bleed calm; composer sticky bottom |
| **Resource editor** | Blueprint rail collapses to drawer on `<lg` |
| **Never** | Horizontal scroll for primary content |

---

## 30. Light Mode & Dark Mode

### Light (default — Studio & Partner)

Defined in Color System above. **Default for v1.** Romanian classroom daylight preference; print-adjacent mental model.

### Dark Mode (future-ready tokens)

| Token | Dark value direction |
|-------|----------------------|
| Canvas | `#0F172A` / `#111827` |
| Surface | `#1E293B` |
| Text | `#F8FAFC` / `#94A3B8` |
| Primary | Slightly lifted blue for contrast |

**Rules when shipping dark:**  
- Same spacing, radius, type scale  
- No neon accents  
- Soft elevation (lighter borders, not harsh glows)  
- Teacher preference in Settings — never force  

Until dark ships, do not maintain parallel unfinished themes.

---

## 31. Copy & Voice in UI

| Do | Don't |
|----|-------|
| *Aprobă planul* | *Confirm submission* |
| *Pregătește o lecție* | *Open Lesson Builder* |
| *PRIMA îți structurează planul…* | *Generating…* |
| *Nu sunt sigur — confirmi clasa?* | *Error: invalid grade* |

Align with [`PRIMA_TEACHER_EXPERIENCE.md`](./PRIMA_TEACHER_EXPERIENCE.md) and Product Personality.

---

## 32. Anti-Patterns (Hard Ban)

| Ban | Why |
|-----|-----|
| Builder grids as Home identity | Tool thinking |
| Statistics widgets on Home | Cognitive noise |
| Purple gradient themes as default | Visual cliché · fatigue |
| Rounded-full pill CTAs everywhere | Trend over timeless |
| Multi-layer neon shadows | Noise |
| Emoji navigation | Unprofessional |
| Stepper *1 of N* in Partner mode | Violates Conversation Before Forms |
| Admin sidebar denseness | Wrong product category |

---

## 33. Token Summary (Implementation Mapping)

Aligns with `src/styles/variables.css` — extend; do not invent parallel systems.

| Design token | CSS variable (existing / target) |
|--------------|----------------------------------|
| Primary | `--primary` |
| Text | `--text` / `--text-light` |
| Canvas studio | Implement `--canvas-studio: #F8FAFC` |
| Surface | `--surface` |
| Radius | `--radius-sm/md/lg` |
| Space | `--space-1` … `--space-6` |
| Shadow | `--shadow-card` / `--shadow-soft` |

Detailed legacy notes: [`docs/design/COLOR_SYSTEM.md`](../design/COLOR_SYSTEM.md), [`docs/design/TYPOGRAPHY.md`](../design/TYPOGRAPHY.md). **This document prevails** for PRIMA product UI direction when conflict arises with draft design docs.

---

## 34. Timelessness Checklist

Before shipping any visual change, ask:

1. Will this still feel calm in 2035?  
2. Does it help a tired teacher at 20:00?  
3. Does it answer *where / doing / next / important*?  
4. Would removing it hurt educational thinking — or only decoration?  
5. Does it avoid trend aesthetics (glow, purple haze, pill overload)?  

If uncertain → **simpler wins**.

---

## 35. Summary

| Question | Answer |
|----------|--------|
| *How should PRIMA look?* | Calm neutrals · clear blue action · quiet type · generous space |
| *How should it feel?* | Trusted colleague's desk — not a tool fair |
| *What guides every screen?* | Where · Doing · Next · Important |
| *What is timeless?* | Clarity, restraint, consistency — not trends |

The Design System exists so technology **disappears** and teachers can stay inside **educational thinking** for hours without fatigue.

---

## Document Authority

| Document | Relationship |
|----------|--------------|
| **This document** | Supreme for PRIMA visual & interaction identity |
| [`PRIMA_PRODUCT_REDESIGN.md`](./PRIMA_PRODUCT_REDESIGN.md) | Experience structure this system visually supports |
| [`PRIMA_TEACHER_EXPERIENCE.md`](./PRIMA_TEACHER_EXPERIENCE.md) | Emotional requirements |
| [`docs/design/DESIGN_SYSTEM.md`](../design/DESIGN_SYSTEM.md) | Legacy LUDI draft — subordinate on conflict |
| [`UI_GUIDELINES.md`](../UI_GUIDELINES.md) | Dev-oriented — implement tokens from here |

---

## Next Recommended Work

1. Align Home implementation with Studio tokens + intention cards (no stats)  
2. Codify Partner mode layout (720–840px) for AI + Blueprint workspaces  
3. Audit components for RD-CR language (*Builder* labels → educational language)
