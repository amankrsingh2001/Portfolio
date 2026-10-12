import { cookies } from "next/headers";
import { NextResponse, userAgent, type NextRequest } from "next/server";
import type { Prisma } from "../../../generated/prisma/client";
import { cleanJson } from "../../lib/clean-json";
import { prisma } from "../../lib/db";
import {
  EVENT_TYPES,
  NO_TRACK_COOKIE,
  type TrackContext,
  type TrackEvent,
} from "../../lib/analytics-events";

// POST /api/track { events, context? } — records what a visitor does. The visitor is
// identified by a first-party cookie; location is the host's approximate IP
// geolocation (Vercel headers). Bots, opted-out visitors and the owner are skipped.

const YEAR = 60 * 60 * 24 * 365;
const SESSION = 60 * 30;
const MAX_EVENTS = 25;
const MAX_DETAIL = 2000;

const text = (value: unknown, max = 300) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

async function hashIp(ip: string | null) {
  if (!ip) return null;
  const data = new TextEncoder().encode(`${process.env.ANALYTICS_SALT ?? ""}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex").slice(0, 32);
}

export async function POST(request: NextRequest) {
  const store = await cookies();
  const ua = userAgent(request);
  if (!prisma || ua.isBot || store.get(NO_TRACK_COOKIE))
    return new NextResponse(null, { status: 204 });

  let body: { events?: unknown; context?: TrackContext };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const events = (Array.isArray(body.events) ? body.events : [])
    .slice(0, MAX_EVENTS)
    .filter(
      (e): e is TrackEvent =>
        !!e && typeof e === "object" && EVENT_TYPES.includes((e as TrackEvent).type),
    )
    .map((e) => {
      const cleaned = e.detail && typeof e.detail === "object" ? cleanJson(e.detail) : null;
      const detail =
        cleaned && typeof cleaned === "object" && !Array.isArray(cleaned) ? cleaned : {};
      return {
        type: e.type,
        path: text(e.path),
        detail: (JSON.stringify(detail).length > MAX_DETAIL ? {} : detail) as Prisma.InputJsonValue,
      };
    });
  if (!events.length) return new NextResponse(null, { status: 204 });

  const visitorId = store.get("vid")?.value ?? crypto.randomUUID();
  const sessionId = store.get("sid")?.value ?? crypto.randomUUID();
  const newSession = !store.get("sid");

  const h = request.headers;
  const header = (name: string) => {
    const value = h.get(name);
    return value ? decodeURIComponent(value) : null;
  };
  const number = (name: string) => {
    const value = Number.parseFloat(h.get(name) ?? "");
    return Number.isFinite(value) ? value : null;
  };
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip");
  const context = body.context ?? {};
  const referrer = text(context.referrer);
  // A referrer from this site itself isn't a source.
  const source = referrer && !referrer.includes(request.nextUrl.host) ? referrer : null;

  const who = (events.find((e) => e.type === "identify")?.detail ?? {}) as Record<string, unknown>;

  const ipHash = await hashIp(ip);

  // What this request knows about the visitor. On a returning visitor, a field is only
  // overwritten when the new value is known (null means "not known this time").
  const seen = {
    city: header("x-vercel-ip-city"),
    region: header("x-vercel-ip-country-region"),
    country: header("x-vercel-ip-country"),
    latitude: number("x-vercel-ip-latitude"),
    longitude: number("x-vercel-ip-longitude"),
    timezone: header("x-vercel-ip-timezone") ?? text(context.timezone, 60),
    browser: ua.browser.name ?? null,
    browserVersion: ua.browser.version ?? null,
    os: ua.os.name ?? null,
    osVersion: ua.os.version ?? null,
    deviceType: ua.device.type ?? "desktop",
    deviceVendor: ua.device.vendor ?? null,
    deviceModel: ua.device.model ?? null,
    language: text(context.language, 40),
    screen: text(context.screen, 20),
    name: text(who.name, 100),
    email: text(who.email, 200),
    company: text(who.company, 100),
  };
  const known = Object.fromEntries(
    Object.entries(seen).map(([key, value]) => [key, value ?? undefined]),
  ) as { [K in keyof typeof seen]: Exclude<(typeof seen)[K], null> | undefined };

  try {
    await prisma.$transaction([
      prisma.visitor.upsert({
        where: { id: visitorId },
        create: {
          id: visitorId,
          ipHash,
          ...seen,
          // First touch only: where they came from on their first visit.
          referrer: source,
          utmSource: text(context.utm?.source, 100),
          utmMedium: text(context.utm?.medium, 100),
          utmCampaign: text(context.utm?.campaign, 100),
        },
        update: {
          ...known,
          lastSeen: new Date(),
          visits: newSession ? { increment: 1 } : undefined,
        },
      }),
      // Keep the first IP hash we saw for this browser.
      prisma.visitor.updateMany({ where: { id: visitorId, ipHash: null }, data: { ipHash } }),
      prisma.event.createMany({
        data: events.map((e) => ({
          visitorId,
          sessionId,
          type: e.type,
          path: e.path,
          detail: e.detail,
        })),
      }),
    ]);
  } catch (error) {
    // Analytics must never break the page: log the error code only (messages can
    // include the database host) and answer as if it was recorded.
    const code =
      (error as { code?: unknown; errorCode?: unknown }).code ??
      (error as { errorCode?: unknown }).errorCode;
    console.error(`track: database write failed (${String(code ?? (error as Error).name)})`);
    return new NextResponse(null, { status: 204 });
  }

  const response = new NextResponse(null, { status: 204 });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("vid", visitorId, {
    maxAge: YEAR,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  // Sliding: a session ends after 30 minutes without activity.
  response.cookies.set("sid", sessionId, {
    maxAge: SESSION,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  return response;
}
