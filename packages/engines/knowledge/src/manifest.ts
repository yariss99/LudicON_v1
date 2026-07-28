import type { EngineCapabilityManifest } from '@prima/contracts';

export const KNOWLEDGE_ENGINE_MANIFEST: EngineCapabilityManifest = {
  engineId: 'knowledge',
  constitutionalCode: 'ENG-02',
  name: 'Knowledge Engine',
  version: '1.0.0',
  compatibleKernelVersions: ['0.1.0'],
  capabilities: [
    'knowledge.import',
    'knowledge.validate',
    'knowledge.search',
    'knowledge.resolve',
    'knowledge.aggregate',
    'knowledge.provenance',
  ],
  features: [
    { id: 'lexical-search', enabled: true },
    { id: 'semantic-search-port', enabled: true, description: 'Optional SemanticSearchPort' },
    { id: 'hot-cold-cache', enabled: true },
  ],
  supportedCommands: [
    'RetrieveKnowledgeEvidence',
    'PublishKnowledgePack',
    'DeprecateKnowledgePack',
  ],
  publishedEvents: [
    'KnowledgeImported',
    'KnowledgeUpdated',
    'KnowledgeValidated',
    'KnowledgeValidationFailed',
    'KnowledgePublished',
    'KnowledgeDeprecated',
    'KnowledgeRetired',
    'KnowledgeResolved',
    'KnowledgePackageAssembled',
    'KnowledgeUnsupportedMarked',
    'KnowledgeCacheInvalidated',
    'KnowledgeConflictDetected',
  ],
  consumedEvents: [],
  dependencies: [],
  configurationKeys: ['enableSemanticSearch', 'defaultSearchLimit', 'cacheHotTtlMs'],
};
