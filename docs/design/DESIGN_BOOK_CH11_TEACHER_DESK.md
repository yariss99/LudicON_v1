# PRIMA Design Book — Chapter 11  
# Teacher Desk (Biroul meu)

Version: 1.0  
Status: Critical — Home surface of PRIMA  
Priority: Highest  
Audience: Product · UX · UI · Frontend · QA  
Last Updated: July 2026

**Screen ID:** HOME-001 · [Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Canon:** [DOCUMENT-000 Manifesto](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1–10 Design Book](./README.md) · [DESIGN-002](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md) · [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)  
**Voice:** UX-001 / UX-002 · **Routes:** `/` · `/desk`  
**Runtime (current):** `src/features/teacher-desk/` — migrate toward this chapter when UI diverges

---

# 0. Objective

Design the **main workspace** of PRIMA.

| This is | This is not |
|---------|-------------|
| The teacher’s digital studio | A dashboard |
| An architectural atelier for lessons | An admin console |
| Calm · professional · creative · trustworthy | Cluttered widgets · gamified chrome |

The teacher must understand within five seconds:

1. Where they are  
2. What they can create  
3. What deserves attention  
4. How to continue  

**Emotion target:** *“I want to work here.”* — not *“I need to learn another app.”*

---

# 1. UX rationale

## 1.1 Why not a dashboard

Dashboards optimize for monitoring many metrics. Teachers optimize for **starting and finishing a lesson**. Metrics compete with the primary creative act. The Desk therefore:

- Privileges **one primary action** (create / continue)  
- Surfaces **at most three** recommendations  
- Hides secondary tools behind progressive disclosure  
- Keeps PRIMA as a calm presence, never a chatbot panel takeover  

## 1.2 Design principles (normative)

| Principle | Desk implication |
|-----------|------------------|
| Teacher First | Copy, hierarchy, and CTAs speak teaching — never platform jargon |
| Calm Interface | Soft surfaces, low chrome contrast, no urgency colors by default |
| Large White Space | Section gaps ≥ 32px; max one idea per band |
| Progressive Disclosure | Collections / knowledge expand on intent |
| Focus Mode | First viewport = brand + greeting + one CTA + continue strip |
| One Primary Action | Single filled primary button in the first viewport |
| Invisible AI | Guiding Star presence; recommendations optional |
| Pedagogy Before Technology | Shelves of subjects & lessons — not modules & pipelines |

## 1.3 Visual concept (original synthesis)

Inspired by architectural studios, premium creative tools, editorial layouts, HIG calm, Notion clarity, Linear restraint — **without copying** any product.

**PRIMA Desk signature:**

- Warm light-gray canvas (`--prima-bg`) like paper on a drafting table  
- White floating planes with soft elevation (not hard cards everywhere)  
- Guiding Star (DESIGN-002 Ch.4) as the only “brand face”  
- Educational blue reserved for commitment (primary CTA)  
- Romanian greeting that changes with time of day  

## 1.4 Anti-patterns (forbidden)

- Stat strips, KPI rows, purple AI glow  
- Chat bubbles as home metaphor  
- Mega-menus, module switchers  
- More than one primary CTA above the fold  
- Dense “today’s schedule + weather + news” widgets  
- Robot / cartoon / human avatar as PRIMA  

---

# 2. Information architecture

```
Biroul meu
├── Header (global)
│   ├── Logo / PrimaMark + wordmark
│   ├── Global search
│   ├── Notifications
│   └── Teacher profile
├── Main column (fluid, max ~1040px content)
│   ├── Greeting band
│   ├── Primary action
│   ├── Continue working
│   ├── Collections (shelves)
│   ├── Recent lesson designs
│   ├── Recommendations (≤3)
│   ├── Knowledge Hub strip
│   ├── Reflection strip
│   └── Footer
└── PRIMA presence (rail or compact dock)
    ├── Daily insight
    ├── Subtle recommendation pulse
    └── Quick tips (non-modal)
```

### Entry / exit

| Entry | Exit |
|-------|------|
| `/` · `/desk` · deep links “home” | Create → Conversation · Resume → Lesson Project · Library · Knowledge · Reflection · Settings |

### Relationships to product features

| Desk region | Feature |
|-------------|---------|
| Primary / Continue | FEATURE-001 conversation & lesson project |
| Collections / Recent | FEATURE-002 / KHPM |
| Recommendations | FEATURE-003 PIE + KHPM |
| Knowledge strip | FEATURE-007 |
| Reflection strip | FEATURE-006 |
| Publish history (subtle) | FEATURE-005 (optional meta, not first viewport) |

---

# 3. Complete page layout

## 3.1 First viewport (hero composition — one job)

```
┌──────────────────────────────────────────────────────────────┐
│  [★ PRIMA]     [ Caută…          ]   [🔔]  [Profil]          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Bună dimineața, Ana.                                       │
│   Pregătită să proiectezi experiența de învățare de azi?     │
│                                                              │
│   ┌─────────────────────────────────────┐                    │
│   │  Creează un proiect de lecție       │  ← only primary    │
│   └─────────────────────────────────────┘                    │
│                                                              │
│   Continuă lucrul                                            │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│   │ Lesson…  │ │ Lesson…  │ │ Lesson…  │                     │
│   └──────────┘ └──────────┘ └──────────┘                     │
│                                              ┌─────────────┐ │
│                                              │ ★ PRIMA     │ │
│                                              │ insight…    │ │
│                                              └─────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Rule:** First viewport contains only brand/greeting, one headline+line, one CTA group, continue strip, and PRIMA presence. No stats, schedules, or secondary marketing.

## 3.2 Below the fold (ordered bands)

1. **Collections** — curated shelves (Mathematics · Language · …)  
2. **Recent Lesson Designs** — denser list if >3 continues  
3. **Recommendations** — max 3 meaningful items  
4. **Knowledge Hub** — recent resources · favorites · templates · notes  
5. **Reflection** — unfinished reflection · recent insight · growth tip  
6. **Footer** — quiet legal / help links  

## 3.3 Section anatomy (every band)

```
[Section title — 1 line]
[One supporting sentence — optional]
[Content]
```

No section headers with toolbars of five icons.

---

# 4. Grid specification

| Token | Value |
|-------|-------|
| Base grid | 8px |
| Page max width | 1600px shell · **1040px** reading column |
| Side margins | 24–32px desktop · 16px tablet |
| Section gap | 48px (`--space-7`) desktop · 32px tablet |
| Card gap | 16–24px |
| PRIMA rail | 360–400px (`--prima-panel-width`) desktop ≥1280px |
| Columns (main) | 12-col mental model; continue cards = 3×4 cols |

### Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| Desktop | ≥1280 | Main + PRIMA rail sticky |
| Laptop | 1024–1279 | Main full; PRIMA collapses to top/side dock |
| Tablet | 768–1023 | Single column; PRIMA bottom sheet / FAB |
| Mobile (future) | <768 | Greeting + CTA + continue; shelves as horizontal scroll |

---

# 5. Component inventory

Map to DESIGN-001 components where possible (`PrimaButton`, `PrimaCard`, `PrimaMark`, `PrimaPanel`, `TeachingShell`, `StatusBadge`, `EmptyState`, `FloatingSuggestion`, `LoadingBlock`, `SectionHeader`).

| Component | Purpose | Notes |
|-----------|---------|-------|
| `DeskHeader` | Logo · search · notifications · profile | Height 56–64px; hairline bottom border |
| `DeskGreeting` | Time-based Romanian greeting | Title 24–28px; body 15–16px |
| `PrimaryCreateButton` | `PrimaButton` primary | Label: **Creează un proiect de lecție** |
| `ContinueLessonCard` | Resume recent work | Title · subject · grade · last edited · progress · Resume |
| `CollectionShelf` | Visual collection | Soft cover + label; not folder icon |
| `RecommendationChip` | Max 3 tips | Optional Accept / Dismiss |
| `KnowledgeStrip` | Hub preview | 3–4 quiet items |
| `ReflectionStrip` | RPTI preview | No charts |
| `PrimaPresence` | Guiding Star + short insight | Pulse only if recommendations exist |
| `GlobalSearchField` | Natural language search | Opens results overlay / `/knowledge` |
| `NotificationBell` | Quiet badge | Dot only; no red panic |
| `ProfileMenu` | Settings · sign out | Sparse |
| `DeskFooter` | Minimal | Links in muted type |
| `DeskEmptyState` | First login | `EmptyState` pattern |
| `DeskSkeleton` | Loading | Soft pulse blocks |

### ContinueLessonCard anatomy

```
┌─────────────────────────────────────┐
│ Fracții echivalente                 │
│ Matematică · Clasa a IV-a           │
│ Editat acum 2 ore · ●●●○ Progres    │
│                    [ Continuă ]     │
└─────────────────────────────────────┘
```

- Entire card clickable; secondary text button OK  
- Progress = quiet dots or thin bar — never a grade  

### CollectionShelf anatomy

```
┌────────────┐
│  soft art  │  Matematică
│  wash      │  12 lecții
└────────────┘
```

Feels like a **curated shelf**, not a file folder.

---

# 6. Interaction specification

| Interaction | Spec |
|-------------|------|
| Hover (cards) | Elevate to `--shadow-hover` · 150ms |
| Focus | 2px primary ring · offset 2px |
| Primary press | Scale 0.98 · 120ms |
| Continue | Navigate to lesson project or last editor |
| Create | Navigate to `/create/experience` |
| Search | Debounced 200ms; Enter opens full results |
| Recommendation dismiss | Fade 200ms; store preference |
| Collection open | Soft page transition 220ms |
| PRIMA tip | Non-modal; Aplică / Nu acum |
| Offline | Banner muted: *Lucrezi offline — modificările se vor sincroniza.* |

### States matrix

| State | Greeting | Primary | Continue | PRIMA |
|-------|----------|---------|----------|-------|
| Normal | Time-based | Visible | Up to 3 | Insight |
| Loading | Skeleton line | Skeleton CTA | Skeleton cards | Pulse soft |
| Empty / First visit | Welcome | Dominant | Hidden | Welcome tip |
| Returning | Welcome back | Visible | Filled | Continue tip |
| Error | Kept | Visible | Retry on strip | Calm apology |
| Offline | Kept | Visible | Local only badge | Hidden tips |

---

# 7. Motion specification

| Motion | Duration | Easing | Use |
|--------|----------|--------|-----|
| Micro | 120–150ms | ease-out | Press, hover |
| Standard | 200–250ms | ease-out | Section enter, dismiss |
| Page enter | 220ms | ease-out | First paint of main |
| Star pulse | 2400ms | ease-in-out | Only when tips exist |
| Reduced motion | 1ms | — | Honor `prefers-reduced-motion` |

**Allowed:** fade + 4–8px rise on cards.  
**Forbidden:** bounce, confetti, parallax hero, looping marketing motion.

---

# 8. Accessibility review

| Area | Requirement |
|------|-------------|
| Contrast | Body text AA on `--prima-bg` / surface |
| Focus | Visible on search, CTA, cards, profile |
| Targets | ≥40×40px |
| SR | Header landmarks; `aria-label="PRIMA"` on presence |
| Motion | Reduced-motion disables pulse |
| Color | Progress not color-only |
| Language | Romanian educational (UX-002) |
| Five-Second Test | Mandatory before ship |

---

# 9. High-fidelity visual description

## 9.1 Color

Use DESIGN-001 tokens exclusively:

| Role | Token | Hex |
|------|-------|-----|
| Canvas | `--prima-bg` | `#F4F5F7` |
| Surfaces | `--prima-surface` | `#FFFFFF` |
| PRIMA panel | `--prima-panel` | `#FAFBFC` |
| Primary | `--prima-primary` | `#2563EB` |
| Text | `--prima-text` | `#0F172A` |
| Muted | `--prima-text-muted` | `#64748B` |
| Accent (rare) | `--prima-accent` | `#D97706` |

No purple brand accents. Soft ambient gradient optional behind greeting (radial, ≤6% opacity blue).

## 9.2 Typography

| Role | Size | Weight |
|------|------|--------|
| Greeting | 28px / 1.2 | 600 |
| Supporting | 16px / 1.5 | 400 |
| Section title | 18–20px | 600 |
| Meta | 12–13px | 500 |

Max **three** type sizes on screen. Sentence case Romanian.

## 9.3 Spacing · radius · elevation

- Padding page: 32px  
- Card padding: 20–24px  
- Radius: cards `--radius-lg` (24px); buttons `--radius-full`  
- Elevation: `--shadow-soft` default; hover `--shadow-hover`  
- Borders: prefer ring `rgba(15,23,42,0.08)` over hard gray lines  

## 9.4 Icons

Lucide (or equivalent) 20px stroke 1.75 · muted. Never replace labels on primary actions.

## 9.5 Copy (canonical RO)

| Slot | Copy |
|------|------|
| Primary CTA | Creează un proiect de lecție |
| Continue | Continuă |
| Morning | Bună dimineața. |
| Afternoon | Bună ziua. |
| Evening | Bună seara. |
| Welcome back | Bine ai revenit. |
| Ready line | Pregătită să proiectezi experiența de învățare de azi? |
| First visit | Bine ai venit în PRIMA. Hai să creăm împreună prima ta lecție. |
| Empty continue | Nu ai proiecte începute — începe cu butonul de mai sus. |

Greeting composition: `{timeGreeting}` + optional first name + ready line.

## 9.6 PRIMA presence

- Guiding Star 24px in panel header; pulse **on** if ≥1 recommendation  
- Copy example: *Poți continua lecția de ieri despre fracții.*  
- Never a floating chat bubble covering the CTA  

## 9.7 Recommendations (examples, max 3)

1. Continuă lecția de ieri.  
2. Ai folosit cu succes această activitate înainte.  
3. Există o variantă diferențiată disponibilă.  

## 9.8 Reflection strip (no charts)

- Continuă reflecția neterminată  
- Perspectivă recentă (one sentence)  
- Sugestie de creștere profesională (one sentence)  

---

# 10. Developer implementation notes

## 10.1 Preferred composition

```tsx
<TeachingShell
  header={<DeskHeader />}
  prima={<PrimaPresence />}
>
  <DeskGreeting />
  <PrimaryCreateButton />
  <ContinueWorking />
  {/* below fold */}
  <CollectionShelves />
  <Recommendations max={3} />
  <KnowledgeStrip />
  <ReflectionStrip />
</TeachingShell>
```

## 10.2 Tokens

Import from `src/styles/prima-design-tokens.css`. Do not hardcode hex in feature files.

## 10.3 Data hooks (suggested)

| Region | Source |
|--------|--------|
| Continue / Recent | Projects / lesson store |
| Recommendations | PIE + KHPM recommend() |
| Knowledge strip | FEATURE-007 list |
| Reflection strip | FEATURE-006 unfinished + insights |
| Search | KHPM `search(nl)` |

## 10.4 Migration from current `teacher-desk`

Current implementation emphasizes Daily Brief · Focus · Insight · Timeline · Quick Access. This chapter is the **target visual constitution**. Migration order:

1. Adopt `TeachingShell` + Guiding Star presence  
2. Collapse first viewport to greeting + one CTA + continue  
3. Move timeline / dense widgets below fold or into progressive disclosure  
4. Cap recommendations at 3  
5. Align all copy to UX-002 table in §9.5  

## 10.5 QA checklist

- [ ] Five-Second Test passed  
- [ ] Only one primary CTA above the fold  
- [ ] ≤3 recommendations  
- [ ] No ranking / stats strip  
- [ ] Reduced motion respected  
- [ ] Tablet: PRIMA not permanently stealing width from CTA  
- [ ] Empty + loading + offline states implemented  

---

# Success criteria

The Teacher Desk becomes the **visual identity of PRIMA**:

- Unique among educational platforms  
- Perceived as a premium professional studio for education  
- Immediately understandable without training  

**Biroul meu is where teaching design begins — and where teachers return.**
