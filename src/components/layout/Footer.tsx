import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

import { footerInstitutionalLinks, footerSocialLinks } from "./navigation.config";

export default function Footer() {
  return (
    <footer className="bg-brand-secondary text-text-inverse" id="contato">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:px-8 lg:grid-cols-3 lg:px-12">
        <section>
          <h2 className="sr-only">Interasis AI</h2>
          <BrandLogo variant="footer" />
          <p className="mt-3 max-w-sm text-sm leading-7 text-text-inverse/80">
            Solucoes de IA para operacoes digitais com foco em clareza, previsibilidade e escala.
          </p>
        </section>

        <nav aria-label="Links institucionais">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-text-inverse/70">Institucional</h3>
          <ul className="mt-4 space-y-3">
            {footerInstitutionalLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-text-inverse/85 transition hover:text-brand-primary-soft">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-text-inverse/70">Contato</h3>
          <p className="mt-4 text-sm text-text-inverse/85">interasisai@gmail.com</p>
          <p className="mt-1 text-sm text-text-inverse/85">+55 (11) 97745-6057</p>
          <ul className="mt-5 flex gap-4" aria-label="Redes sociais">
            {footerSocialLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noreferrer" className="text-sm text-text-inverse/85 transition hover:text-brand-primary-soft">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs text-text-inverse/70 sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} Interasis AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
