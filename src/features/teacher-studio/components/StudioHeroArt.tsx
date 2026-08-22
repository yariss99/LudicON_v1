/**
 * Abstract composition for the desk hero — blocks, circles, a page and a few
 * sparks, built from the creation-domain accents. Decorative only, so it is
 * hidden from assistive technology.
 */
export function StudioHeroArt() {
  return (
    <svg
      className="ts-hero-art"
      viewBox="0 0 260 170"
      role="presentation"
      aria-hidden
      focusable="false"
    >
      {/* Building blocks — creation as construction */}
      <rect
        x="14"
        y="74"
        width="62"
        height="62"
        rx="16"
        fill="var(--lx-lesson)"
        opacity="0.16"
      />
      <rect
        x="40"
        y="46"
        width="46"
        height="46"
        rx="13"
        fill="var(--lx-game)"
        opacity="0.2"
      />
      <rect
        x="150"
        y="92"
        width="54"
        height="44"
        rx="13"
        fill="var(--lx-story)"
        opacity="0.16"
      />

      {/* A page taking shape */}
      <g transform="rotate(-7 120 60)">
        <rect
          x="94"
          y="26"
          width="66"
          height="84"
          rx="11"
          fill="#fff"
          stroke="var(--lx-border-strong)"
        />
        <rect x="106" y="44" width="42" height="5" rx="2.5" fill="var(--lx-lesson)" opacity="0.55" />
        <rect x="106" y="58" width="34" height="5" rx="2.5" fill="var(--lx-border-strong)" />
        <rect x="106" y="72" width="40" height="5" rx="2.5" fill="var(--lx-border-strong)" />
        <rect x="106" y="86" width="26" height="5" rx="2.5" fill="var(--lx-assessment)" opacity="0.6" />
      </g>

      {/* Circles — ideas */}
      <circle cx="206" cy="46" r="20" fill="var(--lx-presentation)" opacity="0.16" />
      <circle cx="232" cy="112" r="11" fill="var(--lx-worksheet)" opacity="0.25" />
      <circle cx="30" cy="36" r="8" fill="var(--lx-assessment)" opacity="0.28" />

      {/* Sparks — the copilot, present but small */}
      <path
        d="M186 20 l3.4 7.6 7.6 3.4 -7.6 3.4 -3.4 7.6 -3.4 -7.6 -7.6 -3.4 7.6 -3.4z"
        fill="var(--lx-ai)"
        opacity="0.75"
      />
      <path
        d="M74 24 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2z"
        fill="var(--lx-game)"
        opacity="0.7"
      />
      <path
        d="M140 138 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z"
        fill="var(--lx-story)"
        opacity="0.7"
      />
    </svg>
  );
}
