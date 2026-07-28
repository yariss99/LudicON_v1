# PRIMA Design Book — Chapter 2  
# PRIMA Design Language (PDL)

Version: 1.0  
Status: Core Design Standard  
Priority: Critical  
Audience: Product Design · UX · UI · Frontend · QA · AI/Product  
Last Updated: July 2026

**Canon:** [DOCUMENT-000 — The PRIMA Manifesto](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md)  
**Executable tokens:** [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · `src/styles/prima-design-tokens.css`  
**Product UX SoT:** [DESIGN-002](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md)  
**Components:** [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md)  
**Patterns:** [Ch.4 Experience Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md)  
**Journeys:** [Ch.5 Teacher Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)  
**Motion:** [Ch.6 Motion & Interaction](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)  
**Accessibility:** [Ch.7 Accessibility](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)  
**Responsive:** [Ch.8 Responsive & Adaptive](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)

---

# 0. Objective

Define the **universal design language** that governs every interface, component, interaction, and visual decision inside PRIMA.

| PDL is | PDL is not |
|--------|------------|
| How PRIMA communicates visually | A component library catalog |
| The grammar of every screen | A Figma file dump |
| Binding rules for future UI | Optional style tips |

**Every future screen must comply with these rules.**

PDL is the **visual constitution** of PRIMA.  
Creative Direction (Ch.1) defines identity.  
PDL (this chapter) defines **behavior and grammar**.  
Surface chapters apply both to specific places.

### Authority

On conflict of interaction/layout grammar: **PDL > surface convenience**.  
On conflict of brand tokens/mood: **Ch.1 Creative Direction**.  
On conflict of ethics/teacher role: **DOCUMENT-000**.

---

# 1. Design philosophy

> The interface is invisible.  
> The learning design is visible.

Teachers should never notice the interface.  
They should notice only their work.

| Visible | Invisible |
|---------|-----------|
| Lesson structure · objectives · activities | Chrome · modules · pipelines |
| Pedagogical meaning of each card | Decorative UI |
| Teacher authorship | Algorithm theater |
| Calm confirmation | Modal spam |

---

# 2. The Ten Laws of PDL

## LAW 1 — One dominant action per screen

Every screen answers:

> What is the most important thing I should do now?

| Rule | Spec |
|------|------|
| Primary CTA | Exactly one filled primary in the decision region |
| Competing blues/emeralds | Forbidden above the fold |
| Secondary actions | Ghost / text / tertiary only |

## LAW 2 — Visual silence

Remove everything that does not help teaching.

No decorative elements.  
No unnecessary icons.  
No visual noise.

**Test:** If removing an element does not reduce teaching clarity, remove it.

## LAW 3 — Hierarchy before beauty

Importance determines size, weight, and position — never aesthetics alone.

Order: **Title → Pedagogical content → Primary action → Secondary → Meta/chrome.**

## LAW 4 — Whitespace creates understanding

Whitespace is functional.  
Never fill empty areas just because space exists.

Use the 8-point grid ([Ch.1 §6](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md)). Prefer one more spacing step over one more control.

## LAW 5 — Cards represent ideas

Cards are not generic containers.

Each card has a **clear pedagogical meaning** (a lesson, an activity, a recommendation, a resource, a reflection).

If a card has no pedagogical noun, it should not be a card.

## LAW 6 — Motion explains

Animations communicate: **change · relationship · continuity**.  
Never entertainment.

Duration: 100–250ms for UI (presence pulse excepted). See Ch.1 §8.

## LAW 7 — Feedback is immediate

Every action receives confirmation — subtle, elegant, fast.

| Action | Feedback |
|--------|----------|
| Save | Meta “Salvat” fade |
| Click | 120ms compression |
| Error | Inline explain + path |
| AI tip | Soft appear · dismissible |

## LAW 8 — AI is present, never dominant

PRIMA never competes with the teacher for the primary action.

| AI may | AI must not |
|--------|-------------|
| Recommend · explain · warn calmly | Auto-overwrite · modal takeover · chat as home |
| Pulse Guiding Star when tips exist | Purple glow · interruptive banners |

## LAW 9 — Consistency creates trust

Buttons, cards, dialogs, navigation, spacing — identical behavior everywhere.

Same tokens. Same radii. Same motion. Same RO voice (UX-002).

## LAW 10 — Pedagogy always wins

Whenever aesthetics and pedagogy conflict, **pedagogy wins**.

Examples: show the competency even if the card looks busier; prefer clear “why” over a prettier unexplained tip.

---

# 3. Layout language — Zones

Pages are composed of **Zones**, not arbitrary containers.

| Zone | Purpose | Typical content |
|------|---------|-----------------|
| **Primary Zone** | The work | Canvas · main list · conversation · editor |
| **Secondary Zone** | Supporting structure | Navigator · filters · collections |
| **Context Zone** | Orientation | Breadcrumb · title · autosave · mode |
| **Reflection Zone** | Growth / insight (optional) | Reflection strip · insight card |
| **PRIMA Zone** | Partner intelligence | Design Score · tips · warnings · presence |

### Zone grammar (default)

```
┌─ Context Zone ─────────────────────────────────────────────┐
├─ Secondary Zone ─┬─ Primary Zone ──────────┬─ PRIMA Zone ─┤
│                  │                         │              │
│                  │                         │              │
├──────────────────┴─────────────────────────┴──────────────┤
│ Reflection Zone (optional, below or within Primary)         │
└─────────────────────────────────────────────────────────────┘
```

| Surface | Zone mapping |
|---------|----------------|
| Teacher Desk | Context=header · Primary=greeting+CTA+continue · Secondary=shelves · Reflection=strip · PRIMA=presence |
| Design Studio | Context=meta · Secondary=navigator · Primary=canvas · PRIMA=intelligence |
| Conversation | Primary=dialogue · Secondary=living plan · PRIMA=structured partner |

**Rules:**

- Primary Zone always largest.  
- PRIMA Zone never wider than Primary on desktop.  
- Reflection Zone never steals the first viewport’s primary action.  
- Collapsing Secondary/PRIMA is allowed; deleting Primary is not.

---

# 4. Component language

Every component must answer six questions before it ships:

| Question | Meaning |
|----------|---------|
| **Purpose** | What pedagogical job does it do? |
| **Priority** | Primary / secondary / tertiary / meta |
| **Interaction** | Click · drag · type · dismiss — how? |
| **Feedback** | What confirms the action? |
| **Accessibility** | Keyboard · SR · contrast · motion |
| **Relationship** | Which Zone · which other components |

**Never create generic components.**  
A “Card” in PRIMA is a *LessonCard*, *ActivityBlock*, *RecommendationCard*, *ResourceShelf*, etc. — each with pedagogical meaning.

Map implementation to DESIGN-001 primitives (`PrimaButton`, `PrimaCard`, `PrimaMark`, `TeachingShell`, …) while preserving pedagogical names in product UI.

---

# 5. Visual rhythm

```
Large
  ↓
Medium
  ↓
Small
  ↓
Whitespace
  ↓
Repeat
```

Create breathing space. Avoid dense layouts.

| Rhythm unit | Example |
|-------------|---------|
| Large | Page greeting / lesson title |
| Medium | Section title + one sentence |
| Small | Meta · chips · timestamps |
| Whitespace | `--space-5` to `--space-7` between bands |

---

# 6. Information density

**Low by default.** Increase only when the teacher’s task requires it (e.g. reviewing a full sequence).

| Density | When |
|---------|------|
| Sparse | Desk · empty states · Focus Mode |
| Comfortable | Default Studio / Conversation |
| Dense | Rare: version history tables · curriculum pickers |

Teachers should never feel overwhelmed on entry.

---

# 7. Color language

Color indicates **meaning**, never decoration.  
Full emotional palette: [Ch.1 §4](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md).

| Color | Role | Use |
|-------|------|-----|
| **Blue** (`--prima-primary`) | Action / commitment (Desk) · information emphasis | Primary CTA · focus |
| **Emerald** (`--prima-secondary`) | Success · studio craft | Saved · Studio primary commitment |
| **Amber** (`--prima-accent`) | Attention · recommendations | Tips · Guiding Star core · warnings |
| **Red** (`--prima-danger`) | Critical | True errors / destructive only |
| **Gray** (neutrals) | Structure | Canvas · borders · muted text |

**Forbidden:** purple AI branding · rainbow status · color-only meaning.

---

# 8. Icon language

| Rule | Spec |
|------|------|
| Icons never replace text on primary actions | Label required |
| Icons reinforce understanding | Optional on secondary |
| Maximum simplicity | Lucide · stroke 1.75 · 16/20/24 |
| Rounded geometry | Consistent corner treatment |
| No clichés / cartoons | See Ch.1 §7.3 |

---

# 9. Typography language

Typography creates hierarchy, not decoration.

| Rule | Spec |
|------|------|
| Families | Source Sans 3 (UI) · Source Serif 4 (display) · IBM Plex Mono (rare) — Ch.1 §5 |
| Weights | **Maximum three** on a screen (typically 400 / 500 / 600) |
| Line spacing | Body 1.55–1.65 |
| Reading | Comfortable measures ≤720px in blocks |
| Case | Sentence case · Romanian educational (UX-002) |

---

# 10. Button language

| Kind | Role | Rule |
|------|------|------|
| **Primary** | The dominant action | **One per screen** (decision region) |
| **Secondary** | Support | Outline / soft / ghost |
| **Tertiary** | Low priority | Text button |
| **Danger** | Destructive only | Rare · confirmed |

Press: 120ms scale ~0.98. Focus ring always visible.

---

# 11. Card language

Cards should feel: **light · organized · stable · expandable · predictable.**

Cards never compete visually (no stacked neon elevations).

| Spec | Token / value |
|------|----------------|
| Radius | `--radius-lg` / `--radius-md` |
| Shadow | `--shadow-soft` → hover `--shadow-hover` |
| Border | Ring `--prima-border` |
| Meaning | Pedagogical noun required (Law 5) |

---

# 12. Empty states

Every empty state **teaches**.

Never display: *“No data.”* / *“Nicio înregistrare.”*

Instead explain:

1. **What** can exist here  
2. **Why** it is empty  
3. **How** to begin  

Example: *Ce experiență de învățare vrei să proiectezi azi?* + clear start paths.

Use `EmptyState` patterns from the design system.

---

# 13. Loading states

Loading **reassures**, never confuses.

| Prefer | Avoid |
|--------|-------|
| Skeletons matching final layout | Indeterminate spinners on whole pages |
| Soft pulse on known regions | Fake progress that lies |
| Short status text when >1s | Blocking the whole app without reason |

Respect `prefers-reduced-motion` (pulse → static placeholders).

---

# 14. Error language

Errors never blame the teacher.

Always explain:

1. **What** happened  
2. **Why** (plain language)  
3. **How** to solve it  

Tone: calm colleague (UX-002). Preserve teacher work. Prefer inline over modal.

Example: *Nu am putut salva acum. Proiectul e păstrat — încearcă din nou.*

---

# 15. Success language

Celebrate **quietly**. Never exaggerate.

| Do | Don’t |
|----|-------|
| Soft check · “Salvat” | Confetti · full-screen victories |
| Professional confidence | Gamified streaks on core flows |

---

# 16. Microinteractions

| Event | Behavior |
|-------|----------|
| Hover | Soft elevation 150ms |
| Click | Compression 120ms |
| Drag | Elastic follow · drop indicator |
| Save | Fade status 200ms |
| Publish | Calm progress (determinate when known) |
| Recommendation | Subtle pulse on Guiding Star / tip edge |

Everything subtle. Cap 100–250ms for discrete UI motion.

---

# 17. AI language

AI recommendations are:

- **Optional**  
- **Contextual**  
- **Explainable** (reasoning · impact · alternatives)  
- **Dismissible**  

Never interrupt flow. Cap visible tips (e.g. ≤3 on Desk/Studio).  
Silence is often better than interruption ([DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md)).

Representation: Guiding Star + panel copy — **not** a chatbot window as the product metaphor.

---

# 18. Accessibility

Every interaction must satisfy **WCAG AA** for:

| Dimension | Requirement |
|-----------|-------------|
| Keyboard | Full task paths |
| Screen reader | Landmarks · names · roles |
| Contrast | AA text / UI |
| Motion | Reduced-motion honored |
| Focus | Visible 2px ring |
| Touch | ≥40×40px targets |

Color-independent status. See Ch.1 §10 · DESIGN-002 Ch.10.

---

# 19. Design review checklist

Before approving any screen, verify:

- [ ] **One primary action?**  
- [ ] **Clear hierarchy?**  
- [ ] **Whitespace respected?**  
- [ ] **Consistent spacing (8pt)?**  
- [ ] **Semantic colors only?**  
- [ ] **Accessible (AA · keyboard · reduced motion)?**  
- [ ] **Teacher-first language (UX-002)?**  
- [ ] **No unnecessary UI?**  
- [ ] **Pedagogy visible?**  
- [ ] **Technology invisible?**  
- [ ] **Zones identifiable (Primary / Secondary / Context / Reflection / PRIMA)?**  
- [ ] **AI optional · explainable · dismissible?**  
- [ ] **Empty/loading/error states teach or reassure?**  

Fail any item → do not ship.

---

# 20. Relationship to other standards

| Document | Role vs PDL |
|----------|-------------|
| DOCUMENT-000 | Why / ethics — PDL implements visually |
| DB-CH01 Creative Direction | Identity · tokens · mood — PDL uses them as grammar |
| DESIGN-002 | Product UX specification — PDL is the binding language layer |
| DESIGN-001 | Executable components — must obey PDL laws |
| DB-CH03 PDS | Pedagogical components — assembled under PDL |
| DB-CH04 Patterns | Workflow sequences using PDL + PDS |
| DB-CH05 Journeys | End-to-end arcs composed of patterns |
| DB-CH06 Motion | Durations · easings · state motion |
| DB-CH07 A11y | Inclusive access — overrides aesthetics when needed |
| DB-CH08 Responsive | Device · mode · continuity adaptation |
| DB-CH09 PAIM | AI experience — invited · explainable · teacher decides |
| DB-CH10 Blueprint | Screen library · no unlisted screens |
| DB-CH11 / DB-CH12… | Surface application of full Design Book stack |

### Implementation note

When building UI:

1. Name the **Zones** in the layout.  
2. Assign **one primary action**.  
3. Map components to **pedagogical purposes**.  
4. Run the **§19 checklist**.  
5. Use tokens only — no rogue hex or one-off motion.

---

# Success criteria

PDL becomes the visual constitution of PRIMA.

Designers and engineers can evaluate any screen against the Ten Laws and the checklist without reinterpretation.

Teachers experience **work**, not software.
