# PRIMA Design Book — Chapter 10  
# Product Blueprint & Screen Library

Version: 1.0  
Status: Master Specification  
Priority: Absolute  
Audience: Product · Design · Engineering · QA · Pedagogy · PM  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Design Book Ch.1–9](./README.md) · [DESIGN-002](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md)  
**Surfaces (detailed):** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)

---

# 0. Objective

Define the **complete structure** of the PRIMA platform:

Every screen · state · navigation path · interaction · relationship · design rule · implementation note.

| This chapter is | This chapter is not |
|-----------------|---------------------|
| Single source of truth for **what exists** in the product | A substitute for Ch.1–9 laws |
| Master screen inventory + contracts | Ad-hoc Figma without IDs |
| Binding for multidisciplinary build | Optional backlog notes |

**No screen should be designed outside this specification.**  
New screens require a Screen ID + full template entry before UI work.

### Authority

**DOCUMENT-000 ≥ DB-CH10 Blueprint (inventory/structure) · DB-CH01/09 Absolute layers · DB-CH02–08 Critical layers > local screen invention.**

Surface chapters (11–12…) expand visual constitution for named homes; they must not add unlisted screens.

---

# 1. Product domains

| ID | Domain | Purpose |
|----|--------|---------|
| **01** | Authentication | Identity · session · recovery |
| **02** | Teacher Workspace | Home · continue · orient (Desk) |
| **03** | Lesson Design | Designul lecției · canvas · structure |
| **04** | Learning Materials | POM builders · UPE |
| **05** | Assessment | Assessment design · coverage |
| **06** | Knowledge Hub | Search · collections · memory |
| **07** | Reflection | Post-teach · growth |
| **08** | Publishing | Destinations · packages · PDE |
| **09** | Settings | Preferences · a11y · AI · integrations |
| **10** | AI Experience | Recommendations · reasoning · history (PAIM) |
| **11** | Notifications | Quiet alerts |
| **12** | Professional Profile | Portfolio · identity |
| **13** | Administration | Future — schools / policy |
| **14** | Student Workspace | Future |
| **15** | Parent Workspace | Future |

---

# 2. Screen documentation template (mandatory)

Every screen entry uses:

| Field | Content |
|-------|---------|
| Screen ID | `DOMAIN-###` |
| Screen Name | Teacher-facing RO (+ EN id) |
| Purpose | One sentence |
| Primary User | Teacher (default) |
| Entry Points | Routes / actions |
| Exit Points | Where they go next |
| User Goals | Teacher intention |
| Business Goals | Product outcomes |
| Pedagogical Goals | Learning design outcomes |
| Layout | Zones (PDL) |
| Navigation | How chrome behaves |
| Components Used | PDS L2–L5 |
| Experience Patterns | DB-CH04 |
| Journey | DB-CH05 |
| AI Behaviour | PAIM |
| Interaction Rules | PDL · Ch.6 |
| Responsive Behaviour | DB-CH08 |
| Accessibility Requirements | DB-CH07 |
| Performance Expectations | First interaction · skeletons |
| Loading / Empty / Error States | Required |
| Permissions | AuthZ summary |
| Analytics Events | Pedagogical, not vanity |
| API Dependencies | Contracts / engines |
| Design Tokens | Token families |
| Developer Notes | Routes · folders |
| Acceptance Criteria | Quality gates |
| Future Extensions | Honest backlog |

---

# 3. Global contracts (apply to all screens)

### Navigation architecture

| Layer | Spec |
|-------|------|
| **Primary** | Minimal: Home (Desk) · Create/Design · Knowledge · Reflection · (Profile) |
| **Secondary** | Domain tools inside workspace (navigator, shelves) |
| **Context** | Breadcrumb · lesson title · autosave · mode |
| **Search** | Global + scoped (Pattern 09) |
| **Keyboard** | Full task paths · Esc closes overlays |
| **Touch** | 44–48px · gesture alternatives |
| **Voice (future)** | Invited commands only (PAIM) |

### Experience map (no orphans)

