# PRIMA Design Book — Chapter 3  
# Pedagogical Design System (PDS)

Version: 1.0  
Status: Core System  
Priority: Critical  
Audience: Product Design · UX · UI · Frontend · Pedagogy · QA  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) · [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md)  
**Data model:** [FEATURE-002 POM](../engineering/FEATURE-002_PEDAGOGICAL_OBJECT_MODEL.md) · `@prima/contracts` `prima-pedagogical-objects`  
**Executable UI:** [DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md) · `src/design-system/`  
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

Define the complete library of **pedagogical components** used throughout PRIMA.

| PDS is | PDS is not |
|--------|------------|
| Organized around pedagogical meaning | A widget catalog (Button, Input, Modal…) |
| Teaching concepts as components | Technology-first UI kits |
| The exclusive assembly kit for screens | Optional patterns |

**Technology serves pedagogy. Never the opposite.**

Every future screen in PRIMA must be assembled **exclusively** from PDS components (Levels 1–5).  
No screen may invent new interaction patterns. Consistency is a pedagogical value.

### Authority

| Layer | Wins on |
|-------|---------|
| DOCUMENT-000 | Ethics · teacher authorship |
| DB-CH01 | Brand identity · tokens mood |
| DB-CH02 PDL | Laws · zones · grammar |
| **DB-CH03 PDS** | Component catalog · pedagogical anatomy · assembly |
| DB-CH04 Patterns | Workflows that compose PDS components |
| FEATURE-002 POM | Persistent object model |
| DESIGN-001 | Runtime primitives implementing PDS |

---

# 1. Design philosophy

Teachers think in:

objectives · activities · resources · assessment · reflection · competencies · students · feedback

PRIMA uses the **same mental model**.

| Teacher concept | PDS expression |
|-----------------|----------------|
| Objective | Objective Block |
| Activity | Activity Card / Learning Activity |
| Resource | Resource Shelf · Learning Resource |
| Assessment | Assessment Builder / Card |
| Reflection | Reflection Block / Workspace |
| Competency | Competency Card · Competency Map |
| Student needs | Differentiation Panel · Student Adaptation Card |
| Feedback / evidence | Learning Evidence Card · Observation Panel |

UI chrome exists only to host these meanings ([PDL Law 2](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md)).

---

# 2. Pedagogical objects (fundamental blocks)

Each object has: **Identity · Purpose · Visual Language · Interactions · Relationships · Lifecycle · Accessibility.**

Romanian UI labels follow UX-002. English names below are catalog IDs.

## 2.1 Catalog

| Object ID | Teacher label (RO) | Purpose |
|-----------|--------------------|---------|
| `learning_experience` | Experiență de învățare | Top-level intentional learning design |
| `lesson_design` | Designul lecției | Structured lesson as living design |
| `learning_objective` | Obiectiv de învățare | What learners will be able to do |
| `competency` | Competență | Curriculum / skill anchor |
| `success_criteria` | Criterii de succes | How success is recognized |
| `learning_activity` | Activitate de învățare | Timed pedagogical move |
| `learning_resource` | Resursă | Material / POM object / link |
| `assessment` | Evaluare | Evidence gathering design |
| `reflection` | Reflecție | Teacher or learner reflective practice |
| `differentiation` | Diferențiere | Support / core / extension paths |
| `observation` | Observare | In-class noticing (private) |
| `evidence_of_learning` | Dovezi de învățare | Artifacts / signals of learning |
| `homework` | Temă | Out-of-class practice |
| `extension_activity` | Activitate de extindere | Stretch beyond core |
| `cross_curricular_connection` | Legătură interdisciplinară | Links across subjects |
| `student_support_strategy` | Strategie de sprijin | Inclusion / scaffolding |

**POM bridge:** Materialized classroom resources map to FEATURE-002 types (`worksheet`, `presentation`, `assessment`, …). PDS objects above include **design-time** concepts that may not yet be POM instances.

## 2.2 Shared object contract

Every pedagogical object component documents:

```
Identity        — stable id · type · teacher-facing name
Purpose         — one sentence pedagogical job
Visual Language — card/block anatomy · tokens
Interactions    — create · edit · link · reorder · dismiss
Relationships   — allowed edges (see §4)
Lifecycle       — draft → … → archived (see §5)
Accessibility   — name · role · keyboard · status text
```

---

# 3. Component hierarchy

## LEVEL 1 — Foundation Components

From [Ch.1](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) + tokens:

Typography · Colors · Spacing · Icons · Grid · Motion · Elevation · Tokens

**Rule:** No pedagogical component may introduce private foundation values.

## LEVEL 2 — Universal Components

