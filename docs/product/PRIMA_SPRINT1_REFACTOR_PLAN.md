---
Status: Draft — Awaiting Approval
Version: 1.0
Owner: LUDI ON Product / Frontend
Depends On: PRIMA_PRODUCT_REDESIGN.md, PRIMA_MVP_ROADMAP.md, PRIMA_DESIGN_SYSTEM.md
Last Updated: July 2026
---

# PRIMA Sprint 1 — Refactoring Report & Implementation Plan

> **Status: AWAITING APPROVAL — no further application code changes until approved.**

This document is a **product refactor plan**, not a feature plan. Goal: simplify UX while preserving existing functionality.

---

## 1. Analysis — Current React Application

### 1.1 Routing (live `src/App.tsx`)

| Path | Page | Role today |
|------|------|------------|
| `/` | `Home` | New calm landing (Sprint 1 partial) |
| `/create` | `Create` | Intention workspace (Sprint 1 partial) |
| `/studio/create` | `CreateGame` | Legacy multi-type studio / “builder” surface |
| `/projects` | `Projects` | Project list |
| `/projects/:projectId` | `ProjectDetail` | Project container UI |
| `/library` | `Library` | Saved resources list |
| `/ai` | `AiPartner` | Contextual partner UI |
| `/assistant` | → `/ai` | Redirect |
| `/profile` | `Profile` | Minimal profile |
| `/settings` | → `/profile` | Redirect |
| `/prima/lesson` | `PrimaLessonWelcome` | PRIMA Experience entry (Lecție) |
| `/prima/planning` | `PPlanning` | Planning / Blueprint-adjacent flow |
| `/help` | `Help` | Help stub |
| `/dashboard` | → `/` | Redirect |

### 1.2 Navigation

**Active:** `AppShell` + `AppNav` sidebar — Home, Create, Projects, Library, AI Partner, Profile.

**Orphan / unused:** `DashboardHeader`, `DashboardLayout` — old sticky header with search, notifications, settings; no longer mounted by active Home.

### 1.3 Pages inventory

| Page | Status | Notes |
|------|--------|-------|
| `Home.tsx` | Active | Intention + projects + suggestions |
| `Create.tsx` | Active | Intention → routes into PRIMA / studio |
| `CreateGame.tsx` | Active (hidden from nav) | Large legacy creation UI |
| `Projects.tsx` / `ProjectDetail.tsx` | Active | Project-centric shell |
| `Library.tsx` | Active | Thin list over `recentResources` |
| `AiPartner.tsx` | Active | Contextual suggestions |
| `Profile.tsx` | Active | Stub content |
| `Dashboard.tsx` | **Orphan** | Old CreativeWorkspace + Statistics — not routed |
| `Assistant.tsx` | **Orphan** | Replaced by AiPartner |
| `Settings.tsx` | **Orphan** | Redirected to Profile |
| `Help.tsx` | Stub | Linked from PRIMA welcome |
| `PrimaLessonWelcome` / `PPlanning` | Active | Real PRIMA flows — must preserve |

### 1.4 Layout & UI structure

```
AppShell (studio | partner)
  └── AppNav (fixed sidebar)
  └── main (max-w-6xl | max-w-3xl partner)

Legacy (unmounted):
  DashboardLayout → DashboardHeader → main
  PrimaWorkspaceLayout → PRIMA Experience (still used by /prima/*)
```

### 1.5 Reusable components

| Keep / promote | Location |
|----------------|----------|
| `Button`, `SurfaceCard`, `SectionHeader`, `ProgressBar` | `components/ui` |
| `AppShell`, `AppNav` | `components/layout` |
| `ProjectCard` | `components/projects` |
| `PrimaCard`, `PrimaWorkspaceLayout` | `components/PRIMA` |

| Legacy dashboard set (mostly unused by routes) |
|------------------------------------------------|
| CreativeWorkspace, ContinueWorking, Statistics, PrimaRecommendations, RecentResources, DashboardHero, QuickActions, AISuggestions, PlatformShortcuts, CreateSomethingNew, DashboardCard, ActivityCard, GameTypeCard |

