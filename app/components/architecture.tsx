import type { CSSProperties } from "react";
import { architectures } from "../data/portfolio";

export function Architecture() {
  return (
    <section
      className="section"
      id="systems"
      aria-labelledby="systems-heading"
    >
      <h2 id="systems-heading" className="section-title">
        Systems
      </h2>
      <div className="section-content systems">
        <p className="section-intro">
          How the pieces fit together, at a high level.
        </p>
        {architectures.map((system) => (
          <article key={system.id} className="system" aria-labelledby={`${system.id}-heading`}>
            <div className="system-head">
              <h3 id={`${system.id}-heading`}>{system.title}</h3>
              <p className="muted">{system.summary}</p>
            </div>
            <ol className="flow" aria-label={`${system.title} data flow`}>
              {system.nodes.map((node, index) => (
                <li
                  key={node.technology}
                  style={{ "--i": index } as CSSProperties}
                >
                  {index > 0 && (
                    <span className="flow-edge">
                      <span className="visually-hidden">
                        {system.connections[index - 1]}
                      </span>
                      <i className="packet" aria-hidden="true" />
                    </span>
                  )}
                  <div className="flow-node">
                    <span className="label">{node.label}</span>
                    <strong>{node.technology}</strong>
                    <span className="muted">{node.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
            {system.integrations.length > 0 && (
              <p className="system-note">
                <span className="label">Also connects to</span>{" "}
                {system.integrations
                  .map((item) => `${item.technology} for ${item.detail.toLowerCase()}`)
                  .join("; ")}
                .
              </p>
            )}
            {system.deployment && (
              <p className="system-note">
                <span className="label">Deployment</span> {system.deployment}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
