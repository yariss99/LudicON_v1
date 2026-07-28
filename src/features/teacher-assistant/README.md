# Teacher AI Assistant

Educational **co-pilot** for PRIMA — not a chatbot. Always context-aware across teacher, project, lesson, document, curriculum, competencies, workflow, preferences, validation, and the resource library.

## Routes & surfaces

| Surface | Description |
|---------|-------------|
| `/assistant` | Full conversation workspace + history |
| Teacher Studio panel (`[`) | Docked co-pilot |
| Floating FAB | On builders / project workspace |
| Workspace → Sugestii PRIMA | Links into assistant |

## Capabilities

Create · Edit · Improve · Explain · Simplify · Differentiate · Adapt · Translate · Summarize · Validate · Compare · Review · Generate · Organize · Recommend · Reflect

## Architecture

1. **Context Manager** — route + project + lesson + document + competencies + resources  
2. **Conversation Engine** — NL intent detection + response drafting  
3. **Tool Engine** — open/create builders, search Resource Center  
4. **Validation Engine gate** — every assistant message validated before delivery  
5. **Memory Engine bridge** — style, formats, workflows, project history  
6. **Proactive hints** — missing competencies, assessments, differentiation, etc.

## Folder

```
src/features/teacher-assistant/
  types.ts / constants.ts
  TeacherAssistantPage.tsx
  hooks/useTeacherAssistant.tsx
  services/
  components/
  styles/
```
