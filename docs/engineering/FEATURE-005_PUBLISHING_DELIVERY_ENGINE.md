# FEATURE-005 — Publishing & Delivery Engine (PDE)

Version: 1.0  
Status: Official — Destination-Oriented Delivery Layer  
Priority: High  
Last Updated: July 2026

**Dependencies:** FEATURE-001 · FEATURE-002 (POM) · FEATURE-003 (PIE) · FEATURE-004 (UPE) · DESIGN-002 · UX-002

**Runtime:** `src/engines/pde/` · **UI:** `src/features/publishing/` · **Contracts:** `@prima/contracts` → `prima-publishing-delivery.ts`  
**Routes:** `/publishing` · UPE bottom tab **Export** bridges into PDE  
**After teaching:** [FEATURE-006 RPTI](./FEATURE-006_REFLECTIVE_PRACTICE_TEACHING_INSIGHTS.md) reflects on delivered lessons

---

## 0. Purpose

PDE transforms **pedagogical objects** into ready-to-use educational experiences.

| Teachers think | Teachers never think |
|----------------|----------------------|
| Where and how I want to teach | File formats as the primary mental model |
| Deliver this lesson to my class | “Export to DOCX then upload somewhere” |
| Design once, use everywhere | Duplicate content per channel |

Publishing is **destination-oriented**, not format-oriented. Formats are implementation details of destinations and channels.

---

## 1. Philosophy

> **Design once. Use everywhere.**

A lesson / pedagogical object is created once (UPE).  
It can be published many ways **without duplication of source content**.

Every publication remains linked to:

- Pedagogical object id + version  
- Lesson project (when present)  
- Author · timestamp · destination · channel · format

---

## 2. Position in the stack

```
FEATURE-001 Lesson Project
      ↓
FEATURE-002 Pedagogical Object (canonical)
      ↓
FEATURE-004 UPE (edit)
      ↓
FEATURE-003 PIE (readiness signals)
      ↓
FEATURE-005 PDE (preview → validate → publish → deliver)
      ↓
Destinations / LMS / Interactive platforms / Archive
```

| Layer | Role |
|-------|------|
| POM | Source of truth |
| PIE | Quality / readiness inputs |
| UPE | Edit + preview chrome |
| **PDE** | Publication lifecycle, renderers, delivery records |
| Asset Studio `exportService` | Legacy — migrate callers to PDE |

---

## 3. Publishing destinations

| Destination id | Teacher intent |
|----------------|----------------|
| `print` | Paper classroom |
| `digital_classroom` | Shared digital space |
| `interactive_whiteboard` | Front-of-class board |
| `student_device` | Phones / tablets |
| `presentation_mode` | Slide delivery |
| `learning_platform` | LMS / VLE |
| `assessment_platform` | Quizzes / tests |
| `teacher_archive` | Personal archive |
| `school_repository` | School collection |
| *(open)* | Future integrations |

---

## 4. Output channels

Printable worksheet · Teacher guide · Student version · Presentation · Interactive lesson · Homework package · Assessment package · Remedial package · Extension package · Portfolio evidence

Channels select **which slices** of the object (visibility, notes, differentiation tiers) enter the publication.

---

## 5. Export formats (renderers)

DOCX · PDF · PPTX · HTML · Markdown · SCORM · IMS Common Cartridge · JSON · PNG · SVG · …

Renderers plug into POM (FEATURE-002). PDE never stores office files as source.

---

## 6. LMS & interactive platforms

**LMS:** Google Classroom · Microsoft Teams · Moodle · Canvas · Schoology · …  
**Interactive:** LearningApps · Wordwall · Genially · Nearpod · Kahoot · Quizizz · Book Creator · …

Each integration is a **delivery adapter** with capability flags (`supportsLink`, `supportsPackage`, `supportsRoster`).

---

## 7. Smart publishing (gate)

Before publish, PDE checks:

| Check | Blocking? |
|-------|-----------|
| Curriculum alignment signals | warning / block if critical |
| Missing resources | warning |
| Broken references | **block** |
| Accessibility | warning (block if profile requires) |
| Estimated duration | warning |
| Assessment completeness | warning / block per profile |
| Required metadata | **block** for school/inspection |
| Object dependencies | **block** if unresolved |
| Version consistency | **block** if dirty unsaved |

**Rule:** Only validated publications proceed. Warnings are always explained (UX-002 Romanian copy in UI).

---

## 8. Publication profiles (presets)

Reusable presets, e.g.:

- Classroom Print  
- Hybrid Lesson  
- Interactive Lesson  
- Homework  
- Inspection Portfolio  
- Differentiated Learning  

Each remembers: destination · formatting · included resources · accessibility · visual theme · language · metadata requirements.

---

## 9. Preview (mandatory)

No export / publish without an explicit preview step in the session:

Teacher · Student · Print · Presentation · Interactive · Accessibility · Mobile · Tablet

Preview reads the same object version that will be published.

---

## 10. Versioned publication

```
PublicationRecord {
  publicationId
  createdAt
  destination
  channel
  format
  objectId
  objectVersionId
  lessonProjectId?
  author
  profileId?
  readinessReport
  deliveryArtifacts[]   // links, QR, packages — derivatives
}
```

Teachers can always **reproduce** a previous publication from the stored object version.

---

## 11. Digital delivery

Secure lesson links · QR codes · student access codes · temporary / permanent links · embeds · interactive activities.

Artifacts reference `publicationId`; revoking a publication can invalidate temporary links.

---

## 12. School repository

Store · categorize · reuse · share · duplicate · archive · publish to school collections.

Repository entries link back to the pedagogical object — never fork the source silently.

---

## 13. Inspection package

One-click package including: Lesson Design · Teacher Notes · Resources · Assessment · Rubrics · Competencies · Reflection · Version History · Metadata.

Profile: `inspection_portfolio`.

---

## 14. Accessibility options

Large print · high contrast · screen reader support · simplified layout · alternative text · language adaptations · inclusive formatting.

Applied as **publication options** on the same object (not a separate document).

---

## 15. Publication dashboard

Recent · pending · scheduled · history · usage stats · export analytics (future).

Route: `/publishing`.

---

## 16. Quality validation — readiness report

| Category | Purpose |
|----------|---------|
| Pedagogical quality | From PIE scorecard |
| Technical integrity | Structure / deps |
| Accessibility | A11y checks |
| Curriculum alignment | Mapping completeness |
| Completeness | Channel-required parts |
| Publication readiness | Aggregate go / no-go |
| Warnings · Recommendations | Explained, actionable |

---

## 17. Invariants

1. **PDE-I01** — Source of truth remains the pedagogical object.  
2. **PDE-I02** — Destination-first UX; formats are secondary.  
3. **PDE-I03** — Preview required before first publish in a session.  
4. **PDE-I04** — Blocking readiness failures prevent publish.  
5. **PDE-I05** — Every publication is versioned and reproducible.  
6. **PDE-I06** — New destinations/formats = adapters, not redesign.  
7. **PDE-I07** — Teacher-facing copy follows UX-002.

---

## 18. Acceptance criteria

| Criterion | Foundation |
|-----------|------------|
| One-click publishing | `publish()` after preview + readiness |
| Multi-format | Renderer registry |
| Multi-platform | Delivery adapters |
| Preview before publication | Session preview gate |
| Publication history | `PublicationRecord` store |
| Accessibility validation | Readiness category |
| School repository | Record + link model |
| Future extensibility | Open destination/format ids |

---

## 19. Definition of Done

- [x] Specification published  
- [x] Contracts + MVP engine + readiness gate  
- [x] Dashboard route + UPE export bridge  
- [x] Tests + SPEC_INDEX  
- [ ] Production binary renderers (PDF/DOCX/PPTX)  
- [ ] Live LMS OAuth adapters  
- [ ] Scheduled publications + analytics  

**Teachers never export files as the product metaphor. Teachers deliver learning experiences.**  
**Design once. Publish everywhere.**
