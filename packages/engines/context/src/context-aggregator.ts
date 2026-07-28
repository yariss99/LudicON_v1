import { uid } from './ids.js';
import type { ContextRegistry } from './context-registry.js';
import type {
  ActiveRuntimeContext,
  ContextDomain,
  ContextEvent,
  InitializeContextInput,
  KnowledgeContextPort,
  MemoryContextPort,
} from './types.js';
import { EVENT_DOMAIN_MAP } from './types.js';

/**
 * ContextAggregator — builds and patches only affected domains.
 * Consumes Knowledge/Memory ports as views; never peer internals.
 */
export class ContextAggregator {
  constructor(
    private readonly registry: ContextRegistry,
    private readonly knowledge?: KnowledgeContextPort,
    private readonly memory?: MemoryContextPort,
  ) {}

  initialize(input: InitializeContextInput): ActiveRuntimeContext | { error: string } {
    if (this.registry.has(input.sessionId)) {
      return { error: 'Context already exists for session — no duplicates' };
    }

    const now = new Date().toISOString();
    const ttlMs = input.ttlMs ?? 1000 * 60 * 60 * 4;
    const packs = this.knowledge?.listInstalledPacks() ?? [];

    const teacherId = input.teacherId;
    const activeClassId = input.teacher?.activeClassId;

    const ctx: ActiveRuntimeContext = {
      contextId: uid('ctx'),
      sessionId: input.sessionId,
      version: 1,
      lifecycle: 'initialized',
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      teacher: {
        teacherId,
        currentProfileRef:
          input.teacher?.currentProfileRef ??
          this.memory?.getTeacherProfileRef?.(teacherId),
        preferencesRef:
          input.teacher?.preferencesRef ??
          this.memory?.getPreferencesRef?.(teacherId),
        activeClassId,
        selectedSubject: input.teacher?.selectedSubject,
        currentGrade: input.teacher?.currentGrade,
        teachingHistoryRef:
          input.teacher?.teachingHistoryRef ??
          this.memory?.getTeachingHistoryRef?.(teacherId),
      },
      blueprint: {
        approvalStatus: 'none',
        completedSections: [],
        pendingSections: [],
        validationStatus: 'unknown',
        confidenceMap: {},
      },
      conversation: {
        conversationState: 'idle',
        openClarifications: [],
      },
      generation: {
        generationQueue: [],
        currentStage: 'idle',
        dependencies: [],
        affectedAssets: [],
        versionReferences: {},
      },
      review: {
        status: 'none',
        openIssues: [],
      },
      asset: {
        openAssetIds: [],
      },
      class: {
        grade: input.class?.grade ?? input.teacher?.currentGrade,
        classProfileRef:
          input.class?.classProfileRef ??
          (activeClassId
            ? this.memory?.getClassProfileRef?.(teacherId, activeClassId)
            : undefined),
        learningNeeds: [...(input.class?.learningNeeds ?? [])],
        differentiationProfile: input.class?.differentiationProfile,
        accessibilityRequirements: [
          ...(input.class?.accessibilityRequirements ?? []),
        ],
      },
      session: {
        sessionId: input.sessionId,
        activeScreen: input.activeScreen,
        navigationHistory: input.activeScreen ? [input.activeScreen] : [],
        pendingTasks: [],
        currentWorkflow: input.workflow,
      },
      platform: {
        availableServices: [
          ...(input.platform?.availableServices ?? [
            'knowledge',
            'memory',
            'decision',
            'generation',
            'asset-studio',
            'blueprint-review',
            'teacher-desk',
          ]),
        ],
        connectedEngines: [
          ...(input.platform?.connectedEngines ?? [
            'ENG-01',
            'ENG-02',
            'ENG-10',
          ]),
        ],
        featureFlags: { ...(input.platform?.featureFlags ?? {}) },
        installedKnowledgePacks: [
          ...(input.platform?.installedKnowledgePacks ?? packs),
        ],
        systemStatus: input.platform?.systemStatus ?? 'healthy',
      },
    };

    this.registry.setActive(ctx);
    return ctx;
  }

  /**
   * Apply event payload to only the domains listed in `event.affects`
   * (intersected with the canonical event→domain map).
   */
  applyEvent(event: ContextEvent): ActiveRuntimeContext | { error: string } {
    const ctx = this.registry.getActive(event.sessionId);
    if (!ctx) return { error: 'No active context for session' };
    if (ctx.lifecycle === 'expired' || ctx.lifecycle === 'archived') {
      return { error: 'Cannot update expired/archived context' };
    }

    const allowed = new Set(EVENT_DOMAIN_MAP[event.type]);
    const domains = event.affects.filter((d) => allowed.has(d));
    const payload = event.payload;

    for (const domain of domains) {
      this.patchDomain(ctx, domain, payload);
    }

    ctx.version += 1;
    ctx.updatedAt = event.at;
    ctx.lifecycle = 'updated';
    this.registry.setActive(ctx);
    return ctx;
  }