Buttons · Inputs · Dropdowns · Checkboxes · Tabs · Search · Badges · Dialogs · Tooltips · Navigation

Implemented via DESIGN-001 (`PrimaButton`, `StatusBadge`, …).  
**Rule:** Universals never appear alone as the “point” of a screen — they serve Level 3+.

## LEVEL 3 — Pedagogical Components

| Component | Pedagogical meaning |
|-----------|---------------------|
| Activity Card | A learning activity as an idea |
| Objective Block | One learning objective |
| Competency Card | One competency with mapping state |
| Assessment Builder | Structured assessment design unit |
| Timeline Section | Ordered phase in the lesson sequence |
| Reflection Block | Reflective prompt / unfinished reflection |
| Differentiation Panel | Support / core / extension controls |
| Resource Shelf | Curated collection of resources |
| Learning Evidence Card | One evidence item |
| Curriculum Alignment View | Objectives ↔ competencies ↔ curriculum |
| Learning Sequence | Ordered activities / phases |
| Teacher Notes | Private professional notes |
| Observation Panel | Classroom observation capture |
| PRIMA Recommendation Card | Optional explainable tip |
| Knowledge Insight | KHPM insight (non-evaluative) |
| Student Adaptation Card | SLI-informed adaptation (teacher-approved) |

## LEVEL 4 — Composite Components

| Composite | Assembles |
|-----------|-----------|
| Lesson Canvas | Pedagogical blocks + DnD sequence |
| Lesson Timeline | Timeline Sections + time balance |
| Competency Map | Competency Cards + links |
| Assessment Dashboard | Assessment units + coverage (non-ranking) |
| Learning Journey | Experience arc across lessons |
| Publishing Workspace | PDE destinations + preview |
| Reflection Workspace | RPTI flow |
| Knowledge Workspace | KHPM search · shelves · patterns |

## LEVEL 5 — Experience Templates

Prefabricated assemblies for creation entry:

Lesson Design · Worksheet Builder · Presentation Builder · Assessment Builder · Project Builder · Learning Story · Educational Game · Portfolio

Templates **compose** Levels 3–4; they never invent new interaction laws.

---

# 4. Pedagogical Card Model

Every pedagogical card follows **identical rules**. Only content changes. Familiarity reduces cognitive load (PDL Law 5 · Law 9).

```
┌─────────────────────────────────────────────────────────┐
│ Header          Title · type icon (optional) · menu     │
│ Purpose         One-line pedagogical why                │
│ Content         Core fields / body                      │
│ Metadata        Subject · grade · time · tags           │
│ Actions         Primary / secondary (contextual)        │
│ Status          Lifecycle badge                         │
│ Suggestions     PRIMA tips (optional · dismissible)     │
│ Relationships   Linked chips (objectives · comps …)     │
│ History         Version / last edited (progressive)     │
└─────────────────────────────────────────────────────────┘
```

| Region | Rules |
|--------|-------|
| Header | Always present · sentence-case RO |
| Purpose | Required for Level 3 cards · max ~140 chars |
| Content | Progressive disclosure for advanced fields |
| Metadata | Muted · never louder than content |
| Actions | One local primary max; global primary stays in Context/Primary Zone |
| Status | Semantic badge + text (not color-only) |
| Suggestions | ≤2 per card visible; explainable |
| Relationships | Chips navigate / highlight related objects |
| History | Collapsed by default |

**Visual tokens:** `--radius-lg` · `--shadow-soft` · ring border · hover `--shadow-hover` (Ch.1 / PDL).

---

# 5. Relationships

Objects are connected. Teachers should **always be able to see** relevant relationships.

| From | Typically connects to |
|------|------------------------|
| Learning Objective | Activities · Assessment · Competencies · Success Criteria · Evidence · Differentiation · Reflection |
| Competency | Objectives · Activities · Assessment · Curriculum Alignment |
| Learning Activity | Objectives · Resources · Assessment · Time · Differentiation |
| Assessment | Objectives · Evidence · Success Criteria |
| Reflection | Lesson Design · Evidence · Professional growth tips |
| Differentiation | Activities · Student Support Strategy · Adaptation Cards |
| Learning Resource | Activities · Lesson Design · POM instance |

**UI patterns:**

- Relationship chips on cards  
- Curriculum Alignment View for dense graphs  
- Soft highlight of related blocks on hover/focus in Lesson Canvas  

Never hide a critical pedagogical link behind an unlabelled icon.

---

# 6. Visual states

