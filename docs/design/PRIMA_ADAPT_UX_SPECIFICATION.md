---
Status: Draft — UX Specification
Code: UX-ADAPT-001
Title: PRIMA Adapt™ — UX Specification
Version: 0.2
Owner: LUDI ON Product Design
Priority: Strategic Pillar
Last Updated: July 2026
Authority: Implements PRODUCT-ADAPT-001. Aligns with DOCUMENT-000 · PDL · PAIM · DB-CH06 · DB-CH07.
Audience: Product Design · Figma · UX Writing · Frontend · QA · Pedagogy
Handoff: Experience brief for Figma. Not wireframes. Not engineering tickets.
---

# PRIMA Adapt™  
# UX Specification Document

**Product:** PRIMA Adapt™  
**Document type:** Complete User Experience Specification (Figma handoff)  
**Companion:** [PRODUCT-ADAPT-001 — Product Definition](../product/PRIMA_ADAPT_PRODUCT_DEFINITION.md)  
**Voice:** Romanian for teacher-facing UI · English for this specification  

---

## 0. How to use this document

| For Figma designers | For UX writers | For QA |
|---------------------|----------------|--------|
| Every frame must pass the Dual Value Test below | Copy must state workload saved + learning gained | Fail any screen that adds steps without pedagogical gain |
| Prefer pedagogical clarity over visual spectacle | Never invent clinical language | Validate empty / loading / success / error / focus / reduced motion |

**Experience metaphor:** working beside an experienced pedagogical mentor — never forms, never settings panels, never ChatGPT.

---

# ABSOLUTE REQUIREMENT — Dual Value Test

Every screen, component cluster, and interaction **must** answer:

> **How does this reduce the teacher's workload while improving learning opportunities for every child?**

### Pass criteria (both required)

| Side | The screen must clearly… |
|------|--------------------------|
| **Workload** | Remove rewriting, guesswork, or decision fatigue — or make an unavoidable decision take seconds |
| **Learning** | Increase access, clarity, dignity, or pathways to the **same** learning intention for diverse learners |

### Fail → redesign

If a screen only looks premium, only collects data, only “shows AI working,” or only adds configuration without classroom benefit — **cut or redesign it**.

**Priority order:** Pedagogical value → cognitive ease → visual polish.  
Never the reverse.

### Design consequences applied in v0.2

| Finding | Redesign |
|---------|----------|
| 8-step chrome felt like software setup | **6 teaching beats** |
| Support Profile risked becoming a form | **Smart support suggestions**; skip is the default happy path |
| 8 equal option cards caused choice overload | **1-click Adaptation Packs** + optional refine |
| Comparison + Review duplicated judgment | **Merged** into one Review & Compare screen |
| Export listed 5 equal formats | **Classroom-first** destinations; advanced formats secondary |
| Teacher notes on primary path | **Removed from happy path** (optional later, not required) |

---

# 1. Experience vision

## 1.1 North star feeling

> “In a few calm decisions, I produced fair access to the same learning — without rewriting everything.”

## 1.2 Experience principles

| Principle | Design implication |
|-----------|-------------------|
| Dual value always | No screen without workload ↓ and learning ↑ |
| Teacher-first | Craft verbs; AI secondary |
| Calm | One job per screen |
| Inclusive | Parallel versions; no deficit language |
| Minimal | Defaults over empty grids |
| Pedagogically intelligent | Packs named by classroom outcome |
| Accessible | WCAG AA; reduced motion |
| Emotionally reassuring | Recoverable errors; never judgment |

## 1.3 Anti-patterns

- Extra steps that don’t change the classroom resource  
- Chat-first UI  
- Dense preference forms  
- Medical / diagnostic framing  
- Duplicate confirmation screens  
- Visual complexity that hides the pedagogical point  

## 1.4 Global shell (simplified)

**Chrome:** Teacher Studio shell. Adapt content max ~1100px.

**Persistent header (after resource is chosen):**

