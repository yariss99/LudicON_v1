# Contributing to PRIMA / LUDI ON

Read [DEVELOPMENT.md](DEVELOPMENT.md) first for setup and commands, and
[ARCHITECTURE.md](ARCHITECTURE.md) for how the monorepo fits together.

Work must comply with the Foundation Suite — in particular
[PRIMA-DOC-006 Engineering Standards](docs/product/PRIMA-DOC-006_ENGINEERING_STANDARDS.md),
[PRIMA-DOC-005 UX Design Standards](docs/product/PRIMA-DOC-005_UX_DESIGN_STANDARDS.md) and
[PRIMA-DOC-004 AI Constitution](docs/product/PRIMA-DOC-004_AI_CONSTITUTION.md) — and with the
[Development Constitution (PDC)](docs/engineering/PRIMA_DEVELOPMENT_CONSTITUTION.md).

## Code of Conduct

Participants must follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Repository rules

1. `packages/domain` imports nothing from this repo. Everything else may import it.
2. `apps/web` never imports from `apps/api` or `apps/worker`. It talks to the API over HTTP through
   `HttpProvider`, using types from `packages/contracts`.
3. Features do not import each other's internals. Shared code moves into a package.
4. Persistence goes through a repository over `DataProvider`. No `localStorage` calls in feature code.
5. Components use semantic tokens (`bg-card`, `text-muted-foreground`). No raw palette variables, no hex.
6. Domain shapes are Zod schemas with inferred types. Never a hand-written interface next to a schema.
7. Interface copy is educational Romanian. Per [UX-001](docs/engineering/UX-001_TEACHER_LANGUAGE_FIRST.md),
   the words *Engine*, *Pipeline* and *Blueprint* must not appear in anything a teacher sees. Internal route
   and type names may use them.
8. Never auto-approve, auto-authorise generation, or auto-publish to students. Approval is the teacher's, at
   a binding gate. Failures stay visible — no silent success.
9. No secrets in the repository. Only `VITE_`-prefixed variables reach the browser bundle.
10. Prefer the simplest change that preserves the layering. Do not redesign architecture inside a feature PR.

---

## Branching

| Branch | Use |
|---|---|
| `main` | Protected; production-bound history |
| `feature/<short-name>` | Features |
| `fix/<short-name>` | Bug fixes |
| `docs/<short-name>` | Documentation only |
| `chore/<short-name>` | Tooling, scaffolding, CI |
| `refactor/<short-name>` | Structural change with no behaviour change |

Rebase or merge from `main` regularly. Long-lived personal branches are discouraged.

---

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional-scope): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`

**Scopes** are workspace names or feature directories:
`web`, `api`, `worker`, `domain`, `contracts`, `data-access`, `ui`, `config`, `docs`, `repo`,
or `web/asset-studio`, `web/lesson-blueprint`, and so on.

Breaking changes: a `BREAKING CHANGE:` footer, or `!` after the type.

---

## Pull requests

1. Use the PR template.
2. Link the related issue.
3. Keep PRs focused — one concern each.
4. Update docs when behaviour or structure changes.
5. Run the local checks below. There is no CI yet.

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`format:check` covers code only (`ts,tsx,json,css`). Markdown is intentionally not Prettier-formatted, so
you are free to hand-format tables in docs — see
[DEVELOPMENT.md](DEVELOPMENT.md#quality-gates).

**Review rules**

- At least one review before merging to `main`.
- Changes to `packages/domain`, `packages/contracts` or the `DataProvider` interface need an
  architecture-aware reviewer. These are the seams everything else is built on.
- Changes to teacher-facing copy need someone who reads Romanian.
- "LGTM" without reading the domain or policy impact is insufficient for anything touching an approval gate.

---

## Definition of Ready

- [ ] Problem and outcome are clear
- [ ] Acceptance criteria written
- [ ] Dependencies known
- [ ] Impact on the Foundation Suite identified, or explicitly none
- [ ] No unresolved architecture change required, or a ticket is linked

## Definition of Done

- [ ] Meets the acceptance criteria without breaking a repository rule above
- [ ] Typecheck, lint and format pass
- [ ] Tests present, or explicitly waived with a reason (no runner is configured yet — see DEVELOPMENT.md)
- [ ] Docs updated if structure or constitutional meaning changed
- [ ] Teacher-facing copy is Romanian and free of architecture jargon
- [ ] No secrets committed
- [ ] Reviewed

---

## Versioning and releases

- Workspace packages are all `private` and version-locked to `1.0.0` with `"*"` workspace ranges. They are
  not published. Semantic Versioning applies if that changes.
- Breaking changes to `packages/contracts` or `packages/domain` are MAJOR for consumers, and require the
  API and web app to move together.
- Releases are tagged from `main`. Changelog entries are required for user-visible or contract-visible
  changes.
- No release may weaken a teacher approval gate or make a failure silent.
- Hotfixes: `fix/*` → PR → tag.

---

## Issues

Use the GitHub issue templates: bug report, feature request, architecture change.