| State | Meaning | Color language | Icon / motion |
|-------|---------|----------------|---------------|
| Draft | Not ready | Gray structure | Quiet pencil / none |
| In Progress | Active design | Blue soft wash | Soft pulse optional |
| Completed | Design-ready (teacher view) | Emerald soft | Calm check |
| Published | Delivered / shared | Emerald | Stable · no pulse |
| Archived | Inactive | Muted gray | No motion |
| Suggested | PRIMA-proposed | Amber soft | Star hint |
| Recommended | Stronger optional tip | Amber | Subtle pulse once |
| Needs Attention | Requires teacher look | Amber → muted red if blocking | Persistent badge · no alarm animation |

Map to POM where applicable: `draft` · `needs_review` · `ready` · `published` · `archived` · `superseded`.

**Every state has:** Color · Icon · Motion · Meaning — and a **text label** in Romanian.

---

# 7. AI components

AI never replaces pedagogical components. It **enhances** them.

| AI component | Enhances | Rule |
|--------------|----------|------|
| Recommendation Banner / Card | Any Level 3–4 | Optional · explainable · dismissible |
| Alternative Strategy Card | Activity / Differentiation | Teacher applies |
| Time Balance Indicator | Lesson Timeline | Non-judgmental |
| Learning Gap Alert | Evidence / SLI | Private · calm |
| Assessment Coverage Indicator | Assessment Dashboard | Coverage ≠ grade |
| Differentiation Suggestion | Differentiation Panel | Teacher-approved |
| Accessibility Review | Lesson Canvas / Resources | Checklist tone |

Guiding Star presence signals tips ([DESIGN-002 Ch.4](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md)). Cap density (PDL AI language).

---

# 8. Interaction rules

Every Level 3 pedagogical component **supports** (as applicable to type):

| Interaction | Spec |
|-------------|------|
| Drag / Drop | Reorder in canvas/sequence · keyboard alternative required |
| Duplicate | Insert sibling · soft flash |
| Collapse / Expand | Persist preference when local |
| Comment / Annotate | Non-blocking · teacher-owned |
| Version History | Progressive disclosure |
| Undo | Global + local where safe |
| Quick Actions | Contextual · not a 40-tool ribbon |
| Keyboard Access | Full parity for critical tasks |

Level 4 composites orchestrate these without new gesture languages.

---

# 9. Consistency rules

| Element | Must be identical across product |
|---------|----------------------------------|
| Cards | Anatomy §4 · elevation · hover |
| Panels | Open/close 200–220ms · same focus trap rules |
| Dialogs | Rare · same dismiss (Esc · Nu acum) |
| Recommendations | Same card + Aplică / Nu acum |
| Status badges | Same palette · labels |
| Empty / loading / error | PDL §12–14 |

Predictability builds trust (PDL Law 9).

---

# 10. Component anatomy (required sections)

Each component specification includes:

1. Purpose  
2. Educational Context  
3. Visual Anatomy  
4. Spacing  
5. Responsive Behaviour  
6. Motion  
7. Accessibility  
8. Content Rules  
9. Error Handling  
10. Developer Notes  
11. Design Tokens  
12. Examples  
13. Anti-patterns  

---

# 11. Documentation template (per component page)

Use this template for every PDS component (design docs + `/design-system` showcase entries):

```markdown
# [Component Name]

## Description
## Educational Purpose
## When to Use
## When NOT to Use
## Variants
## States
## Interactions
## Accessibility
## Examples
## Code Notes
## Design Notes
## Future Extensions
```

---

# 12. Level 3 — component specifications (core set)

Abbreviated normative specs. Full pages follow §11 as implementation proceeds.

---

### 12.1 Activity Card

| Field | Content |
|-------|---------|
| **Purpose** | Represent one learning activity as a design idea |
| **Educational Context** | Lesson sequence · time-boxed pedagogical move |
| **Visual Anatomy** | Pedagogical Card Model · time chip · strategy · resources |
| **Spacing** | Card padding 20–24px · gap 16px in sequences |
| **Responsive** | Full width in column · stack meta on tablet |
| **Motion** | Hover elevate · drag elastic |
| **Accessibility** | `article` · labelled by title · DnD alternatives |
| **Content Rules** | Title + purpose required; time recommended |
| **Error Handling** | Inline if time missing when publishing |
| **Developer Notes** | Map to studio activity block / POM activity intents |
| **Tokens** | surface · shadow-soft · text · accent for tips |
| **Anti-patterns** | Using as a generic file tile |

---

### 12.2 Objective Block

| Field | Content |
|-------|---------|
| **Purpose** | One measurable learning objective |
| **When to Use** | Lesson Design · Curriculum Alignment |
| **When NOT** | As a paragraph of lesson prose |
| **States** | Draft · linked · orphan (needs attention) |
| **Relationships** | Competencies · activities · assessment · success criteria |
| **Anti-patterns** | Bundling multiple objectives in one block |

---

### 12.3 Competency Card

