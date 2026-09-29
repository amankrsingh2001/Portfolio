// Skill tree data. The UI in app/components/skill-tree.tsx renders whatever is here:
// add, remove or nest skills by editing this file only.
//
// Levels are descriptive, not measurements. They were estimated from where each
// skill appears in the résumé (jobs and projects) — adjust them to taste.
// `usedIn` must only reference real places from `places` below.

import { portfolio } from "./portfolio";

export type Level = "exploring" | "comfortable" | "proficient" | "advanced";

export const levels: Record<Level, { label: string; rank: number; hint: string }> = {
  exploring: { label: "Exploring", rank: 1, hint: "Learning it, early projects" },
  comfortable: { label: "Comfortable", rank: 2, hint: "Used it to ship features" },
  proficient: { label: "Proficient", rank: 3, hint: "Use it regularly and confidently" },
  advanced: { label: "Advanced", rank: 4, hint: "Core of my daily work" },
};

export type Place = { name: string; kind: "Project" | "Work"; href?: string };

const [classnotion, trackerpro] = portfolio.projects;

export const places: Record<string, Place> = {
  classnotion: { name: classnotion.title, kind: "Project", href: classnotion.demo },
  trackerpro: { name: trackerpro.title, kind: "Project", href: trackerpro.demo },
  sarv: { name: "Sarv.com", kind: "Work" },
  bluetris: { name: "Bluetris Technologies", kind: "Work" },
  lonex: { name: "Lonex Technologies", kind: "Work" },
};

export type SkillNode = {
  id: string;
  name: string;
  /** One line shown in the hover card and detail panel. */
  description: string;
  level?: Level;
  usedIn?: (keyof typeof places)[];
  related?: string[];
  /** Shown in the "Currently leveling up" line. */
  levelingUp?: boolean;
  children?: SkillNode[];
};

