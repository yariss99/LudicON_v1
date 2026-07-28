# FEATURE-002 — Pedagogical Object Model (POM)

Status: Official — Canonical Resource Foundation  
Priority: Highest  
Version: 1.0  
Last Updated: July 2026

References: FEATURE-001 · DESIGN-002 · UX-001 · UX-002 · ES-007 · PAS-006 · PRIMA_CANON · [Design Book Ch.3 PDS](../design/DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md)

**Runtime contracts:** `@prima/contracts` → `prima-pedagogical-objects.ts`  
**Quality analysis:** [FEATURE-003 PIE](./FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md) analyzes lesson design and linked pedagogical objects.  
**Editor:** [FEATURE-004 UPE](./FEATURE-004_UNIVERSAL_PEDAGOGICAL_EDITOR.md) is the single creative environment for all pedagogical objects.

---

## 0. Purpose

Define the **single canonical data model** for every educational resource created by PRIMA.

| Resource examples | Not storage formats |
|-------------------|---------------------|
| Worksheet · Presentation · Assessment · Rubric · Game · Lesson plan · Printable · Flashcards · … | DOCX · PDF · PPTX · HTML · SCORM · … |

**Documents are only export formats.**  
Resources exist as **pedagogical objects**.

---

## 1. Core principle

```
Content  ⊥  Presentation  ⊥  Export
         \       |        /
          PedagogicalObject
```

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Content** | Blocks, pedagogy, metadata, versions | Layout engines, file bytes |
| **Presentation** | Editor layout hints, style tokens, visibility | Pedagogy decisions |
| **Export** | Renderers that project an object snapshot | Authoritative content |

One pedagogical object → many representations → many exports.

---

## 2. Separation from Cognitive Objects

| Model | Spec | Role |
|-------|------|------|
| **Cognitive Objects** | ES-007 | Intelligence pipeline artifacts (context, strategy, blueprint compose, approval, generation package…) |
| **Pedagogical Objects** | FEATURE-002 | Teacher-facing educational resources that are edited, versioned, and exported |

Cognitive Objects may *cause* Pedagogical Objects (e.g. after Teacher Approval → generate worksheet).  
They are **not** the same identity space.

Lesson Project (FEATURE-001) is the **pedagogical source of truth for the lesson**.  
Each material is a Pedagogical Object with `lessonReference` pointing at that project.

---

## 3. Root object — `PedagogicalObject`

Every educational resource inherits this shape.

| Property | Type | Rules |
|----------|------|-------|
| `id` | string | Stable UUID / ULID |
| `schemaVersion` | string | POM schema (e.g. `1.0.0`) |
| `objectType` | `PedagogicalObjectTypeId` | Registry key (extensible) |
| `title` | string | Required, teacher-visible |
| `description` | string | Optional summary |
| `subject` | string | Curriculum subject |
| `grade` | string | Grade / year band |
| `lessonReference` | `LessonReference \| null` | Link to Proiectul lecției |
| `competencies` | `CompetencyRef[]` | Mapped competencies |
| `learningObjectives` | `LearningObjectiveRef[]` | Mapped objectives |
| `difficulty` | `DifficultyLevel` | overall |
| `estimatedTime` | number (minutes) | Optional |
| `author` | `AuthorRef` | Teacher / system attribution |
| `createdAt` | ISO datetime | Immutable origin |
| `updatedAt` | ISO datetime | Last content change |
| `tags` | string[] | Free tags |
| `language` | BCP-47 | Default `ro` |
| `curriculumVersion` | string | Optional curriculum pack id |
| `status` | `PedagogicalObjectStatus` | Lifecycle |
| `version` | `ObjectVersionLabel` | Semver-like or integer label |
| `blocks` | `PedagogicalBlock[]` | Ordered content tree roots |
| `pedagogy` | `PedagogicalMetadata` | Rich mapping (Ch.5) |
| `relationships` | `ObjectRelationship[]` | Graph edges |
| `validation` | `ObjectValidationSnapshot \| null` | Last validation |
| `metadata` | `Record<string, unknown>` | Extension bag (non-authoritative) |

### 3.1 Status

`draft` → `ready` → `published` → `archived`  
Also: `needs_review` (blocking validation), `superseded` (replaced by newer lineage).

### 3.2 Lesson reference

```ts
LessonReference {
  lessonProjectId: string
  lessonVersionId?: string
  activityIds?: string[]
}
```

Objects **may** exist without a lesson (library templates). Classroom materials **should** keep the link.

---

## 4. Object types (open registry)

Known types (v1 catalog). New types = registry entry only — **no architectural redesign**.

