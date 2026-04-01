import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { getD1Database } from "@/lib/d1";

export const runtime = "edge";

export type NewsletterSubscriberRow = {
  email: string;
  created_at: string;
  ip_address: string | null;
  location: string | null;
  map_lat: number | null;
  map_lng: number | null;
};

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json(
      { error: "D1 is not bound. Add a D1 binding named DB in Cloudflare Pages." },
      { status: 503 }
    );
  }

  const { results } = await db
    .prepare(
      `SELECT email, created_at, ip_address, location, map_lat, map_lng
       FROM newsletter_subscribers
       ORDER BY datetime(created_at) DESC`
    )
    .all<NewsletterSubscriberRow>();

  return NextResponse.json(results ?? []);
}

export async function DELETE(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  await db
    .prepare(`DELETE FROM newsletter_subscribers WHERE email = ?`)
    .bind(email)
    .run();

  return NextResponse.json({ success: true });
}
