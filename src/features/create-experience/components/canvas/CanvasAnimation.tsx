import type { ReactNode } from "react";

type CanvasAnimationProps = {
  active: boolean;
  children: ReactNode;
};

/** Subtle highlight wrapper — only animates when a section is newly updated. */
function CanvasAnimation({ active, children }: CanvasAnimationProps) {
  return (
    <div
      className={[
        "rounded-2xl transition-all duration-500 ease-out",
        active
          ? "canvas-section-new bg-sky-50/70 ring-1 ring-sky-100"
          : "bg-transparent ring-1 ring-transparent",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default CanvasAnimation;
