# PRIMA Design Book — Chapter 5  
# Teacher Journeys

Version: 1.0  
Status: Core Experience  
Priority: Critical  
Audience: Product · UX · Pedagogy · Frontend · QA  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) · [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) · [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) · [Ch.4 Experience Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md)  
**Motion:** [Ch.6 Motion & Interaction](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md)  
**Accessibility:** [Ch.7 Accessibility](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)  
**Responsive:** [Ch.8 Responsive & Adaptive](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)  
**Related:** DESIGN-002 Ch.9 · FEATURE-001…008

---

# 0. Objective

Design the complete **journeys** teachers experience while using PRIMA.

| A Journey is | A Journey is not |
|--------------|------------------|
| Educational intention → professional outcome | A workflow diagram alone |
| A remembered arc of meaning | A sequence of screens |
| Natural · coherent · supportive | Software training |

The teacher should never think about software.  
The teacher should think about **teaching**.

### Authority

| Layer | Wins on |
|-------|---------|
| DOCUMENT-000 | Ethics · authorship |
| DB-CH01…03 | Identity · grammar · components |
| DB-CH04 Patterns | Reusable interaction sequences |
| **DB-CH05 Journeys** | End-to-end intention → outcome arcs |
| Surface chapters | Places where journeys are hosted |

**Relationship:** Journeys **compose** Experience Patterns. Patterns are the grammar; journeys are the stories.

---

# 1. Design philosophy

People remember journeys — not screens.

Every journey should:

- Reduce effort  
- Increase confidence  
- Improve teaching  

### Emotional design (canonical arc)

```
Curiosity → Confidence → Flow → Achievement → Reflection → Growth
```

**Never:** stress · confusion · information overload · fear of mistakes.

### Success metrics (what we optimize)

| Measure | Not a measure |
|---------|----------------|
| Time saved | Clicks |
| Teacher confidence | “Engagement” |
| Pedagogical quality | Time spent in app |
| Reduced cognitive effort | Feature adoption vanity |
| Learning improvement (classroom) | |

---

# 2. Journey model

Every Teacher Journey contains:

```
Educational Goal
      ↓
Teacher Intention
      ↓
Entry Point
      ↓
Guided Experience
      ↓
Pedagogical Decisions
      ↓
AI Support
      ↓
Reflection
      ↓
Professional Growth
```

### Journey anatomy (required deliverable sections)

| Section | Content |
|---------|---------|
| Purpose | Why this journey exists |
| Educational Context | Classroom / professional situation |
| User Story | One clear intention sentence |
| Emotional Timeline | Curiosity → … → Growth moments |
| Interaction Timeline | Stages + Patterns used |
| Decision Points | Where teacher authorship binds |
| AI Behaviour | Mode for this journey |
| Accessibility Review | Keyboard · SR · motion · contrast |
| Potential Risks | Failure / stress modes |
| Recovery Scenarios | Continuity · Recover pattern |
| Future Evolution | Honest backlog |
| Journey Diagram | Stage flow |
| Implementation Notes | Routes · features · surfaces |

### Global rules

**Decision points:** Explain → Recommend → Wait → Respect. Never auto-decide.

**Interruptions:** Only when information could be lost, teacher requests help, or critical validation is required. Everything else waits.

**Continuity:** Resume instantly — context · scroll · selection · history · recent actions · unsaved changes.

---

# 3. AI participation by journey type

| Journey type | AI mode |
|--------------|---------|
| Design (01–03, 06) | **High assistance** — tips, structure, alternatives |
| Reflection (04) | **Listening first** — prompts only after teacher writes |
| Publishing (07) | **Validation** — checks before commit |
| Search (05) | **Discovery** — find · explain relevance |
| Growth (08) | **Analysis** — patterns over time · non-evaluative |

Behaviour is never identical across journeys.

---

# JOURNEY 01 — Design a New Lesson

### Purpose
Help a teacher turn tomorrow’s teaching need into a complete, publishable lesson design.

### Educational Context
Planning period · evening prep · “I have class tomorrow.”

### User Story
> As a teacher, I need to prepare tomorrow’s lesson so students learn with clarity and purpose.

### Intention
*“I need to prepare tomorrow’s lesson.”*

### Journey diagram

```
Welcome (Desk)
  → Create Lesson                    [Pattern 01 Create]
  → Lesson Canvas                    [Pattern 03 Build]
  → Objectives → Activities
  → Resources → Assessment
  → Review                           [Pattern 04 Review]
  → Improve (optional loop)          [Pattern 05 Improve]
  → Publish                          [Pattern 07 Publish]
  → Reflection (optional/soft)       [Pattern 06 Reflect]
```

