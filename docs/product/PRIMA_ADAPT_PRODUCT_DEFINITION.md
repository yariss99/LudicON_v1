---
Status: Draft — Product Definition
Code: PRODUCT-ADAPT-001
Title: PRIMA Adapt™ — Product Definition Document
Version: 0.1
Owner: LUDI ON Product Architecture
Priority: Strategic Pillar
Last Updated: July 2026
Authority: Aligns with DOCUMENT-000 (Manifesto) and Design Book Ch.9 (PAIM). Does not override either.
Audience: Product · Pedagogy · Design · Engineering · QA · Legal/Privacy
---

# PRIMA Adapt™  
# Product Definition Document

**Codename:** PRIMA Adapt™  
**Product family:** PRIMA (Teacher Studio)  
**Document type:** Product Definition (architecture & experience)  
**Implementation status:** Design only — no engineering commitment in this document  

---

## Document control

| Item | Value |
|------|--------|
| Purpose | Define the product architecture of PRIMA Adapt™ for a professional software team |
| Out of scope | UI implementation, APIs, data schemas, model selection, sprint tickets |
| Non-goals | Medical diagnosis, clinical assessment, child profiling for ranking, automated silent rewriting of approved materials |
| Canon peers | DOCUMENT-000 · PAIM (DB-CH09) · Pedagogical Design System · Teacher Desk / Studio surfaces |

---

# 1. Product Vision

## 1.1 Purpose

**PRIMA Adapt™** is the PRIMA module that helps teachers **adapt educational resources for inclusive learning** — without forcing them to rebuild materials from scratch.

It exists so that differentiation, accessibility, and support are **design acts**, not afterthoughts, and never a burden that only the most experienced teachers can carry alone.

## 1.2 Why it exists

Teachers already know that one worksheet, one instruction set, or one assessment rarely serves every learner well.

What they lack is **time**, **structured pedagogical options**, and a **safe way** to produce parallel versions of the same learning intention — without:

- rewriting everything manually,
- guessing what “accessible” means in practice,
- or outsourcing judgment to opaque AI.

PRIMA Adapt™ closes that gap.

## 1.3 The educational problem it solves

| Reality today | Cost for teachers | Cost for learners |
|---------------|-------------------|-------------------|
| One resource, one level | Hours of ad-hoc rewriting | Learners left behind or unchallenged |
| Inclusion treated as “extra work” | Burnout and inconsistent quality | Support feels improvised |
| Tools that “adapt the child” | Ethical risk and stigma | Labels replace pedagogy |
| Generic AI chat | Unreliable, unexplainable drafts | Materials that look fine but teach poorly |

**PRIMA Adapt™ solves the problem of scalable, ethical, teacher-controlled resource adaptation** — so inclusive design becomes a first-class workflow inside the Teacher Studio.

## 1.4 Positioning statement

> PRIMA Adapt™ is a pedagogical adaptation system.  
> It never adapts children.  
> It adapts educational resources.  
> AI recommends. Teachers decide.

## 1.5 What PRIMA Adapt™ is / is not

| It is | It is not |
|-------|-----------|
| A resource adaptation studio | A chatbot |
| A differentiation & accessibility workshop | A medical or diagnostic system |
| A teacher-controlled recommendation system | An automatic rewriter of approved lessons |
| A generator of alternative resource versions | A student dossier or ranking engine |
| Explainable pedagogical support | Clinical advice |

---

# 2. Core Principles

These principles are **normative**. Features that violate them are out of product scope.

### P1 — Adapt resources, never children
Language, data models, and UI speak about **materials, tasks, supports, and pathways** — never about “fixing” the learner.

### P2 — Inclusion by design
Adaptation is framed as good teaching for all, not charity for a few. Universal Design for Learning (UDL) spirit: multiple means of engagement, representation, and action/expression.

### P3 — Accessibility as pedagogy
Accessibility is treated as instructional quality (clarity, structure, sensory alternatives, cognitive load) — not as a compliance checkbox alone.

### P4 — Differentiation with dignity
Support tiers and extensions preserve belonging. No ranking, no public labels, no deficit storytelling.

