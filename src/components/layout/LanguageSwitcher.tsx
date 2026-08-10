"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useLanguageSwitch } from "@/hooks/useLanguageSwitch";
import { localeMeta } from "@/i18n/config";

export default function LanguageSwitcher() {
  const { currentLocale, switchTo } = useLanguageSwitch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentMeta = localeMeta[currentLocale];

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleSelect = (locale: keyof typeof localeMeta) => {
    setIsOpen(false);
    switchTo(locale);
  };

  return (
    <div ref={dropdownRef} className="relative" data-testid="language-switcher">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 items-center gap-1.5 rounded-button border border-white/15 px-3 text-sm text-main transition hover:bg-white/5 hover:scale-105"
        aria-label={`Select language, current: ${currentMeta.nativeName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="language-switcher-trigger"
      >
        <span aria-hidden="true" className="text-base">
          {currentMeta.flag}
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl border border-white/15 bg-deep/95 py-1 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            {Object.entries(localeMeta).map(([code, meta]) => {
              const isActive = code === currentLocale;
              return (
                <li key={code} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => handleSelect(code as keyof typeof localeMeta)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-white/5 ${
                      isActive
                        ? "text-brand-primary"
                        : "text-main/85"
                    }`}
                    data-testid={`lang-option-${code}`}
                  >
                    <span aria-hidden="true" className="text-base">
                      {meta.flag}
                    </span>
                    <span className="flex-1 text-left">{meta.nativeName}</span>
                    {isActive && <Check size={16} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
