# FEATURE-008 — Student Learning Intelligence (SLI)

Version: 1.0  
Status: Official — Evidence-Based Instructional Support  
Priority: High  
Last Updated: July 2026

**Dependencies:** FEATURE-001…007 · PIE · UX-002 · DESIGN-002 · PAS-006

**Runtime:** `src/engines/sli/` · **UI:** `src/features/student-learning/` · **Contracts:** `@prima/contracts` → `prima-student-learning.ts`  
**Route:** `/learning`

**Related:** `src/engines/classroom` — **class experience memory** (no individual profiles). SLI adds optional **pseudonymous learner profiles** under teacher control.  
**Constitutional note:** `PrimaContext` MVP forbids Student Context as a reasoning input. SLI is a **teacher workspace for instructional evidence**, not an AI authority over learners.

---

## 0. Purpose

SLI helps teachers **understand learning** rather than record grades.

Classroom evidence becomes pedagogical insight while preserving teacher autonomy and student privacy.

| SLI does | SLI does not |
|----------|--------------|
| Support instructional decisions | Evaluate / rank / label students |
| Surface misconceptions & needs | Surveil or predict grades |
| Recommend differentiation (optional) | Auto-apply interventions |
| Link evidence to objectives | Replace professional judgment |

---

## 1. Philosophy

> **Observe. Understand. Support. Improve.**

The goal is continuous learning, not surveillance.

---

## 2. Learning profile (dynamic)

Each **learner alias** (teacher-controlled display name / code — minimize PII) may include:

Learning strengths · needs · preferred activity types · participation patterns · assessment evidence · observed misconceptions · progress · teacher observations · support strategies · growth over time.

Profiles are **instructional instruments**, never HR or public ranking tools.

---

## 3. Learning evidence

Sources: assessments · worksheets · interactive activities · teacher observations · reflection notes · portfolios · projects · presentations · peer activities · homework · future integrations.

Every evidence item links to **objective / competency** when known (FEATURE-001 / POM).

---

## 4. Class dashboard

Shows: lesson progress · objectives achieved · competencies needing reinforcement · frequent misconceptions · learners needing support · learners ready for enrichment.

**No ranking. No competition.** Instructional information only.

---

## 5. Learning map

Visualize: competencies → objectives → activities → evidence → assessment → progress.  
Each competency has an evidence trail.

---

## 6. Misconception detection

Recurring difficulties → suggested actions (practice · visual model · manipulative · alternative explanation · remedial worksheet). Teacher approves.

---

## 7. Differentiation support

Recommend: support groups · extensions · alternative explanations · practice · flexible assessment · personalized homework. **Teacher approval required.**

---

## 8. Progress timeline

Beginning / middle / end of unit · between lessons · growth trends.  
**No predictive grading. No automated decisions.**

---

## 9. Class insights

Descriptive examples: objective mastery patterns · collaborative participation · open-ended reasoning · practical retention. Never judgmental of people.

---

## 10. Student portfolio (optional)

Selected work · projects · reflections · feedback · achievements · competency evidence · milestones. Teacher chooses inclusion.

---

## 11. Teacher observation tool

Quick editable notes (“Needs visual support”, “Excellent collaboration”, …).

---

## 12. Early support indicators

Patterns: repeated misconceptions · low participation · incomplete work · irregular progress → **instructional response suggestions**. Never labels students.

---

## 13. Family communication (future)

Strength-focused summaries · home activities · celebration notes — teacher reviews every message before sharing.

---

## 14. Privacy (normative)

1. **SLI-I01** — Privacy by design; data minimization.  
2. **SLI-I02** — Role-based access; educational context only.  
3. **SLI-I03** — Explicit consent where required (national / GDPR).  
4. **SLI-I04** — Audit log for access to learner profiles.  
5. **SLI-I05** — No ranking, public scores, or predictive grades.  
6. **SLI-I06** — Recommendations never auto-apply.  
7. **SLI-I07** — Pseudonymous aliases preferred; avoid unnecessary PII.  
8. **SLI-I08** — SLI never becomes constitutional Student Context for AI authority.

---

## 15. Collaboration with PIE

If many learners struggle with Objective 2 → PIE-oriented handoff: lesson redesign · alternative activities · resources · revised assessment · differentiation (FEATURE-003).

---

## 16. Acceptance criteria

| Criterion | Foundation |
|-----------|------------|
| Learning profiles | Pseudonymous LearnerProfile |
| Competency-based progress | Evidence → competency map |
| Evidence ↔ objectives | LearningEvidence links |
| Teacher observations | ObservationNote |
| Differentiation recommendations | Approved suggestions only |
| Class insights | Descriptive aggregates |
| Privacy by design | SLI-I01…I08 |
| Full teacher control | Approve / edit / dismiss |

---

## 17. Definition of Done

- [x] Specification published  
- [x] Contracts + MVP engine + class dashboard UI  
- [x] Tests (no ranking · privacy · teacher control) + SPEC_INDEX  
- [ ] Live POM evidence ingest  
- [ ] Family communication  
- [ ] Full GDPR operational controls  

**Every recommendation exists to improve learning, not to evaluate people.**
