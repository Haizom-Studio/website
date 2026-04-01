"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LocationMapEmbed from "@/components/Admin/LocationMapEmbed";

type Row = {
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
  status: string;
};

function dash(s: string | null | undefined) {
  const t = (s ?? "").trim();
  return t || "—";
}

type Filter = "all" | "open" | "complete";

export default function AdminContactsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("open");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contacts", { credentials: "include" });
      const data = (await res.json()) as Row[] | { error?: string };
      if (!res.ok) {
        toast.error(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Failed to load bookings"
        );
        setRows([]);
        return;
      }
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "complete") {
      return rows.filter((r) => r.status === "complete");
    }
    return rows.filter((r) => r.status !== "complete");
  }, [rows, filter]);

  async function setStatus(id: number, status: "open" | "complete") {
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Update failed");
      return;
    }
    toast.success(status === "complete" ? "Marked complete" : "Reopened");
    void load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this booking permanently?")) return;
    const res = await fetch("/api/admin/contacts", {
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
    void load();
  }

  const filterBtn = (f: Filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(f)}
      className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
        filter === f
          ? "bg-primary text-white"
          : "border border-border dark:border-dark_border text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight"
      }`}>
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Contact &amp; booking requests
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-6 max-w-2xl">
        Appointments submitted through the contact form. Location comes from the
        visitor IP on Cloudflare. Mark rows complete when handled, or delete
        them if they are spam or duplicates.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {filterBtn("open", "Open")}
        {filterBtn("complete", "Complete")}
        {filterBtn("all", "All")}
      </div>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-grey">
          No requests yet (or D1 not connected / migration not applied).
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-grey">Nothing in this view.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((row) => {
            const done = row.status === "complete";
            return (
              <article
                key={row.id}
                className="rounded-sm border border-border dark:border-dark_border bg-section dark:bg-darklight p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-lg font-semibold text-midnight_text dark:text-white">
                      {row.first_name} {row.last_name}
                    </p>
                    <p className="text-sm text-grey">{row.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${
                      done
                        ? "bg-green-500/15 text-green-700 dark:text-green-400"
                        : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                    }`}>
                    {done ? "Complete" : "Open"}
                  </span>
                </div>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                  <div>
                    <dt className="text-xs text-grey uppercase tracking-wide">
                      Service
                    </dt>
                    <dd className="text-midnight_text dark:text-white">
                      {dash(row.service)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-grey uppercase tracking-wide">
                      Specialist
                    </dt>
                    <dd className="text-midnight_text dark:text-white">
                      {dash(row.specialist)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-grey uppercase tracking-wide">
                      Date &amp; time
                    </dt>
                    <dd className="text-midnight_text dark:text-white">
                      {dash(row.date)} · {dash(row.time)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-grey uppercase tracking-wide">
                      Location (IP)
                    </dt>
                    <dd className="text-midnight_text dark:text-white">
                      {dash(row.location)}
                      {row.ip_address ? (
                        <span className="block font-mono text-xs text-grey mt-0.5">
                          {row.ip_address}
                        </span>
                      ) : null}
                      <LocationMapEmbed
                        location={row.location}
                        ipAddress={row.ip_address}
                        className="mt-3"
                      />
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  {done ? (
                    <button
                      type="button"
                      onClick={() => void setStatus(row.id, "open")}
                      className="rounded-sm border border-border dark:border-dark_border px-3 py-1.5 text-xs font-medium text-midnight_text dark:text-white hover:bg-white/50 dark:hover:bg-darkmode">
                      Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void setStatus(row.id, "complete")}
                      className="rounded-sm bg-primary text-white px-3 py-1.5 text-xs font-medium hover:opacity-90">
                      Mark complete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void remove(row.id)}
                    className="rounded-sm text-xs font-medium text-grey hover:text-red-600 px-3 py-1.5">
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