### Emotional timeline

| Stage | Emotion |
|-------|---------|
| Welcome | Curiosity · calm |
| Create / Canvas | Confidence · creative flow |
| Review / Publish | Professional satisfaction |
| Reflect | Closure · growth seed |

### Interaction timeline

| Stage | Surface | PDS / notes |
|-------|---------|-------------|
| Welcome | Desk greeting | One primary CTA |
| Create | Empty / template paths | L5 Lesson Design |
| Canvas | Studio | Lesson Canvas · blocks |
| Objectives…Assessment | Studio navigator | Objective Block · Activity Card… |
| Review | Studio Review Mode | Design Score · PIE |
| Publish | PDE | Publishing Workspace |
| Reflect | RPTI / Desk strip | Reflection Block |

### Decision points
- Start path (curriculum / template / idea)  
- Accept/reject each AI tip  
- Ready for materials / publish destination  
- Whether to reflect now or later  

### AI behaviour
High assistance during Build/Review; silent during deep Focus Mode unless critical; never auto-publish.

### Accessibility review
Full keyboard path Desk→Studio→Publish; Focus Mode escape; score not color-only; reduced motion on tips.

### Potential risks
Wizard fatigue · tip overload · form-like Studio · fear of losing work.

### Recovery scenarios
Autosave + Undo (Pattern 10) · Desk “Continuă” restores scroll/block · offline badge.

### Future evolution
Deeper curriculum pickers · class-context SLI hooks mid-design.

### Implementation notes
Routes: `/` `/desk` → create/experience → `/blueprint/review/:id` → `/publishing` → `/reflection`  
Features: FEATURE-001 · 002 · 003 · 005 · 006  
Patterns: 01 · 03 · 04 · 05 · 07 · 06 · 10  

---

# JOURNEY 02 — Improve an Existing Lesson

### Purpose
Return to a living lesson; continue and strengthen without forced change.

### Educational Context
Teacher reopens yesterday’s draft or a taught lesson for revision.

### User Story
> As a teacher, I want to improve a lesson I already started so it better fits my students.

### Intention
*“I want to continue and improve this lesson.”*

### Journey diagram

```
Desk / Search / Recent
  → Open Lesson                      [Recover continuity]
  → Context restored (PRIMA remembers)
  → Highlight unfinished work
  → Optional suggestions             [Pattern 05 Improve]
  → Build / Review loop              [Patterns 03 · 04]
  → Publish (if needed) · Reflect
```

### Emotional timeline
Relief (nothing lost) → Focus → Confidence → Satisfaction.

### Interaction timeline
Entry via Continue cards · Search · Collections. Unfinished sections in navigator (`Needs Attention`). Tips capped ≤3.

### Decision points
Dismiss or apply each suggestion · which section to finish · whether to republish materials.

### AI behaviour
Contextual remember · suggest · never force · explain “why now.”

### Accessibility review
Resume focus to last block; announce unfinished count to SR.

### Potential risks
Nagging tips · lost scroll · conflicting versions.

### Recovery scenarios
Version history · undo apply · keep local if sync conflict.

### Future evolution
Diff view between taught version and redesign.

### Implementation notes
Desk Continue · FEATURE-001 history · PIE · Pattern 10 critical.

---

# JOURNEY 03 — Create Learning Materials

### Purpose
Produce classroom materials that remain linked to the Lesson Design — never orphan files.

### Educational Context
After (or within) a lesson project: need worksheet, slides, assessment, etc.

### User Story
> As a teacher, I want materials for this lesson so everything stays coherent with my design.

### Intention
*“I need materials for this lesson.”*

### Journey diagram

```
Lesson Design (ready gate)
  → Choose type: Worksheet | Presentation | Assessment
                 | Flashcards | Game | Mind Map | …
  → Builder / UPE                     [Pattern 03 Build]
  → Review quality / alignment        [Pattern 04]
  → Publish / export                  [Pattern 07]
```

### Emotional timeline
Clarity (connected to lesson) → Flow in builder → Confidence at publish.

### Interaction timeline
PDS L5 templates · POM types · `lessonReference` required · no isolated downloads as source of truth.

### Decision points
Material type · accept PIE alignment tips · destination.

### AI behaviour
High assistance for structure/alignment; Blueprint/lesson-gated generation (FEATURE-001 rule).

### Accessibility review
UPE five-zone keyboard paths; preview before publish.

### Potential risks
Detached Canva-like files · regenerating without lesson sync.

### Recovery scenarios
POM version history · mark materials stale if lesson changes (honest banner).

### Future evolution
Batch material sets from one lesson timeline.

