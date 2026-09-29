import type { CSSProperties } from "react";

// Decorative, CSS-animated scene: a developer at a PC with code rising out of the screen.
// Colors come from the --illo-* tokens in globals.css so it follows the theme.

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
  return (
    <div className="hero-art" aria-hidden="true">
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

        {/* keyboard */}
        <rect className="illo-keyboard" x="150" y="292" width="120" height="8" rx="3" />

        {/* developer, seen from behind */}
        <g className="illo-person">
          <path
            className="illo-hoodie"
            d="M78 312c0-54 12-92 52-96h6c40 4 52 42 52 96z"
          />
          <g className="illo-arm">
            <path className="illo-hoodie" d="M168 236c14 12 26 34 36 54l-14 8c-12-18-24-36-32-50z" />
            <ellipse className="illo-skin" cx="200" cy="294" rx="10" ry="6" />
          </g>
          <g className="illo-head">
            <rect className="illo-skin" x="122" y="198" width="22" height="22" rx="6" />
            <circle className="illo-hair" cx="133" cy="172" r="34" />
            <ellipse className="illo-skin" cx="167" cy="178" rx="5" ry="8" />
            {/* headphones */}
            <path className="illo-phones" d="M100 170a33 33 0 0 1 66 0" />
            <rect className="illo-phones-cup" x="160" y="164" width="12" height="22" rx="6" />
          </g>
        </g>

        {/* chair */}
        <rect className="illo-chair" x="70" y="262" width="126" height="92" rx="16" />
        <rect className="illo-chair" x="128" y="354" width="10" height="36" />
        <rect className="illo-chair" x="96" y="388" width="74" height="8" rx="4" />
      </svg>
    </div>
  );
}