1. Resource name (always visible — anchors purpose)  
2. Compact step rail (6 beats)  
3. Ghost: `Salvează draft`

**Footer:** `Înapoi` · one primary CTA  

**Step rail — 6 teaching beats (not 8 admin steps):**

| # | Label (RO) | Job |
|---|------------|-----|
| 1 | Start | Enter with purpose |
| 2 | Resursă | Reuse what exists |
| 3 | Sprijin | Optional refine (skippable) |
| 4 | Pachet | Choose adaptation pack |
| 5 | Pregătire | PRIMA works; teacher rests |
| 6 | Revizie & export | See value → accept → use in class |

Back is always safe. Draft persists.

---

# 2. Emotional design

| Moment | Feel | Dual-value cue on screen |
|--------|------|---------------------------|
| Entry | Invited | “Without rewriting from zero” |
| Resource | Oriented | “Reuse your material” |
| Support | Safe, optional | “Skip — inclusive defaults already on” |
| Pack | Capable | “One tap → classroom-ready supports” |
| Planning | Trusting | Messages about saved hours + clearer access |
| Review & export | Confident, done | Objectives kept · versions ready for class |

---

# 3. Visual language (pedagogy over spectacle)

- Background `#FAFBFC` · white cards · soft elevation · 18px radius  
- Blue primary · green = learning preserved/improved · amber = suggestion · red = destructive only  
- Type: Hero (entry only) · Section · Card · Body · Caption  
- Illustration: rare, quiet, non-clinical  
- **Rule:** If decoration competes with “what the learner gains,” remove decoration  

---

# 4. Design system (usage rules)

Cards · buttons · chips · progress · empty states as in atelier PRIMA — with one Adapt rule:

> Interactive complexity is allowed **only** when it shortens teacher work or clarifies learning gain.

Selection: soft blue wash + check.  
Recommended: amber eyebrow `Recomandat pentru clasă`.  
Success: green `Obiective păstrate` / `Gata de clasă`.

---

# 5. Microinteractions

| Interaction | Spec | Dual-value note |
|-------------|------|-----------------|
| Hover | 200ms · −4px · scale 1.02 | Affordance only on actionable cards |
| Focus | Visible blue ring | Faster keyboard completion = less friction |
| Selection | Instant | No multi-page confirmations |
| Planning | Soft pulse + one message | Waiting must feel like work done *for* the teacher |
| Success | Quiet check | No confetti (noise ≠ value) |
| Undo | 6–8s toast | Prevents fear of exploring |
| Reduced motion | No scale/slide | Access is pedagogical too |

---

# 6. Accessibility

Keyboard · SR · AA contrast · 200% zoom · reduced motion · ≥44px targets.  
Accessible design **is** part of “every child” — not a separate track.

---

# SCREEN 1 — Entry Point

**Trigger:** `🌱 Adapt for Inclusive Education` (Atelier / Library / Studio).

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| One tap into a guided path instead of blank-page rewriting | Frames inclusive adaptation as normal teaching craft for the whole class |

## Purpose

Start Adapt with zero configuration. State the promise. Move to resource choice.

## Layout

- Centered calm hero (~560–640px text measure)  
- Eyebrow · headline · **one** value line · **one** primary CTA  
- Below fold only: **Continue unfinished** (max 2 drafts) — hidden if none  

**Removed from v0.1:** “Cum funcționează” as competing CTA (moves to tiny text link). Recent list capped and optional.

## Hierarchy

1. `PRIMA Adapt™`  
2. Headline  
3. Value line (workload + learning)  
4. `Alege o resursă`  
5. Quiet drafts (if any)

## Copy (RO)

- **Headline:** `Adaptează resursa — nu refaci lecția`  
- **Value line:** `Creează variante incluzive în câteva minute, păstrând aceleași obiective pentru toți elevii.`  
- **Primary:** `Alege o resursă`  
- **Tiny link:** `Ce face Adapt`

