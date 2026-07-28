/**
 * @prima/engine-prompt — Prompt Builder & Compiler (P-C-005)
 */

export {
  PromptEngine,
  PromptEngineError,
  createPromptEngine,
} from './prompt-engine.js';
export type { PromptCompileInput } from './prompt-engine.js';

export type {
  PromptPackage,
  PromptResult,
  PromptAstNode,
  CoreEducationalContext,
} from '@prima/contracts';
