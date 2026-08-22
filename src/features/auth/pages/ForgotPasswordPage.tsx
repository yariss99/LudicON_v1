import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { validateEmail } from "../validation";

export function ForgotPasswordPage() {
  const { requestPasswordRecovery, capabilities } = useAuth();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formErrorId = useId();
  const canEmail = capabilities.passwordRecovery === "email";

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loginHref = `/login${location.search}`;

  useEffect(() => {
    if (submitted) headingRef.current?.focus();
  }, [submitted]);

  async function submitRecovery(address: string) {
    const error = validateEmail(address);
    setEmailError(error);
    setFormError(null);
    if (error) return;

    setSubmitting(true);
    try {
      const result = await requestPasswordRecovery(address);
      if (result.channel !== "email") {
        setFormError(
          "Recuperarea prin e-mail nu este disponibilă în această versiune.",
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError("Nu am putut trimite instrucțiunile. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitRecovery(email);
  }

  if (!canEmail) {
    return (
      <AuthLayout>
        <p className="lx-auth-panel-kicker">Recuperare cont</p>
        <h2 className="lx-auth-panel-title">Recuperarea prin e-mail nu este disponibilă</h2>
        <p className="lx-auth-panel-lead">
          Conturile sunt păstrate pe acest dispozitiv. Nu există un serviciu
          de e-mail conectat, deci nu putem trimite un link de resetare.
        </p>
        <p className="lx-auth-hint lx-auth-success-note" role="status">
          Când un furnizor de autentificare cu e-mail va fi conectat, această
          pagină va trimite instrucțiunile automat.
        </p>
        <div className="lx-auth-choices">
          <Link to={loginHref} className="lx-auth-primary">
            Înapoi la autentificare
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (submitted) {
    return (
      <AuthLayout>
        <p className="lx-auth-panel-kicker">Recuperare cont</p>
        <h2 ref={headingRef} className="lx-auth-panel-title" tabIndex={-1}>
          Verifică-ți e-mailul
        </h2>
        <p className="lx-auth-panel-lead">
          Dacă există un cont asociat acestei adrese, vei primi instrucțiuni
          pentru resetarea parolei.
        </p>
        <p className="lx-auth-hint lx-auth-success-note">
          Verifică și folderul Spam sau Junk.
        </p>
        <div className="lx-auth-choices">
          <Link to={loginHref} className="lx-auth-primary">
            Înapoi la autentificare
          </Link>
          <button
            type="button"
            className="lx-auth-secondary"
            disabled={submitting}
            onClick={() => {
              void submitRecovery(email);
            }}
          >
            {submitting ? "Se trimite…" : "Trimite din nou"}
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <p className="lx-auth-panel-kicker">Recuperare cont</p>
      <h2 className="lx-auth-panel-title">Ai uitat parola?</h2>
      <p className="lx-auth-panel-lead">
        Introdu adresa de e-mail asociată contului tău. Îți vom trimite
        instrucțiunile necesare pentru a seta o parolă nouă.
      </p>

      <form className="lx-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="lx-auth-field">
          <label className="lx-auth-label" htmlFor="recovery-email">
            Adresa de e-mail
          </label>
          <input
            id="recovery-email"
            className="lx-auth-input"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "recovery-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(undefined);
            }}
          />
          {emailError ? (
            <p id="recovery-email-error" className="lx-auth-error" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p id={formErrorId} className="lx-auth-banner" role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" className="lx-auth-primary" disabled={submitting}>
          {submitting ? "Se trimite…" : "Trimite instrucțiunile"}
        </button>
        <Link to={loginHref} className="lx-auth-secondary">
          Înapoi la autentificare
        </Link>
      </form>
    </AuthLayout>
  );
}