```
AUTH ──► HOME (Desk)
           ├─► LESSON (Design) ──► RESOURCE builders ──► PUBLISH
           │         └─► ASSESS / COMPETENCY / TIMELINE (same doc)
           ├─► KNOWLEDGE ──► LESSON / RESOURCE
           ├─► REFLECTION ──► GROWTH / LESSON history
           ├─► AI surfaces (panel / overlay — never orphan home)
           ├─► NOTIFICATIONS ──► deep link target
           └─► SETTINGS / PROFILE
```

Dead ends forbidden. Every screen declares ≥1 exit that returns to a coherent journey.

### State library (standard set)

Normal · Hover · Focus · Loading · Empty · Offline · Syncing · Error · Success · Archived · Published · Review · Collaborative · Read-only · (+ Future)

### Data flow (standard)

Input → Processing → Output · Autosave · Sync · Versioning · Conflict (teacher decides) · Offline queue

### Quality gates (Definition of Done)

A screen is complete only if:

1. Pedagogically validated  
2. UX validated (PDL · Patterns · Journeys)  
3. Accessibility validated (Ch.7)  
4. Responsive validated (Ch.8)  
5. Performance validated  
6. AI validated (PAIM) when AI present  
7. Developer reviewed  
8. QA approved  

---

# 4. Screen Library

> **Legend:** ● Full contract below · ○ Indexed (fill template before build) · ◐ Surface chapter expands visual detail

---

## Domain 01 — Authentication

### ○ AUTH-001 Welcome
Entry marketing/product welcome → Sign In / Create Account. Future.

### ○ AUTH-002 Sign In
Email/password or SSO. Exit → HOME-001. Offline: block with calm message.

### ○ AUTH-003 Create Account
Teacher account creation. Minimal fields. Exit → onboarding or HOME-001.

### ○ AUTH-004 Forgot Password
Recovery flow. No pedagogical AI.

---

## Domain 02 — Teacher Workspace

### ● HOME-001 — Atelierul Profesorului / Biroul meu ◐

| Field | Spec |
|-------|------|
| **Screen ID** | HOME-001 |
| **Screen Name** | Biroul meu (UI) · Atelierul Profesorului (product metaphor) |
| **Purpose** | Orient · continue · start design |
| **Primary User** | Teacher |
| **Entry** | `/` · `/desk` · post-auth · logo |
| **Exit** | Create → lesson/conversation · Continue → LESSON-001 · Knowledge · Reflection · Settings |
| **User Goals** | Know where I am · what to do · resume work |
| **Business Goals** | Activation · return usage |
| **Pedagogical Goals** | Start/continue meaningful lesson design |
| **Layout** | Context header · Primary greeting+CTA+continue · Secondary shelves · Reflection strip · PRIMA Zone |
| **Navigation** | Primary nav home · global search · notifications · profile |
| **Components** | DeskGreeting · PrimaryCreateButton · ContinueLessonCard · CollectionShelf · RecommendationCard · ReflectionBlock · PrimaPresence |
| **Patterns** | Create · Explore · Search · Reflect · Recover |
| **Journey** | J01 entry · J02 continue · J04/J05/J08 tips |
| **AI Behaviour** | PAIM · ≤3 tips · invited · Guiding Star pulse if tips |
| **Responsive** | DB-CH08 Desk rules |
| **Accessibility** | Ch.7 · one primary CTA · AA |
| **Performance** | Shell < interactive ASAP · skeleton continue cards |
| **Loading** | Skeleton greeting + cards |
| **Empty** | First visit welcome · teach how to begin |
| **Error** | Calm retry · work preserved |
| **Permissions** | Authenticated teacher |
| **Analytics** | `desk_view` · `create_click` · `continue_open` (no vanity AI scores) |
| **API** | Projects list · recommendations · reflection strip · KHPM peek |
| **Tokens** | `--prima-*` · motion · touch |
| **Developer Notes** | `src/features/teacher-desk/` · [Ch.11](./DESIGN_BOOK_CH11_TEACHER_DESK.md) |
| **Acceptance** | Five-Second Test · one primary · ≤3 tips · quality gates |
| **Future** | Richer shelves · class context |

---

## Domain 03 — Lesson Design

### ● LESSON-001 — Designul lecției ◐

