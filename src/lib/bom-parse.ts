/**
 * Parse BOM CSV/TSV exports (KiCad, JLCPCB, generic). Edge-safe, no deps.
 */

export type BomRow = {
  designator: string;
  comment: string;
  footprint: string;
  lcsc: string;
  mpn: string;
  manufacturer: string;
  description: string;
  qty_per_board: number;
};

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function stripBom(s: string): string {
  if (s.charCodeAt(0) === 0xfeff) return s.slice(1);
  return s;
}

/** Simple CSV line splitter respecting double-quoted fields. */
function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  let inQ = false;
  while (i < line.length) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQ = false;
        i += 1;
        continue;
      }
      cur += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i += 1;
      continue;
    }
    if (c === delimiter) {
      out.push(cur);
      cur = "";
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  out.push(cur);
  return out.map((cell) => norm(cell.replace(/^"|"$/g, "")));
}

function detectDelimiter(firstLine: string): string {
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  if (tabs >= commas && tabs >= semis && tabs > 0) return "\t";
  if (semis > commas) return ";";
  return ",";
}

type ColKey =
  | "designator"
  | "comment"
  | "footprint"
  | "lcsc"
  | "mpn"
  | "manufacturer"
  | "description"
  | "qty";

function headerToKey(h: string): ColKey | null {
  const x = h
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const map: [string, ColKey][] = [
    ["lcsc part #", "lcsc"],
    ["lcsc part", "lcsc"],
    ["jlcpcb part", "lcsc"],
    ["lcsc #", "lcsc"],
    ["lcsc", "lcsc"],
    ["manufacturer part number", "mpn"],
    ["manufacturer part", "mpn"],
    ["mfg part", "mpn"],
    ["part number", "mpn"],
    ["part #", "mpn"],
    ["mpn", "mpn"],
    ["comment", "comment"],
    ["value", "comment"],
    ["designator", "designator"],
    ["references", "designator"],
    ["ref des", "designator"],
    ["refdes", "designator"],
    ["footprint", "footprint"],
    ["fp", "footprint"],
    ["description", "description"],
    ["desc", "description"],
    ["manufacturer", "manufacturer"],
    ["mfr", "manufacturer"],
    ["order qty", "qty"],
    ["quantity", "qty"],
    ["amount", "qty"],
    ["qty", "qty"],
  ];

  for (const [prefix, key] of map) {
    if (x === prefix) return key;
    if (prefix.length > 3 && x.endsWith(prefix)) return key;
  }
  return null;
}

function parseQty(raw: string, designator: string): number {
  const t = raw.trim();
  if (t) {
    const n = parseFloat(t.replace(",", "."));
    if (!Number.isNaN(n) && n > 0) return n;
  }
  const des = designator.trim();
  if (!des) return 1;
  const parts = des.split(/[,;\s]+/).filter(Boolean);
  return Math.max(1, parts.length);
}

export function computeMatchKey(row: Omit<BomRow, "qty_per_board">): string {
  const lcsc = norm(row.lcsc);
  if (lcsc) return `lcsc:${lcsc.toUpperCase()}`;

  const mpn = norm(row.mpn);
  const comment = norm(row.comment);
  const fp = norm(row.footprint);
  const desc = norm(row.description);
  const bundle = [mpn, comment, fp, desc].filter(Boolean).join("|");
  if (bundle) return `fb:${bundle.toLowerCase()}`;

  const des = norm(row.designator);
  if (des) return `fb:des:${des.toLowerCase()}`;
  return "fb:unknown";
}

export function parseBomText(raw: string): BomRow[] {
  const text = stripBom(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delim = detectDelimiter(lines[0]);
  const headerCells = splitCsvLine(lines[0], delim);
  const colIndex: Partial<Record<ColKey, number>> = {};
  headerCells.forEach((h, i) => {
    const key = headerToKey(h);
    if (key && colIndex[key] === undefined) colIndex[key] = i;
  });

  if (
    colIndex.lcsc === undefined &&
    colIndex.comment === undefined &&
    colIndex.mpn === undefined &&
    colIndex.designator === undefined
  ) {
    return [];
  }

  const rows: BomRow[] = [];
  for (let li = 1; li < lines.length; li++) {
    const cells = splitCsvLine(lines[li], delim);
    const get = (k: ColKey) => {
      const idx = colIndex[k];
      if (idx === undefined) return "";
      return cells[idx] ?? "";
    };

    const designator = get("designator");
    const comment = get("comment");
    const footprint = get("footprint");
    const lcsc = get("lcsc");
    const mpn = get("mpn");
    const manufacturer = get("manufacturer");
    const description = get("description");
    const qtyRaw = get("qty");

    if (!designator && !comment && !lcsc && !mpn && !footprint && !description) continue;

    const qty_per_board = parseQty(qtyRaw, designator);
    rows.push({
      designator,
      comment,
      footprint,
      lcsc,
      mpn,
      manufacturer,
      description,
      qty_per_board,
    });
  }

  return rows;
}
