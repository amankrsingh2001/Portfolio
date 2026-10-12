// Logos for the marquee on the home page, in the order they scroll past.
// Brand marks come from simple-icons (CC0). Brands it doesn't carry get a monogram tile.

import {
  siAnthropic,
  siClaude,
  siCplusplus,
  siCss,
  siCursor,
  siExpress,
  siGit,
  siGithubactions,
  siGithubcopilot,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siModelcontextprotocol,
  siMongodb,
  siMongoose,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPostman,
  siPrisma,
  siReact,
  siRedis,
  siRedux,
  siSocketdotio,
  siTailwindcss,
  siTypescript,
  siVercel,
} from "simple-icons";

type Icon = { title: string; hex: string; path: string };
/** `skill`: the node id in skill-tree.ts the tile opens. */
export type SkillLogo = { name: string; color: string; skill: string } & (
  | { path: string }
  | { monogram: string }
);

const icon = (skill: string, si: Icon, name = si.title): SkillLogo => ({
  name,
  skill,
  color: `#${si.hex}`,
  path: si.path,
});
const monogram = (skill: string, name: string, letters: string, color: string): SkillLogo => ({
  name,
  skill,
  color,
  monogram: letters,
});

export const skillLogos: SkillLogo[] = [
  icon("javascript", siJavascript),
  icon("typescript", siTypescript),
  icon("cpp", siCplusplus, "C++"),
  icon("react", siReact),
  icon("nextjs", siNextdotjs),
  icon("redux", siRedux),
  icon("tailwind", siTailwindcss),
  icon("html-css", siHtml5, "HTML"),
  icon("html-css", siCss, "CSS"),
  icon("node", siNodedotjs),
  icon("express", siExpress),
  icon("websocket", siSocketdotio, "WebSocket"),
  icon("pubsub", siRedis),
  icon("jwt", siJsonwebtokens, "JWT"),
  icon("mongodb", siMongodb),
  icon("mongoose", siMongoose),
  icon("postgres", siPostgresql),
  icon("prisma", siPrisma),
  monogram("azure", "Azure", "Az", "#0078D4"),
  icon("vercel", siVercel),
  icon("git", siGit),
  icon("cicd", siGithubactions, "CI/CD"),
  icon("postman", siPostman),
  icon("claude-code", siClaude, "Claude Code"),
  icon("subagents", siAnthropic),
  icon("mcp", siModelcontextprotocol, "MCP"),
  monogram("codex", "OpenAI Codex", "Cx", "#10A37F"),
  monogram("devin", "Devin", "Dv", "#3B82F6"),
  icon("gemini", siGooglegemini, "Gemini"),
  monogram("antigravity", "Antigravity", "Ag", "#4285F4"),
  icon("cursor", siCursor),
  icon("cursor", siGithubcopilot, "Copilot"),
];
