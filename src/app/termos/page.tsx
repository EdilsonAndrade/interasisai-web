import type { Metadata } from "next";

import InstitutionalPage from "@/components/layout/InstitutionalPage";
import { institutionalPages } from "@/content/institutional-pages";

export const metadata: Metadata = {
  title: "Termos | Interasis AI",
  description: "Consulte os termos de uso da Interasis AI para acesso aos conteúdos e serviços.",
};

export default function TermosPage() {
  return <InstitutionalPage page={institutionalPages.termos} />;
}
