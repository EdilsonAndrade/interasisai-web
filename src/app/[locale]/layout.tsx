import { type Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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

  return {
    metadataBase: new URL(siteUrl),
    title: "Interasis AI | Tema semântico sincronizado",
    description:
      "Landing page inicial sincronizada com a skill oficial de design tokens da Interasis AI.",
    alternates: {
      languages: {
        "pt-BR": "/pt-BR",
        en: "/en",
        es: "/es",
      },
    },
    openGraph: {
      title: "Interasis AI | Tema semântico sincronizado",
      description:
        "Landing page inicial sincronizada com a skill oficial de design tokens da Interasis AI.",
      images: [
        {
          url: "/images/interasisai_coverpage.png",
          width: 1200,
          height: 630,
          alt: "Interasis AI — Inteligência que conecta. Tecnologia que transforma.",
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

  return (
    <html lang={locale} className={spaceGrotesk.variable}>
      <body
        className="min-h-screen bg-deep text-main antialiased"
        style={rootThemeStyle}
      >
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
