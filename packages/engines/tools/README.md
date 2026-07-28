# @prima/engine-tools

**Tool & Capability Engine** — unified, secure, provider-independent execution of external capabilities.

Not a plugin loader. Workflows never call OpenAI, PDF vendors, LMS APIs, etc. directly.

## Principles

| Principle | How |
|-----------|-----|
| Everything is a tool | `ToolHandler` + `ToolDescriptor` |
| Provider independent | Execute via `toolId` or **capability** alias |
| Secure by default | Permissions + sandbox policy |
| Observable | `ToolMonitor` logs every run |
| Replaceable | Re-bind capabilities without changing workflows |

## Lifecycle

```
Register → Validate → Authorize → Sandbox → Execute (+ retry) → Monitor → ToolResult
```

## Categories

AI · Image · PDF/Word/PPT/Sheet export · Translation · Speech · OCR · Search · Calendar · Storage · Email · LMS · Printing · future…

## Quick start

```ts
import {
  createToolEngine,
  createPdfExportTool,
} from '@prima/engine-tools';

const engine = createToolEngine({
  sandboxPolicy: { allowNetwork: false },
});
engine.register(createPdfExportTool());
engine.bindCapability('export.pdf', 'export.pdf.v1');

const result = await engine.executeCapability('export.pdf', {
  action: 'export',
  input: { artifactId: 'a1', title: 'Lesson' },
  context: {
    teacherId: 't-1',
    projectId: 'p-1',
    permissions: ['read', 'export'],
  },
});
```

## Integration

| System | Role |
|--------|------|
| Workflow Engine | Dispatch export/generate steps via capabilities |
| AI Orchestrator | Bound as `ai.generate` bridge tool |
| Validation Engine | Validate tool outputs before teacher delivery |
| Memory Engine | Persist execution metadata / artifact refs |
| Context Engine | Supply educationalContext on `ToolContext` |
| Export Engine | Implemented as export-* category tools |

## Test

```bash
npm run test:tools
```
