import Link from "next/link";
import type { CSSProperties } from "react";
import { skillLogos, type SkillLogo } from "../data/skill-logos";
import { flattenSkills, levels } from "../data/skill-tree";

const levelOf = new Map(
  flattenSkills().map(({ node }) => [node.id, node.level ? levels[node.level].label : ""]),
);

// An endless left-to-right stream of skill logos on a glass panel, each logo mirrored
// on the floor below it. Pure CSS: the list is rendered twice and the track slides by
// exactly one copy, so the loop never shows a seam.

/** Near-black brand colors vanish on a dark page; those logos use the text color. */
function isDark(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.22;
}

/** Each tile opens its skill in the tree; the duplicate copy is skipped by keyboards. */
function Logo({ logo, copy }: { logo: SkillLogo; copy?: boolean }) {
  return (
    <li
      className={`marquee-item${isDark(logo.color) ? " is-mono" : ""}`}
      style={{ "--brand": logo.color } as CSSProperties}
    >
      <Link
        className="marquee-link"
        href={`/skills?skill=${logo.skill}`}
        tabIndex={copy ? -1 : undefined}
        aria-label={`${logo.name}: ${levelOf.get(logo.skill) ?? ""}, open in the skill tree`}
      >
        <span className="marquee-mark" aria-hidden="true">
          {"path" in logo ? (
            <svg viewBox="0 0 24 24" width="30" height="30">
              <path d={logo.path} />
            </svg>
          ) : (
            <span className="marquee-monogram">{logo.monogram}</span>
          )}
        </span>
        <span className="marquee-text">
          <span className="marquee-name">{logo.name}</span>
          <span className="marquee-level">{levelOf.get(logo.skill)}</span>
        </span>
      </Link>
    </li>
  );
}

export function LogoMarquee() {
  return (
    <section className="section mirror-section" aria-labelledby="mirror-heading">
      <h2 id="mirror-heading" className="section-title">
        Toolbox
      </h2>
      <div className="section-content">
        <div className="mirror">
          <div className="mirror-glow" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="mirror-glass">
            <div className="marquee">
              <ul className="marquee-track" aria-label="Technologies I work with">
                {skillLogos.map((logo) => (
                  <Logo key={logo.name} logo={logo} />
                ))}
              </ul>
              <ul className="marquee-track" aria-hidden="true">
                {skillLogos.map((logo) => (
                  <Logo key={logo.name} logo={logo} copy />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
