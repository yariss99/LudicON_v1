/**
 * Backward-compatible thin definitions + catalog bridge.
 * Prefer importing from `./catalog/index.js` for full metadata.
 */

import type { WorkflowDefinition } from './types.js';
import {
  WF_CREATE_LESSON,
  WF_CREATE_PRESENTATION,
  WF_CREATE_QUIZ,
  WF_CREATE_STORY,
  WF_CREATE_WORKSHEET,
  toEngineDefinition,
} from './catalog/index.js';

/** @deprecated Prefer WF_CREATE_LESSON / catalog id `create-lesson`. */
export const LESSON_CREATION_WORKFLOW: WorkflowDefinition =
  toEngineDefinition(WF_CREATE_LESSON);

/** @deprecated Prefer `create-worksheet`. */
export const WORKSHEET_GENERATION_WORKFLOW: WorkflowDefinition =
  toEngineDefinition(WF_CREATE_WORKSHEET);

/** @deprecated Prefer `create-quiz`. */
export const QUIZ_GENERATION_WORKFLOW: WorkflowDefinition =
  toEngineDefinition(WF_CREATE_QUIZ);

/** @deprecated Prefer `create-story`. */
export const STORY_GENERATION_WORKFLOW: WorkflowDefinition =
  toEngineDefinition(WF_CREATE_STORY);

/** @deprecated Prefer `create-presentation`. */
export const PRESENTATION_GENERATION_WORKFLOW: WorkflowDefinition =
  toEngineDefinition(WF_CREATE_PRESENTATION);

export const EXAMPLE_WORKFLOW_DEFINITIONS: readonly WorkflowDefinition[] = [
  LESSON_CREATION_WORKFLOW,
  WORKSHEET_GENERATION_WORKFLOW,
  QUIZ_GENERATION_WORKFLOW,
  STORY_GENERATION_WORKFLOW,
  PRESENTATION_GENERATION_WORKFLOW,
];
