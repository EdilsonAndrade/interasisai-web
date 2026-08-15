import type { ReactNode } from "react";

type TechBadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function TechBadge({ children, className = "" }: TechBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border border-border-subtle/80 bg-surface-base/80 px-2.5 py-1 text-xs font-medium text-text-body transition-colors hover:border-brand-primary/40 hover:text-text-strong ${className}`}
    >
      {children}
    </span>
  );
}
