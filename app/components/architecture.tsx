"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { architectures, portfolio } from "../data/portfolio";
import { ProjectList } from "./project-list";

type System = (typeof architectures)[number];

function LayerIcon({ kind }: { kind: string }) {
  const shapes: Record<string, React.ReactNode> = {
    frontend: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18M8 22h8M12 18v4m-3-11-2 2 2 2m6-4 2 2-2 2" /></>,
    backend: <><rect x="4" y="3" width="16" height="7" rx="2" /><rect x="4" y="14" width="16" height="7" rx="2" /><path d="M8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5M12 10v4" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
    security: <><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z" /><path d="m8 12 3 3 5-6" /></>,
    cloud: <><path d="M7 18H6a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9h-1" /><path d="m9 14 3-3 3 3M12 11v10" /></>,
    external: <><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h5" /></>,
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[kind] ?? shapes.external}</svg>;
}

function SystemDiagram({ system, number }: { system: System; number: number }) {
  const [selected, setSelected] = useState(0);
  const [trace, setTrace] = useState(-1);
  const detailId = useId();
  const node = system.nodes[selected];

  useEffect(() => {
    if (trace < 0) return;
    const timer = window.setTimeout(() => {
      const next = trace + 1;
      if (next < system.nodes.length) { setSelected(next); setTrace(next); }
      else setTrace(-1);
    }, 950);
    return () => clearTimeout(timer);
  }, [trace, system.nodes.length]);

  return (
    <article className="system system-workbench" aria-labelledby={system.id + "-heading"}>
      <div className="system-toolbar">
        <div>
          <p className="system-eyebrow">SYSTEM {String(number).padStart(2, "0")} <span>/</span> {system.category}</p>
          <h3 id={system.id + "-heading"}>{system.projectId ? "Under the hood" : system.title}</h3>
          <p className="system-summary">{system.summary}</p>
        </div>
        <button className="trace-button" type="button" onClick={() => { setSelected(0); setTrace(0); }} disabled={trace >= 0}>
          <span aria-hidden="true">{trace >= 0 ? "◌" : "▷"}</span> {trace >= 0 ? "Tracing…" : "Trace the flow"}
        </button>
      </div>
      <div className="system-workspace">
        <div className="system-stage">
          <span className="diagram-caption">{system.id === "azure" ? "PROCESSING PIPELINE" : "APPLICATION LAYERS"}</span>
          <ol className="system-path" data-parallel={system.id === "azure"} style={{ "--layers": system.nodes.length } as CSSProperties} aria-label={system.title + " logical flow"}>
            {system.nodes.map((layer, index) => (
              <li className="system-station" key={layer.technology}>
                <button className="layer-card" type="button" data-selected={selected === index} data-tracing={trace === index}
                  aria-pressed={selected === index} aria-controls={detailId} onClick={() => { setTrace(-1); setSelected(index); }}>
                  <span className="layer-top"><span className="layer-icon"><LayerIcon kind={layer.icon} /></span><span className="layer-number">0{index + 1}</span></span>
                  <span className="layer-label">{layer.label}</span><strong>{layer.technology}</strong><span className="layer-description">{layer.detail}</span>
                </button>
                {index < system.nodes.length - 1 && <span className="system-connector" data-tracing={trace === index}><span className="connector-label">{system.connections[index]}</span><span className="connector-line" aria-hidden="true"><i /></span></span>}
                {index === 1 && system.integrations.length > 0 && (
                  <ul className="system-branches" data-tracing={trace === index} aria-label={(system.id === "azure" ? "Parallel outputs from " : "Integrations connected to ") + layer.technology}>
                    {system.integrations.map((integration) => (
                      <li key={integration.technology} className="integration-card">
                        <span className="integration-icon"><LayerIcon kind={integration.icon} /></span>
                        <div><span className="layer-label">{integration.label}</span><strong>{integration.technology}</strong><span className="layer-description">{integration.detail}</span></div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
          <p className="diagram-legend"><span aria-hidden="true" /> Logical overview <span className="diagram-separator">·</span> Select a layer to explore</p>
        </div>
        <aside className="layer-inspector" id={detailId} aria-label="Selected layer details" aria-live="polite">
          <p className="system-eyebrow">INSIDE THIS LAYER</p>
          <div key={selected} className="inspector-content">
            <span className="inspector-icon"><LayerIcon kind={node.icon} /></span>
            <p className="layer-label">{node.label}</p><h4>{node.technology}</h4><p className="inspector-description">{node.detail}</p>
            {selected > 0 && <div className="inspector-connection"><span>Receives from</span><strong>{system.nodes[selected - 1].technology}</strong><small>{system.connections[selected - 1]}</small></div>}
            {selected < system.nodes.length - 1 && <div className="inspector-connection"><span>Connects to</span><strong>{system.nodes[selected + 1].technology}</strong><small>{system.connections[selected]}</small></div>}
            {selected === 1 && system.integrations.length > 0 && <div className="inspector-connection"><span>{system.id === "azure" ? "Sends data to both" : "Integrations"}</span><strong>{system.integrations.map((item) => item.technology).join(" · ")}</strong>{system.id === "azure" && <small>Parallel delivery</small>}</div>}
          </div>
          <span className="inspector-position">LAYER {String(selected + 1).padStart(2, "0")} <span>/ {String(system.nodes.length).padStart(2, "0")}</span></span>
        </aside>
      </div>
      {system.deployment && <p className="system-deployment"><LayerIcon kind="cloud" /><span>{system.deployment}</span></p>}
    </article>
  );
}

export function Architecture() {
  const [active, setActive] = useState(0);
  const system = architectures[active];
  const project = portfolio.projects.find((item) => item.id === system.projectId);
  return (
    <section className="section systems-section projects-section" id="projects" aria-labelledby="projects-heading">
      <span id="work" className="section-anchor" aria-hidden="true" />
      <span id="systems" className="section-anchor" aria-hidden="true" />
      <h1 id="projects-heading" className="section-title">Projects</h1>
      <div className="section-content systems">
        <div className="systems-intro"><p className="systems-headline">Built from idea to interface<span>.</span></p><p>The work, the details, and the systems behind it.<br />Choose a project to explore.</p></div>
        <div className="system-picker" role="group" aria-label="Choose a project or work example">
          {architectures.map((system, index) => (
            <button key={system.id} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
              <span className="picker-number">0{index + 1}</span><span><strong>{system.title}</strong><small>{index === 0 ? "Personal · Learning platform" : index === 1 ? "Personal · Expense tracker" : "Professional · Bluetris"}</small></span><span className="picker-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        {project && <div className="selected-project" key={project.id}><ProjectList projects={[project]} /></div>}
        <SystemDiagram key={system.id} system={system} number={active + 1} />
      </div>
    </section>
  );
}
