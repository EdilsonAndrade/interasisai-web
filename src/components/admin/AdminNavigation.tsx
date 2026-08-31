"use client";

import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  MessageCircleMore,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const items = [
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/follow-up", label: "Follow-up", icon: ClipboardCheck },
  { href: "/admin/prompt-manager", label: "Prompts & Guardrails", icon: ShieldCheck },
  { href: "/admin/global-settings", label: "Configurações Globais", icon: Settings },
];

const painelSubmenu = [
  { href: "/admin/system-prompts", label: "Prompts do Sistema", icon: FileText },
  { href: "/admin", label: "Ingestão Tenant", icon: Search },
];

function isActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

type MenuPosition = { top: number; left: number };

export function AdminNavigation() {
  const pathname = usePathname();
  const [painelOpen, setPainelOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLLIElement>(null);
  const portalMenuRef = useRef<HTMLUListElement>(null);

  const painelActive = painelSubmenu.some(({ href }) => isActive(href, pathname));

  useEffect(() => {
    if (!painelOpen) return;

    // Rendered via portal (see below) so it isn't clipped by the nav row's
    // horizontal scroll container — position is computed from the trigger's
    // viewport rect instead of relying on CSS `absolute` positioning.
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        portalMenuRef.current &&
        !portalMenuRef.current.contains(target)
      ) {
        setPainelOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPainelOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [painelOpen]);

  return (
    <nav aria-label="Administração" className="border-b border-border-subtle bg-surface-base/80 px-4 backdrop-blur-xl sm:px-6">
      <ul className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto py-3">
        <li ref={triggerRef} className="relative">
          <button
            type="button"
            onClick={() => setPainelOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={painelOpen}
            className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-card px-3 py-2 text-sm font-semibold transition-colors ${
              painelActive
                ? "bg-brand-primary text-text-inverse"
                : "text-text-body hover:bg-brand-primary/10 hover:text-brand-primary"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Painel
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${painelOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {painelOpen &&
            menuPosition &&
            typeof document !== "undefined" &&
            createPortal(
              <ul
                ref={portalMenuRef}
                role="menu"
                aria-label="Painel"
                style={{ top: menuPosition.top, left: menuPosition.left }}
                className="fixed z-50 min-w-52 rounded-card border border-border-subtle bg-surface-base p-1 shadow-xl"
              >
                {painelSubmenu.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href, pathname);
                  return (
                    <li key={href} role="none">
                      <Link
                        href={href}
                        role="menuitem"
                        aria-current={active ? "page" : undefined}
                        onClick={() => setPainelOpen(false)}
                        className={`flex min-h-10 items-center gap-2 rounded-card px-3 py-2 text-sm font-semibold transition-colors ${
                          active
                            ? "bg-brand-primary text-text-inverse"
                            : "text-text-body hover:bg-brand-primary/10 hover:text-brand-primary"
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>,
              document.body,
            )}
        </li>

        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-card px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-primary text-text-inverse"
                    : "text-text-body hover:bg-brand-primary/10 hover:text-brand-primary"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}