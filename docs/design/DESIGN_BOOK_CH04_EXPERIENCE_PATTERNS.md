# PRIMA Design Book — Chapter 4  
# Experience Patterns

Version: 1.0  
Status: Core UX Standard  
Priority: Critical  
Audience: Product · UX · UI · Frontend · Pedagogy · QA  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) · [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) · [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md)  
**Journeys:** [Ch.5 Teacher Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)  
**Motion:** [Ch.6 Motion & Interaction](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)  
**Accessibility:** [Ch.7 Accessibility](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)  
**Responsive:** [Ch.8 Responsive & Adaptive](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)

---

# 0. Objective

Define the reusable **experience patterns** that compose every workflow inside PRIMA.

| A Pattern is | A Pattern is not |
|--------------|------------------|
| A reusable sequence of interactions for a pedagogical task | A screen mockup |
| The grammar of workflow | A one-off journey script |
| Assemblable across the ecosystem | Locked to one feature |

**Every workflow in PRIMA should be assembled from these patterns.**

### Authority

| Layer | Wins on |
|-------|---------|
| DOCUMENT-000 | Ethics · authorship |
| DB-CH01 | Visual identity |
| DB-CH02 PDL | Laws · zones · micro-grammar |
| DB-CH03 PDS | Component assembly |
| **DB-CH04 Experience Patterns** | Workflow sequences · transitions · AI role in flows |
| DB-CH05 Journeys | Stories that compose patterns |
| Surface chapters | Named places applying patterns |

---

# 1. Design philosophy

Teachers should recognize interaction patterns **instinctively**.

Different tasks. Same interaction logic.

Predictability reduces cognitive load.  
Consistency builds confidence.

| Principle | Implication |
|-----------|-------------|
| Familiarity | Same Create / Build / Review choreography everywhere |
| Teacher starts | AI never initiates a pattern |
| Safe continue | Recover always available |
| Low decision fatigue | One primary action at each step |

Every pattern must answer:

1. Where am I?  
2. Why am I here?  
3. What is the next best action?  
4. Can I safely continue?  

---

# 2. Pattern categories

| Category | Patterns primarily used |
|----------|-------------------------|
| Learning Design | Create · Build · Review · Improve |
| Creation | Create · Build · Recover |
| Exploration | Explore · Search |
| Review | Review · Improve |
| Reflection | Reflect |
| Publication | Publish · Recover |
| Collaboration | Collaborate · Recover |
| Knowledge | Explore · Search · Improve |
| AI Assistance | Improve (cross-cutting) |
| Navigation | Explore · Search · transitions |

---

# 3. Pattern anatomy (required)

Every pattern specification includes:

| Section | Content |
|---------|---------|
| Purpose | Pedagogical job of the sequence |
| Pedagogical Context | When teachers need it |
| Trigger | How the pattern starts |
| Primary Action | The one dominant commit |
| Secondary Actions | Support only |
| Expected Feedback | Immediate confirmations |
| AI Behaviour | Assist only after teacher start |
| Motion | Continuity cues (100–250ms) |
| Accessibility | Keyboard · SR · reduced motion |
| Responsive Behaviour | Desktop → tablet → mobile companion |
| Success State | Clear completion signal |
| Failure State | Calm recovery path |
| Examples | Concrete product uses |
| Anti-patterns | Forbidden implementations |
| Developer Notes | Routes · features · PDS components |

---

# 4. AI behaviour (global)

```
Teacher starts
    → AI assists (optional · explainable · dismissible)
    → Teacher decides
    → Pattern complete
```

AI **never** starts the pattern.  
AI **never** auto-completes authorship.  
Silence is valid when no meaningful help exists.

---

# 5. Core Experience Patterns

---

## Pattern 01 — Create

**Purpose:** Begin a new pedagogical artifact with minimal friction.  
**Pedagogical Context:** Teacher has an intention to design something new.

| | |
|--|--|
| **Trigger** | Primary CTA (“Creează…”) · empty-state path · template pick |
| **Primary Action** | Create {Lesson \| Worksheet \| Assessment \| Activity \| …} |
| **Secondary Actions** | Start from curriculum / template / idea / import |
| **Expected Feedback** | Immediate navigation into Build or brief naming step |
| **AI Behaviour** | May suggest start path **after** entry; never auto-create |
| **Motion** | Soft page enter 220ms |
| **Accessibility** | CTA labelled; focus moves to title or canvas |
| **Responsive** | Full on desktop/laptop; tablet OK; mobile: create + handoff |
| **Success State** | Artifact exists · autosave on · Build ready |
| **Failure State** | Explain + retry · no silent loss |
| **Examples** | Create Lesson · Create Worksheet · Create Assessment · Create Activity |
| **Anti-patterns** | Multi-step config wizard before value · competing primaries |
| **Developer Notes** | Desk CTA · Experience empty state · PDS L5 templates · FEATURE-001 entry |

