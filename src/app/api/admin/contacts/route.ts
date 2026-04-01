import { NextResponse } from "next/server";
import { requireContactsSession } from "@/lib/admin-guard";
import { getD1Database } from "@/lib/d1";

export const runtime = "edge";

export type ContactBookingRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  service: string;
  specialist: string;
  date: string;
  time: string;
  ip_address: string | null;
  location: string | null;
  map_lat: number | null;
  map_lng: number | null;
  status: string;
};

export async function GET() {
  const denied = await requireContactsSession();
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
      `SELECT rowid AS id, first_name, last_name, email, service, specialist, date, time,
              ip_address, location, map_lat, map_lng, COALESCE(status, 'open') AS status
       FROM contacts
       ORDER BY rowid DESC`
    )
    .all<ContactBookingRow>();

  return NextResponse.json(results ?? []);
}

export async function PATCH(req: Request) {
  const denied = await requireContactsSession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  let body: { id?: number; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id =
    typeof body.id === "number" ? body.id : parseInt(String(body.id), 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const status =
    body.status === "complete" || body.status === "completed"
      ? "complete"
      : "open";

  await db
    .prepare(`UPDATE contacts SET status = ? WHERE rowid = ?`)
    .bind(status, id)
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const denied = await requireContactsSession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  let body: { id?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id =
    typeof body.id === "number" ? body.id : parseInt(String(body.id), 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  await db.prepare(`DELETE FROM contacts WHERE rowid = ?`).bind(id).run();

  return NextResponse.json({ success: true });
}
