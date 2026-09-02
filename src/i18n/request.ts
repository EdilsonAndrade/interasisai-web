import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      common: (await import(`./locales/${locale}/common.json`)).default,
      home: (await import(`./locales/${locale}/home.json`)).default,
      about: (await import(`./locales/${locale}/about.json`)).default,
      privacy: (await import(`./locales/${locale}/privacy.json`)).default,
      terms: (await import(`./locales/${locale}/terms.json`)).default,
      connect: (await import(`./locales/${locale}/connect.json`)).default,
      demo: (await import(`./locales/${locale}/demo.json`)).default,
      chat: (await import(`./locales/${locale}/chat.json`)).default,
      admin: (await import(`./locales/${locale}/admin.json`)).default,
      validation: (await import(`./locales/${locale}/validation.json`)).default,
    },
  };
});
