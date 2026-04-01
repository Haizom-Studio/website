import { getClientIp, getLocationLabel } from "@/lib/client-geo";
import { getD1Database } from "@/lib/d1";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as { email?: string };
    const email =
      typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return Response.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const db = getD1Database();
    if (!db) {
      return Response.json(
        { success: false, message: "DB not connected (binding issue)" },
        { status: 500 }
      );
    }

    const existing = await db
      .prepare(`SELECT email FROM newsletter_subscribers WHERE email = ?`)
      .bind(email)
      .first();

    if (existing) {
      return Response.json(
        { success: false, message: "This email is already subscribed" },
        { status: 409 }
      );
    }

    const ip = getClientIp(req);
    const location = getLocationLabel(req);

    await db
      .prepare(
        `INSERT INTO newsletter_subscribers (email, created_at, ip_address, location)
         VALUES (?, datetime('now'), ?, ?)`
      )
      .bind(email, ip || null, location || null)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, message }, { status: 500 });
  }
}
