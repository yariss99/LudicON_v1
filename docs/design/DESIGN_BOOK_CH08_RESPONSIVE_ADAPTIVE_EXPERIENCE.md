# PRIMA Design Book — Chapter 8  
# Responsive & Adaptive Experience

Version: 1.0  
Status: Core Platform Standard  
Priority: Critical  
Audience: Product · Design · Frontend · QA · Platform  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1–7](./README.md) ([Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) · [PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) · [PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) · [Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) · [Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) · [Motion](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md) · [Accessibility](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md))  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)  
**Tokens:** `src/styles/prima-design-tokens.css`

---

# 0. Objective

Design a **unified experience** that adapts intelligently to every device, screen size, and teaching context **without changing the teacher’s mental model**.

Teachers should never need to relearn PRIMA because they changed devices.

| Adapts | Remains identical |
|--------|-------------------|
| Presentation · density · chrome | Pedagogy · patterns · journeys · authorship |
| Layout · gestures | Mental model · terminology · decision logic |

### Authority

On layout/breakpoint conflict: **DB-CH08 > surface one-offs.**  
Still subordinate to DOCUMENT-000, DB-CH02 (zones), DB-CH07 (a11y), DB-CH05 (continuity).

---

# 1. Philosophy

| Concept | Meaning |
|---------|---------|
| **Responsive Design** | Changes **layout** |
| **Adaptive Experience** | Changes **behaviour** |
| **PRIMA** | Combines both |

The teacher always recognizes the platform.  
Only the presentation changes. **Never the logic.**

### Design principles

| Principle | Implication |
|-----------|-------------|
| Continuity over novelty | Same Create → Build → Review everywhere |
| Context over layout | Restore work state before rearranging chrome |
| Content before controls | Pedagogy visible; chrome collapses first |
| Pedagogy before pixels | Don’t drop objectives to keep a widget |
| One mental model | Multiple presentations |

---

# 2. Experience continuity

A lesson started on desktop can continue on laptop, tablet, or future mobile companion **without losing context**.

### Restore automatically

| State | Must restore |
|-------|----------------|
| Current lesson | Document identity |
| Current section | Navigator / block focus |
| Cursor / caret | When text editing |
| Open panels | Which zones were open (device-appropriate) |
| Selection | Selected block(s) |
| History | Undo stack where feasible |
| Unsaved work | Autosave / local draft |
| AI context | Same tips relevance · not a new “session personality” |
| Scroll position | Primary zone |

Aligns with [Journey continuity](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) · [Pattern 10 Recover](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md).

---

# 3. Device strategy

| Device | Role | Experience |
|--------|------|------------|
| **Desktop** | Primary design environment | Full experience · three-panel workspace · advanced editing · professional authoring |
| **Laptop** | Same experience | Adaptive spacing · collapsible side panels · optimized navigation |
| **Tablet** | Teaching companion | Touch-first · simplified workspace · contextual tools · Presentation mode · quick editing |
| **Future Mobile** | Professional companion — **not a replacement** | Review · Reflection · Quick edits · Search · Notifications · Voice notes · Approval · Publishing |

**Mobile never hosts full lesson authoring** (no complete Lesson Canvas DnD authoring). Hand off to laptop/desktop for deep Build.

---

# 4. Context modes

PRIMA adapts to **teaching situations** (behaviour), not only viewport width.

| Mode | Purpose | Behaviour |
|------|---------|-----------|
| **Planning Mode** | Full authoring | Rich interface · deep editing · all zones available per device |
| **Teaching Mode** | In-class delivery | Minimal chrome · timeline · resources · timer · teacher notes · **no distractions** |
| **Reflection Mode** | After teaching | Observations · evidence · adjustments · professional notes · immediate post-teach access |
| **Review Mode** | Quality / alignment | Curriculum alignment · assessment coverage · recommendations · professional analysis |
| **Presentation Mode** | Student-facing / board | Large typography · interactive board optimization · minimal controls · focus on students |

Mode switches **morph chrome** (Ch.6); document identity persists. Teacher chooses mode; AI does not force mode changes.

---

