"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";

// Interactive desk: cursor-following eyes, a keyboard-toss interruption,
// a successful-build celebration, and a coffee break.
// Colors come from the --illo-* tokens in globals.css so it follows the theme.
//
// Easter egg: disturb him (hover or tap) and he notices, tosses
// the keyboard over his shoulder, enjoys the quiet, then goes back to work.
// Every body part has its own keyframes on one shared timeline (--play in CSS),
// so the parts overlap and settle at different times instead of moving as one.

/** Total length of the sequence. Must match --play in globals.css. */
const PLAY_MS = 2900;
/** Reduced motion: he only glances back for this long. */
const GLANCE_MS = 1400;

type State = "idle" | "playing" | "glance" | "shipping" | "coffee";

const floaters = [
  { text: "</>", x: 232, dx: "-30px", delay: "0s" },
  { text: "{ }", x: 300, dx: "10px", delay: "0.8s" },
  { text: "=>", x: 372, dx: "34px", delay: "1.6s" },
  { text: "01", x: 262, dx: "-12px", delay: "2.4s" },
  { text: "fn()", x: 340, dx: "22px", delay: "3.2s" },
  { text: "<div>", x: 214, dx: "-40px", delay: "4s" },
  { text: "API", x: 396, dx: "40px", delay: "4.8s" },
  { text: ";", x: 318, dx: "0px", delay: "5.6s" },
];

const codeLines = [
  { x: 214, w: 60, tone: "accent" },
  { x: 226, w: 110, tone: "ink" },
  { x: 226, w: 84, tone: "soft" },
  { x: 238, w: 120, tone: "ink" },
  { x: 238, w: 70, tone: "accent" },
  { x: 226, w: 96, tone: "soft" },
  { x: 214, w: 40, tone: "accent" },
];