## Interactions

Primary → Screen 2 · Draft card → resume · Tiny link → 3-line drawer  

## States

| State | Treatment |
|-------|-----------|
| No drafts | Omit section |
| Loading drafts | 2 skeletons |
| Error drafts | Ignore; keep primary CTA |

---

# SCREEN 2 — Resource Selection

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| Reuses an existing lesson/worksheet/etc. instead of rebuilding | Adaptation improves **this** classroom material’s access paths |

## Purpose

Select the source resource in the fewest taps possible.

## Layout

- Title: `Ce material adaptezi azi?`  
- Help (one line): `Pornești de la ceva ce ai deja — PRIMA creează variantele.`  
- Type chips: Lecție · Fișă · Joc · Prezentare · Evaluare  
- Search  
- Resource grid  
- **Inline preview** on select (not a heavy separate workflow)  
- Sticky: `Folosește această resursă`

**Deep link:** From Library/Studio with resource preselected → land with confirm bar ready (skip browsing).

## Hierarchy

Title → chips/search → grid → confirm  

## Components

Resource card: type icon · title · subject · grade · updated  
Preview: thumbnail + objectives (if known) — silence if unknown  

## Interactions

Select → preview · Confirm → Screen 3 · Back → Entry  

## States

Empty · no hits · loading skeletons · load error with Retry — primary browsing still possible via project tab.

---

# SCREEN 3 — Learning Support (redesigned)

> **v0.1 problem:** Six preference groups felt like configuring a dossier — workload ↑ without guaranteed learning ↑.  
> **v0.2:** This screen is a **30-second optional refine**, not a profile workshop.

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| Default path is **skip** — inclusive defaults already applied; no form required | Optional chips tune access (language, visuals, pacing, expression) for *this* class context |

## Purpose

Offer light personalization **only if the teacher wants it**. Never block progress.

## Layout (happy path first)

1. Ethical one-liner (not a banner wall)  
2. **Primary path (largest):**  
   `Continuă cu sprijin incluziv standard`  
   Caption: `Potrivit pentru majoritatea claselor mixte.`  
3. **Secondary path:**  
   `Personalizează pe scurt` → reveals **max 6 chips** (not grouped essays)  
4. Optional: reuse a saved class support preset (one dropdown) — never required  

## Chips (educational supports only)

| Chip | Classroom meaning |
|------|-------------------|
| Instrucțiuni pe pași | Clearer task access |
| Suport vizual | Multiple representations |
| Sarcini eșalonate | Manageable cognitive load |
| Răspuns oral / vizual | More ways to show learning |
| Ritmare & pauze | Time access |
| Verificări scurte | Stay with the lesson |

Amber: up to **2** suggested chips from resource type. Teacher can ignore.

## Labels & help

- Title: `Vrei să personalizezi sprijinul?`  
- Help: `Opțional. Poți sări — Adapt rămâne incluziv.`  
- Never diagnostic labels  

## Interactions

- Standard continue → Screen 4 with defaults  
- Toggle chips → Continue  
- Save preset only after chips chosen (ghost)  

## States

No presets → hide dropdown · save error non-blocking · skip always available  

## Emotional tone

Permission to skip = respect. Personalize = empowerment, not obligation.

---

# SCREEN 4 — Adaptation Pack (redesigned)

> **v0.1 problem:** Eight equal cards created decision fatigue.  
> **v0.2:** Teacher picks a **classroom outcome pack** in one tap; details are optional.

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| One decision instead of assembling eight toggles | Pack encodes proven supports: clarity, scaffolds, pathways, assessment access |

## Purpose

Choose **what kind of inclusive improvement** the resource should receive.

## Layout

- Title: `Ce vrei să obții pentru clasă?`  
- Subtitle: `Alege un pachet. Poți ajusta detaliile după.`  
- **3 large pack cards** (primary)  
- Ghost: `Ajustează opțiunile` → expands fine-grain toggles (advanced, collapsed)