**Rules:** One primary action · Clear starting point · No unnecessary configuration.

---

## Pattern 02 — Explore

**Purpose:** Scan and discover pedagogical materials and collections.  
**Pedagogical Context:** Teacher is looking, not yet committing to create.

| | |
|--|--|
| **Trigger** | Collections · Library · Knowledge Hub · “Descoperă” |
| **Primary Action** | Open / select an item of interest |
| **Secondary Actions** | Filter · sort · save to shelf · preview |
| **Expected Feedback** | Instant filter results · skeleton while loading |
| **AI Behaviour** | Optional “you used this before” tips — never blocking |
| **Motion** | List/card stagger subtle or none (reduced motion: none) |
| **Accessibility** | Filters as form controls · results as list/grid with headings |
| **Responsive** | Grid → horizontal shelves on narrow |
| **Success State** | Teacher lands in Build / Review / Create with context |
| **Failure State** | Teaching empty state (what/why/how) — never “No data” |
| **Examples** | Browse Collections · Search Resources · Discover Templates · Knowledge Hub |
| **Anti-patterns** | Dense admin tables as default · hidden search |
| **Developer Notes** | KHPM · Desk shelves · PDS Resource Shelf · Pattern 09 often embedded |

**Rules:** Fast scanning · Visual hierarchy · Filtering · Natural search.

---

## Pattern 03 — Build

**Purpose:** Construct the learning design on a canvas-first surface.  
**Pedagogical Context:** Teacher is authoring structure and content.

| | |
|--|--|
| **Trigger** | After Create · Resume from Desk · Open from Explore |
| **Primary Action** | Edit the canvas / pedagogical blocks |
| **Secondary Actions** | Navigator · properties · duplicate · reorder |
| **Expected Feedback** | Autosave · block focus ring · DnD indicator |
| **AI Behaviour** | **Third** — PRIMA Zone tips only; never covers canvas |
| **Motion** | Block hover/drag; panel collapse 220ms |
| **Accessibility** | Keyboard reorder · landmarks · Focus Mode |
| **Responsive** | Three zones desktop; drawers on laptop/tablet |
| **Success State** | Coherent draft ready for Review |
| **Failure State** | Offline badge · local preserve · retry sync |
| **Examples** | Lesson Canvas · Assessment Builder · Worksheet Builder · Presentation Builder |
| **Anti-patterns** | Properties-first forms · AI chat as main column |
| **Developer Notes** | Studio (DB-CH12 / LESSON-001) · Blueprint DB-CH10 · PAIM · PDS · PDL |

**Rules:** Canvas first · Properties second · AI third.

---

## Pattern 04 — Review

**Purpose:** Understand quality and coherence without judgment.  
**Pedagogical Context:** Teacher checks readiness, coverage, alignment.

| | |
|--|--|
| **Trigger** | Mode switch · “Verifică” · Design Score expand · pre-Publish |
| **Primary Action** | Acknowledge insight / jump to improve target |
| **Secondary Actions** | Filter dimensions · open explanation |
| **Expected Feedback** | Dimension explanations · calm highlights on canvas |
| **AI Behaviour** | Explain · impact · alternatives — never grade the teacher |
| **Motion** | Soft highlight 280ms on related blocks |
| **Accessibility** | Score as text+value · not color-only |
| **Responsive** | Panel + canvas; stack on tablet |
| **Success State** | Teacher knows what is solid and what to improve |
| **Failure State** | Analysis unavailable → retry · work preserved |
| **Examples** | Lesson Review · Assessment Coverage · Accessibility · Curriculum Alignment |
| **Anti-patterns** | Red “fail” scores · ranking · blocking without path |
| **Developer Notes** | PIE Design Score · PDS Curriculum Alignment View · Assessment Dashboard |

**Rules:** Explain · Never judge · Always provide improvement paths.

---

## Pattern 05 — Improve

**Purpose:** Optionally strengthen the design via transparent suggestions.  
**Pedagogical Context:** After Review or contextual tip during Build.

