import type { Metadata } from "next";

import InstitutionalPage from "@/components/layout/InstitutionalPage";
import { institutionalPages } from "@/content/institutional-pages";

export const metadata: Metadata = {
  title: "Sobre | Interasis AI",
  description: "Conheça a Interasis AI, seu propósito e abordagem para operações digitais com IA.",
};

export default function SobrePage() {
  return <InstitutionalPage page={institutionalPages.sobre} />;
}
