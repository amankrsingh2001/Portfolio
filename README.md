# Aman Kumar Singh — Personal portfolio

An editorial portfolio with saved dark and light themes built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. No animation or UI dependencies.

## Run

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. For production verification, run `pnpm lint`, `pnpm build`, then `pnpm start`.

## Content

`app/data/portfolio.ts` contains Aman's profile, contact information, project links and outcomes, skills, employment history, education, and certification. These details are sourced from the supplied résumé. Approximate metrics retain their qualifiers. Employment dates are preserved; the résumé's inconsistent aggregate experience total is not repeated.

`public/aman-kumar-singh-resume.pdf` is the original résumé, available from the download links. Replace this file when updating the résumé. Contact details and the PDF are served publicly when this site is deployed.

Each project shows a screenshot of its live site. On desktop, a preview follows the cursor while you hover a project, and it also appears when a project link gets keyboard focus. On touch screens, the screenshot sits inline in the project. The screenshots live in `public/projects/` and are set per project by the `image` field in `app/data/portfolio.ts`.

Metadata lives in `app/layout.tsx`, the identity icon in `app/icon.svg`, and design tokens and responsive styles in `app/globals.css`.

## Interaction and accessibility

On the first visit in each browser, the hero plays a decorative black-hole scene with a glowing accretion disk and drifting stars. It fades out after 8.5 seconds, restoring the usual illustration. A local-storage flag (`aman-portfolio-blackhole-seen-v1`) prevents repeat playback; clearing that key lets you preview it again. Reduced-motion visitors see a still scene. The canvas stops rendering and releases its backing buffer when the introduction finishes.

The developer illustration follows the mouse with his eyes. Hovering him or choosing “Say hi” triggers the keyboard-toss reaction. Click the monitor or “Ship it” for a build celebration, or choose “Coffee break” for a recharge scene. All three actions have keyboard-accessible buttons and announced status text; reduced motion keeps the reactions still.

Native anchor navigation and project disclosures work without JavaScript. Small client components power the theme switch, the project preview and email copying. CSS respects reduced motion, with content visible by default. The theme switch in the header offers System, Light and Dark. System follows the operating system setting, and a Light or Dark choice persists in local storage. An inline script in `app/layout.tsx` applies the theme before first paint. The Accent dropdown offers Orange, Ocean, Violet (default), Mint, Rose, and Gold, persists the selection, and updates the site’s accent colors. Palette values live in `app/appearance.css`, with options and the default in `app/data/accents.ts`. 

## Projects and architecture

Work and Systems are merged into one Projects section (`#projects`). The old `#work` and `#systems` anchors still lead here. Each personal project keeps its screenshot preview, live/source links, technology tags, build notes, and outcomes alongside its diagram. The Bluetris workflow is labelled as professional work and has no invented personal-project links.

The architecture viewer is in `app/components/architecture.tsx`, styled by `app/systems.css`, with résumé-grounded data in the `architectures` export of `app/data/portfolio.ts`. Choose ClassNotion, Tracker-Pro, or the Bluetris Azure workflow, select a layer to inspect its connections, or use “Trace the flow” to step through the main path. ClassNotion's authentication and payment integrations branch from its backend. The diagrams show logical relationships and do not imply undocumented deployments or mix employer infrastructure into personal projects. Flows switch to vertical on narrow screens, and reduced motion disables the animated signals.
