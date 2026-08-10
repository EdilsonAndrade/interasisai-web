"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, type LocaleCode } from "@/i18n/config";

export function useLanguageSwitch() {
  const currentLocale = useLocale() as LocaleCode;
  const router = useRouter();

  const switchTo = (newLocale: LocaleCode) => {
    if (newLocale === currentLocale) return;
    // Navigate to the same pathname but with new locale prefix
    // window.location.pathname already has the locale prefix from middleware
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);
    // Replace the first segment (current locale) with new locale
    if (locales.includes(segments[0] as LocaleCode)) {
      segments[0] = newLocale;
    }
    router.replace(`/${segments.join("/")}`);
  };

  return { currentLocale, switchTo } as const;
}