  private patchDomain(
    ctx: ActiveRuntimeContext,
    domain: ContextDomain,
    payload: Record<string, unknown>,
  ): void {
    switch (domain) {
      case 'teacher':
        Object.assign(ctx.teacher, pick(payload, [
          'teacherId',
          'currentProfileRef',
          'preferencesRef',
          'activeClassId',
          'selectedSubject',
          'currentGrade',
          'teachingHistoryRef',
        ]));
        break;
      case 'blueprint':
        Object.assign(ctx.blueprint, pick(payload, [
          'blueprintId',
          'currentVersion',
          'approvalStatus',
          'validationStatus',
        ]));
        if (Array.isArray(payload.completedSections)) {
          ctx.blueprint.completedSections = payload.completedSections as string[];
        }
        if (Array.isArray(payload.pendingSections)) {
          ctx.blueprint.pendingSections = payload.pendingSections as string[];
        }
        if (payload.confidenceMap && typeof payload.confidenceMap === 'object') {
          ctx.blueprint.confidenceMap = {
            ...ctx.blueprint.confidenceMap,
            ...(payload.confidenceMap as Record<string, number>),
          };
        }
        break;
      case 'conversation':
        Object.assign(ctx.conversation, pick(payload, [
          'conversationState',
          'currentPedagogicalGoal',
          'lastTeacherIntent',
          'previousAiQuestion',
          'conversationSummary',
        ]));
        if (Array.isArray(payload.openClarifications)) {
          ctx.conversation.openClarifications =
            payload.openClarifications as string[];
        }
        break;
      case 'generation':
        Object.assign(ctx.generation, pick(payload, [
          'selectedAssetId',
          'currentStage',
        ]));
        if (Array.isArray(payload.generationQueue)) {
          ctx.generation.generationQueue = payload.generationQueue as string[];
        }
        if (Array.isArray(payload.dependencies)) {
          ctx.generation.dependencies = payload.dependencies as string[];
        }
        if (Array.isArray(payload.affectedAssets)) {
          ctx.generation.affectedAssets = payload.affectedAssets as string[];
        }
        if (
          payload.versionReferences &&
          typeof payload.versionReferences === 'object'
        ) {
          ctx.generation.versionReferences = {
            ...ctx.generation.versionReferences,
            ...(payload.versionReferences as Record<string, string>),
          };
        }
        break;
      case 'review':
        Object.assign(ctx.review, pick(payload, ['reviewId', 'status']));
        if (Array.isArray(payload.openIssues)) {
          ctx.review.openIssues = payload.openIssues as string[];
        }
        break;
      case 'asset':
        Object.assign(ctx.asset, pick(payload, [
          'selectedAssetId',
          'lastModifiedAssetId',
        ]));
        if (Array.isArray(payload.openAssetIds)) {
          ctx.asset.openAssetIds = payload.openAssetIds as string[];
        }
        break;
      case 'class':
        Object.assign(ctx.class, pick(payload, [
          'grade',
          'classProfileRef',
          'differentiationProfile',
        ]));
        if (Array.isArray(payload.learningNeeds)) {
          ctx.class.learningNeeds = payload.learningNeeds as string[];
        }
        if (Array.isArray(payload.accessibilityRequirements)) {
          ctx.class.accessibilityRequirements =
            payload.accessibilityRequirements as string[];
        }
        break;
      case 'session':
        Object.assign(ctx.session, pick(payload, [
          'activeScreen',
          'lastAction',
          'currentWorkflow',
        ]));
        if (Array.isArray(payload.navigationHistory)) {
          ctx.session.navigationHistory = payload.navigationHistory as string[];
        }
        if (Array.isArray(payload.pendingTasks)) {
          ctx.session.pendingTasks = payload.pendingTasks as string[];
        }
        break;
      case 'platform':
        Object.assign(ctx.platform, pick(payload, ['systemStatus']));
        if (Array.isArray(payload.availableServices)) {
          ctx.platform.availableServices = payload.availableServices as string[];
        }
        if (Array.isArray(payload.connectedEngines)) {
          ctx.platform.connectedEngines = payload.connectedEngines as string[];
        }
        if (payload.featureFlags && typeof payload.featureFlags === 'object') {
          ctx.platform.featureFlags = {
            ...ctx.platform.featureFlags,
            ...(payload.featureFlags as Record<string, boolean>),
          };
        }
        if (Array.isArray(payload.installedKnowledgePacks)) {
          ctx.platform.installedKnowledgePacks =
            payload.installedKnowledgePacks as Array<{
              packId: string;
              version: string;
            }>;
        }
        break;
    }
  }
}

function pick(
  source: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}
