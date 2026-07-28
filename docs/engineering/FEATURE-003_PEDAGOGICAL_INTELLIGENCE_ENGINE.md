# FEATURE-003 — Pedagogical Intelligence Engine (PIE)

Version: 1.0  
Status: Official — Central Pedagogical Reasoning Layer  
Priority: Highest  
Last Updated: July 2026

**Dependencies:** Product Book · UX-001/UX-002 · DESIGN-002 · FEATURE-001 · FEATURE-002 · [PAIM / DB-CH09](../design/DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)

**Runtime:** `src/engines/pie/` · **Contracts:** `@prima/contracts` → `prima-pedagogical-intelligence.ts`  
**Surfaced in:** [FEATURE-004 UPE](./FEATURE-004_UNIVERSAL_PEDAGOGICAL_EDITOR.md) right sidebar + validation panel  
**Learning evidence handoff:** [FEATURE-008 SLI](./FEATURE-008_STUDENT_LEARNING_INTELLIGENCE.md) may request lesson redesign when class patterns show shared difficulties

---

## 0. Purpose

PIE is the **educational reasoning layer** of PRIMA.

It continuously analyzes, validates, and improves the pedagogical quality of every lesson and related pedagogical object.

| PIE is | PIE is not |
|--------|------------|
| Evidence-based pedagogical analysis | A chatbot |
| Recommendation with justification | Teacher evaluation |
| Continuous quality intelligence | Content generation from free prompts |
| Teacher-supporting | Teacher-replacing |

---

## 1. Core principles

| Principle | Rule |
|-----------|------|
| **Teacher in control** | PRIMA recommends. The teacher decides. |
| **Pedagogy before AI** | Every recommendation has a pedagogical justification. |
| **Transparency** | Teacher always sees *why*. |
| **Consistency** | Suggestions stay coherent across the whole lesson. |
| **Continuous improvement** | Every modification triggers a new analysis. |
| **Non-evaluative scores** | Scores support improvement — never rate the teacher. |

---

## 2. Position in the intelligence stack

```
Conversation turn (AI-001 / AI-002 / AI-002.5 / AI-003)
        ↓ shapes
Lesson Project (FEATURE-001)
        ↓ materializes
Pedagogical Objects (FEATURE-002)
        ↓ analyzed by
PIE (FEATURE-003)  ←── quality & coherence layer
        ↓ surfaces as
PRIMA panel recommendations (DESIGN-002 · UX-002)
```

| Layer | Owns | Does not own |
|-------|------|--------------|
| AI-001…003 | Turn-by-turn Socratic control, next question, inference gate | Lesson quality scoring |
| FEATURE-001 | Editable lesson project | Export files |
| FEATURE-002 | Canonical resource objects | Pedagogical judgment |
| **PIE** | Multi-dimension analysis + explainable recommendations | Final pedagogical authority |
| PS-004 Recommendation | Delivery/policy cards (may consume PIE) | Analysis dimensions |
| PS-005 Quality | Asset/blueprint quality scoring (aligns with PIE scores) | Teacher conversation |
| Mission 06 (`src/engines/pedagogy`) | Legacy Living Workspace review | Canonical PIE (superseded) |

**Normative:** All future AI features that advise on lesson or material quality **must** call PIE (or a thin adapter that produces a `PieAnalysisReport`).

---

## 3. Inputs

PIE analyzes a **Lesson Design Snapshot** (and optionally linked Pedagogical Objects):

| Input | Source |
|-------|--------|
| Learning objectives | FEATURE-001 / DecisionBlueprint |
| Competencies | FEATURE-001 |
| Grade · subject · duration | Learning context |
| Teaching strategy / learning flow | FEATURE-001 |
| Learning activities (+ timing) | FEATURE-001 studio extensions |
| Assessment methods · success criteria | FEATURE-001 |
| Educational resources / planned materials | FEATURE-001 → FEATURE-002 refs |
| Differentiation strategies | FEATURE-001 |
| Reflection section | FEATURE-001 |
| Curriculum metadata | Knowledge packs (versioned) |
| Pedagogical Object relationships | FEATURE-002 |
| Teacher preferences (Learning Mode) | Memory / DNA (optional) |

---

## 4. Analysis dimensions

Each dimension produces a **0–100 score**, findings, and zero or more recommendations.

| # | Dimension id | Focus |
|---|--------------|--------|
| 1 | `curriculum_alignment` | Competencies covered · measurable objectives · mandatory elements |
| 2 | `pedagogical_coherence` | Objectives↔activities↔assessment↔resources↔timing↔strategy |
| 3 | `cognitive_load` | Intrinsic / extraneous / germane · balance band |
| 4 | `lesson_flow` | Opening · prior knowledge · discovery · practice · feedback · reflection · closure |
| 5 | `student_engagement` | Interaction · variety · collaboration · application · reflection |
| 6 | `differentiation` | Support · extension · flexible difficulty · alt assessment |
| 7 | `assessment_quality` | Alignment · formative/summative · criteria · feedback · rubrics |
| 8 | `inclusion_accessibility` | Clear instructions · readability · alternatives · inclusive language · workload |
| 9 | `time_validation` | Estimated vs available · transitions · variance · adjustments |
| 10 | `resource_optimization` | Duplicates · missing · unused · overload |

### Cognitive load bands

`balanced` · `needs_simplification` · `needs_extension`

### Time output

`estimatedLessonDuration` · `availableMinutes` · `varianceMinutes` · suggested adjustments

---

## 5. Pedagogical score

