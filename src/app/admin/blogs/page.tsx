"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type Row = { slug: string; name: string; path: string; sha: string };

export default function AdminBlogsListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs", { credentials: "include" });
      const data = (await res.json()) as Row[] | { error?: string };
      if (!res.ok) {
        toast.error(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Failed to load posts"
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
    if (!confirm(`Delete post “${slug}” from the repository?`)) return;
    const res = await fetch(
      `/api/admin/blogs/${encodeURIComponent(slug)}`,
      { method: "DELETE", credentials: "include" }
    );
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Deleted — redeploy to update the public site.");
    void load();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Blog posts
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8">
        Files under <code className="text-xs">markdown/Blog</code>. Editing
        commits to GitHub.
      </p>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-grey">No MDX posts found in the repo.</p>
      ) : (
        <ul className="divide-y divide-border dark:divide-dark_border rounded-sm border border-border dark:border-dark_border overflow-hidden">
          {rows.map((r) => (
            <li
              key={r.slug}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-darklight">
              <span className="font-medium text-midnight_text dark:text-white">
                {r.slug}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/blogs/${encodeURIComponent(r.slug)}`}
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
