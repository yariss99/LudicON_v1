import type { ServiceLocator } from '@prima/contracts';
import { FatalKernelError } from '@prima/contracts';

export class InMemoryServiceLocator implements ServiceLocator {
  private readonly services = new Map<string, unknown>();

  register<T>(token: string, instance: T): void {
    this.services.set(token, instance);
  }

  resolve<T>(token: string): T {
    if (!this.services.has(token)) {
      throw new FatalKernelError(`Service not registered: ${token}`);
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
