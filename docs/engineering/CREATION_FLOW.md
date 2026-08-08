# Creation flow — the one unbroken chain

Status: contract. Everything below is what the code does after this change, not a wish list.

```
intent capture  →  lesson design  →  APPROVAL GATE  →  materials  →  builder  →  publish
/create/experience  /design/$id      (binding, explicit)  /materials/$id  /builder/$projectId/$kind/$documentId
```

## States

| Where | What holds the state | Values |
| --- | --- | --- |
| Project | `Project.state` | `discovery → design → approved → materials_ready → published` |
| Lesson design | `LessonPlan.approvedAt` | `null` (gate shut) \| `Timestamp` (gate open, binding) |
| Material | `Document.status` | `draft → needs_review → ready → published → archived` |
| Shelf | `Project.archived` + `archivedAt` | live \| archived (restorable) |

`canGenerateMaterials(state)` and `isApproved(plan)` are both consulted. Two answers to one
question is how the old flow drifted; they must agree before anything is produced.

## What each step persists

**1 · `/create/experience` — intent capture**
Writes one `Project` (`state: "design"`) and one `LessonPlan` (`approvedAt: null`).
The chosen material kind is now a field — `Project.intendedKind: AssetKind` — and the project title
is the teacher's topic alone. It is no longer `"Fișă de lucru: <topic>"`; a type is not a name.
`Project.plannedMaterials: PlannedMaterial[]` is seeded with the chosen kind, `selected: true`.

**2 · `/design/$lessonPlanId` — lesson design**
Autosaves the `LessonPlan`: blocks, derived `completion`, derived `score`. Nothing else moves.

**3 · The approval gate — a deliberate act**
The primary button says `Confirmă designul lecției`. It opens a confirmation that states, in the
teacher's words, what confirming means and what happens next. Only the confirm inside that dialog
writes anything. One write, both halves together:

- `LessonPlan`: `approvedAt`, `approvedBy`, `approvalNote`, `status: "ready"`
- `Project`: `state: "approved"`

Approval is binding: there is no "unapprove". A design can still be edited afterwards — Teacher
Authority means the teacher stays in charge of the work, not that the work freezes.
The gate opens only when `APPROVAL_REQUIRED_SECTIONS` are complete; until then the button explains
what is still expected, never what is "missing".

**4 · `/materials/$lessonPlanId` — the materials**
Only reachable through the gate; if `approvedAt` is null the page offers the way back to the design.
The picker is seeded from `plannedMaterials`, so a teacher who leaves and returns finds their choice.
Confirming writes, inside **one** `transact()`:

- one `Document` per chosen kind (real envelope, real per-kind body, `createdBy: "teacher"`)
- one `Version` snapshot per document, so history starts at v0 rather than at the first edit
- one library `Resource` per document, carrying `documentId` so the shelf points at the artifact
  instead of describing a second one
- `Project.state: "materials_ready"`, `Project.plannedMaterials` updated

Every material offered here has an authoring surface. A kind that cannot be opened is not offered —
that is what made the last link dead.

**5 · `/builder/$projectId/$kind/$documentId` — the builder**
Opens the `Document` written in step 4. Autosave writes document + version together.
`worksheet` gains a builder here; it was the most-chosen entry in the create menu and the only one
of the six with nowhere to land.

**6 · Publish**
`status: "published"`, `publishedAt` set, blocking checks first.

## Archive and delete

Domain (pure, in `entities/project.ts`):
`isArchived`, `archiveProject(project, at)`, `restoreProject(project, at)`.
Archiving sets `archived: true` and `archivedAt`; restoring clears both. Archived projects keep
everything they own.

Data layer (`packages/data-access/src/repositories.ts`):

- `projects.archive(id)` / `projects.restore(id)` / `projects.listArchived()`
- `projects.deleteWithContents(id)` — a project **owns** its lesson design, its documents, their
  version snapshots and their library entries. Deleting removes all of them in one `transact()`,
  and prunes the deleted resource ids out of every `Collection`, so nothing is orphaned and no
  shelf keeps a dangling id. Returns a `ProjectRemoval` count of what went, so the interface can
  say what happened instead of guessing.

## Domain changes

| Entity | Added | Why |
| --- | --- | --- |
| `Project` | `intendedKind: AssetKind` | the kind was a substring of the title |
| `Project` | `plannedMaterials: PlannedMaterial[]` | `PlannedMaterial` existed and was referenced nowhere |
| `Project` | `archivedAt: Timestamp \| null` | `archived` had no when, so "restore" had nothing to say |
| `LessonPlan` | `approvedBy`, `approvalNote` | approval is an act with an author, not a flag |
| `Resource` | `documentId: DocumentId \| null` | a library entry must point at the artifact |
| `Document` | `AnyDocument`, `AnyVersion` | body-agnostic schemas the cascade needs |

`archivedAt` and `approvedAt` are both absent from their patch shapes. Neither transition may
happen as a side effect of a field write.

The `documents` and `document-versions` collections move from the web app into
`packages/data-access`, because a cascade that cannot see them cannot be correct.

## Migration

`LocalStorageProvider` moves to schema version **2**.

The previous mechanism could never have run: the version was baked into the storage key, so a v2
build looked only at `ludicon.<collection>.v2`, found nothing, and silently handed the teacher an
empty studio. `#read` now falls back through older version keys, migrates forward, writes the
result at the current key and drops the stale one.

`migrations/1-to-2` (per collection):

- `projects` — derive `intendedKind` from the `"<Label>: "` title prefix, strip that prefix from
  the title, seed `plannedMaterials`, add `archivedAt: null`
- `lesson-plans` — add `approvedBy: null`, `approvalNote: null`
- `resources` — add `documentId: null`

Anything else passes through untouched.

## Language

Never in visible Romanian copy: Blueprint, Engine, Pipeline, Validation, AI, Generate, Error,
Invalid, Required, "No data". Failures say what is safe first (`Ce ai lucrat este în siguranță`)
and offer the next step. `isTeacherSafeMessage` in `@ludicon/contracts` is the executable form of
this rule.
