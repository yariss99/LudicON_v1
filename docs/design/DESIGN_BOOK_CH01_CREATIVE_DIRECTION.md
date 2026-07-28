# PRIMA Design Book — Chapter 1  
# Creative Direction

Version: 1.0  
Status: Foundational  
Priority: Absolute  
Audience: Brand · Product Design · UX · UI · Frontend · QA · Marketing  
Last Updated: July 2026

**Canon:** [DOCUMENT-000 — The PRIMA Manifesto](../product/DOCUMENT-000_PRIMA_MANIFESTO.md)  
**Executable tokens:** [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · `src/styles/prima-design-tokens.css`  
**Product UX SoT:** [DESIGN-002](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md)  
**Language:** [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md)  
**Components:** [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md)  
**Patterns:** [Ch.4 Experience Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md)  
**Journeys:** [Ch.5 Teacher Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)  
**Motion:** [Ch.6 Motion & Interaction](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)  
**Accessibility:** [Ch.7 Accessibility & Inclusive Design](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)  
**Responsive:** [Ch.8 Responsive & Adaptive Experience](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)

This chapter defines the **complete visual identity** of PRIMA.  
No screen, component, illustration, or motion may contradict it.  
When UI patterns evolve, this creative direction remains.

---

# 0. Objective

Establish a unique visual identity for professional teachers.

| PRIMA must not look like | PRIMA must feel like |
|--------------------------|----------------------|
| Moodle · Google Classroom · Teams | A modern educational design studio |
| Canva · Notion · generic AI apps | Quiet · bright · organized · warm |
| Corporate SaaS dashboards | Premium · timeless · emotionally comfortable |

**Communicate:** trust · clarity · calm · craftsmanship · intelligence · pedagogical excellence.

---

# 1. Creative vision

PRIMA’s visual identity is the atmosphere of a **modern educational design studio** — not an office, not a dashboard, not a chat product.

Teachers should feel they have entered a place made for **designing learning**: paper-like surfaces, clear structure, soft light, and tools that stay quiet until needed.

**Signature moves:**

1. Warm light-gray canvas (drafting table)  
2. White floating planes with soft elevation (work sheets)  
3. Educational blue for commitment — never neon AI purple  
4. Guiding Star as the only brand “face” (no robot, no mascot)  
5. Generous air — whitespace as respect  
6. Motion that orients, never entertains  

**Brand test:** Remove the word “PRIMA.” If the first viewport could belong to another edtech product, the branding failed.

---

# 2. Mood description

## 2.1 Brand personality (place metaphor)

If PRIMA were a place:

> A modern educational design studio.  
> Quiet. Bright. Organized. Warm. Professional. Creative. Minimal.

| Attribute | Sensory cue |
|-----------|-------------|
| Quiet | Low contrast chrome · soft shadows · no alert spam |
| Bright | Light canvas · high legibility · clear hierarchy |
| Organized | 8pt grid · consistent cards · predictable panels |
| Warm | Warm neutrals · amber accent sparingly · human copy |
| Professional | No cartoons · no gamification chrome · adult typography |
| Creative | Studio layout · living lesson canvas · editorial titles |
| Minimal | One primary action · progressive disclosure |

## 2.2 Emotional targets

| Feel | Avoid |
|------|-------|
| “I want to work here.” | “Another school admin tool.” |
| Craftsmanship | Template factory |
| Partner intelligence | Chatbot theater |
| Calm confidence | Urgency red everywhere |

## 2.3 Visual inspiration (absorb, do not copy)

Architecture studios · editorial publishing · museums · premium stationery · Scandinavian interiors · modern libraries.

**Forbidden aesthetic clusters:** purple-on-white AI gradients · terracotta-on-cream “AI startup” serif kitsch · dense broadsheet admin · glassmorphism stacks · neon cyber grids.

---

# 3. Visual language

## 3.1 Design values

Elegant simplicity · Invisible technology · Pedagogical clarity · Human-centered interaction · Visual hierarchy · Generous white space · Consistency · Accessibility · Timeless aesthetics.

## 3.2 Form language

| Element | Rule |
|---------|------|
| Shape | Soft rounded rectangles; never sharp enterprise boxes as default |
| Edge | Prefer hairline rings (`rgba(15,23,42,0.08)`) over hard gray borders |
| Depth | Soft ambient shadow — paper on table, not floating neon cards |
| Density | One primary idea per band; air between bands |
| Motifs | Soft radial wash · faint constellation (≤3% opacity) · paper stacks |
| Forbidden | Neon · particles · emoji decoration · 3D glass stacks · purple glow |

## 3.3 The Face of PRIMA

**Guiding Star (Compass Light)** — dual soft diamonds + warm center pulse.  
See DESIGN-002 Ch.4 · `PrimaMark`.

Never: human avatars · robots · cartoons · chat bubbles as brand.

## 3.4 Four orientation questions (every screen)

1. Where am I?  
2. What should I do?  
3. What deserves my attention?  
4. How do I continue?  

If a composition cannot answer these in five seconds, redesign.

---

# 4. Color system

Runtime tokens in `prima-design-tokens.css` are authoritative. This chapter defines **meaning**.

## 4.1 Primary palette

| Name | Hex | Token | Emotional purpose |
|------|-----|-------|-------------------|
| Educational Blue | `#2563EB` | `--prima-primary` | Trust · commitment · “I decide to continue” |
| Blue Hover | `#1D4ED8` | `--prima-primary-hover` | Confident press feedback |
| Blue Soft | `#EFF6FF` | `--prima-primary-soft` | Selected / focus wash — never shout |

**Why blue:** Signals professional education without childish primary-school primaries. Reserved for primary actions and key focus — not large decorative fills.

## 4.2 Secondary palette

| Name | Hex | Token | Emotional purpose |
|------|-----|-------|-------------------|
| Studio Emerald | `#059669` | `--prima-secondary` | Growth · craft · design-in-progress (Studio) |
| Emerald Soft | `#ECFDF5` | `--prima-secondary-soft` | Positive, non-evaluative success wash |
| Guiding Amber | `#D97706` | `--prima-accent` | Warm intelligence · recommendations · star core |
| Amber Soft | `#FFFBEB` | `--prima-accent-soft` | Tip surfaces · gentle attention |

**Why emerald / amber:** Emerald marks creative construction (Designul lecției). Amber marks PRIMA’s quiet insight — gold of attention without alarm.

## 4.3 Neutral palette

| Name | Hex | Token | Emotional purpose |
|------|-----|-------|-------------------|
| Studio Canvas | `#F4F5F7` | `--prima-bg` | Drafting-table calm |
| Paper Surface | `#FFFFFF` | `--prima-surface` | Work sheets / cards |
| Partner Panel | `#FAFBFC` | `--prima-panel` | Slightly cooler PRIMA rail |
| Ink | `#0F172A` | `--prima-text` | Readable authority |
| Slate Mute | `#64748B` | `--prima-text-muted` | Meta · secondary · timestamps |
| Ring | `rgba(15,23,42,0.08)` | `--prima-border` | Structure without heaviness |

**Warm studio variant (canvas accent):** `#FAFAF7` (`--studio-canvas`) for Design Canvas only — paper warmth without cream cliché fills.

## 4.4 Semantic colors

| Role | Hex | Token | Purpose |
|------|-----|-------|---------|
| Danger | `#DC2626` | `--prima-danger` | True errors only — muted use |
| Danger Soft | `#FEF2F2` | `--prima-danger-soft` | Error surfaces |
| Warning | `#D97706` | `--prima-accent` | Needs attention — never panic |
| Success | `#059669` | `--prima-secondary` | Saved · complete — never “grade A” |

**Rule:** Semantic color always pairs with text/icon. Never color-only status.

## 4.5 Accessibility variants

| Need | Treatment |
|------|-----------|
| AA body | Ink on canvas/surface ≥ 4.5:1 |
| Large text / UI | ≥ 3:1 for large titles and icons |
| Focus ring | 2px primary or high-contrast ink on dark mode |
| High contrast mode | Stronger rings; shadows optional off; amber tips get icon+label |
| Color-blind safe | Blue/amber/emerald differentiated by position + label, not hue alone |

## 4.6 Dark mode (future-ready)

Dark mode is **optional calm night studio**, not default brand.

| Role | Hex (target) | Notes |
|------|--------------|-------|
| Canvas | `#0F1419` | Soft charcoal, not pure black |
| Surface | `#1A222C` | Lifted paper |
| Panel | `#151B23` | PRIMA rail |
| Text | `#E8EEF5` | Soft white |
| Muted | `#94A3B8` | |
| Primary | `#3B82F6` | Slightly lighter blue for contrast |
| Amber / Emerald | keep hue, lift lightness ~8–12% | |

Preserve semantic meaning. No neon glow. Pulse opacity reduced.

## 4.7 Print-safe palette

For Print Preview / PDF lesson summaries:

| Screen | Print intent |
|--------|--------------|
| Blue `#2563EB` | CMYK approx C85 M60 Y0 K0 — or solid black for mono printers |
| Emerald / Amber | Convert to grayscale patterns + labels |
| Shadows | Flatten; use 0.3pt rules |
| Backgrounds | White only; no large gray fills that waste toner |

Prefer **structure via typography and rules**, not color blocks, in print.

---

# 5. Typography system

## 5.1 Font stack (target identity)

Runtime may still use transitional stacks; **target identity** is:

| Role | Family | Why for teachers |
|------|--------|------------------|
| **Primary (UI)** | **Source Sans 3** | Humanist sans; excellent Romanian diacritics; calm long-form UI |
| **Secondary (Display)** | **Source Serif 4** | Editorial craft for greetings & lesson titles — “designed,” not “typed in a form” |
| **Monospace** | **IBM Plex Mono** | Rare: version ids, technical meta — never body copy |

**Fallbacks:** `"Source Sans 3", "Segoe UI", ui-sans-serif, sans-serif` · `"Source Serif 4", Georgia, serif` · `"IBM Plex Mono", ui-monospace, monospace`

**Do not use as brand defaults:** Inter · Roboto · Arial · Comic fonts · display novelty faces.

## 5.2 Heading hierarchy

| Level | Size | Weight | Line-height | Use |
|-------|------|--------|-------------|-----|
| Display | 32px / 2rem | 600 | 1.2 | Lesson title · rare hero |
| H1 | 28px / 1.75rem | 600 | 1.25 | Page greeting |
| H2 | 20px / 1.25rem | 600 | 1.3 | Section titles |
| H3 | 18px / 1.125rem | 600 | 1.35 | Block titles |
| H4 | 16px / 1rem | 600 | 1.4 | Card titles |

Max **three** prominent sizes visible in one viewport whenever possible.

## 5.3 Body hierarchy

| Role | Size | Weight | Line-height | Token |
|------|------|--------|-------------|-------|
| Body | **16px min** · preferred 17–18px ([Ch.7](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)) | 400 | 1.55–1.65 | `--text-body` |
| Body emphasis | same | 500–600 | same | |
| Meta | 12–13px (0.75–0.8125rem) | 500 | 1.4 | `--text-meta` |
| Caption | 11–12px | 500 | 1.35 | Rare |

## 5.4 Reading widths

| Context | Max measure |
|---------|-------------|
| Desk supporting sentence | ~40–60ch |
| Studio block body | ≤720px |
| PRIMA panel | full panel width · short paragraphs |
| Long reflection prose | 60–72ch |

## 5.5 Spacing rules (type)

- Paragraph gap ≥ 0.75em  
- Heading → body: 8–12px  
- Section title → content: 16–24px  
- Never all-caps for educational content  
- Sentence case Romanian (UX-002)

## 5.6 Accessibility sizes

| Setting | Behavior |
|---------|----------|
| Default | Body ≥ 15px |
| Large text preference | Scale root; maintain 8pt rhythm |
| Minimum tap label | 14px equivalent |
| Never lock zoom | `user-scalable` allowed |

---

# 6. Spacing system

## 6.1 8-point grid

| Token | Value |
|-------|-------|
| `--space-1` | 4px (half-step · rare) |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |

## 6.2 Application

| Context | Spec |
|---------|------|
| Page margins | 24–32px desktop · 16px tablet |
| Card padding | 20–24px |
| Component gap (inline) | 8–12px |
| Card / block gap | 16–24px |
| Section gap | 32–48px |
| Page rhythm | Alternate content → air → content; never stacked chrome |

## 6.3 Visual breathing rules

1. Whitespace is a **design element**, not empty leftover.  
2. Prefer one more spacing step over one more control.  
3. First viewport: protect air around the primary action.  
4. Dense admin tables are an exception — not the product default.  

---

# 7. Component philosophy

## 7.1 Cards — primary building block

Cards are soft work sheets on the studio table — not dashboard widgets.

| Property | Spec |
|----------|------|
| Corner radius | `--radius-lg` 24px (large surfaces) · `--radius-md` 16px (compact) · `--radius-sm` 10px (chips) |
| Elevation default | `--shadow-soft` `0 8px 30px rgba(15,23,42,0.04)` |
| Elevation hover | `--shadow-hover` `0 12px 40px rgba(15,23,42,0.08)` |
| Border | Prefer ring `--prima-border`; avoid stacked hard rules |
| Hover | +4–8px perceived lift · 150ms |
| Selection | Soft primary wash + ring |
| Focus | 2px ring · 2px offset · visible always for keyboard |
| Expansion | Height ease 200–240ms · content fade |

**Shadow philosophy:** Ambient, low-contrast, almost invisible — paper depth. Never multi-layer neon.

**When not to card:** Hero brand moments · pure typography bands · if removing border/shadow/radius doesn’t hurt understanding.

## 7.2 Buttons

| Kind | Treatment |
|------|-----------|
| Primary | Filled educational blue (Desk) or studio emerald (Designul lecției commitment) · pill/`--radius-full` ok for primary CTA |
| Secondary | Ghost / soft surface |
| Destructive | Muted red · confirmed |

One primary per viewport region.

## 7.3 Icons

| Rule | Spec |
|------|------|
| Family | Lucide or equivalent |
| Stroke | 1.75 |
| Sizes | 16 / 20 / 24 |
| Geometry | Rounded · consistent |
| Tone | Educational without clichés (no apple + chalkboard mashups) |
| Forbidden | Cartoon icons · emoji as UI · icons replacing primary labels |

## 7.4 Panels & shell

`TeachingShell`: workspace + sticky PRIMA rail. PRIMA panel uses `--prima-panel`, Guiding Star, independent scroll.

## 7.5 Forms vs design blocks

Prefer **pedagogical blocks** and progressive fields over long required forms. Forms appear only for settings/account.

---

# 8. Motion language

**Full specification:** [Ch.6 Motion & Interaction System](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)

Motion communicates **continuity · confidence · orientation** — never entertainment.

| Token | Duration | Use |
|-------|----------|-----|
| Micro | 100–150ms | Hover · press |
| Standard | 200–220ms | Panel · route chrome · `--prima-motion` |
| Expand | 240ms | Card expand · `--prima-motion-expand` |
| Pulse | 2400ms loop | Guiding Star / tip — only when meaningful |

**Hard cap:** purposeful UI motion **100–250ms** (pulse loops excepted, and only for presence).

| Allowed | Forbidden |
|---------|-----------|
| Fade + 4–8px rise | Bounce · confetti · parallax marketing |
| Elastic drag ≤12px overshoot | Spinning AI “thinking” theater |
| Soft check on autosave | Looping decorative motion |

**Reduced motion:** durations → 1ms; disable pulse loops.

---

# 9. Imagery

| Type | Direction |
|------|-----------|
| Illustration | Editorial · inclusive · timeless · line + soft fill · limited palette |
| Photography | Authentic learning · natural light · real classrooms · slight desaturation |
| Avoid | Stock “pointing at laptop” · exaggerated AI art · robot teachers · clipart |

**Preference:** Zero illustration on core teaching flows. Imagery only for empty states, marketing, or gentle desk atmosphere.

---

# 10. Accessibility philosophy

| Standard | Requirement |
|----------|-------------|
| WCAG | **AA minimum** |
| Keyboard | Full task completion without pointer |
| Focus | Always visible |
| Contrast | Text and essential UI AA |
| High contrast | Supported theme path |
| Reduced motion | Honored globally via tokens |
| Screen readers | Landmarks · labelled presence · live regions sparingly |
| Feedback | Color-independent (text + icon) |
| Language | Clear Romanian educational voice (UX-002) |

Accessibility is craftsmanship — not a compliance sticker.

---

# 11. Responsive philosophy

| Surface | Intent |
|---------|--------|
| Desktop | Full studio · PRIMA rail |
| Laptop | Optimized; collapsible panels |
| Tablet | Fully usable; drawers for rails |
| Mobile (future) | Companion: read · resume · light edit |

**Desktop-first** for design authorship; never ship broken tablet for core Desk + Studio.

---

# 12. Brand consistency guidelines

## 12.1 Do

- Use tokens, not raw hex in features  
- Keep Guiding Star geometry exact  
- Answer the four orientation questions  
- Cap recommendations; prefer silence  
- Pair every status color with language  

## 12.2 Don’t

- Introduce purple “AI” branding  
- Add mascots or chat-as-home  
- Pack KPI strips into creative surfaces  
- Hardcode Inter/Roboto as permanent brand type  
- Animate for delight alone  
- Copy Moodle / Classroom / Teams / Canva / Notion layouts  

## 12.3 Voice × vision

Visual calm must match verbal calm: experienced colleague, never machine or bureaucracy ([DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · UX-002).

## 12.4 Governance

| Artifact | Role |
|----------|------|
| DOCUMENT-000 | Why / ethics |
| **This chapter (DB-CH01)** | Visual identity Absolute |
| **DB-CH02 PDL** | Visual grammar / interaction laws |
| **DB-CH03 PDS** | Pedagogical component catalog / assembly |
| **DB-CH04 Patterns** | Workflow sequences / transitions |
| **DB-CH05 Journeys** | Intention → outcome arcs |
| **DB-CH06 Motion** | Interaction & motion language |
| **DB-CH07 A11y** | Accessibility & inclusive design |
| **DB-CH08 Responsive** | Device · mode · continuity adaptation |
| **DB-CH09 PAIM** | How teachers experience intelligence (Absolute) |
| **DB-CH10 Blueprint** | Screen library · product structure (Absolute) |
| DESIGN-002 | Product UX specification |
| DESIGN-001 + tokens | Executable system |
| DB-CH11 / DB-CH12… | Surface constitutions |

On visual identity conflict: **DB-CH01 > surface detail > local convenience.**  
On layout/interaction grammar: **DB-CH02 PDL > surface convenience.**  
On component assembly: **DB-CH03 PDS > ad-hoc UI.**  
On workflow grammar: **DB-CH04 Patterns > one-off flows.**  
On end-to-end experience: **DB-CH05 Journeys > disconnected screens.**  
On motion/interaction: **DB-CH06 > local animation choices.**  
On accessibility: **DB-CH07 > aesthetic preference.**  
On responsive/adaptive behaviour: **DB-CH08 > one-off breakpoints.**  
On AI experience: **DOCUMENT-000 ≥ DB-CH09 PAIM > feature AI convenience.**  
On screen inventory: **DB-CH10 > unlisted screens.**  
On product UX structure: DESIGN-002 + surface chapters.  
On ethics: DOCUMENT-000 always wins.

---

# 13. Design principles (normative checklist)

1. **Elegant simplicity** — remove until it breaks clarity, then stop.  
2. **Invisible technology** — teachers feel pedagogy, not algorithms.  
3. **Pedagogical clarity** — labels name teaching, not modules.  
4. **Human-centered** — teacher is author; PRIMA is partner.  
5. **Hierarchy** — title → content → primary action → meta.  
6. **Generous white space** — air is respect.  
7. **Consistency** — same tokens, radii, motion everywhere.  
8. **Accessibility** — AA, keyboard, reduced motion.  
9. **Timeless aesthetics** — no trend-chasing gradients.  
10. **Four questions** — every screen must answer them.

---

# 14. High-fidelity visual direction

## 14.1 Composite picture

Imagine entering a bright studio: light gray floor (canvas), white sheets (cards) with soft shadows, a quiet side desk for a colleague (PRIMA panel) marked only by a Guiding Star. Typography is clear and slightly editorial in titles. The one blue (or emerald, in Studio) button is obvious. Nothing beeps. Nothing purple glows.

## 14.2 Reference frames (internal)

| Frame | Look |
|-------|------|
| Desk first viewport | Brand air · greeting · one CTA · continue strip |
| Design Studio | Navigator · warm canvas blocks · intelligence rail |
| Empty state | Editorial question + few calm paths — not a blank doc |

## 14.3 QA litmus tests

- [ ] Unmistakably not Classroom / Moodle / Teams  
- [ ] Premium calm within 5 seconds  
- [ ] Guiding Star recognized without wordmark  
- [ ] Only one primary commitment control in focus  
- [ ] Motion under 250ms (except presence pulse)  
- [ ] AA contrast · keyboard path · reduced motion  
- [ ] Tokens only — no rogue hex  

---

# 15. Implementation notes

1. Extend `prima-design-tokens.css` when adding dark / studio-canvas / type family tokens.  
2. Migrate UI font from Inter → Source Sans 3 + Source Serif 4 for display.  
3. Showcase `/design-system` is visual QA for components.  
4. Surface chapters refine layout; they must not invent new brand colors.  
5. Studio emerald is a **contextual primary**, not a second logo color.

---

# Success criteria

PRIMA’s visual identity is unique among educational platforms.

Teachers perceive a **premium professional studio for education** — trustworthy, clear, calm, crafted, intelligent.

**The interface feels timeless. The technology disappears. The teaching remains.**