## Pack cards

| Pack | Saves teacher from… | Improves learning by… |
|------|----------------------|------------------------|
| **Claritate pentru toți** | Rewriting dense instructions by hand | Clearer language + visual structure for every learner |
| **Sprijin + extensie** | Building two worksheets manually | Parallel pathways; same objectives; dignity for all |
| **Evaluare accesibilă** | Inventing alternate checks overnight | Multiple ways to show the same learning |

Each pack shows 3 bullet “includes” (e.g. pași · exemplu ghidat · variantă de sprijin).

Recommended pack: amber edge from resource type (worksheet → Claritate; assessment → Evaluare).

## Fine-grain (optional refine)

Same eight adaptation types as product architecture — **hidden** until teacher opens refine. Pre-checked according to pack.

## Interactions

- Select pack (single) → enable `Pregătește adaptarea`  
- Refine toggles optional  
- CTA → Screen 5  

## States

Recommendation load fail → show 3 packs without amber · no empty grid of eight  

---

# SCREEN 5 — AI Planning

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| Teacher waits briefly while PRIMA does the rewriting labor | Messages state access/clarity gains being prepared |

## Purpose

Make waiting feel like **delegated craft**, not a spinner tax.

## Layout

Centered · Prima pulse · headline · **one** benefit message · indeterminate bar · `Anulează`

## Headline

`PRIMA pregătește varianta pentru clasă`

## Messages (cycle — each must cite dual value)

1. `Economisești rescrierea manuală — păstrăm obiectivele.`  
2. `Clarificăm accesul la sarcină pentru toți elevii.`  
3. `Adăugăm sprijinul ales, fără a dilua învățarea.`  
4. `Pregătim o variantă pe care o poți accepta sau modifica.`  

## Interactions

Cancel → back to pack with selections kept · Success → Screen 6  

## States

Error: `Nu am putut pregăti varianta` + Retry / Change pack / Cancel — never blame  

---

# SCREEN 6 — Review & Compare (merged)

> **v0.1 problem:** Comparison then Pedagogical Review forced two judgment passes.  
> **v0.2:** One screen to **see the gain, trust the pedagogy, accept for class**.

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| One review instead of two; Accept goes straight toward classroom use | Teacher verifies access improvements + preserved objectives before sharing |

## Purpose

Understand Original → Adapted, confirm pedagogical integrity, accept or adjust.

## Layout

**Top strip (pedagogy proof — 3 lines max):**

1. Green: `Obiective păstrate`  
2. Green/amber: `Sprijin adăugat: …` (short)  
3. Green: `Acces îmbunătățit: …` (short)  

**Main:** Original | Adapted panes (desktop) or Adapted-first toggle (mobile)  

**Side/bottom:** `Ce s-a schimbat` — 3–5 human bullets (Why on expand only)  

**Footer decisions:**

- Primary: `Acceptă pentru clasă`  
- Secondary: `Editează`  
- Ghost: `Schimbă pachetul` · `Regenerează`  

**Removed from happy path:** Teacher notes field; separate Review screen; sync-scroll complexity (nice-to-have later).

## Highlight system

Green = clarity/access · Amber = added support · Blue = structure — always paired with labels in the change list.

## Interactions

Accept → Screen 7 Export · Edit → Editor with return · Change pack → Screen 4 · Regenerate → Screen 5  

## States

Preview load skeletons · render error with Editor fallback · risk note (amber) if item count dropped — ask confirm, don’t block with fear  

---

# SCREEN 7 — Export & Use (was Screen 8)

## Dual Value Answer

| Workload ↓ | Learning ↑ |
|------------|------------|
| Puts the version where teaching happens — lesson pack / print — without extra reformatting hunt | Learners meet the adapted material in the actual lesson pathway |

## Purpose

Deliver the accepted version into classroom reality fast.

## Layout

Title: `Cum folosești varianta mâine la clasă?`

### Primary destinations (large, equal — classroom-first)

