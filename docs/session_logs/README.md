---
Status: Official
Version: 1.0
Owner: LUDI ON Product Team
Depends On: LUDI_ON_PROJECT_BIBLE.md
Related Documents: ../product/PRODUCT_ROADMAP.md
Last Updated: July 2026
---

# Session Logs — Documentation Guide

Every significant work session on LUDI ON must leave a trace. Documentation is part of the deliverable, not an afterthought.

---

## Purpose

- Preserve **why** decisions were made
- Enable any team member to continue work without oral handoff
- Connect daily work to product documents
- Satisfy the rule: **documentation before implementation**

---

## When to Create a Session Log

Create a log when:

- A sprint task starts or completes
- A product decision is made
- A document is created or materially updated
- Implementation begins for an approved feature
- Research produces actionable conclusions

Skip logs for trivial typo fixes with no product impact.

---

## File Naming

```
/docs/session_logs/YYYY-MM-DD_short-topic.md
```

Examples:

- `2026-07-20_dashboard-hero-polish.md`
- `2026-07-20_prima-conversation-blueprint.md`
- `2026-07-20_documentation-architecture.md`

---

## Required Template

Every session log must include:

```markdown
---
Status: Session Log
Date: YYYY-MM-DD
Participants: (names or roles)
Related Documents: (links)
---

# Session Title

## Objective
What we set out to do.

## Work Completed
- Bullet list of concrete outcomes

## Decisions Made
| Decision | Rationale |
|----------|-----------|

## Documents Created or Updated
- path/to/doc.md — summary of change

## Open Items
- What remains unresolved (link to OPEN_QUESTIONS.md if applicable)

## Next Session
Recommended focus for the next work block.
```

---

## Linking Rules

1. Session logs **reference** product docs — they do not duplicate specs
2. Major decisions must update the authoritative product document in the same session or the next
3. New open questions go to `docs/research/OPEN_QUESTIONS.md`
4. Approved ideas move from `IDEAS.md` → `FUTURE_FEATURES.md` or roadmap

---

## Approval Workflow Reminder

```
Research → Product Document (Draft) → Review → Approved → Implementation
```

No implementation of major features until the governing product document is approved.

---

## Next Recommended Document

→ [`../product/LUDI_ON_PROJECT_BIBLE.md`](../product/LUDI_ON_PROJECT_BIBLE.md) — Return to project entry point.
