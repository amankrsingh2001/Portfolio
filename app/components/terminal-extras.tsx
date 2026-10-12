"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

// Pieces the terminal renders as output lines: live API calls, the easter eggs,
// achievements, the time-dilation clock and the optional sound layer.

/* ---------- JSON, colorized like a real shell ---------- */

export function JsonView({ value, indent = 0 }: { value: unknown; indent?: number }): ReactNode {
  const pad = "  ".repeat(indent + 1);
  const end = "  ".repeat(indent);
  if (value === null) return <span className="json-null">null</span>;
  if (typeof value === "string") return <span className="json-string">&quot;{value}&quot;</span>;
  if (typeof value === "number") return <span className="json-number">{value}</span>;
  if (typeof value === "boolean") return <span className="json-bool">{String(value)}</span>;
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return (
      <>
        [{"\n"}
        {value.map((item, i) => (
          <span key={i}>
            {pad}
            <JsonView value={item} indent={indent + 1} />
            {i < value.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {end}]
      </>
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return "{}";
  return (
    <>
      {"{"}
      {"\n"}
      {entries.map(([key, item], i) => (
        <span key={key}>
          {pad}
          <span className="json-key">&quot;{key}&quot;</span>:{" "}
          <JsonView value={item} indent={indent + 1} />
          {i < entries.length - 1 ? "," : ""}
          {"\n"}
        </span>
      ))}
      {end}
      {"}"}
    </>
  );
}

/** A request the visitor typed (`curl`, `GET`, `POST`), run against this site's /api. */
export function ApiCall({ method, path, body }: { method: string; path: string; body?: string }) {
  const [state, setState] = useState<{
    status?: number;
    ms?: number;
    data?: unknown;
    error?: string;
  }>({});
  useEffect(() => {
    let live = true;
    const started = performance.now();
    fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    })
      .then(async (res) => {
        const text = await res.text();
        let data: unknown = text;
        try {
          data = JSON.parse(text);
        } catch {
          // Not JSON: show it as text.
        }
        if (!live) return;
        setState({ status: res.status, ms: Math.round(performance.now() - started), data });
        // A successful contact message opens the visitor's mail app, filled in.
        const mailto = (data as { mailto?: unknown })?.mailto;
        if (res.ok && typeof mailto === "string" && mailto.startsWith("mailto:")) {
          window.location.href = mailto;
        }
      })
      .catch(() => live && setState({ error: "Network error" }));
    return () => {
      live = false;
    };
  }, [method, path, body]);

  if (state.error) return <span className="term-err">{state.error}</span>;
  if (state.status === undefined)
    return (
      <span className="term-dim">
        {method} {path} …
      </span>
    );
  const ok = state.status < 400;
  return (
    <>
      <span className={ok ? "json-ok" : "term-err"}>HTTP {state.status}</span>
      <span className="term-dim">
        {" "}
        · {state.ms}ms · {method} {path}
      </span>
      {"\n"}
      {typeof state.data === "string" ? state.data : <JsonView value={state.data} />}
    </>
  );
}

/** `ask <question>`: Claude when the server has a key, the portfolio data otherwise. */
export function AskAnswer({ question }: { question: string }) {
  const [answer, setAnswer] = useState<{ text: string; source?: string } | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })
      .then((res) => res.json())
      .then((data) => live && setAnswer({ text: data.answer ?? data.error, source: data.source }))
      .catch(() => live && setAnswer({ text: "Couldn't reach the server." }));
    return () => {
      live = false;
    };
  }, [question]);
  if (!answer) return <span className="term-dim">thinking…</span>;
  return (
    <>
      {answer.text}
      {answer.source && (
        <span className="term-dim">
          {"\n"}— answered from {answer.source}
        </span>
      )}
    </>
  );
}

type GitHub = {
  url: string;
  publicRepos: number;
  followers: number;
  memberSince: string;
  topLanguages: { language: string; repos: number }[];
  recentlyPushed: { name: string; url: string; language: string | null; pushedAt: string }[];
  error?: string;
};

