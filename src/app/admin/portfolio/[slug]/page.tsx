"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { PortfolioItem } from "@/app/api/data";

export default function AdminPortfolioEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [image, setImage] = useState("");
  const [info, setInfo] = useState("");
  const [className, setClassName] = useState("md:mt-0");
  const [description, setDescription] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/portfolio/${encodeURIComponent(slug)}`,
        { credentials: "include" }
      );
      const data = (await res.json()) as PortfolioItem | { error?: string };
      if (!res.ok || !("slug" in data)) {
        toast.error(
          "error" in data && data.error ? String(data.error) : "Load failed"
        );
        return;
      }
      setTitle(data.title);
      setAlt(data.alt);
      setImage(data.image);
      setInfo(data.info);
      setClassName(data.Class || "md:mt-0");
      setDescription(data.description);
      setDeliverablesText(data.deliverables.join("\n"));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const deliverables = deliverablesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/portfolio/${encodeURIComponent(slug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            slug,
            alt: alt.trim() || title.trim(),
            image: image.trim() || "/images/portfolio/cozycasa.png",
            info: info.trim() || title.trim(),
            Class: className.trim() || "md:mt-0",
            description: description.trim(),
            deliverables,
          }),
        }
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Save failed");
        return;
      }
      toast.success("Saved to GitHub");
      router.push("/admin/portfolio");
    } finally {
      setSaving(false);
    }
  }

  if (!slug) {
    return <p className="text-midnight_text dark:text-white">Invalid project.</p>;
  }

  if (loading) {
    return <p className="text-midnight_text dark:text-white">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Edit project
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8 font-mono">
        {slug}
      </p>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Image path
          </span>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Image alt text
          </span>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Short line (card subtitle)
          </span>
          <input
            type="text"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Grid offset class
          </span>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="md:mt-0">md:mt-0</option>
            <option value="md:mt-24">md:mt-24</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={12}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Deliverables (one per line)
          </span>
          <textarea
            value={deliverablesText}
            onChange={(e) => setDeliverablesText(e.target.value)}
            rows={6}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-primary text-white font-medium px-8 py-3 hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link
            href="/admin/portfolio"
            className="rounded-sm border border-border dark:border-dark_border px-8 py-3 text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight inline-flex items-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