| Type id | Teacher label (RO) | Typical exports |
|---------|--------------------|-----------------|
| `worksheet` | Fișă de lucru | PDF, DOCX, HTML |
| `presentation` | Prezentare | PPTX, PDF, HTML |
| `assessment` | Evaluare | PDF, DOCX, HTML, Moodle |
| `educational_game` | Joc educațional | HTML, LearningApps, Wordwall |
| `rubric` | Rubrică | PDF, DOCX, HTML |
| `lesson_plan` | Plan de lecție | PDF, DOCX |
| `homework` | Temă pentru acasă | PDF, DOCX |
| `differentiated_activity` | Activitate diferențiată | PDF, DOCX |
| `interactive_exercise` | Exercițiu interactiv | HTML, SCORM |
| `poster` | Poster | PDF, PNG* |
| `certificate` | Diplomă / certificat | PDF |
| `story` | Poveste | PDF, DOCX, HTML |
| `flashcards` | Fișe (flashcards) | PDF, HTML, LearningApps |
| `escape_room` | Escape room | HTML, Genially |
| `mind_map` | Hartă mentală | PDF, HTML, PNG* |

\* Raster outputs are still **renders**, not source of truth.

**Extensibility rule:** `PedagogicalObjectTypeId` is a string branded by registry. Unknown types are valid if registered at runtime with a block schema profile.

Migration note: existing `AssetTypeId` / `PlannedMaterialId` values map into this registry (see §13).

---

## 5. Internal structure — blocks

Every object is an ordered composition of **blocks**. Blocks are independently editable.

### 5.1 Block properties

| Property | Purpose |
|----------|---------|
| `id` | Stable identity |
| `type` | `PedagogicalBlockTypeId` |
| `content` | Typed payload (JSON) |
| `layout` | Presentation hints (columns, span, order) — non-authoritative for pedagogy |
| `style` | Visual tokens (emphasis, size) — presentation |
| `visibility` | `teacher` · `student` · `both` · `export_only` · `hidden` |
| `difficulty` | Optional per-block override |
| `pedagogicalPurpose` | Why this block exists educationally |
| `dependencies` | Other block ids / media refs required |
| `validation` | Local validation state |
| `children` | Nested blocks (optional tree) |
| `metadata` | Extension bag |

### 5.2 Block types (v1)

`heading` · `paragraph` · `image` · `exercise` · `question` · `hint` · `table` · `timeline` · `instruction` · `reflection` · `teacher_note` · `divider` · `quote` · `media` · `interactive`

Future block types register the same way — no model change.

### 5.3 Content vs presentation

| In `content` | In `layout` / `style` |
|--------------|------------------------|
| Stem text, options, answer key refs | Column width, page break hint |
| Objective ids served by this exercise | Accent color token |
| Media asset id | Crop / aspect suggestion |

AI and teachers edit **content** (and pedagogy). Layout may be adjusted in the Universal Editor without changing meaning.

---

## 6. Pedagogical metadata

`pedagogy: PedagogicalMetadata`

| Field | Description |
|-------|-------------|
| `learningObjectiveMapping` | Objective id → block ids |
| `competencyMapping` | Competency id → block ids |
| `assessmentMapping` | Assessment criteria → blocks / scores |
| `bloomLevel` | Dominant Bloom (optional per-object) |
| `differentiationLevel` | e.g. support · core · extension |
| `estimatedCognitiveLoad` | low · medium · high |
| `requiredResources` | Materials / devices |
| `crossCurricularLinks` | Other subjects / themes |
| `inclusionNotes` | Access / inclusion guidance |
| `teacherNotes` | Private teacher guidance |

This metadata is **first-class**, not buried in free text.

---

## 7. Versioning

Every meaningful modification creates an **Object Version**.

```
PedagogicalObjectVersion {
  id
  objectId
  versionLabel
  createdAt
  author
  summary
  snapshot          // full PedagogicalObject content (+ pedagogy + blocks)
  parentVersionId?
  branchId?
  kind: save | restore | branch | duplicate | merge
}
```

Teacher capabilities:

| Capability | v1 | Notes |
|------------|----|-------|
| Compare | ✓ | Diff by blocks + metadata |
| Restore | ✓ | Creates new version from snapshot |
| Duplicate | ✓ | New object id, lineage preserved |
| Branch | ✓ | Parallel edits |
| Merge | reserved | Future three-way merge |

**AI edits create versions** the same way teacher edits do (`author.kind = 'prima' | 'teacher'`).

---

## 8. Rendering & export

Rendering is a **pure projection**:

```
PedagogicalObject (+ version snapshot)
        → Renderer[format]
        → ExportArtifact (bytes / URL)
```

### 8.1 Supported output families

