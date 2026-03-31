export const runtime = 'edge';

// D1: CREATE TABLE IF NOT EXISTS newsletter_subscribers (
//   email TEXT PRIMARY KEY NOT NULL,
//   created_at TEXT NOT NULL DEFAULT (datetime('now'))
// );

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const data = await req.json();
    const email =
      typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';

    if (!email || !EMAIL_RE.test(email)) {
      return Response.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    const db = process.env.DB;

    if (!db) {
      return Response.json(
        { success: false, message: 'DB not connected (binding issue)' },
        { status: 500 }
      );
    }

    const existing = await db
      .prepare(`SELECT email FROM newsletter_subscribers WHERE email = ?`)
      .bind(email)
      .first();

    if (existing) {
      return Response.json(
        { success: false, message: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    await db
      .prepare(
        `INSERT INTO newsletter_subscribers (email, created_at) VALUES (?, datetime('now'))`
      )
      .bind(email)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, message: err.toString() },
      { status: 500 }
    );
  }
}