### P5 — Teacher control (absolute)
No adaptation is applied, exported, or published without explicit teacher acceptance. AI may propose; AI never decides.

### P6 — Transparency
Every recommendation carries: **what changes**, **why**, **pedagogical benefit**, **possible trade-offs**, **alternatives**.

### P7 — Reusability
Adaptations produce durable **versions** that can be reused, compared, and archived in the Library — not one-off disposable chats.

### P8 — Minimal disclosure
Learning Profiles store only what is pedagogically necessary. Prefer resource-level adaptations over learner-level data.

### P9 — Silence is valuable (PAIM)
PRIMA suggests only when it can improve teaching. It does not nag, diagnose, or fill space.

### P10 — Continuity of learning intention
Adapted versions must preserve the **same learning goals and success criteria** unless the teacher deliberately changes them. Adaptation ≠ dilution of ambition without consent.

### P11 — Explainable language
Copy uses educational support terminology (e.g. “sprijin vizual”, “instrucțiuni pe pași”, “variantă de evaluare”). Medical and clinical jargon is avoided unless the teacher explicitly introduces it for their own notes.

### P12 — Safety & calm
The module must feel safe enough for sensitive classroom realities: private, non-judgmental, professionally quiet.

---

# 3. User Journey

## 3.1 Primary persona

**Teacher** designing or preparing materials for a mixed-ability class, needing one or more adapted resource versions before teaching.

Secondary: **Specialist support teacher / inclusion coordinator** collaborating on adaptations (future multi-user).

## 3.2 End-to-end workflow

### Step 0 — Entry
Teacher enters PRIMA Adapt™ from:

- Atelier (recommendation or Create path),
- Library (Adapt on a resource),
- Lesson Design Studio / Editor (Adapt this material),
- or an empty Adapt start (“Choose a resource”).

### Step 1 — Resource Selection
Teacher selects the **source resource** (worksheet, lesson segment, activity set, assessment, presentation excerpt, game instructions, etc.).

System shows: title, subject, grade, type, linked learning objectives (if known), last edited.

Teacher confirms: **This is the resource I want to adapt.**

### Step 2 — Intention of Adaptation
Teacher states (or selects) **why** they are adapting — in pedagogical terms, e.g.:

- Make instructions clearer for the whole class  
- Provide a supported pathway for some learners  
- Offer an extension pathway  
- Improve accessibility (visual / reading / pacing)  
- Create an alternative assessment format  

PRIMA may ask **one clarifying question** if intention is ambiguous. It does not interrogate.

### Step 3 — Scope & Constraints
Teacher sets boundaries:

- Keep the same learning objectives? (default: yes)  
- Keep length / duration roughly the same?  
- Languages / reading level preferences  
- Formats allowed (print, digital, oral, multimodal)  
- What must **not** change (e.g. key vocabulary list, curriculum codes)

### Step 4 — Learning Profiles (optional)
Teacher may attach **zero or more Pedagogical Support Profiles** (see §6) — class-level or group-level, never required.

If none: Adapt proceeds with **generic inclusive patterns** (UDL defaults).

### Step 5 — Adaptation Assistant proposes a plan
PRIMA proposes an **Adaptation Plan** (not finished materials yet):

- Recommended adaptation types  
- Expected impact on learners’ access to the task  
- What will change in the resource  
- What will stay the same  
- Risks (e.g. oversimplification)

Teacher can: accept plan · edit plan · remove items · ask for alternatives · dismiss Adapt.

### Step 6 — Differentiation Engine generates draft versions
For each accepted adaptation type, PRIMA generates one or more **draft versions** of the resource.

Versions are clearly labeled (e.g. “Instrucțiuni pe pași”, “Suport vizual”, “Variantă de extensie”).

### Step 7 — Accessibility Review
Automated pedagogical checklist (not a medical audit):

- Clarity of instructions  
- Cognitive load signals  
- Visual hierarchy / contrast guidance (high-level)  
- Alternative response modes present where promised  
- Consistency with stated objectives  

Findings are **recommendations**, never scores that shame the teacher.