| Destination | Why it exists |
|-------------|---------------|
| **Atașează la lecție** | Zero-friction: material lives with the teaching plan |
| **PDF pentru print** | Immediate inclusive paper copies |
| **Salvează în Bibliotecă** | Reuse next week / next class |

### Secondary (collapsed “Alte formate”)

DOCX · Interactiv · Learning App · Prezentare  

**Rationale:** Five equal cards were visual complexity without clearer pedagogy. Classroom-first reduces time-to-use.

## Interactions

Select one or more primaries → `Finalizează` · Success completion  

## Completion

- `Varianta e gata de clasă`  
- Chips of what was saved  
- `Deschide lecția` · `Înapoi în Atelier` · `Adaptează altă resursă`  

## States

Unavailable format → “În curând” in secondary only · partial export retry · accepted version never deleted on failure  

---

# 7. End-to-end flow (v0.2)

```text
Entry
  → Resource Selection
  → Learning Support (skip-default)
  → Adaptation Pack (1-click)
  → AI Planning
  → Review & Compare (accept)
  → Export & Use
  → Completion
```

**Escape hatches:** Înapoi · Salvează draft · Anulează + Undo  

---

# 8. Dual Value matrix (spec summary)

| Screen | Workload reduction | Learning opportunity |
|--------|--------------------|----------------------|
| Entry | Instant guided start | Inclusive framing for every learner |
| Resource | Reuse existing material | Improve *this* resource’s access |
| Support | Skip-default; optional chips | Tuned access without labeling children |
| Pack | One pedagogical decision | Clarity / pathways / assessment access |
| Planning | Delegated rewriting labor | Access supports being built |
| Review & Compare | Single accept judgment | Verify fairness + preserved goals |
| Export & Use | Straight into lesson/print | Learners receive the adapted path |

---

# 9. Content rules (updated)

1. Every headline or value line should imply **time saved** or **access gained** (ideally both).  
2. Address the resource, not the child.  
3. Prefer `sprijin`, `acces`, `variantă`, `claritate`.  
4. Buttons: Alege · Continuă · Pregătește · Acceptă · Finalizează.  
5. If copy can’t explain dual value in one sentence, the UI is too abstract — simplify.

---

# 10. Responsive · Motion · a11y

Unchanged intent from v0.1: calm 200ms motion, reduced-motion safe, WCAG AA, large targets.  
**Extra:** On small screens, pack cards stack; Review shows Adapted first; Export shows 3 primaries only.

---

# 11. QA — Dual Value gate

Before shipping any frame:

- [ ] Can a designer point to **workload ↓** in one sentence?  
- [ ] Can a designer point to **learning ↑ for every child** in one sentence?  
- [ ] Could any control be removed without harming those two? If yes → remove  
- [ ] Skip/defaults available wherever configuration isn’t essential  
- [ ] No duplicate confirmation screens  
- [ ] Classroom destination reachable in ≤2 actions after Accept  
- [ ] No medical language  
- [ ] Keyboard + reduced motion verified  

---

# 12. Figma structure (v0.2)

```text
PRIMA Adapt™ / UX
├── 00 Dual Value Test & Principles
├── 01 Entry
├── 02 Resource Selection
├── 03 Support (skip-default)
├── 04 Adaptation Pack
├── 05 Planning
├── 06 Review & Compare
├── 07 Export & Use
├── 08 Components & States
└── 09 a11y & Motion
```

Annotate **every frame** with a Dual Value Answer block in the description.

---

# 13. Closing brief

If a screen is beautiful but does not save the teacher time **and** widen learning access, it is not PRIMA Adapt™.

Design for the teacher who has 12 minutes before class and a room of different learners —  
not for a portfolio of complexity.

**Success line:**  
*“I didn’t rebuild the lesson. Every child can better reach the same learning.”*

---

**End of UX Specification — PRIMA Adapt™ (UX-ADAPT-001 · v0.2)**
