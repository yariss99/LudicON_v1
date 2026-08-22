/**
 * Workshop signature: creative blocks in a row, one idea turning ON.
 * Decorative only — the form stays the interactive centre.
 */
export function AuthWorkshopArt() {
  return (
    <svg
      className="lx-auth-workshop"
      viewBox="0 0 360 168"
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <line className="lx-auth-workshop-line" x1="58" y1="92" x2="302" y2="92" />
      <rect className="lx-auth-block is-lesson" x="18" y="64" width="56" height="56" rx="16" />
      <rect className="lx-auth-block is-story" x="108" y="52" width="56" height="56" rx="16" />
      <rect className="lx-auth-block is-assessment" x="198" y="60" width="56" height="56" rx="16" />
      <rect className="lx-auth-block is-on" x="286" y="44" width="62" height="62" rx="18" />
      <circle className="lx-auth-block-lamp" cx="331" cy="56" r="6" />
      <path
        className="lx-auth-block-lines"
        d="M308 78 h18 M308 88 h12"
      />
    </svg>
  );
}
