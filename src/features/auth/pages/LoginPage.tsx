import { useId, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthError } from "../types";
import { useAuth } from "../AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { continueTo } from "../continueTo";
import { PasswordField } from "../components/PasswordField";
import { hasFieldErrors, validateSignIn } from "../validation";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formErrorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateSignIn>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSignIn({ email, password });
    setErrors(nextErrors);
    setFormError(null);
    if (hasFieldErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(continueTo(location.search), { replace: true });
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "Nu am putut deschide sesiunea. Încearcă din nou.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <p className="lx-auth-panel-kicker">Cont existent</p>
      <h2 className="lx-auth-panel-title">Intră în cont</h2>
      <p className="lx-auth-panel-lead">
        Continuă lucrul acolo unde l-ai lăsat.
      </p>

      <form className="lx-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="lx-auth-field">
          <label className="lx-auth-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="lx-auth-input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? (
            <p id="login-email-error" className="lx-auth-error" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          label="Parolă"
          name="password"
          value={password}
          autoComplete="current-password"
          error={errors.password}
          onChange={setPassword}
        />

        <p className="lx-auth-forgot">
          <Link to={`/forgot-password${location.search}`}>
            Ai uitat parola?
          </Link>
        </p>

        {formError ? (
          <p id={formErrorId} className="lx-auth-banner" role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" className="lx-auth-primary" disabled={submitting}>
          {submitting ? "Se autentifică…" : "Intră în cont"}
        </button>
      </form>

      <p className="lx-auth-switch">
        Nu ai încă un cont? <Link to="/register">Creează unul</Link>
      </p>
    </AuthLayout>
  );
}
