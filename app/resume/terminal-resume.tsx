import { portfolio } from "../data/portfolio";

// The résumé as a terminal session, built from the same data as the rest of the site.
// On paper it drops the terminal styling and prints as a plain, readable page.

const Cmd = ({ children }: { children: string }) => (
  <p className="tr-cmd">
    <span className="tr-prompt">aman@portfolio:~$</span> {children}
  </p>
);

export function TerminalResume() {
  const { name, role, location, email, phone, social, about, experience, projects, skills } =
    portfolio;
  return (
    <article className="terminal-resume" aria-label={`${name} — résumé`}>
      <div className="tr-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>resume.md — zsh</span>
      </div>
      <div className="tr-body">
        <Cmd>whoami</Cmd>
        <h2 className="tr-name">{name}</h2>
        <p>
          {role} · {location}
        </p>
        <p className="tr-dim">
          <a href={`mailto:${email}`}>{email}</a> · <a href={phone.href}>{phone.label}</a> ·{" "}
          <a href={social.github}>{social.github.replace("https://", "")}</a> ·{" "}
          <a href={social.linkedin}>linkedin</a>
        </p>
        <p>{about}</p>

        <Cmd>git log --career</Cmd>
        {experience.map((job) => (
          <section key={job.organization} className="tr-entry">
            <h3>
              <span className="tr-accent">{job.organization}</span> — {job.role}
              <span className="tr-dim"> · {job.dates}</span>
            </h3>
            <ul>
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
        ))}

        <Cmd>ls ~/projects</Cmd>
        {projects.map((p) => (
          <section key={p.id} className="tr-entry">
            <h3>
              <span className="tr-accent">{p.title}</span> — {p.category}
              <span className="tr-dim"> · {p.stack}</span>
            </h3>
            <p>{p.description}</p>
            <p className="tr-dim">
              {p.outcomes.map((o) => `${o.label}: ${o.value}`).join(" · ")} ·{" "}
              <a href={p.demo}>demo</a> · <a href={p.source}>source</a>
            </p>
          </section>
        ))}

        <Cmd>cat skills.json</Cmd>
        <dl className="tr-skills">
          {skills.map((group) => (
            <div key={group.label}>
              <dt>{group.label}</dt>
              <dd>{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>

        <Cmd>cat education.txt</Cmd>
        <p>
          {portfolio.education.degree} — {portfolio.education.institution}
          <span className="tr-dim"> · {portfolio.education.dates}</span>
        </p>
        {portfolio.certifications.map((c) => (
          <p key={c.title}>
            {c.title} — {c.issuer}
          </p>
        ))}
        <p className="tr-cursor" aria-hidden="true">
          <span className="tr-prompt">aman@portfolio:~$</span> <span className="tr-caret" />
        </p>
      </div>
    </article>
  );
}
