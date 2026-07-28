import type {
  Command,
  CommandAuthorizer,
  CommandContext,
  CommandValidator,
  ValidationOutcome,
} from '@prima/contracts';

/** Structural only — required envelope fields present. */
export const StructuralRequiredFieldsValidator: CommandValidator = {
  name: 'structural-required-fields',
  stage: 'structuralValidation',
  validate(command: Command): ValidationOutcome {
    const issues = [];
    if (!command.commandType) {
      issues.push({
        code: 'CMD_TYPE_REQUIRED',
        message: 'commandType is required',
        severity: 'error' as const,
        stage: 'structuralValidation' as const,
      });
    }
    if (!command.source) {
      issues.push({
        code: 'CMD_SOURCE_REQUIRED',
        message: 'source is required',
        severity: 'error' as const,
        stage: 'structuralValidation' as const,
      });
    }
    if (!command.commandId) {
      issues.push({
        code: 'CMD_ID_REQUIRED',
        message: 'commandId is required',
        severity: 'error' as const,
        stage: 'structuralValidation' as const,
      });
    }
    return { ok: issues.length === 0, issues };
  },
};

export function createAllowAllAuthorizer(name = 'allow-all'): CommandAuthorizer {
  return {
    name,
    authorize(): ValidationOutcome {
      return { ok: true, issues: [] };
    },
  };
}

export function createDenyAuthorizer(
  code = 'AUTHZ_DENIED',
  message = 'Command not authorized',
): CommandAuthorizer {
  return {
    name: 'deny-all',
    authorize(_command: Command, _context: CommandContext): ValidationOutcome {
      return {
        ok: false,
        issues: [
          {
            code,
            message,
            severity: 'error',
            stage: 'authorization',
          },
        ],
      };
    },
  };
}
