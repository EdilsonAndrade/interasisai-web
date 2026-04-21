const operatingPrinciples = [
  "Azul institucional como base",
  "Roxo restrito a apoio visual",
  "Time sênior em IA aplicada",
];

const deliveryCards = [
  {
    title: "Arquitetura orientada por valor",
    description: "Diagnóstico, priorização e entrega em ciclos curtos com linguagem visual estável para todo o produto.",
  },
  {
    title: "Operação confiável",
    description: "Pipelines, observabilidade e automações pensadas para reduzir retrabalho entre design, front-end e negócio.",
  },
  {
    title: "IA aplicada com governança",
    description: "Assistentes, fluxos e integrações que respeitam contexto empresarial, clareza operacional e manutenção futura.",
  },
];

export default function Home() {
  return (
    <main data-testid="landing-page" className="bg-surface-page text-text-strong">
      <section
        data-testid="hero-section"
        className="bg-gradient-hero hero-grid relative overflow-hidden px-6 py-20 text-text-inverse sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative z-10 space-y-8">
            <span
              data-testid="campaign-badge"
              className="inline-flex rounded-pill bg-accent-campaign px-4 py-2 text-sm font-semibold tracking-[0.14em] text-text-inverse uppercase shadow-card"
            >
              Tema oficial sincronizado
            </span>

            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-medium tracking-[0.18em] text-text-inverse/80 uppercase">
                Interasis AI
              </p>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Sincronize sua operação digital com clareza, contraste e direção corporativa.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-text-inverse/82">
                O tema da aplicação agora nasce da skill oficial de design tokens e entrega uma base semântica consistente para hero, CTAs, superfícies claras e apoio visual controlado.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                data-testid="primary-cta"
                href="#diagnostico"
                className="inline-flex items-center justify-center rounded-button bg-brand-primary px-6 py-3 text-base font-semibold text-text-inverse shadow-floating transition hover:bg-brand-primary-hover"
              >
                Agendar diagnóstico
              </a>
              <a
                href="#arquitetura"
                className="inline-flex items-center justify-center rounded-button border border-white/25 bg-white/10 px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-white/16"
              >
                Ver arquitetura de entrega
              </a>
            </div>

            <ul className="grid gap-3 text-sm text-text-inverse/86 sm:grid-cols-3">
              {operatingPrinciples.map((principle) => (
                <li
                  key={principle}
                  className="rounded-card border border-white/14 bg-white/8 px-4 py-4 backdrop-blur-[2px]"
                >
                  {principle}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10">
            <div className="absolute -left-8 top-8 hidden h-24 w-24 rounded-full bg-brand-primary/30 blur-3xl lg:block" />
            <div className="absolute -right-6 bottom-10 hidden h-28 w-28 rounded-full bg-accent-campaign/30 blur-3xl lg:block" />
            <div className="hero-panel-cut relative overflow-hidden rounded-[28px] bg-gradient-panel p-6 shadow-floating">
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-card bg-surface-base p-6 text-text-strong shadow-card">
                  <p className="text-sm font-semibold tracking-[0.12em] text-brand-primary uppercase">
                    Blueprint visual
                  </p>
                  <h2 className="mt-4 text-3xl font-extrabold leading-tight">
                    Hero azul dominante, leitura limpa e CTAs objetivos.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-text-body">
                    A primeira dobra prioriza mensagem forte, blocos claros e um painel principal que traduz confiança B2B sem cair em convenções genéricas.
                  </p>
                </article>
                <div className="space-y-4">
                  <article className="rounded-card bg-brand-secondary px-5 py-6 text-text-inverse shadow-card">
                    <p className="text-sm font-semibold tracking-[0.12em] text-text-inverse/72 uppercase">
                      Contraste institucional
                    </p>
                    <p className="mt-3 text-3xl font-extrabold">5 grupos</p>
                    <p className="mt-2 text-sm text-text-inverse/78">
                      Marca, superfície, texto, forma e profundidade expostos via Tailwind.
                    </p>
                  </article>
                  <article className="rounded-card bg-surface-base p-5 text-text-strong shadow-card">
                    <p className="text-sm font-semibold tracking-[0.12em] text-brand-primary uppercase">
                      Governança visível
                    </p>
                    <p className="mt-3 text-base leading-7 text-text-body">
                      A inconsistência de nomenclatura da pasta oficial foi documentada sem renomeação estrutural.
                    </p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="arquitetura" className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold tracking-[0.12em] text-brand-primary uppercase">Entrega alinhada</p>
            <h2 className="text-3xl font-extrabold text-text-strong sm:text-4xl">
              A mesma linguagem visual agora orienta código, utilitários Tailwind e manutenção do tema.
            </h2>
            <p className="text-lg leading-8 text-text-body">
              Os componentes deixam de carregar hexadecimais arbitrários e passam a consumir apenas tokens oficiais expostos no tema do projeto.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {deliveryCards.map((card) => (
              <article
                key={card.title}
                className="rounded-card border border-border-subtle bg-surface-base p-6 shadow-card"
              >
                <div className="mb-5 h-12 w-12 rounded-2xl bg-brand-primary-soft" />
                <h3 className="text-xl font-bold text-text-strong">{card.title}</h3>
                <p className="mt-3 leading-7 text-text-body">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="diagnostico" className="px-6 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[28px] border border-border-subtle bg-surface-subtle p-8 shadow-card lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold tracking-[0.12em] text-brand-primary uppercase">Próximo passo</p>
            <h2 className="text-3xl font-extrabold text-text-strong">Padronize a base visual antes de ampliar a superfície do produto.</h2>
            <p className="text-base leading-7 text-text-body">
              Essa sincronização cria um ponto único de verdade para novos componentes, páginas e contratos visuais do time.
            </p>
          </div>
          <a
            href="#top"
            className="inline-flex items-center justify-center rounded-button bg-brand-secondary px-6 py-3 text-base font-semibold text-text-inverse transition hover:bg-brand-secondary-soft"
          >
            Consolidar o tema oficial
          </a>
        </div>
      </section>
    </main>
  );
}