| | |
|--|--|
| **Trigger** | Recommendation Card · Review dimension · Differentiation entry |
| **Primary Action** | Aplică (teacher decision) |
| **Secondary Actions** | Nu acum · see alternative · open explanation |
| **Expected Feedback** | Patch applied + short “Am actualizat…” · undo available |
| **AI Behaviour** | Optional · contextual · explainable · dismissible |
| **Motion** | Tip pulse only if unread; apply fade 200ms |
| **Accessibility** | Actions labelled · focus returns to affected block |
| **Responsive** | Tips in PRIMA Zone or bottom sheet |
| **Success State** | Design updated under teacher authorship |
| **Failure State** | Apply failed → explain · no partial silent mutate |
| **Examples** | Differentiation · Alternative Strategies · Time Balance · Student Support |
| **Anti-patterns** | Auto-apply · modal stack · >3 tips at once |
| **Developer Notes** | PIE · SLI adaptations · PDS Recommendation Card · PDL AI language |

**Rules:** Recommendations optional · Transparent · Contextual.

---

## Pattern 06 — Reflect

**Purpose:** Support professional growth after teaching — calmly.  
**Pedagogical Context:** Post-lesson · unfinished reflection · insight review.

| | |
|--|--|
| **Trigger** | Desk reflection strip · `/reflection` · post-Publish/teach prompt |
| **Primary Action** | Continue / capture one reflection |
| **Secondary Actions** | Save note · view recent insight · dismiss |
| **Expected Feedback** | Quiet save · no celebration theater |
| **AI Behaviour** | Growth suggestion optional · never evaluative ranking |
| **Motion** | Minimal fade |
| **Accessibility** | Simple form · generous targets |
| **Responsive** | Single column calm layout |
| **Success State** | Reflection captured · teacher feels closure |
| **Failure State** | Draft kept locally |
| **Examples** | Lesson Reflection · Teaching Notes · Learning Evidence · Professional Growth |
| **Anti-patterns** | Mandatory long forms · charts · bureaucracy |
| **Developer Notes** | RPTI · PDS Reflection Block / Workspace · Desk Reflection Zone |

**Rules:** Calm · Minimal · Reflective · Never bureaucratic.

---

## Pattern 07 — Publish

**Purpose:** Deliver the design to a destination with confidence.  
**Pedagogical Context:** Teacher is ready to share or export.

| | |
|--|--|
| **Trigger** | “Publică” / “Creează materialele” / Export entry |
| **Primary Action** | Confirm publish/export to chosen destination |
| **Secondary Actions** | Preview · change destination · cancel |
| **Expected Feedback** | Preview gate · progress · clear success |
| **AI Behaviour** | Pre-publish checks as Review tips — not blockers without reason |
| **Motion** | Determinate progress when known |
| **Accessibility** | Destination list as radiogroup · confirm labelled |
| **Responsive** | Full preview on desktop; stepped on tablet |
| **Success State** | Versioned publication · link/package ready |
| **Failure State** | Explain destination error · design preserved |
| **Examples** | Print · Interactive Board · Google Classroom · Export · Package |
| **Anti-patterns** | Publish without preview · ambiguous destinations · multi-primary |
| **Developer Notes** | PDE · FEATURE-005 · PDS Publishing Workspace |

**Rules:** One final decision · Clear destinations · Confidence before publishing.

---

## Pattern 08 — Collaborate

**Purpose:** Share authorship thoughtfully while keeping ownership clear.  
**Pedagogical Context:** Colleague review, comments, co-create (as available).

| | |
|--|--|
| **Trigger** | Share · Invite · Comment affordance |
| **Primary Action** | Share / invite with explicit role |
| **Secondary Actions** | Copy link · revoke · view history |
| **Expected Feedback** | Visible collaborators · activity in history |
| **AI Behaviour** | None that mutates shared content without owner |
| **Motion** | Subtle presence avatars (initials) — no chat takeover |
| **Accessibility** | Roles announced · comments as threaded list |
| **Responsive** | Drawer for comments on tablet |
| **Success State** | Shared with clear owner |
| **Failure State** | Permission denied explained |
| **Examples** | Share Lesson · Invite Colleague · Comment · Co-create |
| **Anti-patterns** | Hidden ownership · silent overwrites |
| **Developer Notes** | Reserved/future in FEATURE-001 · history via Recover |

**Rules:** Ownership clear · Collaboration visible · History preserved.

---

## Pattern 09 — Search

**Purpose:** Find anything via one coherent search mental model.  
**Pedagogical Context:** Teacher looks across lessons, resources, competencies, notes.

| | |
|--|--|
| **Trigger** | Global search · in-lesson search · Knowledge search |
| **Primary Action** | Submit / select result |
| **Secondary Actions** | Scope chips (lessons · activities · resources · competencies · templates · notes) |
| **Expected Feedback** | Debounced results 200ms · skeletons |
| **AI Behaviour** | NL interpretation explainable (“Am căutat…”) |
| **Motion** | Overlay fade 200ms |
| **Accessibility** | Combobox / listbox pattern · Esc closes |
| **Responsive** | Full-width overlay on all breakpoints |
| **Success State** | Result opens in correct pattern (Build/Explore/Review) |
| **Failure State** | Teaching empty + refine query |
| **Examples** | Universal Search · Natural Language · Curriculum Search · Competency Search |
| **Anti-patterns** | Separate unrelated search UIs per module |
| **Developer Notes** | Desk header · KHPM `search` · Studio quick search |

