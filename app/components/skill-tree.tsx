"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  levels,
  places,
  skillTree,
  type Level,
  type SkillNode,
} from "../data/skill-tree";

type Entry = {
  node: SkillNode;
  parentId: string | null;
  categoryId: string | null;
  depth: number;
  /** Appearance delay in ms for the power-on animation. */
  delay: number;
};

type Rect = { left: number; top: number; width: number; height: number };
type Link = { from: string; to: string; d: string; delay: number; trunk: boolean };

// Same breakpoints as the container queries in globals.css.
const WIDE = 960;
const GRID = 600;

function index(tree: SkillNode) {
  const entries = new Map<string, Entry>();
  entries.set(tree.id, { node: tree, parentId: null, categoryId: null, depth: 0, delay: 0 });
  (tree.children ?? []).forEach((category, c) => {
    entries.set(category.id, {
      node: category,
      parentId: tree.id,
      categoryId: category.id,
      depth: 1,
      delay: 260 + c * 55,
    });
    let order = 0;
    const walk = (nodes: SkillNode[], parentId: string, depth: number) => {
      for (const node of nodes) {
        entries.set(node.id, {
          node,
          parentId,
          categoryId: category.id,
          depth,
          delay: Math.min(1250, 520 + c * 40 + order * 55),
        });
        order += 1;
        if (node.children) walk(node.children, node.id, depth + 1);
      }
    };
    walk(category.children ?? [], category.id, 2);
  });
  return entries;
}

function countSkills(node: SkillNode): number {
  return (node.children ?? []).reduce((sum, child) => sum + 1 + countSkills(child), 0);
}

function Pips({ level }: { level: Level }) {
  const rank = levels[level].rank;
  return (
    <span className="pips" aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <i key={step} className={step <= rank ? "on" : undefined} />
      ))}
    </span>
  );
}

