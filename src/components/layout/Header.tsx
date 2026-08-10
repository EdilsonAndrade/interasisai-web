"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";

import BrandLogo from "@/components/ui/BrandLogo";
import { useChat } from "@/context/ChatContext";

import { navigationItems, primaryCta } from "./navigation.config";

export default function Header() {
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

        <nav aria-label="Navegacao principal" className="hidden items-center gap-8 md:flex">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-main/85 transition hover:text-brand-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          className="hidden h-10 w-10 items-center justify-center rounded-button border border-white/15 text-main transition hover:bg-white/5 md:inline-flex"
          aria-label={themeMode === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          {themeMode === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          <span className="sr-only">{themeMode === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}</span>
        </button>

        <div className="hidden md:block">
          <button
            type="button"
            data-testid="header-chat-cta"
            onClick={open}
            className="inline-flex items-center justify-center rounded-button bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          >
            {primaryCta.label}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-main md:hidden"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMenuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {isMenuOpen && (
        <div id="mobile-nav" className="border-t border-white/10 bg-deep/95 md:hidden">
          <nav aria-label="Navegacao mobile" className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4 sm:px-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-main/90 transition hover:bg-white/5 hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              data-testid="header-chat-cta-mobile"
              onClick={openChatFromHeader}
              className="mt-2 inline-flex items-center justify-center rounded-button bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
            >
              {primaryCta.label}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-2 inline-flex h-11 w-11 items-center justify-center self-start rounded-button border border-white/15 text-main transition hover:bg-white/5"
              aria-label={themeMode === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {themeMode === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
              <span className="sr-only">{themeMode === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
