import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthError } from "../types";
import { useAuth } from "../AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { continueTo } from "../continueTo";
import { PasswordField } from "../components/PasswordField";
import { hasFieldErrors, validateSignUp } from "../validation";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateSignUp>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSignUp({
      displayName,
      email,
      password,
      confirmPassword,
    });
    setErrors(nextErrors);
    setFormError(null);
    if (hasFieldErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await signUp({ displayName, email, password });
      navigate(continueTo(location.search), { replace: true });
    } catch (error) {
      if (error instanceof AuthError && error.code === "email_taken") {
        setErrors((current) => ({ ...current, email: error.message }));
      } else {
        setFormError(
          error instanceof AuthError
            ? error.message
            : "Nu am putut crea contul. Încearcă din nou.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <p className="lx-auth-panel-kicker">Cont nou</p>
      <h2 className="lx-auth-panel-title">Creează un cont</h2>
      <p className="lx-auth-panel-lead">
        Doar ce este necesar ca să începi. Tu rămâi autorul.
      </p>

      <form className="lx-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="lx-auth-field">
          <label className="lx-auth-label" htmlFor="register-name">
            Nume
          </label>
          <input
            id="register-name"
            className="lx-auth-input"
            type="text"
            name="name"
            autoComplete="name"
            value={displayName}
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={
              errors.displayName ? "register-name-error" : undefined
            }
            onChange={(event) => setDisplayName(event.target.value)}
          />
          {errors.displayName ? (
            <p id="register-name-error" className="lx-auth-error" role="alert">
              {errors.displayName}
            </p>
          ) : null}
        </div>

        <div className="lx-auth-field">
          <label className="lx-auth-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            className="lx-auth-input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "register-email-error" : undefined
            }
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? (
            <p id="register-email-error" className="lx-auth-error" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          label="Parolă"
          name="password"
          value={password}
          autoComplete="new-password"
          hint="Cel puțin 8 caractere, o literă și o cifră."
          error={errors.password}
          onChange={setPassword}
        />

        <PasswordField
          label="Confirmă parola"
          name="confirm-password"
          value={confirmPassword}
          autoComplete="new-password"
          error={errors.confirmPassword}
          onChange={setConfirmPassword}
        />

        {formError ? (
          <p className="lx-auth-banner" role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" className="lx-auth-primary" disabled={submitting}>
          {submitting ? "Se creează contul…" : "Creează contul"}
        </button>
      </form>

      <p className="lx-auth-switch">
        Ai deja un cont? <Link to="/login">Intră în cont</Link>
      </p>
    </AuthLayout>
  );
}
