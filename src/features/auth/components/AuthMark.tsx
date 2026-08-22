type AuthMarkProps = {
  readonly size?: "sm" | "md";
};

export function AuthMark({ size = "md" }: AuthMarkProps) {
  return (
    <span className={`lx-auth-mark is-${size}`} aria-hidden>
      <span className="lx-auth-mark-letter">L</span>
      <span className="lx-auth-mark-on" />
    </span>
  );
}

export function AuthWordmark() {
  return (
    <span className="lx-auth-wordmark">
      LudiC
      <span className="lx-auth-on">
        ON
        <span className="lx-auth-on-dot" aria-hidden />
      </span>
    </span>
  );
}
