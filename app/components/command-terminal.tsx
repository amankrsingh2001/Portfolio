"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { portfolio } from "../data/portfolio";
import { findRoute, routes, terminalEvents, type Route } from "../data/routes";
import { levels, places, skillTree, type Level, type SkillNode } from "../data/skill-tree";
import { track } from "../lib/track";
import { GargantuaBackdrop } from "./gargantua-backdrop";
import {
  ACHIEVEMENTS,
  AskAnswer,
  COFFEE,
  ApiCall,
  Docking,
  GithubStats,
  MatrixRain,
  STAY,
  TimeDilation,
  readAchievements,
  setSound,
  startDrone,
  stopDrone,
  tarsReply,
  tickSound,
  unlock,
  useSound,
  type AchievementId,
} from "./terminal-extras";
import { setTheme, type Choice } from "./theme-switch";

// The site-wide terminal. ⌘K / Ctrl+K (or the header button) opens it from any page.
// Page names navigate (`about`, `resume`, `cd projects`), skill commands read the same
// data the skill tree renders, `cat` opens a skill in the tree, `curl` calls the site's
// real /api, and a few commands are only listed as achievement hints.

type Line = { id: number; kind: "in" | "out" | "err"; body: ReactNode };
type Failure = { err: string };
type Output = ReactNode | Failure;
type Skill = { node: SkillNode; path: string[] };

const PROMPT = "aman@portfolio:~$";
const fail = (err: string): Failure => ({ err });
const isFailure = (out: Output): out is Failure =>
  typeof out === "object" && out !== null && "err" in out;

const GROUPS: { title: string; commands: [string, string][] }[] = [
  {
    title: "Go to",
    commands: [
      ...routes.map((route): [string, string] => [route.aliases[0], route.hint]),
      ["cd <page>", "Same thing: cd about"],
    ],
  },
  {
    title: "Skills",
    commands: [
      ["ls [skills|<category>]", "List pages, categories or one category"],
      ["tree", "Print the whole skill tree"],
      ["cat <skill>", "Show a skill and open it in the tree"],
      ["grep <text>", "Search skills"],
      ["level <level>", `Skills at a level: ${Object.keys(levels).join(", ")}`],
      ["leveling", "What I'm learning right now"],
    ],
  },
  {
    title: "Me",
    commands: [
      ["whoami", "Who I am"],
      ["hello <name> @ <company>", "Introduce yourself (optional)"],
      ["email", "Write to me"],
      ["linkedin", "Open my profile"],
      ["resume --download", "Download the PDF"],
      ["resume --terminal", "My résumé as a terminal session (prints cleanly)"],
    ],
  },
  {
    title: "API — real endpoints on this site",
    commands: [
      ["curl /api", "List the endpoints"],
      ["GET /api/skills?level=advanced", "Any GET, with query strings"],
      ['POST /api/contact {"name":"…","message":"…"}', "Send me a message"],
      ["ask <question>", "Ask about my work"],
      ["github", "Live GitHub stats (github --open for the profile)"],
    ],
  },
  {
    title: "Fun",
    commands: [
      ["warp <page>", "Travel there through the black hole"],
      ["achievements", "What you've found (some commands are hidden)"],
      ["sound [on|off]", "Organ drone and key clicks, off by default"],
    ],
  },
  {
    title: "Terminal",
    commands: [
      ["theme [light|dark|system]", "Switch the color theme"],
      ["history", "Commands you've run"],
      ["clear", "Clear the screen (Ctrl+L)"],
      ["zoom", "Fill the screen, or back (double-click the title bar)"],
      ["minimize", "Park it in the corner"],
      ["exit", "Close (Esc)"],
    ],
  },
];

const QUICK = ["about", "projects", "skills", "resume", "contact", "help"];
const THEMES: Choice[] = ["light", "dark", "system"];

