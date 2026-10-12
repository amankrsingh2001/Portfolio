import { portfolio } from "../../data/portfolio";

const projects = portfolio.projects.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  description: p.description,
  stack: p.stack.split(/,\s*/),
  outcomes: Object.fromEntries(p.outcomes.map((o) => [o.label, o.value])),
  demo: p.demo,
  source: p.source,
}));

export function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ count: projects.length, projects });
  const project = projects.find((p) => p.id === id || p.title.toLowerCase() === id.toLowerCase());
  return project
    ? Response.json(project)
    : Response.json({ error: `No project with id "${id}"` }, { status: 404 });
}
