# @prima/engine-knowledge

**Purpose:** Knowledge Engine (ENG-02) — attributable knowledge as a service.  
**PAS mapping:** L3 / ENG-02  

**Forbidden:** Pedagogical decisions; resource generation; Memory writes; peer Engine calls.

```ts
import { createKnowledgeEngine } from '@prima/engine-knowledge';

const knowledge = createKnowledgeEngine({ eventBus });
await knowledge.initialize(kernelContext);
await knowledge.configure({});
await knowledge.start(executionContext);

await knowledge.importKnowledge({ source: 'manual', pack, objects });
const pkg = await knowledge.retrieveForContext({
  correlationId: 'c1',
  text: 'fracții',
  domain: 'curriculum',
});
```

Spec: `docs/engineering/ES-009_KNOWLEDGE_ENGINE.md`

## PS-001 — Pedagogical Knowledge Platform

Canonical pedagogical knowledge graph (Curriculum → Competencies → Objectives → Activities → Methods → Assessments). Does **not** generate classroom content; engines pull validated knowledge.

```ts
import { createPedagogicalKnowledgePlatform } from '@prima/engine-knowledge';

const ke = createPedagogicalKnowledgePlatform(); // seeds RO primary Math graph

ke.queryKnowledge({ category: 'learning_activities', topic: 'fractions' });
ke.traverse({ startId: curriculumId, maxDepth: 4 });
ke.semanticSearch({ text: 'fracții', mode: 'semantic' });
ke.recommend({ objectiveId, grade: 'Clasa a III-a', subject: 'Matematică' });
ke.validate({ all: true });
```

Services: `KnowledgeRegistry`, `KnowledgeGraph`, `RelationshipEngine`, `SemanticSearch`, `RecommendationService`, `KnowledgeValidator`, domain services, cache with version invalidation.