# 5. Adaptive layout rules

### Breakpoints (canonical)

| Name | Width | Layout |
|------|-------|--------|
| Large Desktop | ≥1440 | Three columns · persistent AI · persistent nav · full workspace |
| Desktop | 1280–1439 | Three columns; panels may start open |
| Laptop | 1024–1279 | Collapsible side panels · floating contextual actions · adaptive density |
| Tablet Landscape | 900–1023 (orient) | Two panels · gesture nav · touch optimization |
| Tablet Portrait | 768–899 | Single workspace · context drawer · bottom actions |
| Future Mobile | <768 | Single-column · focused tasks · progressive disclosure |

Exact px may track CSS `--bp-*` tokens; behaviour above is normative.

### Zone adaptation (PDL zones)

| Zone | Large Desktop | Laptop | Tablet | Mobile |
|------|---------------|--------|--------|--------|
| Primary | Dominant | Dominant | Full width | Full width |
| Secondary | Persistent | Collapsible | Drawer | Hidden → sheet |
| PRIMA | Persistent sticky | Collapsible / dock | Sheet / FAB | Bottom sheet |
| Context | Full meta | Compact meta | Compact | Minimal |
| Reflection | Below / strip | Strip | Sheet entry | Dedicated task |

**Content never jumps** when panels collapse — reserve or crossfade (Ch.6).

---

# 6. Adaptive information density

| Density | Behaviour |
|---------|-----------|
| **High Focus** | Essentials only (Focus Mode · Teaching Mode) |
| **Standard** | Balanced default |
| **Expert** | More information · shorter explanations |
| **Beginner** | More guidance · expanded descriptions · educational hints |

**Teacher controls preferred density** (settings + quick toggle). Never auto-lock to Beginner based on opaque “scores.”

---

# 7. Interaction changes by device

### Touch experience

| Spec | Value |
|------|-------|
| Min target | **44×44 px** ([Ch.7](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)) |
| Preferred | **48×48 px** on touch-first surfaces |
| Gestures | Drag · swipe · long-press context · pinch-zoom (canvas) · canvas pan |
| Rule | **Every gesture has an alternative** (buttons · keyboard) |

### Pointer (desktop/laptop)
Hover affordances allowed; never required for essential actions.

### Stylus (future)
Treat as precision pointer + palm rejection notes; same targets as touch preferred.

---

# 8. Offline experience

Teachers may work without internet.

| Capability | Spec |
|------------|------|
| Continue editing | Local document store |
| Autosave locally | Visible status |
| Queue sync | When online returns |
| Conflict resolution | Visual · teacher decides |
| Status | Clear offline badge (calm) |
| Rule | **Never lose work** |

Copy example: *Lucrezi offline — modificările se vor sincroniza.*

---

# 9. Synchronization rules

| Rule | Spec |
|------|------|
| Style | Automatic · silent · transparent when clean |
| Conflicts | Visual diff / choice — **teacher decides** |
| History | Version history preserved |
| Multi-device | Last-write with merge hints · no silent clobber of teacher prose |
| AI context | Rehydrate tips from document state — not a new chat thread |

---

# 10. Performance rules

| Rule | Spec |
|------|------|
| Fast first interaction | Interactive shell ASAP |
| Progressive loading | Critical path first |
| Skeletons | Prefer over spinners (Ch.6) |
| Incremental rendering | Long canvases virtualize when needed |
| Background sync | Non-blocking |
| Energy | Prefer transform/opacity · fewer GPU toys |
| Older hardware | Supported — drop effects before dropping pedagogy |

---

# 11. Multi-window experience

Support paired contexts (desktop/laptop):

| Pair | Behaviour |
|------|-----------|
| Lesson Design + Resource Library | Independent scroll · shared lesson id |
| Lesson + Assessment | Shared objectives links |
| Lesson + Reflection | Shared lesson history |
| Lesson + Curriculum | Alignment view |

Instant synchronization of document mutations across windows when online; queue of local edits when offline.

---

# 12. Accessibility (responsive)

Responsive layouts remain fully accessible:

