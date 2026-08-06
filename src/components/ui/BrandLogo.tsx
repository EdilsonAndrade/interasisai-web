"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type BrandLogoVariant = "header" | "footer";

export interface BrandLogoProps {
  variant: BrandLogoVariant;
  className?: string;
  href?: string;
}

const LOGO_SRC = "/images/interasis_ai_logo.png";
const LOGO_NATIVE_WIDTH = 1536;
const LOGO_NATIVE_HEIGHT = 1024;
const LOGO_ASPECT = LOGO_NATIVE_WIDTH / LOGO_NATIVE_HEIGHT;

const VARIANT_HEIGHT_PX: Record<BrandLogoVariant, number> = {
  header: 56,
  footer: 64,
};

const FALLBACK_TEXT = "Interasis AI";
const LINK_ARIA_LABEL = "Interasis AI - Página inicial";

function getDisplayDimensions(variant: BrandLogoVariant) {
  const height = VARIANT_HEIGHT_PX[variant];
  const width = Math.round(height * LOGO_ASPECT);
  return { width, height };
}

function FallbackText({ variant }: { variant: BrandLogoVariant }) {
  const baseClass =
    variant === "header"
      ? "text-lg font-extrabold tracking-tight text-main"
      : "text-xl font-bold text-text-inverse";
  return <span className={baseClass}>{FALLBACK_TEXT}</span>;
}

export default function BrandLogo({ variant, className, href }: BrandLogoProps) {
  const [errored, setErrored] = useState(false);
  const { width, height } = getDisplayDimensions(variant);

  const insideLink = Boolean(href);
  const altText = insideLink ? "" : FALLBACK_TEXT;

  const imageClassName = twMerge(
    clsx(
      "h-auto w-auto select-none",
      variant === "header" ? "max-h-14" : "max-h-16",
      className,
    ),
  );

  const imageStyle: CSSProperties = { height: `${height}px`, width: "auto" };

  const content = errored ? (
    <FallbackText variant={variant} />
  ) : (
    <Image
      src={LOGO_SRC}
      alt={altText}
      width={width}
      height={height}
      priority={variant === "header"}
      className={imageClassName}
      style={imageStyle}
      data-testid="brand-logo-image"
      data-variant={variant}
      onError={() => setErrored(true)}
    />
  );

  if (insideLink && !errored) {
    return (
      <Link
        href={href ?? "/"}
        aria-label={LINK_ARIA_LABEL}
        className="inline-flex items-center"
      >
        {content}
      </Link>
    );
  }

  if (insideLink && errored) {
    return (
      <Link
        href={href ?? "/"}
        aria-label={LINK_ARIA_LABEL}
        className="inline-flex items-center"
      >
        <FallbackText variant={variant} />
      </Link>
    );
  }

  return content;
}
