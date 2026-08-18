import { type Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { LocaleCode } from "@/i18n/config";
import { locales } from "@/i18n/config";
import "../globals.css";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { rootThemeStyle } from "@/theme";
import { ChatProvider } from "@/context/ChatContext";
import ChatWidgetLoader from "@/components/chat/ChatWidgetLoader";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://interasisai.com.br";

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(siteUrl),
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t.raw("metadata.keywords") as string[],
    verification: {
      google: "4dlJLjzyiNxh1qwPfVEgko943OiiiyUVbAKPW3W-toY",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "pt-BR": "/pt-BR",
        en: "/en",
        es: "/es",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: `/${locale}`,
      type: "website",
      locale,
      images: [
        {
          url: "/images/interasisai_coverpage.png",
          width: 1200,
          height: 630,
          alt: "Interasis AI",
        },
      ],
    },
  };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as LocaleCode)) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "home" });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Interasis AI",
    legalName: "Edilson Augusto de Andrade Desenvolvimento de Software LTDA",
    url: siteUrl,
    logo: `${siteUrl}/images/interasis_ai_logo.png`,
    description: t("metadata.description"),
    email: "contato@interasisai.com.br",
    telephone: "+55-11-97745-6057",
    areaServed: ["BR", "US", "Europe"],
    knowsAbout: t.raw("metadata.keywords") as string[],
  };

  return (
    <html lang={locale} className={spaceGrotesk.variable}>
      <body
        className="min-h-screen bg-deep text-main antialiased"
        style={rootThemeStyle}
      >
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ChatProvider>
            <Header />
            <main id="top">{children}</main>
            <Footer />
            <ChatWidgetLoader />
          </ChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
