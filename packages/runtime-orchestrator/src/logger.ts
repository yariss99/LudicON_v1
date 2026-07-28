/**
 * Lightweight structured logger for Runtime Orchestrator.
 * No UI; sink is injectable (console by default).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogRecord = {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly executionId?: string;
  readonly fields?: Readonly<Record<string, unknown>>;
};

export type LogSink = (record: LogRecord) => void;

export class RuntimeLogger {
  constructor(
    private readonly sink: LogSink = defaultConsoleSink,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  debug(
    message: string,
    fields?: Readonly<Record<string, unknown>>,
    executionId?: string,
  ): void {
    this.write('debug', message, fields, executionId);
  }

  info(
    message: string,
    fields?: Readonly<Record<string, unknown>>,
    executionId?: string,
  ): void {
    this.write('info', message, fields, executionId);
  }

  warn(
    message: string,
    fields?: Readonly<Record<string, unknown>>,
    executionId?: string,
  ): void {
    this.write('warn', message, fields, executionId);
  }

  error(
    message: string,
    fields?: Readonly<Record<string, unknown>>,
    executionId?: string,
  ): void {
    this.write('error', message, fields, executionId);
  }

  private write(
    level: LogLevel,
    message: string,
    fields?: Readonly<Record<string, unknown>>,
    executionId?: string,
  ): void {
    this.sink({
      level,
      message,
      timestamp: this.clock().toISOString(),
      executionId,
      fields,
    });
  }
}

function defaultConsoleSink(record: LogRecord): void {
  const line = `[runtime] ${record.level} ${record.message}${
    record.executionId ? ` executionId=${record.executionId}` : ''
  }${record.fields ? ` ${JSON.stringify(record.fields)}` : ''}`;
  if (record.level === 'error') console.error(line);
  else if (record.level === 'warn') console.warn(line);
  else console.log(line);
}
