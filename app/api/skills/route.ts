import { flattenSkills, levels, places, type Level } from "../../data/skill-tree";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const level = params.get("level")?.toLowerCase();
  const category = params.get("category")?.toLowerCase();
  const q = params.get("q")?.toLowerCase();
  if (level && !(level in levels)) {
    return Response.json(
      { error: `Unknown level "${level}"`, levels: Object.keys(levels) },
      { status: 400 },
    );
  }
  const skills = flattenSkills()
    .filter(({ node }) => node.level)
    .filter(({ node }) => !level || node.level === level)
    .filter(({ category: c }) => !category || c.toLowerCase().startsWith(category))
    .filter(({ node }) => !q || `${node.name} ${node.description}`.toLowerCase().includes(q))
    .map(({ node, category: c }) => ({
      id: node.id,
      name: node.name,
      category: c,
      level: levels[node.level as Level].label,
      description: node.description,
      usedIn: (node.usedIn ?? []).map((key) => places[key].name),
    }));
  return Response.json({ count: skills.length, skills });
}
