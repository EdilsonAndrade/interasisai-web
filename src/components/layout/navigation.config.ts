export type NavigationItem = {
  label: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "Servicos", href: "#servicos" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contato", href: "#contato" },
];

export const primaryCta = {
  label: "Fale com a IA",
  href: "#contato",
};

export const footerInstitutionalLinks: NavigationItem[] = [
  { label: "Sobre", href: "#sobre" },
  { label: "Politica de Privacidade", href: "#privacidade" },
  { label: "Termos", href: "#termos" },
];

export const footerSocialLinks: NavigationItem[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "YouTube", href: "https://www.youtube.com" },
];
