import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  bordered?: boolean;
};

const paddingMap = {
  none: "",
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

function SurfaceCard({
  children,
  className = "",
  hover = false,
  padding = "md",
  bordered = false,
}: SurfaceCardProps) {
  return (
    <div
      className={[
        "rounded-[24px] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.06)]",
        bordered ? "border border-slate-100/80" : "",
        paddingMap[padding],
        hover
          ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(79,70,229,0.12)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default SurfaceCard;
