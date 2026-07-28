/**
 * ToolPermissionManager — authorize by declared permissions.
 */

import { ToolEngineError } from './errors.js';
import type { ToolContext, ToolDescriptor, ToolPermission } from './types.js';

export class ToolPermissionManager {
  authorize(descriptor: ToolDescriptor, context: ToolContext): void {
    const granted = new Set(context.permissions);
    const missing = descriptor.requiredPermissions.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      throw new ToolEngineError(
        'PERMISSION_DENIED',
        `Missing permissions for ${descriptor.toolId}: ${missing.join(', ')}`,
      );
    }
  }

  grantAll(extra: readonly ToolPermission[] = []): readonly ToolPermission[] {
    return Object.freeze([
      'read',
      'write',
      'generate',
      'export',
      'delete',
      'external-access',
      'sensitive',
      ...extra,
    ]);
  }
}