export const skillTree: SkillNode = {
  id: "core",
  name: "Full Stack Developer",
  description: "Building web products end to end since 2023.",
  children: [
    {
      id: "languages",
      name: "Languages",
      description: "What everything else is written in.",
      children: [
        {
          id: "javascript",
          name: "JavaScript",
          description: "The language behind every project and role so far.",
          level: "advanced",
          usedIn: ["sarv", "bluetris", "lonex", "classnotion", "trackerpro"],
          related: ["typescript", "node", "react"],
          children: [
            {
              id: "typescript",
              name: "TypeScript",
              description: "Typed React and Next.js components.",
              level: "proficient",
              usedIn: ["bluetris"],
              related: ["nextjs", "react"],
            },
          ],
        },
        {
          id: "sql",
          name: "SQL",
          description: "Relational queries and schema design.",
          level: "comfortable",
          usedIn: ["trackerpro"],
          related: ["postgres", "azure-sql"],
        },
      ],
    },
    {
      id: "frontend",
      name: "Frontend",
      description: "Interfaces people actually use.",
      children: [
        {
          id: "html-css",
          name: "HTML & CSS",
          description: "Semantic, responsive markup and styling.",
          level: "proficient",
          usedIn: ["classnotion", "trackerpro", "bluetris"],
          related: ["tailwind", "react"],
          children: [
            {
              id: "tailwind",
              name: "Tailwind CSS",
              description: "Utility-first styling for reusable components.",
              level: "proficient",
              usedIn: ["bluetris"],
              related: ["react", "nextjs"],
            },
          ],
        },
        {
          id: "react",
          name: "React",
          description: "Component-driven UIs, from course flows to dashboards.",
          level: "advanced",
          usedIn: ["sarv", "bluetris", "classnotion", "trackerpro"],
          related: ["nextjs", "typescript", "redux", "tailwind"],
          children: [
            {
              id: "redux",
              name: "Redux Thunk",
              description: "Async state for course and enrollment workflows.",
              level: "comfortable",
              usedIn: ["classnotion"],
              related: ["react"],
            },
            {
              id: "nextjs",
              name: "Next.js",
              description: "Server-rendered React apps and API routes.",
              level: "proficient",
              usedIn: ["bluetris", "trackerpro"],
              related: ["react", "typescript", "vercel", "prisma"],
              children: [
                {
                  id: "ssr",
                  name: "SSR & code splitting",
                  description: "Faster first loads through server rendering and lazy loading.",
                  level: "proficient",
                  usedIn: ["trackerpro", "bluetris"],
                  related: ["nextjs"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "backend",
      name: "Backend",
      description: "Services, APIs and real-time data.",
      children: [
        {
          id: "node",
          name: "Node.js",
          description: "Backend services in production at every role.",
          level: "advanced",
          usedIn: ["sarv", "bluetris", "lonex", "classnotion"],
          related: ["express", "websocket", "javascript"],
          children: [
            {
              id: "express",
              name: "Express.js",
              description: "REST backends with auth and payments.",
              level: "advanced",
              usedIn: ["lonex", "classnotion"],
              related: ["node", "rest", "jwt"],
              children: [
                {
                  id: "rest",
                  name: "REST API design",
                  description: "Reliable APIs between frontends and services.",
                  level: "advanced",
                  usedIn: ["sarv", "lonex", "classnotion"],
                  related: ["express", "jwt"],
                },
              ],
            },
            {
              id: "websocket",
              name: "WebSocket",
              description: "Real-time data sync between clients and server.",
              level: "comfortable",
              usedIn: ["bluetris"],
              related: ["pubsub", "node"],
              children: [
                {
                  id: "pubsub",
                  name: "Redis pub/sub",
                  description: "Fan-out for real-time updates.",
                  level: "comfortable",
                  usedIn: ["bluetris"],
                  related: ["websocket", "redis-sessions"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "security",
      name: "Security",
      description: "Keeping accounts and data safe.",
      children: [
        {
          id: "jwt",
          name: "JWT auth",
          description: "Token-based authentication for APIs.",
          level: "proficient",
          usedIn: ["lonex", "classnotion", "trackerpro"],
          related: ["rbac", "bcrypt", "express"],
          children: [
            {
              id: "rbac",
              name: "RBAC",
              description: "Role-based access control across product modules.",
              level: "comfortable",
              usedIn: ["lonex"],
              related: ["jwt"],
            },
          ],
        },
        {
          id: "bcrypt",
          name: "Bcrypt",
          description: "Password hashing.",
          level: "comfortable",
          usedIn: ["classnotion"],
          related: ["jwt"],
        },
        {
          id: "redis-sessions",
          name: "Redis sessions",
          description: "Secure token storage and concurrent sessions.",
          level: "comfortable",
          usedIn: ["bluetris"],
          related: ["jwt", "pubsub"],
        },
      ],
    },
    {
      id: "databases",
      name: "Databases",
      description: "Where the data lives.",
      children: [
        {
          id: "mongodb",
          name: "MongoDB",
          description: "Document storage for application data.",
          level: "proficient",
          usedIn: ["classnotion"],
          related: ["mongoose", "express"],
          children: [
            {
              id: "mongoose",
              name: "Mongoose",
              description: "Schemas and models on top of MongoDB.",
              level: "comfortable",
              related: ["mongodb"],
            },
          ],
        },
        {
          id: "postgres",
          name: "PostgreSQL",
          description: "Relational data for expense tracking.",
          level: "proficient",
          usedIn: ["trackerpro"],
          related: ["prisma", "sql"],
          children: [
            {
              id: "prisma",
              name: "Prisma",
              description: "Typed database access from Next.js.",
              level: "comfortable",
              usedIn: ["trackerpro"],
              related: ["postgres", "nextjs"],
            },
          ],
        },
        {
          id: "azure-sql",
          name: "Azure SQL",
          description: "Managed SQL Server on Azure.",
          level: "exploring",
          related: ["sql", "azure"],
        },
      ],
    },
    {
      id: "cloud",
      name: "Cloud & tools",
      description: "Shipping and running it.",
      children: [
        {
          id: "git",
          name: "Git",
          description: "Version control for everything.",
          level: "proficient",
          related: ["cicd"],
          children: [
            {
              id: "cicd",
              name: "CI/CD",
              description: "Automated build and deploy pipelines.",
              level: "exploring",
              levelingUp: true,
              related: ["git", "vercel"],
            },
          ],
        },
        {
          id: "vercel",
          name: "Vercel",
          description: "Deploying Next.js apps.",
          level: "comfortable",
          usedIn: ["trackerpro"],
          related: ["nextjs", "cicd"],
        },
        {
          id: "azure",
          name: "Azure",
          description: "Serverless processing and storage.",
          level: "comfortable",
          usedIn: ["bluetris"],
          related: ["azure-sql"],
          children: [
            {
              id: "azure-functions",
              name: "Function Apps",
              description: "Serverless parsing and validation of XML voyage data.",
              level: "comfortable",
              levelingUp: true,
              usedIn: ["bluetris"],
              related: ["azure-blob"],
            },
            {
              id: "azure-blob",
              name: "Blob Storage",
              description: "Storing processed output.",
              level: "comfortable",
              usedIn: ["bluetris"],
              related: ["azure-functions"],
            },
          ],
        },
        {
          id: "postman",
          name: "Postman",
          description: "Testing and documenting APIs.",
          level: "comfortable",
          related: ["rest"],
        },
      ],
    },
  ],
};