export function SkillTree() {
  const entries = useMemo(() => index(skillTree), []);
  const categories = skillTree.children ?? [];
  const levelingUp = [...entries.values()]
    .filter((entry) => entry.node.levelingUp)
    .map((entry) => entry.node.name);

  const container = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, HTMLButtonElement>());
  const panelRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  const [geom, setGeom] = useState<{
    width: number;
    height: number;
    rects: Record<string, Rect>;
    links: Link[];
  }>({ width: 0, height: 0, rects: {}, links: [] });
  const [powered, setPowered] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const active = hovered ?? focused;

  // Measure every node and draw curved links between parent and child.
  const measure = useCallback(() => {
    const root = container.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const rects: Record<string, Rect> = {};
    nodeEls.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      rects[id] = {
        left: r.left - box.left,
        top: r.top - box.top,
        width: r.width,
        height: r.height,
      };
    });
    const mode = box.width >= WIDE ? "wide" : box.width >= GRID ? "grid" : "stack";
    const radius = 10;
    // Branch rails: tighter in the six-column layout (matches .tree-branch indent).
    const railOffset = mode === "wide" ? 7 : 14;
    const railRadius = mode === "wide" ? 6 : 10;
    const links: Link[] = [];
    entries.forEach((entry, id) => {
      if (!entry.parentId) return;
      const p = rects[entry.parentId];
      const c = rects[id];
      if (!p || !c) return;
      let d: string;
      if (entry.depth === 1) {
        const px = p.left + p.width / 2;
        const py = p.top + p.height;
        const cx = c.left + c.width / 2;
        if (mode === "wide") {
          const dy = c.top - py;
          d = `M${px} ${py}C${px} ${py + dy * 0.55} ${cx} ${c.top - dy * 0.55} ${cx} ${c.top}`;
        } else if (mode === "grid") {
          // A trunk down the center gutter, then a bus into each category.
          const bus = c.top - 18;
          const dir = Math.sign(cx - px) || 1;
          d =
            Math.abs(cx - px) < radius * 2
              ? `M${px} ${py}V${c.top}`
              : `M${px} ${py}V${bus - radius}Q${px} ${bus} ${px + dir * radius} ${bus}H${cx - dir * radius}Q${cx} ${bus} ${cx} ${bus + radius}V${c.top}`;
        } else {
          const rail = p.left + 18;
          const cy = c.top + c.height / 2;
          d = `M${rail} ${py}V${cy - radius}Q${rail} ${cy} ${rail + radius} ${cy}H${c.left}`;
        }
      } else {
        // Indented branch: a rail down from the parent, curving into the child.
        const rail = p.left + railOffset;
        const py = p.top + p.height;
        const cy = c.top + c.height / 2;
        d = `M${rail} ${py}V${cy - railRadius}Q${rail} ${cy} ${rail + railRadius} ${cy}H${c.left}`;
      }
      links.push({
        from: entry.parentId,
        to: id,
        d,
        delay: Math.max(0, entry.delay - 140),
        trunk: entry.depth === 1,
      });
    });
    setGeom({ width: box.width, height: root.scrollHeight, rects, links });
  }, [entries]);

  useLayoutEffect(() => {
    measure();
    const root = container.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  // Power on once, when the tree scrolls into view.
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPowered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        nodeEls.current.get(selected)?.focus();
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // The skill in focus plus its direct parent and children.
  const family = useMemo(() => {
    const focusId = active ?? selected;
    if (!focusId) return null;
    const set = new Set<string>([focusId]);
    const entry = entries.get(focusId);
    if (entry?.parentId) set.add(entry.parentId);
    entry?.node.children?.forEach((child) => set.add(child.id));
    return { focusId, set };
  }, [active, selected, entries]);

  function select(id: string) {
    setSelected((current) => (current === id ? null : id));
    // On phones the panel is a bottom sheet, so the tree stays in place.
    if (matchMedia("(max-width: 640px)").matches) return;
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function jumpTo(id: string) {
    setSelected(id);
    const el = nodeEls.current.get(id);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderNode(node: SkillNode, kind: "core" | "category" | "skill") {
    const entry = entries.get(node.id)!;
    const inFamily = family?.set.has(node.id);
    const classes = [
      "tree-node",
      `node-${kind}`,
      node.level ? `level-${node.level}` : "",
      family && inFamily ? "is-related" : "",
      family && !inFamily ? "is-dim" : "",
      family?.focusId === node.id ? "is-focus" : "",
      selected === node.id ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const count = kind === "category" ? countSkills(node) : 0;
    return (
      <button
        type="button"
        ref={(el) => {
          if (el) nodeEls.current.set(node.id, el);
          else nodeEls.current.delete(node.id);
        }}
        className={classes}
        style={{ "--d": `${entry.delay}ms` } as CSSProperties}
        aria-pressed={selected === node.id}
        aria-describedby={active === node.id ? tipId : undefined}
        aria-label={
          node.level
            ? `${node.name}, ${levels[node.level].label}`
            : kind === "category"
              ? `${node.name}, ${count} skills`
              : node.name
        }
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") setHovered(node.id);
        }}
        onPointerLeave={() =>
          setHovered((current) => (current === node.id ? null : current))
        }
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) setFocused(node.id);
        }}
        onBlur={() => setFocused((current) => (current === node.id ? null : current))}
        onClick={() => select(node.id)}
      >
        {kind === "core" && <span className="core-mark" aria-hidden="true" />}
        <span className="node-name">{node.name}</span>
        {kind === "core" && <span className="node-sub">{node.description}</span>}
        {kind === "category" && <span className="node-count">{count}</span>}
        {node.level && <span className="node-dot" aria-hidden="true" />}
        {node.levelingUp && <span className="node-up" aria-hidden="true" />}
      </button>
    );
  }

  function renderBranch(nodes: SkillNode[]) {
    return (
      <ul className="tree-branch">
        {nodes.map((node) => (
          <li key={node.id}>
            {renderNode(node, "skill")}
            {node.children && renderBranch(node.children)}
          </li>
        ))}
      </ul>
    );
  }

  const tipEntry = active ? entries.get(active) : undefined;
  const tipRect = active ? geom.rects[active] : undefined;
  const selectedEntry = selected ? entries.get(selected) : undefined;

  return (
    <div className="skill-tree-wrap">
      <div className="tree-head">
        <p className="tree-subtitle">
          Technologies I&apos;ve explored, built with, and continue to master.
        </p>
        <div className="tree-meta">
          {levelingUp.length > 0 && (
            <span className="leveling">
              <span className="dot" aria-hidden="true" />
              Currently leveling up: {levelingUp.join(", ")}
            </span>
          )}
          <ul className="tree-legend" aria-label="Levels">
            {(Object.keys(levels) as Level[]).map((level) => (
              <li key={level} className={`level-${level}`} title={levels[level].hint}>
                <span className="node-dot" aria-hidden="true" />
                {levels[level].label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        ref={container}
        className={`skill-tree${powered ? " is-powered" : ""}${family ? " has-focus" : ""}`}
      >
        <div className="tree-particles" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  "--t": `${9 + (i % 5) * 2}s`,
                  "--delay": `${-i * 1.3}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <svg
          className="tree-links"
          width={geom.width}
          height={geom.height}
          aria-hidden="true"
        >
          {geom.links.map((link) => {
            const lit =
              !!family && (link.to === family.focusId || link.from === family.focusId);
            return (
              <g
                key={link.to}
                className={`tree-link${lit ? " is-lit" : ""}${family && !lit ? " is-dim" : ""}${link.trunk ? " is-trunk" : ""}`}
                style={{ "--d": `${link.delay}ms` } as CSSProperties}
              >
                <path className="link-base" d={link.d} pathLength={1} />
                <path className="link-glow" d={link.d} pathLength={1} />
              </g>
            );
          })}
        </svg>

        <div className="tree-core">{renderNode(skillTree, "core")}</div>
        <ul className="tree-categories">
          {categories.map((category) => (
            <li key={category.id} className="tree-category">
              {renderNode(category, "category")}
              {category.children && renderBranch(category.children)}
            </li>
          ))}
        </ul>

        {tipEntry && tipRect && (
          <div
            id={tipId}
            role="tooltip"
            className="tree-tip"
            style={{
              left: Math.max(0, Math.min(tipRect.left, geom.width - 232)),
              top: tipRect.top + tipRect.height + 8,
            }}
          >
            <p className="tip-name">{tipEntry.node.name}</p>
            <p className="tip-desc">{tipEntry.node.description}</p>
            {tipEntry.node.level && (
              <p className="tip-level">
                <Pips level={tipEntry.node.level} />
                {levels[tipEntry.node.level].label}
              </p>
            )}
            {tipEntry.node.usedIn && tipEntry.node.usedIn.length > 0 && (
              <p className="tip-used">
                Used in {tipEntry.node.usedIn.length}{" "}
                {tipEntry.node.usedIn.length === 1 ? "place" : "places"} · click for
                details
              </p>
            )}
          </div>
        )}
      </div>

      <div ref={panelRef} className="tree-panel-slot" aria-live="polite">
        {selectedEntry && (
          <SkillDetail
            key={selectedEntry.node.id}
            entry={selectedEntry}
            entries={entries}
            onJump={jumpTo}
            onClose={() => {
              nodeEls.current.get(selectedEntry.node.id)?.focus();
              setSelected(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function SkillDetail({
  entry,
  entries,
  onJump,
  onClose,
}: {
  entry: Entry;
  entries: Map<string, Entry>;
  onJump: (id: string) => void;
  onClose: () => void;
}) {
  const { node } = entry;
  const category = entry.categoryId ? entries.get(entry.categoryId)?.node : undefined;
  const related = (
    node.related ?? [
      ...(entry.parentId ? [entry.parentId] : []),
      ...(node.children ?? []).map((child) => child.id),
    ]
  ).filter((id) => entries.has(id) && id !== "core");
  const includes = (node.children ?? []).map((child) => child.id);
  const chips = node.level ? related : includes;
  return (
    <section className="tree-panel" aria-labelledby="skill-detail-heading">
      <div className="panel-top">
        <div>
          <h3 id="skill-detail-heading">{node.name}</h3>
          <p className="muted">
            {category && category.id !== node.id ? category.name : "Skill branch"}
          </p>
        </div>
        <button type="button" className="panel-close" onClick={onClose}>
          Close<span className="visually-hidden"> details</span>
        </button>
      </div>
      <p className="panel-desc">{node.description}</p>
      <dl className="panel-grid">
        {node.level && (
          <div>
            <dt>Experience</dt>
            <dd className="panel-level">
              <Pips level={node.level} />
              {levels[node.level].label}
              <span className="muted"> · {levels[node.level].hint}</span>
            </dd>
          </div>
        )}
        {node.usedIn && node.usedIn.length > 0 ? (
          <div>
            <dt>Used in</dt>
            <dd>
              <ul className="panel-list">
                {node.usedIn.map((key) => {
                  const place = places[key];
                  return (
                    <li key={key}>
                      {place.href ? (
                        <a
                          className="inline-link"
                          href={place.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {place.name}
                        </a>
                      ) : (
                        place.name
                      )}
                      <span className="muted"> · {place.kind}</span>
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ) : (
          node.level && (
            <div>
              <dt>Used in</dt>
              <dd className="muted">Part of my toolkit; no public project to show yet.</dd>
            </div>
          )
        )}
        {chips.length > 0 && (
          <div>
            <dt>{node.level ? "Related" : "Includes"}</dt>
            <dd className="panel-related">
              {chips.map((id) => (
                <button key={id} type="button" onClick={() => onJump(id)}>
                  {entries.get(id)!.node.name}
                </button>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