### 1.6 Data layer

| File | Role |
|------|------|
| `workspaceData.ts` | Home / Projects / Create / AI (new) |
| `dashboardData.ts` | Still used by Library (`recentResources`) and orphan Dashboard |

No backend; all placeholder. **Business logic = route targets into existing PRIMA/studio pages.**

### 1.7 Important note on recent work

A **partial Sprint 1 UI refactor is already present** in the tree (Home, Create, Projects, AI Partner, AppNav). This report treats that as **draft implementation** pending formal approval. Remaining work is consolidation, cleanup, IA consistency, and safe commits — **not** greenfield rewrite.

---

## 2. Refactoring Report

### 2.1 Duplicated pages

| Duplicate | Resolution |
|-----------|------------|
| `Dashboard.tsx` vs `Home.tsx` | Delete or archive Dashboard after Home approved |
| `Assistant.tsx` vs `AiPartner.tsx` | Remove Assistant file; keep `/assistant` redirect |
| `Settings.tsx` vs `Profile.tsx` | Fold settings into Profile; remove Settings page |
| `AISuggestions` vs `PrimaRecommendations` | Already deprecated alias — remove one |
| `CreateSomethingNew` vs `CreativeWorkspace` vs `QuickActions` | All builder-entry duplicates — remove after migration |

### 2.2 Duplicated workflows

| Workflow | Problem | Target |
|----------|---------|--------|
| Start Lecție | Home intention → `/create` → `/prima/lesson` **and** direct `/prima/lesson` | Single entry: Create (or Home card) → Partner |
| Start Fișă/Joc | Intention → `/studio/create?type=` (CreateGame) vs old builder cards | Keep CreateGame as **internal studio** only — never nav |
| Continue work | Home “Proiecte recente” vs Projects list vs old ContinueWorking | One ProjectCard component everywhere |
| AI help | `/ai` vs inline Project “PRIMA” vs old `/assistant` | AI Partner workspace + project-scoped deep link |

### 2.3 Unnecessary navigation items

| Item | Verdict |
|------|---------|
| Builders in main nav | **Must never appear** |
| Help as top-level | Keep out of main nav; link from Profile / Partner footer |
| Notifications / Search in header | Do not restore on Home — cognitive noise |
| Statistics | Removed from Home — do not bring back |
| Platform shortcuts | Remove |

### 2.4 Pages → Workspaces mapping

| Current page | Becomes workspace | Purpose |
|--------------|-------------------|---------|
| Home | **Home Workspace** | Continuity + intention |
| Create | **Create Workspace** | Educational intention → conversation |
| Projects + ProjectDetail | **Project Workspace** | Blueprint + resources together |
| Library | **Library Workspace** | Reuse |
| AiPartner | **AI Partner Workspace** | Contextual collaborator |
| Profile | **Profile Workspace** | Prefs only |
| `/prima/*` | **Partner Experience** (focused) | Hide AppNav chrome later (optional polish) |
| `/studio/create` | **Internal Resource Studio** | Not a product concept — implementation leftover |

### 2.5 Builder pages that should disappear (from teacher perception)

| Surface | Action |
|---------|--------|
| CreativeWorkspace builder grid | Do not remount; delete with Dashboard |
| GameTypeCard / ActivityCard as entry | Do not use as Home entry |
| CreateGame as `/create` | Already moved to `/studio/create` — **never label as Builder in UI** |
| DashboardHero “Create Activity” | Dead code — remove |

Teachers should only see: **intention → Project → resources**.

### 2.6 UI inconsistencies

