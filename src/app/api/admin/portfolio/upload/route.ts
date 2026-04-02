import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import {
  GITHUB_PORTFOLIO_UPLOADS_PREFIX,
  githubPutFile,
  parseGithubRepo,
} from "@/lib/github";
import { assertSafePortfolioSlug } from "@/lib/portfolio-store";

export const runtime = "edge";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } {
  const m = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!m) {
    throw new Error(
      "Image must be a base64 data URL (data:image/...;base64,...)"
    );
  }
  const mime = m[1]!.split(";")[0]!.trim();
  const base64 = m[2]!.replace(/\s/g, "");
  const bytes = base64ToUint8Array(base64);
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new Error(`Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`);
  }
  return { mime, bytes };
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

export async function POST(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const githubToken = process.env.GITHUB_TOKEN;
  const repoStr = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!githubToken || !repoStr) {
    return NextResponse.json(
      { error: "GitHub integration is not configured" },
      { status: 503 }
    );
  }

  let body: { imageBase64?: string; projectSlug?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectSlug = assertSafePortfolioSlug(
    (body.projectSlug ?? "").trim()
  );
  if (!projectSlug) {
    return NextResponse.json(
      { error: "Valid project slug is required before uploading" },
      { status: 400 }
    );
  }

  const imageBase64 = body.imageBase64;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
  }

  let parsed: { mime: string; bytes: Uint8Array };
  try {
    parsed = parseDataUrl(imageBase64);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid image" },
      { status: 400 }
    );
  }

  const ext = extFromMime(parsed.mime);
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const repoPath = `${GITHUB_PORTFOLIO_UPLOADS_PREFIX}/${projectSlug}/${id}.${ext}`;
  const publicUrl = `/images/portfolio/uploads/${projectSlug}/${id}.${ext}`;

  let owner: string;
  let repo: string;
  try {
    const parsedRepo = parseGithubRepo(repoStr);
    owner = parsedRepo.owner;
    repo = parsedRepo.name;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid GITHUB_REPO" },
      { status: 500 }
    );
  }

  try {
    await githubPutFile({
      owner,
      repo,
      path: repoPath,
      contentBytes: parsed.bytes,
      message: `chore(portfolio): image for ${projectSlug}`,
      branch,
      token: githubToken,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "GitHub image upload failed",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