| Field | Spec |
|-------|------|
| **Screen ID** | LESSON-001 |
| **Screen Name** | Designul lecției |
| **Purpose** | Author living lesson design on canvas |
| **Entry** | Create · Continue · Knowledge open · `/blueprint/review/:id` |
| **Exit** | Materials · Publish · Desk · Reflection |
| **Layout** | Context meta · Secondary navigator · Primary canvas · PRIMA Intelligence |
| **Components** | LessonNavigator · PedagogicalBlock · DesignScore · RecommendationCard · FloatingActionCluster |
| **Patterns** | Build · Review · Improve · Recover · Search (in-lesson) |
| **Journey** | J01 · J02 · J06 |
| **AI Behaviour** | High assist · canvas first · AI third · PAIM |
| **Responsive** | Full authoring desktop/laptop · tablet drawers · mobile companion only |
| **Developer Notes** | `src/features/lesson-blueprint/` · [Ch.12](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md) · FEATURE-001 |
| **Acceptance** | Not form-like · DnD + keyboard · Design Score explainable · gates |

### ○ LESSON-002 — Lesson Timeline
Focused timeline / sequence view (may be mode of LESSON-001). Pattern Build/Review.

### ○ LESSON-003 — Competency Mapping
Curriculum Alignment View · Competency Map composite.

### ○ LESSON-004 — Activity Library
Browse/reuse activities in lesson context · Explore + Search → insert into canvas.

---

## Domain 04 — Learning Materials

| ID | Name | Notes |
|----|------|-------|
| ○ RESOURCE-001 | Worksheet Builder | UPE / POM `worksheet` · J03 |
| ○ RESOURCE-002 | Presentation Builder | POM `presentation` |
| ○ RESOURCE-003 | Assessment Builder | Overlaps Domain 05 · POM `assessment` |
| ○ RESOURCE-004 | Story Builder | POM `story` |
| ○ RESOURCE-005 | Mind Map Builder | POM `mind_map` |
| ○ RESOURCE-006 | Educational Game Builder | POM `educational_game` |

**Shared rules:** Always `lessonReference` when from lesson · Blueprint-gated generation · PAIM explainable tips · PDE for publish.

**Routes (current/target):** `/editor/:objectId` (UPE) · generation workspace bridges.

---

## Domain 05 — Assessment

| ID | Name | Notes |
|----|------|-------|
| ○ ASSESS-001 | Assessment Design | Structured assessment in lesson or standalone builder |
| ○ ASSESS-002 | Assessment Coverage | Review Pattern · non-judgmental coverage |
| ○ ASSESS-003 | Rubric Builder | POM `rubric` |

---

## Domain 06 — Knowledge Hub

| ID | Name | Route / notes |
|----|------|----------------|
| ○ KNOWLEDGE-001 | Knowledge Hub | `/knowledge` · FEATURE-007 · J05 |
| ○ KNOWLEDGE-002 | Collections | Shelves · Explore |
| ○ KNOWLEDGE-003 | Templates | L5 entry → Create |
| ○ KNOWLEDGE-004 | Professional Notes | Teacher notes · private |

---

## Domain 07 — Reflection

| ID | Name | Route / notes |
|----|------|----------------|
| ○ REFLECTION-001 | Lesson Reflection | `/reflection` · RPTI · J04 · listen-first AI |
| ○ REFLECTION-002 | Professional Growth | J08 · no rankings |

---

## Domain 08 — Publishing

| ID | Name | Route / notes |
|----|------|----------------|
| ○ PUBLISH-001 | Publish Experience | `/publishing` · PDE · J07 · validation AI |
| ○ PUBLISH-002 | Package Builder | Bundle materials · versioned |

---

## Domain 09 — Settings

| ID | Name | Notes |
|----|------|-------|
| ○ SETTINGS-001 | Teacher Preferences | Density · language · defaults |
| ○ SETTINGS-002 | Accessibility | Contrast · motion · text · Ch.7 |
| ○ SETTINGS-003 | AI Preferences | PAIM memory · verbosity · mute classes |
| ○ SETTINGS-004 | Integrations | Classroom / board connectors |

---

## Domain 10 — AI Experience