```
PieScorecard {
  overall                  // Lesson Design Score 0–100
  dimensions[]             // per-dimension scores
  estimatedTeachingMinutes
}
```

**UI framing (mandatory):**

- Label as *Calitate pedagogică* / improvement support — never “nota ta”
- Never used for HR, inspection, or ranking teachers
- Optional: hide overall and show only dimensions if teacher prefers calmer UI

Example (illustrative):

| Dimension | Score |
|-----------|------:|
| Pedagogical Quality (overall) | 96 |
| Curriculum Alignment | 100 |
| Learning Objectives (via coherence/alignment) | 95 |
| Activity Design (engagement + flow) | 94 |
| Assessment | 93 |
| Differentiation | 88 |
| Accessibility | 97 |
| Student Engagement | 92 |
| Estimated Teaching Time | 49 min |

---

## 6. Recommendation engine

### Priority

| Priority | Meaning |
|----------|---------|
| `critical` | Blocks readiness / serious misalignment |
| `important` | Strong quality impact |
| `optional` | Useful enrichment |
| `inspirational` | Creative stretch ideas |

### Recommendation shape

| Field | Purpose |
|-------|---------|
| `title` | Short teacher-facing title (RO) |
| `explanation` | What PIE noticed |
| `pedagogicalRationale` | Why it matters educationally |
| `affectedComponents` | objectives · activities · assessment · … |
| `estimatedImprovement` | Soft expected score/time impact |
| `acceptAction` | Structured patch proposal (optional) |
| `ignoreAction` | Dismiss / learn |
| `learnMore` | Deeper pedagogy note |

Teacher actions in UI: **Aplică** · **Ignoră** · **Află mai mult** (UX-002).

### Explainable AI (mandatory answers)

1. Why?  
2. What if I accept?  
3. What if I ignore?  
4. Which parts of the lesson are affected?

---

## 7. Adaptive reasoning

Every teacher edit emits a change event → PIE re-analyzes (debounced).

| Teacher action | PIE checks |
|----------------|------------|
| Deletes an objective | Activities · assessment · resources · reflection still mapped? |
| Changes duration | Timeline · activity balance · assessment timing |
| Adds cooperative learning | Collaborative activities · assessment adaptations · resources |

Consistency rule: recommendations must not contradict an earlier accepted recommendation unless the underlying facts changed.

---

## 8. Knowledge base

Modular, versioned sources:

| Source | Role |
|--------|------|
| Romanian curriculum packs | Alignment checks |
| PRIMA pedagogical framework | Coherence & flow heuristics |
| Evidence-based instructional design | Recommendation rationales |
| Learning sciences | Cognitive load / engagement |
| Teacher preferences | Learning Mode personalization |
| Platform design rules | DESIGN / UX constraints |
| Future educational updates | Hot-swappable packs |

Knowledge is **read**; PIE never mutates curriculum packs.

---

## 9. Learning Mode

PIE may observe (with privacy constraints):

- Preferred lesson structures  
- Frequently used strategies  
- Resource preferences  
- Editing habits (accept/ignore patterns)

Personalization **suppresses or reorders** suggestions — never removes teacher autonomy or forces a style.

---

## 10. Analysis API (normative)

```
analyzeLessonDesign(input: PieAnalysisInput): PieAnalysisReport
analyzePedagogicalObject(object, lessonContext?): PieAnalysisReport
reanalyzeOnChange(previous, change): PieAnalysisReport
```

`PieAnalysisReport` includes: scorecard · dimension details · recommendations · explanations · `analyzedAt` · `inputFingerprint` · `knowledgePackVersions`.

---

## 11. Future extensions (non-blocking)

Lesson reflection analysis · student performance · learning analytics · collaborative review · school-level insights · portfolio recommendations · competency progression tracking.

---

## 12. Invariants

1. **PIE-I01** — PIE never mutates the lesson or POM without explicit teacher accept of a structured proposal.  
2. **PIE-I02** — Every recommendation includes pedagogical rationale + affected components.  
3. **PIE-I03** — Scores are informative, never evaluative of the teacher.  
4. **PIE-I04** — Analysis runs after material lesson edits (debounced continuous improvement).  
5. **PIE-I05** — Conversation engines (AI-001…003) do not replace PIE for quality analysis.  
6. **PIE-I06** — Teacher-facing copy follows UX-002 (Romanian educational language).  
7. **PIE-I07** — All future quality AI surfaces consume `PieAnalysisReport`.

---

## 13. Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Every lesson analyzable automatically | ✓ API + MVP analyzer |
| Recommendations pedagogically justified | ✓ Recommendation shape |
| Analysis transparent | ✓ Explainable fields |
| Scores informative, not evaluative | ✓ Principles + UI rules |
| Teacher final control | ✓ Accept / ignore only |
| Suggestions update after edits | ✓ Adaptive reanalyze contract |
| Future AI features rely on PIE | ✓ PIE-I07 |

---

## 14. Definition of Done

- [x] FEATURE-003 specification published  
- [x] Contracts in `@prima/contracts`  
- [x] MVP analyzer (`src/engines/pie`) with tests  
- [x] Indexed in SPEC_INDEX  
- [ ] Wired into Lesson Blueprint Studio PRIMA panel (follow-on)  
- [ ] Full curriculum pack–driven alignment (follow-on)  
- [ ] Learning Mode persistence (follow-on)  
- [ ] Mission 06 UI migrated onto PIE report (follow-on)

**PIE is the pedagogical intelligence that ensures quality, coherence, and continuous improvement throughout lesson design.**
