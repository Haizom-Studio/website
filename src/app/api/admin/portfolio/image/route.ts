import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { githubHeaders, parseGithubRepo } from "@/lib/github";

export const runtime = "edge";

/**
 * Admin-only image preview proxy.
 *
 * Uploaded portfolio images are committed to GitHub and only appear on the
 * live site after the next Cloudflare Pages build finishes. Until then the
 * public URL returns a 404, and that 404 is cached (max-age=14400), so the
 * admin thumbnail stays broken for hours. This route reads the file straight
 * from the repo instead, so previews work immediately after upload.
 *
 * GET /api/admin/portfolio/image?path=/images/portfolio/uploads/<slug>/<file>
 */

const SAFE_PATH =
  /^\/images\/portfolio\/uploads\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\.(webp|png|jpe?g|gif|avif)$/i;

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const path = new URL(req.url).searchParams.get("path") ?? "";
  if (!SAFE_PATH.test(path) || path.includes("..")) {
    return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
  }

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

  const repoPath = `public${path}`;
  const encodedPath = repoPath.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

  const res = await fetch(url, {
    headers: {
      ...githubHeaders(token),
      // Return the raw file bytes instead of base64 JSON.
      Accept: "application/vnd.github.raw",
    },
  });

  if (!res.ok || !res.body) {
    return NextResponse.json(
      { error: `Image not found (${res.status})` },
      { status: res.status === 404 ? 404 : 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const ext = path.split(".").pop()!.toLowerCase();
  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