/** Lowercase and strip punctuation, keeping + and # so C++ and C# stay distinct. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

function flatten(node: SkillNode, path: string[] = [], out: Skill[] = []) {
  for (const child of node.children ?? []) {
    out.push({ node: child, path });
    flatten(child, [...path, child.name], out);
  }
  return out;
}

function treeLines(node: SkillNode, prefix = ""): string[] {
  const kids = node.children ?? [];
  return kids.flatMap((child, i) => {
    const last = i === kids.length - 1;
    const tag = child.level ? `  [${levels[child.level].label.toLowerCase()}]` : "";
    return [
      `${prefix}${last ? "└── " : "├── "}${child.name}${tag}`,
      ...treeLines(child, `${prefix}${last ? "    " : "│   "}`),
    ];
  });
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Splits a command line, keeping quoted arguments ('{"a": 1}') together. */
const tokenize = (raw: string) =>
  (raw.match(/'[^']*'|"[^"]*"|\S+/g) ?? []).map((t) => t.replace(/^(['"])([\s\S]*)\1$/, "$2"));

/** Only this site's /api is reachable from the terminal. */
function apiPath(target: string) {
  const path = target.replace(/^https?:\/\/[^/]+/, "").replace(/^localhost(:\d+)?/, "");
  return path.startsWith("/api") ? path : null;
}

const shortHash = (text: string) => {
  let h = 0x811c9dc5;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

/** `git log`: the career, as commits. */
function gitLog() {
  const commits = [
    ...portfolio.experience.map((job) => ({
      date: job.dates.split(" — ")[0],
      message: `feat(career): join ${job.organization} as ${job.role.split(" (")[0]}`,
      head: job.current,
    })),
    ...portfolio.projects.map((p) => ({
      date: "",
      message: `feat(${p.title.toLowerCase()}): ship ${p.category.toLowerCase()}`,
      head: false,
    })),
    {
      date: portfolio.education.dates.split(" — ")[1],
      message: `chore: graduate — ${portfolio.education.degree}`,
      head: false,
    },
  ];
  return commits.map((c) => (
    <span key={c.message}>
      <span className="json-number">{shortHash(c.message)}</span>
      {c.head && <span className="term-accent"> (HEAD → main)</span>} {c.message}
      {c.date && <span className="term-dim"> · {c.date}</span>}
    </span>
  ));
}

/** macOS-style genie: the window funnels down into the dock pill in the corner. */
function genie(win: HTMLElement): Keyframe[] {
  const r = win.getBoundingClientRect();
  const dx = innerWidth - 110 - (r.left + r.width / 2);
  const dy = innerHeight - 37 - (r.top + r.height / 2);
  return [
    { transform: "none", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1 },
    {
      offset: 0.45,
      transform: `translate(${dx * 0.22}px, ${dy * 0.32}px) scale(0.82, 0.88)`,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 60% 100%)",
      opacity: 1,
    },
    {
      transform: `translate(${dx}px, ${dy}px) scale(0.08, 0.05)`,
      clipPath: "polygon(70% 0%, 100% 0%, 100% 100%, 92% 100%)",
      opacity: 0.2,
    },
  ];
}

/** macOS-style open: a quick zoom up from slightly smaller. */
const appear: Keyframe[] = [
  { opacity: 0, transform: "scale(0.9)" },
  { opacity: 1, transform: "none" },
];

const welcome = (): Line => ({
  id: 0,
  kind: "out",
  body: (
    <>
      Welcome. Type a page like <b>about</b> or <b>resume</b> and press Enter, or <b>help</b> for
      everything else.
    </>
  ),
});

export function CommandTerminal() {
  const router = useRouter();
  const pathname = usePathname();
  const skills = useMemo(() => flatten(skillTree), []);
  const categories = skillTree.children ?? [];

  const [open, setOpen] = useState(false);
  // Minimized: closed, but parked as a pill in the corner that restores it.
  const [minimized, setMinimized] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [lines, setLines] = useState<Line[]>(() => [welcome()]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [matrix, setMatrix] = useState(false);
  const [warpAt, setWarpAt] = useState<number | null>(null);
  const [humor, setHumor] = useState(75);
  const sound = useSound();
  const visited = useRef(new Set<string>());
  // A warp hides the window itself, so its exit skips the window animation.
  const quietExit = useRef<Animation | null>(null);
  const nextId = useRef(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const win = useRef<HTMLDivElement>(null);
  // How the window last left, so reopening can play the matching animation backwards.
  const exit = useRef<"genie" | "close">("close");
  const leaving = useRef<Animation | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K toggles from anywhere; other components open it with an event.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        setMinimized(false);
      }
    };
    const onOpen = () => {
      setOpen(true);
      setMinimized(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(terminalEvents.open, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(terminalEvents.open, onOpen);
    };
  }, []);

  // Open and close with the window animations; the dialog only really closes after.
  useEffect(() => {
    const el = dialog.current;
    const box = win.current;
    if (!el || !box) return;
    if (open) {
      if (leaving.current) {
        // Reopened mid-exit: stop leaving and stay.
        leaving.current.cancel();
        leaving.current = null;
        delete el.dataset.closing;
        return;
      }
      if (el.open) return;
      el.showModal();
      field.current?.focus();
      if (reducedMotion()) return;
      if (exit.current === "genie") {
        box.animate(genie(box), {
          duration: 460,
          easing: "cubic-bezier(0.25, 0.7, 0.3, 1)",
          direction: "reverse",
        });
      } else {
        box.animate(appear, { duration: 230, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.15)" });
      }
      return;
    }
    if (!el.open || leaving.current) return;
    if (quietExit.current) {
      el.dataset.closing = "";
      const hidden = quietExit.current;
      quietExit.current = null;
      setTimeout(() => {
        el.close();
        delete el.dataset.closing;
        hidden.cancel();
        setWarpAt(null);
      }, 320);
      exit.current = "close";
      return;
    }
    exit.current = minimized ? "genie" : "close";
    if (reducedMotion()) {
      el.close();
      return;
    }
    el.dataset.closing = "";
    const animation = minimized
      ? box.animate(genie(box), {
          duration: 480,
          easing: "cubic-bezier(0.55, 0, 0.75, 0.3)",
          fill: "forwards",
        })
      : box.animate([...appear].reverse(), { duration: 170, easing: "ease-in", fill: "forwards" });
    leaving.current = animation;
    animation.onfinish = () => {
      leaving.current = null;
      animation.cancel();
      el.close();
      delete el.dataset.closing;
    };
  }, [open, minimized]);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  // The organ drone plays while the black hole is on screen, if sound is on.
  useEffect(() => {
    if (open && sound) startDrone();
    else stopDrone();
  }, [open, sound]);

  const endMatrix = useCallback(() => setMatrix(false), []);

  const findSkill = (query: string): Skill | undefined => {
    const q = norm(query);
    if (!q) return undefined;
    return (
      skills.find((s) => norm(s.node.id) === q || norm(s.node.name) === q) ??
      skills.find((s) => norm(s.node.name).startsWith(q))
    );
  };

  const findCategory = (query: string) => {
    const q = norm(query.replace(/^skills\//i, ""));
    return q ? categories.find((c) => norm(c.id) === q || norm(c.name).startsWith(q)) : undefined;
  };

  /** One line per achievement unlocked for the first time. */
  function award(id: AchievementId): Output[] {
    return unlock(id)
      ? [
          <span key={`a-${id}`} className="term-achievement">
            ★ Achievement unlocked: {ACHIEVEMENTS[id].title}
          </span>,
        ]
      : [];
  }

  /** Notes a page visited from the terminal; every page earns "Explorer". */
  function visit(route: Route): Output[] {
    visited.current.add(route.href);
    const all = routes.filter((r) => r.nav).every((r) => visited.current.has(r.href));
    return all ? award("explorer") : [];
  }

  function go(route: Route): Output[] {
    if (route.href === pathname) {
      setOpen(false);
      return [`Already on ${route.href}.`];
    }
    router.push(route.href);
    setOpen(false);
    return [
      ...visit(route),
      <span key="go" className="term-dim">
        → {route.href}
      </span>,
    ];
  }

  /** Through the black hole: stars stretch, the shadow swallows the screen, and the
   *  page changes on the far side. */
  function warp(route: Route): Output[] {
    if (route.href === pathname) return [`Already on ${route.href}.`];
    if (reducedMotion()) return go(route);
    setWarpAt(performance.now());
    quietExit.current =
      win.current?.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "scale(0.86)" },
        ],
        { duration: 380, easing: "ease-in", fill: "forwards" },
      ) ?? null;
    setTimeout(() => router.push(route.href), 1150);
    setTimeout(close, 1400);
    return [
      <span key="warp" className="term-dim">
        Engaging warp drive → {route.href}
      </span>,
      ...award("wormhole"),
      ...visit(route),
    ];
  }

  function download() {
    track("resume_download", { via: "terminal" });
    const link = document.createElement("a");
    link.href = portfolio.resume;
    link.download = "";
    link.click();
  }

  function run(raw: string): Output[] | "clear" {
    const [word = "", ...rest] = raw.trim().split(/\s+/);
    const cmd = word.toLowerCase();
    const arg = rest.join(" ");

    switch (cmd) {
      case "":
        return [];
      case "help":
      case "?":
        return [
          <table key="help" className="term-table">
            {GROUPS.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th colSpan={2}>{group.title}</th>
                </tr>
                {group.commands.map(([name, hint]) => (
                  <tr key={name}>
                    <td className="term-accent">{name}</td>
                    <td>{hint}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>,
        ];
      case "cd":
      case "open":
      case "goto": {
        if (!arg) return go(routes[0]);
        const route = findRoute(arg);
        if (route) return go(route);
        // `open react` reads naturally too.
        if (cmd === "open" && findSkill(arg)) return run(`cat ${arg}`);
        return [
          fail(
            `${cmd}: no such page: ${arg}. Pages: ${routes.map((r) => r.aliases[0]).join(", ")}`,
          ),
        ];
      }
      case "resume":
      case "cv":
        if (/^(-t|--terminal|--theme\s+terminal)$/.test(arg)) {
          router.push("/resume?view=terminal");
          setOpen(false);
          return [
            <span key="go" className="term-dim">
              → /resume?view=terminal
            </span>,
          ];
        }
        if (/^(-d|--download)$/.test(arg)) {
          download();
          return ["Downloading the PDF…"];
        }
        return go(findRoute("resume")!);
      case "download":
        if (!arg || /^(resume|cv)$/i.test(arg)) {
          download();
          return ["Downloading the PDF…"];
        }
        return [fail(`download: only the résumé is downloadable. Try: download resume`)];
      case "hello":
      case "hi": {
        // `hello Priya @ Acme` — an optional introduction, attached to this visit.
        const [name, company] = arg.split(/\s*@\s*/);
        if (!name?.trim()) return ["Hi! Introduce yourself if you like: hello <name> @ <company>"];
        track("identify", {
          name: name.trim().slice(0, 100),
          company: company?.trim().slice(0, 100),
        });
        return [`Nice to meet you, ${name.trim()}${company ? ` from ${company.trim()}` : ""}.`];
      }
      case "whoami":
        return [
          <b key="n">{portfolio.name}</b>,
          `${portfolio.role} · ${portfolio.location}`,
          portfolio.specialization,
        ];
      case "ls": {
        if (!arg || arg === "~" || arg === "/") {
          return routes.map((route) => (
            <span key={route.href}>
              <span className="term-accent">{route.href.padEnd(12)}</span>
              {route.hint}
            </span>
          ));
        }
        if (/^skills\/?$/i.test(arg)) {
          return categories.map((c) => (
            <span key={c.id}>
              <span className="term-accent">{c.id.padEnd(12)}</span>
              {c.name} ({flatten(c).length})
            </span>
          ));
        }
        const category = findCategory(arg);
        if (!category) return [fail(`ls: no such category: ${arg}. Try: ls skills`)];
        return [category.name, ...treeLines(category)];
      }
      case "tree":
        return [skillTree.name, ...treeLines(skillTree)];
      case "cat": {
        if (!arg) return [fail("cat: which skill? Try: cat react")];
        const hit = findSkill(arg);
        if (!hit) return [fail(`cat: ${arg}: no such skill. Try: grep ${arg}`)];
        const { node, path } = hit;
        if (pathname === "/skills") {
          window.dispatchEvent(new CustomEvent(terminalEvents.openSkill, { detail: node.id }));
        } else {
          router.push(`/skills?skill=${encodeURIComponent(node.id)}`);
        }
        setOpen(false);
        return [
          <b key="n">{node.name}</b>,
          path.length ? `${path.join(" › ")} › ${node.name}` : "Category",
          node.description,
          ...(node.level
            ? [`level: ${levels[node.level].label} — ${levels[node.level].hint}`]
            : []),
          ...(node.usedIn?.length
            ? [`used in: ${node.usedIn.map((key) => places[key].name).join(", ")}`]
            : []),
          ...(node.children?.length
            ? [`includes: ${node.children.map((c) => c.name).join(", ")}`]
            : []),
        ];
      }
      case "grep": {
        if (!arg) return [fail("grep: search for what? Try: grep azure")];
        const q = arg.toLowerCase();
        const found = skills.filter(
          (s) =>
            s.node.name.toLowerCase().includes(q) || s.node.description.toLowerCase().includes(q),
        );
        if (!found.length) return [`No skills match "${arg}".`];
        return found.map((s) => (
          <span key={s.node.id}>
            <span className="term-accent">{s.node.name}</span>
            <span className="term-dim"> · {s.node.description}</span>
          </span>
        ));
      }
      case "level": {
        const level = (Object.keys(levels) as Level[]).find(
          (l) => arg && l.startsWith(arg.toLowerCase()),
        );
        if (!level) return [fail(`level: pick one of ${Object.keys(levels).join(", ")}`)];
        const found = skills.filter((s) => s.node.level === level);
        return [
          `${levels[level].label} (${found.length}): ${found.map((s) => s.node.name).join(", ")}`,
        ];
      }
      case "leveling": {
        const found = skills.filter((s) => s.node.levelingUp);
        return [found.length ? found.map((s) => s.node.name).join(", ") : "Nothing right now."];
      }
      case "email":
      case "mail":
        track("contact_click", { kind: "email", via: "terminal" });
        window.location.href = `mailto:${portfolio.email}`;
        return [`Opening your mail app for ${portfolio.email}…`];
      case "github":
        if (arg !== "--open") return [<GithubStats key="gh" />, ...award("backend")];
        window.open(portfolio.social.github, "_blank", "noopener,noreferrer");
        return [`Opening ${portfolio.social.github}`];
      case "linkedin":
        window.open(portfolio.social.linkedin, "_blank", "noopener,noreferrer");
        return [`Opening ${portfolio.social.linkedin}`];
      case "curl":
      case "http": {
        const tokens = tokenize(raw).slice(1);
        let method = "GET";
        let body: string | undefined;
        let target = "";
        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          if (t === "-X" || t === "--request") method = (tokens[++i] ?? "GET").toUpperCase();
          else if (t === "-d" || t === "--data") body = tokens[++i];
          else if (t === "-H" || t === "--header") i++;
          else if (!t.startsWith("-")) target = t;
        }
        if (body && method === "GET") method = "POST";
        const path = apiPath(target || "/api");
        if (!path)
          return [fail(`${cmd}: only this site's /api is reachable from here. Try: curl /api`)];
        return [<ApiCall key="api" method={method} path={path} body={body} />, ...award("backend")];
      }
      case "get":
      case "post":
      case "put":
      case "delete": {
        const [target = "/api", ...data] = rest;
        const path = apiPath(target);
        if (!path) return [fail(`${word}: only this site's /api is reachable. Try: GET /api`)];
        const body = data.join(" ") || undefined;
        return [
          <ApiCall key="api" method={cmd.toUpperCase()} path={path} body={body} />,
          ...award("backend"),
        ];
      }
      case "api":
        return [<ApiCall key="api" method="GET" path="/api" />, ...award("backend")];
      case "ask":
        if (!arg)
          return [fail("ask: what would you like to know? Try: ask what does he do at Sarv?")];
        return [<AskAnswer key="ask" question={arg} />, ...award("curious")];
      case "warp": {
        const route = findRoute(arg || "/");
        if (!route) {
          return [fail(`warp: no such page: ${arg}. Try: warp ${routes[1].aliases[0]}`)];
        }
        return warp(route);
      }
      case "docking":
        return [<Docking key="dock" />, ...award("docking")];
      case "tars": {
        const [setting = "", value] = rest;
        const n =
          value === undefined ? null : Math.max(0, Math.min(100, Number.parseInt(value, 10) || 0));
        const nextHumor = setting === "humor" && n !== null ? n : humor;
        if (setting === "humor" && n !== null) setHumor(n);
        return [tarsReply(setting, n, nextHumor), ...award("tars")];
      }
      case "matrix":
        if (reducedMotion())
          return ["Wake up, Neo… (motion is reduced, so no rain.)", ...award("matrix")];
        setMatrix(true);
        return ["Wake up, Neo… press any key to come back.", ...award("matrix")];
      case "coffee":
      case "brew":
        return [COFFEE, ...award("coffee")];
      case "git":
        if (arg !== "log" && arg !== "log --oneline") return [fail("git: try git log")];
        return [...gitLog(), ...award("historian")];
      case "stay":
      case "murph":
        return [STAY, ...award("stay")];
      case "achievements": {
        const have = readAchievements();
        const ids = Object.keys(ACHIEVEMENTS) as AchievementId[];
        return [
          `${have.length}/${ids.length} found`,
          ...ids.map((id) => (
            <span key={id} className={have.includes(id) ? "term-achievement" : "term-dim"}>
              {have.includes(id) ? "★" : "☆"} {have.includes(id) ? ACHIEVEMENTS[id].title : "???"}
              <span className="term-dim"> · {ACHIEVEMENTS[id].hint}</span>
            </span>
          )),
        ];
      }
      case "sound": {
        const on = arg ? arg === "on" : !sound;
        if (arg && arg !== "on" && arg !== "off") return [fail("sound: on or off")];
        setSound(on);
        if (on && open) startDrone();
        return [on ? "Sound on. Headphones recommended." : "Sound off."];
      }
      case "theme": {
        const current = document.documentElement.dataset.theme;
        const next = arg
          ? THEMES.find((t) => t.startsWith(arg.toLowerCase()))
          : current === "dark"
            ? "light"
            : "dark";
        if (!next) return [fail(`theme: pick one of ${THEMES.join(", ")}`)];
        setTheme(next);
        return [`Theme: ${next}.`];
      }
      case "history":
        return history.length
          ? history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`)
          : ["No history yet."];
      case "clear":
        return "clear";
      case "exit":
      case "close":
      case "q":
        close();
        return [];
      case "zoom":
      case "fullscreen":
        toggleZoom();
        return [];
      case "minimize":
      case "min":
        minimize();
        return [];
      case "sudo":
        if (/^hire\s+aman/i.test(arg)) {
          setTimeout(() => {
            router.push("/contact");
            close();
          }, 1600);
          return [
            "[sudo] password for recruiter: ********",
            <span key="ok" className="json-ok">
              ✓ Permission granted. Opening /contact…
            </span>,
            ...award("recruiter"),
          ];
        }
        return [fail("Permission denied. Try: sudo hire aman")];
      default: {
        const route = findRoute(raw);
        if (route) return go(route);
        const skill = findSkill(raw);
        if (skill) return run(`cat ${raw}`);
        return [fail(`command not found: ${word}. Type help for a list.`)];
      }
    }
  }

  function close() {
    setOpen(false);
    setMinimized(false);
  }

  /** Zoom with a FLIP animation: measure, switch layout, then grow from the old frame. */
  function toggleZoom() {
    const box = win.current;
    const before = box?.getBoundingClientRect();
    flushSync(() => setZoomed((current) => !current));
    if (!box || !before || reducedMotion()) return;
    const after = box.getBoundingClientRect();
    box.animate(
      [
        {
          transformOrigin: "top left",
          transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
        },
        { transformOrigin: "top left", transform: "none" },
      ],
      { duration: 340, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)" },
    );
  }

  function minimize() {
    setOpen(false);
    setMinimized(true);
  }

  function restore() {
    setOpen(true);
    setMinimized(false);
  }

  function submit(raw: string) {
    setInput("");
    setCursor(-1);
    if (raw.trim()) {
      setHistory((h) => [...h, raw]);
      track("terminal", { command: raw.trim().slice(0, 200) });
    }
    const first = raw.trim() ? award("hello") : [];
    const ran = run(raw);
    const result = ran === "clear" ? ran : [...ran, ...first];
    if (result === "clear") {
      setLines([]);
      return;
    }
    const make = (kind: Line["kind"], body: ReactNode): Line => ({
      id: nextId.current++,
      kind,
      body,
    });
    setLines((current) => [
      ...current,
      make("in", raw),
      ...result.map((out) => (isFailure(out) ? make("err", out.err) : make("out", out))),
    ]);
  }

  function complete() {
    const [cmd, ...rest] = input.split(" ");
    if (!rest.length) {
      const pool = [
        ...new Set([
          ...GROUPS.flatMap((g) => g.commands.map(([name]) => name.split(" ")[0])),
          ...routes.flatMap((r) => r.aliases),
        ]),
      ];
      const match = pool.filter((c) => c.startsWith(cmd.toLowerCase()));
      if (match.length === 1) setInput(`${match[0]} `);
      return;
    }
    const q = rest.join(" ").toLowerCase();
    const pool =
      cmd === "cd" || cmd === "open" || cmd === "goto"
        ? routes.map((r) => r.aliases[0])
        : cmd === "ls"
          ? ["skills", ...categories.map((c) => c.id)]
          : cmd === "level"
            ? Object.keys(levels)
            : cmd === "theme"
              ? THEMES
              : skills.map((s) => s.node.name.toLowerCase());
    const match = pool.filter((name) => name.startsWith(q));
    if (match.length === 1) setInput(`${cmd} ${match[0]}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key.length === 1 || event.key === "Backspace" || event.key === "Enter") tickSound();
    if (event.key === "Enter") {
      submit(input);
    } else if (event.key === "Tab") {
      if (!input.trim()) return;
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (event.key === "ArrowDown" && cursor >= 0) {
      event.preventDefault();
      const next = cursor + 1;
      setCursor(next >= history.length ? -1 : next);
      setInput(next >= history.length ? "" : history[next]);
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  }

  return (
    <>
      <dialog
        ref={dialog}
        className={`terminal-dialog${zoomed ? " is-zoomed" : ""}`}
        aria-label="Terminal"
        onClose={() => setOpen(false)}
        // Esc would close the dialog at once; route it through the close animation.
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          // A click on the space scene (or the dialog itself) is a click outside.
          const target = event.target as Element;
          if (target === event.currentTarget || target.classList.contains("gargantua")) close();
        }}
      >
        <GargantuaBackdrop active={open} warpAt={warpAt} />
        <div
          ref={win}
          className="terminal"
          onClick={() => window.getSelection()?.isCollapsed && field.current?.focus()}
        >
          <div className="term-bar" onDoubleClick={toggleZoom}>
            <div className="term-lights">
              <button
                type="button"
                className="term-light is-close"
                aria-label="Close terminal"
                title="Close"
                onClick={close}
              >
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m2.5 2.5 5 5m0-5-5 5" />
                </svg>
              </button>
              <button
                type="button"
                className="term-light is-min"
                aria-label="Minimize terminal"
                title="Minimize"
                onClick={minimize}
              >
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2 5h6" />
                </svg>
              </button>
              <button
                type="button"
                className="term-light is-zoom"
                aria-label={zoomed ? "Restore terminal size" : "Zoom terminal to full screen"}
                aria-pressed={zoomed}
                title={zoomed ? "Restore" : "Zoom"}
                onClick={toggleZoom}
              >
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  {zoomed ? (
                    <path d="M5.5 1.5v3h3M4.5 8.5v-3h-3" />
                  ) : (
                    <path d="M2.5 6v1.5H4M6 2.5h1.5V4M2.5 7.5l5-5" />
                  )}
                </svg>
              </button>
            </div>
            <span>aman — zsh — {pathname}</span>
            <div className="term-status">
              <TimeDilation />
              <button
                type="button"
                className="term-sound"
                aria-pressed={sound}
                aria-label={sound ? "Turn sound off" : "Turn sound on"}
                title={sound ? "Sound on" : "Sound off"}
                onClick={() => {
                  setSound(!sound);
                  if (!sound && open) startDrone();
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9h4l5-4v14l-5-4H4z" />
                  {sound ? (
                    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
                  ) : (
                    <path d="m17 9 5 6m0-6-5 6" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={screen}
            className="term-screen"
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
          >
            {lines.map((line) => (
              <div key={line.id} className={`term-line term-${line.kind}`}>
                {line.kind === "in" && <span className="term-prompt">{PROMPT} </span>}
                {line.body}
              </div>
            ))}
            <label className="term-input">
              <span className="term-prompt">{PROMPT}</span>
              <span className="visually-hidden">Terminal command</span>
              <input
                ref={field}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                enterKeyHint="send"
              />
            </label>
          </div>
          {matrix && <MatrixRain onDone={endMatrix} />}
          <div className="term-foot">
            <div className="term-quick" aria-label="Quick commands">
              {QUICK.map((cmd) => (
                <button key={cmd} type="button" onClick={() => submit(cmd)}>
                  {cmd}
                </button>
              ))}
            </div>
            <span className="term-keys" aria-hidden="true">
              ↵ run · tab complete · ↑↓ history · esc close
            </span>
          </div>
        </div>
      </dialog>
      {minimized && !open && (
        <button
          type="button"
          className="terminal-dock"
          onClick={restore}
          aria-label="Restore terminal"
        >
          <span className="terminal-dock-dot" aria-hidden="true" />
          aman — zsh
          <span className="terminal-dock-hint" aria-hidden="true">
            {pathname}
          </span>
        </button>
      )}
    </>
  );
}

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const noSubscribe = () => () => {};

/** Header button that opens the terminal. */
export function TerminalButton() {
  const mac = useSyncExternalStore(noSubscribe, isMac, () => true);
  return (
    <button
      type="button"
      className="terminal-button"
      aria-label="Open terminal"
      title={`Open terminal (${mac ? "⌘K" : "Ctrl+K"})`}
      onClick={() => window.dispatchEvent(new Event(terminalEvents.open))}
    >
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 7 5 5-5 5M12 17h7" />
      </svg>
      <kbd>{mac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}
