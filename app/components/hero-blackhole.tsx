"use client";

import { useEffect, useRef } from "react";

const visitKey = "aman-portfolio-blackhole-seen-v1";

/** A first-visit, decorative canvas scene. No video or animation dependencies. */
export function HeroBlackhole() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    try {
      if (localStorage.getItem(visitKey)) return;
    } catch {
      // With storage disabled, show the introduction for this visit.
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let recorded = false;
    const started = performance.now();
    // Stable stars keep resizing from generating a different sky.
    const stars = Array.from({ length: 180 }, (_, i) => ({
      x: ((i * 137.508 + 17) % 997) / 997,
      y: ((i * 73.327 + 41) % 991) / 991,
      size: 0.4 + (i % 5) * 0.22,
      brightness: 0.18 + (i % 7) * 0.09,
    }));

    function draw(now: number) {
      if (!ctx || !canvas) return;
      if (!recorded) {
        // Write after the first animation frame so Strict Mode's discarded
        // effect cannot consume the first visit before anything is displayed.
        recorded = true;
        try { localStorage.setItem(visitKey, "true"); } catch {}
      }
      const t = motion.matches ? 0 : (now - started) / 1000;
      const mobile = width < 700;
      const cx = width * (mobile ? 0.57 : 0.73);
      const cy = height * (mobile ? 0.63 : 0.48);
      const radius = Math.min(width * 0.19, height * 0.19, 125);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#050609";
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const x = (star.x * width + t * (2 + star.size)) % width;
        const y = star.y * height;
        if (Math.hypot(x - cx, y - cy) < radius * 1.08) continue;
        ctx.fillStyle = `rgba(219,228,244,${star.brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.09);
      const glow = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 3.6);
      glow.addColorStop(0, "rgba(255,173,83,0.28)");
      glow.addColorStop(0.4, "rgba(179,86,39,0.09)");
      glow.addColorStop(1, "rgba(179,86,39,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-radius * 4, -radius * 4, radius * 8, radius * 8);

      // The far side of the disk, flattened by the viewing angle.
      for (let i = 38; i >= 0; i--) {
        const r = radius * (1.3 + i * 0.042);
        ctx.strokeStyle = `rgba(255,${155 + i * 2},${80 + i * 3},${0.08 + (38 - i) * 0.004})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 9, r, r * 0.19, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Gravitational lensing lifts the glowing disk around the silhouette.
      ctx.shadowColor = "#ffbd75";
      ctx.shadowBlur = 18;
      for (let i = 18; i >= 0; i--) {
        ctx.strokeStyle = `rgba(255,${195 + i * 2},${128 + i * 4},${0.07 + (18 - i) * 0.018})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * (1.04 + i * 0.012), radius * (1.03 + i * 0.014), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#020204";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // A brilliant near-side ribbon passes in front of the event horizon.
      ctx.shadowColor = "#ffa854";
      ctx.shadowBlur = 16;
      for (let i = 0; i < 24; i++) {
        const y = (i - 12) * radius * 0.008;
        const reach = radius * (2.75 - Math.abs(i - 12) * 0.04);
        const band = ctx.createLinearGradient(-reach, 0, reach, 0);
        band.addColorStop(0, "rgba(255,154,61,0)");
        band.addColorStop(0.25, "rgba(255,177,87,0.25)");
        band.addColorStop(0.55, `rgba(255,231,185,${0.45 + 0.12 * Math.sin(t * 0.7 + i)})`);
        band.addColorStop(0.8, "rgba(255,188,113,0.3)");
        band.addColorStop(1, "rgba(255,154,61,0)");
        ctx.strokeStyle = band;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-reach, y + radius * 0.1);
        ctx.bezierCurveTo(-radius, y - radius * 0.04, radius, y - radius * 0.04, reach, y + radius * 0.1);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Orbiting fragments add slow movement to the outer accretion disk.
      for (let i = 0; i < 55; i++) {
        const angle = i * 2.399 + t * (0.09 + (i % 4) * 0.012);
        const r = radius * (1.45 + (i % 13) * 0.085);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * 0.19 + 9;
        if (y < 0 && Math.hypot(x, y) < radius) continue;
        ctx.fillStyle = "rgba(255,220,161,0.55)";
        ctx.fillRect(x, y, 2.2, 0.8);
      }
      ctx.restore();
    }

    function tick(now: number) {
      if (!document.hidden) draw(now);
      if (!motion.matches) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !scene || !ctx) return;
      const rect = scene.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Wait for the animation frame before marking the visit as seen.
      if (recorded) draw(performance.now());
    }

    scene.dataset.active = "true";
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    resize();
    frame = requestAnimationFrame(tick);
    const fade = window.setTimeout(() => {
      scene.dataset.fading = "true";
    }, 8500);
    const finish = window.setTimeout(() => {
      delete scene.dataset.active;
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
      canvas.width = 1;
      canvas.height = 1;
    }, 10500);

    const onMotionChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    motion.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fade);
      clearTimeout(finish);
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
      delete scene.dataset.active;
      delete scene.dataset.fading;
    };
  }, []);

  return (
    <div ref={sceneRef} className="hero-blackhole" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
