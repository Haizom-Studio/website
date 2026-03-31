"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BlogPostDetail from "@/components/Blog/BlogPostDetail";
import { ADMIN_BLOG_PREVIEW_STORAGE_KEY } from "@/lib/admin-blog-preview";

const STORAGE_KEY = ADMIN_BLOG_PREVIEW_STORAGE_KEY;

export type BlogPreviewPayload = {
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  author: string;
  authorImage: string;
  html: string;
  slug: string;
};

export default function AdminBlogPreviewPage() {
  const [data, setData] = useState<BlogPreviewPayload | null>(null);
  const [bad, setBad] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setBad(true);
        return;
      }
      const parsed = JSON.parse(raw) as BlogPreviewPayload;
      if (typeof parsed.html !== "string" || typeof parsed.title !== "string") {
        setBad(true);
        return;
      }
      setData(parsed);
    } catch {
      setBad(true);
    }
  }, []);

  if (bad || !data) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
          No preview
        </h1>
        <p className="text-grey dark:text-SereneGray text-sm mb-6">
          Open a post editor, choose <strong>Preview</strong>, then you will land
          here with the rendered draft. This page does not load saved posts by
          URL alone.
        </p>
        <Link
          href="/admin/blog"
          className="text-primary font-medium hover:underline">
          ← Back to new post
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="mb-6 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-grey dark:text-SereneGray">
          Draft preview — not published until you save or publish to GitHub.
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm font-medium text-primary hover:underline">
          ← Back to editor
        </button>
      </div>
      <BlogPostDetail
        title={data.title}
        excerpt={data.excerpt}
        date={data.date}
        coverImage={data.coverImage}
        author={data.author}
        authorImage={data.authorImage}
        html={data.html}
        slug={data.slug}
      />
    </div>
  );
}
