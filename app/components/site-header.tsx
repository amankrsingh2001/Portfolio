"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portfolio } from "../data/portfolio";
import { routes } from "../data/routes";
import { AccentSwitch } from "./accent-switch";
import { TerminalButton } from "./command-terminal";
import { ThemeSwitch } from "./theme-switch";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/">
          {portfolio.name}
        </Link>
        <nav aria-label="Main">
          {routes
            .filter((route) => route.nav)
            .map((route) => (
              <Link
                key={route.href}
                href={route.href}
                aria-current={pathname === route.href ? "page" : undefined}
              >
                {route.label}
              </Link>
            ))}
        </nav>
        <div className="appearance-controls">
          <TerminalButton />
          <AccentSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
