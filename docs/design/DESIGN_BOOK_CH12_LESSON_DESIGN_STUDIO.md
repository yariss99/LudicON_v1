# PRIMA Design Book — Chapter 12  
# Lesson Design Studio  
## UI Name: Designul lecției

Version: 1.0  
Status: Critical — Emotional Center of PRIMA  
Priority: Highest  
Audience: Product · UX · UI · Frontend · QA  
Last Updated: July 2026

**Screen ID:** LESSON-001 · [Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Canon:** [DOCUMENT-000 Manifesto](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1–10 Design Book](./README.md) · [DESIGN-002](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md) · [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md)  
**Product:** [FEATURE-001 Lesson Blueprint Studio](../engineering/FEATURE-001_LESSON_BLUEPRINT_STUDIO.md) · PIE [FEATURE-003](../engineering/FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md) · POM [FEATURE-002](../engineering/FEATURE-002_PEDAGOGICAL_OBJECT_MODEL.md)  
**Voice:** UX-001 / UX-002  
**Routes (target):** `/blueprint/review/:blueprintId` · future alias `/design/:lessonId`  
**Runtime (current):** `src/features/lesson-blueprint/` — migrate toward this chapter when UI diverges  
**UI label (RO):** Designul lecției · (product synonym: Proiectul lecției)

---

# 0. Objective

Design the **central creative environment** of PRIMA — where an educational idea becomes a complete learning experience.

| This is | This is not |
|---------|-------------|
| An architectural design studio for lessons | Word / Google Docs |
| A place where lessons grow organically | Moodle forms / plan templates |
| Structured design blocks on a canvas | A blank document |
| Teacher as author · PRIMA as partner | AI chatbot · auto-fill wizard |

**Philosophy:** A lesson is **designed**. Not written. Not generated. Not “completed.”

**Emotion target:** *“I am creating.”* — not *“I am filling paperwork / editing a doc / talking to AI.”*

---

# 1. UX rationale

## 1.1 Why not a document editor

Document tools optimize for continuous prose and page layout. Lesson design optimizes for **pedagogical structure**: objectives ↔ activities ↔ assessment ↔ time ↔ differentiation.

Forms and templates force compliance. The Studio instead:

- Centers a **Design Canvas** of pedagogical blocks  
- Lets structure evolve (move · merge · split · annotate)  
- Surfaces intelligence only in context (right panel)  
- Keeps the teacher’s authorship visible at every step  

## 1.2 Focus contract

On entry, attention lands on:

1. **One lesson**  
2. **One idea** (title / topic)  
3. **One objective** (or the block currently in view)  

Everything else — collections, publishing, account — fades into chrome.

## 1.3 Design principles (normative)

| Principle | Studio implication |
|-----------|-------------------|
| Teacher First | Teacher edits blocks; PRIMA never overwrites silently |
| Calm Interface | Soft elevation, muted status, no urgency chrome |
| Large White Space | Canvas breathing room; blocks never packed edge-to-edge |
| Progressive Disclosure | Block fields expand on focus; navigator collapses |
| Focus Mode | Canvas-only; panels hide |
| One Primary Action | Context-dependent: continue design / Creează materialele when ready |
| Invisible AI | Right rail = intelligence, not chat |
| Pedagogy Before Technology | Navigator labels are pedagogical sections, not “modules” |

## 1.4 Anti-patterns (forbidden)

- Page-sized form with required red asterisks  
- Infinite chat column as the main workspace  
- Fixed A4 “lesson plan” preview as the edit surface  
- Saturated progress bars that feel like grading the teacher  
- Modal stacks for every suggestion  
- Word-processor ribbon of 40 tools  

---

# 2. Information architecture

```
Designul lecției
├── Top navigation (global)
│   ├── Logo → Biroul meu
│   ├── Quick search (lesson-scoped)
│   ├── Notifications (quiet)
│   └── Profile
├── Breadcrumb + lesson meta strip
│   ├── Home → Collections → Lesson
│   ├── Lesson title (inline edit)
│   ├── Autosave status
│   ├── Version
│   ├── Design Score (compact)
│   └── Mode switcher (Focus · Review · Presentation · Print)
├── Three-column workspace
│   ├── LEFT — Lesson Structure (navigator)
│   ├── CENTER — Design Canvas
│   └── RIGHT — PRIMA Intelligence
├── Floating action cluster (contextual)
└── Empty / Loading / Error overlays
```

### Entry / exit

| Entry | Exit / continue |
|-------|-----------------|
| After conversation (auto-open) | Creează materialele → materials / UPE |
| Desk “Continuă” | Publish / export (FEATURE-005) |
| Template / curriculum start | Return → Biroul meu |
| Import existing | Reflection (FEATURE-006) after teach |

### Feature relationships

| Studio region | Owner |
|---------------|-------|
| Canvas blocks · structure | FEATURE-001 + POM objects when materials spawn |
| Design Score · recommendations | FEATURE-003 PIE |
| Resources / templates entry | FEATURE-007 KHPM |
| Publication section | FEATURE-005 PDE |
| Reflection section | FEATURE-006 RPTI |
| Differentiation signals | FEATURE-008 SLI (when class context linked) |

---

# 3. Wireframe — complete page layout

## 3.1 Full workspace (Review Mode — default)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ★ PRIMA          [ Caută în lecție… ]                    [🔔] [Profil]     │
├────────────────────────────────────────────────────────────────────────────┤
│ Biroul meu  ›  Colecții  ›  Matematică                                     │
│ Fracții echivalente          ✓ Salvat acum · v3 · Scor 92                  │
│ [Focus] [Review] [Prezentare] [Print]                                      │
├──────────────┬─────────────────────────────────────┬───────────────────────┤
│ STRUCTURĂ    │  DESIGN CANVAS                      │  PRIMA                │
│              │                                     │                       │
│ ○ General    │  ┌─ Lesson Context ─────────────┐   │  Scor design  92      │
│ ● Obiective  │  │ Purpose · 5' · …             │   │  ─────────────        │
│ ○ Secvență   │  └──────────────────────────────┘   │  Curriculum    100    │
│ ○ Activități │  ┌─ Opening Activity ───────────┐   │  Activități     92    │
│ ○ Resurse    │  │ …                            │   │  Evaluare       94    │
│ ○ Evaluare   │  └──────────────────────────────┘   │  Diferențiere   87    │
│ ○ Reflecție  │  ┌─ Discovery ──────────────────┐   │  Timp      Excelent   │
│ ○ Publicare  │  │ …                            │   │  Accesibilitate 96    │
│              │  └──────────────────────────────┘   │                       │
│ [«] collapse │  [ + Adaugă secțiune ]              │  Recomandări (≤3)     │
│              │                                     │  Avertismente         │
│              │                                     │  Alternative          │
│              │                                     │  Coerență · Aliniere  │
└──────────────┴─────────────────────────────────────┴───────────────────────┘
                              [ ⟲ ⟳ ] [ + Activitate ]   ← floating, as needed
```

## 3.2 Focus Mode

Left + right panels hidden. Canvas full width. Escape or mode chip restores Review Mode. PRIMA presence reduced to Guiding Star corner with pulse if critical warning exists.

## 3.3 Presentation Mode

Read-optimized overview of the lesson (section titles + times + objectives). Editing chrome off. Suitable for walkthrough with a colleague.

## 3.4 Print Preview

Single-column pedagogical summary; no panels; export-friendly typography.

---

# 4. Grid · spacing · columns

| Token | Value |
|-------|-------|
| Base grid | 8px |
| Shell max | 100% viewport · content not capped like Desk (studio is immersive) |
| Left navigator | 240–280px · collapses to 48px icon rail |
| Center canvas | Fluid · **max reading width per block 720px** centered in column |
| Right PRIMA | 320–380px (`--prima-panel-width`) sticky |
| Horizontal gap | 16–24px between columns |
| Block gap | 16–24px |
| Page padding | 16–24px |
| Section gap inside block | 12–16px |

### Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| Desktop | ≥1440 | Full three columns |
| Laptop | 1024–1439 | Collapsible left/right; default both open if width ≥1280 |
| Tablet | 768–1023 | Stack: canvas top; structure + PRIMA as drawers |
| Mobile (future) | <768 | Read-only overview + quick field edit; no DnD |

---

# 5. Component inventory

Prefer DESIGN-001 primitives (`TeachingShell`, `PrimaMark`, `PrimaPanel`, `PrimaButton`, `PrimaCard`, `StatusBadge`, `EmptyState`, `FloatingSuggestion`, `LoadingBlock`).

| Component | Role |
|-----------|------|
| `StudioTopNav` | Global chrome — minimal |
| `StudioBreadcrumb` | Home › Collections › Lesson |
| `StudioMetaStrip` | Title · autosave · version · compact Design Score · modes |
| `LessonNavigator` | Left structure with completion + validation |
| `NavigatorItem` | Label · status dots · jump target |
| `DesignCanvas` | Scrollable block stack |
| `PedagogicalBlock` | Design unit (see §5.1) |
| `BlockToolbar` | Move · duplicate · merge · split · collapse · annotate |
| `BlockFieldGroup` | Purpose · time · objective · competency · strategy · resources · notes |
| `CanvasDropIndicator` | Line between blocks during DnD |
| `FloatingActionCluster` | Add Activity · Add Assessment · Undo/Redo · Search |
| `PrimaIntelligencePanel` | Design Score + contextual insights |
| `DesignScoreMeter` | Overall + dimensions — explanatory, non-judgmental |
| `RecommendationList` | ≤3 contextual tips · Aplică / Nu acum |
| `WarningList` | Amber, calm, actionable |
| `StudioEmptyState` | First paint of empty lesson |
| `StudioSkeleton` | Soft block placeholders |
| `ModeSwitcher` | Focus · Review · Presentation · Print |

### 5.1 PedagogicalBlock anatomy

```
┌──────────────────────────────────────────────────────────┐
│ ≡  Opening Activity                    5'  ·  ● Proiect  │
│ Purpose: Activează cunoștințele anterioare               │
│ Objective ↔ Competency chips                             │
│ Strategy · Resources · Notes (progressive)               │
│ Status · [ Suggestions ▾ ]                               │
└──────────────────────────────────────────────────────────┘
```

**Canonical fields (every block may show a subset):**

| Field | Notes |
|-------|-------|
| Title | Required · editable inline |
| Purpose | Why this block exists pedagogically |
| Estimated time | Minutes · feeds Time Balance |
| Learning objective | Link or inline |
| Competency mapping | Chips from lesson competencies |
| Teaching strategy | Short prose or tags |
| Resources | Links / planned materials |
| Notes | Teacher private notes |
| Status | Draft · Ready · Needs attention |
| Suggestions | PRIMA tips scoped to this block |

**Block operations:** Move · Duplicate · Merge · Split · Collapse · Expand · Annotate · Reorder (DnD).

### 5.2 Lesson Navigator sections

| Id | Label (RO) | Maps to |
|----|------------|---------|
| general | Informații generale | Context |
| competencies | Competențe | Competencies |
| objectives | Obiective de învățare | Goals |
| sequence | Secvența de învățare | Timeline structure |
| activities | Activități | Activity blocks |
| resources | Resurse | Materials intents |
| assessment | Evaluare | Assessment |
| reflection | Reflecție | Teacher / learner reflection |
| publication | Publicare | PDE readiness |

Each item shows: **completion** (empty / partial / complete) · **validation** (ok / warn / error) · click → scroll/focus canvas section.

---

# 6. Interaction model

| Interaction | Spec |
|-------------|------|
| Enter studio | Focus lesson title if empty; else last-edited block |
| Navigate left | Smooth scroll canvas to section · highlight 400ms |
| Edit block field | Autosave debounce 600–800ms · status → “Salvat” |
| Drag block | Elastic follow · drop indicator · commit on release |
| Duplicate | Insert below · soft flash |
| Merge | Confirm quiet dialog only if content loss risk |
| Split | New sibling block with half fields where sensible |
| Collapse nav | Persist preference in local studio state |
| Recommendation Aplică | Patch block/fields · explain in PRIMA (“Am actualizat…”) |
| Nu acum | Dismiss with fade; may resurface later |
| Undo / Redo | Ctrl/Cmd+Z / Shift+Z · also floating |
| Focus Mode | `F` shortcut optional · Escape exits |
| Primary when ready | **Creează materialele** (FEATURE-001 gate) |

### States matrix

| State | Canvas | PRIMA | Meta |
|-------|--------|-------|------|
| Normal | Editable blocks | Contextual | Autosave idle |
| Hover block | Soft elevation | — | — |
| Focus field | Ring · expanded fields | Tips for field | — |
| Dragging | Ghost + indicator | Dimmed | — |
| Loading | Skeleton blocks | Pulse soft | “Se încarcă…” |
| Empty (new) | Empty state CTA set | Welcome tip | No score yet |
| Saving | — | — | Subtle check anim |
| Validation warn | Amber edge on block | Warning list | Score dips calmly |
| Error | Muted red edge | Clear next step | Retry |
| Offline | Local badge | Tips paused | “Offline — se sincronizează” |
| Focus Mode | Full bleed | Star only | Minimal strip |
| Review Mode | + both panels | Full | Default |
| Presentation | Read overview | Hidden/optional | Modes only |

---

# 7. Motion specification

| Motion | Duration | Easing | Use |
|--------|----------|--------|-----|
| Hover elevate | 150ms | ease-out | Blocks · buttons |
| Drag | Track pointer | elastic ease | Block reorder |
| Autosave check | 200ms | ease-out | Meta strip |
| Validation highlight | 280ms | ease-out | Block edge |
| Recommendation pulse | 2400ms loop | ease-in-out | Gold tip · only if unread |
| Panel collapse | 220ms | ease-out | Navigator / PRIMA |
| Mode transition | 200ms | ease-out | Crossfade chrome |
| Reduced motion | ≤1ms / no loop | — | Honor preference |

**Allowed:** soft rise, fade, elastic drag within 8–12px overshoot max.  
**Forbidden:** bounce CTAs, confetti on score, typing AI “thinking” theater, parallax canvas.

---

# 8. Accessibility review

| Area | Requirement |
|------|-------------|
| Keyboard | Tab through navigator → blocks → PRIMA actions; arrows reorder with modifier |
| Screen reader | Landmarks: `navigation`, `main` (canvas), `complementary` (PRIMA); block titles as headings |
| DnD alternative | Move up/down buttons in BlockToolbar always available |
| Contrast | AA body on warm white; status not color-only (icons + text) |
| High contrast | Stronger borders; score meters use patterns + labels |
| Large text | Layout reflows; panels may stack earlier |
| Reduced motion | No pulse; instant panel toggle |
| Focus visible | 2px ring primary/emerald per control role |
| Language | Romanian educational (UX-002) |
| Judgement | Design Score announced as support metrics, never “fail” |

---

# 9. High-fidelity visual description

## 9.1 Color philosophy (studio surface)

Studio uses a **calm creative palette**. Map to tokens (extend DESIGN-001 if missing):

| Role | Intent | Token / value |
|------|--------|----------------|
| Canvas | Warm white | `--studio-canvas` → `#FAFAF7` (or `--prima-surface` warmed) |
| Navigation / chrome | Soft gray | `--prima-bg` `#F4F5F7` |
| Primary design action | Emerald | `--studio-primary` `#059669` |
| Recommendations | Gold | `--studio-recommend` `#CA8A04` |
| Warnings | Amber | `--prima-accent` / `#D97706` |
| Errors | Muted red | `--prima-danger` soft `#B91C1C` at 90% |
| Text | Near ink | `--prima-text` `#0F172A` |
| Muted | — | `--prima-text-muted` `#64748B` |

**Rules:**

- No saturated neo-bright colors  
- Global product chrome (Desk) may keep educational blue; **inside Designul lecției**, emerald marks design commitment  
- Gold only for recommendation accents / Guiding Star pulse — never large fills  
- Score meters: soft emerald fills; never traffic-light red for “low” dimensions — use amber + explanatory copy  

## 9.2 Typography

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Lesson title | 28–32px | 600 | Meta strip or canvas hero |
| Block title | 18–20px | 600 | |
| Body / purpose | 15–16px | 400 | line-height 1.55–1.65 |
| Meta / time | 12–13px | 500 | muted |
| PRIMA panel title | 14–16px | 600 | |

Comfortable reading width inside blocks ≤720px. Strong hierarchy · minimal noise · sentence-case RO.

## 9.3 Elevation · radius · borders

- Blocks: `--radius-lg` · `--shadow-soft` · hover `--shadow-hover`  
- Navigator: flat or hairline; no heavy card stack  
- PRIMA panel: `--prima-panel` background · independent scroll  
- Borders: `rgba(15,23,42,0.08)` rings preferred over hard gray  

## 9.4 Design Score (always visible)

Compact in meta strip; expanded in PRIMA panel.

| Dimension | Example |
|-----------|---------|
| Overall Quality | 95% |
| Curriculum | 100% |
| Activities | 92% |
| Assessment | 94% |
| Differentiation | 87% |
| Time Balance | Excellent |
| Accessibility | 96% |

**Copy tone:** *“Scorul te ajută să vezi echilibrul lecției — nu este o notă.”*  
Each dimension expands to one plain-language explanation (PIE). Never judges. Always supports.

## 9.5 Empty state

Not a blank page.

**Prompt:** *Ce experiență de învățare vrei să proiectezi azi?*

**Offers (secondary cards / list):**

1. Pornește din curriculum  
2. Pornește din șablon  
3. Pornește dintr-o idee  
4. Continuă o lecție anterioară  
5. Importă o lecție existentă  

## 9.6 Floating actions (only when needed)

Visible near canvas bottom-center or selection:

- Adaugă activitate  
- Duplică blocul  
- Adaugă evaluare  
- Adaugă resursă  
- Undo · Redo  
- Căutare rapidă  

Hide when Focus Mode + no selection, or when they would cover the active field.

## 9.7 PRIMA Intelligence panel content

Only **contextual** information:

- Design Score (+ explanations)  
- Recommendations (≤3)  
- Warnings  
- Alternative ideas  
- Time estimation  
- Pedagogical coherence  
- Accessibility  
- Differentiation  
- Curriculum alignment  
- Teacher preferences (when relevant)  

**Not chat. Not assistant window. Educational partner.**  
Guiding Star mark at panel header; subtle gold pulse when new recommendations exist.

## 9.8 Canonical RO labels (selection)

| Slot | Copy |
|------|------|
| UI name | Designul lecției |
| Autosave ok | Salvat |
| Autosave saving | Se salvează… |
| Primary ready | Creează materialele |
| Add block | Adaugă secțiune |
| Add activity | Adaugă activitate |
| Empty prompt | Ce experiență de învățare vrei să proiectezi azi? |
| Score help | Te ghidează — nu te evaluează. |
| Offline | Lucrezi offline — modificările se vor sincroniza. |

---

# 10. Implementation notes

## 10.1 Preferred composition

```tsx
<TeachingShell
  header={<StudioTopNav />}
  prima={mode !== "focus" ? <PrimaIntelligencePanel /> : <PrimaPresenceCompact />}
>
  <StudioMetaStrip />
  <div className="studio-columns">
    {showNav && <LessonNavigator />}
    <DesignCanvas />
  </div>
  <FloatingActionCluster />
</TeachingShell>
```

## 10.2 Data & engines

| Concern | Source |
|---------|--------|
| Document model | `BlueprintReviewDocument` + studio extensions (FEATURE-001) |
| Block operations | Local studio state → persisted blueprint sections |
| Design Score / tips | `analyzeLessonDesign` / PIE (FEATURE-003) |
| Materials CTA | `approveForTeachingMaterials` gate |
| Search in lesson | Client filter + KHPM for external resources |

## 10.3 Tokens

Add studio semantic variables to `prima-design-tokens.css` if absent:

```css
--studio-canvas: #fafaf7;
--studio-primary: #059669;
--studio-recommend: #ca8a04;
```

Do not hardcode hex in feature components.

## 10.4 Migration from current `lesson-blueprint`

Current UI: editable cards + sticky summary + blue **Creează materialele**. Target:

1. Reframe as three-column **Designul lecției** (navigator · canvas · PRIMA)  
2. Promote timeline/activities into **PedagogicalBlock** canvas metaphor  
3. Replace summary-only right column with **PRIMA Intelligence** + Design Score  
4. Emerald for studio primary actions; keep materials CTA as the readiness commitment  
5. Add Focus / Review / Presentation / Print modes  
6. Cap recommendations at 3; wire PIE explanations into score dimensions  
7. Empty state with five start paths  

Preserve: autosave, version history, undo/redo, generation gate, RO voice.

## 10.5 Distinction vs Universal Pedagogical Editor

| Surface | Purpose |
|---------|---------|
| **Designul lecției** (this chapter) | Design the **lesson** as a pedagogical experience |
| **UPE** (FEATURE-004) | Edit **individual pedagogical objects / materials** |

Do not merge these into one document metaphor.

## 10.6 QA checklist

- [ ] Does not feel like Word / Docs / Moodle form  
- [ ] One lesson focus on entry  
- [ ] Blocks reorderable with keyboard alternative  
- [ ] Design Score visible + self-explaining  
- [ ] ≤3 recommendations; no chat panel  
- [ ] Focus Mode hides panels  
- [ ] Empty state offers five paths  
- [ ] Autosave calm; offline clear  
- [ ] Reduced motion / AA contrast  
- [ ] Materials still Blueprint-gated  

---

# Success criteria

Teachers feel they are **creating** meaningful learning experiences.

Not completing paperwork.  
Not editing documents.  
Not talking to AI.

**Designul lecției becomes the emotional center of PRIMA.**
