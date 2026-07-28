/**
 * @prima/engine-tools — Tool & Capability Engine
 */

export type {
  ToolCategory,
  ToolPermission,
  ToolExecutionStatus,
  ToolRetryPolicy,
  JsonSchemaHint,
  ToolDescriptor,
  EducationalToolContext,
  ToolContext,
  ToolInvokeRequest,
  ToolResult,
  ToolHealth,
  ToolHandler,
  ToolExecutionLog,
  ToolMonitorSnapshot,
  SandboxPolicy,
} from './types.js';

export { DEFAULT_RETRY_POLICY } from './types.js';

export { ToolEngineError } from './errors.js';
export { ToolRegistry, CapabilityRegistry } from './registry.js';
export { ToolValidator } from './validator.js';
export { ToolPermissionManager } from './permission-manager.js';
export { ToolSandbox, DEFAULT_SANDBOX_POLICY } from './sandbox.js';
export { ToolMonitor } from './monitor.js';
export { ToolExecutor } from './executor.js';
export { ToolEngine, createToolEngine } from './tool-engine.js';
export type { CreateToolEngineOptions } from './tool-engine.js';

export {
  createPdfExportTool,
  createSearchTool,
  createTranslationTool,
  createAiBridgeTool,
} from './tools/builtins.js';
