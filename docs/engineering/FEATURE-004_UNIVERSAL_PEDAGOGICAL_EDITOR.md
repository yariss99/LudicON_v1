# FEATURE-004 — Universal Pedagogical Editor (UPE)

Version: 1.0  
Status: Official — Single Creative Environment  
Priority: Highest  
Last Updated: July 2026

**Dependencies:** FEATURE-001 · FEATURE-002 (POM) · FEATURE-003 (PIE) · DESIGN-001 / DESIGN-002 · UX-001 / UX-002

**Runtime:** `src/features/universal-editor/` · **Contracts:** `@prima/contracts` → `prima-universal-editor.ts`  
**Route (foundation):** `/editor/:objectId`  
**Publishing:** [FEATURE-005 PDE](./FEATURE-005_PUBLISHING_DELIVERY_ENGINE.md) — Export tab → `/publishing`

---

## 0. Purpose

UPE is the **central creative workspace** of PRIMA.

| Teachers do | Teachers do not |
|-------------|-----------------|
| Design educational experiences | Edit DOCX / PDF / PPTX as source |
| Refine Pedagogical Objects | Learn a different editor per format |
| Accept / ignore PIE advice | Lose work on navigation |

The editor adapts to the object — not the other way around.

---

## 1. Design philosophy

> One workspace. One interaction model. Infinite educational resources.

Whether the object is a worksheet, presentation, assessment, game, or rubric, the **same five zones**, **same block operations**, and **same save/version/preview** model apply.

---

## 2. Core principles

| Principle | Implication |
|-----------|-------------|
| Pedagogy first | Every action serves a pedagogical goal |
| Consistency | Identical interaction model across object types |
| Direct manipulation | Visual edit — not technical settings first |
| Live feedback | Changes reflect immediately (canvas + preview) |
| Context awareness | Editor knows object type, lesson link, selection |
| Export independence | Never edit export files; renderers project POM |

---

## 3. Supported pedagogical objects

Open registry (FEATURE-002). UPE v1 profiles:

Worksheet · Presentation · Assessment · Educational Game · Homework · Lesson Timeline · Poster · Certificate · Flashcards · Mind Map · Escape Room · Story · Reflection Journal · Rubric · …

**Future types require no editor redesign** — only a profile (default blocks, preview modes, property schema).

---

## 4. Workspace layout (five persistent zones)

```
┌──────────────────────────── Header ────────────────────────────┐
│ Lesson crumb · Object name · Autosave · Version · PIE status   │
├──────────┬─────────────────────────────┬───────────────────────┤
│ Left     │ Central Canvas              │ Right Sidebar         │
│ Objects  │ Visual editing              │ Properties            │
│ Structure│ Drag & drop · inline edit   │ Pedagogy metadata     │
│ Library  │ Block manipulation          │ Design · A11y         │
│ Templates│                             │ Alignment · PIE tips  │
│ Media    │                             │                       │
├──────────┴─────────────────────────────┴───────────────────────┤
│ Bottom: Comments · History · Validation · Compare · Export     │
└────────────────────────────────────────────────────────────────┘
```

| Zone | Contents |
|------|----------|
| **Header** | Lesson breadcrumb · object title · autosave · version · PIE status chip |
| **Left** | Pedagogical objects in lesson · structure outline · library · templates · media |
| **Canvas** | Block composition · DnD · inline edit · selection chrome |
| **Right** | Properties · pedagogical metadata · design · accessibility · curriculum · PIE recommendations |
| **Bottom** | Comments (future) · history · validation · version compare · export preview |

**Design note:** UPE’s five-zone shell is the **Editor** template (DESIGN-002 Ch.6). Teaching Desk / Conversation continue to use `TeachingShell`. UPE may embed a compact PRIMA presence in the right sidebar (recommendations), not a second competing chrome system.

---

## 5. Block-based editing

Canonical content = FEATURE-002 `PedagogicalBlock[]`.

### 5.1 Block catalog (editor-facing)

Title/Heading · Paragraph · Image · Video · Exercise · Multiple Choice · Open Question · Matching · Timeline · Table · Diagram · Reflection · Hint · Teacher Note · Success Criteria · Interactive · Divider · Quote · Media Gallery · Custom

Maps to POM `PedagogicalBlockTypeId` (aliases allowed in profiles).

### 5.2 Universal block operations

| Op | Behavior |
|----|----------|
| Move | Reorder / nest within rules |
| Duplicate | New id, deep clone |
| Lock | Prevent edit until unlock |
| Hide | `visibility: hidden` (still in structure) |
| Reuse | Save block to teacher library |
| Convert | Change type when content compatible |
| Delete | Soft-delete with undo |
| Annotate | Teacher comment anchor (future collab) |

### 5.3 Smart blocks

Blocks carry pedagogical fields (example: Exercise):

