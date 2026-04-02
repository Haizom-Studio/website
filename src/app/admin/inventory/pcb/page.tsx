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
  category: string;
  lcsc: string;
  mpn: string;
  comment: string;
  footprint: string;
  description: string;
  manufacturer: string;
  total_qty: number;
  pcbs: PcbLine[];
};

type BoardLineRow = {
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
};

function fmtQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}

function remLine(l: BoardLineRow, boardQty: number): number {
  const fb = l.qty_per_board * boardQty;
  if (l.remaining_qty != null && !Number.isNaN(Number(l.remaining_qty))) {
    return Math.max(0, Number(l.remaining_qty));
  }
  return Math.max(0, fb);
}

function initLine(l: BoardLineRow, boardQty: number): number {
  if (l.initial_qty != null && !Number.isNaN(Number(l.initial_qty))) {
    return Math.max(0, Number(l.initial_qty));
  }
  return Math.max(0, l.qty_per_board * boardQty);
}

type MainTab = "parts" | "board" | "add";

export default function PcbSalvageInventoryPage() {
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [aggregate, setAggregate] = useState<AggRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pcbName, setPcbName] = useState("");
  const [boardQuantity, setBoardQuantity] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [mainTab, setMainTab] = useState<MainTab>("parts");

  const [selectedBoardId, setSelectedBoardId] = useState<number | "">("");
  const [boardLines, setBoardLines] = useState<BoardLineRow[]>([]);
  const [boardLinesLoading, setBoardLinesLoading] = useState(false);
  const [boardQtyForLines, setBoardQtyForLines] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/pcb", { credentials: "include" });
      const data = (await res.json()) as {
        boards?: BoardRow[];
        aggregate?: AggRow[];
        categories?: string[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Failed to load salvage PCB data");
        setBoards([]);
        setAggregate([]);
        setCategories([]);
        return;
      }
      setBoards(Array.isArray(data.boards) ? data.boards : []);
      setAggregate(Array.isArray(data.aggregate) ? data.aggregate : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadBoardLines = useCallback(async (boardId: number) => {
    setBoardLinesLoading(true);
    try {
      const res = await fetch(
        `/api/inventory/pcb/lines?boardId=${boardId}`,
        { credentials: "include" }
      );
      const data = (await res.json()) as {
        board?: { id: number; name: string; board_qty: number };
        lines?: BoardLineRow[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Failed to load board lines");
        setBoardLines([]);
        return;
      }
      if (data.board) setBoardQtyForLines(data.board.board_qty);
      setBoardLines(Array.isArray(data.lines) ? data.lines : []);
    } finally {
      setBoardLinesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab !== "board" || selectedBoardId === "") return;
    void loadBoardLines(selectedBoardId);
  }, [mainTab, selectedBoardId, loadBoardLines]);

  useEffect(() => {
    if (boards.length === 0) {
      setSelectedBoardId("");
      return;
    }
    if (
      selectedBoardId === "" ||
      !boards.some((b) => b.id === selectedBoardId)
    ) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  const filteredAgg = useMemo(() => {
    let list = aggregate;
    if (categoryFilter) {
      list = list.filter((row) => row.category === categoryFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const blob = [
        row.category,
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
  }, [aggregate, categoryFilter, search]);

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
      setMainTab("parts");
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
    if (selectedBoardId === id) setSelectedBoardId("");
    void load();
  }

  async function patchLine(
    lineId: number,
    body: { decrementBy?: number; remainingQty?: number }
  ) {
    const res = await fetch("/api/inventory/pcb/lines", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lineId, ...body }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Update failed");
      return;
    }
    if (selectedBoardId !== "") void loadBoardLines(selectedBoardId);
    void load();
  }

  async function deleteLine(lineId: number) {
    if (!confirm("Delete this BOM line from this board entirely?")) return;
    const res = await fetch("/api/inventory/pcb/lines", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lineId }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Line removed");
    if (selectedBoardId !== "") void loadBoardLines(selectedBoardId);
    void load();
  }

  const tabBtn = (id: MainTab, label: string) => (
    <button
      type="button"
      onClick={() => setMainTab(id)}
      className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
        mainTab === id
          ? "bg-primary text-white"
          : "border border-border dark:border-dark_border text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight"
      }`}>
      {label}
    </button>
  );

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
      <p className="text-grey dark:text-SereneGray text-sm mb-6 max-w-2xl">
        Parts are grouped by LCSC-style categories. Stock counts use{" "}
        <strong className="font-medium text-midnight_text dark:text-white">
          remaining
        </strong>{" "}
        quantities per board (desolder or use parts). Remove components from a
        specific board in the Board tab.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabBtn("parts", "Parts inventory")}
        {tabBtn("board", "Board: remove parts")}
        {tabBtn("add", "Add PCB")}
      </div>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : (
        <>
          {mainTab === "add" && (
            <>
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
                      are supported.
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

              <section className="mb-4">
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
                                Remove board
                              </button>
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

          {mainTab === "parts" && (
            <section>
              <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4 mb-4">
                <label className="block min-w-[12rem]">
                  <span className="text-xs text-grey block mb-1">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white">
                    <option value="">All categories</option>
                    {(categories.length > 0 ? categories : Array.from(new Set(aggregate.map((a) => a.category)))).sort().map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block flex-1 min-w-[12rem] lg:max-w-md">
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
                  No available parts yet (or all depleted). Add a PCB or restore stock
                  on a board.
                </p>
              ) : filteredAgg.length === 0 ? (
                <p className="text-grey text-sm">No matches for these filters.</p>
              ) : (
                <div className="overflow-x-auto rounded-sm border border-border dark:border-dark_border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-section dark:bg-darklight text-midnight_text dark:text-white">
                      <tr>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Category</th>
                        <th className="px-3 py-2 font-medium">Value / comment</th>
                        <th className="px-3 py-2 font-medium">LCSC</th>
                        <th className="px-3 py-2 font-medium">MPN</th>
                        <th className="px-3 py-2 font-medium">Footprint</th>
                        <th className="px-3 py-2 font-medium">Description</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Available</th>
                        <th className="px-3 py-2 font-medium min-w-[14rem]">On boards</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-dark_border bg-white dark:bg-darklight">
                      {filteredAgg.map((row) => (
                        <tr key={row.match_key}>
                          <td className="px-3 py-2 text-grey align-top whitespace-nowrap text-xs">
                            {row.category}
                          </td>
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
                                    ({fmtQty(p.qty_from_this_pcb)} left · {p.board_qty}{" "}
                                    board{p.board_qty === 1 ? "" : "s"})
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
          )}

          {mainTab === "board" && (
            <section>
              {boards.length === 0 ? (
                <p className="text-grey text-sm">Add a PCB first.</p>
              ) : (
                <>
                  <label className="block max-w-md mb-6">
                    <span className="text-xs text-grey block mb-1">Board</span>
                    <select
                      value={selectedBoardId === "" ? "" : String(selectedBoardId)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedBoardId(v === "" ? "" : parseInt(v, 10));
                      }}
                      className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white">
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.board_qty} pcs)
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-grey">
                      Remove parts that you have desoldered or no longer have on this
                      board. &quot;−1&quot; reduces remaining stock; &quot;All&quot; sets
                      remaining to 0; &quot;Delete line&quot; removes the row from this
                      board&apos;s BOM list.
                    </p>
                  </label>

                  {boardLinesLoading ? (
                    <p className="text-midnight_text dark:text-white">Loading lines…</p>
                  ) : (
                    <div className="overflow-x-auto rounded-sm border border-border dark:border-dark_border">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-section dark:bg-darklight text-midnight_text dark:text-white">
                          <tr>
                            <th className="px-3 py-2 font-medium">Category</th>
                            <th className="px-3 py-2 font-medium">Comment</th>
                            <th className="px-3 py-2 font-medium">LCSC</th>
                            <th className="px-3 py-2 font-medium">Designator</th>
                            <th className="px-3 py-2 font-medium whitespace-nowrap">Initial</th>
                            <th className="px-3 py-2 font-medium whitespace-nowrap">Left</th>
                            <th className="px-3 py-2 font-medium w-52">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-dark_border bg-white dark:bg-darklight">
                          {boardLines.map((line) => {
                            const ini = initLine(line, boardQtyForLines);
                            const rem = remLine(line, boardQtyForLines);
                            return (
                              <tr key={line.id}>
                                <td className="px-3 py-2 text-grey text-xs whitespace-nowrap align-top">
                                  {line.category ?? "Other"}
                                </td>
                                <td className="px-3 py-2 text-midnight_text dark:text-white align-top max-w-[10rem]">
                                  {line.comment || "—"}
                                </td>
                                <td className="px-3 py-2 font-mono text-xs text-grey align-top">
                                  {line.lcsc || "—"}
                                </td>
                                <td className="px-3 py-2 text-grey align-top text-xs">
                                  {line.designator || "—"}
                                </td>
                                <td className="px-3 py-2 align-top">{fmtQty(ini)}</td>
                                <td className="px-3 py-2 align-top font-medium">
                                  {fmtQty(rem)}
                                </td>
                                <td className="px-3 py-2 align-top">
                                  <div className="flex flex-wrap gap-1">
                                    <button
                                      type="button"
                                      disabled={rem <= 0}
                                      onClick={() => void patchLine(line.id, { decrementBy: 1 })}
                                      className="rounded-sm border border-border dark:border-dark_border px-2 py-1 text-xs text-midnight_text dark:text-white disabled:opacity-40 hover:bg-section dark:hover:bg-darklight">
                                      −1
                                    </button>
                                    <button
                                      type="button"
                                      disabled={rem <= 0}
                                      onClick={() =>
                                        void patchLine(line.id, { remainingQty: 0 })
                                      }
                                      className="rounded-sm border border-border dark:border-dark_border px-2 py-1 text-xs text-midnight_text dark:text-white disabled:opacity-40 hover:bg-section dark:hover:bg-darklight">
                                      None left
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void deleteLine(line.id)}
                                      className="rounded-sm border border-border dark:border-dark_border px-2 py-1 text-xs text-red-600 hover:bg-section dark:hover:bg-darklight">
                                      Delete line
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
