// Fractal-tree placement for the wide skill tree. Pure geometry, no DOM.
//
// The core is the root and a trunk grows straight up from it. The trunk forks two
// ways at a time, following the branching rule
//   L(n+1) = r·L(n),   θ_left = θ − α,   θ_right = θ + α
// with r = 1/√φ (≈ 0.786), so two generations shrink by exactly the golden ratio φ.
// Each fork halves the skills it carries, until every limb ends in one category. The
// category's skills grow upward from that tip as a cluster of leaves. A small
// golden-ratio variation keeps it from looking machine-made, and a short relaxation
// pass nudges apart clusters that touch.

export const PHI = (1 + Math.sqrt(5)) / 2;
export const RATIO = 1 / Math.sqrt(PHI);

export type Point = { x: number; y: number };
export type Box = Point & { w: number; h: number };
export type Cluster = {
  w: number;
  h: number;
  /** Skills under this category; forks split by this. */
  weight: number;
  /** Center of the category label, measured from the cluster's bottom-left corner. */
  anchor: Point;
};
export type Limb = {
  from: Point;
  to: Point;
  heading: number;
  generation: number;
  /** Upper-tier limbs rise straight up through this point, between lower clusters. */
  via?: Point;
};
export type FractalPlacement = {
  height: number;
  core: Box;
  clusters: Box[];
  /** Trunk and fork limbs, root first; the last limb into each category ends on its label. */
  limbs: Limb[];
};

const PAD = 14;
const GAP = 18;
const TRUNK = 0.9;
const SKELETON = 300;
/** Height, in px, a crossing pair of limbs is worth avoiding. */
const CROSSING = 160;
const ALPHA = (30 * Math.PI) / 180;
const UP = -Math.PI / 2;

const frac = (n: number) => n - Math.floor(n);

type Fork = { index: number } | { left: Fork; right: Fork; weight: number };
/** Binary tree of forks over the categories, splitting where the skills halve. */
function split(indices: number[], clusters: Cluster[]): Fork {
  if (indices.length === 1) return { index: indices[0] };
  const weights = indices.map((i) => clusters[i].weight);
  const total = weights.reduce((a, b) => a + b, 0);
  let best = 1;
  let run = 0;
  let bestGap = Infinity;
  for (let i = 0; i < indices.length - 1; i++) {
    run += weights[i];
    if (Math.abs(run - total / 2) < bestGap) {
      bestGap = Math.abs(run - total / 2);
      best = i + 1;
    }
  }
  return {
    left: split(indices.slice(0, best), clusters),
    right: split(indices.slice(best), clusters),
    weight: total,
  };
}

