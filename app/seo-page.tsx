import Link from "next/link";

type SeoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
};

export function SeoPage({ eyebrow, title, intro, sections }: SeoPageProps) {
  return (
    <main className="seo-page">
      <nav className="nav" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">◆</span> GEMSTONE LABS
        </Link>
        <Link className="nav-cta" href="/#contact">Let&apos;s talk <span>↗</span></Link>
      </nav>
      <article className="seo-page-main">
        <header className="seo-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="seo-intro">{intro}</p>
          <div className="hero-actions">
            <Link className="button primary" href="/#contact">Start a project <span>↗</span></Link>
            <Link className="button text-button" href="/">Back to home</Link>
          </div>
        </header>
        <div className="seo-section-grid">
          {sections.map((section) => (
            <section className="seo-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <aside className="seo-cta">
          <p className="eyebrow">A useful next step</p>
          <h2>Bring us the question your team answers every day.</h2>
          <p>We&apos;ll help you decide whether a chatbot, a website, or a focused combination is the simplest place to start.</p>
          <Link className="button primary" href="/#contact">Talk to Gemstone Labs <span>↗</span></Link>
        </aside>
      </article>
    </main>
  );
}
