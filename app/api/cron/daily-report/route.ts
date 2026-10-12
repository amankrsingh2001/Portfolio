import { Resend } from "resend";
import { portfolio } from "../../../data/portfolio";
import { buildReport } from "../../../lib/daily-report";
import { prisma } from "../../../lib/db";

// The daily worker: Vercel Cron calls this every morning (see vercel.json) with
// `Authorization: Bearer $CRON_SECRET`. It emails the last 24 hours of visits and
// deletes events older than the retention window.
// Preview without sending: GET /api/cron/daily-report?preview=1 (same header).

const RETENTION_DAYS = 180;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!prisma) return Response.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  const db = prisma;

  const until = new Date();
  const since = new Date(until.getTime() - 24 * 60 * 60 * 1000);
  let report: Awaited<ReturnType<typeof buildReport>>;
  try {
    report = await buildReport(since, until);
  } catch (error) {
    // Error code only: Prisma messages can include the database host.
    const code =
      (error as { code?: unknown; errorCode?: unknown }).code ??
      (error as { errorCode?: unknown }).errorCode;
    console.error(`daily-report: query failed (${String(code ?? (error as Error).name)})`);
    return Response.json(
      {
        error:
          "Database query failed. Is DATABASE_URL right and have migrations run (pnpm db:migrate)?",
      },
      { status: 500 },
    );
  }

  if (new URL(request.url).searchParams.get("preview") === "1") {
    return new Response(report.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const cutoff = new Date(until.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  // Retention: a failed purge shouldn't stop the report from going out.
  await db.event
    .deleteMany({ where: { createdAt: { lt: cutoff } } })
    .then(() => db.visitor.deleteMany({ where: { events: { none: {} } } }))
    .catch(() => console.error("daily-report: retention purge failed"));

  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: "RESEND_API_KEY is not set", stats: report.stats },
      { status: 503 },
    );
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.REPORT_FROM ?? "Portfolio <onboarding@resend.dev>",
    to: process.env.REPORT_EMAIL ?? portfolio.email,
    subject: report.subject,
    html: report.html,
  });
  if (error) return Response.json({ error: error.message, stats: report.stats }, { status: 502 });
  return Response.json({ sent: true, id: data?.id, stats: report.stats });
}
