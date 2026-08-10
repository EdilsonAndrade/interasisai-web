// ============================================================================
// Tabs — Reusable tabs component with framer-motion animated underline
// ============================================================================

"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <nav aria-label="Seções" className="border-b border-border-subtle">
      <div className="flex gap-0 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(id)}
              className={`relative inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "text-brand-primary"
                  : "text-text-weak hover:text-text-body"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
