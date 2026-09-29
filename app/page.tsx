import { portfolio } from "./data/portfolio";
import { CopyEmail } from "./components/interactions";
import { ProjectList } from "./components/project-list";
import { Experience } from "./components/experience";
import { Skills } from "./components/skills";
import { Architecture } from "./components/architecture";
import { ThemeSwitch } from "./components/theme-switch";
import { HeroArt } from "./components/hero-art";

const nav = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#systems", label: "Systems" },
  { href: "#contact", label: "Contact" },
];

export default function Home() {
  const current = portfolio.experience.find((job) => job.current);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top">
            {portfolio.name}
          </a>
          <nav aria-label="Main">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeSwitch />
        </div>
      </header>

      <main id="main" className="container">
        <section className="hero" id="top" aria-labelledby="hero-heading">
          <div className="hero-copy">
          {current && (
            <p className="hero-status">
              <span className="dot" aria-hidden="true" />
              {current.role.split(" (")[0]} at {current.organization}
              <span className="muted"> · {portfolio.location}</span>
            </p>
          )}
          <h1 id="hero-heading">
            I build the backend and the interface on top of it.
          </h1>
          <p className="hero-lead">{portfolio.intro}</p>
          <div className="hero-actions">
            <a className="button" href="#work">
              See my work
            </a>
            <a className="button button-ghost" href={portfolio.resume} download>
              Résumé (PDF)
            </a>
            <span className="hero-social">
              <a href={portfolio.social.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={portfolio.social.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </span>
          </div>
          </div>
          <HeroArt />
        </section>

        <section className="section" id="about" aria-labelledby="about-heading">
          <h2 id="about-heading" className="section-title">
            About
          </h2>
          <div className="section-content prose">
            <p>{portfolio.about}</p>
            <p>{portfolio.approach}</p>
          </div>
        </section>

        <section className="section" id="work" aria-labelledby="work-heading">
          <h2 id="work-heading" className="section-title">
            Work
          </h2>
          <div className="section-content">
            <p className="section-intro">
              Personal projects, built end to end.
              <span className="hover-hint"> Hover a project to preview it.</span>
            </p>
            <ProjectList projects={portfolio.projects} />
          </div>
        </section>

        <Experience />
        <Architecture />
        <Skills />

        <section className="section contact" id="contact" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="section-title">
            Contact
          </h2>
          <div className="section-content">
            <p className="contact-lead">
              Building something that needs a solid backend? I&apos;d like to hear
              about it.
            </p>
            <ul className="contact-list">
              <li>
                <span className="label">Email</span>
                <span className="contact-value">
                  <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
                  <CopyEmail email={portfolio.email} />
                </span>
              </li>
              <li>
                <span className="label">Phone</span>
                <a href={portfolio.phone.href}>{portfolio.phone.label}</a>
              </li>
              <li>
                <span className="label">GitHub</span>
                <a href={portfolio.social.github} target="_blank" rel="noreferrer">
                  {portfolio.social.github.replace("https://", "")}
                </a>
              </li>
              <li>
                <span className="label">LinkedIn</span>
                <a href={portfolio.social.linkedin} target="_blank" rel="noreferrer">
                  {portfolio.social.linkedin.replace("https://www.", "").replace(/\/$/, "")}
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="container site-footer">
        <span>
          © {new Date().getFullYear()} {portfolio.name}
        </span>
        <a href="#top">Back to top</a>
      </footer>
    </>
  );
}
