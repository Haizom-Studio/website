import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import markdownToHtml from "@/utils/markdownToHtml";

export const runtime = "edge";

const MAX_CONTENT_CHARS = 200_000;

export async function POST(req: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

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

  const title = (body.title ?? "").trim() || "Untitled";
  const excerpt = (body.excerpt ?? "").trim() || "";
  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json(
      { error: "Content is required for preview" },
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

  try {
    const html = await markdownToHtml(content);
    return NextResponse.json({
      title,
      excerpt,
      date,
      coverImage,
      author,
      authorImage,
      html,
      slug: "preview",
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Could not render Markdown preview",
      },
      { status: 500 }
    );
  }
}
