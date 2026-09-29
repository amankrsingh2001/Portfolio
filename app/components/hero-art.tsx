"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Decorative scene: a developer at a PC with code rising out of the screen.
// Colors come from the --illo-* tokens in globals.css so it follows the theme.
//
// Easter egg: disturb him (hover or tap) and he notices, turns around, tosses
// the keyboard over his shoulder, enjoys the quiet, then goes back to work.
// Every body part has its own keyframes on one shared timeline (--play in CSS),
// so the parts overlap and settle at different times instead of moving as one.

/** Total length of the sequence. Must match --play in globals.css. */
const PLAY_MS = 2900;
/** Reduced motion: he only glances back for this long. */
const GLANCE_MS = 1400;

type State = "idle" | "playing" | "glance";

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

  return (
    <div className="hero-art" data-state={state} aria-hidden="true">
      <svg viewBox="0 0 520 420" role="presentation">
        {/* soft screen glow */}
        <defs>
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
        <g className="illo-code">
          {codeLines.map((line, index) => (
            <rect
              key={index}
              className={`illo-line tone-${line.tone}`}
              x={line.x}
              y={138 + index * 16}
              width={line.w}
              height="6"
              rx="3"
              style={{ animationDelay: `${index * 0.45}s` }}
            />
          ))}
          <rect className="illo-cursor" x="262" y="234" width="7" height="10" rx="1" />
        </g>

        {/* mug with steam */}
        <path className="illo-steam" d="M462 256c-6-8 6-12 0-20" />
        <path className="illo-steam steam-2" d="M474 258c-6-8 6-12 0-20" />
        <rect className="illo-mug" x="452" y="266" width="28" height="34" rx="6" />
        <path className="illo-mug-handle" d="M480 274h5a7 7 0 0 1 0 14h-5" />

        {/* keyboard on the desk */}
        <rect className="illo-keyboard" x="150" y="292" width="120" height="8" rx="3" />

        {/* developer: breathing wrapper, then independently animated parts */}
        <g className="illo-person">
          <g className="illo-torso">
            <path
              className="illo-hoodie"
              d="M78 312c0-54 12-92 52-96h6c40 4 52 42 52 96z"
            />
            {/* the hood reads from behind, the drawstrings from the front */}
            <path className="illo-hood" d="M110 224q23 16 46 0" />
            <path className="illo-strings" d="M126 226l-2 20M141 226l2 20" />
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
                d="M98 172c0-22 15-36 35-36 19 0 34 13 34 34v14c0 8-3 15-8 20 1-11-1-21-7-28-13 0-29-3-40-11-5 3-10 5-14 7z"
              />
              <ellipse className="illo-skin" cx="160" cy="182" rx="5" ry="8" />
              <path className="illo-feature thin" d="M100 186q-3 4 1 6" />
              {/* "really?" */}
              <g className="face-deadpan">
                <path className="illo-feature" d="M105 172h11M124 172h9" />
                <ellipse className="illo-eye" cx="111" cy="180" rx="2.6" ry="1.8" />
                <ellipse className="illo-eye" cx="129" cy="180" rx="2.3" ry="1.7" />
                <path className="illo-feature" d="M111 198h12" />
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
          </g>
        </g>

        {/* chair: swivels a touch behind the turn */}
        <g className="illo-chair-set">
          <rect className="illo-chair" x="70" y="262" width="126" height="92" rx="16" />
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
      <p className="art-hint">Psst… don&apos;t disturb the developer.</p>
    </div>
  );
}
