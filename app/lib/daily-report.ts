import { portfolio } from "../data/portfolio";
import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "./db";

// Builds the daily visitor report: one card per visitor in the window, the most
// interesting (résumé downloads, copied contact details) first.

export type VisitorRow = Prisma.VisitorGetPayload<{ include: { events: true } }>;
type Detail = Record<string, unknown>;
const detailOf = (event: { detail: Prisma.JsonValue }) =>
  (event.detail && typeof event.detail === "object" && !Array.isArray(event.detail)
    ? event.detail
    : {}) as Detail;

const ZONE = "Asia/Kolkata";

const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const time = (at: Date) =>
  at.toLocaleTimeString("en-IN", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });

const duration = (ms: number) =>
  ms < 60_000
    ? `${Math.max(1, Math.round(ms / 1000))}s`
    : `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;

const host = (url: string | null) => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function summarize(v: VisitorRow) {
  const has = (type: string, key?: string, value?: string) =>
    v.events.some((e) => e.type === type && (!key || detailOf(e)[key] === value));
  const flags = [
    has("resume_download") && "Downloaded résumé",
    has("resume_open") && "Opened résumé PDF",
    has("resume_view") && !has("resume_download") && "Viewed résumé",
    has("copy", "what", "phone") && "Copied your phone number",
    has("copy", "what", "email") && "Copied your email",
    has("contact_click", "kind", "call") && "Tapped to call",
    has("contact_click", "kind", "email") && "Clicked email",
  ].filter(Boolean) as string[];
  // Each page view, with the time spent from the matching page_leave events.
  const pages = v.events
    .filter((e) => e.type === "pageview")
    .map((view) => {
      const spent = v.events
        .filter(
          (e) =>
            e.type === "page_leave" &&
            e.path?.split("?")[0] === view.path?.split("?")[0] &&
            e.createdAt >= view.createdAt,
        )
        .reduce((sum, e) => sum + Number(detailOf(e).durationMs ?? 0), 0);
      return { at: view.createdAt, path: view.path ?? "/", spent };
    });
  const commands = v.events
    .filter((e) => e.type === "terminal")
    .map((e) => String(detailOf(e).command ?? ""));
  const copiedOther = v.events
    .filter((e) => e.type === "copy" && detailOf(e).what === "other" && detailOf(e).text)
    .map((e) => String(detailOf(e).text));
  const outbound = v.events
    .filter((e) => e.type === "outbound")
    .map((e) => String(detailOf(e).href ?? ""));
  const score = flags.length * 10 + pages.length + commands.length;
  return { flags, pages, commands, copiedOther, outbound, score };
}

function card(v: VisitorRow, since: Date) {
  const s = summarize(v);
  const place = [v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown location";
  const device = [
    v.browser && `${v.browser} ${v.browserVersion?.split(".")[0] ?? ""}`.trim(),
    v.os && `${v.os} ${v.osVersion ?? ""}`.trim(),
    [v.deviceVendor, v.deviceModel].filter(Boolean).join(" ") || v.deviceType,
  ]
    .filter(Boolean)
    .join(" · ");
  const returning = v.firstSeen < since;
  const who = v.name
    ? `${esc(v.name)}${v.company ? ` · ${esc(v.company)}` : ""}${v.email ? ` · ${esc(v.email)}` : ""}`
    : `Visitor ${esc(v.id.slice(0, 8))}`;
  const from = host(v.referrer) ?? (v.utmSource ? `utm: ${v.utmSource}` : "direct");
  const badge = (label: string) =>
    `<span style="display:inline-block;margin:0 6px 6px 0;padding:3px 9px;border-radius:999px;background:#fff1e6;color:#9a3c12;font-size:12px">${esc(label)}</span>`;
  return `
  <div style="margin:0 0 16px;padding:16px 18px;border:1px solid #e6e3dc;border-radius:12px;background:#fff">
    <div style="font-size:16px;font-weight:600;color:#1d2833">${who}</div>
    <div style="margin:4px 0 10px;color:#5b6670;font-size:13px">
      ${esc(place)} · ${esc(device)}${v.screen ? ` · ${esc(v.screen)}` : ""}<br>
      From ${esc(from)} · ${returning ? `Returning (visit ${v.visits})` : "First visit"}${v.language ? ` · ${esc(v.language)}` : ""}
    </div>
    ${s.flags.length ? `<div>${s.flags.map(badge).join("")}</div>` : ""}
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1d2833">
      ${s.pages
        .map(
          (p) =>
            `<tr><td style="padding:3px 10px 3px 0;color:#8a9199;width:56px">${time(p.at)}</td><td style="padding:3px 0">${esc(p.path)}</td><td style="padding:3px 0;text-align:right;color:#8a9199">${p.spent ? duration(p.spent) : ""}</td></tr>`,
        )
        .join("")}
    </table>
    ${s.commands.length ? `<div style="margin-top:10px;font-size:12px;color:#5b6670">Terminal: <code>${s.commands.map(esc).join("</code>, <code>")}</code></div>` : ""}
    ${s.outbound.length ? `<div style="margin-top:6px;font-size:12px;color:#5b6670">Opened: ${s.outbound.map((h) => esc(host(h))).join(", ")}</div>` : ""}
    ${s.copiedOther.length ? `<div style="margin-top:6px;font-size:12px;color:#5b6670">Also copied: “${s.copiedOther.map(esc).join("”, “")}”</div>` : ""}
  </div>`;
}

export async function buildReport(since: Date, until: Date) {
  if (!prisma) throw new Error("DATABASE_URL is not set");
  // Everyone with activity in the window, with just that window's events, oldest first.
  const window = { createdAt: { gte: since, lt: until } };
  const rows = await prisma.visitor.findMany({
    where: { events: { some: window } },
    include: { events: { where: window, orderBy: { createdAt: "asc" } } },
  });
  return renderReport(rows, since, until);
}

/** The email for a set of visitors; separate from the query so it can be previewed. */
export function renderReport(rows: VisitorRow[], since: Date, until: Date) {
  const visitors = rows
    .map((v) => ({ v, score: summarize(v).score }))
    .sort((a, b) => b.score - a.score)
    .map(({ v }) => v);
  const count = (type: string, key?: string, value?: string) =>
    visitors.filter((v) =>
      v.events.some((e) => e.type === type && (!key || detailOf(e)[key] === value)),
    ).length;
  const stats = {
    visitors: visitors.length,
    newVisitors: visitors.filter((v) => v.firstSeen >= since).length,
    pageviews: visitors.reduce(
      (n, v) => n + v.events.filter((e) => e.type === "pageview").length,
      0,
    ),
    resumeDownloads: count("resume_download"),
    contactCopies: count("copy", "what", "phone") + count("copy", "what", "email"),
  };
  const day = until.toLocaleDateString("en-IN", { timeZone: ZONE, day: "numeric", month: "short" });
  const subject = stats.visitors
    ? `Portfolio · ${stats.visitors} visitor${stats.visitors === 1 ? "" : "s"} · ${stats.resumeDownloads} résumé download${stats.resumeDownloads === 1 ? "" : "s"} · ${day}`
    : `Portfolio · no visitors · ${day}`;
  const stat = (n: number, label: string) =>
    `<td style="padding:12px;text-align:center"><div style="font-size:22px;font-weight:600;color:#1d2833">${n}</div><div style="font-size:12px;color:#8a9199">${label}</div></td>`;
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f3ee;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto">
    <h1 style="margin:0 0 4px;font-size:20px;color:#1d2833">Who visited your portfolio</h1>
    <p style="margin:0 0 16px;color:#5b6670;font-size:13px">${esc(since.toLocaleString("en-IN", { timeZone: ZONE }))} – ${esc(until.toLocaleString("en-IN", { timeZone: ZONE }))} IST</p>
    <table style="width:100%;margin:0 0 20px;border:1px solid #e6e3dc;border-radius:12px;background:#fff;border-collapse:separate"><tr>
      ${stat(stats.visitors, "visitors")}${stat(stats.newVisitors, "new")}${stat(stats.pageviews, "page views")}${stat(stats.resumeDownloads, "résumé downloads")}${stat(stats.contactCopies, "copied contact")}
    </tr></table>
    ${visitors.length ? visitors.map((v) => card(v, since)).join("") : `<p style="color:#5b6670">No one visited in the last 24 hours.</p>`}
    <p style="margin-top:24px;color:#8a9199;font-size:11px">Locations are approximate (IP-based). Names appear only when a visitor introduced themselves. Sent by ${esc(portfolio.name)}'s portfolio.</p>
  </div></body></html>`;
  return { subject, html, stats };
}
