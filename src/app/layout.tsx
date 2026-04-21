import type { Metadata } from "next";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { rootThemeStyle } from "@/theme";

export const metadata: Metadata = {
  title: "Interasis AI | Tema semântico sincronizado",
  description: "Landing page inicial sincronizada com a skill oficial de design tokens da Interasis AI.",
  openGraph: {
    title: "Interasis AI | Tema semântico sincronizado",
    description: "Landing page inicial sincronizada com a skill oficial de design tokens da Interasis AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-deep text-main antialiased" style={rootThemeStyle}>
        <Header />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
