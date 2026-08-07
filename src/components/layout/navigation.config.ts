export type NavigationItem = {
  label: string;
  href: string;
};

export type SocialNavigationItem = NavigationItem & {
  isVisible: boolean;
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
  { label: "Sobre", href: "/sobre" },
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos", href: "/termos" },
];

export const footerSocialLinks: SocialNavigationItem[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/115859702/admin/dashboard/",
    isVisible: true,
  },
  { label: "Instagram", href: "https://www.instagram.com", isVisible: false },
  { label: "YouTube", href: "https://www.youtube.com", isVisible: false },
];
