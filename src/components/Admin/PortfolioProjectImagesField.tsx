"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type Props = {
  projectSlug: string;
  images: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === "string") resolve(r.result);
      else reject(new Error("Read failed"));
    };
    r.onerror = () => reject(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

export default function PortfolioProjectImagesField({
  projectSlug,
  images,
  onChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [manualPath, setManualPath] = useState("");

  const slugOk = /^[a-zA-Z0-9._-]+$/.test(projectSlug.trim()) && projectSlug.trim().length > 0;

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) {
        toast.error("Choose image files (JPEG, PNG, WebP, or GIF)");
        return;
      }
      if (!slugOk) {
        toast.error("Set a valid URL slug first (letters, numbers, dots, hyphens, underscores)");
        return;
      }
      setUploading(true);
      try {
        const next = [...images];
        for (const file of list) {
          const dataUrl = await readFileAsDataUrl(file);
          const res = await fetch("/api/admin/portfolio/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              imageBase64: dataUrl,
              projectSlug: projectSlug.trim(),
            }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            url?: string;
          };
          if (!res.ok || !data.url) {
            toast.error(data.error || "Upload failed");
            continue;
          }
          next.push(data.url);
        }
        onChange(next);
        if (next.length > images.length) {
          toast.success(
            next.length - images.length === 1
              ? "Image uploaded"
              : `${next.length - images.length} images uploaded`
          );
        }
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [images, onChange, projectSlug, slugOk]
  );

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }

  function remove(i: number) {
    onChange(images.filter((_, k) => k !== i));
  }

  function addManualPath() {
    const t = manualPath.trim();
    if (!t) return;
    const path = t.startsWith("/") ? t : `/${t}`;
    onChange([...images, path]);
    setManualPath("");
    toast.success("Path added");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || uploading || !slugOk}
          onClick={() => inputRef.current?.click()}
          className="rounded-sm border border-primary bg-primary/10 px-4 py-2.5 text-sm font-medium text-midnight_text dark:text-white hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const f = e.target.files;
            if (f && f.length) void uploadFiles(f);
          }}
        />
        <span className="text-xs text-grey dark:text-SereneGray">
          One or more files; saved to the repo under{" "}
          <code className="text-[11px]">public/images/portfolio/uploads/…</code>
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="block min-w-[240px] flex-1">
          <span className="mb-1 block text-xs font-medium text-midnight_text dark:text-white">
            Or add an existing path (under <code className="text-[10px]">public/</code>)
          </span>
          <input
            type="text"
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            placeholder="/images/portfolio/example.png"
            disabled={disabled}
            className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-3 py-2 font-mono text-sm text-midnight_text dark:text-white"
          />
        </label>
        <button
          type="button"
          disabled={disabled || !manualPath.trim()}
          onClick={addManualPath}
          className="rounded-sm border border-border dark:border-dark_border px-4 py-2 text-sm text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight disabled:opacity-50">
          Add path
        </button>
      </div>

      {!slugOk ? (
        <p className="text-sm text-amber-700 dark:text-amber-300/90">
          Enter a valid slug above before uploading so files are organized per project.
        </p>
      ) : null}

      {images.length === 0 ? (
        <p className="text-sm text-grey dark:text-SereneGray rounded-sm border border-dashed border-border dark:border-dark_border px-4 py-8 text-center">
          No images yet. Upload at least one image, or add a path manually below.
        </p>
      ) : (
        <ul className="space-y-3">
          {images.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="flex flex-wrap items-center gap-4 rounded-sm border border-border dark:border-dark_border bg-section/40 dark:bg-darklight/50 p-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded bg-black/5 dark:bg-white/5">
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1 font-mono text-xs text-midnight_text dark:text-white break-all">
                {url}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled || i === 0}
                  onClick={() => move(i, -1)}
                  className="rounded-sm border border-border dark:border-dark_border px-2 py-1 text-xs disabled:opacity-40">
                  Up
                </button>
                <button
                  type="button"
                  disabled={disabled || i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className="rounded-sm border border-border dark:border-dark_border px-2 py-1 text-xs disabled:opacity-40">
                  Down
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(i)}
                  className="rounded-sm border border-red-300 dark:border-red-800 px-2 py-1 text-xs text-red-700 dark:text-red-300">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
