import type { Validator, ValidatorId } from './types.js';

export class ValidatorRegistry {
  private readonly map = new Map<ValidatorId, Validator>();

  register(validator: Validator): void {
    this.map.set(validator.id, validator);
  }

  registerAll(validators: readonly Validator[]): void {
    for (const v of validators) this.register(v);
  }

  get(id: ValidatorId): Validator {
    const v = this.map.get(id);
    if (!v) throw new Error(`Validator not registered: ${id}`);
    return v;
  }

  tryGet(id: ValidatorId): Validator | undefined {
    return this.map.get(id);
  }

  list(): readonly Validator[] {
    return [...this.map.values()];
  }
}
