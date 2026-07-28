/** Engine identity and capability metadata (PAS L3). */

export type EngineId = string;

export type SemanticVersion = string;

export type EngineCapability = string;

export type RegistrationSource = 'manual' | 'automatic' | 'plugin';

export interface EngineMetadata {
  readonly id: EngineId;
  readonly name: string;
  /** Constitutional engine code when applicable, e.g. ENG-01 */
  readonly constitutionalCode?: string;
  readonly version: SemanticVersion;
  readonly capabilities: readonly EngineCapability[];
  /** Other EngineIds that must be Running before this Engine may Start */
  readonly dependencies: readonly EngineId[];
}

export interface EngineDescriptor {
  readonly metadata: EngineMetadata;
  readonly source: RegistrationSource;
  /** Factory invoked by Kernel / discovery — must not embed business pedagogy */
  create(): Engine;
}

/**
 * Engine contract — lifecycle + health only.
 * Engines MUST NOT call peer Engines.
 * Engines MUST NOT approve, authorize generate, or export.
 */
export interface Engine {
  readonly metadata: EngineMetadata;

  initialize(context: import('./context.js').KernelContext): Promise<void>;
  configure(config: Readonly<Record<string, unknown>>): Promise<void>;
  start(execution: import('./context.js').ExecutionContext): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  shutdown(): Promise<void>;
  recover(reason: string): Promise<void>;
  destroy(): Promise<void>;

  health(): import('./health.js').EngineHealthSnapshot;
}

export interface EngineRegistry {
  register(engine: Engine, source?: RegistrationSource): void;
  registerDescriptor(descriptor: EngineDescriptor): void;
  remove(engineId: EngineId): void;
  enable(engineId: EngineId): void;
  disable(engineId: EngineId): void;
  discover(filter?: EngineDiscoveryFilter): readonly EngineRegistration[];
  resolve(engineId: EngineId): Engine;
  tryResolve(engineId: EngineId): Engine | undefined;
  validate(engineId: EngineId): EngineValidationResult;
  validateAll(): readonly EngineValidationResult[];
  list(): readonly EngineRegistration[];
}

export interface EngineDiscoveryFilter {
  readonly capability?: EngineCapability;
  readonly source?: RegistrationSource;
  readonly enabledOnly?: boolean;
  readonly minVersion?: SemanticVersion;
}

export interface EngineRegistration {
  readonly metadata: EngineMetadata;
  readonly source: RegistrationSource;
  readonly enabled: boolean;
  readonly lifecycleState: import('./lifecycle.js').EngineLifecycleState;
}

export interface EngineValidationResult {
  readonly engineId: EngineId;
  readonly ok: boolean;
  readonly issues: readonly string[];
}
