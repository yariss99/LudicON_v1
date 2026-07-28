# FEATURE-007 — Knowledge Hub & Pedagogical Memory (KHPM)

Version: 1.0  
Status: Official — Long-Term Pedagogical Memory  
Priority: High  
Last Updated: July 2026

**Dependencies:** FEATURE-001…006 · UX-002 · DESIGN-002 · ES-009 / ENG-02 · PS-002 / ENG-10

**Runtime:** `src/engines/khpm/` · **UI:** `src/features/knowledge-hub/` · **Contracts:** `@prima/contracts` → `prima-knowledge-hub.ts`  
**Route:** `/knowledge` (product hub) · `/library` remains a lightweight entry that may deep-link here

---

## 0. Purpose

The Knowledge Hub is the **long-term pedagogical memory** of PRIMA.

It transforms isolated lessons into an interconnected knowledge ecosystem.

| Teachers do | Teachers no longer |
|-------------|--------------------|
| Discover knowledge | Search for orphan files |
| Navigate ideas | Manage folder trees |
| Cultivate a professional base | Duplicate disconnected copies |

---

## 1. Philosophy

> **Knowledge grows. Knowledge connects. Knowledge evolves.**

Every lesson, reflection, strategy, and pedagogical object enriches the teacher’s professional knowledge base.

---

## 2. Position in the stack

```
FEATURE-001 Lesson Design ──┐
FEATURE-002 POM ────────────┤
FEATURE-003 PIE ────────────┼──► KHPM graph + memory
FEATURE-004 UPE ────────────┤
FEATURE-005 Publications ───┤
FEATURE-006 Reflections ────┘
         │
         ▼
ENG-02 Knowledge (curriculum packs) · ENG-10 Memory (preferences)
```

| Layer | Role |
|-------|------|
| **ENG-02** | Attributable curriculum / platform knowledge |
| **ENG-10** | Teacher preference & working memory |
| **KHPM** | Teacher-owned pedagogical knowledge graph, collections, patterns, hub UX |

KHPM **does not** make pedagogical decisions (teacher authority intact). It indexes, connects, recommends, and retrieves.

---

## 3. Knowledge structure

Node kinds stored and connected:

Lesson Designs · Pedagogical Objects · Teaching Strategies · Learning Activities · Assessment Methods · Differentiation Strategies · Reflection Notes · Templates · Digital Resources · Media · Curriculum References · Professional Notes · Research Summaries · Best Practices · Collections · Patterns

---

## 4. Knowledge graph

Teachers navigate **ideas**, not folders.

Example path:

`Grade III → Mathematics → Fractions → Competencies → Objectives → Activities → Resources → Assessment → Reflection → Improved Lesson`

Edges are typed (`supports`, `assesses`, `derived_from`, `similar_to`, `part_of`, `tagged`, …).  
Suggested semantic links require **teacher approve / reject**.

---

## 5. Smart search

Filters & facets: subject · grade · competency · objective · strategy · resource type · activity · digital tool · Bloom · difficulty · duration · keywords · **natural language**.

Example: *„Arată-mi activități de învățare cooperativă pentru Matematică, clasa a II-a.”*

---

## 6. Recommendation engine

Suggests: successful past lessons · reusable activities · alternative assessments · templates · related reflections · cross-curricular opportunities · digital tools · extensions.

Improves from accept/dismiss signals (private). Never auto-applies.

---

## 7. Knowledge collections

Dynamic sets (Fractions · Reading · STEAM · Outdoor · Remedial · Inspection · Favorites…).  
Auto-suggestions of new items require teacher approval.

---

## 8. Pedagogical patterns

Recurring successful structures (openings · activity sequences · assessment models · differentiation approaches) → saveable as templates.

---

## 9. Curriculum hub

Official curriculum · competencies · content units · outcomes · cross-curricular links · suggested strategies · recommended resources — linked into Lesson Design.

Backed by ENG-02 packs when available; KHPM holds teacher-facing index + links.

---

## 10. Professional notes · templates · media

Notes: observations · research · ideas · experiments · improvement plans · reading summaries (searchable, linkable).  
Templates: lessons · assessments · rubrics · games · presentations · worksheets · escape rooms · reflection models.  
Media: images · icons · video · audio · documents · interactive · AI-generated — auto-tagged, private by default.

---

## 11. Knowledge timeline

Semester strategies · revisited topics · differentiation growth · assessment evolution · recently improved lessons.

---

## 12. Import / export

Import: Word · PPT · PDF · images · existing plans (adapters).  
Export: collections · templates · teaching portfolio · professional archive.

---

## 13. Collaboration (future)

Shared collections · school KB · department · mentor libraries · PLCs — **permission-based only**.

---

## 14. Privacy (normative)

1. **KHPM-I01** — Teachers own their knowledge.  
2. **KHPM-I02** — Private by default.  
3. **KHPM-I03** — Sharing is always optional.  
4. **KHPM-I04** — No automatic publication.  
5. **KHPM-I05** — Suggested links never apply without approval.  
6. **KHPM-I06** — Recommendations never mutate lessons silently.

---

## 15. Acceptance criteria

| Criterion | Foundation |
|-----------|------------|
| Unified knowledge base | KnowledgeNode registry |
| Semantic search | Query + facets + NL heuristics |
| Knowledge graph | Typed edges + traverse |
| Reusable templates | Template nodes |
| Connected reflections | Edges to FEATURE-006 |
| Curriculum integration | Curriculum nodes + links |
| Dynamic recommendations | Ranked suggestions |
| Teacher ownership | Privacy invariants |

---

## 16. Definition of Done

- [x] Specification published  
- [x] Contracts + MVP graph/search/collections engine  
- [x] Hub UI + tests + SPEC_INDEX  
- [ ] Full ENG-02 live pack sync  
- [ ] Binary import adapters  
- [ ] School shared collections  

**Teachers no longer organize files. They cultivate professional knowledge.**
