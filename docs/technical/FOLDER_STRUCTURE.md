---
Status: Draft — defers to ES-001
Version: 1.1
Owner: LUDI ON Product Team
Depends On: ../engineering/ES-001_REPOSITORY_FOUNDATION.md, ../product/PRIMA_REFERENCE_TECHNICAL_ARCHITECTURE.md
Related Documents: SYSTEM_ARCHITECTURE.md, ../engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md
Last Updated: July 2026
---

# LUDI ON — Folder Structure

> **Authoritative repository foundation:** [`../engineering/ES-001_REPOSITORY_FOUNDATION.md`](../engineering/ES-001_REPOSITORY_FOUNDATION.md).  
> This file is a short pointer. Do not invent alternate top-level layouts here.

---

## Production foundation (ES-001)

```
apps/                  # Deployable apps (teacher-workspace)
packages/              # domain, contracts, application, eos, engines/*, ui, testing, config
infrastructure/        # L6 adapters (persistence, messaging, identity, workers)
docs/                  # product (POSS/PAS) + engineering (PDC/ES-*) + design + …
config/ tools/ scripts/ tests/ .github/
src/                   # TRANSITIONAL current Vite UI → migrate to apps/teacher-workspace
```

---

## Documentation (`/docs`)

```
docs/
├── product/              # POSS, constitutional models, PAS
├── engineering/          # PDC, ES-001, SPEC_INDEX
├── design/               # Design system
├── technical/            # Implementation maps (defer to PAS)
├── research/             # Non-normative ideas
└── session_logs/         # Work session records
```

---

## Transitional source (`/src`)

Existing Teacher UI remains under `src/` until migration. **Do not** place Domain, EOS, or Engine business logic here. See [DEVELOPMENT.md](../../DEVELOPMENT.md).

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Top-level / packages dirs | kebab-case | `teacher-workspace`, `engines/blueprint` |
| Engineering specs | `ES-XXX_NAME.md` | `ES-001_REPOSITORY_FOUNDATION.md` |
| Product constitutional docs | `PRIMA_*.md` | `PRIMA_CONSTITUTIONAL_DOMAIN_MODEL.md` |

Source file naming inside packages follows language idioms when implementation begins — still subject to PDC import rules.
