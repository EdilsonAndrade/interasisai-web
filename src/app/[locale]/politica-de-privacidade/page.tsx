import type { Metadata } from "next";

import InstitutionalPage from "@/components/layout/InstitutionalPage";
import { institutionalPages } from "@/content/institutional-pages";

export const metadata: Metadata = {
  title: "Política de Privacidade | Interasis AI",
  description: "Entenda como a Interasis AI trata dados e protege informações dos usuários.",
};

export default function PoliticaPrivacidadePage() {
  return <InstitutionalPage page={institutionalPages["politica-de-privacidade"]} />;
}
