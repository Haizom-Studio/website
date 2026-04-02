"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type BoardRow = {
  id: number;
  name: string;
  board_qty: number;
  bom_filename: string | null;
  created_at: string;
  line_count: number;
};

type PcbLine = {
  board_id: number;
  name: string;
  board_qty: number;
  qty_from_this_pcb: number;
};

type AggRow = {
  match_key: string;
  lcsc: string;
  mpn: string;
  comment: string;
  footprint: string;
  description: string;
  manufacturer: string;
  total_qty: number;
  pcbs: PcbLine[];
};

function fmtQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}

export default function PcbSalvageInventoryPage() {
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [aggregate, setAggregate] = useState<AggRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pcbName, setPcbName] = useState("");
  const [boardQuantity, setBoardQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/pcb", { credentials: "include" });
      const data = (await res.json()) as
        | { boards?: BoardRow[]; aggregate?: AggRow[]; error?: string };
      if (!res.ok) {
        toast.error(data.error || "Failed to load salvage PCB data");
        setBoards([]);
        setAggregate([]);
        return;
      }
      setBoards(Array.isArray(data.boards) ? data.boards : []);
      setAggregate(Array.isArray(data.aggregate) ? data.aggregate : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredAgg = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return aggregate;
    return aggregate.filter((row) => {
      const blob = [
        row.lcsc,
        row.mpn,
        row.comment,
        row.footprint,
        row.description,
        row.manufacturer,
        ...row.pcbs.map((p) => `${p.name} ${p.board_qty}`),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [aggregate, search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = pcbName.trim();
    if (!name) {
      toast.error("PCB name is required");
      return;
    }
    if (!file || file.size === 0) {
      toast.error("Choose a BOM file (CSV or TSV)");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("pcbName", name);
      fd.set("boardQuantity", String(boardQuantity));
      fd.set("bomFile", file);
      const res = await fetch("/api/inventory/pcb", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        linesImported?: number;
      };
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }
      toast.success(
        `Imported ${data.linesImported ?? "?"} BOM lines for ${name}`
      );
      setPcbName("");
      setBoardQuantity(1);
      setFile(null);
      void load();
    } finally {
      setSaving(false);
    }
  }

  async function removeBoard(id: number) {
    if (!confirm("Remove this PCB and its BOM lines from salvage inventory?")) return;
    const res = await fetch("/api/inventory/pcb", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Removed");
    void load();
  }

  return (
    <div>
      <p className="mb-4">
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-primary hover:underline">
          ← Lab parts inventory
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Salvage PCB inventory
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8 max-w-2xl">
        Add salvage boards with a BOM export (CSV or TSV). Parts are tracked
        separately from the main lab inventory. Totals combine the same line
        across boards (quantity × boards on hand). Use the list below to see
        which PCBs you can source or desolder from.
      </p>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mb-10 space-y-4 max-w-3xl rounded-sm border border-border dark:border-dark_border bg-section dark:bg-darklight p-6">
        <p className="text-sm font-medium text-midnight_text dark:text-white">
          Add salvage PCB
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="text-xs text-grey">PCB name</span>
            <input
              value={pcbName}
              onChange={(e) => setPcbName(e.target.value)}
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
              placeholder="e.g. Sensor board v2"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-grey">Boards on hand (quantity)</span>
            <input
              type="number"
              min={1}
              value={boardQuantity}
              onChange={(e) =>
                setBoardQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-grey">BOM file</span>
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-midnight_text dark:text-white file:mr-3 file:rounded-sm file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
            />
            <p className="mt-1 text-xs text-grey">
              KiCad, JLCPCB, or EasyEDA tab-separated exports (UTF-8 or UTF-16)
              are supported. Use columns such as Designator, Footprint, Quantity,
              Manufacturer Part, Supplier Part (LCSC), and Name / Comment / Value.
            </p>
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-60">
          {saving ? "Importing…" : "Upload BOM"}
        </button>
      </form>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-midnight_text dark:text-white mb-4">
              Salvage PCBs
            </h2>
            {boards.length === 0 ? (
              <p className="text-grey text-sm">No boards yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-sm border border-border dark:border-dark_border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-section dark:bg-darklight text-midnight_text dark:text-white">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Boards</th>
                      <th className="px-3 py-2 font-medium">BOM lines</th>
                      <th className="px-3 py-2 font-medium">File</th>
                      <th className="px-3 py-2 font-medium w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-dark_border bg-white dark:bg-darklight">
                    {boards.map((b) => (
                      <tr key={b.id}>
                        <td className="px-3 py-2 text-midnight_text dark:text-white">
                          {b.name}
                        </td>
                        <td className="px-3 py-2 text-grey">{b.board_qty}</td>
                        <td className="px-3 py-2 text-grey">{b.line_count}</td>
                        <td className="px-3 py-2 text-grey max-w-[12rem] truncate">
                          {b.bom_filename ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => void removeBoard(b.id)}
                            className="text-grey text-xs hover:text-red-600">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
              <h2 className="text-lg font-semibold text-midnight_text dark:text-white">
                Aggregated parts (all salvage PCBs)
              </h2>
              <label className="block flex-1 min-w-[12rem] sm:max-w-md sm:ml-auto">
                <span className="text-xs text-grey block mb-1">Search</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="LCSC, MPN, value, footprint, PCB name…"
                  autoComplete="off"
                  className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white placeholder:text-grey"
                />
              </label>
            </div>
            {aggregate.length === 0 ? (
              <p className="text-grey text-sm">
                No BOM data yet. Upload a BOM to see combined quantities.
              </p>
            ) : filteredAgg.length === 0 ? (
              <p className="text-grey text-sm">No matches for this search.</p>
            ) : (
              <div className="overflow-x-auto rounded-sm border border-border dark:border-dark_border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-section dark:bg-darklight text-midnight_text dark:text-white">
                    <tr>
                      <th className="px-3 py-2 font-medium">Value / comment</th>
                      <th className="px-3 py-2 font-medium">LCSC</th>
                      <th className="px-3 py-2 font-medium">MPN</th>
                      <th className="px-3 py-2 font-medium">Footprint</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">
                        Total qty
                      </th>
                      <th className="px-3 py-2 font-medium min-w-[14rem]">
                        On PCBs (sourcing / desolder)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-dark_border bg-white dark:bg-darklight">
                    {filteredAgg.map((row) => (
                      <tr key={row.match_key}>
                        <td className="px-3 py-2 text-midnight_text dark:text-white align-top">
                          {row.comment || "—"}
                        </td>
                        <td className="px-3 py-2 text-grey align-top font-mono text-xs">
                          {row.lcsc || "—"}
                        </td>
                        <td className="px-3 py-2 text-grey align-top text-xs">
                          {row.mpn || "—"}
                        </td>
                        <td className="px-3 py-2 text-grey align-top text-xs">
                          {row.footprint || "—"}
                        </td>
                        <td className="px-3 py-2 text-grey align-top max-w-xs">
                          {row.description || row.manufacturer || "—"}
                        </td>
                        <td className="px-3 py-2 text-midnight_text dark:text-white align-top font-medium whitespace-nowrap">
                          {fmtQty(row.total_qty)}
                        </td>
                        <td className="px-3 py-2 text-grey align-top text-xs">
                          <ul className="space-y-1 list-disc list-inside">
                            {row.pcbs.map((p) => (
                              <li key={p.board_id}>
                                <span className="text-midnight_text dark:text-white">
                                  {p.name}
                                </span>{" "}
                                <span className="text-grey">
                                  ({fmtQty(p.qty_from_this_pcb)} available ·{" "}
                                  {p.board_qty} board
                                  {p.board_qty === 1 ? "" : "s"})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