### Step 8 — Preview & Compare
Teacher previews:

- Original vs adapted (side-by-side or toggle)  
- Multiple adapted versions against each other  
- “What changed” diff in human language  

### Step 9 — Teacher decision
For each draft version, teacher may:

- **Accept** (promote to resource version)  
- **Edit** (open in Editor / Studio)  
- **Regenerate with constraints**  
- **Discard**  

Nothing is saved as “final” without Accept or Save.

### Step 10 — Export & Place
Teacher places accepted versions into:

- Current Project / Lesson package  
- Library  
- Print / PDF / editable classroom format (as supported)  
- Class delivery pack (future)

### Step 11 — Reflection (light)
Optional: “Ce a funcționat?” after teaching — feeds Memory for future suggestions (teacher-controlled). Never auto-updates profiles from grades alone.

---

# 4. Module Structure

## 4.1 Hierarchy

```text
PRIMA Adapt™
├── 1. Entry & Context
│     ├── Adapt Home
│     └── Context strip (project, lesson, subject, grade)
├── 2. Resource Selection
│     ├── From Project
│     ├── From Library
│     ├── From Editor (current object)
│     └── Upload / paste (bounded, future)
├── 3. Adaptation Intention
│     ├── Intention picker
│     └── Constraints panel
├── 4. Learning Profiles (optional)
│     ├── Profile picker (class / group)
│     ├── Profile editor (ethical fields only)
│     └── “No profile — inclusive defaults”
├── 5. Adaptation Assistant
│     ├── Adaptation Plan
│     ├── Explanations (Why / Benefit / Trade-offs)
│     └── Alternatives
├── 6. Differentiation Engine
│     ├── Version generator
│     ├── Labeling & versioning
│     └── Regeneration controls
├── 7. Accessibility Review
│     ├── Pedagogical checklist
│     └── Suggested fixes (non-blocking)
├── 8. Preview Studio
│     ├── Original · Adapted · Compare
│     └── Change summary
├── 9. Decision & Publish
│     ├── Accept / Edit / Discard
│     ├── Save as version
│     └── Export / Attach to lesson
└── 10. Adapt Library (history)
      ├── Version timeline
      └── Reuse prior adaptations
```

## 4.2 Capability map (product, not engineering)

| Capability | Responsibility |
|------------|----------------|
| **Resource Selection** | Bound the object of adaptation |
| **Adaptation Assistant** | Co-design the plan with the teacher |
| **Learning Profiles** | Optional pedagogical context (ethical) |
| **Differentiation Engine** | Produce alternative resource versions |
| **Accessibility Review** | Quality & access review of drafts |
| **Preview Studio** | Make changes intelligible and comparable |
| **Decision & Export** | Preserve teacher authority and reuse |

## 4.3 Relationship to the rest of PRIMA

| PRIMA surface | Relationship to Adapt |
|---------------|------------------------|
| Atelierul Profesorului | Entry, recommendations (“Adapt this worksheet”) |
| Lesson Design Studio | Adapt activities/assessment before generation or after draft |
| Universal Editor | Open accepted adapted versions for fine editing |
| Library | Store source + adapted versions; “Adapt again” |
| Validation / Quality | Accessibility Review shares vocabulary with Validation Engine |
| Memory | Remembers preferred adaptation patterns **with consent** |

---

# 5. Adaptation Types

Each type is a **pedagogical transformation of a resource**, not a label on a child.

### 5.1 Instruction & language

| Type | What changes |
|------|----------------|
| Instruction simplification | Shorter sentences, clearer verbs, less nesting |
| Instruction chunking | Steps, numbered sequence, “one action at a time” |
| Key vocabulary support | Gloss, icons, example sentences — objectives unchanged |
| Multilingual support (future) | Parallel clarifications; teacher-approved language |

### 5.2 Cognitive load & structure

| Type | What changes |
|------|----------------|
| Reduced cognitive load | Fewer simultaneous demands; progressive reveal |
| Scaffolded activities | Worked example → guided → independent |
| Task decomposition | Complex task split into checkpoints |
| Focused worksheet | Same objective, narrower item set |

