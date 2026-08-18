export type InstitutionalSection = {
  heading: string;
  content: string;
};

type InstitutionalPageProps = {
  kicker: string;
  title: string;
  summary: string;
  updatedAtLabel: string;
  updatedAtDate: string;
  sections: InstitutionalSection[];
};

export default function InstitutionalPage({
  kicker,
  title,
  summary,
  updatedAtLabel,
  updatedAtDate,
  sections,
}: InstitutionalPageProps) {
  return (
    <main className="bg-surface-page px-6 py-14 text-text-strong sm:px-8 lg:px-12">
      <article className="mx-auto max-w-4xl rounded-card border border-border-subtle/70 bg-surface-base/65 p-8 shadow-floating backdrop-blur-md sm:p-10">
        <header className="border-b border-border-subtle/70 pb-6">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-text-body">{kicker}</p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h1>
          <p className="mt-4 text-text-body">{summary}</p>
          <p className="mt-4 text-xs text-text-muted">
            {updatedAtLabel} {updatedAtDate}
          </p>
        </header>

        <section className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-text-strong">{section.heading}</h2>
              <p className="mt-3 leading-7 text-text-body">{section.content}</p>
            </section>
          ))}
        </section>
      </article>
    </main>
  );
}
