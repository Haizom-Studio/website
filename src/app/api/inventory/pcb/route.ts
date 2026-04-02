import { NextResponse } from "next/server";
import { COMPONENT_CATEGORIES, inferComponentCategory } from "@/lib/component-category";
import { computeMatchKey, decodeBomFileBytes, parseBomText } from "@/lib/bom-parse";
import { requireInventorySession } from "@/lib/admin-guard";
import { getD1Database } from "@/lib/d1";

export const runtime = "edge";

const INSERT_LINE = `INSERT INTO pcb_salvage_bom_lines
  (board_id, match_key, designator, comment, footprint, lcsc, mpn, manufacturer, description, qty_per_board, category, initial_qty, remaining_qty)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function parseBoardQty(raw: unknown): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

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
        "Salvage PCB schema is missing or outdated. Run d1/migrations/0003_pcb_salvage.sql and 0004_pcb_salvage_category_remaining.sql on your D1 database.",
    },
    { status: 503 }
  );
}

type LineRow = {
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
  board_name: string;
  board_qty: number;
};

type PcbAgg = {
  match_key: string;
  category: string;
  lcsc: string;
  mpn: string;
  comment: string;
  footprint: string;
  description: string;
  manufacturer: string;
  total_qty: number;
  pcbs: Array<{
    board_id: number;
    name: string;
    board_qty: number;
    qty_from_this_pcb: number;
  }>;
};

function lineRemaining(r: LineRow): number {
  const fb = r.qty_per_board * r.board_qty;
  if (r.remaining_qty != null && !Number.isNaN(Number(r.remaining_qty))) {
    return Math.max(0, Number(r.remaining_qty));
  }
  return Math.max(0, fb);
}

function effectiveCategory(r: LineRow): string {
  const stored = (r.category ?? "").trim();
  if (stored && stored !== "Other") return stored;
  return inferComponentCategory({
    footprint: r.footprint,
    comment: r.comment,
    mpn: r.mpn,
    description: r.description,
    designator: r.designator,
  });
}

export async function GET() {
  const denied = await requireInventorySession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json(
      { error: "D1 is not bound. Add a D1 binding named DB in Cloudflare Pages." },
      { status: 503 }
    );
  }

  let boardsRes: {
    results?: Array<{
      id: number;
      name: string;
      board_qty: number;
      bom_filename: string | null;
      created_at: string;
      line_count: number;
    }>;
  };
  let linesRes: { results?: LineRow[] };

  try {
    boardsRes = await db
      .prepare(
        `SELECT b.id, b.name, b.board_qty, b.bom_filename, b.created_at,
        (SELECT COUNT(*) FROM pcb_salvage_bom_lines l WHERE l.board_id = b.id) AS line_count
       FROM pcb_salvage_boards b
       ORDER BY b.created_at DESC`
      )
      .all();

    linesRes = await db
      .prepare(
        `SELECT l.id, l.board_id, l.match_key, l.designator, l.comment, l.footprint, l.lcsc, l.mpn,
        l.manufacturer, l.description, l.qty_per_board, l.category, l.initial_qty, l.remaining_qty,
        b.name AS board_name, b.board_qty
       FROM pcb_salvage_bom_lines l
       JOIN pcb_salvage_boards b ON b.id = l.board_id`
      )
      .all<LineRow>();
  } catch (e) {
    if (isSchemaError(e)) return jsonSchemaError();
    throw e;
  }

  const rows = linesRes.results ?? [];
  const aggMap = new Map<string, PcbAgg>();
  const pcbMap = new Map<
    string,
    Map<number, { board_id: number; name: string; board_qty: number; qty_from_this_pcb: number }>
  >();

  for (const r of rows) {
    const lineContrib = lineRemaining(r);
    if (lineContrib <= 0) continue;

    const mk = r.match_key;
    const cat = effectiveCategory(r);

    if (!aggMap.has(mk)) {
      aggMap.set(mk, {
        match_key: mk,
        category: cat,
        lcsc: (r.lcsc ?? "").trim(),
        mpn: (r.mpn ?? "").trim(),
        comment: (r.comment ?? "").trim(),
        footprint: (r.footprint ?? "").trim(),
        description: (r.description ?? "").trim(),
        manufacturer: (r.manufacturer ?? "").trim(),
        total_qty: 0,
        pcbs: [],
      });
      pcbMap.set(mk, new Map());
    }
    const agg = aggMap.get(mk)!;
    if (agg.category === "Other" && cat !== "Other") agg.category = cat;

    agg.total_qty += lineContrib;
    if (!agg.lcsc && (r.lcsc ?? "").trim()) agg.lcsc = (r.lcsc ?? "").trim();
    if (!agg.mpn && (r.mpn ?? "").trim()) agg.mpn = (r.mpn ?? "").trim();
    if (!agg.comment && (r.comment ?? "").trim()) agg.comment = (r.comment ?? "").trim();
    if (!agg.footprint && (r.footprint ?? "").trim()) agg.footprint = (r.footprint ?? "").trim();
    if (!agg.description && (r.description ?? "").trim()) agg.description = (r.description ?? "").trim();
    if (!agg.manufacturer && (r.manufacturer ?? "").trim()) {
      agg.manufacturer = (r.manufacturer ?? "").trim();
    }

    const bm = pcbMap.get(mk)!;
    const prev = bm.get(r.board_id);
    if (prev) {
      prev.qty_from_this_pcb += lineContrib;
    } else {
      bm.set(r.board_id, {
        board_id: r.board_id,
        name: r.board_name,
        board_qty: r.board_qty,
        qty_from_this_pcb: lineContrib,
      });
    }
  }

  for (const [, agg] of aggMap) {
    const mk = agg.match_key;
    const bm = pcbMap.get(mk);
    agg.pcbs = bm
      ? Array.from(bm.values())
          .filter((p) => p.qty_from_this_pcb > 0)
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }

  const aggregate = Array.from(aggMap.values())
    .filter((a) => a.total_qty > 0)
    .sort((a, b) => {
      const c = a.category.localeCompare(b.category);
      if (c !== 0) return c;
      const al = (a.lcsc || a.mpn || a.comment || a.match_key).toLowerCase();
      const bl = (b.lcsc || b.mpn || b.comment || b.match_key).toLowerCase();
      return al.localeCompare(bl);
    });

  return NextResponse.json({
    boards: boardsRes.results ?? [],
    aggregate,
    categories: [...COMPONENT_CATEGORIES],
  });
}

export async function POST(req: Request) {
  const denied = await requireInventorySession();
  if (denied) return denied;

  const db = getD1Database();
  if (!db) {
    return NextResponse.json({ error: "D1 is not bound." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const name = String(form.get("pcbName") ?? "").trim();
  const boardQty = parseBoardQty(form.get("boardQuantity"));
  const file = form.get("bomFile");

  if (!name) {
    return NextResponse.json({ error: "PCB name is required" }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "BOM file is required" }, { status: 400 });
  }

  const text = decodeBomFileBytes(await file.arrayBuffer());
  const parsed = parseBomText(text);
  const lines = parsed.filter((row) => computeMatchKey(row) !== "fb:unknown");

  if (lines.length === 0) {
    return NextResponse.json(
      {
        error:
          "Could not read any BOM lines. Export as CSV or tab-separated text with columns such as Designator, Footprint, Quantity, Manufacturer Part, Supplier Part (LCSC), Name/Comment. EasyEDA UTF-16 BOMs are supported.",
      },
      { status: 400 }
    );
  }

  let boardId: number;
  try {
    const insertBoard = await db
      .prepare(
        "INSERT INTO pcb_salvage_boards (name, board_qty, bom_filename) VALUES (?, ?, ?)"
      )
      .bind(name, boardQty, file.name || null)
      .run();

    const meta = insertBoard as {
      meta?: { last_row_id?: number; lastRowId?: number };
    };
    const id = meta.meta?.last_row_id ?? meta.meta?.lastRowId ?? null;
    if (!id || id < 1) {
      return NextResponse.json({ error: "Failed to create board row" }, { status: 500 });
    }
    boardId = id;

    const chunkSize = 60;
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize);
      const stmts = chunk.map((row) => {
        const mk = computeMatchKey(row);
        const category = inferComponentCategory({
          footprint: row.footprint,
          comment: row.comment,
          mpn: row.mpn,
          description: row.description,
          designator: row.designator,
        });
        const initial = row.qty_per_board * boardQty;
        return db.prepare(INSERT_LINE).bind(
          boardId,
          mk,
          row.designator || null,
          row.comment || null,
          row.footprint || null,
          row.lcsc || null,
          row.mpn || null,
          row.manufacturer || null,
          row.description || null,
          row.qty_per_board,
          category,
          initial,
          initial
        );
      });
      await db.batch(stmts);
    }
  } catch (e) {
    if (isSchemaError(e)) return jsonSchemaError();
    throw e;
  }

  return NextResponse.json({
    success: true,
    boardId,
    linesImported: lines.length,
  });
}

export async function DELETE(req: Request) {
  const denied = await requireInventorySession();
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

  try {
    await db
      .prepare("DELETE FROM pcb_salvage_bom_lines WHERE board_id = ?")
      .bind(id)
      .run();
    await db.prepare("DELETE FROM pcb_salvage_boards WHERE id = ?").bind(id).run();
  } catch (e) {
    if (isSchemaError(e)) return jsonSchemaError();
    throw e;
  }

  return NextResponse.json({ success: true });
}