### 5.3 Representation & sensory access

| Type | What changes |
|------|----------------|
| Visual support | Diagrams, icons, timelines, highlighted structure |
| Alternative representation | Text ↔ table ↔ image sequence ↔ oral script |
| Reading access layout | Spacing, headings, line length, emphasis hierarchy |
| Print-friendly clarity | High structure for classroom printouts |

### 5.4 Engagement & interaction

| Type | What changes |
|------|----------------|
| Interactive support | Checks for understanding, micro-prompts, choice boards |
| Collaborative variant | Pair/group roles preserving the same objective |
| Motivation framing | Context/story hooks without changing assessment criteria |

### 5.5 Differentiation pathways

| Type | What changes |
|------|----------------|
| Supported pathway | More scaffolds, same success criteria |
| Core pathway | Baseline classroom version (often the refined original) |
| Extension pathway | Deeper / transfer tasks for ready learners |
| Differentiated worksheets | Parallel sheets A/B/C with shared goals |

### 5.6 Assessment & expression

| Type | What changes |
|------|----------------|
| Alternative assessment | Different response mode (oral, visual, practical) for same evidence |
| Rubric clarity | Learner-friendly success criteria |
| Formative micro-check | Short check aligned to one objective |
| Reduced item set (timed contexts) | Fewer items, same construct — teacher must confirm fairness |

### 5.7 Pacing & classroom logistics

| Type | What changes |
|------|----------------|
| Learning pacing | Time boxes, pause points, “if finished early” |
| Teacher script support | Oral delivery notes matching the adapted sheet |
| Station / rotation pack | Same learning intention across stations |

### 5.8 Rules for all types

1. Preserve learning intention unless teacher opts out.  
2. Name the version by **support provided**, not by learner category.  
3. Never invent medical claims.  
4. Prefer parallel dignity: extension and support are both “versions”, not “better/worse kids”.

---

# 6. Learning Profiles

## 6.1 Definition

A **Pedagogical Support Profile** is an optional, teacher-owned record of **how to adapt resources** for a class, group, or recurring instructional situation.

It is **not**:

- a medical record,
- a diagnosis,
- a psychological evaluation,
- a permanent label on a child,
- a ranking or ability score.

## 6.2 What may be stored

Only fields that directly help **resource design**:

| Allowed (examples) | Why |
|--------------------|-----|
| Preferred support patterns (visual, step-by-step, oral options) | Guides adaptation types |
| Classroom access needs stated by teacher (e.g. “prefer larger spacing”) | Resource layout |
| Language of instruction / reading comfort (teacher-estimated bands, not IQ) | Instruction simplification |
| Attention / stamina design preferences (shorter blocks) | Pacing adaptations |
| Preferred response modes (written, oral, drawing) | Alternative assessment |
| Teacher notes for adaptation (“avoid dense paragraphs”) | Local craft knowledge |
| Consent & visibility settings | Ethics |

Profiles may be scoped as:

- **Class profile** (default inclusive patterns),  
- **Group profile** (e.g. “reading support group” as a pedagogical group name chosen by teacher),  
- **Situation profile** (e.g. “substitute day — keep tasks short”).

## 6.3 What must never be stored

| Forbidden | Reason |
|-----------|--------|
| Diagnoses, ICD/DSM codes, clinical labels as system fields | Not a medical system |
| Therapy notes, medication, family medical history | Out of scope & harmful |
| Surveillance data, biometric data | Dignity & privacy |
| Ability rankings, “intelligence” scores, comparative league tables | Anti-inclusion |
| Covert behavioural scores used to auto-adapt without teacher | Violates teacher control |
| Permanent deficit narratives | Language & ethics |

If a teacher pastes sensitive clinical text into free notes, the product must:

- warn that Adapt is not a clinical tool,  
- avoid extracting diagnoses into structured fields,  
- never surface such text in student-facing materials.

## 6.4 Teacher control

