import { SkillTree } from "./skill-tree";

export function Skills() {
  return (
    <section
      className="section skills-section"
      id="skills"
      aria-labelledby="skills-heading"
    >
      <h2 id="skills-heading" className="section-title">
        Skill tree
      </h2>
      <div className="section-content">
        <SkillTree />
      </div>
    </section>
  );
}
