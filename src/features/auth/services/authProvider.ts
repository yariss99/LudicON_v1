import type { AuthProviderPort } from "../types";
import { createLocalAuthProvider } from "./localAuthProvider";

/**
 * The repository has no hosted auth backend and no provider env vars.
 * The local credential adapter is therefore the active foundation.
 * A remote adapter can be added later behind this same port.
 */
export function createAuthProvider(): AuthProviderPort {
  return createLocalAuthProvider();
}
