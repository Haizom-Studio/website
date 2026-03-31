"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ADMIN_BLOG_PREVIEW_STORAGE_KEY } from "@/lib/admin-blog-preview";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  author: string;
  authorImage: string;
  body: string;
};

export default function AdminBlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [date, setDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("");
  const [authorImage, setAuthorImage] = useState("");
  const [content, setContent] = useState("");

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/blogs/${encodeURIComponent(slug)}`,
        { credentials: "include" }
      );
      const data = (await res.json()) as Post | { error?: string };
      if (!res.ok || !("body" in data)) {
        toast.error(
          "error" in data && data.error ? String(data.error) : "Load failed"
        );
        return;
      }
      setTitle(data.title);
      setExcerpt(data.excerpt);
      setDate(data.date);
      setCoverImage(data.coverImage);
      setAuthor(data.author);
      setAuthorImage(data.authorImage);
      setContent(data.body);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/blogs/${encodeURIComponent(slug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            excerpt: excerpt.trim(),
            content: content.trim(),
            date: date.trim(),
            coverImage: coverImage.trim(),
            author: author.trim(),
            authorImage: authorImage.trim(),
          }),
        }
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Save failed");
        return;
      }
      toast.success("Saved to GitHub");
      router.push("/admin/blogs");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/blog/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          date: date.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          author: author.trim() || undefined,
          authorImage: authorImage.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Preview failed"
        );
        return;
      }
      sessionStorage.setItem(
        ADMIN_BLOG_PREVIEW_STORAGE_KEY,
        JSON.stringify(data)
      );
      router.push("/admin/blog/preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  if (!slug) {
    return <p className="text-midnight_text dark:text-white">Invalid post.</p>;
  }

  if (loading) {
    return <p className="text-midnight_text dark:text-white">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Edit post
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8 font-mono">
        {slug}.mdx
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
            Excerpt
          </span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Date (YYYY-MM-DD)
          </span>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Cover image URL
          </span>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="/blog-images/..."
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Author
          </span>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Author image URL
          </span>
          <input
            type="text"
            value={authorImage}
            onChange={(e) => setAuthorImage(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Content (Markdown)
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={previewLoading || saving}
            onClick={() => void handlePreview()}
            className="rounded-sm border border-border dark:border-dark_border px-8 py-3 text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight disabled:opacity-60">
            {previewLoading ? "Rendering…" : "Preview"}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-primary text-white font-medium px-8 py-3 hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-sm border border-border dark:border-dark_border px-8 py-3 text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
