import { cookies } from "next/headers";
import { portfolio } from "../../data/portfolio";
import { prisma } from "../../lib/db";

// There is no mail service behind this site, so a valid message comes back as a
// ready-to-send mailto link; the terminal opens it in the visitor's mail app.

const LIMITS = { name: 80, email: 120, message: 2000 };

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON: { name, email, message }" }, { status: 400 });
  }
  const field = (key: keyof typeof LIMITS) =>
    typeof body[key] === "string" ? (body[key] as string).trim().slice(0, LIMITS[key]) : "";
  const name = field("name");
  const email = field("email");
  const message = field("message");
  const errors: string[] = [];
  if (!name) errors.push("name is required");
  if (!message) errors.push("message is required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email looks invalid");
  if (errors.length) return Response.json({ error: "Validation failed", errors }, { status: 422 });

  // Attach the sender's name to their visit history, if they've been tracked.
  const visitor = (await cookies()).get("vid")?.value;
  if (prisma && visitor) {
    await prisma.visitor
      .updateMany({ where: { id: visitor }, data: { name, email: email || undefined } })
      .catch(() => {});
  }

  const subject = `Hello from ${name}`;
  const text = `${message}\n\n— ${name}${email ? ` <${email}>` : ""}`;
  return Response.json(
    {
      status: "accepted",
      next: "Opening your mail app with the message filled in.",
      mailto: `mailto:${portfolio.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    },
    { status: 202 },
  );
}
