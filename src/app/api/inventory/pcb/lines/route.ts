import { NextResponse } from "next/server";
import { inferComponentCategory } from "@/lib/component-category";
import { requireInventorySession } from "@/lib/admin-guard";
import { getD1Database } from "@/lib/d1";

export const runtime = "edge";

function isSchemaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    (msg.includes("no such table") && msg.includes("pcb_salvage")) ||
    msg.includes("no such column")
  );
}

function jsonSchemaError() {
  return NextResponse.json(
    {
      error:
        "Salvage PCB schema is outdated. Run d1/migrations/0003_pcb_salvage.sql and 0004_pcb_salvage_category_remaining.sql on your D1 database.",
    },
    { status: 503 }
  );
}

/** Lines for one board — manage remaining stock per BOM line. */
export async function GET(req: Request) {
  const denied = await requireInventorySession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const boardIdRaw = searchParams.get("boardId");
  const boardId =
    typeof boardIdRaw === "string" ? parseInt(boardIdRaw, 10) : NaN;
  if (Number.isNaN(boardId) || boardId < 1) {
    return NextResponse.json(
      { error: "Valid boardId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const board = await db
      .prepare(
        "SELECT id, name, board_qty FROM pcb_salvage_boards WHERE id = ? LIMIT 1"
      )
      .bind(boardId)
      .first<{ id: number; name: string; board_qty: number }>();

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const lines = await db
      .prepare(
        `SELECT id, board_id, match_key, designator, comment, footprint, lcsc, mpn,
          manufacturer, description, qty_per_board, category, initial_qty, remaining_qty
         FROM pcb_salvage_bom_lines WHERE board_id = ? ORDER BY id ASC`
      )
      .bind(boardId)
      .all<{
        id: number;
        board_id: number;
        match_key: string;
        designator: string | null;
        comment: string | null;
        footprint: string | null;
        lcsc: string | null;
        mpn: string | null;
        manufacturer: string | null;
        description: string | null;
        qty_per_board: number;
        category: string | null;
        initial_qty: number | null;
        remaining_qty: number | null;
      }>();

    const raw = lines.results ?? [];
    const withCategory = raw.map((line) => {
      const stored = (line.category ?? "").trim();
      const category =
        stored && stored !== "Other"
          ? stored
          : inferComponentCategory({
              footprint: line.footprint,
              comment: line.comment,
              mpn: line.mpn,
              description: line.description,
              designator: line.designator,
            });
      return { ...line, category };
    });

    return NextResponse.json({
      board,
      lines: withCategory,
    });
  } catch (e) {
    if (isSchemaError(e)) return jsonSchemaError();
    throw e;
  }
}

export async function PATCH(req: Request) {
  const denied = await requireInventorySession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  let body: {
    lineId?: number;
    decrementBy?: number;
    remainingQty?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lineId =
    typeof body.lineId === "number" ? body.lineId : parseInt(String(body.lineId), 10);
  if (Number.isNaN(lineId) || lineId < 1) {
    return NextResponse.json({ error: "Valid lineId is required" }, { status: 400 });
  }

  const hasSet = body.remainingQty !== undefined && body.remainingQty !== null;
  const dec =
    typeof body.decrementBy === "number"
      ? body.decrementBy
      : parseFloat(String(body.decrementBy ?? ""));
  if (!hasSet && (Number.isNaN(dec) || dec <= 0)) {
    return NextResponse.json(
      { error: "Provide decrementBy (positive) or remainingQty" },
      { status: 400 }
    );
  }

  try {
    if (hasSet) {
      let r = Number(body.remainingQty);
      if (Number.isNaN(r) || r < 0) {
        return NextResponse.json({ error: "remainingQty must be >= 0" }, { status: 400 });
      }
      const row = await db
        .prepare(
          "SELECT COALESCE(initial_qty, qty_per_board * (SELECT board_qty FROM pcb_salvage_boards b WHERE b.id = board_id)) AS cap FROM pcb_salvage_bom_lines WHERE id = ?"
        )
        .bind(lineId)
        .first<{ cap: number }>();
      const cap = row?.cap ?? 0;
      if (cap > 0 && r > cap) r = cap;

      await db
        .prepare("UPDATE pcb_salvage_bom_lines SET remaining_qty = ? WHERE id = ?")
        .bind(r, lineId)
        .run();
    } else {
      await db
        .prepare(
          `UPDATE pcb_salvage_bom_lines
           SET remaining_qty = CASE
             WHEN COALESCE(remaining_qty, initial_qty, 0) - ? <= 0 THEN 0
             ELSE COALESCE(remaining_qty, initial_qty, 0) - ?
           END
           WHERE id = ?`
        )
        .bind(dec, dec, lineId)
        .run();
    }

    const updated = await db
      .prepare(
        "SELECT id, remaining_qty, initial_qty FROM pcb_salvage_bom_lines WHERE id = ?"
      )
      .bind(lineId)
      .first<{ id: number; remaining_qty: number | null; initial_qty: number | null }>();

    return NextResponse.json({ success: true, line: updated });
  } catch (e) {
    if (isSchemaError(e)) return jsonSchemaError();
    throw e;
  }
}

export async function DELETE(req: Request) {
  const denied = await requireInventorySession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  let body: { lineId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lineId =
    typeof body.lineId === "number" ? body.lineId : parseInt(String(body.lineId), 10);
  if (Number.isNaN(lineId) || lineId < 1) {
    return NextResponse.json({ error: "Valid lineId is required" }, { status: 400 });
  }

  try {
    await db.prepare("DELETE FROM pcb_salvage_bom_lines WHERE id = ?").bind(lineId).run();
    return NextResponse.json({ success: true });
  } catch (e) {
    if (isSchemaError(e)) return jsonSchemaError();
    throw e;
  }
}
