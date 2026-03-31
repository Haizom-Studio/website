import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import {
  GITHUB_BLOG_DIR,
  githubListMdxSlugs,
  parseGithubRepo,
} from "@/lib/github";

export const runtime = "edge";

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const token = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repoStr) {
    return NextResponse.json(
      { error: "GitHub integration is not configured" },
      { status: 503 }
    );
  }

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

  try {
    const files = await githubListMdxSlugs({
      owner,
      repo,
      token,
      branch,
      directoryPath: GITHUB_BLOG_DIR,
    });
    return NextResponse.json(files);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list posts" },
      { status: 502 }
    );
  }
}
