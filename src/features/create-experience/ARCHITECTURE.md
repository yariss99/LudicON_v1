# IT-002 — Create Experience

Guided pedagogical conversation that gradually builds an **Instructional Blueprint** discovery draft.

## Non-goals

- Not a form  
- Not a wizard  
- Not ChatGPT  
- Does **not** redefine Blueprint sections (CS-005)

## Progress panel sections

Learning Context · Objectives · Activities · Assessment · Resources · Status  

(Names aligned to `INSTRUCTIONAL_BLUEPRINT_SPECIFICATION.md`.)

## State

| Concern | Location |
|---------|----------|
| Conversation | `useCreateExperience` messages + topic |
| Blueprint draft | `BlueprintDraft` via conversation engine |
| Streaming | `streaming` flag + ThinkingIndicator |
| Attachments | placeholder disabled |

## Route

`/create/experience` (Desk **Create** → this route)
