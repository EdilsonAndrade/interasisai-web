import { type LocaleMeta } from "./types";

export const locales = ["pt-BR", "en", "es"] as const;
export type LocaleCode = (typeof locales)[number];
export const defaultLocale: LocaleCode = "en";

export const localeMeta: Record<LocaleCode, LocaleMeta> = {
  "pt-BR": { code: "pt-BR", flag: "🇧🇷", nativeName: "Português", dir: "ltr" },
  en:      { code: "en",    flag: "🇺🇸", nativeName: "English",   dir: "ltr" },
  es:      { code: "es",    flag: "🇪🇸", nativeName: "Español",   dir: "ltr" },
};