Keyboard · screen readers · touch · voice (path) · reduced motion · high contrast · large text / zoom.

Collapsing a panel must leave an equivalent keyboard-reachable entry. See [Ch.7](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md).

---

# 13. Future devices (architecture readiness)

Prepare for — do not block on:

Foldable devices · large touch displays · interactive whiteboards · stylus · voice interaction · mixed reality · future classroom environments.

**Principle:** Same Patterns · Journeys · PDS objects; new shell adapters only.

Whiteboard / Presentation Mode is the near-term path for boards.

---

# 14. Adaptive design tokens

Define / extend CSS tokens:

| Family | Examples |
|--------|----------|
| Breakpoints | `--bp-laptop`, `--bp-tablet`, `--bp-mobile` |
| Spacing | Density-scaled `--space-*` aliases |
| Typography | Fluid `clamp()` within Ch.7 floors |
| Grid | Column counts / gaps per breakpoint |
| Navigation | Header height compact vs full |
| Panels | `--prima-panel-width` · collapsed width |
| Motion | Ch.6 tokens unchanged by breakpoint |
| Density | `--density-scale` (0.9 / 1 / 1.05) |
| Touch | `--touch-min` 44px · `--touch-comfortable` 48px |
| Containers | `max-width` reading measures |

Implementation may land progressively in `prima-design-tokens.css`.

### Suggested breakpoint tokens

```css
:root {
  --bp-mobile-max: 767px;
  --bp-tablet-min: 768px;
  --bp-laptop-min: 1024px;
  --bp-desktop-min: 1280px;
  --bp-large-min: 1440px;
  --touch-min: 44px;
  --touch-comfortable: 48px;
  --density-standard: 1;
}
```

---

# 15. Testing matrix

Validate every critical experience on:

| Environment | Check |
|-------------|-------|
| Desktop | Three-panel Studio · Desk |
| Laptop | Collapsed panels · resume |
| Tablet Landscape | Two-panel · touch DnD alternatives |
| Tablet Portrait | Drawer · bottom actions |
| Future Mobile | Companion tasks only · no full authoring claim |
| Low bandwidth | Skeletons · sync queue |
| Offline | Edit · badge · restore |
| Older hardware | No required GPU glitter |
| High DPI | Crisp icons/type |
| Large displays | No sparse “lost in space” · max measure holds |
| Interactive boards | Presentation Mode |

Plus Ch.7 a11y passes at each layout.

---

# 16. Surface application notes

### Teacher Desk (Ch.11 / HOME-001)
- Desktop/laptop: greeting + CTA + continue  
- Tablet: same mental model · horizontal shelves  
- Mobile: continue · search · reflect · notify — Create may deep-link to desktop message if authoring unsupported  

### Lesson Design Studio (Ch.12 / LESSON-001)
- Desktop: navigator · canvas · PRIMA  
- Laptop: collapsible rails  
- Tablet: canvas + drawers · quick edit  
- Mobile: read-only / light field edit · Publish approve · not full DnD Build  

### Teaching / Presentation modes
Prefer Studio mode switcher · board-safe type scale · hide AI pulse unless teacher opens tips.

---

# 17. Implementation notes

| Concern | Guidance |
|---------|----------|
| CSS | Mobile-first media queries OK; **behaviour** still desktop-authoring-primary |
| State | Persist `studioLayout`, `openZones`, `mode`, `density` in user prefs + session |
| Continuity | Serialize focus block id + scroll top with draft |
| Sync | Conflict UI uses Pattern Recover · teacher choice |
| Feature flags | Mobile companion surfaces ship independently of full Studio |
| QA | Matrix §15 required for Studio/Desk PRs affecting layout |

---

# 18. Future extensions

- Foldable dual-pane Lesson + Library  
- Native companion apps sharing same continuity protocol  
- Classroom display cast from Teaching Mode  
- Voice quick capture in Reflection Mode  
- Stylus inking on board-optimized canvas  

---

# Success criteria

Teachers experience **one product** — not four different interfaces.

PRIMA feels familiar everywhere.

**The device adapts. The pedagogy never changes.**
