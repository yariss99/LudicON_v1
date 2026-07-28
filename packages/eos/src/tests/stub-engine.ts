import type {
  Engine,
  EngineMetadata,
  ExecutionContext,
  KernelContext,
  EngineHealthSnapshot,
} from '@prima/contracts';

/** Test double — no educational behaviour. */
export class StubEngine implements Engine {
  readonly metadata: EngineMetadata;
  private lifecycleHint:
    | 'none'
    | 'initialized'
    | 'configured'
    | 'running'
    | 'paused'
    | 'stopped'
    | 'shutdown'
    | 'destroyed' = 'none';
  failOnStartTimes: number;
  private startAttempts = 0;

  constructor(
    metadata: EngineMetadata,
    options?: { failOnStartTimes?: number },
  ) {
    this.metadata = metadata;
    this.failOnStartTimes = options?.failOnStartTimes ?? 0;
  }

  async initialize(_context: KernelContext): Promise<void> {
    this.lifecycleHint = 'initialized';
  }

  async configure(_config: Readonly<Record<string, unknown>>): Promise<void> {
    this.lifecycleHint = 'configured';
  }

  async start(_execution: ExecutionContext): Promise<void> {
    this.startAttempts += 1;
    if (this.startAttempts <= this.failOnStartTimes) {
      throw new Error(`simulated start failure #${this.startAttempts}`);
    }
    this.lifecycleHint = 'running';
  }

  async pause(): Promise<void> {
    this.lifecycleHint = 'paused';
  }

  async resume(): Promise<void> {
    this.lifecycleHint = 'running';
  }

  async stop(): Promise<void> {
    this.lifecycleHint = 'stopped';
  }

  async shutdown(): Promise<void> {
    this.lifecycleHint = 'shutdown';
  }

  async recover(_reason: string): Promise<void> {
    this.lifecycleHint = 'running';
  }

  async destroy(): Promise<void> {
    this.lifecycleHint = 'destroyed';
  }

  health(): EngineHealthSnapshot {
    const running = this.lifecycleHint === 'running';
    return {
      engineId: this.metadata.id,
      status: running ? 'healthy' : this.lifecycleHint === 'destroyed' ? 'unavailable' : 'unknown',
      availability: this.lifecycleHint !== 'destroyed',
      version: this.metadata.version,
      lifecycleState: 'registered',
      initializationComplete: this.lifecycleHint !== 'none',
      runtimeOk: running,
      recoveryInProgress: false,
      dependencyStatuses: {},
      checkedAt: new Date().toISOString(),
    };
  }
}