| ID | Name | Notes |
|----|------|-------|
| ○ AI-001 | Recommendations | Panel/overlay · not a separate “chat app home” |
| ○ AI-002 | Reasoning View | Expand explainability · Why/Based on/… |
| ○ AI-003 | History | Tip history · applied/dismissed · transparent |

All obey [PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md).

---

## Domain 11 — Notifications

| ID | Name | Notes |
|----|------|-------|
| ○ NOTIF-001 | Notification Center | Quiet · deep links · no panic red |
| ○ NOTIF-002 | Notification Preferences | Frequency · types |

---

## Domain 12 — Professional Profile

| ID | Name | Notes |
|----|------|-------|
| ○ PROFILE-001 | Professional Profile | Identity · subjects · grades |
| ○ PROFILE-002 | Teaching Portfolio | Opt-in artifacts · private by default |

---

## Domains 13–15 — Future

ADMIN-* · STUDENT-* · PARENT-* reserved. No UI until chartered screens are added here first.

---

# 5. Navigation map (summary)

```
[Logo → HOME-001]
[Primary: Home | Design* | Knowledge | Reflection]
[Global Search → Pattern 09]
[Notifications → NOTIF-001]
[Profile → PROFILE / SETTINGS]

* Design opens last LESSON-001 or Create
```

Context nav inside LESSON-001: breadcrumb Home › Collections › Lesson · modes Focus/Review/Presentation/Print.

---

# 6. Component map (by critical screens)

| Screen | Patterns | Journey | AI | A11y / Perf highlights |
|--------|----------|---------|----|-------------------------|
| HOME-001 | Create Explore Search Reflect Recover | J01 J02 J04 J05 J08 | ≤3 tips | One CTA · skeletons |
| LESSON-001 | Build Review Improve Recover Search | J01 J02 J06 | High assist · wait | Keyboard DnD alt · 60fps drag |
| RESOURCE-* | Create Build Review Publish | J03 | Alignment tips | UPE landmarks |
| KNOWLEDGE-001 | Explore Search | J05 | Discovery | Combobox a11y |
| REFLECTION-001 | Reflect Recover | J04 | Listen first | Simple form |
| PUBLISH-001 | Review Publish Recover | J07 | Validation | Preview gate |

---

# 7. Implementation blueprint (global)

### Suggested React structure

```
src/features/<domain>/
  <Screen>Page.tsx
  components/
  hooks/
  services/
routes in app router → Screen ID comment
```

### Hierarchy pattern

`TeachingShell` → Context strip → Zones (Secondary | Primary | PRIMA) → PDS components

### State management

- Server/document state: repositories / engines  
- UI ephemeral: panel open · mode · density (persist prefs)  
- Autosave: debounced · Recover pattern  

### API / engines

| Concern | Owner |
|---------|-------|
| Lesson document | FEATURE-001 |
| POM materials | FEATURE-002 · UPE |
| Quality / tips | FEATURE-003 PIE · PAIM |
| Publish | FEATURE-005 PDE |
| Reflection | FEATURE-006 |
| Knowledge | FEATURE-007 |
| Differentiation signals | FEATURE-008 |

### Caching

List caches on Desk/Knowledge · invalidate on mutate · offline draft store.

### Testing strategy

- Unit: pure mappers / validators  
- Integration: journey happy paths  
- A11y: Ch.7 checklist  
- Visual: `/design-system` + screen acceptance  
- Responsive: Ch.8 matrix  

### Scalability

Screen IDs stable · domains additive · no rename without registry update.

---

# 8. Analytics events (principles)

Prefer: `lesson_created` · `lesson_resumed` · `material_published` · `reflection_saved` · `tip_applied` · `tip_dismissed`  

Avoid: engagement time vanity · “AI impressiveness” scores · student surveillance metrics.

---

# 9. How to add a screen

1. Reserve Screen ID in this chapter (status ○)  
2. Fill full template  
3. Map Patterns · Journey · PAIM · PDS  
4. Pass quality gates  
5. Implement · link Surface chapter if visual-heavy  
6. Mark ● when shipped  

---

# Success criteria

The Product Blueprint is the **operational manual** of PRIMA.

Designers create consistently.  
Developers implement confidently.  
QA validates objectively.  
Teachers experience **one coherent ecosystem**.
