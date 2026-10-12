import {
  NO_TRACK_COOKIE,
  type EventType,
  type TrackContext,
  type TrackEvent,
} from "./analytics-events";

// Client-side event queue: batches events and sends them to /api/track in the
// background. Silent everywhere: analytics must never break the page.

const queue: TrackEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let contextSent = false;

/** Opted out: Global Privacy Control, or the `notrack` cookie (set by ?notrack=1). */
export function trackingDisabled() {
  if (typeof window === "undefined") return true;
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  return (
    gpc === true || document.cookie.split("; ").some((c) => c.startsWith(`${NO_TRACK_COOKIE}=`))
  );
}

function context(): TrackContext {
  const params = new URLSearchParams(location.search);
  return {
    referrer: document.referrer || undefined,
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utm: {
      source: params.get("utm_source") ?? undefined,
      medium: params.get("utm_medium") ?? undefined,
      campaign: params.get("utm_campaign") ?? undefined,
    },
  };
}

/** Sends now; `beacon` survives the page being closed. */
export function flush(beacon = false) {
  clearTimeout(timer);
  if (!queue.length || trackingDisabled()) {
    queue.length = 0;
    return;
  }
  const payload = JSON.stringify({
    events: queue.splice(0),
    context: contextSent ? undefined : context(),
  });
  contextSent = true;
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    return;
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function track(type: EventType, detail?: Record<string, unknown>, path?: string) {
  if (trackingDisabled()) return;
  queue.push({ type, detail, path: path ?? location.pathname + location.search });
  clearTimeout(timer);
  timer = setTimeout(flush, 400);
}
