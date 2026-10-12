// Every page on the site. The header nav and the terminal's navigation commands both
// read this list, so a new page only needs adding here (plus its app/<route>/page.tsx).

export type Route = {
  href: string;
  label: string;
  /** Shown in the header nav. */
  nav: boolean;
  /** What the terminal prints for it in `help` and `ls ~`. */
  hint: string;
  /** Other words the terminal accepts for it. */
  aliases: string[];
};

export const routes: Route[] = [
  { href: "/", label: "Home", nav: false, hint: "Back to the start", aliases: ["home", "~", "start"] },
  { href: "/about", label: "About", nav: true, hint: "Who I am and how I work", aliases: ["about", "me", "bio"] },
  { href: "/projects", label: "Projects", nav: true, hint: "Things I've built", aliases: ["projects", "work", "portfolio"] },
  { href: "/experience", label: "Experience", nav: true, hint: "Where I've worked", aliases: ["experience", "jobs", "career"] },
  { href: "/skills", label: "Skills", nav: true, hint: "The interactive skill tree", aliases: ["skills", "stack"] },
  { href: "/contact", label: "Contact", nav: true, hint: "How to reach me", aliases: ["contact", "hire", "reach"] },
  { href: "/resume", label: "Résumé", nav: false, hint: "My résumé, in view mode", aliases: ["resume", "cv", "résumé"] },
];

/** Finds a page by name, alias or path, ignoring case and a leading slash. */
export function findRoute(query: string): Route | undefined {
  const q = query.trim().toLowerCase().replace(/^\.?\//, "").replace(/\/$/, "");
  if (!q) return query.trim() === "/" ? routes[0] : undefined;
  return routes.find(
    (route) => route.href.slice(1) === q || route.aliases.includes(q) || route.label.toLowerCase() === q,
  );
}

/** Custom events between the terminal and the rest of the page. */
export const terminalEvents = {
  open: "portfolio:terminal-open",
  openSkill: "portfolio:open-skill",
} as const;
