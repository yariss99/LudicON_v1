# PRIMA Design Book — Chapter 7  
# Accessibility & Inclusive Design

Version: 1.0  
Status: Core Design Standard  
Priority: Critical  
Audience: Product · Design · Engineering · QA · Pedagogy  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) · [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) · [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) · [Ch.4 Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) · [Ch.5 Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) · [Ch.6 Motion](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)  
**Related:** DESIGN-002 Ch.10 · UX-001 / UX-002 · WCAG 2.2  
**Responsive:** [Ch.8 Responsive & Adaptive](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)

---

# 0. Objective

Design PRIMA so every teacher can confidently use the platform regardless of age, ability, experience, environment, or assistive technology.

| Accessibility is | Accessibility is not |
|------------------|----------------------|
| A design philosophy | A compliance checkbox at the end |
| Empathy for real teachers | Designing for “average” users |
| Mandatory for “done” | Optional polish |

**No feature is considered complete until it is accessible.**

### Authority

On accessibility conflict: **DB-CH07 > visual preference.**  
Typography floor, contrast, keyboard, and reduced-motion rules in this chapter prevail over aesthetic choices in surface chapters.  
Still subordinate to DOCUMENT-000 (dignity · no judgment · teacher authorship).

Accessibility bugs have the **same priority as functional bugs**. Accessibility review is **mandatory** before approval — no exceptions.

---

# 1. Philosophy

PRIMA is designed for **people** — not average users, not ideal users.

Real teachers:

- Working late  
- On older laptops  
- With visual limitations  
- Under stress  
- In bright classrooms  
- Using keyboards or screen readers  
- With temporary limitations (injury, fatigue, illness)  

**Accessibility begins with empathy.**

### Principles

| Principle | Meaning |
|-----------|---------|
| Inclusive by Default | Accessible path is the main path |
| Clarity Before Complexity | Prefer understanding over density |
| Consistency Builds Confidence | Same patterns everywhere (PDL · PDS) |
| Reduce Cognitive Load | One decision at a time |
| Never Depend on Color Alone | Color + icon + text + shape (+ motion when allowed) |
| Alternatives for Every Interaction | Pointer · keyboard · AT · touch |
| Accessibility Improves Everyone | Larger targets · clearer copy help all teachers |

---

# 2. Inclusive design pillars

| Pillar | Focus |
|--------|-------|
| Visual | Contrast · type · non-color cues · magnification |
| Motor | Keyboard · touch targets · no precision traps |
| Cognitive | Memory · language · predictability · undo |
| Auditory | No essential audio-only info (future captions) |
| Language | UX-002 · plain RO · respectful |
| Environmental | Bright rooms · glare · noise · interruptions |
| Technological | Old hardware · low bandwidth · offline |
| Future | Voice · eye tracking · evolving AT |

---

# 3. Visual accessibility standards

| Standard | Requirement |
|----------|-------------|
| Baseline | **WCAG 2.2 AA minimum** |
| Aspiration | **AAA** whenever practical (prefer 7:1 text) |
| Body contrast | **≥ 4.5:1** |
| Preferred body contrast | **≥ 7:1** |
| Large text / UI | ≥ 3:1 |
| Non-text UI | ≥ 3:1 for essential icons/borders |

### Multi-channel state language

Every state includes as many of these as needed for meaning:

**Color · Icon · Text · Shape · Motion** (motion never sole channel)

Never communicate meaning using color alone.

### High contrast mode

Provide a high-contrast theme path: stronger borders, optional shadow reduction, amber tips always labelled.

### Magnification / zoom

Do not disable browser zoom. Layouts reflow; no clipped essential controls at 200% zoom.

---

# 4. Typography standards (a11y floor)

| Rule | Spec |
|------|------|
| Minimum body | **16px** |
| Preferred body | **17–18px** |
| Headings | Large · clear hierarchy (Ch.1 families) |
| Max line length | **~75 characters** (comfort) |
| Spacing | Generous line-height ≥ 1.5 for body |
| Fonts | Avoid condensed faces for UI body |

**Reconciliation:** Where Creative Direction listed 15px transitional body, **this chapter’s 16px floor wins** for production UI.

