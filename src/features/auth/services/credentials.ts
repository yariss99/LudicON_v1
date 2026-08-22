/** Shared credential helpers — register, login, and validation use these. */

export const INVALID_CREDENTIALS_MESSAGE =
  "Adresa de e-mail sau parola nu sunt corecte.";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
