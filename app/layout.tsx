import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./systems.css";
import "./appearance.css";
import { accents, accentStorageKey, defaultAccent } from "./data/accents";
import { portfolio } from "./data/portfolio";
import { Analytics } from "./components/analytics";
import { CommandTerminal } from "./components/command-terminal";
import { PageMotion } from "./components/page-motion";
import { SiteHeader } from "./components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${portfolio.name} — Full Stack Developer`,
    template: `%s — ${portfolio.name}`,
  },
  description:
    "Aman Kumar Singh is a full stack developer in Jaipur, building Node.js backends, React and Next.js applications, secure APIs, and real-time features.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    title: `${portfolio.name} — Full Stack Developer`,
    description: portfolio.intro,
    type: "website",
  },
};

// Runs before first paint so the saved or system theme never flashes.
// The storage key must match app/components/theme-switch.tsx.
const themeScript = `(function(){var t,a;try{t=localStorage.getItem("aman-portfolio-theme");a=localStorage.getItem("${accentStorageKey}")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.dataset.accent=${JSON.stringify(accents.map((accent) => accent.id))}.indexOf(a)!==-1?a:${JSON.stringify(defaultAccent)}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-accent={defaultAccent}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <PageMotion />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="container">
          {children}
        </main>
        <footer className="container site-footer">
          <span>
            © {new Date().getFullYear()} {portfolio.name}
          </span>
          <Link href="/privacy">Privacy</Link>
          <span className="footer-hint">
            Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> for the terminal
          </span>
        </footer>
        <CommandTerminal />
        <Analytics />
      </body>
    </html>
  );
}
