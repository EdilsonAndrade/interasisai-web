import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Force recompile marker - i18n namespace structure v2
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      common: (await import(`@/i18n/locales/${locale}/common.json`)).default,
      home: (await import(`@/i18n/locales/${locale}/home.json`)).default,
      about: (await import(`@/i18n/locales/${locale}/about.json`)).default,
      privacy: (await import(`@/i18n/locales/${locale}/privacy.json`)).default,
      terms: (await import(`@/i18n/locales/${locale}/terms.json`)).default,
      chat: (await import(`@/i18n/locales/${locale}/chat.json`)).default,
      admin: (await import(`@/i18n/locales/${locale}/admin.json`)).default,
      validation: (await import(`@/i18n/locales/${locale}/validation.json`)).default,
    },
  };
});
