import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Brain, Code, Cog } from "lucide-react";

import FadeIn from "@/components/ui/animations/FadeIn";
import HeroChatCta from "@/components/ui/HeroChatCta";
import HeroCover from "@/components/ui/HeroCover";

const OG_IMAGE_ALT =
  "Interasis AI — Inteligência que conecta. Tecnologia que transforma.";

export const metadata: Metadata = {
  title: "Interasis AI | Inteligência Artificial e Engenharia de Software sob Medida",
  description:
    "Automatize processos, escale operações e resolva gargalos com soluções em nuvem e agentes de IA integrados ao seu negócio.",
  openGraph: {
    title: "Interasis AI | Inteligência Artificial e Engenharia de Software sob Medida",
    description:
      "Landing page principal da Interasis AI com foco em conversão e apresentação de serviços de software e IA.",
    images: [
      {
        url: "/images/interasisai_coverpage.png",
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interasis AI | Inteligência Artificial e Engenharia de Software sob Medida",
    description:
      "Landing page principal da Interasis AI com foco em conversão e apresentação de serviços de software e IA.",
    images: ["/images/interasisai_coverpage.png"],
  },
};

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Engenharia de Software",
    description: "Arquitetura Cloud, Next.js e NestJS para produtos escaláveis e confiáveis.",
    Icon: Code,
  },
  {
    title: "Integração de IA",
    description: "Agentes autônomos, LLMs e visão computacional conectados ao seu fluxo de negócio.",
    Icon: Brain,
  },
  {
    title: "Automação de Processos",
    description: "Redução de custos operacionais com workflows inteligentes e orientados por dados.",
    Icon: Cog,
  },
];

type FeatureCardProps = Feature;

function FeatureCard({ title, description, Icon }: FeatureCardProps) {
  return (
    <article
      data-testid="feature-card"
      className="rounded-card border border-border-subtle/70 bg-surface-base/65 p-6 shadow-floating backdrop-blur-md"
    >
      <div className="mb-4 inline-flex rounded-pill bg-brand-primary/15 p-2 text-brand-primary">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-bold text-text-strong">{title}</h3>
      <p className="mt-3 text-text-body">{description}</p>
    </article>
  );
}

export default function Home() {
  return (
    <div data-testid="landing-page" className="bg-surface-page text-text-strong">
      <FadeIn>
        <section
          id="top"
          data-testid="hero-section"
          className="min-h-[80vh] bg-gradient-hero px-6 pt-10 pb-20 sm:px-8 lg:px-12"
        >
          <div
            data-testid="hero-grid"
            className="mx-auto flex max-w-6xl flex-col gap-10"
          >
            <HeroCover />
            <div className="flex flex-col justify-center gap-8">
             

              <h1 className="max-w-4xl font-space-grotesk text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                <span className="text-brand-primary">Inteligência Artificial</span> e Engenharia de Software sob Medida.
              </h1>
              <p className="max-w-3xl text-lg text-text-body">
                Automatize processos, escale operações e resolva gargalos complexos com soluções em nuvem e agentes de IA
                integrados ao seu negócio.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  data-testid="cta-primary"
                  href="#"
                  className="inline-flex items-center justify-center rounded-button bg-brand-primary px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-brand-primary-hover"
                >
                  Explorar Soluções
                </a>
                <HeroChatCta />
                <a
                  data-testid="cta-secondary"
                  href="#"
                  className="inline-flex items-center justify-center rounded-button border border-border-subtle bg-surface-base/55 px-6 py-3 text-base font-semibold text-text-strong backdrop-blur-md transition hover:bg-surface-subtle/70"
                >
                  Conhecer Portfólio
                </a>

              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section id="servicos" data-testid="services-section" className="px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-extrabold text-text-strong">Proposta de Valor</h2>
            <p className="mt-3 max-w-3xl text-text-body">
              Unimos engenharia moderna e inteligência artificial aplicada para destravar eficiência real em operações
              digitais.
            </p>
            <div data-testid="services-grid" className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <section id="portfolio" className="px-6 pb-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-card border border-border-subtle/70 bg-surface-base/50 p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-text-strong">Portfólio</h2>
          <p className="mt-3 text-text-body">
            Cases e demonstrações de projetos de IA e engenharia de software da Interasis AI.
          </p>
        </div>
      </section>
    </div>
  );
}