| Issue | Fix in plan |
|-------|-------------|
| English nav labels vs Romanian body copy | Unify (recommend Romanian per Bible) |
| AppShell on Home vs PrimaWorkspaceLayout on `/prima/*` (no sidebar) | Intentional two-mode; document; optional “exit to Home” |
| Primary button still heavy indigo gradient | Align to Design System primary blue over time |
| Profile empty vs Settings orphan | One Profile page |
| Library uses `dashboardData`; Projects use `workspaceData` | Consolidate data module in cleanup commit |
| Emoji requested in product brief vs Lucide icons in AppNav | Keep Lucide (Design System); labels match IA |

### 2.7 Components to reuse

- `AppShell` / `AppNav` — all Studio workspaces  
- `SurfaceCard` / `Button` — all cards and CTAs  
- `ProjectCard` — Home + Projects  
- `PrimaWorkspaceLayout` — PRIMA Experience only  

### 2.8 Components to remove (after safe cutover)

**High confidence remove:** Statistics, PlatformShortcuts, DashboardHero, DashboardHeader, DashboardLayout, Dashboard.tsx (unrouted), Assistant.tsx, Settings.tsx (if empty), CreateSomethingNew, QuickActions, AISuggestions (alias).

**Defer remove until unused:** CreativeWorkspace, ContinueWorking, PrimaRecommendations, RecentResources, ActivityCard, GameTypeCard, DashboardCard — only after no imports remain.

---

## 3. New Information Architecture

### Navigation (only)

| Nav item | Route | Teacher meaning | Decision rationale |
|----------|-------|-----------------|-------------------|
| **Home** | `/` | “Where do I start?” | Continuity + invitation; 30-second comprehension |
| **Create** | `/create` | “I have an intention” | Replaces all builders; conversation-first |
| **Projects** | `/projects` | “My work in progress” | Central organizational unit |
| **Library** | `/library` | “What can I reuse?” | Compound time savings |
| **AI Partner** | `/ai` | “Design with PRIMA” | Partner not chatbot; optional entry — often entered from Project |
| **Profile** | `/profile` | “Me & preferences” | Auth/prefs; not pedagogy |

### Why these six — and nothing else

1. **Home** — Answers *where / what / next* without tool taxonomy.  
2. **Create** — One door for all resource types; type is outcome not module.  
3. **Projects** — Prevents orphan worksheets and repeated data entry.  
4. **Library** — Reuse before recreate (product principle).  
5. **AI Partner** — Makes intelligence visible without forcing chat as Home.  
6. **Profile** — Necessary account surface; must stay thin.

### Explicitly excluded from nav

| Excluded | Why |
|----------|-----|
| Lesson/Worksheet/Game Builders | Software thinking |
| Help | Secondary; in-context or Profile |
| Settings (separate) | Merged into Profile |
| Dashboard / Statistics | Vanity, not educational |
| Studio create | Implementation path only |

### Mental model

```
Home / Create
    → Project
        → Blueprint (via PRIMA)
        → Resources (Lesson, Fișă, …)
        → AI Partner (contextual)
Library ←→ Projects (duplicate / adapt)
Profile (prefs only)
```

### Internal routes (preserved, not nav)

| Route | Preserve why |
|-------|----------------|
| `/prima/lesson`, `/prima/planning` | Existing PRIMA Experience functionality |
| `/studio/create` | Existing CreateGame functionality until unified generation exists |
| `/help` | Existing help entry |

---

## 4. Migration Strategy

### Principles

1. **Preserve functionality** — every old entry point redirects or deep-links to equivalent capability.  
2. **Strangle pattern** — new workspaces wrap old flows; delete old UI only when unused.  
3. **No backend / business logic changes** — only routes, layout, presentation, dead code.  
4. **Reversible commits** — one concern each; easy `git revert`.  
5. **Feature flags not required** — redirects are enough for v0.1.

### Capability preservation map

| Old teacher action | New path |
|--------------------|----------|
| Open Dashboard builders | Home intention / Create |
| Create Lecție | Create → `/prima/lesson` |
| Create Fișă / Joc / etc. | Create → `/studio/create?type=…` |
| Open Assistant | `/ai` (redirect from `/assistant`) |
| Open Projects stub | Projects workspace |
| Open Library stub | Library workspace |
| Open Settings | Profile |

