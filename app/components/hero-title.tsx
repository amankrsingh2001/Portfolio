"use client";

import { Fragment, type PointerEvent } from "react";

const title = "I build the backend and the interface on top of it.";

export function HeroTitle() {
  function trackPointer(event: PointerEvent<HTMLHeadingElement>) {
    if (event.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heading = event.currentTarget;
    heading.querySelectorAll<HTMLElement>(".hero-title-word").forEach((word, index) => {
      // Measure the stationary wrapper so moving text never shifts its own target.
      const rect = word.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - event.clientX;
      const dy = rect.top + rect.height / 2 - event.clientY;
      const distance = Math.hypot(dx, dy);
      const strength = Math.max(0, 1 - distance / 180);
      const push = strength * strength * 48;
      const angle = distance > 1 ? Math.atan2(dy, dx) : (index % 2 ? -1 : 1) * Math.PI / 4;

      word.style.setProperty("--word-x", `${Math.cos(angle) * push}px`);
      word.style.setProperty("--word-y", `${Math.sin(angle) * push}px`);
      word.style.setProperty("--word-turn", `${Math.cos(angle) * strength * 8}deg`);
    });
  }

  function reset(event: PointerEvent<HTMLHeadingElement>) {
    event.currentTarget.querySelectorAll<HTMLElement>(".hero-title-word").forEach((word) => {
      word.style.setProperty("--word-x", "0px");
      word.style.setProperty("--word-y", "0px");
      word.style.setProperty("--word-turn", "0deg");
    });
  }

  return (
    <h1
      id="hero-heading"
      className="hero-title"
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <span className="visually-hidden">{title}</span>
      {title.split(" ").map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span className="hero-title-word" aria-hidden="true">
            <span className="hero-title-word-text">{word}</span>
          </span>
        </Fragment>
      ))}
    </h1>
  );
}
