"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { PortfolioItem } from "@/app/api/data";

export default function AdminPortfolioListPage() {
  const [rows, setRows] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio", {
        credentials: "include",
      });
      const data = (await res.json()) as PortfolioItem[] | { error?: string };
      if (!res.ok) {
        toast.error(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Failed to load portfolio"
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

  async function remove(slug: string) {
    if (!confirm(`Remove project “${slug}” from the repository?`)) return;
    const res = await fetch(
      `/api/admin/portfolio/${encodeURIComponent(slug)}`,
      { method: "DELETE", credentials: "include" }
    );
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
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Portfolio projects
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-6">
        Stored in <code className="text-xs">src/data/portfolio.json</code>.
        Saves commit to GitHub; deploy follows on push.
      </p>
      <p className="mb-8">
        <Link
          href="/admin/portfolio/new"
          className="inline-flex rounded-sm bg-primary text-white font-medium px-6 py-2.5 hover:opacity-90">
          Add project
        </Link>
      </p>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-grey">No projects found.</p>
      ) : (
        <ul className="divide-y divide-border dark:divide-dark_border rounded-sm border border-border dark:border-dark_border overflow-hidden">
          {rows.map((r) => (
            <li
              key={r.slug}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-darklight">
              <div>
                <span className="font-medium text-midnight_text dark:text-white block">
                  {r.title}
                </span>
                <span className="text-xs text-grey font-mono">{r.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/portfolio/${encodeURIComponent(r.slug)}`}
                  className="text-sm font-medium text-primary hover:underline">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(r.slug)}
                  className="text-sm font-medium text-grey hover:text-red-600 dark:text-SereneGray">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
