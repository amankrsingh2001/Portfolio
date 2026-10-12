import Anthropic from "@anthropic-ai/sdk";
import { portfolio } from "../../data/portfolio";
import { flattenSkills, levels } from "../../data/skill-tree";

// POST /api/ask { question } — answers questions about Aman's work.
// With ANTHROPIC_API_KEY (or another Anthropic credential) on the server it asks Claude,
// grounded only in the portfolio data; without one it answers from that data directly.

const MAX_QUESTION = 300;
const WINDOW_MS = 60_000;
const PER_WINDOW = 6;
const hits = new Map<string, number[]>();

const skills = flattenSkills().filter((s) => s.node.level);
const context = JSON.stringify({
  profile: {
    name: portfolio.name,
    role: portfolio.role,
    location: portfolio.location,
    about: portfolio.about,
    approach: portfolio.approach,
    email: portfolio.email,
    education: portfolio.education,
  },
  experience: portfolio.experience,
  projects: portfolio.projects.map(({ title, description, stack, detail, outcomes }) => ({
    title,
    description,
    stack,
    detail,
    outcomes,
  })),
  skills: skills.map(({ node, category }) => ({
    name: node.name,
    category,
    level: levels[node.level!].label,
    description: node.description,
  })),
});

const system = `You answer visitors' questions about ${portfolio.name}, a developer, on his portfolio site. Use only the facts in this JSON; if the answer isn't there, say you don't know and suggest emailing ${portfolio.email}. Answer in at most three short sentences of plain text, in the third person.

${context}`;

/** Without a model: match the question against skills, projects and a few topics. */
function localAnswer(question: string) {
  const q = question.toLowerCase();
  const job = portfolio.experience.find((j) =>
    q.includes(
      j.organization
        .toLowerCase()
        .replace(/\.com$/, "")
        .split(" ")[0],
    ),
  );
  if (job) return `At ${job.organization} (${job.dates}): ${job.highlights[0]}`;
  const project = portfolio.projects.find((p) => q.includes(p.title.toLowerCase()));
  if (project) return `${project.title}: ${project.description} Built with ${project.stack}.`;
  const skill = skills.find(({ node }) => q.includes(node.name.toLowerCase()));
  if (skill) {
    return `${skill.node.name} (${skill.category}) — ${levels[skill.node.level!].label}. ${skill.node.description}`;
  }
  if (/hire|contact|email|reach/.test(q))
    return `Email ${portfolio.email}, or use the Contact page.`;
  if (/work|job|experience|company|current/.test(q)) {
    const job = portfolio.experience.find((j) => j.current) ?? portfolio.experience[0];
    return `He's a ${job.role} at ${job.organization}. ${job.summary}`;
  }
  if (/project|built|build/.test(q)) {
    return `Projects: ${portfolio.projects.map((p) => `${p.title} (${p.category})`).join(", ")}.`;
  }
  return portfolio.about;
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > PER_WINDOW;
}

export async function POST(request: Request) {
  let question = "";
  try {
    const body = await request.json();
    question = typeof body.question === "string" ? body.question.trim() : "";
  } catch {
    // Handled below as a missing question.
  }
  if (!question) return Response.json({ error: "Send { question }" }, { status: 400 });
  if (question.length > MAX_QUESTION) {
    return Response.json({ error: `Keep it under ${MAX_QUESTION} characters` }, { status: 413 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many questions — try again in a minute" }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ answer: localAnswer(question), source: "portfolio data" });
  }
  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages: [{ role: "user", content: question }],
    });
    if (response.stop_reason === "refusal") {
      return Response.json({ answer: localAnswer(question), source: "portfolio data" });
    }
    const answer = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();
    return Response.json({ answer: answer || localAnswer(question), source: "claude" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ answer: localAnswer(question), source: "portfolio data (busy)" });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`ask: Claude API error ${error.status}`);
    }
    return Response.json({ answer: localAnswer(question), source: "portfolio data" });
  }
}
