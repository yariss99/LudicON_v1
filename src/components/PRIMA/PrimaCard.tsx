import type { ReactNode } from "react";

type PrimaCardProps = {
  children: ReactNode;
  className?: string;
};

function PrimaCard({ children, className = "" }: PrimaCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-[24px] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80 ${className}`}
    >
      {children}
    </article>
  );
}

export default PrimaCard;
