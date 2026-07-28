/**
 * ToolValidator — descriptor + input shape checks before execution.
 */

import { ToolEngineError } from './errors.js';
import type { ToolDescriptor, ToolInvokeRequest } from './types.js';

export class ToolValidator {
  validateDescriptor(descriptor: ToolDescriptor): void {
    if (!descriptor.toolId?.trim()) {
      throw new ToolEngineError('INVALID_DESCRIPTOR', 'toolId is required.');
    }
    if (!descriptor.toolName?.trim()) {
      throw new ToolEngineError('INVALID_DESCRIPTOR', 'toolName is required.');
    }
    if (!descriptor.version?.trim()) {
      throw new ToolEngineError('INVALID_DESCRIPTOR', 'version is required.');
    }
    if (descriptor.supportedActions.length === 0) {
      throw new ToolEngineError(
        'INVALID_DESCRIPTOR',
        'supportedActions must be non-empty.',
      );
    }
    if (descriptor.timeoutMs <= 0) {
      throw new ToolEngineError('INVALID_DESCRIPTOR', 'timeoutMs must be > 0.');
    }
    if (descriptor.inputSchema.requiredFields.length === 0) {
      throw new ToolEngineError(
        'INVALID_DESCRIPTOR',
        'inputSchema.requiredFields must be non-empty.',
      );
    }
  }

  validateRequest(descriptor: ToolDescriptor, request: ToolInvokeRequest): void {
    if (request.toolId !== descriptor.toolId) {
      throw new ToolEngineError(
        'INVALID_INPUT',
        'request.toolId does not match handler.',
      );
    }
    if (!descriptor.supportedActions.includes(request.action)) {
      throw new ToolEngineError(
        'INVALID_INPUT',
        `Action "${request.action}" is not supported by ${descriptor.toolId}.`,
      );
    }
    for (const field of descriptor.inputSchema.requiredFields) {
      const value = request.input[field];
      if (value === undefined || value === null || value === '') {
        throw new ToolEngineError(
          'INVALID_INPUT',
          `Missing required input field: ${field}`,
        );
      }
    }
    for (const key of descriptor.requiredContext) {
      if (key === 'teacherId' && !request.context.teacherId?.trim()) {
        throw new ToolEngineError(
          'INVALID_INPUT',
          'context.teacherId is required.',
        );
      }
      if (key === 'projectId' && !request.context.projectId?.trim()) {
        throw new ToolEngineError(
          'INVALID_INPUT',
          'context.projectId is required.',
        );
      }
      if (key === 'workflowId' && !request.context.workflowId?.trim()) {
        throw new ToolEngineError(
          'INVALID_INPUT',
          'context.workflowId is required.',
        );
      }
    }
  }
}