- Profiles are **created, edited, archived, deleted** only by the teacher (or school role with explicit permission — future).  
- Attaching a profile to an Adapt run is **always optional**.  
- Teachers can run Adapt with **inclusive defaults only**.  
- Profile influence is shown in the Adaptation Plan (“Based on your Class Support Profile”).  
- Teachers can detach a profile mid-flow.  
- No profile updates from assessment results without explicit teacher confirmation.

## 6.5 Ethical naming

UI copy uses:

- “Profil de sprijin pedagogic”  
- “Preferințe de adaptare”  
- “Nevoi de acces la material”  

Avoid:

- “Dosar elev”  
- “Diagnostic”  
- “Tulburare” as a system category  
- “Elevi slabi / buni”

---

# 7. AI Behaviour

Aligned with **PAIM** and DOCUMENT-000.

## 7.1 Role of AI in Adapt

PRIMA is a **pedagogical colleague**: advisor and drafter of resource alternatives.  
PRIMA is never: clinician, judge, inspector, or decision-maker.

## 7.2 When AI suggests

AI may suggest when:

- Teacher enters Adapt and selects a resource,  
- Teacher asks for help (“Cum pot face instrucțiunile mai clare?”),  
- Accessibility Review finds a clear, actionable issue,  
- Teacher accepts an Adaptation Plan and requests generation,  
- A prior successful adaptation pattern exists **and** teacher has allowed memory reuse.

Suggestions appear as **cards / plan items**, not as chat monologues.

## 7.3 When AI asks

AI may ask **at most a small number of clarifying questions** when:

- Intention is ambiguous (“clarity” vs “extension”),  
- Conflicting constraints exist (same duration + heavy scaffolding),  
- Objectives are missing and preservation cannot be verified.

Questions must be:

- pedagogical,  
- optional to skip,  
- never diagnostic (“Does the student have…?”).

## 7.4 When AI explains

AI **must** explain when proposing or changing anything material:

| Explanation element | Required |
|---------------------|----------|
| What will change in the resource | Yes |
| Why (pedagogical rationale) | Yes |
| Expected benefit for access to learning | Yes |
| Trade-offs / risks | Yes |
| Alternatives | Yes when more than one viable path |

## 7.5 When AI must remain silent

AI stays silent when:

- The resource already meets the stated intention and constraints,  
- The teacher is deep in manual editing and has not invited help,  
- Only speculative or stigmatizing inferences are available,  
- Data would require medical interpretation,  
- Suggestion would change learning goals without being asked,  
- The teacher dismissed a similar tip today (respect dismissal).

## 7.6 Hard behavioural rules

1. **Never auto-apply** adaptations to the canonical resource.  
2. **Never invent learner diagnoses** from text or performance.  
3. **Never rank learners**.  
4. **Never claim clinical certainty**.  
5. **Always allow** “Nu acum” / Discard.  
6. **Prefer resource language** over person language.  
7. If uncertain, ask or offer options — do not bluff.

## 7.7 Voice & tone

Calm · collegial · precise · hopeful · concrete.  
Romanian product voice (UX canon): respectful, professional, free of hype.

---

# 8. User Interface

Screens below are **product definitions** (purpose, hierarchy, components) — not visual mockups.

## 8.1 Adapt Home

**Purpose:** Orient the teacher; start or resume adaptation work.

**Hierarchy:**  
1. Title — PRIMA Adapt™  
2. One-line purpose (“Adaptează resursele, nu elevii.”)  
3. Primary actions  
4. Recent adaptations  
5. Optional recommendation card (max one)

**Components:**  
- Primary: Alege o resursă · Continuă adaptarea  
- Secondary: Gestionează profile de sprijin  
- List: recent version cards (resource name, version labels, date)  
- Empty state: short, encouraging, non-technical

**Buttons:** Alege resursă · Continuă · Deschide în Editor · Șterge draft

---

## 8.2 Resource Selection

**Purpose:** Bind the object of adaptation with confidence.

**Hierarchy:**  
1. Search / filter  
2. Resource results  
3. Selected resource summary  
4. Confirm

**Components:** Tabs or filters (Proiect · Bibliotecă · Resursa curentă) · Resource cards · Objective chips if available · Confirm bar