Romanian diacritics must render clearly (Source Sans 3 / Source Serif 4 target stacks).

---

# 5. Color system (semantic completeness)

Every semantic color role includes:

| Channel | Required |
|---------|----------|
| Text | Yes |
| Border / ring | Yes when conveying state |
| Icon | Yes for status |
| Background / wash | When helpful |
| Pattern | Where appropriate (print · high contrast) |

Map to tokens (`--prima-primary`, `--prima-danger`, etc.) — never orphan hex for status.

---

# 6. Interaction standards

## 6.1 Keyboard experience

| Rule | Spec |
|------|------|
| Full coverage | Every feature usable without a mouse |
| Tab order | Logical · matches visual reading order |
| Focus | Always visible · 2px ring · 2px offset (Ch.6) |
| Shortcuts | Documented where provided · never only path |
| Traps | **No keyboard traps** |
| Escape | Always exits overlays / dialogs / drawers |
| DnD alternatives | Move up/down controls for reorder |

## 6.2 Pointer & touch

| Rule | Spec |
|------|------|
| Min target | **44 × 44 px** |
| Spacing | Comfortable gap · reduce mis-taps |
| Accidental activation | Confirm destructive; adequate hit padding |

## 6.3 Screen readers

| Rule | Spec |
|------|------|
| Markup | Semantic HTML first |
| ARIA | Only when native semantics insufficient |
| Labels | Descriptive · Romanian educational |
| Order | Logical reading order |
| Live regions | Spare · for autosave / critical status |
| Surprises | No focus jumps without cause; announce route changes |

Landmarks: `banner` · `main` · `navigation` · `complementary` (PRIMA) · `contentinfo`.

Guiding Star / PRIMA presence: accessible name (e.g. `aria-label="PRIMA"`).

## 6.4 Forms

| Rule | Spec |
|------|------|
| Labels | Always visible — **never placeholder-only** |
| Validation | Inline · immediate · respectful |
| Examples | Helpful sample text where useful |
| Optional | Clearly marked |
| Required | Justified — avoid false required fields |

## 6.5 Error messages

Explain: **what · why · how to solve** · offer recovery.  
Never blame · never dump stack traces / codes to teachers.

---

# 7. Motion standards (a11y)

Full language: [Ch.6](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md).

| Rule | Spec |
|------|------|
| Reduced Motion | Honor OS `prefers-reduced-motion` |
| Decorative | Disable under reduced motion |
| Orientation | Keep meaningful context changes (instant OK) |
| Vestibular | No large zoom · parallax · spin · shake |

---

# 8. Cognitive accessibility

| Practice | Spec |
|----------|------|
| Memory load | Don’t force recall of hidden state |
| Decisions | One primary decision at a time (PDL Law 1) |
| Language | Plain · UX-002 |
| Layout | Predictable zones (PDL) |
| Terminology | Consistent pedagogical nouns (PDS) |
| Navigation | Clear · Continuity (Journeys) |
| Mistakes | Undo · Recover pattern · never punish |

---

# 9. Language standards

| Do | Don’t |
|----|-------|
| Professional · respectful · simple | Bureaucratic · machine · raw technical |
| Immediately understandable instructions | Unnecessary jargon |
| Calm error tone | Blame · panic |

Voice canon: UX-001 / UX-002 · DOCUMENT-000.

---

# 10. Environmental & technological accessibility

### Environment
Bright classrooms · glare · noise · interruptions → high contrast option · large targets · calm UI (no urgent motion).

### Low bandwidth
Graceful degradation · fast first paint · progressive enhancement · offline awareness · **never lose work** · autosave active.

### Older devices
Modest hardware support · avoid unnecessary GPU effects · responsiveness over visual effects (Ch.6 performance).

### Responsive a11y
Desktop · laptop · tablet · future mobile — interactions remain accessible at each breakpoint (drawers must be keyboardable).

---

# 11. Assistive technologies (support matrix)

| Technology | Support level |
|------------|---------------|
| Screen readers | Required (AA) |
| Keyboard navigation | Required |
| Voice control | Compatible targets/labels (enhance over time) |
| Magnifiers / zoom | Required |
| High contrast | Required theme path |
| Reduced motion | Required |
| Eye tracking | Future |
| Voice interaction | Future |

