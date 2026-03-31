"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

export default function AdminBlogPublishPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Could not read file"));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setPublishLoading(true);
    try {
      let imageBase64: string | null = null;
      if (imageFile) {
        imageBase64 = await readFileAsDataUrl(imageFile);
      }
      const res = await fetch("/api/upload-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || undefined,
          imageBase64,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        slug?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Publish failed");
        return;
      }
      toast.success(
        data.slug
          ? `Queued for deploy. Slug: ${data.slug}`
          : "Published to GitHub — deploy will follow."
      );
      setTitle("");
      setExcerpt("");
      setContent("");
      setImageFile(null);
    } finally {
      setPublishLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Publish blog post
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-10">
        Content is committed to your repo; Cloudflare deploys on push.
      </p>

      <form onSubmit={handlePublish} className="space-y-6 max-w-3xl">
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
            Excerpt <span className="text-grey font-normal">(optional)</span>
          </span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Short summary for listings"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Content (Markdown)
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
            placeholder="Write in Markdown…"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Cover image{" "}
            <span className="text-grey font-normal">(optional)</span>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-midnight_text dark:text-white file:mr-4 file:rounded-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
          />
          <p className="text-xs text-grey mt-2">
            If omitted, the default cover from the theme is used.
          </p>
        </label>

        <button
          type="submit"
          disabled={publishLoading}
          className="rounded-sm bg-primary text-white font-medium px-8 py-3 hover:opacity-90 disabled:opacity-60">
          {publishLoading ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
