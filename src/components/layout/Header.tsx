"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";

import { useTranslations } from "next-intl";
import BrandLogo from "@/components/ui/BrandLogo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useChat } from "@/context/ChatContext";

export default function Header() {
  const t = useTranslations("common");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const storedTheme = window.localStorage.getItem("theme-mode");
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  });
  const { open } = useChat();

  useEffect(() => {
    const shouldUseLight = themeMode === "light";
    document.documentElement.classList.toggle("theme-light", shouldUseLight);
    window.localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  const toggleMenu = () => setIsMenuOpen((previous) => !previous);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleTheme = () => setThemeMode((previous) => (previous === "dark" ? "light" : "dark"));
  const openChatFromHeader = () => {
    open();
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-deep/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <BrandLogo variant="header" href="/" />

        <nav aria-label={t("menu.mainNav")} className="hidden items-center gap-8 md:flex">
          <Link href="/#servicos" className="text-sm font-semibold text-main/85 transition hover:text-brand-primary">
            {t("nav.services")}
          </Link>
          <Link href="/#portfolio" className="text-sm font-semibold text-main/85 transition hover:text-brand-primary">
            {t("nav.portfolio")}
          </Link>
          <Link href="/#contato" className="text-sm font-semibold text-main/85 transition hover:text-brand-primary">
            {t("nav.contact")}
          </Link>
          <Link href="/admin" className="text-sm font-semibold text-main/85 transition hover:text-brand-primary">
            {t("nav.admin")}
          </Link>
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          className="hidden h-10 w-10 items-center justify-center rounded-button border border-white/15 text-main transition hover:bg-white/5 md:inline-flex"
          aria-label={themeMode === "dark" ? t("theme.light") : t("theme.dark")}
        >
          {themeMode === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          <span className="sr-only">{themeMode === "dark" ? t("theme.light") : t("theme.dark")}</span>
        </button>

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        <div className="hidden md:block">
          <button
            type="button"
            data-testid="header-chat-cta"
            onClick={open}
            className="inline-flex items-center justify-center rounded-button bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          >
            {t("cta.primary")}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-main md:hidden"
          aria-label={isMenuOpen ? t("menu.close") : t("menu.open")}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMenuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {isMenuOpen && (
        <div id="mobile-nav" className="border-t border-white/10 bg-deep/95 md:hidden">
          <nav aria-label={t("menu.mobileNav")} className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4 sm:px-8">
            <Link href="/#servicos" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-main/90 transition hover:bg-white/5 hover:text-brand-primary">
              {t("nav.services")}
            </Link>
            <Link href="/#portfolio" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-main/90 transition hover:bg-white/5 hover:text-brand-primary">
              {t("nav.portfolio")}
            </Link>
            <Link href="/#contato" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-main/90 transition hover:bg-white/5 hover:text-brand-primary">
              {t("nav.contact")}
            </Link>
            <Link href="/admin" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-main/90 transition hover:bg-white/5 hover:text-brand-primary">
              {t("nav.admin")}
            </Link>
            <button
              type="button"
              data-testid="header-chat-cta-mobile"
              onClick={openChatFromHeader}
              className="mt-2 inline-flex items-center justify-center rounded-button bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
            >
              {t("cta.primary")}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-2 inline-flex h-11 w-11 items-center justify-center self-start rounded-button border border-white/15 text-main transition hover:bg-white/5"
              aria-label={themeMode === "dark" ? t("theme.light") : t("theme.dark")}
            >
              {themeMode === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
              <span className="sr-only">{themeMode === "dark" ? t("theme.light") : t("theme.dark")}</span>
            </button>
            <div className="mt-2">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
