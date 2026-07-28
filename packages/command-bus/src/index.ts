/**
 * @prima/command-bus — CQRS write pipeline coordination.
 * No business logic. Handlers / validators / authorizers own rules.
 */

export { createCommandBus, InMemoryCommandBus, BusinessCommandError } from './in-memory-command-bus.js';
export { createCommandId, createCorrelationId } from './ids.js';
export {
  StructuralRequiredFieldsValidator,
  createAllowAllAuthorizer,
  createDenyAuthorizer,
} from './builtins.js';
