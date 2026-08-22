const PBKDF2_ITERATIONS = 120_000;
const HASH_BITS = 256;
const SALT_BYTES = 16;
const TOKEN_BYTES = 32;
const ID_BYTES = 16;

export function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toHex(buffer);
}

export function newUserId(): string {
  return `usr_${randomHex(ID_BYTES)}`;
}

export function newSessionToken(): string {
  return randomHex(TOKEN_BYTES);
}

export function newSalt(): string {
  return randomHex(SALT_BYTES);
}

export async function hashPassword(
  password: string,
  saltHex: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(saltHex),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    HASH_BITS,
  );
  return toHex(new Uint8Array(bits));
}

export function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}
