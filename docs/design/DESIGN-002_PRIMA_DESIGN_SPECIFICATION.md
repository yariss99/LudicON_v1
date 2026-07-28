# DESIGN-002 — PRIMA Design Specification v1.0

Status: Official — Permanent Design Reference  
Priority: Highest  
Version: 1.0  
Audience: Product · UX · UI · Frontend · QA  
Last Updated: July 2026

**Companion runtime:** [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · `src/design-system/` · `/design-system`

**Language & voice:** [UX-001](../engineering/UX-001_TEACHER_LANGUAGE_FIRST.md) · [UX-002](../engineering/UX-002_PRIMA_VOICE_LANGUAGE.md)

**Canon:** [DOCUMENT-000 — The PRIMA Manifesto](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · product constitution under `docs/product/`

---

# How to use this document

| Role | Use |
|------|-----|
| Product Manager | Chapters 1–2, 9, 12 for scope & journeys |
| UX Designer | Chapters 1–2, 6, 8–11 for flows & validation |
| UI Designer | Chapters 3–7, 12 for identity & components |
| Frontend Developer | Chapters 5–8, 13 + DESIGN-001 tokens/components |
| QA | Chapters 8, 10–11 acceptance checks |

**Rule:** Every future screen must pass the Five-Second Test (Chapter 11) and reference this specification. If design and implementation diverge, **this document wins** until a new DESIGN revision is approved.

---

# CHAPTER 1 — Product Philosophy

## 1.1 Vision

PRIMA is the calm digital teaching desk where teachers design lessons with a trusted pedagogical partner — without feeling they are using AI software.

## 1.2 Mission

Help teachers prepare coherent, classroom-ready lessons faster — through guided conversation, a living lesson project, and materials that always originate from that project.

## 1.3 Teacher First

- Teacher authority is absolute.
- PRIMA suggests; the teacher decides.
- No forced flows that override pedagogical judgment.
- Undo, autosave, and restore are always available.

## 1.4 Pedagogical First

- Pedagogy structures the interface: objectives → activities → assessment → materials.
- Technical concepts (engine, pipeline, blueprint, generation) never appear in the UI.
- Completeness is educational, not transactional.

## 1.5 Teacher Language First

- Romanian educational language in all visible copy (UX-001 / UX-002).
- Buttons name teacher actions: *Creează materialele*, *Continuă*, *Verifică și modifică*.
- Errors never blame: *Mai avem nevoie de câteva informații…*

## 1.6 Product principles

| # | Principle | Design implication |
|---|-----------|-------------------|
| P1 | One continuous desk | No module hopping; shell stays stable |
| P2 | One primary action | One clear CTA per view |
| P3 | Calm over clever | Soft motion, soft color, space |
| P4 | Partner, not chatbot | Permanent PRIMA rail; never “chat UI” metaphor |
| P5 | Lesson is the unit | Navigation is by lesson task, not by app section |
| P6 | Safe to continue | Autosave · undo · clear status |
| P7 | Progressive disclosure | Show what is needed now; hide the rest |
| P8 | Consistency over novelty | Same patterns for every material type |

## 1.7 Mental model

```
Biroul meu
    → Conversație (thinking with PRIMA)
    → Proiectul lecției (building the lesson)
    → Materialele lecției (creating resources)
    → Editor material (refining)
    → Bibliotecă / Export (reuse & share)
```

Forget: Dashboard · Modules · Pages · Studios · Workspace.  
Prefer: **My teaching desk** · **This lesson** · **This material** · **PRIMA**.

## 1.8 Decision principles

When two designs compete, choose the one that:

1. Reduces teacher cognitive load  
2. Keeps pedagogy visible  
3. Preserves teacher control  
4. Uses fewer words and fewer controls  
5. Stays consistent with an existing pattern  

## 1.9 Product personality

| Trait | Expression |
|-------|------------|
| Calm | Soft surfaces, no urgency chrome |
| Focused | One task in the main area |
| Elegant | Restraint in color and motion |
| Professional | School-trustworthy; not childish |
| Invisible | Technology recedes; teaching remains |
| Warm | Gentle accent; human reassurance |

**Personality anti-patterns:** flashy AI aesthetics · purple glow · robot mascots · admin density · gamified streaks.

---

# CHAPTER 2 — Information Architecture

## 2.1 Platform map

```
┌─────────────┐
│ Biroul meu  │  Entry / return home
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Conversație │  Guided pedagogical dialogue
└──────┬──────┘
       │ auto when lesson ready
       ▼
┌──────────────────┐
│ Proiectul lecției│  Canonical lesson source of truth
└────────┬─────────┘
         │ Creează materialele
         ▼
┌───────────────────┐
│ Materialele lecției│  Prepare selected resources
└────────┬──────────┘
         │ open resource
         ▼
┌─────────────────┐
│ Editor material │  Refine one resource
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
Bibliotecă   Export
```

## 2.2 Nodes

| Node (UI name) | Purpose | Route (current) |
|----------------|---------|-----------------|
| Biroul meu | Orient · continue · start | `/` · `/desk` |
| Conversație | Shape the lesson with PRIMA | `/create/experience` |
| Proiectul lecției | Review · edit · approve lesson | `/blueprint/review/:id` |
| Materialele lecției | Create selected materials | `/generation/:id` |
| Editor material | Edit one material | `/asset-studio/...` |
| Bibliotecă | Reuse saved resources | `/library` |
| Export | Download / share | From editor / summary |
| Setări | Preferences | `/settings` |

## 2.3 Relationships

- **Canonical source:** Proiectul lecției. No resource is generated outside this workflow.
- **PRIMA panel:** Present on conversation, project, materials, editor (desktop).
- **Library** stores outputs; does not invent pedagogy.
- **Export** never mutates the lesson project.

## 2.4 Transitions

| From → To | Trigger | Feel |
|-----------|---------|------|
| Desk → Conversation | Creează o lecție | Soft fade into partner mode |
| Conversation → Project | Auto when ready / manual open | Continuity; same lesson title |
| Project → Materials | Creează materialele | Brief progress, then materials |
| Materials → Editor | Open material | Same shell; content swaps |
| Any → Desk | Biroul meu / leave | Always safe return |

## 2.5 Entry points

- Teaching desk primary CTA  
- Recent lesson cards  
- Library “use in lesson”  
- Deep link to project / material (with context restored)

## 2.6 Exit points

- Return to Biroul meu  
- Export complete  
- Session idle (state preserved via autosave)

## 2.7 Navigation philosophy

Navigation **disappears**. Chrome is minimal:

- Lesson title context  
- Autosave status  
- Subtle back to previous step  
- PRIMA always available  

No mega-menus. No module switchers.

---

# CHAPTER 3 — Visual Identity

**Full creative direction (Absolute):** [Design Book Ch.1 — Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md)  
**Visual grammar (Critical):** [Design Book Ch.2 — PRIMA Design Language (PDL)](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md)  
**Pedagogical components (Critical):** [Design Book Ch.3 — Pedagogical Design System (PDS)](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md)  
**Experience patterns (Critical):** [Design Book Ch.4 — Experience Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md)  
**Teacher journeys (Critical):** [Design Book Ch.5 — Teacher Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)  
**Motion & interaction (Critical):** [Design Book Ch.6 — Motion & Interaction System](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)  
**Accessibility (Critical):** [Design Book Ch.7 — Accessibility & Inclusive Design](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)  
**Responsive & adaptive (Critical):** [Design Book Ch.8 — Responsive & Adaptive Experience](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction (Absolute):** [Design Book Ch.9 — PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint (Absolute):** [Design Book Ch.10 — Product Blueprint & Screen Library](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)

## 3.1 Mood

Calm trust of a well-lit teachers’ lounge: warm light gray surfaces, clear hierarchy, quiet confidence.

## 3.2 Logo usage

| Context | Treatment |
|---------|-----------|
| App header | Guiding Star mark + wordmark “PRIMA” (optional) |
| Compact | Mark alone (20–28px) |
| Marketing (future) | Mark + wordmark horizontal |
| Do not | Stretch · recolor to neon · place on busy photos · add outlines |

Clear space ≥ 0.5× mark width.

## 3.3 Symbol

See Chapter 4 — Guiding Star (Compass Light).

## 3.4 Visual language

- Soft rounded rectangles  
- Thin rings instead of hard borders  
- Soft shadows (`--shadow-soft`)  
- Large whitespace  
- Educational blue as commitment color  

## 3.5 Graphic motifs

Allowed: soft radial wash behind PRIMA panel · faint constellation dots (≤3% opacity) · paper-like card stacks.  
Forbidden: neon grids · particle systems · 3D glassmorphism stacks · emoji decoration.

## 3.6 Illustration style

If used: line + soft fill · adult education · no cartoon characters · limited palette (blue / green / amber / slate). Prefer zero illustration on core teaching surfaces.

## 3.7 Photography rules

Optional classroom photography only on desk greeting / empty library. Natural light · real teaching contexts · no stock “robot teacher” · desaturate slightly to match calm UI.

## 3.8 Icons

Lucide (or equivalent) rounded stroke 1.75 · 16/20px · mute color. Icons support labels; never replace them.

## 3.9 Backgrounds

| Surface | Token |
|---------|-------|
| Canvas | `--prima-bg` `#F4F5F7` |
| Cards / workspace | `--prima-surface` `#FFFFFF` |
| PRIMA panel | `--prima-panel` `#FAFBFC` |

## 3.10 Spacing philosophy

**Air is a feature.** Prefer one more spacing step over one more control. 8px grid only.

---

# CHAPTER 4 — The Face of PRIMA

**AI interaction behaviour:** [Design Book Ch.9 — PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)

## 4.1 Forbidden

Human avatars · cartoons · robots · animated mascots · ChatGPT-style bubbles as brand.

## 4.2 Chosen presence: Guiding Star (Compass Light)

Two soft diamonds (compass rose) with a warm center pulse.

| Attribute | Spec |
|-----------|------|
| Meaning | Direction · light · quiet intelligence |
| Geometry | Dual 45° rounded squares + center disc |
| Colors | Primary blue diamond · white inner · amber core |
| Pulse | 2.4s opacity 0.55→1→0.55 (respect `prefers-reduced-motion`) |
| Sizes | 18 / 20 / 24 / 28 / 36 / 48 |

## 4.3 Placement

| Place | Size | Pulse |
|-------|------|-------|
| PRIMA panel header | 24 | On |
| Mobile FAB | 18 | Off |
| Suggestions | 20 | Off |
| Empty / waiting | 36 | On |

## 4.4 Recognition test

With the word “PRIMA” removed, teachers still identify the partner panel by the mark within 2 seconds.

**Implementation:** `src/design-system/PrimaMark.tsx`

---

# CHAPTER 5 — Design System

Runtime tokens: `src/styles/prima-design-tokens.css` (authoritative values).

## 5.1 Grid

8px base. Columns: fluid content + fixed PRIMA 360–400px. Max content width inside workspace: **960–1040px** for reading; full fluid for editors.

## 5.2 Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80` → `--space-1`…`--space-8`

## 5.3 Radius

| Token | px | Use |
|-------|-----|-----|
| sm | 10 | Inputs, chips |
| md | 16 | Inner cards |
| lg | 24 | Sections, panels |
| full | 999 | Buttons, status |

## 5.4 Elevation

| Level | Use |
|-------|-----|
| none | Flat panel chrome |
| soft | Default cards |
| hover | Interactive cards |

No multi-layer neon shadows.

## 5.5 Borders

Prefer `ring-1` with `--prima-border` (rgba 15,23,42,0.08). Avoid 1px solid gray stacks.

## 5.6 Typography

Max **three sizes** on screen at once.

| Role | Size | Weight |
|------|------|--------|
| Title | 24–28px | 600 |
| Body | 15–16px | 400 |
| Meta | 12–13px | 500 |

Font: Inter / system sans (platform standard). High contrast body. Sentence case Romanian.

## 5.7 Color palette

| Role | Hex | Token |
|------|-----|-------|
| Primary Blue | `#2563EB` | `--prima-primary` |
| Primary Hover | `#1D4ED8` | `--prima-primary-hover` |
| Secondary Green | `#059669` | `--prima-secondary` |
| Accent Amber | `#D97706` | `--prima-accent` |
| Danger Soft | `#DC2626` on `#FEF2F2` | `--prima-danger*` |
| Background | `#F4F5F7` | `--prima-bg` |
| Surface | `#FFFFFF` | `--prima-surface` |
| Text | `#0F172A` | `--prima-text` |
| Muted | `#64748B` | `--prima-text-muted` |

**No purple brand accents** in product UI.

## 5.8 Core UI families

Buttons · Cards · Forms · Editors · Sidebar (PRIMA) · Timeline · Tables (rare) · Dialogs (rare) · Notifications · Badges · Tags · Status — all documented in Chapter 7 and implemented under `src/design-system/`.

---

# CHAPTER 6 — Layout Rules

**Zone grammar:** [Design Book Ch.2 — PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) (Primary · Secondary · Context · Reflection · PRIMA).

## 6.1 Shell (canonical)

`TeachingShell`: header strip · left workspace · right PRIMA (sticky, independent scroll).

## 6.2 Page templates

| Template | Use | Structure |
|----------|-----|-----------|
| **Desk** | Biroul meu | Single column greeting + lists; PRIMA insights |
| **Conversation** | Guided dialogue | Main dialogue · living plan reflection · PRIMA reply |
| **Editor** | Proiectul lecției / material | 70% editable sections · 30% summary; PRIMA tips |
| **Workspace** | Materials preparation | Catalog · canvas · inspector; PRIMA quality notes |
| **Wizard** | Rare multi-step | One question/step; progress meta; PRIMA calm |
| **Library** | Browse/reuse | Search · filters · list/grid; PRIMA optional |
| **Viewer** | Read-only preview | Content focus; export actions |
| **Settings** | Preferences | Simple form groups; no PRIMA required |

## 6.3 Responsive

**Full guide:** [Design Book Ch.8 — Responsive & Adaptive Experience](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)

| Breakpoint | Behavior |
|------------|----------|
| ≥1280 | Full shell, PRIMA 380px |
| 768–1279 | Adaptive; PRIMA may collapse to drawer |
| <768 | Reading/review; limited edit; PRIMA bottom sheet |

## 6.4 Sticky areas

- PRIMA panel (desktop)  
- Lesson summary (in project editor)  
- Primary CTA footer on mobile  

## 6.5 Margins & whitespace

Workspace padding: 24–32px desktop · 16px mobile. Section gap: 24px. Never pack more than one primary idea per viewport section.

## 6.6 Visual hierarchy

1. Lesson / task title  
2. Educational content  
3. Primary action  
4. Secondary actions  
5. Meta / chrome  

---

# CHAPTER 7 — Components

**Pedagogical catalog (assembly law):** [Design Book Ch.3 — PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md)

Living library: `/design-system` · `src/design-system/` (Level 2 universals → expand to Level 3 pedagogical).

For each component: **Purpose · States · Behavior · Spacing · A11y · Examples · Rules · Anti-patterns.**

### 7.1 Button (`PrimaButton`)

| | |
|--|--|
| Purpose | Teacher actions |
| Variants | primary · secondary · ghost · danger |
| States | default · hover · active · disabled · loading |
| Behavior | min-height 40px · scale 0.98 on press · 220ms |
| Spacing | px-5 py-2.5 · gap-2 for icon |
| A11y | focus ring primary · disabled not focus-trapped |
| Rules | One primary per view · labels = verbs teachers say |
| Anti-patterns | “Submit/Generate/Execute” · multiple primaries |

### 7.2 Card (`PrimaCard`)

Purpose: group one idea. States: resting · hover (if interactive). Soft shadow. Padding sm/md/lg. Anti-pattern: cards inside cards for decoration.

### 7.3 Accordion / Editable section

Purpose: collapse lesson sections. Expand 200–250ms. Keep header always visible. Anti-pattern: nested accordions.

### 7.4 Timeline

Purpose: lesson flow / version history. Vertical line · nodes · move up/down. Smooth reorder 200ms.

### 7.5 Lesson Card

Purpose: recent lesson on desk. Shows subject · grade · topic · status · continue. Entire card clickable. No stats overload.

### 7.6 Teacher Note

Soft amber/slate note surface for pedagogical asides. Never alarm red for notes.

### 7.7 Suggestion Card (`FloatingSuggestion`)

PRIMA adaptive tip. Accept / dismiss. One at a time. Never modal.

### 7.8 Summary Card

Sticky lesson facts + primary CTA. Used in Proiectul lecției.

### 7.9 Notification / Toast

Transient · bottom or top-center · auto-dismiss 2.4–4s · no stack spam.

### 7.10 Loading (`LoadingBlock`)

Pulse blocks + educational label (*Pregătim…*). Never bare “Loading…”.

### 7.11 Empty State (`EmptyState`)

Copy: *Poți completa această secțiune acum sau mai târziu.* CTA: *Adaugă informații*.

### 7.12 Toolbar

Compact · icon+label · right-aligned secondary actions. Avoid floating toolbars over content on desktop.

### 7.13 Search / Filter

Single search field; filters as quiet chips. Results count in teacher language.

### 7.14 Context Menu

Sparse · educational actions only · keyboard accessible.

### 7.15 Floating Action

Only mobile PRIMA opener (mark + “PRIMA”). No competing FABs.

### 7.16 Status Badge (`StatusBadge`)

saved · syncing · attention · neutral. Color + text.

### 7.17 Dialog

Rare. Confirm destructive actions only. Prefer inline recovery.

### 7.18 PrimaMark / PrimaPanel / TeachingShell

See DESIGN-001 + Chapters 2 & 4.

---

# CHAPTER 8 — Interaction Design

**Full motion language:** [Design Book Ch.6 — Motion & Interaction System](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)

## 8.1 Pointer & keyboard

| Event | Behavior |
|-------|----------|
| Hover | Elevation or soft bg · ≤150ms |
| Focus | 2px primary ring · offset 2px |
| Click | Intentional; no double-submit on primary |
| Edit | Inline; autosave debounced ~400ms |
| Autosave | Status: *Se salvează...* → *✓ Salvat automat* |
| Undo / Redo | Ctrl/Cmd+Z · Ctrl/Cmd+Shift+Z |
| Expand / Collapse | 200–250ms ease-out |
| Drag & Drop | Preview ghost · 200ms settle |
| Timeline edit | Move up/down buttons + drag where available |

## 8.2 Motion timing

| Token | Value | Use |
|-------|-------|-----|
| micro | 120–150ms | Press, hover |
| standard | 200–250ms | Expand, panel |
| enter | 220ms | Suggestion fade+rise |
| pulse | 2400ms | Mark only |

Easing: ease-out for enter · ease-in-out for pulse.  
Curves never bounce.

## 8.3 Loading

Prefer skeletons over spinners. Progress overlay only for multi-second material preparation.

## 8.4 Success

Quiet confirmation (badge / toast). Never confetti.

## 8.5 Error recovery

Soft surfaces · no “Error/Invalid/Required” · offer next step · preserve work.

## 8.6 Adaptive assistance

PRIMA observes workspace mutations → emits at most one suggestion → teacher accepts/dismisses → optional apply.

---

# CHAPTER 9 — Teacher Journeys

**Workflow grammar:** [Design Book Ch.4 — Experience Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md)  
**Full journey library:** [Design Book Ch.5 — Teacher Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)

## 9.1 New teacher

| | |
|--|--|
| Goals | Prepare first lesson without training |
| Questions | Where do I start? Will I lose work? |
| Pain | Fear of AI tools · time pressure |
| Emotions | Cautious → relieved → confident |
| Flow | Desk → Conversation → Project → Materials → Desk |
| Decisions | Accept PRIMA suggestions · select materials |
| Exit | Export or return to desk with saved lesson |

## 9.2 Experienced teacher

| | |
|--|--|
| Goals | Fast iteration on known lesson patterns |
| Questions | Can I skip talk and edit the project? |
| Pain | Re-entering context |
| Emotions | Efficient · slightly impatient |
| Flow | Desk recent → Project edit → Materials refresh |
| Decisions | Skip conversation when project exists |
| Exit | Library reuse |

## 9.3 Primary teacher

| | |
|--|--|
| Goals | Age-appropriate activities · clear duration |
| Pain | Differentiation for mixed ability |
| Flow | Conversation emphasizing grade → Project activities → Remedial material suggestion |
| Emotions | Cared-for · not overwhelmed |

## 9.4 Mentor

| | |
|--|--|
| Goals | Review a colleague’s lesson project |
| Flow | Open shared project (future) → Viewer/Editor read · comments (reserved) |
| Emotions | Constructive · clear structure |

## 9.5 School principal

| | |
|--|--|
| Goals | Understand adoption · not edit pedagogy |
| Flow | Desk overview (future analytics light) · Library browse |
| Pain | Admin dashboards |
| Design | Keep them out of lesson editors unless invited |

---

# CHAPTER 10 — Accessibility

**Full guide:** [Design Book Ch.7 — Accessibility & Inclusive Design](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)

| Area | Requirement |
|------|-------------|
| Typography | Body ≥15px · line-height ≥1.5 · max ~75ch |
| Contrast | WCAG AA minimum for text/icons |
| Keyboard | All actions reachable · visible focus · Escape closes sheets |
| Screen readers | `aria-label="PRIMA"` on panel · live regions for autosave |
| Touch | Targets ≥40×40px |
| Color independence | Status uses text + color |
| Error prevention | Confirm destructive · autosave · undo |
| Reading comfort | Warm gray canvas · reduce motion respected |
| Language | Clear Romanian; no jargon |

---

# CHAPTER 11 — UX Validation

## 11.1 Five-Second Test (mandatory)

Every screen must answer within five seconds:

1. Where am I?  
2. What am I doing?  
3. What is my next action?  
4. Can I continue safely?  

If unclear → redesign before implementation.

## 11.2 Heuristics checklist

| Law / Heuristic | Application |
|-----------------|-------------|
| Nielsen | Visibility of status · match real world (teaching) · user control · consistency · error prevention · recognition · flexibility · aesthetic minimalism · help via PRIMA |
| Jakob’s Law | Familiar desk/document patterns · not novel AI chrome |
| Hick’s Law | One primary CTA · progressive disclosure |
| Fitts’s Law | Large primary · sticky actions on mobile |
| Progressive Disclosure | Collapse advanced sections |
| Recognition over Recall | Show lesson context always |
| Cognitive Load | One idea per section · PRIMA one question |

## 11.3 Gate

QA / Design review: attach Five-Second answers + heuristic pass/fail before merge of any new surface.

---

# CHAPTER 12 — High-Fidelity Mockup Contracts

These contracts are implementation-ready. Visual QA against `/design-system` tokens.

### 12.1 Teacher Desk

**Full visual constitution:** [Design Book Ch.11 — Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [HOME-001](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) · [Ch.1–10](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md)

```
[Header: PrimaMark · Biroul meu]
[Greeting title]
[One sentence purpose]
[Primary: Creează un proiect de lecție]
[Continue working — ≤3 Lesson Cards]
| PRIMA: daily insight · continue tip |
```

### 12.2 Conversation

```
[Header: lesson crumbs · autosave]
[PRIMA structured reply blocks]
[Teacher writing area · Continuă]
[Living plan reflection (canvas)]
| PRIMA: same conversation presence |
```

### 12.3 Lesson Project / Designul lecției (FEATURE-001)

**Full visual constitution:** [Design Book Ch.12 — Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md) · [LESSON-001](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) · [Ch.1–10](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md)

```
[Header: Breadcrumb · Title · ✓ Salvat · Version · Design Score · Modes]
[LEFT: Lesson Structure navigator]
[CENTER: Design Canvas — Pedagogical Blocks]
[RIGHT: PRIMA Intelligence — Score · ≤3 tips · warnings]
[Floating: Add Activity · Undo/Redo — as needed]
[Primary when ready: Creează materialele]
```

### 12.4 Lesson Materials

```
[Header: Pregătirea materialelor]
[Catalog | Preview canvas | Details]
| PRIMA: quality / alignment notes |
```

### 12.5 Resource Editor

```
[Structure nav | Editing surface | Details]
| PRIMA: alignment warnings as suggestions |
```

### 12.6 Library

```
[Search · filters]
[Resource list]
| PRIMA optional: reuse tip |
```

### 12.7 Export

```
[Preview]
[Format actions]
[Success: calm confirmation]
```

### 12.8 Settings

```
[Simple grouped preferences]
[No marketing · no AI settings jargon]
```

---

# CHAPTER 13 — Implementation Rules

## 13.1 Naming

| Layer | Convention |
|-------|------------|
| UI copy | Romanian educational (UX-002) |
| Components | `Prima*` / design-system exports |
| CSS vars | `--prima-*` · `--space-*` · `--radius-*` |
| Features | domain folders; no “AI/Engine” in user routes |

## 13.2 Component hierarchy

```
TeachingShell
 ├─ Header
 ├─ Workspace (feature content)
 └─ PrimaPanel
      ├─ presence (mark)
      ├─ conversation / insights
      └─ FloatingSuggestion?
```

## 13.3 Design tokens

Never hardcode hex in features. Import from `prima-design-tokens.css` / Tailwind `@theme` prima colors.

## 13.4 Reusable patterns

- Autosave status strip  
- EmptyState + Adaugă informații  
- Soft error banner  
- Summary + primary CTA  
- Adaptive suggestion  

## 13.5 Spacing & responsive

Use scale tokens only. Follow Chapter 6 breakpoints.

## 13.6 Scalability

New material types reuse Workspace template + same PRIMA panel behaviors. New features must not invent new chrome systems.

## 13.7 Change control

1. Propose change against DESIGN-002  
2. Update DESIGN-001 runtime if tokens/components change  
3. Update showcase  
4. Only then implement feature UI  

---

# Product quality standard

> Within five seconds a teacher knows where they are, what they are doing, what to do next, and that it is safe to continue.

---

# Definition of Done

| Criterion | Status |
|-----------|--------|
| Complete visual identity | ✓ Chapter 3–4 |
| Recognizable symbolic presence | ✓ Guiding Star |
| Same design language every screen | ✓ Chapters 5–6 |
| Components documented | ✓ Chapter 7 |
| Interactions standardized | ✓ Chapter 8 |
| Journeys documented | ✓ Chapter 9 |
| Accessibility & validation gates | ✓ Chapters 10–11 |
| Mockup contracts | ✓ Chapter 12 |
| Implementation rules | ✓ Chapter 13 |
| Future features build from this spec | ✓ Change control |

**DESIGN-002 is the permanent design reference for the PRIMA platform.**  
**DESIGN-001 is the executable design system that implements it.**