Difficulty · Competency · Bloom · Feedback · Hints · Estimated time · Success criteria · Differentiation · Accessibility · Teacher notes

Stored in `content` + `pedagogicalPurpose` + object-level `pedagogy` mappings (POM).

---

## 6. Contextual AI (PIE)

PIE assists **without interrupting** (FEATURE-003).

Examples (RO, UX-002):

- *Această activitate depășește timpul estimat.*
- *Evaluarea nu mai măsoară Obiectivul 2.*
- *Un suport vizual ar putea ajuta înțelegerea.*
- *Fișa ar putea beneficia de încă un exercițiu de practică.*

Surface: right sidebar + optional floating suggestion (DESIGN-001).  
Actions: **Aplică** · **Ignoră** · **Află mai mult**.  
Teacher always decides.

Debounce re-analysis after edits (`reanalyzeOnChange`).

---

## 7. Live preview

Modes (no manual refresh):

| Mode | Purpose |
|------|---------|
| `printable` | Print / PDF-oriented |
| `presentation` | Slide-like |
| `student` | Learner-facing |
| `mobile` | Narrow viewport |
| `interactive` | Games / HTML interactions |
| `accessibility` | A11y-oriented rendering |

Preview reads the **same POM snapshot** as the canvas. Export preview uses renderer descriptors (FEATURE-002), never a parallel document model.

---

## 8. Universal search

Query across: blocks · activities · competencies · objectives · resources · images · templates · curriculum · teacher library.

Results deep-link to canvas selection or left-nav targets.

---

## 9. Version history

Automatic snapshots · named versions · restore · compare · branch · merge (reserved) · duplicate · timeline UI.

Backed by FEATURE-002 `PedagogicalObjectVersion`. Every AI apply and teacher edit creates a versioned change (or coalesced autosave snapshot).

---

## 10. Collaboration (future)

Comments · suggestions · shared editing · mentor review · school workspace · approval workflow.  
Bottom panel reserved; no schema break required (anchors on block ids).

---

## 11. Validation panel

Continuous checks (POM validation + PIE findings):

Missing objectives · missing assessment · time imbalance · accessibility · duplicates · broken references · curriculum alignment.

Each issue: explanation · suggested fix · estimated impact · jump-to-block.

---

## 12. Export preview

Formats: DOCX · PDF · PPTX · HTML · Markdown · SCORM · LearningApps · Wordwall · Genially · Google Classroom · Moodle.

**Invariant:** Exports always originate from the pedagogical object (POM-I01 / UPE-I02).

---

## 13. UX goals

Teachers should feel:

1. Everything is connected.  
2. Everything is editable.  
3. Nothing is lost.  
4. Every recommendation has a reason.  
5. Every action is reversible.  
6. The interface never becomes overwhelming.

Pass DESIGN-002 Five-Second Test on every UPE surface.

---

## 14. Architecture

```
UPE Workspace State
  ├── pedagogicalObject (FEATURE-002)
  ├── selection / ui chrome
  ├── previewMode
  ├── pieReport (FEATURE-003)
  ├── validationIssues
  └── versions[]

Block operations  →  pure functions on POM blocks
Autosave          →  object store (versioned)
Export            →  Renderer[format](objectVersion)
```

| Legacy | Role |
|--------|------|
| `src/features/asset-studio` | Pre-UPE editor — migrate onto UPE profiles |
| Living Workspace `/studio/:id` | Project shell — opens UPE for resources |

---

## 15. Invariants

1. **UPE-I01** — One editor shell for all pedagogical object types.  
2. **UPE-I02** — Canonical edit target is POM; exports are derivatives.  
3. **UPE-I03** — Block operations are type-agnostic at the shell layer.  
4. **UPE-I04** — PIE recommendations never auto-mutate without teacher accept.  
5. **UPE-I05** — Autosave + undo keep work recoverable.  
6. **UPE-I06** — New object types = profile registration, not new editors.  
7. **UPE-I07** — Teacher-facing copy follows UX-002.

---

## 16. Acceptance criteria

| Criterion | Foundation |
|-----------|------------|
| One editor for all objects | UpeShell + profiles |
| Block-based editing | POM blocks + ops |
| Live preview | Preview mode switch |
| Integrated PIE | Right-rail recommendations |
| Automatic validation | Validation panel bridge |
| Universal search | Search index over document |
| Version history | Snapshot model |
| Export-independent editing | No file source |
| Future-proof | Open type/block registry |

---

## 17. Definition of Done

- [x] Specification published  
- [x] Contracts + block operations + workspace foundation  
- [x] Route `/editor/:objectId`  
- [x] PIE + validation surfaces in shell  
- [x] Indexed in SPEC_INDEX  
- [ ] Full DnD + all smart-block property editors (follow-on)  
- [ ] Production renderers hooked to export preview (follow-on)  
- [ ] Asset Studio migration complete (follow-on)

**Teachers no longer edit documents. Teachers design learning experiences.**
