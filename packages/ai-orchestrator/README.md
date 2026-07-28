# @prima/ai-orchestrator

**Sole gateway** between the PRIMA platform and any AI provider.

No application feature may call OpenAI, Claude, Gemini, Mistral, Azure, or local models directly.
All requests pass through `AIOrchestrator.execute`.

## Principles

| Principle | Enforcement |
|-----------|-------------|
| Pedagogy first | Educational context required before prompt build |
| Single gateway | Only this package talks to providers |
| Context before prompt | `RequestValidator` rejects raw-prompt-only calls |
| Provider independence | Callers receive `AIResponse`; never provider SDKs |
| Observable | `ExecutionLogger` + `UsageTracker` + `CostTracker` |
| Replaceable | Swap providers via `ProviderRegistry` |

## Pipeline

```
Validate request
  → Load educational context
  → Build PromptPackage (PromptDispatcher)
  → Select provider (ProviderSelector)
  → Execute (+ RetryManager on recoverable errors)
  → Validate / repair output (OutputValidator)
  → Log + track usage/cost
  → Return AIResponse
```

## Folder structure

```
packages/ai-orchestrator/
  src/
    types.ts
    ai-orchestrator.ts
    request-validator.ts
    context-loader.ts
    prompt-dispatcher.ts
    provider-registry.ts
    provider-selector.ts
    retry-manager.ts
    output-validator.ts
    execution-logger.ts
    usage-tracker.ts
    providers/          # OpenAI, Claude, Gemini, Azure, Mistral, Local (+ stub)
    examples/
    tests/
```

## Quick start

```ts
import {
  createAIOrchestrator,
  createOpenAIProvider,
  createClaudeProvider,
  ProviderRegistry,
} from '@prima/ai-orchestrator';

const registry = new ProviderRegistry();
registry.register(createOpenAIProvider()); // inject CompletionTransport in prod
registry.register(createClaudeProvider());

const orchestrator = createAIOrchestrator({ registry });

const response = await orchestrator.execute({
  requestId: 'req-1',
  workflowId: 'wf-1',
  teacherId: 't-1',
  projectId: 'p-1',
  requestType: 'GenerateLesson',
  educationalContext: {
    subject: 'Matematică',
    grade: 'Clasa a III-a',
    topic: 'Fracții',
  },
  promptContext: { intent: 'Draft a lesson outline' },
  expectedOutputSchema: {
    schemaId: 'lesson.v1',
    requiredFields: ['title', 'subject', 'topic', 'content'],
  },
  priority: 'normal',
  metadata: {},
});
```

## Production providers

Example provider factories ship **without** vendor SDKs. Inject a `CompletionTransport`:

```ts
createOpenAIProvider({
  transport: {
    async complete({ system, user, model, correlationId }) {
      // call your HTTP/SDK adapter here
      return { text, model, tokens, latencyMs };
    },
  },
});
```

Switching vendors = register a different provider. Application code unchanged.

## Test

```bash
npm run test:ai-orchestrator
```
