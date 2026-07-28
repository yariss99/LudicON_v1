# Contributing to PRIMA / LUDI ON

Thank you for contributing. All work must comply with **POSS**, **PAS**, and **PDC**.

- [SPEC_INDEX](docs/engineering/SPEC_INDEX.md)  
- [PDC](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md)  
- [ES-001](docs/engineering/ES-001_REPOSITORY_FOUNDATION.md)

## Code of Conduct

Participants must follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Repository rules

1. Do not redesign architecture in PRs.  
2. Do not add Engines, Modules, or Layers without an Architecture Change + POSS/PAS update.  
3. Dependencies point inward to Domain.  
4. No business secrets in the repository.  
5. Prefer the simplest change that preserves PAS.

---

## Branching strategy

| Branch | Use |
|--------|-----|
| `main` | Protected; production-bound history |
| `feature/<short-name>` | Features |
| `fix/<short-name>` | Bug fixes |
| `docs/<short-name>` | Documentation only |
| `chore/<short-name>` | Tooling, scaffolding, CI |

Long-lived personal branches are discouraged. Rebase or merge from `main` regularly.

---

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional-scope): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`

**Scopes (examples):** `domain`, `eos`, `engines/blueprint`, `docs`, `repo`

Breaking changes: `BREAKING CHANGE:` footer or `!` after type.

---

## Pull requests

1. Use the PR template.  
2. Link related issues.  
3. Keep PRs focused.  
4. Update docs when behaviour or structure changes.  
5. Pass lint/typecheck/tests for touched areas.  
6. Complete the PAS/PDC checklist.

**Review rules**

- At least one review for `main`.  
- Changes to `packages/domain`, `packages/eos`, or Engine boundaries need an architecture-aware reviewer.  
- “LGTM” without reading Domain/Policy impact is insufficient for gate-related code.

---

## Definition of Ready (DoR)

A work item is Ready when:

- [ ] Problem and outcome are clear  
- [ ] POSS/PAS impact is identified (or marked none)  
- [ ] Acceptance criteria written  
- [ ] Dependencies known  
- [ ] No unresolved Architecture Change required (or ticket linked)

## Definition of Done (DoD)

A change is Done when:

- [ ] Implements accepted criteria without PAS/PDC violations  
- [ ] Tests appropriate to the layer are present or explicitly waived with reason  
- [ ] Public package/app README updated if ownership/deps changed  
- [ ] Docs updated if constitutional or structural meaning changed  
- [ ] PR reviewed and CI green  
- [ ] No secrets committed  

---

## Versioning strategy

- **Packages:** Semantic Versioning (MAJOR.MINOR.PATCH) once published/versioned.  
- **Apps:** Product versioning aligned with product roadmap; independent of library minors when needed.  
- Contract-breaking changes in `packages/contracts` or Domain events → **MAJOR**.

## Release strategy

- Releases are tagged from `main`.  
- Changelog entries required for user-visible or contract-visible changes.  
- No release that weakens Teacher Authority gates or fail-visible Policy.  
- Hotfixes: `fix/*` → PR → tag.

---

## Issue types

Use GitHub issue templates:

- Bug report  
- Feature request  
- Architecture change (POSS/PAS amendment path)
