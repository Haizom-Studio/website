"use client";

import React, { useCallback, useEffect, useState } from "react";
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

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

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
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="mt-1 w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 text-sm text-midnight_text dark:text-white"
              placeholder="resistor, sensor, …"
            />
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
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 text-midnight_text dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-3 py-2 text-grey">{row.category}</td>
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
  );
}
