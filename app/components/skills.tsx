import { SkillTree } from "./skill-tree";

export function Skills() {
  return (
    <section
      className="section skills-section"
      id="skills"
      aria-labelledby="skills-heading"
    >
      <h1 id="skills-heading" className="section-title">
        Skill tree
      </h1>
      <div className="section-content">
        <SkillTree />
      </div>
    </section>
  );
}