/** `github`: live stats from /api/github, with a bar per language. */
export function GithubStats() {
  const [data, setData] = useState<GitHub | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/github")
      .then((res) => res.json())
      .then((json) => live && setData(json))
      .catch(() => live && setData({ error: "Couldn't reach GitHub." } as GitHub));
    return () => {
      live = false;
    };
  }, []);
  if (!data) return <span className="term-dim">fetching github.com…</span>;
  if (data.error) return <span className="term-err">{data.error}</span>;
  const most = Math.max(...data.topLanguages.map((l) => l.repos), 1);
  return (
    <>
      <a href={data.url} target="_blank" rel="noreferrer">
        {data.url.replace("https://", "")}
      </a>
      {`\n${data.publicRepos} public repos · ${data.followers} followers · on GitHub since ${data.memberSince}\n\n`}
      {data.topLanguages.map((l) => (
        <span key={l.language}>
          {l.language.padEnd(12)}
          <span className="term-accent">
            {"█".repeat(Math.max(1, Math.round((l.repos / most) * 20)))}
          </span>{" "}
          {l.repos}
          {"\n"}
        </span>
      ))}
      {"\nRecently pushed\n"}
      {data.recentlyPushed.map((r) => (
        <span key={r.name}>
          {"  "}
          <a href={r.url} target="_blank" rel="noreferrer">
            {r.name}
          </a>
          <span className="term-dim">
            {" "}
            · {r.language ?? "—"} · {r.pushedAt}
          </span>
          {"\n"}
        </span>
      ))}
    </>
  );
}

/* ---------- Easter eggs ---------- */

const RING = ["◜ ◝", " ◝◞", "◟ ◞", "◜◟ "];

/** `docking`: the Endurance spin-up, line by line. */
export function Docking() {
  const [step, setStep] = useState(0);
  const [rpm, setRpm] = useState(0);
  useEffect(() => {
    const spin = setInterval(() => setRpm((r) => Math.min(68, r + 3)), 120);
    const lines = setInterval(() => setStep((s) => s + 1), 900);
    return () => {
      clearInterval(spin);
      clearInterval(lines);
    };
  }, []);
  const script = [
    "CASE: Endurance rotation is 67, 68 RPM.",
    "COOPER: Get ready to match our spin with the retro thrusters.",
    "CASE: It's not possible.",
    "COOPER: No. It's necessary.",
    "TARS: Docking complete. ✓",
  ];
  return (
    <>
      <span className="term-accent">
        {RING[rpm % RING.length]} ENDURANCE · {String(rpm).padStart(2, "0")} RPM
      </span>
      {"\n"}
      {script.slice(0, step).join("\n")}
    </>
  );
}

const TARS_LINES: Record<"low" | "mid" | "high", string[]> = {
  low: ["Humor setting low. I will now only state facts.", "Aman ships. That is a fact."],
  mid: [
    "Everybody good? Great. Aman's API is up, and so is my humor setting.",
    "I have a cue light I can use to show you when I'm joking, if you like.",
  ],
  high: [
    "Aman's code is so clean, the linter asked him for advice.",
    "I'd tell you a UDP joke, but you might not get it.",
  ],
};

/** `tars [humor|honesty] [0-100]`. */
export function tarsReply(setting: string, value: number | null, humor: number) {
  if (setting === "honesty" && value !== null) {
    return value < 90
      ? `Honesty ${value}%. Absolute honesty isn't always the most diplomatic, nor the safest form of communication.`
      : `Honesty ${value}%. Fine: Aman is a good hire.`;
  }
  const level = humor < 40 ? "low" : humor < 80 ? "mid" : "high";
  const lines = TARS_LINES[level];
  const prefix = setting === "humor" && value !== null ? `Humor set to ${value}%. ` : "";
  return `${prefix}${lines[Math.floor(Math.random() * lines.length)]}`;
}

export const COFFEE = `      ( (
       ) )
    ........
    |      |]
    \\      /
     \`----'
Brewing… done. Productivity +12%.`;

/** Morse for STAY, as Murph decoded it. */
export const STAY = "...  -  .-  -.--\nS    T  A   Y\nIt was the watch all along.";

/** `matrix`: green rain over the terminal for a few seconds. */
export function MatrixRain({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const size = 14;
    const drops = Array.from({ length: Math.ceil(rect.width / size) }, () => Math.random() * -40);
    const glyphs = "アカサタナハマヤラワ0123456789ABCDEF<>{}=/".split("");
    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.96 ? "#d6ffe0" : "#30e070";
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
        drops[i] = y * size > canvas.height && Math.random() > 0.97 ? 0 : y + 1;
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const stop = setTimeout(onDone, 6000);
    const onKey = () => onDone();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);
  return <canvas ref={ref} className="matrix-rain" aria-hidden="true" />;
}

/* ---------- Achievements ---------- */

