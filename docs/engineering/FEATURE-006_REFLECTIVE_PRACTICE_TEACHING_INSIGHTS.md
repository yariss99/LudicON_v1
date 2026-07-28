# FEATURE-006 — Reflective Practice & Teaching Insights (RPTI)

Version: 1.0  
Status: Official — Professional Growth Loop  
Priority: High  
Last Updated: July 2026

**Dependencies:** FEATURE-001 · FEATURE-002 · FEATURE-003 (PIE) · FEATURE-004 · FEATURE-005 · UX-002 · DESIGN-002

**Runtime:** `src/engines/rpti/` · **UI:** `src/features/reflective-practice/` · **Contracts:** `@prima/contracts` → `prima-reflective-practice.ts`  
**Route:** `/reflection`  
**Long-term memory:** [FEATURE-007 KHPM](./FEATURE-007_KNOWLEDGE_HUB_PEDAGOGICAL_MEMORY.md) indexes reflections into the knowledge graph

**Related scaffold:** `packages/engines/reflection` (ENG-09) — constitutional peer; RPTI is the product surface that may later call ENG-09.

---

## 0. Purpose

RPTI turns every completed lesson into an opportunity for **professional growth**.

Teachers understand what happened, why it happened, and how future lessons can improve.

| Reflection is | Reflection is not |
|---------------|-------------------|
| Natural continuation of teaching | An administrative form |
| Private professional practice | Teacher evaluation |
| Evidence-informed | Competitive ranking |

---

## 1. Philosophy

> **Teach. Reflect. Improve. Repeat.**

Professional development is built **lesson by lesson**.

---

## 2. Reflection timeline

```
Before Lesson → Lesson Design → Teaching → Reflection → Insights → Recommendations → Next Lesson
```

Every lesson contributes to future improvement. RPTI attaches to the lesson project id and optional publication ids (FEATURE-005).

---

## 3. Reflection modes

| Mode | Duration | Character |
|------|----------|-----------|
| `quick` | 2–3 min | Few essential prompts |
| `guided` | ~8–12 min | Pedagogical prompt sequence |
| `evidence` | Variable | Anchored in lesson artifacts / PIE / publications |
| `comprehensive` | Deep | Full professional analysis |
| `voice` | Future | Spoken notes → extracted insights |

---

## 4. Reflection prompts (examples)

- Did students achieve the learning objectives?  
- Which activity generated the highest engagement?  
- Where did students encounter difficulties?  
- Were the estimated timings realistic?  
- What would you change next time?  
- Did the assessment measure the intended outcomes?  
- Were differentiated activities effective?  
- Did digital resources support learning?  

UI copy: Romanian educational language (UX-002).

---

## 5. Reflection dashboard

Lesson summary · reflection status · key observations · strengths · improvement opportunities · personal notes · follow-up actions.

---

## 6. Pedagogical insights

PIE + RPTI pattern analysis over reflection answers and lesson metadata.

Examples:

- Lessons consistently exceed planned duration.  
- Collaborative activities increase engagement.  
- Students struggle with multi-step problems.  
- Assessment items are too difficult.  
- Differentiated activities improve participation.  

Recommendations are **evidence-based** and optional.

---

## 7. Professional growth profile

Private profile tracking:

Teaching strategies · assessment methods · lesson balance · differentiation frequency · digital tool integration · reflection habits · professional goals.

**Belongs exclusively to the teacher. Never used for evaluation, HR, or ranking.**

---

## 8. Lesson comparison

Compare Lesson A vs Lesson B across: timing · engagement · assessment · resources · teaching strategy · reflection · recommendations.

---

## 9. Improvement recommendations

Each recommendation: observation · pedagogical explanation · suggested improvement · expected impact · related resources · **Apply to future lesson** (handoff into FEATURE-001 / UPE).

---

## 10. Teaching portfolio

Auto-organizes: Lesson Designs · Published Packages · Reflection Notes · Teaching Evidence · PD Goals · Certificates · Innovation Projects · Inspection Evidence.

Entries remain editable. Sharing is explicit only.

---

## 11. Achievement milestones

Celebrate meaningful progress (motivation, not competition).

No rankings. No public scores.

Examples: first 100 lessons · 20 reflective lessons · new strategy adopted · consistent differentiation.

---

## 12. Analytics (personal)

Average duration · strategy diversity · assessment balance · reflection frequency · resource reuse · lesson evolution · monthly / yearly trends.

---

## 13. Privacy (normative)

1. **RPTI-I01** — All reflections are private by default.  
2. **RPTI-I02** — Teacher decides keep / export / share.  
3. **RPTI-I03** — Nothing is shared automatically.  
4. **RPTI-I04** — Growth profile is never an evaluation instrument.  
5. **RPTI-I05** — Insights recommend; teacher decides.  
6. **RPTI-I06** — Apply-to-future creates an optional handoff, never silent mutation.

---

## 14. Future extensions

Student feedback · peer review · mentor observations · school improvement reports · research mode · PLCs · AI coaching · voice reflection.

---

## 15. Acceptance criteria

| Criterion | Foundation |
|-----------|------------|
| Reflection in lesson lifecycle | ReflectionRecord ↔ lessonProjectId |
| Insights automatic | Pattern engine over reflections |
| Growth profile | Private GrowthProfile |
| Portfolio automatic | PortfolioEntry index |
| Recommendations → future design | Apply handoff payload |
| Teacher ownership | Privacy invariants |

---

## 16. Definition of Done

- [x] Specification published  
- [x] Contracts + MVP engine + dashboard UI  
- [x] Tests + SPEC_INDEX  
- [ ] Voice reflection  
- [ ] Live apply-to-FEATURE-001 deep integration  
- [ ] ENG-09 package implementation bridge  

**Reflection is integral to teaching. Every completed lesson feeds continuous professional development — privately, supportively, without evaluation.**