### Implementation notes
FEATURE-002 · 004 UPE · 005 PDE · Studio “Creează materialele”.

---

# JOURNEY 04 — Reflect After Teaching

### Purpose
Capture professional noticing so reflection becomes part of lesson history — not bureaucracy.

### Educational Context
After class · end of day · unfinished reflection prompt.

### User Story
> As a teacher, I want to record what happened in class so I can improve next time.

### Intention
*“What happened in today’s lesson?”*

### Journey diagram

```
Soft prompt (Desk / post-teach)
  → Reflection Workspace              [Pattern 06 Reflect]
  → Observations · Successes
  → Challenges · Student reactions
  → Ideas for improvement
  → Save into lesson history
  → Optional growth insight           [feeds Journey 08]
```

### Emotional timeline
Calm → Honesty → Closure → Gentle growth.

### Interaction timeline
Listening-first AI · minimal fields · no charts · RPTI private by default.

### Decision points
What to record · what stays private · whether to act on a growth tip later.

### AI behaviour
**Listening first.** Suggest prompts only after teacher input or on request. No scores of the teacher.

### Accessibility review
Simple form · large text · no motion dependence.

### Potential risks
Mandatory long surveys · evaluative tone · public sharing by default.

### Recovery scenarios
Autosave draft reflection · resume from Desk strip.

### Future evolution
Optional voice notes (future) · link evidence cards.

### Implementation notes
FEATURE-006 RPTI · `/reflection` · Pattern 06 · PDS Reflection Workspace.

---

# JOURNEY 05 — Search Knowledge

### Purpose
Find pedagogical help through natural language inside one coherent experience.

### Educational Context
“I need a fraction activity” mid-planning or mid-teach prep.

### User Story
> As a teacher, I want to find a useful fraction activity without hunting through folders.

### Intention
*“I need a fraction activity.”*

### Journey diagram

```
Universal / NL Search                 [Pattern 09 Search]
  → Unified results: Lessons · Activities · Resources
                   · Templates · Competencies · Reflections
  → Preview / Open
  → Create or Build with context      [Patterns 01 · 03]
```

### Emotional timeline
Curiosity → Discovery → Confidence (“I found something usable”).

### Interaction timeline
One search experience · scope chips optional · KHPM + local · explain relevance briefly.

### Decision points
Which result to open · reuse vs adapt · dismiss weak matches.

### AI behaviour
**Discovery** — interpret NL · show why matched · never hide sources.

### Accessibility review
Combobox/listbox · Esc closes · results headings.

### Potential risks
Fragmented module searches · irrelevant AI dump · no empty-state teaching.

### Recovery scenarios
Refine query · recent searches · Recover last opened.

### Future evolution
Curriculum-aware ranking (pedagogical, not engagement).

### Implementation notes
Desk/Studio search · FEATURE-007 KHPM · Pattern 09 · 02 Explore.

---

# JOURNEY 06 — Differentiate Learning

### Purpose
Adapt learning for students who need support or extension — teacher-approved only.

### Educational Context
Class variance · IEPs · mixed readiness · post-evidence review.

### User Story
> As a teacher, I want differentiated paths so every student can succeed without lowering ambition unfairly.

### Intention
*“Some students need a different path.”*

### Journey diagram

```
Lesson / Evidence / SLI signal
  → Differentiation Panel             [Pattern 05 Improve]
  → Suggestions: adapted activities · alt resources
                 · modified assessment · visual supports
                 · extension tasks
  → Teacher approves / edits
  → Materials linked to lesson
```

### Emotional timeline
Concern → Clarity → Confidence · care (supportive, not surveillance).

### Interaction timeline
SLI aliases · no rankings · PDS Differentiation Panel · Student Adaptation Card · apply = authorship.

### Decision points
Approve / edit / reject each adaptation · which students/groups (privacy-preserving).

### AI behaviour
High assistance with explanations; **never** auto-assign to students without teacher approval.

### Accessibility review
Adaptation previews accessible; status text for support/core/extension.

### Potential risks
Labeling/stigmatizing UI · ranking · silent class data use.

### Recovery scenarios
Undo apply · keep core path intact.

### Future evolution
Richer evidence links · parent-safe export notes.

### Implementation notes
FEATURE-008 SLI · PIE · PDS Differentiation · Pattern 05 · DOCUMENT-000 data ethics.

---

# JOURNEY 07 — Publish

### Purpose
Deliver the lesson/materials to a real destination with confidence.

### Educational Context
Ready to print, push to Classroom, board, package, or platform.

### User Story
> As a teacher, I want to publish this lesson to the right place without surprises.

### Intention
*“Send this where my class needs it.”*

