import type { ServiceLocator } from '@prima/contracts';

export class LocalServiceLocator implements ServiceLocator {
  private readonly services = new Map<string, unknown>();

  register<T>(token: string, instance: T): void {
    this.services.set(token, instance);
  }

  resolve<T>(token: string): T {
    if (!this.services.has(token)) {
      throw new Error(`Service not registered: ${token}`);
    }
    return this.services.get(token) as T;
  }

  tryResolve<T>(token: string): T | undefined {
    return this.services.get(token) as T | undefined;
  }

  has(token: string): boolean {
    return this.services.has(token);
  }
}
