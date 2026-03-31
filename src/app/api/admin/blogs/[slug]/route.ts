import { NextResponse } from "next/server";
import matter from "gray-matter";
import { requireAdminSession } from "@/lib/admin-guard";
import {
  GITHUB_BLOG_DIR,
  githubDeleteFile,
  githubGetTextFile,
  githubPutFile,
  parseGithubRepo,
} from "@/lib/github";

export const runtime = "edge";

const MAX_CONTENT_CHARS = 200_000;

function assertSafeSlug(slug: string): string | null {
  if (!slug || slug.length > 200) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) return null;
  return slug;
}

function buildMdxFile(params: {
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  author: string;
  authorImage: string;
  body: string;
}): string {
  const { title, excerpt, date, coverImage, author, authorImage, body } = params;
  let mdxBody = body;
  if (mdxBody.startsWith("---")) {
    mdxBody = `\n${mdxBody}`;
  }
  return `---
title: ${JSON.stringify(title)}
excerpt: ${JSON.stringify(excerpt)}
date: ${date}
coverImage: ${JSON.stringify(coverImage.startsWith("/") ? coverImage : `/${coverImage}`)}
author: ${JSON.stringify(author)}
authorImage: ${JSON.stringify(authorImage)}
---

${mdxBody}
`;
}

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, context: RouteCtx) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const rawSlug = (await context.params).slug;
  const slug = assertSafeSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repoStr) {
    return NextResponse.json({ error: "GitHub not configured" }, { status: 503 });
  }

  let owner: string;
  let repo: string;
  try {
    const parsed = parseGithubRepo(repoStr);
    owner = parsed.owner;
    repo = parsed.name;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid repo" },
      { status: 500 }
    );
  }

  const path = `${GITHUB_BLOG_DIR}/${slug}.mdx`;
  try {
    const { sha, text } = await githubGetTextFile({
      owner,
      repo,
      path,
      token,
      branch,
    });
    const { data, content } = matter(text);
    const d = data as Record<string, string>;
    return NextResponse.json({
      slug,
      sha,
      title: d.title ?? "",
      excerpt: d.excerpt ?? "",
      date: d.date ?? "",
      coverImage: d.coverImage ?? "",
      author: d.author ?? "",
      authorImage: d.authorImage ?? "",
      body: content.trim(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load post" },
      { status: 404 }
    );
  }
}

export async function PUT(req: Request, context: RouteCtx) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const rawSlug = (await context.params).slug;
  const slug = assertSafeSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repoStr) {
    return NextResponse.json({ error: "GitHub not configured" }, { status: 503 });
  }

  let owner: string;
  let repo: string;
  try {
    const parsed = parseGithubRepo(repoStr);
    owner = parsed.owner;
    repo = parsed.name;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid repo" },
      { status: 500 }
    );
  }

  let body: {
    title?: string;
    excerpt?: string;
    content?: string;
    date?: string;
    coverImage?: string;
    author?: string;
    authorImage?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const excerpt = (body.excerpt ?? "").trim();
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

  const date =
    (body.date ?? "").trim() || new Date().toISOString().slice(0, 10);
  const coverImage = (body.coverImage ?? "").trim() || "/images/blog/blog_1.png";
  const author =
    (body.author ?? "").trim() ||
    process.env.BLOG_DEFAULT_AUTHOR?.trim() ||
    "Haizom Studio";
  const authorImage =
    (body.authorImage ?? "").trim() ||
    process.env.BLOG_DEFAULT_AUTHOR_IMAGE?.trim() ||
    "/images/blogdetail-page/silicaman.png";

  const path = `${GITHUB_BLOG_DIR}/${slug}.mdx`;
  const mdx = buildMdxFile({
    title,
    excerpt: excerpt || title,
    date,
    coverImage,
    author,
    authorImage,
    body: content,
  });

  try {
    await githubPutFile({
      owner,
      repo,
      path,
      contentBytes: new TextEncoder().encode(mdx),
      message: `content(blog): update ${title}`,
      branch,
      token,
    });
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 502 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteCtx) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const rawSlug = (await context.params).slug;
  const slug = assertSafeSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repoStr) {
    return NextResponse.json({ error: "GitHub not configured" }, { status: 503 });
  }

  let owner: string;
  let repo: string;
  try {
    const parsed = parseGithubRepo(repoStr);
    owner = parsed.owner;
    repo = parsed.name;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid repo" },
      { status: 500 }
    );
  }

  const path = `${GITHUB_BLOG_DIR}/${slug}.mdx`;

  try {
    const { sha } = await githubGetTextFile({
      owner,
      repo,
      path,
      token,
      branch,
    });
    await githubDeleteFile({
      owner,
      repo,
      path,
      sha,
      message: `content(blog): remove ${slug}`,
      branch,
      token,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 502 }
    );
  }
}