### Risk controls

| Risk | Mitigation |
|------|------------|
| Break CreateGame | Keep `/studio/create`; smoke-test query `type` |
| Break PRIMA welcome | Do not change PrimaLessonWelcome logic in Sprint 1 cleanup |
| Teachers bookmark `/dashboard` | Keep Navigate to `/` |
| Delete component still imported | `tsc -b` gate every commit |

### Rollback

Each commit reverts independently. Full rollback = revert Sprint 1 commit range; restore Dashboard route if needed.

---

## 5. Commit Plan (small, safe, reversible)

Do **not** execute until approved.

### Commit 1 — Navigation shell freeze

**Scope:** Confirm AppNav IA (6 items only); Romanian or English labels decision; no builder links.  
**Touch:** `AppNav.tsx`, maybe i18n strings.  
**Verify:** All 6 routes reachable; no builder in nav.  
**Revert:** Restores previous nav labels/structure only.

### Commit 2 — Home workspace harden

**Scope:** Home only — greeting, intentions, recent projects (ProjectCard), suggestions, activity; ensure zero Statistics.  
**Touch:** `Home.tsx`, `workspaceData.ts` as needed.  
**Verify:** 30-second comprehension checklist.  
**Revert:** Previous Home.

### Commit 3 — Create workspace harden

**Scope:** Intention UI only; wire to existing `/prima/lesson` and `/studio/create`; no new generation logic.  
**Touch:** `Create.tsx`, route map constants.  
**Verify:** Each intention reaches prior functionality.  
**Revert:** Previous Create.

### Commit 4 — Projects workspace

**Scope:** Projects list + ProjectDetail + ProjectCard polish; resource list links to existing flows.  
**Touch:** `Projects.tsx`, `ProjectDetail.tsx`, `ProjectCard.tsx`.  
**Verify:** Open project → blueprint/planning/create links work.  
**Revert:** Previous Projects pages.

### Commit 5 — Library workspace

**Scope:** Present existing resource list in AppShell; reuse CTAs to Create/Projects; consolidate data import.  
**Touch:** `Library.tsx`, optionally move `recentResources` to `workspaceData`.  
**Verify:** Library items still open/reuse.  
**Revert:** Previous Library.

### Commit 6 — AI Partner workspace

**Scope:** AiPartner contextual UI; keep redirects `/assistant`→`/ai`; no new model calls.  
**Touch:** `AiPartner.tsx`.  
**Verify:** Project query param context; links into PRIMA/Create.  
**Revert:** Previous AiPartner.

### Commit 7 — Dead code removal (optional, after 1–6 stable)

**Scope:** Delete unrouted Dashboard/Assistant/Settings and unused dashboard components; fix imports.  
**Touch:** orphans only.  
**Verify:** `npm run build`.  
**Revert:** Restore deleted files from git.

### Explicitly out of Sprint 1 commits

- Backend / API / auth real implementation  
- New generation features  
- Merging CreateGame into Create (logic)  
- Hiding AppNav inside `/prima/*` (nice polish — separate commit if approved)  
- Dark mode, community, new resource types  

---

## 6. Success criteria (Sprint 1)

| Criterion | Measure |
|-----------|---------|
| 30-second clarity | Teacher can state where they are and next action |
| No builders in nav | Manual QA |
| Functionality preserved | Smoke: Lesson welcome, studio create, projects, library, AI |
| Cognitive simplicity | No stats, no feature grid Home |
| Build green | `npm run build` |

---

## 7. Approval gate

**Please approve or amend:**

1. Information architecture (6 nav items)  
2. Keep `/studio/create` + `/prima/*` as internal preserved routes  
3. Commit sequence 1→7  
4. Whether to **revert** any of the already-landed Sprint 1 UI before re-applying via these commits  
5. Nav language: **English labels** (current) vs **Romanian** (Bible-aligned)

**No further application code will be changed until you approve.**
