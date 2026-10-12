"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { NO_TRACK_COOKIE } from "../lib/analytics-events";
import { flush, track } from "../lib/track";
import { portfolio } from "../data/portfolio";

// Records what a visitor does: pages and time on each, résumé views and downloads,
// call/email clicks, outbound links, and copying the phone number or email.
// Visit any page with ?notrack=1 to stop tracking this browser (do this for yourself).

const phoneDigits = portfolio.phone.label.replace(/\D/g, "").slice(-10);

/** What a copied selection was: the phone number, the email, or something else. */
function classify(copied: string) {
  const digits = copied.replace(/\D/g, "");
  if (digits.length >= 10 && digits.includes(phoneDigits)) return "phone";
  if (copied.toLowerCase().includes(portfolio.email.toLowerCase())) return "email";
  return "other";
}

export function Analytics() {
  const pathname = usePathname();
  const entered = useRef<{ path: string; at: number } | null>(null);

  // ?notrack=1 opts this browser out for a year.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("notrack") === "1") {
      document.cookie = `${NO_TRACK_COOKIE}=1; max-age=31536000; path=/; samesite=lax`;
    } else if (params.get("notrack") === "0") {
      document.cookie = `${NO_TRACK_COOKIE}=; max-age=0; path=/`;
    }
  }, []);

  // A page view per route, plus how long the previous page was open.
  useEffect(() => {
    // Effects can re-run for the same route (React dev mode); count each route once.
    if (entered.current?.path === pathname) return;
    const now = performance.now();
    if (entered.current) {
      track("page_leave", { durationMs: Math.round(now - entered.current.at) }, entered.current.path);
    }
    entered.current = { path: pathname, at: now };
    track("pageview");
    if (pathname === "/resume") {
      const view = new URLSearchParams(location.search).get("view") ?? "pdf";
      track("resume_view", { view });
    }
  }, [pathname]);

  useEffect(() => {
    const onCopy = () => {
      const copied = document.getSelection()?.toString().trim() ?? "";
      if (!copied) return;
      const what = classify(copied);
      track("copy", {
        what,
        via: "selection",
        text: what === "other" ? copied.slice(0, 120) : undefined,
      });
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!link || !href) return;
      if (href.startsWith("tel:")) track("contact_click", { kind: "call" });
      else if (href.startsWith("mailto:")) track("contact_click", { kind: "email" });
      else if (href === portfolio.resume) {
        track(link.hasAttribute("download") ? "resume_download" : "resume_open", { via: "link" });
      } else if (/^https?:\/\//.test(href) && !href.includes(location.host)) {
        track("outbound", { href: href.slice(0, 200) });
      }
    };
    // Leaving or hiding the tab: record time on the page and send what's queued.
    const onHide = () => {
      if (document.visibilityState !== "hidden" || !entered.current) return;
      const { path, at } = entered.current;
      track("page_leave", { durationMs: Math.round(performance.now() - at) }, path);
      entered.current = { path, at: performance.now() };
      flush(true);
    };
    document.addEventListener("copy", onCopy);
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return null;
}
