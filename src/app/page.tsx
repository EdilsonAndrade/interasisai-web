import FadeIn from "@/components/ui/animations/FadeIn";

const serviceCards = [
  "Automacao de atendimento com IA",
  "Diagnostico de operacao digital",
  "Arquitetura de agentes e fluxos",
];

export default function Home() {
  return (
    <div data-testid="landing-page" className="bg-deep text-main">
      <FadeIn>
        <section
          id="servicos"
          data-testid="hero-block"
          className="bg-gradient-hero px-6 py-20 text-main sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-6xl space-y-6">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-main/75">Interasis AI</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Estrutura global pronta para navegar com clareza em desktop e mobile.
            </h1>
            <p className="max-w-2xl text-lg text-main/80">
              Header, Footer e wrappers de animacao reutilizaveis para acelerar entregas com consistencia visual.
            </p>
            <a
              href="#contato"
              className="inline-flex items-center justify-center rounded-button bg-brand-primary px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-brand-primary-hover"
            >
              Fale com a IA
            </a>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section id="portfolio" data-testid="portfolio-block" className="px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-extrabold text-text-strong">Portifolio de Solucoes</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {serviceCards.map((service) => (
                <article key={service} className="rounded-card border border-white/10 bg-surface-base/80 p-6 shadow-card backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-main">{service}</h3>
                  <p className="mt-3 text-main/78">Implementacao orientada por resultado com foco em confianca operacional.</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section data-testid="contact-block" className="px-6 pb-20 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-card border border-white/10 bg-surface-base/70 p-8 shadow-card backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.12em] uppercase text-brand-primary">Contato</p>
              <h2 className="mt-2 text-3xl font-extrabold text-main">Vamos estruturar a sua casca global de produto.</h2>
            </div>
            <a
              href="#top"
              className="inline-flex items-center justify-center rounded-button bg-brand-secondary px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-brand-secondary-soft"
            >
              Voltar ao topo
            </a>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
