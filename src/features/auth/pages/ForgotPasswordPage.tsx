import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthError } from "../types";
import { useAuth } from "../AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { validateEmail } from "../validation";

export function ForgotPasswordPage() {
  const { requestPasswordRecovery } = useAuth();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formErrorId = useId();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

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
      setDeliveryAvailable(result.channel === "email");
      setSubmitted(true);
    } catch (caught) {
      setFormError(
        caught instanceof AuthError
          ? "Nu am putut înregistra cererea. Încearcă din nou."
          : "Nu am putut înregistra cererea. Încearcă din nou.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitRecovery(email);
  }

  if (submitted) {
    return (
      <AuthLayout>
        <p className="lx-auth-panel-kicker">Recuperare cont</p>
        <h2
          ref={headingRef}
          className="lx-auth-panel-title"
          tabIndex={-1}
        >
          {deliveryAvailable ? "Verifică-ți e-mailul" : "Cererea a fost înregistrată"}
        </h2>
        <p className="lx-auth-panel-lead">
          Dacă există un cont asociat acestei adrese, vei primi instrucțiuni
          pentru resetarea parolei.
        </p>
        {deliveryAvailable ? (
          <p className="lx-auth-hint lx-auth-success-note">
            Verifică și folderul Spam sau Junk.
          </p>
        ) : (
          <p className="lx-auth-hint lx-auth-success-note" role="status">
            Trimiterea prin e-mail nu este încă disponibilă. Când un furnizor
            de autentificare va fi conectat, instrucțiunile vor ajunge pe
            e-mail.
          </p>
        )}

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
