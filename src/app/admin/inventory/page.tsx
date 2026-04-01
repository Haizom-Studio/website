"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

type Item = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location: string;
  notes: string;
  created_at?: string;
};

const emptyForm = {
  name: "",
  category: "",
  quantity: 1,
  location: "",
  notes: "",
};

function normalizeCategory(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  return t || "general";
}

/** Single typable field + filterable dropdown; value can be any new string. */
function CategoryCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const blurCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      if (blurCloseTimer.current) clearTimeout(blurCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    setActiveIndex((i) =>
      filtered.length === 0 ? 0 : Math.min(i, filtered.length - 1)
    );
  }, [filtered]);

  function pick(opt: string) {
    onChange(opt);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative mt-1">
      <div className="relative flex">
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (blurCloseTimer.current) {
              clearTimeout(blurCloseTimer.current);
              blurCloseTimer.current = null;
            }
            setOpen(true);
          }}
          onBlur={() => {
            blurCloseTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              setOpen(true);
              return;
            }
            if (!open || filtered.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              pick(filtered[activeIndex]);
            }
          }}
          autoComplete="off"
          placeholder="Type to filter or enter a new category"
          className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight pl-3 pr-9 py-2 text-sm text-midnight_text dark:text-white"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-expanded={open}
          aria-label="Toggle category list"
          className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-grey hover:text-midnight_text dark:hover:text-white border-l border-border dark:border-dark_border"
          onClick={() => setOpen((o) => !o)}>
          <span className="text-[10px] leading-none" aria-hidden>
            ▼
          </span>
        </button>
      </div>
      {open && (
        <ul
          className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-auto rounded-sm border border-border dark:border-dark_border bg-white py-1 shadow-lg dark:bg-darklight dark:shadow-none"
          role="listbox">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-grey">
              {options.length === 0
                ? "No categories yet — type a name; it is saved with the item."
                : "No matches — new name is saved when you add or update the item."}
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={i === activeIndex}
                className={`cursor-pointer px-3 py-2 text-sm text-midnight_text dark:text-white ${
                  i === activeIndex ? "bg-primary/15" : "hover:bg-section dark:hover:bg-darkmode"
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurCloseTimer.current) {
                    clearTimeout(blurCloseTimer.current);
                    blurCloseTimer.current = null;
                  }
                }}
                onClick={() => pick(opt)}>
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { credentials: "include" });
      const data = (await res.json()) as Item[] | { error?: string };
      if (!res.ok) {
        toast.error(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Failed to load inventory"
        );
        setItems([]);
        return;
      }
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      set.add(normalizeCategory(it.category));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [items]);

  useEffect(() => {
    if (categoryFilter && !categories.includes(categoryFilter)) {
      setCategoryFilter("");
    }
  }, [categories, categoryFilter]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (categoryFilter) {
      list = list.filter(
        (it) => normalizeCategory(it.category) === categoryFilter
      );
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((it) => {
        const blob = [
          it.name,
          normalizeCategory(it.category),
          String(it.quantity ?? ""),
          it.location ?? "",
          it.notes ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    return list;
  }, [items, categoryFilter, searchQuery]);

  function startEdit(row: Item) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      location: row.location,
      notes: row.notes ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload =
        editingId != null
          ? {
              method: "PUT" as const,
              body: JSON.stringify({
                id: editingId,
                name,
                category: form.category.trim() || "general",
                quantity: Number(form.quantity) || 0,
                location: form.location.trim(),
                notes: form.notes.trim(),
              }),
            }
          : {
              method: "POST" as const,
              body: JSON.stringify({
                name,
                category: form.category.trim() || "general",
                quantity: Number(form.quantity) || 0,
                location: form.location.trim(),
                notes: form.notes.trim(),
              }),
            };

      const res = await fetch("/api/inventory", {
        ...payload,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        incremented?: boolean;
        created?: boolean;
      };
      if (!res.ok) {
        toast.error(data.error || "Save failed");
        return;
      }
      if (editingId != null) {
        toast.success("Updated");
      } else if (data.incremented) {
        toast.success("Quantity increased (same name + category)");
      } else {
        toast.success("Added");
      }
      cancelEdit();
      void load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this row?")) return;
    const res = await fetch("/api/inventory", {
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
    toast.success("Deleted");
    if (editingId === id) cancelEdit();
    void load();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Inventory
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8 max-w-xl">
        Stored in Cloudflare D1. Create a database, run the SQL migration, and
        bind it as <code className="text-xs">DB</code> on your Pages project.
      </p>

      <form
        onSubmit={submit}
        className="mb-10 space-y-4 max-w-3xl rounded-sm border border-border dark:border-dark_border bg-section dark:bg-darklight p-6">
        <p className="text-sm font-medium text-midnight_text dark:text-white">
          {editingId != null ? `Edit #${editingId}` : "Add item"}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="text-xs text-grey">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-grey">Category</span>
            <CategoryCombobox
              value={form.category}
              onChange={(category) => setForm((f) => ({ ...f, category }))}
              options={categories}
            />
            <p className="mt-1 text-xs text-grey">
              Type to filter, choose from the list, or enter a new category.
            </p>
          </label>
          <label className="block">
            <span className="text-xs text-grey">Quantity</span>
            <input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  quantity: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-grey">Location</span>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
              placeholder="shelf, bin, lab…"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-grey">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving…" : editingId != null ? "Update" : "Add"}
          </button>
          {editingId != null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-sm border border-border dark:border-dark_border px-4 py-2 text-sm text-midnight_text dark:text-white">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-grey">No rows yet (or D1 not connected).</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 rounded-sm border border-border dark:border-dark_border bg-section dark:bg-darklight p-4">
            <label className="block sm:min-w-[12rem]">
              <span className="text-xs text-grey block mb-1">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white">
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1 min-w-[12rem] sm:max-w-md">
              <span className="text-xs text-grey block mb-1">Search</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, category, qty, location, notes…"
                autoComplete="off"
                className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white placeholder:text-grey"
              />
            </label>
            <p className="text-xs text-grey sm:ml-auto sm:pb-2">
              Showing {filteredItems.length} of {items.length}
            </p>
          </div>

          {filteredItems.length === 0 ? (
            <p className="text-grey">
              No items match this category or search. Clear filters to see all
              rows.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-border dark:border-dark_border">
              <table className="w-full text-sm text-left">
                <thead className="bg-section dark:bg-darklight text-midnight_text dark:text-white">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Location</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                    <th className="px-3 py-2 font-medium w-40" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-dark_border bg-white dark:bg-darklight">
                  {filteredItems.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 text-midnight_text dark:text-white">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-grey">
                        {normalizeCategory(row.category)}
                      </td>
                      <td className="px-3 py-2 text-midnight_text dark:text-white">
                        {row.quantity}
                      </td>
                      <td className="px-3 py-2 text-grey">{row.location}</td>
                      <td className="px-3 py-2 text-grey max-w-xs truncate">
                        {row.notes}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="text-primary text-xs font-medium mr-3 hover:underline">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row.id)}
                          className="text-grey text-xs hover:text-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
