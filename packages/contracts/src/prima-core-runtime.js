/**
 * PRIMA Core shared runtime contracts — single source of truth (AFPRR H4).
 * Schema version: 1.0.0
 *
 * Engines MUST import these types instead of defining local duplicates.
 * No educational business logic.
 */
export const PRIMA_CORE_CONTRACT_SCHEMA_VERSION = '1.0.0';
export const CORE_CONTRACT_NAMES = [
    'WorkflowContext',
    'CoreExecutionContext',
    'ExecutionContext',
    'PromptPackage',
    'PromptResult',
    'ValidationReport',
    'ValidationSummary',
    'MemorySnapshot',
    'RuntimeExecution',
    'ToolExecutionResult',
    'ContextSnapshot',
    'ArtifactMetadata',
    'AiOutputValidationReport',
];
