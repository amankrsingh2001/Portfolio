import { portfolio } from "../data/portfolio";

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="section-title">
        Skills
      </h2>
      <dl className="section-content skills">
        {portfolio.skills.map((group) => (
          <div key={group.label}>
            <dt>{group.label}</dt>
            <dd>{group.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
