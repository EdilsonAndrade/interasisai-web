"use client";

import Link from "next/link";
import { Building2, LayoutDashboard, MessageCircleMore, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/prompt-manager", label: "Prompts & Guardrails", icon: ShieldCheck },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administração" className="border-b border-border-subtle bg-surface-base/80 px-4 backdrop-blur-xl sm:px-6">
      <ul className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto py-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
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