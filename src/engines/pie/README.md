# FEATURE-003 — Pedagogical Intelligence Engine (PIE)

Central pedagogical quality layer for PRIMA.

- Spec: `docs/engineering/FEATURE-003_PEDAGOGICAL_INTELLIGENCE_ENGINE.md`
- Contracts: `@prima/contracts` → `prima-pedagogical-intelligence`
- Entry: `analyzeLessonDesign(input)` · `pieInputFromBlueprint(...)`

PIE recommends. The teacher decides. Scores are never teacher grades.

Conversation stack (AI-001…003) remains separate; Mission 06 (`src/engines/pedagogy`) is legacy until migrated onto PIE reports.
