export type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Za-zăâîșțĂÂÎȘȚ]/.test(password) &&
    /\d/.test(password)
  );
}

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "Introdu adresa de email.";
  if (!EMAIL_PATTERN.test(value)) return "Introdu o adresă de email validă.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Introdu o parolă.";
  if (!isStrongPassword(password)) {
    return "Parola trebuie să aibă cel puțin 8 caractere, o literă și o cifră.";
  }
  return undefined;
}

export function validateSignUp(input: {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.displayName.trim()) {
    errors.displayName = "Introdu numele tău.";
  }
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(input.password);
  if (passwordError) errors.password = passwordError;
  if (!input.confirmPassword) {
    errors.confirmPassword = "Confirmă parola.";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Parolele nu coincid.";
  }
  return errors;
}

export function validateSignIn(input: {
  email: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  if (!input.password) errors.password = "Introdu parola.";
  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Boolean(
    errors.displayName ||
      errors.email ||
      errors.password ||
      errors.confirmPassword,
  );
}
