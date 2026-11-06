"use client";

import React, { useRef, useState } from "react";
import MarkdownEditorToolbar from "@/components/Admin/MarkdownEditorToolbar";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ADMIN_BLOG_PREVIEW_STORAGE_KEY } from "@/lib/admin-blog-preview";

export default function AdminBlogPublishPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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
          ? `Queued for publish can take up to 10 minutes. Slug: ${data.slug}`
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

  async function handlePreview() {
    if (!title.trim() || !content.trim()) {
      toast.error("Add a title and content to preview");
      return;
    }
    setPreviewLoading(true);
    try {
      let coverForPreview = "/images/blog/blog_1.webp";
      if (imageFile) {
        coverForPreview = await readFileAsDataUrl(imageFile);
      }
      const res = await fetch("/api/admin/blog/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          coverImage: coverForPreview.startsWith("data:")
            ? "/images/blog/blog_1.webp"
            : undefined,
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

        <div className="block">
          <span className="block text-sm font-medium text-midnight_text dark:text-white mb-2">
            Content (Markdown)
          </span>
          <div className="rounded-sm border border-border dark:border-dark_border overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
            <MarkdownEditorToolbar
              textareaRef={contentRef}
              value={content}
              onChange={setContent}
            />
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full border-0 rounded-none bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white font-mono text-sm focus:outline-none focus:ring-0"
              required
              placeholder="Write in Markdown…"
            />
          </div>
        </div>

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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={previewLoading || publishLoading}
            onClick={() => void handlePreview()}
            className="rounded-sm border border-border dark:border-dark_border px-8 py-3 text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight disabled:opacity-60">
            {previewLoading ? "Rendering…" : "Preview"}
          </button>
          <button
            type="submit"
            disabled={publishLoading}
            className="rounded-sm bg-primary text-white font-medium px-8 py-3 hover:opacity-90 disabled:opacity-60">
            {publishLoading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
