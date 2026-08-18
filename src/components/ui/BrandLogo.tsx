import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type BrandLogoVariant = "header" | "footer";

export interface BrandLogoProps {
  variant: BrandLogoVariant;
  className?: string;
  href?: string;
}

const LINK_ARIA_LABEL = "Interasis AI - Página inicial";

const VARIANT_STYLES: Record<BrandLogoVariant, { mark: string; wordmark: string }> = {
  header: {
    mark: "h-8 w-8 text-main",
    wordmark: "text-xl text-main",
  },
  footer: {
    mark: "h-10 w-10 text-text-inverse",
    wordmark: "text-2xl text-text-inverse",
  },
};

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        d="M9.5 22.5 14 10M18 10l4.5 12.5M10 24h12"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="7" cy="24" r="3" className="fill-brand-primary" />
      <circle cx="16" cy="8" r="3" fill="currentColor" />
      <circle cx="25" cy="24" r="3" className="fill-brand-primary" />
    </svg>
  );
}

export default function BrandLogo({ variant, className, href }: BrandLogoProps) {
  const styles = VARIANT_STYLES[variant];

  const content = (
    <span
      data-testid="brand-logo"
      data-variant={variant}
      className={twMerge(clsx("inline-flex items-center gap-2.5", className))}
    >
      <LogoMark className={styles.mark} />
      <span
        data-testid="brand-logo-text"
        className={clsx("font-space-grotesk font-extrabold tracking-tight", styles.wordmark)}
      >
        Interasis<span className="text-brand-primary"> AI</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={LINK_ARIA_LABEL} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
