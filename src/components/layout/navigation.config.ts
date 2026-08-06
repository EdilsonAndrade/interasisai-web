export type NavigationItem = {
  label: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "Serviços", href: "/#servicos" },
  { label: "Portfólio", href: "/#portfolio" },
  { label: "Contato", href: "/#contato" },
  { label: "Admin", href: "/admin" },
];

export const primaryCta = {
  label: "Fale com a IA",
  href: "/#contato",
};

export const footerInstitutionalLinks: NavigationItem[] = [
  { label: "Sobre", href: "/#sobre" },
  { label: "Política de Privacidade", href: "/#privacidade" },
  { label: "Termos", href: "/#termos" },
];

export const footerSocialLinks: NavigationItem[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "YouTube", href: "https://www.youtube.com" },
];
