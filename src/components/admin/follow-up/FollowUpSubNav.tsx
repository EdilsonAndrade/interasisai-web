"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/follow-up", label: "Fila" },
  { href: "/admin/follow-up/history", label: "Histórico" },
  { href: "/admin/follow-up/config", label: "Configuração" },
  { href: "/admin/follow-up/dashboard", label: "Dashboard" },
];

export function FollowUpSubNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação de Follow-up" className="mb-6 flex gap-1 overflow-x-auto border-b border-border-subtle">
      {items.map(item => {
        const active = pathname === item.href || pathname.endsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-text-body hover:text-text-strong"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
