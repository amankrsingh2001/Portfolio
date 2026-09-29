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

Native anchor navigation and project disclosures work without JavaScript. Small client components power the theme switch, the project preview and email copying. CSS respects reduced motion, with content visible by default. The theme switch in the header offers System, Light and Dark. System follows the operating system setting, and a Light or Dark choice persists in local storage. An inline script in `app/layout.tsx` applies the theme before first paint. All colors are tokens at the top of `app/globals.css`, so a new palette only needs those values changed. 

## Architecture

The Architecture section uses responsive semantic components in `app/components/architecture.tsx`, with résumé-grounded data in the `architectures` export of `app/data/portfolio.ts`. ClassNotion, Tracker-Pro, and the Bluetris Azure workflow are separate logical views. They do not imply undocumented deployments or mix employer infrastructure into personal projects. Flows switch to vertical on narrow screens.
