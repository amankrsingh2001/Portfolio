// Event types the tracker may send, shared by the client tracker and /api/track.

export const EVENT_TYPES = [
  "pageview",
  "page_leave", // { durationMs }
  "resume_view", // { view: "pdf" | "terminal" }
  "resume_download", // { via }
  "resume_open", // opened the PDF in a new tab
  "copy", // { what: "phone" | "email" | "other", via, text? }
  "contact_click", // { kind: "call" | "email" }
  "outbound", // { href }
  "terminal", // { command }
  "identify", // { name, company?, email? }
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type TrackEvent = { type: EventType; path?: string; detail?: Record<string, unknown> };
export type TrackContext = {
  referrer?: string;
  language?: string;
  screen?: string;
  timezone?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
};

/** Visitors who opt out (and the site owner) set this cookie. */
export const NO_TRACK_COOKIE = "notrack";