### Journey diagram

```
Ready design / materials
  → Choose destination: Print · Interactive Board
                        · Google Classroom · Learning Platform · Package
  → Validation / preview              [AI: Validation]
  → One confirm                       [Pattern 07 Publish]
  → Versioned publication
  → Soft Reflect prompt (optional)
```

### Emotional timeline
Readiness → Confidence → Relief (done) → optional Reflection.

### Interaction timeline
PDE preview gate · one primary confirm · clear destination labels (RO).

### Decision points
Destination · what to include · confirm publish.

### AI behaviour
**Validation** — completeness · alignment warnings · never publish alone.

### Accessibility review
Destination radiogroup · preview readable · progress announced.

### Potential risks
Ambiguous destinations · publish without preview · partial failure opacity.

### Recovery scenarios
Failed destination → explain · retry · design preserved · prior version intact.

### Future evolution
More LMS connectors · scheduled publish.

### Implementation notes
FEATURE-005 PDE · `/publishing` · Patterns 07 · 04 · 10.

---

# JOURNEY 08 — Professional Growth

### Purpose
Over time, help teachers see patterns in their practice — support only, never judgment.

### Educational Context
Weeks/months of design · teach · reflect cycles.

### User Story
> As a teacher, I want to understand my professional patterns so I can grow — without being ranked.

### Intention
*“How is my practice evolving?”*

### Journey diagram

```
Accumulated lessons · reflections · strategies
  → Growth workspace / insights       [AI: Analysis]
  → Surfaces: frequent strategies · teaching patterns
              · balanced assessments · curriculum coverage
              · reflection trends · strengths · opportunities
  → Optional: open a past lesson to Improve
```

### Emotional timeline
Curiosity → Recognition → Confidence · agency (not shame).

### Interaction timeline
Private growth profile · portfolio · milestones · no leaderboards · no teacher scores as grades.

### Decision points
What to explore · whether to act on an opportunity · privacy of portfolio shares.

### AI behaviour
**Analysis** — descriptive · supportive · alternatives · never ranking · never punitive.

### Accessibility review
Text-first insights · charts optional and never sole channel (prefer none per RPTI).

### Potential risks
Dashboard vanity metrics · comparative rankings · surveillance tone.

### Recovery scenarios
Insights dismissible · data export/control per DOCUMENT-000.

### Future evolution
Peer-optional communities (opt-in only) · deeper portfolio narratives.

### Implementation notes
FEATURE-006 RPTI · KHPM patterns · SLI aggregate (non-ranking) · Desk quiet tips.

---

# 4. Cross-cutting: decision · interruption · continuity

### Decision protocol
1. Explain the choice  
2. Recommend (optional)  
3. Wait  
4. Respect the teacher’s decision  

### Interruption budget
| Allowed | Forbidden |
|---------|-----------|
| Unsaved risk · explicit help · critical validation | Tip spam · modal tours mid-flow · score panic |

### Continuity checklist (every journey)
- [ ] Context restored  
- [ ] Scroll position  
- [ ] Selection / last block  
- [ ] History  
- [ ] Recent actions  
- [ ] Unsaved / autosave state  

---

# 5. Accessibility (all journeys)

Every journey supports: keyboard · screen readers · reduced motion · large text · color independence · touch · voice (future).

WCAG AA minimum. Journey-specific notes above are additive, not optional.

---

# 6. Journey ↔ Pattern matrix

| Journey | Primary patterns |
|---------|------------------|
| 01 New Lesson | Create · Build · Review · Improve · Publish · Reflect · Recover |
| 02 Improve Existing | Recover · Build · Review · Improve · Publish |
| 03 Materials | Create · Build · Review · Publish · Recover |
| 04 Reflect | Reflect · Recover |
| 05 Search | Search · Explore · Create/Build |
| 06 Differentiate | Improve · Build · Review |
| 07 Publish | Review · Publish · Recover |
| 08 Growth | Reflect · Explore · Improve (optional) |

---

# 7. Validation

Before shipping a journey, verify:

- [ ] Begins with educational intention · ends with professional outcome  
- [ ] Emotional arc avoids stress/confusion/overload  
- [ ] Composed from Experience Patterns only  
- [ ] AI mode matches journey type  
- [ ] Decision protocol honored  
- [ ] Interruption rules honored  
- [ ] Continuity complete  
- [ ] Success metrics are pedagogical — not vanity clicks  
- [ ] Accessibility AA  

---

# Success criteria

Teachers feel supported from beginning to end.

PRIMA becomes an **invisible pedagogical partner** throughout every professional activity.

Every journey strengthens confidence rather than adding complexity.