export const ACHIEVEMENTS = {
  hello: { title: "Hello, world", hint: "Run your first command" },
  explorer: { title: "Explorer", hint: "Visit every page from the terminal" },
  backend: { title: "Backend curious", hint: "Call the API" },
  curious: { title: "Curious mind", hint: "Ask a question" },
  wormhole: { title: "Wormhole traveler", hint: "Warp somewhere" },
  docking: { title: "No time for caution", hint: "Dock with the Endurance" },
  tars: { title: "Cue light", hint: "Talk to TARS" },
  matrix: { title: "Red pill", hint: "Enter the Matrix" },
  coffee: { title: "Fueled", hint: "Brew something" },
  historian: { title: "Historian", hint: "Read the git log" },
  stay: { title: "STAY", hint: "Decode Murph's message" },
  recruiter: { title: "Root access", hint: "Hire with sudo" },
} as const;
export type AchievementId = keyof typeof ACHIEVEMENTS;

const ACHIEVEMENT_KEY = "aman-portfolio-achievements";

export function readAchievements(): AchievementId[] {
  try {
    const saved = JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((id) => id in ACHIEVEMENTS) : [];
  } catch {
    return [];
  }
}

/** Records an achievement; returns true only the first time. */
export function unlock(id: AchievementId) {
  const have = readAchievements();
  if (have.includes(id)) return false;
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify([...have, id]));
  } catch {
    // Storage blocked: still celebrate this once.
  }
  return true;
}

/* ---------- Time dilation (Miller's planet: 1 hour = 7 years) ---------- */

const DILATION = 7 * 365.25 * 24; // Earth hours per hour on Miller's planet.
const loaded = typeof performance === "undefined" ? 0 : performance.now();
const tick = (notify: () => void) => {
  const id = setInterval(notify, 1000);
  return () => clearInterval(id);
};

function earthTime(seconds: number) {
  const hours = (seconds * DILATION) / 3600;
  const years = Math.floor(hours / 8766);
  const days = Math.floor((hours % 8766) / 24);
  const h = Math.floor(hours % 24);
  return years ? `${years}y ${days}d` : days ? `${days}d ${h}h` : `${h}h`;
}

/** How much Earth time has passed while the visitor has been here, Miller-style. */
export function TimeDilation() {
  const seconds = useSyncExternalStore(
    tick,
    () => Math.floor((performance.now() - loaded) / 1000),
    () => 0,
  );
  return (
    <span className="term-dilation" title="On Miller's planet, 1 hour here is 7 years on Earth">
      Earth +{earthTime(seconds)}
    </span>
  );
}

/* ---------- Sound (off unless the visitor turns it on) ---------- */

const SOUND_KEY = "aman-portfolio-sound";
const SOUND_EVENT = "portfolio-sound-change";
let audio: AudioContext | null = null;
let drone: { stop: () => void } | null = null;

export function soundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // Applies for this visit only.
  }
  if (!on) stopDrone();
  window.dispatchEvent(new Event(SOUND_EVENT));
}

const onSoundChange = (notify: () => void) => {
  window.addEventListener(SOUND_EVENT, notify);
  return () => window.removeEventListener(SOUND_EVENT, notify);
};

/** Whether sound is on, kept in sync with `sound on|off` and the title-bar button. */
export function useSound() {
  return useSyncExternalStore(onSoundChange, soundEnabled, () => false);
}

function context() {
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

/** A soft keyboard tick. */
export function tickSound() {
  if (!soundEnabled()) return;
  const ctx = context();
  const length = Math.floor(ctx.sampleRate * 0.015);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 2400 + Math.random() * 800;
  gain.gain.value = 0.05;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

/** A low organ chord under the black hole, swelling slowly. */
export function startDrone() {
  if (!soundEnabled() || drone) return;
  const ctx = context();
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  lfo.frequency.value = 0.07;
  lfoDepth.gain.value = 300;
  lfo.connect(lfoDepth).connect(filter.frequency);
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
  filter.connect(master).connect(ctx.destination);
  const voices = [55, 82.41, 110, 164.81, 220].map((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i % 2 ? "triangle" : "sine";
    osc.frequency.value = freq;
    osc.detune.value = (i - 2) * 3;
    gain.gain.value = 0.32 / (i + 1);
    osc.connect(gain).connect(filter);
    osc.start();
    return osc;
  });
  lfo.start();
  drone = {
    stop: () => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
      [...voices, lfo].forEach((osc) => osc.stop(now + 0.9));
    },
  };
}

export function stopDrone() {
  drone?.stop();
  drone = null;
}