**Buttons:** Folosește această resursă · Anulează

---

## 8.3 Intention & Constraints

**Purpose:** Capture pedagogical why and non-negotiables before generation.

**Hierarchy:**  
1. Intention choices (large, calm cards)  
2. Constraints (compact panel)  
3. Optional clarifying question (single)

**Components:** Intention cards · Toggle “Păstrează obiectivele” · Duration / format constraints · Free-text “Ce trebuie să rămână neschimbat?”

**Buttons:** Continuă · Înapoi · Folosește valorile implicite

---

## 8.4 Learning Profiles (optional)

**Purpose:** Attach ethical support context — or explicitly skip.

**Hierarchy:**  
1. Explanation of what a profile is / is not  
2. Profile list  
3. Preview of influence  
4. Skip path equally prominent

**Components:** Profile cards · “Fără profil — tipare incluzive” · Edit profile (drawer) · Privacy note

**Buttons:** Atașează · Editează · Continuă fără profil · Înapoi

---

## 8.5 Adaptation Plan (Assistant)

**Purpose:** Agree on what will be created before drafts exist.

**Hierarchy:**  
1. Plan summary  
2. Adaptation type list (selectable)  
3. Per-item explanation  
4. Risks / trade-offs  
5. Confirm generation

**Components:** Checklist of types · Why / Benefit / Trade-off expanders · Alternatives · Version count estimate

**Buttons:** Generează versiuni · Modifică planul · Alternativă · Anulează

---

## 8.6 Generation Progress

**Purpose:** Calm waiting state; no fake “thinking” theatre.

**Hierarchy:** Status · Which versions are being prepared · Cancel

**Components:** Quiet progress · Version placeholders · Cancel control

**Buttons:** Anulează generarea

---

## 8.7 Accessibility Review

**Purpose:** Review drafts for access quality; non-blocking.

**Hierarchy:**  
1. Overall calm summary (“Gata de revizie”)  
2. Findings as recommendations  
3. Link to affected version

**Components:** Recommendation list · Severity as pedagogical priority (not alarmist) · Apply suggestion (creates a new draft delta, still teacher-approved)

**Buttons:** Vezi în Preview · Aplică sugestia · Ignoră · Continuă

---

## 8.8 Preview Studio

**Purpose:** Make differences understandable; support teacher judgment.

**Hierarchy:**  
1. Version switcher  
2. Preview canvas  
3. “Ce s-a schimbat” panel  
4. Decision actions

**Components:** Original | Adapted | Compare · Human-language diff · Objective preservation badge · Notes field

**Buttons:** Acceptă versiunea · Editează · Regenerează · Renunță

---

## 8.9 Decision & Export

**Purpose:** Commit versions into the teacher’s workflow.

**Hierarchy:** Accepted versions · Destination · Confirm

**Components:** Version chips · Destination: Proiect / Bibliotecă / Export · Naming field (teacher-editable labels)

**Buttons:** Salvează · Exportă · Deschide în Editor · Gata

---

## 8.10 Profile Editor (ethical)

**Purpose:** Maintain Pedagogical Support Profiles.

**Hierarchy:** Name · Scope · Support preferences · Notes · Danger zone (archive/delete)

**Components:** Preference toggles (educational) · Explicit forbidden-field absence · Consent/visibility

**Buttons:** Salvează · Arhivează · Șterge

---

## 8.11 Cross-cutting UI rules

- No chat-first layout.  
- One primary recommendation cluster at a time.  
- Always visible: resource name + “draft / accepted” state.  
- Destructive actions require confirm.  
- Focus states WCAG AA; large targets.  
- Romanian first for teacher-facing copy.

---

# 9. Design Language

## 9.1 Emotional brief

PRIMA Adapt™ must feel like a **quiet professional atelier for inclusive design** — not a clinic, not a surveillance console, not a flashy AI demo.

| Feel | Means in practice |
|------|-------------------|
| Calm | Soft surfaces, low visual noise, no urgent red for pedagogy tips |
| Inclusive | Parallel versions treated with equal dignity; careful language |
| Safe | Clear privacy cues; optional profiles; no dark patterns |
| Professional | Precise terms; explainable recommendations |
| Teacher-first | Decisions and edits always one click from the teacher |
| Minimal | Few panels; progressive disclosure; silence when done |

