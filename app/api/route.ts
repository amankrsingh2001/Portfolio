// GET /api — the index of the portfolio's API, as the terminal's `curl /api` shows it.

export function GET() {
  return Response.json({
    name: "aman-portfolio-api",
    version: "1.0.0",
    endpoints: {
      "GET /api/profile": "Who I am",
      "GET /api/projects": "Things I've built (?id=01)",
      "GET /api/experience": "Where I've worked",
      "GET /api/skills": "The skill tree, flattened (?level=advanced&category=backend&q=redis)",
      "GET /api/github": "Live GitHub stats",
      "POST /api/contact": "Send me a message: { name, email, message }",
      "POST /api/ask": "Ask about my work: { question }",
    },
  });
}
