import type { EngineLogger, EngineMetrics, EngineObservability, EngineTracer } from '@prima/contracts';

export function createConsoleLogger(engineId: string): EngineLogger {
  const prefix = `[engine:${engineId}]`;
  return {
    debug: (message, fields) => console.debug(prefix, message, fields ?? {}),
    info: (message, fields) => console.info(prefix, message, fields ?? {}),
    warn: (message, fields) => console.warn(prefix, message, fields ?? {}),
    error: (message, fields) => console.error(prefix, message, fields ?? {}),
  };
}

const noopMetrics: EngineMetrics = {
  increment() {},
  gauge() {},
  timing() {},
};

const noopTracer: EngineTracer = {
  startSpan() {
    return { end() {} };
  },
};

export function noopObservability(_engineId: string): EngineObservability {
  return {
    logger: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
    metrics: noopMetrics,
    tracer: noopTracer,
  };
}