---

# 12. Emotional accessibility

Teachers should never feel: confused · judged · overwhelmed · lost.

Every screen should reinforce: **confidence · orientation · clarity · professional respect.**

Aligns with Journeys emotional arc and DOCUMENT-000 (no rankings · no surveillance tone).

---

# 13. Component requirements (PDS)

Every PDS component ships with:

| Requirement | Notes |
|-------------|-------|
| Accessible name | Role + label |
| Keyboard ops | Documented |
| Focus styles | Visible |
| State text | Not color-only |
| Reduced motion | Honored |
| SR behaviour | Tested for critical paths |
| Touch size | ≥44×44 where interactive |

Universals (L2) and pedagogical components (L3+) share this bar.

---

# 14. Review checklists

## 14.1 Screen accessibility review (mandatory)

Every screen must answer **yes**:

- [ ] Usable without a mouse?  
- [ ] Usable without color?  
- [ ] Usable without animation?  
- [ ] Usable with screen readers?  
- [ ] Usable with enlarged text / 200% zoom?  
- [ ] Usable with reduced vision (contrast)?  
- [ ] Usable under cognitive fatigue (one primary action · clear next step)?  
- [ ] Usable with slow internet (skeletons · no lost work)?  
- [ ] Usable on older hardware (no jank-required effects)?  

## 14.2 Pre-approval gate

- [ ] WCAG AA checks for new UI  
- [ ] Keyboard pass on critical path  
- [ ] SR pass on critical path  
- [ ] Reduced-motion pass  
- [ ] Contrast pass (tools + spot check)  
- [ ] Copy reviewed (UX-002 · error tone)  
- [ ] Touch targets ≥44×44  
- [ ] No placeholder-only fields  

Fail any → **do not approve**.

---

# 15. Testing procedures

| Layer | Procedure |
|-------|-----------|
| Automated | axe / eslint-plugin-jsx-a11y on CI where available |
| Keyboard | Tab through create → build → publish paths |
| Screen reader | VoiceOver / NVDA spot checks on Desk · Studio · Publish |
| Visual | Contrast analyzer · 200% zoom · Windows High Contrast sample |
| Motion | OS reduced-motion on · verify no essential info lost |
| Network | Throttle · confirm autosave / offline messaging |
| Manual empathy | “Late night · stressed teacher” walkthrough |

Document defects as **a11y bugs** with same severity rules as functional defects.

---

# 16. Accessibility acceptance criteria (Definition of Done)

A feature is done only if:

1. AA criteria met for its UI surface  
2. Keyboard + SR critical paths verified  
3. Color-independent status  
4. Reduced motion respected  
5. Errors explain what / why / how  
6. Work cannot be silently lost  
7. Checklist §14 passed  
8. No known Sev-1/2 a11y bugs open  

---

# 17. Designer notes

- Design in zones and patterns that already encode a11y (PDL · PDS).  
- Specify focus order in mockups for complex studios.  
- Prefer text labels over icon-only primary actions.  
- Empty/error/success states are a11y content — write them.  
- When beauty and contrast conflict, **contrast wins**.  

---

# 18. Developer notes

- Semantic elements before ARIA.  
- Manage focus on route/dialog open/close.  
- Wire `prefers-reduced-motion` via Ch.6 tokens.  
- Don’t `outline: none` without replacement ring.  
- Announce autosave sparingly (avoid live-region spam).  
- Hit targets: padding counts toward 44×44.  
- Test with keyboard in PR before merge for UI PRs.  

---

# 19. Future evolution

| Area | Direction |
|------|-----------|
| WCAG | Track 2.2+ updates |
| Voice | Command-compatible labels |
| Eye tracking | Large targets already help |
| AAA | Expand 7:1 coverage on core flows |
| i18n a11y | Keep RO quality; prepare structure for locales |
| AT matrix | Formal SR matrix in QA docs |

---

# Success criteria

Every teacher should feel that PRIMA **adapts to them**.

Teachers should never feel excluded by design.

**Accessibility becomes invisible because the experience feels naturally usable.**
