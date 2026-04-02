import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import {
  GITHUB_PORTFOLIO_PATH,
  githubPutFile,
  parseGithubRepo,
} from "@/lib/github";
import { loadPortfolioItemsFromGithubOrBundled } from "@/lib/portfolio-github-load";
import { stringifyPortfolio, validateBodyItem } from "@/lib/portfolio-store";
import type { PortfolioItem } from "@/app/api/data";

export const runtime = "edge";

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

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

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
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load portfolio" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const ctx = await githubCtx();
  if ("error" in ctx) return ctx.error;

  const { owner, repo, token, branch } = ctx;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const newItem = validateBodyItem(body);
  if (!newItem) {
    return NextResponse.json(
      {
        error:
          "Invalid project fields (title, slug, at least one image, description required)",
      },
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
    if (items.some((p) => p.slug.toLowerCase() === newItem.slug.toLowerCase())) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }
    const next: PortfolioItem[] = [...items, newItem];
    await githubPutFile({
      owner,
      repo,
      path: GITHUB_PORTFOLIO_PATH,
      contentBytes: new TextEncoder().encode(stringifyPortfolio(next)),
      message: `content(portfolio): add ${newItem.slug}`,
      branch,
      token,
    });
    return NextResponse.json({ ok: true, slug: newItem.slug });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 502 }
    );
  }
}
