"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPage() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/admin/session", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean };
    setSessionOk(!!data.ok);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success("Signed in");
      setPassword("");
      await refreshSession();
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setSessionOk(false);
    toast.success("Signed out");
  }

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

  if (sessionOk === null) {
    return (
      <section className="pt-32 pb-24 dark:bg-darkmode min-h-[50vh]">
        <div className="container mx-auto max-w-lg px-4 text-center text-midnight_text dark:text-white">
          Checking session…
        </div>
      </section>
    );
  }

  if (!sessionOk) {
    return (
      <>
        <Toaster position="top-center" />
        <section className="pt-32 pb-24 dark:bg-darkmode min-h-[70vh]">
          <div className="container mx-auto max-w-md px-4">
            <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
              Blog admin
            </h1>
            <p className="text-grey dark:text-SereneGray mb-8 text-sm">
              Sign in with the team password to publish posts to GitHub.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Password"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-sm bg-primary text-white font-medium py-3 hover:opacity-90 disabled:opacity-60">
                {loginLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <section className="pt-32 pb-24 dark:bg-darkmode min-h-[70vh]">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-midnight_text dark:text-white">
                Publish blog post
              </h1>
              <p className="text-grey dark:text-SereneGray text-sm mt-1">
                Content is committed to your repo; Cloudflare deploys on push.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="text-sm font-medium text-grey hover:text-primary dark:text-SereneGray">
              Sign out
            </button>
          </div>

          <form onSubmit={handlePublish} className="space-y-6">
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
                Cover image <span className="text-grey font-normal">(optional)</span>
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
      </section>
    </>
  );
}
