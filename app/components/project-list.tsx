"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { portfolio } from "../data/portfolio";

type PortfolioProject = (typeof portfolio.projects)[number];

const POPOVER_WIDTH = 380;
const POPOVER_HEIGHT = 262; // 16:10 image plus the address bar
const OFFSET = 28;

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function canHover() {
  return matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function ProjectList({ projects }: { projects: PortfolioProject[] }) {
  const [active, setActive] = useState<number | null>(null);
  const popover = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  // Follow the pointer with a light easing while a project is hovered.
  useEffect(() => {
    if (active === null) return;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const tick = () => {
      const ease = smooth ? 0.2 : 1;
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;
      if (popover.current) {
        popover.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  function place(x: number, y: number, snap: boolean) {
    // Keep the popover inside the viewport; flip to the left near the edge.
    let left = x + OFFSET;
    if (left + POPOVER_WIDTH > innerWidth - 16) left = x - OFFSET - POPOVER_WIDTH;
    const top = Math.min(
      Math.max(y - POPOVER_HEIGHT / 2, 16),
      innerHeight - POPOVER_HEIGHT - 16,
    );
    target.current = { x: left, y: top };
    if (snap) current.current = { x: left, y: top };
  }

  return (
    <div className="project-list-wrap">
      <ul className="project-list" onPointerLeave={() => setActive(null)}>
        {projects.map((project, index) => (
          <li
            key={project.id}
            className={active === index ? "project is-active" : "project"}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse" || !canHover()) return;
              place(event.clientX, event.clientY, active === null);
              setActive(index);
            }}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse") return;
              place(event.clientX, event.clientY, false);
            }}
            onFocus={(event) => {
              if (!canHover() || !event.target.matches(":focus-visible")) return;
              const rect = event.currentTarget.getBoundingClientRect();
              place(rect.right - POPOVER_WIDTH / 2, rect.top + rect.height / 2, true);
              setActive(index);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setActive(null);
              }
            }}
          >
            <div className="project-head">
              <h3>{project.title}</h3>
              <p className="project-meta">{project.category}</p>
            </div>
            <div className="project-body">
              <div className="project-thumb">
                <Image
                  src={project.image}
                  alt={`Screenshot of the ${project.title} website`}
                  fill
                  sizes="(max-width: 720px) 100vw, 600px"
                />
              </div>
              <p>{project.description}</p>
              <ul className="tags" aria-label="Built with">
                {project.stack.split(", ").map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              <div className="project-links">
                <a href={project.demo} target="_blank" rel="noreferrer">
                  Live site
                  <span className="visually-hidden">
                    {" "}
                    for {project.title}
                  </span>
                </a>
                <a href={project.source} target="_blank" rel="noreferrer">
                  Source
                  <span className="visually-hidden">
                    {" "}
                    code for {project.title}
                  </span>
                </a>
              </div>
              <details className="project-notes">
                <summary>Build notes</summary>
                <p>{project.detail}</p>
                <dl>
                  {project.outcomes.map((outcome) => (
                    <div key={outcome.label}>
                      <dt>{outcome.label}</dt>
                      <dd>{outcome.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </li>
        ))}
      </ul>
      <div
        ref={popover}
        className={active === null ? "preview" : "preview is-visible"}
        aria-hidden="true"
      >
        <div className="preview-bar">
          <span className="preview-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="preview-url">
            {active === null ? "" : hostOf(projects[active].demo)}
          </span>
        </div>
        <div className="preview-frame">
          {projects.map((project, index) => (
            <Image
              key={project.id}
              src={project.image}
              alt=""
              fill
              sizes={`${POPOVER_WIDTH}px`}
              className={active === index ? "is-current" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