Shows competency statement · code (if any) · link density to objectives.  
Non-evaluative. Curriculum Alignment View for overview.

---

### 12.4 Assessment Builder

Structured assessment design (questions, criteria, evidence links) — **not** a grading cockpit.  
Primary local action: refine assessment design. Publishing via PDE composite.

---

### 12.5 Timeline Section / Learning Sequence

Ordered phases (Opening · Discovery · Practice · …). Feeds Time Balance Indicator.  
Part of Lesson Canvas / Lesson Timeline composites.

---

### 12.6 Reflection Block

Unfinished or recent reflection (RPTI). No charts. Meaningful sentences only ([Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Pattern 06 Reflect](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) · [Journey 04](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)).

---

### 12.7 Differentiation Panel

Support · Core · Extension. Links to Student Support Strategy and Adaptation Cards. Teacher approves adaptations (SLI).

---

### 12.8 Resource Shelf

Curated shelf (not folder). Used on Desk collections and Knowledge Workspace. Soft cover + label + count.

---

### 12.9 Learning Evidence Card

One evidence item — private by default. Never ranking. Links to objectives/assessment.

---

### 12.10 PRIMA Recommendation Card

Optional tip: pedagogical reasoning · expected impact · alternatives · Aplică / Nu acum.  
Enhances; never replaces the host component.

---

### 12.11 Knowledge Insight · Student Adaptation Card

KHPM / SLI surfaces — calm, private, teacher-controlled. Same card model; distinct purpose labels.

---

# 13. Level 4 — composites (assembly rules)

| Composite | Zone mapping (PDL) | Notes |
|-----------|-------------------|-------|
| Lesson Canvas | Primary | Block DnD · Focus Mode capable |
| Lesson Timeline | Primary / Secondary | Time Balance AI optional |
| Competency Map | Primary | Graph with card detail drawer |
| Assessment Dashboard | Primary | Coverage ≠ scores of teachers |
| Learning Journey | Primary | Cross-lesson arc |
| Publishing Workspace | Primary + Context | Preview gate (PDE) |
| Reflection Workspace | Primary + Reflection | RPTI |
| Knowledge Workspace | Primary + Secondary | KHPM |

Composites may collapse Secondary/PRIMA zones; they may not invent new button languages.

---

# 14. Level 5 — experience templates

| Template | Entry meaning | Opens |
|----------|---------------|-------|
| Lesson Design | Designul lecției | Lesson Canvas + navigator |
| Worksheet Builder | Fișă de lucru | UPE / POM worksheet |
| Presentation Builder | Prezentare | UPE presentation |
| Assessment Builder | Evaluare | Assessment composite |
| Project Builder | Proiect | Multi-lesson journey |
| Learning Story | Poveste | Story POM |
| Educational Game | Joc educațional | Game POM |
| Portfolio | Portofoliu | Evidence + reflection set |

Empty states for templates **teach** how to begin (PDL §12).

---

# 15. Design validation

Before approving a component, ask:

1. Does it reduce cognitive load?  
2. Does it reflect teacher terminology?  
3. Does it support learning?  
4. Does it explain itself?  
5. Can it scale across subjects/grades?  
6. Is it accessible (WCAG AA)?  
7. Would a teacher immediately understand it?  
8. Does it obey PDL Ten Laws?  
9. Does it reuse the Pedagogical Card Model when card-shaped?  
10. Does AI only enhance, never replace?

Fail any → do not add to PDS.

---

# 16. Mapping to runtime

| PDS layer | Runtime today | Target |
|-----------|---------------|--------|
| L1 Foundation | `prima-design-tokens.css` | + type families (Ch.1) |
| L2 Universal | `src/design-system/*` | Expand showcase |
| L3 Pedagogical | Partial in `teacher-desk`, `lesson-blueprint`, engines UI | Dedicated `pds/` or design-system pedagogical set |
| L4 Composites | TeachingShell · Studio · Workspaces | Align to zone grammar |
| L5 Templates | Experience / create flows | Template registry |

**Rule for engineers:** Prefer composing named pedagogical components over ad-hoc Tailwind card stacks. New UI patterns require a PDS amendment.

---

# 17. Anti-patterns (system-wide)

- Generic “Card” with no pedagogical noun  
- Dashboard KPI widgets as Level 3 components  
- Chat widget replacing Recommendation Card  
- Ranking students in Evidence / Adaptation components  
- Inventing a second drag language per screen  
- Color-only status  
- Empty “No data” states  

---

# Success criteria

Teachers unconsciously learn the interface because every interaction follows the **same pedagogical logic**.

The Pedagogical Design System becomes the foundation of every product in the PRIMA ecosystem.

**Screens are assembled from PDS — never improvised.**
