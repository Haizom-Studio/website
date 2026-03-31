import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-session";
import { githubPutFile, parseGithubRepo } from "@/lib/github";

const MAX_CONTENT_CHARS = 200_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "post";
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } {
  const m = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!m) {
    throw new Error("Image must be a base64 data URL (data:image/...;base64,...)");
  }
  const mime = m[1].split(";")[0].trim();
  const base64 = m[2].replace(/\s/g, "");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error(`Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`);
  }
  return { mime, buffer };
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "png";
}

function defaultExcerptFromBody(markdown: string): string {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 200 ? `${plain.slice(0, 197)}...` : plain;
}

export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!githubToken || !repoStr) {
    return NextResponse.json(
      { error: "GitHub integration is not configured" },
      { status: 503 }
    );
  }

  let body: {
    title?: string;
    content?: string;
    excerpt?: string;
    imageBase64?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();
  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }
  if (content.length > MAX_CONTENT_CHARS) {
    return NextResponse.json({ error: "Content is too long" }, { status: 400 });
  }

  const excerpt =
    (body.excerpt ?? "").trim() || defaultExcerptFromBody(content);

  const author =
    process.env.BLOG_DEFAULT_AUTHOR?.trim() || "Haizom Studio";
  const authorImage =
    process.env.BLOG_DEFAULT_AUTHOR_IMAGE?.trim() ||
    "/images/blogdetail-page/silicaman.png";

  const date = new Date().toISOString().slice(0, 10);
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = `${slugify(title)}-${id}`;

  let owner: string;
  let repo: string;
  try {
    const parsed = parseGithubRepo(repoStr);
    owner = parsed.owner;
    repo = parsed.name;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid GITHUB_REPO" },
      { status: 500 }
    );
  }

  let coverPath: string;
  const commits: string[] = [];

  if (body.imageBase64) {
    let parsed: { mime: string; buffer: Buffer };
    try {
      parsed = parseDataUrl(body.imageBase64);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid image" },
        { status: 400 }
      );
    }
    const ext = extFromMime(parsed.mime);
    const imagePath = `public/blog-images/${slug}.${ext}`;
    coverPath = `blog-images/${slug}.${ext}`;

    try {
      const r = await githubPutFile({
        owner,
        repo,
        path: imagePath,
        contentBytes: parsed.buffer,
        message: `chore(blog): add cover image for ${slug}`,
        branch,
        token: githubToken,
      });
      if (r.commitSha) commits.push(r.commitSha);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "GitHub image upload failed" },
        { status: 502 }
      );
    }
  } else {
    coverPath = "images/blog/blog_1.png";
  }

  let mdxBody = content;
  if (mdxBody.startsWith("---")) {
    mdxBody = `\n${mdxBody}`;
  }

  const fmTitle = JSON.stringify(title);
  const fmExcerpt = JSON.stringify(excerpt);
  const fmAuthor = JSON.stringify(author);
  const fmAuthorImage = JSON.stringify(authorImage);

  const mdx = `---
title: ${fmTitle}
excerpt: ${fmExcerpt}
date: ${date}
coverImage: /${coverPath.replace(/^\//, "")}
author: ${fmAuthor}
authorImage: ${fmAuthorImage}
---

${mdxBody}
`;

  const mdxPath = `markdown/Blog/${slug}.mdx`;

  try {
    const r = await githubPutFile({
      owner,
      repo,
      path: mdxPath,
      contentBytes: Buffer.from(mdx, "utf8"),
      message: `content(blog): publish ${title}`,
      branch,
      token: githubToken,
    });
    if (r.commitSha) commits.push(r.commitSha);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "GitHub MDX upload failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    slug,
    path: mdxPath,
    coverPath: coverPath.startsWith("/") ? coverPath : `/${coverPath}`,
  });
}
