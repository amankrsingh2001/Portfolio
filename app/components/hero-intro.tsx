"use client";

import { Fragment, useState } from "react";
import { portfolio } from "../data/portfolio";

const intro = portfolio.heroIntro;

export function HeroIntro() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const active = hovered ?? focused ?? selected;
  const detail = active === null ? null : intro.details[active];

  return (
    <div className="hero-intro">
      <p className="hero-intro-opening">
        {intro.opening} <em>{intro.emphasis}<svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3 8Q56 0 117 6M16 11Q64 5 104 9" /></svg></em>
      </p>
      <p className="hero-lead">
        {intro.lead}{" "}
        {intro.details.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (index === intro.details.length - 1 ? ", and " : ", ")}
            <button
              type="button"
              className="intro-keyword"
              data-active={active === index}
              aria-pressed={selected === index}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(index); }}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setFocused(index)}
              onBlur={() => setFocused(null)}
              onClick={() => setSelected((current) => current === index ? null : index)}
            >{item.label}</button>
          </Fragment>
        ))}{" "}{intro.closing}
      </p>
      <div className="intro-footnote" data-active={active !== null}>
        <span className="intro-spark" aria-hidden="true">✳</span>
        <div className="intro-footnote-content" key={active ?? "default"}>
          <span className="intro-flow" aria-hidden="true">
            {(detail?.flow ?? ["idea", "build", "ship"]).map((step, index) => (
              <Fragment key={step}>{index > 0 && <span className="intro-arrow">→</span>}<span>{step}</span></Fragment>
            ))}
          </span>
          <span className="intro-note">{detail?.note ?? "From the first request to the last pixel."}</span>
        </div>
      </div>
    </div>
  );
}