| Family | Formats |
|--------|---------|
| Documents | DOCX · PDF · PPTX · HTML · Markdown |
| Packages | SCORM |
| Platforms | LearningApps · Wordwall · Genially · Google Classroom · Moodle |

### 8.2 Renderer contract

```
Renderer {
  id
  formats: ExportFormatId[]
  supports(objectType): boolean
  render(object, options): ExportArtifact
}
```

Future renderers plug into the same object. **No renderer may become source of truth.**

---

## 9. Universal Editor

The editor edits **Pedagogical Objects** only.

| Allowed | Forbidden |
|---------|-----------|
| Block insert / edit / reorder | Opening DOCX as source |
| Pedagogy metadata edit | AI patching export files |
| Live preview via renderer | Persisting PDF as canonical |
| Version restore | Dual-write to document formats |

Exports are generated **dynamically** from the current (or pinned) version.

---

## 10. AI integration

| Rule | Detail |
|------|--------|
| AI never edits DOCX/PDF/PPTX | Only PedagogicalObject / blocks |
| AI mutations are versioned | Traceable `author` + summary |
| Consistency | Same object → many exports stay aligned |
| Live preview | Renderer reads object, not AI file |

PRIMA suggestions in the UI (DESIGN-002) apply as proposed block/metadata patches awaiting teacher acceptance when authority requires it.

---

## 11. Relationships

`relationships: ObjectRelationship[]`

| `kind` | Target |
|--------|--------|
| `lesson` | Lesson project |
| `competency` | Competency registry |
| `objective` | Learning objective |
| `activity` | Lesson activity id |
| `object` | Other PedagogicalObject |
| `media` | Media library asset |
| `template` | Template object |
| `library` | Teacher library shelf entry |

Edges are directional (`from` implied = this object, `to` = ref).

---

## 12. Validation

Every object validates before export readiness.

| Domain | Checks |
|--------|--------|
| **Structure** | Required title · ≥1 block · known types · acyclic children |
| **Curriculum alignment** | Objectives/competencies present when lesson-linked |
| **Missing metadata** | Language · grade · subject for publish |
| **Dependencies** | Resolved block/media deps |
| **Accessibility** | Alt text for images · heading order · contrast hints |
| **Export readiness** | Renderer support · blocking issues absent |

```
ObjectValidationIssue {
  code        // POM-V-###
  severity    // error | warning | info
  path?       // e.g. blocks[2].content
  message     // teacher language in UI layer
}
```

Internal codes may be English; **UI copy** follows UX-002.

---

## 13. Mapping from current runtime

| Current | POM |
|---------|-----|
| `AssetTypeId` | `PedagogicalObjectTypeId` (subset) |
| `PlannedMaterialId` | Intent to create object type |
| `AssetStudioDocument` | Editor projection of PedagogicalObject |
| `StudioNode` / `GeneratedBlock` | Migrate → `PedagogicalBlock` |
| `ExportFormat` in asset-studio | `ExportFormatId` + Renderer |
| `BlueprintReviewDocument` | Lesson project (not a POM resource); referenced via `lessonReference` |

Migration is incremental: new code imports `@prima/contracts` POM types; feature modules adapt adapters until Asset Studio stores POM natively.

---

## 14. Invariants (normative)

1. **POM-I01** — Canonical storage is PedagogicalObject JSON (or equivalent structured store), never an office file.  
2. **POM-I02** — Every resource type inherits the root object.  
3. **POM-I03** — Content is block-based; blocks are independently addressable.  
4. **POM-I04** — Export artifacts are ephemeral or cached derivatives.  
5. **POM-I05** — AI and teachers mutate objects/versions, not export bytes.  
6. **POM-I06** — New object/block types register without changing the root schema.  
7. **POM-I07** — Lesson-linked objects preserve `lessonReference` across versions unless explicitly detached.  
8. **POM-I08** — Presentation fields must not store learning-objective truth that is absent from content/pedagogy.

---

## 15. Acceptance criteria

| Criterion | Met by |
|-----------|--------|
| One canonical object model | §3 + contracts |
| All resources inherit from it | §4 registry |
| Block-based architecture | §5 |
| Multiple renderers supported | §8 |
| AI edits objects | §10 |
| Exports generated dynamically | §8–9 |
| Future types need no redesign | §4, §5.2, POM-I06 |

---

## 16. Definition of Done

- [x] Specification published (this document)  
- [x] TypeScript contracts + MVP validation in `@prima/contracts`  
- [x] Indexed in SPEC_INDEX  
- [ ] Asset Studio / Generation persist POM natively (follow-on sprint)  
- [ ] First production renderer suite (PDF/DOCX) against POM (follow-on)

**The Pedagogical Object Model is the foundation of every educational resource inside PRIMA. All future development must use this model.**
