import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interasis AI - Ambiente Inicializado",
  description: "Bootstrap inicial do frontend da Interasis AI.",
  openGraph: {
    title: "Interasis AI - Ambiente Inicializado",
    description: "Bootstrap inicial do frontend da Interasis AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
