import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-surface-page text-text-body antialiased" style={rootThemeStyle}>
        {children}
      </body>
    </html>
  );
}
