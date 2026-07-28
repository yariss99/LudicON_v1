import type { ContextRegistry } from './context-registry.js';
import type { ActiveRuntimeContext } from './types.js';

/**
 * SessionManager — navigation & workflow session state.
 * Session state survives screen navigation within the same session.
 */
export class SessionManager {
  constructor(private readonly registry: ContextRegistry) {}

  navigate(
    sessionId: string,
    screen: string,
    lastAction = `navigate:${screen}`,
  ): ActiveRuntimeContext | { error: string } {
    const ctx = this.registry.getActive(sessionId);
    if (!ctx) return { error: 'No active context for session' };
    if (ctx.lifecycle === 'expired' || ctx.lifecycle === 'archived') {
      return { error: 'Context is no longer active' };
    }

    const history = ctx.session.navigationHistory;
    if (history[history.length - 1] !== screen) {
      history.push(screen);
    }
    ctx.session.activeScreen = screen;
    ctx.session.lastAction = lastAction;
    ctx.updatedAt = new Date().toISOString();
    ctx.version += 1;
    ctx.lifecycle = 'updated';
    this.registry.setActive(ctx);
    return ctx;
  }

  setWorkflow(
    sessionId: string,
    workflow: string,
  ): ActiveRuntimeContext | { error: string } {
    const ctx = this.registry.getActive(sessionId);
    if (!ctx) return { error: 'No active context for session' };
    ctx.session.currentWorkflow = workflow;
    ctx.session.lastAction = `workflow:${workflow}`;
    ctx.updatedAt = new Date().toISOString();
    ctx.version += 1;
    ctx.lifecycle = 'updated';
    this.registry.setActive(ctx);
    return ctx;
  }

  addPendingTask(
    sessionId: string,
    task: string,
  ): ActiveRuntimeContext | { error: string } {
    const ctx = this.registry.getActive(sessionId);
    if (!ctx) return { error: 'No active context for session' };
    if (!ctx.session.pendingTasks.includes(task)) {
      ctx.session.pendingTasks.push(task);
    }
    ctx.updatedAt = new Date().toISOString();
    ctx.version += 1;
    this.registry.setActive(ctx);
    return ctx;
  }

  clearPendingTask(
    sessionId: string,
    task: string,
  ): ActiveRuntimeContext | { error: string } {
    const ctx = this.registry.getActive(sessionId);
    if (!ctx) return { error: 'No active context for session' };
    ctx.session.pendingTasks = ctx.session.pendingTasks.filter((t) => t !== task);
    ctx.updatedAt = new Date().toISOString();
    ctx.version += 1;
    this.registry.setActive(ctx);
    return ctx;
  }
}
