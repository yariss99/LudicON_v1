# AI-002.5 — Pedagogical Validation Layer

Isolated validation between Decision Engine and Conversation Engine.

- Never creates decisions
- Never talks to teachers
- Approves or rejects only

```
Decision Engine → Validation Layer → Conversation Engine
```

On reject: Conversation Engine must not verbalize.