export function HeroArt() {
  const [state, setState] = useState<State>("idle");
  const playing = useRef(false);
  // Re-arms only after the pointer leaves, so hovering in place never loops.
  const armed = useRef(true);
  const timer = useRef<number | undefined>(undefined);
  const scene = useRef<HTMLDivElement>(null);
  const gradientId = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  function disturb() {
    if (playing.current || !armed.current) return;
    playing.current = true;
    armed.current = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setState(reduced ? "glance" : "playing");
    timer.current = window.setTimeout(
      () => {
        playing.current = false;
        setState("idle");
      },
      reduced ? GLANCE_MS : PLAY_MS,
    );
  }

  function react(next: "shipping" | "coffee") {
    clearTimeout(timer.current);
    playing.current = true;
    setState(next);
    timer.current = window.setTimeout(() => {
      playing.current = false;
      setState("idle");
    }, next === "shipping" ? 3600 : 2800);
  }

  function look(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--gaze-x", `${x * 5}px`);
    event.currentTarget.style.setProperty("--gaze-y", `${y * 3}px`);
    event.currentTarget.style.setProperty("--look-turn", `${x * 5}deg`);
    event.currentTarget.style.setProperty("--desk-x", `${x * 7}px`);
    event.currentTarget.style.setProperty("--desk-y", `${y * 5}px`);
  }

  const message = state === "shipping" ? "All checks passed. Ship it!"
    : state === "coffee" ? "Coffee first. Code next."
    : state === "playing" || state === "glance" ? "Hey! I was in the zone."
    : "A tiny developer. A very real deadline.";

  return (
    <div ref={scene} className="hero-art" data-state={state} onPointerMove={look}
      onPointerLeave={() => {
        scene.current?.style.setProperty("--gaze-x", "0px");
        scene.current?.style.setProperty("--gaze-y", "0px");
        scene.current?.style.setProperty("--look-turn", "0deg");
        scene.current?.style.setProperty("--desk-x", "0px");
        scene.current?.style.setProperty("--desk-y", "0px");
        armed.current = true;
      }} style={{ "--hoodie-fill": `url(#${gradientId}-hoodie)`, "--chair-fill": `url(#${gradientId}-chair)` } as CSSProperties}>
      <div className="hero-desk">
      <svg viewBox="0 0 520 420" aria-hidden="true">
        {/* soft screen glow */}
        <defs>
          <linearGradient id={`${gradientId}-hoodie`} x1="0" y1="0" x2="1" y2="1">
            <stop className="hoodie-highlight" />
            <stop offset="1" className="hoodie-shade" />
          </linearGradient>
          <linearGradient id={`${gradientId}-chair`} x1="0" y1="0" x2="1" y2="1">
            <stop className="chair-highlight" />
            <stop offset="1" className="chair-shade" />
          </linearGradient>
          <radialGradient id="illo-glow-fill">
            <stop offset="0%" className="illo-glow-stop" />
            <stop offset="100%" className="illo-glow-stop" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          className="illo-glow"
          cx="315"
          cy="190"
          rx="190"
          ry="140"
          fill="url(#illo-glow-fill)"
        />

        {/* code rising out of the screen */}
        <g className="illo-floaters">
          {floaters.map((item) => (
            <text
              key={item.text + item.x}
              x={item.x}
              y="128"
              className="illo-float"
              style={
                { "--dx": item.dx, animationDelay: item.delay } as CSSProperties
              }
            >
              {item.text}
            </text>
          ))}
        </g>

        {/* desk */}
        <rect className="illo-desk" x="30" y="300" width="460" height="12" rx="6" />
        <rect className="illo-desk" x="60" y="312" width="10" height="90" rx="3" />
        <rect className="illo-desk" x="450" y="312" width="10" height="90" rx="3" />

        {/* monitor */}
        <rect className="illo-bezel" x="300" y="266" width="30" height="26" />
        <rect className="illo-bezel" x="268" y="290" width="94" height="10" rx="5" />
        <rect className="illo-bezel" x="192" y="112" width="246" height="160" rx="12" />
        <rect className="illo-screen" x="202" y="122" width="226" height="140" rx="6" />
        <g className="monitor-chrome">
          <circle cx="213" cy="132" r="2" />
          <circle cx="221" cy="132" r="2" />
          <circle cx="229" cy="132" r="2" />
          <text x="415" y="134" textAnchor="end">aman / workspace</text>
          <path d="M208 139h214" />
        </g>
        <g className="illo-code">
          {codeLines.map((line, index) => (
            <rect
              key={index}
              className={`illo-line tone-${line.tone}`}
              x={line.x}
              y={150 + index * 14}
              width={line.w}
              height="6"
              rx="3"
              style={{ animationDelay: `${index * 0.45}s` }}
            />
          ))}
          <rect className="illo-cursor" x="262" y="234" width="7" height="10" rx="1" />
        </g>
        <g className="ship-terminal">
          <circle className="ship-check-ring" cx="315" cy="178" r="19" />
          <path className="ship-check" d="m306 178 6 6 13-14" />
          <text className="terminal-title" x="315" y="217" textAnchor="middle">BUILD SUCCESSFUL</text>
          <text className="terminal-sub" x="315" y="238" textAnchor="middle">a little win. a little dance.</text>
        </g>
        <g className="coffee-terminal">
          <text className="coffee-symbol" x="315" y="184" textAnchor="middle">☕</text>
          <text className="terminal-title" x="315" y="217" textAnchor="middle">RECHARGING...</text>
          <rect className="coffee-progress-track" x="269" y="235" width="92" height="4" rx="2" />
          <rect className="coffee-progress" x="269" y="235" width="92" height="4" rx="2" />
        </g>
        <g className="ship-confetti">
          {Array.from({ length: 18 }, (_, i) => (
            <rect key={i} x="312" y="105" width="4" height="7" rx="1"
              style={{ "--confetti-x": `${Math.cos(i * 2.4) * (70 + i * 4)}px`, "--confetti-y": `${-30 - (i % 6) * 20}px`, "--confetti-turn": `${i * 75}deg`, "--confetti-delay": `${(i % 4) * 70}ms` } as CSSProperties} />
          ))}
        </g>

        {/* mug with steam */}
        <path className="illo-steam" d="M462 256c-6-8 6-12 0-20" />
        <path className="illo-steam steam-2" d="M474 258c-6-8 6-12 0-20" />
        <g className="desk-mug">
          <rect className="illo-mug" x="452" y="266" width="28" height="34" rx="6" />
          <path className="illo-mug-handle" d="M480 274h5a7 7 0 0 1 0 14h-5" />
          <path className="mug-mark" d="m460 277-3 4 3 4m12-8 3 4-3 4m-6-9-2 10" />
        </g>
        <path className="coffee-heart" d="M466 247c-18-12-7-24 0-15 7-9 18 3 0 15z" />

        {/* keyboard on the desk */}
        <rect className="illo-keyboard" x="150" y="292" width="120" height="8" rx="3" />

        {/* developer: breathing wrapper, then independently animated parts */}
        <g className="illo-person">
          <g className="illo-wave">
            <path className="illo-hoodie" d="M103 231 85 220 75 185 62 190 70 230 96 250z" />
            <path className="illo-skin" d="M62 190c-3-8-8-17-4-19 3-2 5 7 7 8-1-9-3-19 1-20 4-1 3 11 5 16 0-9 1-16 4-15 4 1 1 13 2 18 4-7 6-9 8-7 3 3-4 14-10 18z" />
          </g>
          <g className="illo-torso">
            <path
              className="illo-hoodie"
              d="M78 312c0-54 12-92 52-96h6c40 4 52 42 52 96z"
            />
            {/* the hood reads from behind, the drawstrings from the front */}
            <path className="illo-hood" d="M110 224q23 16 46 0" />
            <path className="illo-strings" d="M126 226l-2 20M141 226l2 20" />
            <path className="hoodie-seam" d="M91 250q-4 19-4 32m86-30 7 26" />
          </g>
          <g className="illo-arm">
            <path
              className="illo-hoodie"
              d="M168 236c14 12 26 34 36 54l-14 8c-12-18-24-36-32-50z"
            />
            {/* the keyboard while it's in his hand; lags a little for weight */}
            <rect className="kbd-held" x="150" y="292" width="120" height="8" rx="3" />
            <ellipse className="illo-skin" cx="200" cy="294" rx="10" ry="6" />
          </g>
          <g className="illo-head">
            <rect className="illo-skin" x="122" y="198" width="22" height="22" rx="6" />
            <g className="illo-back">
              <circle className="illo-hair" cx="133" cy="172" r="34" />
              <ellipse className="illo-skin" cx="167" cy="178" rx="5" ry="8" />
            </g>
            {/* three-quarter view, glancing back over his left shoulder */}
            <g className="illo-face">
              <circle className="illo-skin" cx="131" cy="175" r="32" />
              <path
                className="illo-hair"
                d="M98 172c-5-16 5-29 15-31l-3-7c10 1 16-1 23-3 7-2 13 1 17 5 18 4 24 20 19 39l-10 29c0-14-1-22-8-30-15 1-24-2-37-10-4 5-9 8-16 8z"
              />
              <ellipse className="illo-skin" cx="160" cy="182" rx="5" ry="8" />
              <path className="illo-feature thin" d="M100 186q-3 4 1 6" />
              {/* "really?" */}
              <g className="face-deadpan">
                <path className="illo-feature" d={state === "playing" || state === "glance" ? "M105 172h11M124 172h9" : "M105 171q5-3 11 0M124 171q5-3 10 0"} />
                <g className="illo-gaze">
                  <ellipse className="eye-white" cx="111" cy="180" rx="4.4" ry="5" />
                  <ellipse className="eye-white" cx="130" cy="180" rx="4.4" ry="5" />
                  <g className="illo-pupils">
                    <ellipse className="illo-eye" cx="112" cy="180" rx="2.3" ry="3.1" />
                    <ellipse className="illo-eye" cx="131" cy="180" rx="2.3" ry="3.1" />
                    <circle className="eye-white" cx="112.8" cy="179" r="0.8" />
                    <circle className="eye-white" cx="131.8" cy="179" r="0.8" />
                  </g>
                </g>
                <path className="illo-feature" d={state === "playing" || state === "glance" ? "M111 198h12" : "M111 195q8 8 16-1"} />
              </g>
              {/* "finally, some peace and quiet" */}
              <g className="face-content">
                <path className="illo-feature" d="M105 170q5-2 10 0M124 170q4-2 9 0" />
                <path className="illo-feature" d="M107 180q4 3 8 0M125 180q4 3 7 0" />
                <path className="illo-feature" d="M110 195q7 5 14 0" />
              </g>
            </g>
            {/* headphones */}
            <path className="illo-phones" d="M100 170a33 33 0 0 1 66 0" />
            <rect className="illo-phones-cup" x="160" y="164" width="12" height="22" rx="6" />
            <rect className="headphone-inlay" x="163" y="168" width="4" height="14" rx="2" />
            <path className="headphone-mic" d="M167 182q0 12-16 13" />
            <rect className="illo-phones-cup" x="145" y="192" width="8" height="5" rx="2" />
          </g>
        </g>

        {/* chair: swivels a touch behind the turn */}
        <g className="illo-chair-set">
          <rect className="illo-chair" x="70" y="262" width="126" height="92" rx="16" />
          <path className="chair-stitch" d="M82 283v49q0 10 10 10h82q10 0 10-10v-49" />
          <rect className="chair-badge" x="118" y="273" width="30" height="4" rx="2" />
          <rect className="illo-chair" x="128" y="354" width="10" height="36" />
          <rect className="illo-chair" x="96" y="388" width="74" height="8" rx="4" />
        </g>

        {/* the tossed keyboard: an arc (outer) and a tumble (inner). It starts
            exactly where the held keyboard is at the moment of release. */}
        <ellipse className="kbd-shadow" cx="58" cy="412" rx="58" ry="3" />
        <g className="kbd-arc">
          <g className="kbd-spin">
            <rect className="kbd-fly" x="82.96" y="163.18" width="120" height="8" rx="3" />
          </g>
        </g>
        <circle className="kbd-dust" cx="4" cy="406" r="3" />
        <circle className="kbd-dust dust-2" cx="112" cy="406" r="3" />

        {/* invisible target: the developer */}
        <rect
          className="illo-hit"
          x="60"
          y="120"
          width="160"
          height="280"
          onPointerEnter={disturb}
          onPointerLeave={() => {
            armed.current = true;
          }}
          onClick={() => {
            armed.current = true;
            disturb();
          }}
        />
      </svg>
      <button className="screen-trigger" type="button" aria-label="Ship the code on the developer’s screen" onClick={() => react("shipping")} disabled={state === "shipping"} />
      </div>
      <p className="art-hint" role="status">{message}</p>
      <div className="desk-controls" role="group" aria-label="Interact with the developer">
        <button type="button" onClick={() => { armed.current = true; disturb(); }} disabled={state !== "idle"}>Say hi <span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => react("shipping")} disabled={state === "shipping"}>Ship it <span aria-hidden="true">✓</span></button>
        <button type="button" onClick={() => react("coffee")} disabled={state === "coffee"}>Coffee break <span aria-hidden="true">☕</span></button>
      </div>
    </div>
  );
}
