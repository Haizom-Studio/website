"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PortfolioProjectImagesField from "@/components/Admin/PortfolioProjectImagesField";
import { PORTFOLIO_CATEGORY_SUGGESTIONS } from "@/lib/portfolio-categories";

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
  const [images, setImages] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  const [category, setCategory] = useState("");
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
    if (images.length === 0) {
      toast.error("Add at least one project image (upload or path)");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(slug.trim())) {
      toast.error(
        "Slug may only contain letters, numbers, dots, hyphens, underscores"
      );
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
          images,
          info: info.trim() || title.trim(),
          category: category.trim(),
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
      <p className="text-grey dark:text-SereneGray text-sm mb-8 max-w-2xl leading-relaxed">
        Set the title and URL slug first, then upload one or more images. Images
        are stored in your repo and appear on the project page as a swipeable
        gallery (like a product page). You can reorder images with Up / Down.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
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

        <div className="rounded-sm border border-border dark:border-dark_border bg-section/30 dark:bg-darklight/40 p-5">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-4">
            Project images
          </span>
          <PortfolioProjectImagesField
            projectSlug={slug}
            images={images}
            onChange={setImages}
            disabled={saving}
          />
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Image alt text (accessibility; used for all slides)
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
            Category (portfolio filter)
          </span>
          <input
            type="text"
            list="portfolio-category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Power Electronics — leave empty to use the card subtitle"
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <datalist id="portfolio-category-options">
            {PORTFOLIO_CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <span className="mt-1 block text-xs text-grey dark:text-SereneGray">
            Visitors can filter the portfolio by this. Pick a suggestion or type a new one.
          </span>
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

        <div className="flex flex-wrap gap-3 pt-2">
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
