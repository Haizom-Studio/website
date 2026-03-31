import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { GITHUB_PORTFOLIO_PATH, githubPutFile, parseGithubRepo } from "@/lib/github";
import { loadPortfolioItemsFromGithubOrBundled } from "@/lib/portfolio-github-load";
import {
  assertSafePortfolioSlug,
  stringifyPortfolio,
  validateBodyItem,
} from "@/lib/portfolio-store";
import type { PortfolioItem } from "@/app/api/data";

export const runtime = "edge";

type RouteCtx = { params: Promise<{ slug: string }> };

async function githubCtx() {
  const token = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repoStr) {
    return {
      error: NextResponse.json(
        { error: "GitHub integration is not configured" },
        { status: 503 }
      ),
    } as const;
  }
  let owner: string;
  let repo: string;
  try {
    const parsed = parseGithubRepo(repoStr);
    owner = parsed.owner;
    repo = parsed.name;
  } catch (e) {
    return {
      error: NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid GITHUB_REPO" },
        { status: 500 }
      ),
    } as const;
  }
  return { owner, repo, token, branch };
}

export async function GET(_req: Request, context: RouteCtx) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const rawSlug = (await context.params).slug;
  const slug = assertSafePortfolioSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const ctx = await githubCtx();
  if ("error" in ctx) return ctx.error;
  const { owner, repo, token, branch } = ctx;

  try {
    const items = await loadPortfolioItemsFromGithubOrBundled({
      owner,
      repo,
      token,
      branch,
    });
    const item = items.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
    if (!item) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load" },
      { status: 502 }
    );
  }
}

export async function PUT(req: Request, context: RouteCtx) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const rawSlug = (await context.params).slug;
  const slug = assertSafePortfolioSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const ctx = await githubCtx();
  if ("error" in ctx) return ctx.error;
  const { owner, repo, token, branch } = ctx;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updated = validateBodyItem(body);
  if (!updated) {
    return NextResponse.json(
      { error: "Invalid project fields" },
      { status: 400 }
    );
  }

  if (updated.slug.toLowerCase() !== slug.toLowerCase()) {
    return NextResponse.json(
      { error: "Slug in URL must match slug in body" },
      { status: 400 }
    );
  }

  try {
    const items = await loadPortfolioItemsFromGithubOrBundled({
      owner,
      repo,
      token,
      branch,
    });
    const idx = items.findIndex((p) => p.slug.toLowerCase() === slug.toLowerCase());
    if (idx < 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const next: PortfolioItem[] = [...items];
    next[idx] = updated;
    await githubPutFile({
      owner,
      repo,
      path: GITHUB_PORTFOLIO_PATH,
      contentBytes: new TextEncoder().encode(stringifyPortfolio(next)),
      message: `content(portfolio): update ${updated.slug}`,
      branch,
      token,
    });
    return NextResponse.json({ ok: true, slug: updated.slug });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 502 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteCtx) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const rawSlug = (await context.params).slug;
  const slug = assertSafePortfolioSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const ctx = await githubCtx();
  if ("error" in ctx) return ctx.error;
  const { owner, repo, token, branch } = ctx;

  try {
    const items = await loadPortfolioItemsFromGithubOrBundled({
      owner,
      repo,
      token,
      branch,
    });
    const next = items.filter((p) => p.slug.toLowerCase() !== slug.toLowerCase());
    if (next.length === items.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    await githubPutFile({
      owner,
      repo,
      path: GITHUB_PORTFOLIO_PATH,
      contentBytes: new TextEncoder().encode(stringifyPortfolio(next)),
      message: `content(portfolio): remove ${slug}`,
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
