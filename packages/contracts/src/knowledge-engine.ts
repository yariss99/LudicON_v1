/**
 * Knowledge Engine service contracts (ES-009) — pull-based knowledge API.
 * No pedagogical reasoning.
 */

import type {
  KnowledgeDomainId,
  KnowledgeObject,
  KnowledgePack,
  KnowledgeTrustLevel,
} from './prima-knowledge.js';

export type KnowledgeImportSource = 'manual' | 'automatic' | 'plugin' | 'external' | 'connector';

export interface KnowledgeImportRequest {
  readonly source: KnowledgeImportSource;
  readonly pack: KnowledgePack;
  readonly objects: readonly KnowledgeObject[];
  readonly correlationId?: string;
}

export interface KnowledgeImportResult {
  readonly ok: boolean;
  readonly packId: string;
  readonly version: string;
  readonly issues: readonly string[];
}

export interface KnowledgeQuery {
  readonly correlationId: string;
  readonly text?: string;
  readonly domain?: KnowledgeDomainId;
  readonly domains?: readonly KnowledgeDomainId[];
  readonly packId?: string;
  readonly packVersion?: string;
  readonly trustLevels?: readonly KnowledgeTrustLevel[];
  readonly tags?: readonly string[];
  readonly limit?: number;
  /** Context-aware hints — never decisions */
  readonly contextHints?: {
    readonly subject?: string;
    readonly gradeBand?: string;
    readonly projectId?: string;
  };
}

export interface KnowledgeSearchHit {
  readonly object: KnowledgeObject;
  readonly score: number;
  readonly packId: string;
  readonly packVersion: string;
}

export interface KnowledgeResolveRequest {
  readonly correlationId: string;
  readonly objectId: string;
  readonly packId?: string;
  readonly packVersion?: string;
}

export interface KnowledgeAggregateRequest {
  readonly correlationId: string;
  readonly objectIds: readonly { objectId: string; packId: string; packVersion: string }[];
  readonly domainScope?: readonly KnowledgeDomainId[];
}

export type KnowledgeEngineEventType =
  | 'KnowledgeImported'
  | 'KnowledgeUpdated'
  | 'KnowledgeValidated'
  | 'KnowledgeValidationFailed'
  | 'KnowledgePublished'
  | 'KnowledgeDeprecated'
  | 'KnowledgeRetired'
  | 'KnowledgeResolved'
  | 'KnowledgePackageAssembled'
  | 'KnowledgeUnsupportedMarked'
  | 'KnowledgeCacheInvalidated'
  | 'KnowledgeConflictDetected';