**Rules:** Everything searchable · Natural language welcome · Scoped filters optional.

---

## Pattern 10 — Recover

**Purpose:** Ensure nothing ever feels lost.  
**Pedagogical Context:** Continuous — underpins all other patterns.

| | |
|--|--|
| **Trigger** | Autosave · Undo · History · Restore · Offline return |
| **Primary Action** | Undo / Restore version |
| **Secondary Actions** | View history · compare · discard draft tip |
| **Expected Feedback** | “Salvat” · version label · undo toast calm |
| **AI Behaviour** | Never destructive restore without confirm |
| **Motion** | Status fade 200ms |
| **Accessibility** | Shortcuts documented · history list keyboardable |
| **Responsive** | Always available in Context Zone |
| **Success State** | Prior state restored · teacher confident |
| **Failure State** | Conflict explained · keep both options when possible |
| **Examples** | Undo · History · Restore Version · Autosave |
| **Anti-patterns** | “Save or lose work” modals · silent overwrite |
| **Developer Notes** | FEATURE-001 undo/history · studio state · offline banners |

**Rules:** Nothing should ever feel lost.

---

# 6. Transitions

Transitions should feel natural — never abrupt. Prefer shared Context Zone continuity (title · autosave · Guiding Star).

### Canonical learning-design loop

```
Explore
  ↓
Create
  ↓
Build
  ↓
Review
  ↓
Improve  ←→  Build   (iterate)
  ↓
Publish
  ↓
Reflect
```

Recover is **orthogonal** — available at every node.  
Search may jump into Explore / Build / Review without breaking the loop.  
Collaborate may wrap Build / Review / Publish.

### Transition rules

| From → To | Feeling |
|-----------|---------|
| Explore → Create | Selection becomes intention · one CTA |
| Create → Build | Instant canvas · no dead-end splash |
| Build → Review | Mode switch or score expand · same document |
| Review → Improve | Jump to dimension · Aplică returns to Build |
| Improve → Build | Patches visible on canvas |
| Build/Review → Publish | Preview gate |
| Publish → Reflect | Soft optional prompt — never forced wall |
| Any → Recover | Non-destructive overlay / panel |

**Motion between patterns:** 200–220ms shared-element or crossfade chrome; canvas content persists when document identity unchanged.

---

# 7. Composing workflows

Workflows = ordered pattern graphs, not bespoke screens.

| Teacher goal | Pattern assembly |
|--------------|------------------|
| Prepare tomorrow’s lesson | Create → Build → Review → Improve → Publish → Reflect |
| Reuse a past activity | Explore → Search → Build → Improve |
| Fix time balance | Build → Review → Improve → Build |
| Share with colleague | Build → Collaborate → Review |
| Find a competency resource | Search → Explore → Create/Build |

Surface chapters (Desk, Studio) **host** patterns; they do not invent parallel logics.

---

# 8. Validation

Every pattern must reduce:

- Decision fatigue  
- Visual complexity  
- Navigation effort  
- Learning curve  

And reinforce **teacher confidence**.

### Pattern review checklist

- [ ] Teacher starts; AI only assists  
- [ ] One primary action at the decision point  
- [ ] Answers Where / Why / Next / Safe?  
- [ ] Uses PDS components + PDL zones  
- [ ] Success & failure states defined  
- [ ] Recover available  
- [ ] Transition from/to documented  
- [ ] No judgment language in Review/Improve  
- [ ] Empty/loading/error teach or reassure  
- [ ] WCAG AA · keyboard · reduced motion  

---

# 9. Mapping to product features

| Pattern | Primary features / surfaces |
|---------|----------------------------|
| Create | Desk · Experience · L5 templates |
| Explore | Desk collections · Library · KHPM |
| Build | FEATURE-001 Studio · UPE |
| Review | PIE · Curriculum Alignment · PDE preview |
| Improve | PIE tips · SLI adaptations · Differentiation |
| Reflect | RPTI |
| Publish | PDE |
| Collaborate | Future / reserved |
| Search | Global · KHPM · Studio |
| Recover | Autosave · version history · undo |

---

# Success criteria

Teachers recognize workflows instinctively because every experience follows familiar patterns.

**Learning the product becomes almost unnecessary.**

Patterns are the grammar of interaction across the PRIMA ecosystem.
