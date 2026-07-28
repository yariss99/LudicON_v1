import type { ActiveRuntimeContext, RuntimeContextSnapshot } from './types.js';

/**
 * ContextRegistry — single source of runtime context.
 * One active context per session; no duplicated context graphs.
 */
export class ContextRegistry {
  private readonly bySession = new Map<string, ActiveRuntimeContext>();
  private readonly archivedStore = new Map<string, ActiveRuntimeContext[]>();

  getActive(sessionId: string): ActiveRuntimeContext | undefined {
    return this.bySession.get(sessionId);
  }

  /** Enforce single active context per session */
  setActive(context: ActiveRuntimeContext): void {
    this.bySession.set(context.sessionId, context);
  }

  has(sessionId: string): boolean {
    return this.bySession.has(sessionId);
  }

  removeActive(sessionId: string): ActiveRuntimeContext | undefined {
    const ctx = this.bySession.get(sessionId);
    if (!ctx) return undefined;
    this.bySession.delete(sessionId);
    return ctx;
  }

  archive(context: ActiveRuntimeContext): void {
    const list = this.archivedStore.get(context.sessionId) ?? [];
    list.push(structuredClone(context));
    this.archivedStore.set(context.sessionId, list);
  }

  archived(sessionId: string): ActiveRuntimeContext[] {
    return structuredClone(this.archivedStore.get(sessionId) ?? []);
  }

  snapshot(sessionId: string): RuntimeContextSnapshot | undefined {
    const active = this.bySession.get(sessionId);
    if (!active) return undefined;
    return freezeSnapshot(active);
  }

  listActiveSessions(): string[] {
    return [...this.bySession.keys()];
  }
}

export function freezeSnapshot(
  context: ActiveRuntimeContext,
): RuntimeContextSnapshot {
  return Object.freeze({
    contextId: context.contextId,
    sessionId: context.sessionId,
    version: context.version,
    lifecycle: context.lifecycle,
    createdAt: context.createdAt,
    updatedAt: context.updatedAt,
    expiresAt: context.expiresAt,
    teacher: Object.freeze({ ...context.teacher }),
    blueprint: Object.freeze({
      ...context.blueprint,
      completedSections: [...context.blueprint.completedSections],
      pendingSections: [...context.blueprint.pendingSections],
      confidenceMap: { ...context.blueprint.confidenceMap },
    }),
    conversation: Object.freeze({
      ...context.conversation,
      openClarifications: [...context.conversation.openClarifications],
    }),
    generation: Object.freeze({
      ...context.generation,
      generationQueue: [...context.generation.generationQueue],
      dependencies: [...context.generation.dependencies],
      affectedAssets: [...context.generation.affectedAssets],
      versionReferences: { ...context.generation.versionReferences },
    }),
    review: Object.freeze({
      ...context.review,
      openIssues: [...context.review.openIssues],
    }),
    asset: Object.freeze({
      ...context.asset,
      openAssetIds: [...context.asset.openAssetIds],
    }),
    class: Object.freeze({
      ...context.class,
      learningNeeds: [...context.class.learningNeeds],
      accessibilityRequirements: [...context.class.accessibilityRequirements],
    }),
    session: Object.freeze({
      ...context.session,
      navigationHistory: [...context.session.navigationHistory],
      pendingTasks: [...context.session.pendingTasks],
    }),
    platform: Object.freeze({
      ...context.platform,
      availableServices: [...context.platform.availableServices],
      connectedEngines: [...context.platform.connectedEngines],
      featureFlags: { ...context.platform.featureFlags },
      installedKnowledgePacks: context.platform.installedKnowledgePacks.map(
        (p) => ({ ...p }),
      ),
    }),
  });
}
