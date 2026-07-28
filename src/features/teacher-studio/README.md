# Teacher Studio

**PRIMA Teacher Studio** — spațiul operațional al profesorului (nu un dashboard).

## Principles

- **Project first** — totul aparține unui proiect
- **Context aware** — panoul PRIMA cunoște proiectul activ
- **One-click actions** — acțiuni rapide pe Acasă
- **Persistent navigation** — shell comun pe toate zonele

## Areas

| Route | Area |
|-------|------|
| `/` | Acasă |
| `/projects` | Proiecte |
| `/library` | Bibliotecă |
| `/activity` | Activitate recentă |
| `/calendar` | Calendar |
| `/notifications` | Notificări |
| `/settings` | Setări |

AI Assistant = panou persistent (toggle `[`), nu o pagină separată.

## Shortcuts

- `G` apoi `H/P/L/A/C/N/S` — navigare
- `[` — comută panoul PRIMA
- `Esc` — închide meniul mobil

## Structure

```
teacher-studio/
  constants/     navigation + quick actions
  context/       TeacherStudioProvider + hooks
  data/          derivations from ProjectContext
  layout/        shell, sidebar, topbar, AI panel
  pages/         area pages
  hooks/         keyboard
  styles/        teacher-studio.css
  types.ts
```

## Integration

Wired in `App.tsx` via nested routes under `TeacherStudioLayout`.  
Create flows (`/create/experience`, `/studio/:projectId`) remain outside the shell so teachers enter a focused task, then return to Studio.
