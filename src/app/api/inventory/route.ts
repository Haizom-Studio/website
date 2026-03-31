import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { getD1Database } from "@/lib/d1";

export const runtime = "edge";

function parseQuantity(n: unknown): number {
  const v = typeof n === "number" ? n : parseInt(String(n ?? ""), 10);
  if (Number.isNaN(v) || v < 0) return 0;
  return v;
}

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
    .prepare("SELECT * FROM inventory ORDER BY created_at DESC")
    .all<Record<string, unknown>>();
  return NextResponse.json(results ?? []);
}

export async function POST(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json(
      { error: "D1 is not bound. Add a D1 binding named DB in Cloudflare Pages." },
      { status: 503 }
    );
  }

  let body: {
    name?: string;
    category?: string;
    quantity?: number;
    location?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const category = (body.category ?? "").trim() || "general";
  const quantity = parseQuantity(body.quantity);
  const location = (body.location ?? "").trim() || "";
  const notes = (body.notes ?? "").trim() || "";

  await db
    .prepare(
      `INSERT INTO inventory (name, category, quantity, location, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(name, category, quantity, location, notes)
    .run();

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json(
      { error: "D1 is not bound." },
      { status: 503 }
    );
  }

  let body: {
    id?: number;
    name?: string;
    category?: string;
    quantity?: number;
    location?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "number" ? body.id : parseInt(String(body.id), 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const category = (body.category ?? "").trim() || "general";
  const quantity = parseQuantity(body.quantity);
  const location = (body.location ?? "").trim() || "";
  const notes = (body.notes ?? "").trim() || "";

  await db
    .prepare(
      `UPDATE inventory SET name = ?, category = ?, quantity = ?, location = ?, notes = ?
       WHERE id = ?`
    )
    .bind(name, category, quantity, location, notes, id)
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAdminSession();
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

  const id = typeof body.id === "number" ? body.id : parseInt(String(body.id), 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  await db.prepare("DELETE FROM inventory WHERE id = ?").bind(id).run();

  return NextResponse.json({ success: true });
}
