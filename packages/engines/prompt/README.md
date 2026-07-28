# @prima/engine-prompt

**P-C-005 Prompt Builder & Compiler** — mandatory prompt compilation for PRIMA Core.

## Responsibility

Compile educational context + teacher intent into a canonical `PromptPackage` (contracts schema 1.0.0).

## Non-responsibility

- Calling AI providers (AI Orchestrator)
- Publication validation (Validation Engine)
- Persistence (Memory Engine)

## Integration

Runtime pipeline step `prompt.compile` must use this engine via composition adapters.  
AI Orchestrator consumes the compiled `PromptPackage` and must not invent provider prompts when a package is present.

## Test

```bash
npm run test:prompt
```
