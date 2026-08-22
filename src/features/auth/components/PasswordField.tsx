import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly autoComplete: "current-password" | "new-password";
  readonly error?: string;
  readonly hint?: string;
  readonly describedBy?: string;
};

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
  hint,
  describedBy,
}: PasswordFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();
  const [visible, setVisible] = useState(false);

  const described = [
    hint ? hintId : null,
    error ? errorId : null,
    describedBy,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="lx-auth-field">
      <label className="lx-auth-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="lx-auth-password">
        <input
          id={inputId}
          className="lx-auth-input"
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={described || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="lx-auth-reveal"
          aria-pressed={visible}
          aria-label={visible ? "Ascunde parola" : "Arată parola"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="lx-auth-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="lx-auth-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
