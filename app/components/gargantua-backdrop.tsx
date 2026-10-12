"use client";

import { useEffect, useRef } from "react";

// The terminal's backdrop: Gargantua as it first appears in Interstellar. A thin,
// almost edge-on accretion disk crosses the screen; light from its far side is bent
// over and under the black hole into a halo; the near side passes in front of the
// shadow. All Canvas 2D, drawn only while the terminal is open.

/** The first open of a visit plays the slow reveal; later opens just fade in. */
let revealed = false;

const TILT = -0.1; // radians: the disk rises toward the right, as in the film.
const FLAT = 0.028; // disk height ÷ width: seen almost exactly edge-on.
const BODY = 0.05; // the glowing body is a little thicker than the filaments.

type Mote = { rho: number; phase: number; speed: number; length: number; alpha: number };

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** `warpAt`: when the terminal's `warp` began (performance.now()), or null. */
export function GargantuaBackdrop({ active, warpAt }: { active: boolean; warpAt: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read by the running animation loop, so a warp never restarts the scene.
  const warpRef = useRef(warpAt);
  useEffect(() => {
    warpRef.current = warpAt;
  }, [warpAt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!active || !canvas || !ctx) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intro = revealed ? 0.9 : 3.6; // seconds
    revealed = true;
    const started = performance.now();
    let width = 0;
    let height = 0;
    let frame = 0;

    // A fixed sky, so resizing never reshuffles the stars.
    const stars = Array.from({ length: 260 }, (_, i) => ({
      x: ((i * 137.508 + 23) % 997) / 997,
      y: ((i * 71.37 + 59) % 991) / 991,
      size: 0.35 + ((i * 7) % 5) * 0.18,
      alpha: 0.12 + ((i * 11) % 9) * 0.06,
      twinkle: (i * 1.7) % 6.28,
    }));
    // Turbulent streaks orbiting in the disk; inner ones move faster (Kepler).
    const motes: Mote[] = Array.from({ length: 900 }, (_, i) => {
      const u = ((i * 0.618034) % 1) ** 1.6;
      return {
        rho: 0.08 + u * 0.92,
        phase: (i * 2.39996) % (Math.PI * 2),
        speed: 0.18 * Math.pow(0.12 / (0.08 + u * 0.92), 1.5) + 0.01,
        length: 0.025 + ((i * 13) % 7) * 0.012,
        alpha: 0.18 + ((i * 17) % 10) * 0.05,
      };
    });

    function resize() {
      if (!canvas || !ctx) return;
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now: number) {
      if (!ctx) return;
      const t = still ? 60 : (now - started) / 1000;
      const p = still ? 1 : t / intro;
      const sky = ease(p * 2.2);
      const hole = ease((p - 0.15) / 0.85);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#010102";
      ctx.fillRect(0, 0, width, height);

      // Warp: seconds since it began. Stars stretch into streaks racing outward.
      const w = warpRef.current === null ? 0 : (now - warpRef.current) / 1000;
      const stretch = w * w * 3;
      for (const s of stars) {
        const flicker = 0.75 + 0.25 * Math.sin(t * 1.3 + s.twinkle);
        ctx.globalAlpha = s.alpha * flicker * sky * (w ? 1.6 : 1);
        if (w) {
          const dx = s.x * width - width / 2;
          const dy = s.y * height - height * 0.64;
          ctx.strokeStyle = "#e8eeff";
          ctx.lineWidth = s.size * 1.4;
          ctx.beginPath();
          ctx.moveTo(
            width / 2 + dx * (1 + stretch * 0.55),
            height * 0.64 + dy * (1 + stretch * 0.55),
          );
          ctx.lineTo(width / 2 + dx * (1 + stretch), height * 0.64 + dy * (1 + stretch));
          ctx.stroke();
          continue;
        }
        ctx.fillStyle = "#dfe6f5";
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      if (hole <= 0) return;

      const r = Math.min(width * 0.085, height * 0.13);
      const outer = Math.min(width * 0.62, r * 7);
      const inner = r * 1.55;
      // A slow dolly in, then a gentle drift that never quite settles.
      // During a warp the camera falls in until the shadow fills the screen.
      const zoom = (0.72 + 0.28 * hole + 0.012 * Math.sin(t * 0.15)) * (1 + w ** 3 * 10);
      ctx.save();
      // Low in the frame, so it shows below the terminal window as well as through it.
      ctx.translate(width / 2, height * 0.64);
      ctx.rotate(TILT + 0.006 * Math.sin(t * 0.11));
      ctx.scale(zoom, zoom);
      // Aim the fall at the shadow just above the disk, not at the disk itself.
      ctx.translate(0, r * 0.55 * Math.min(1, w * 1.4));
      ctx.globalAlpha = hole;

      // Warm haze around the whole system.
      ctx.save();
      ctx.scale(1, 0.32);
      const haze = ctx.createRadialGradient(0, 0, r, 0, 0, outer);
      haze.addColorStop(0, "rgba(214,160,92,0.16)");
      haze.addColorStop(1, "rgba(214,160,92,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(-outer, -outer, outer * 2, outer * 2);
      ctx.restore();

      // Brighter on the left, where the disk turns toward us (Doppler beaming).
      const beam = ctx.createLinearGradient(-outer, 0, outer, 0);
      beam.addColorStop(0, "rgba(196,150,88,0)");
      beam.addColorStop(0.3, "rgba(236,202,148,1)");
      beam.addColorStop(0.5, "rgba(214,174,116,0.85)");
      beam.addColorStop(0.72, "rgba(196,152,96,0.65)");
      beam.addColorStop(1, "rgba(196,150,88,0)");

      // One half of the disk: the far half (behind the hole) or the near half (in front).
      const disk = (near: boolean, boost: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-outer * 1.2, near ? 0 : -outer, outer * 2.4, outer);
        ctx.clip();

        // The glowing body: hot and pale near the hole, cooling to amber at the rim.
        ctx.save();
        ctx.scale(1, BODY);
        const body = ctx.createRadialGradient(0, 0, inner * 0.7, 0, 0, outer);
        body.addColorStop(0, "rgba(255,236,200,0.85)");
        body.addColorStop(0.18, "rgba(238,200,140,0.6)");
        body.addColorStop(0.5, "rgba(196,146,82,0.28)");
        body.addColorStop(1, "rgba(150,100,50,0)");
        ctx.globalAlpha = hole * boost;
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(0, 0, outer, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Fine filaments, brighter on the left where the disk turns toward us.
        ctx.strokeStyle = beam;
        ctx.lineWidth = 1;
        for (let j = 0; j <= 36; j++) {
          const k = j / 36;
          const rx = inner + (outer - inner) * k;
          ctx.globalAlpha =
            hole * boost * 0.07 * Math.pow(1 - k, 1.2) * (0.6 + 0.4 * Math.sin(j * 1.7));
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, rx * FLAT, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Turbulent streaks orbiting at Keplerian speeds.
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = "rgb(250,230,195)";
        for (const m of motes) {
          const a = m.phase + m.speed * t;
          if (Math.sin(a) < 0 === near) continue;
          const rx = inner + (outer - inner) * m.rho;
          const doppler = 1 + 0.5 * -Math.cos(a);
          ctx.globalAlpha = hole * boost * m.alpha * (1 - m.rho * 0.85) * doppler * 0.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, rx * FLAT, 0, a - m.length, a);
          ctx.stroke();
        }
        ctx.restore();
      };

      // 1. The far half of the disk, behind the black hole.
      disk(false, 0.75);

      // 2. The far side's light, lensed into a halo: thick above, thin below.
      const halo = ctx.createConicGradient?.(t * 0.05, 0, 0);
      if (halo) {
        for (let i = 0; i <= 12; i++) {
          const grain = 0.75 + 0.25 * Math.sin(i * 2.7 + 1.3);
          halo.addColorStop(i / 12, `rgba(250,236,212,${grain})`);
        }
      }
      ctx.shadowColor = "rgba(255,226,180,0.6)";
      ctx.shadowBlur = 14;
      for (let k = 0; k <= 16; k++) {
        const f = k / 16;
        ctx.globalAlpha = hole * 0.5 * Math.pow(1 - f, 1.6);
        ctx.strokeStyle = halo ?? "rgb(250,236,212)";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let s = 0; s <= 120; s++) {
          const th = (s / 120) * Math.PI * 2;
          // Canvas y points down, so the top of the ring is where sin θ < 0.
          const thick =
            r *
            (0.06 + 0.16 * Math.max(0, -Math.sin(th)) ** 1.4 + 0.04 * Math.max(0, Math.sin(th)));
          const rr = r * 1.05 + thick * f;
          const x = Math.cos(th) * rr;
          const y = Math.sin(th) * rr * 1.02;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 3. The photon ring, right at the edge of the shadow.
      ctx.globalAlpha = hole * 0.9;
      ctx.strokeStyle = "rgb(255,246,230)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.035, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 4. The shadow itself.
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // 5. The near half of the disk, crossing in front of the shadow.
      ctx.shadowColor = "rgba(255,214,150,0.5)";
      ctx.shadowBlur = 8;
      disk(true, 1.15);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.globalAlpha = 1;

      // The far side of the wormhole: a warm flash as the new page arrives.
      if (w > 0.95) {
        ctx.globalAlpha = Math.min(1, (w - 0.95) * 3.5);
        ctx.fillStyle = "#fff4e2";
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    }

    function tick(now: number) {
      draw(now);
      if (!still) frame = requestAnimationFrame(tick);
    }

    resize();
    addEventListener("resize", resize);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="gargantua" aria-hidden="true" />;
}
