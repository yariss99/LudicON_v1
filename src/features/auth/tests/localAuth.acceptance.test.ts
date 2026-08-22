import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { AuthError } from "../types";
import { INVALID_CREDENTIALS_MESSAGE } from "../services/credentials";

const memory = new Map<string, string>();

const localStorageMock = {
  getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  setItem(key: string, value: string) {
    memory.set(key, value);
  },
  removeItem(key: string) {
    memory.delete(key);
  },
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: localStorageMock,
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: globalThis,
});

const { createLocalAuthProvider } = await import(
  "../services/localAuthProvider"
);
const { IDENTITY_STORAGE_KEY, SESSION_STORAGE_KEY } = await import(
  "../services/authStorage"
);

describe("local authentication — register then login", () => {
  before(() => {
    memory.clear();
  });

  it("creates an account and signs in with the same credentials", async () => {
    memory.clear();
    const provider = createLocalAuthProvider();
    const email = "Ana.Teacher@Example.com ";
    const password = "Parola123";

    const created = await provider.signUp({
      displayName: " Ana Profesor ",
      email,
      password,
    });

    assert.equal(created.email, "ana.teacher@example.com");
    assert.equal(created.displayName, "Ana Profesor");
    assert.match(created.id, /^usr_/);

    const stored = JSON.parse(memory.get(IDENTITY_STORAGE_KEY) ?? "[]") as {
      email: string;
      passwordHash: string;
      passwordSalt: string;
    }[];
    assert.equal(stored.length, 1);
    assert.equal(stored[0].email, "ana.teacher@example.com");
    assert.notEqual(stored[0].passwordHash, password);
    assert.match(stored[0].passwordHash, /^[0-9a-f]{64}$/);
    assert.match(stored[0].passwordSalt, /^[0-9a-f]{32}$/);
    assert.ok(memory.get(SESSION_STORAGE_KEY));

    await provider.signOut();
    assert.equal(memory.get(SESSION_STORAGE_KEY), undefined);

    const session = await provider.signIn(email, password);
    assert.equal(session.id, created.id);
    assert.equal(session.email, "ana.teacher@example.com");
    assert.ok(memory.get(SESSION_STORAGE_KEY));
  });

  it("rejects a wrong password and an unknown email with the same message", async () => {
    memory.clear();
    const provider = createLocalAuthProvider();
    await provider.signUp({
      displayName: "Ana",
      email: "ana@example.com",
      password: "Parola123",
    });
    await provider.signOut();

    await assert.rejects(
      () => provider.signIn("ana@example.com", "Parola999"),
      (error: unknown) =>
        error instanceof AuthError &&
        error.code === "invalid_credentials" &&
        error.message === INVALID_CREDENTIALS_MESSAGE,
    );

    await assert.rejects(
      () => provider.signIn("unknown@example.com", "Parola123"),
      (error: unknown) =>
        error instanceof AuthError &&
        error.code === "invalid_credentials" &&
        error.message === INVALID_CREDENTIALS_MESSAGE,
    );
  });

  it("does not treat a missing persist as a successful registration", async () => {
    memory.clear();
    const original = localStorageMock.setItem;
    localStorageMock.setItem = () => {
      throw new Error("quota");
    };
    const provider = createLocalAuthProvider();
    try {
      await assert.rejects(
        () =>
          provider.signUp({
            displayName: "Ana",
            email: "persist-fail@example.com",
            password: "Parola123",
          }),
        (error: unknown) =>
          error instanceof AuthError && error.code === "unknown",
      );
      assert.equal(memory.get(IDENTITY_STORAGE_KEY), undefined);
    } finally {
      localStorageMock.setItem = original;
    }
  });
});