/** Returns null when the clusters cannot fit within `width`. */
export function fractalLayout(
  core: { w: number; h: number },
  clusters: Cluster[],
  width: number,
): FractalPlacement | null {
  // 1. Grow the skeleton in unit lengths (first limbs L = 1) from the top of the trunk.
  type UnitLimb = { from: Point; to: Point; heading: number; generation: number; tip?: number };
  const limbs: UnitLimb[] = [{ from: { x: 0, y: 0 }, to: { x: 0, y: -TRUNK }, heading: UP, generation: 0 }];
  let k = 0;
  const grow = (fork: Fork, from: Point, theta: number, g: number) => {
    if ("index" in fork) return;
    for (const [child, side] of [
      [fork.left, -1],
      [fork.right, 1],
    ] as const) {
      k += 1;
      const angle = theta + side * ALPHA + (frac(k * PHI) - 0.5) * 0.1;
      const length = RATIO ** (g - 1) * (1 + (frac(k * PHI * PHI) - 0.5) * 0.1);
      const to = { x: from.x + length * Math.cos(angle), y: from.y + length * Math.sin(angle) };
      limbs.push({
        from,
        to,
        heading: angle,
        generation: g,
        tip: "index" in child ? child.index : undefined,
      });
      grow(child, to, angle, g + 1);
    }
  };
  const crown = split(
    clusters.map((_, i) => i),
    clusters,
  );
  grow(crown, { x: 0, y: -TRUNK }, UP, 1);
  if ("index" in crown) limbs[0].tip = crown.index;

  // 2. Canopy: clusters keep their left-to-right order in two tiers. The lower tier
  //    stands on one baseline; the upper tier sits in its gaps, as low as it can.
  //    Every split into tiers is tried and the shortest crown wins.
  const n = clusters.length;
  const room = width - PAD * 2;
  const hit = (a: Box, b: Box) =>
    a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP;
  const spread = (row: number[], out: Box[]) => {
    const total = row.reduce((sum, i) => sum + clusters[i].w, 0);
    const extra = (room - total) / row.length;
    let x = PAD + extra / 2;
    row.forEach((i) => {
      out[i] = { x, y: 0, w: clusters[i].w, h: clusters[i].h };
      x += clusters[i].w + extra;
    });
    return total + GAP * (row.length - 1) <= room;
  };
  let boxes: Box[] | null = null;
  let gaps: number[] = [];
  let best = Infinity;
  for (let mask = 0; mask < 1 << n; mask++) {
    const lower = [...Array(n).keys()].filter((i) => !(mask & (1 << i)));
    const upper = [...Array(n).keys()].filter((i) => mask & (1 << i));
    if (!lower.length) continue;
    const out: Box[] = [];
    const gap: number[] = [];
    let narrow = 0;
    if (!spread(lower, out) || (upper.length && !spread(upper, out))) continue;
    lower.forEach((i) => (out[i].y = -out[i].h));
    // An upper cluster's label sits right above the gap between its neighbours in the
    // lower tier, so its limb can rise through that gap.
    let floor = PAD;
    upper.forEach((i) => {
      const before = lower.filter((j) => j < i).at(-1);
      const after = lower.find((j) => j > i);
      const from = before === undefined ? 0 : out[before].x + out[before].w;
      const to = after === undefined ? width : out[after].x;
      gap[i] = (from + to) / 2;
      out[i].x = Math.max(floor, Math.min(width - PAD - out[i].w, gap[i] - clusters[i].anchor.x));
      floor = out[i].x + out[i].w + GAP;
      const label = out[i].x + clusters[i].anchor.x;
      if (to - from < 24 || Math.abs(label - gap[i]) > clusters[i].anchor.x) narrow++;
    });
    if (upper.some((i) => out[i].x + out[i].w > width - PAD + 1)) continue;
    upper.forEach((i) => {
      out[i].y = -out[i].h;
      for (let o = lower.find((j) => hit(out[i], out[j])); o !== undefined; o = lower.find((j) => hit(out[i], out[j]))) {
        out[i].y = out[o].y - GAP - out[i].h;
      }
    });
    // Labels out of left-to-right order mean crossing limbs; each costs some height.
    const mid = (i: number) => out[i].x + out[i].w / 2;
    let crossings = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (mid(i) > mid(j)) crossings++;
    const score = -Math.min(...out.map((b) => b.y)) + (crossings + narrow) * CROSSING;
    if (score < best) {
      best = score;
      boxes = out;
      gaps = gap;
    }
  }
  if (!boxes) return null;

  // 3. Scale the skeleton so its tips span the category labels, with the crown's
  //    baseline just above the highest tip.
  const tips = limbs.filter((l) => l.tip !== undefined);
  const labelX = (i: number) => boxes![i].x + clusters[i].anchor.x;
  const tipXs = tips.map((l) => l.to.x);
  const labelXs = tips.map((l) => labelX(l.tip!));
  const scale = Math.min(
    240,
    (Math.max(...labelXs) - Math.min(...labelXs)) / (Math.max(...tipXs) - Math.min(...tipXs) || 1),
  );
  // Vertically the skeleton stays near SKELETON px, so the canopy gets the height.
  const deepest = -Math.min(...tips.map((l) => l.to.y));
  const lift = Math.min(scale, SKELETON / deepest);
  const at = (p: Point): Point => ({ x: width / 2 + p.x * scale, y: p.y * lift });
  const baseline = Math.min(...tips.map((l) => at(l.to).y)) - GAP;
  boxes.forEach((b) => (b.y += baseline));
  const coreBox: Box = { x: width / 2 - core.w / 2, y: 0, w: core.w, h: core.h };

  // 4. Limbs in pixels; the last limb ends wherever its category label settled.
  const placed: Limb[] = limbs.map((l) => {
    const to =
      l.tip === undefined
        ? at(l.to)
        : {
            x: boxes[l.tip].x + clusters[l.tip].anchor.x,
            y: boxes[l.tip].y + boxes[l.tip].h - clusters[l.tip].anchor.y,
          };
    const via = l.tip !== undefined && gaps[l.tip] !== undefined ? { x: gaps[l.tip], y: baseline } : undefined;
    return { from: at(l.from), to, heading: l.heading, generation: l.generation, via };
  });

  // 5. Shift everything down so the crown starts at the top edge.
  const top = Math.min(...boxes.map((b) => b.y), ...placed.map((l) => l.to.y));
  const dy = PAD - top;
  const shift = (p: Point) => ({ ...p, y: p.y + dy });
  coreBox.y += dy;
  boxes.forEach((b) => (b.y += dy));
  const limbsOut = placed.map((l) => ({
    ...l,
    from: shift(l.from),
    to: shift(l.to),
    via: l.via && shift(l.via),
  }));
  return {
    height: coreBox.y + coreBox.h + PAD,
    core: coreBox,
    clusters: boxes,
    limbs: limbsOut,
  };
}
