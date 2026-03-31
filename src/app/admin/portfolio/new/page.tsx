"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "project";
}

export default function AdminPortfolioNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [alt, setAlt] = useState("");
  const [image, setImage] = useState("/images/portfolio/cozycasa.png");
  const [info, setInfo] = useState("");
  const [className, setClassName] = useState("md:mt-0");
  const [description, setDescription] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) {
      setSlug(slugify(v));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const deliverables = deliverablesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!title.trim() || !slug.trim() || !description.trim()) {
      toast.error("Title, slug, and description are required");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(slug.trim())) {
      toast.error("Slug may only contain letters, numbers, dots, hyphens, underscores");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          alt: alt.trim() || title.trim(),
          image: image.trim() || "/images/portfolio/cozycasa.png",
          info: info.trim() || title.trim(),
          Class: className.trim() || "md:mt-0",
          description: description.trim(),
          deliverables,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        slug?: string;
      };
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        New portfolio project
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8">
        Use a public image path under <code className="text-xs">public/</code>{" "}
        (e.g. <code className="text-xs">/images/portfolio/my.png</code>).
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Slug (URL)
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
            Description (paragraphs separated by blank lines)
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
            {saving ? "Saving…" : "Save to GitHub"}
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