## 9.2 Visual alignment with PRIMA

- Same atelier tokens: white / `#FAFBFC`, soft elevation, 18px radius, blue primary, green for educational success, amber for recommendations.  
- Red only for destructive actions.  
- Motion: 200ms; no dramatic animation.  
- Cards as primary UI objects; no admin-table aesthetic.

## 9.3 Verbal design

Lead with verbs of craft: *adaptează, clarifică, sprijină, oferă o cale, păstrează obiectivul*.  
Avoid: *corectează elevul, remediază deficitul, diagnostichează, normalizează*.

## 9.4 Success moment

Teacher should feel:

> “I created fair access to the same learning — without starting over.”

---

# 10. Future Extensions

Ordered by strategic value, not engineering ease.

1. **Curriculum-aware adaptation packs** — national curriculum codes preserved across versions.  
2. **Class pack export** — one ZIP/PDF with Core / Support / Extension clearly separated for printing.  
3. **Co-teaching mode** — inclusion specialist comments on Adaptation Plan without taking control.  
4. **Post-lesson reflection loop** — which version helped access; teacher-confirmed memory only.  
5. **Subject-specific adapters** — math representations, lab safety clarity, reading genre scaffolds.  
6. **Oral / audio classroom scripts** auto-aligned to adapted worksheets.  
7. **Realtime classroom variant switching** (delivery era) — teacher picks version live; still teacher-driven.  
8. **School library of anonymized adaptation patterns** — share patterns, never learner dossiers.  
9. **Accessibility deeper checks** — structured reading level bands as *teacher-tunable*, not clinical.  
10. **Parent-facing explanation sheets** (optional) — “How to support practice at home” without labels.  
11. **Assessment fairness advisor** — warns when reduced items may affect construct coverage.  
12. **Multimodal authoring** — generate visual sequence + text twin as linked versions.

---

# 11. Success Metrics (product)

Qualitative and quantitative signals — not vanity AI metrics.

| Signal | Indicates |
|--------|-----------|
| % Adapt sessions ending in ≥1 Accepted version | Usefulness |
| Time from resource select → first accepted version | Efficiency |
| Rate of plan edits before generate | Teacher agency (healthy if moderate) |
| Discard rate after preview | Quality of drafts |
| Reuse of adapted versions in Library | Reusability |
| Profile attach rate vs skip rate | Trust in optional profiles |
| Teacher survey: “preserved learning intention” | Pedagogical integrity |
| Zero incidents of diagnostic language in system fields | Ethical compliance |

---

# 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Product drifts into medical framing | Principle lock; copy review; forbidden fields |
| Oversimplification lowers ambition | Objective-preservation default; trade-off explanations |
| Stigmatizing version names | Naming guidelines; block learner-category labels |
| Teachers over-trust AI | Mandatory explanations; Accept required; edit path |
| Privacy leakage via notes | Warnings; no structured extraction of diagnoses |
| Feature becomes chatbox | Plan + cards architecture; no chat-first UI |

---

# 13. Open Questions (for Sprint 0 workshops)

1. First vertical: worksheets only, or also assessments + lesson segments?  
2. Minimum viable adaptation types for v1 (proposed: instruction chunking, visual support, supported pathway, extension pathway, alternative assessment).  
3. School admin visibility into profiles — none in v1?  
4. Naming of versions in Romanian classrooms (teacher-editable templates).  
5. Relationship to Validation Engine outputs — shared checklist taxonomy.

---

# 14. Summary for the team

**PRIMA Adapt™** is a defining pillar because it turns inclusion from heroic overtime into a **repeatable design practice**.

It succeeds only if every screen, dataset, and AI behaviour repeats the same truth:

> We adapt the resource.  
> We respect the learner.  
> The teacher remains the author of learning.

---

**End of Product Definition Document — PRIMA Adapt™ (PRODUCT-ADAPT-001)**
