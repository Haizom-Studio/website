import type { PortfolioItem } from "@/app/api/data";

export function assertSafePortfolioSlug(slug: string): string | null {
  if (!slug || slug.length > 200) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) return null;
  return slug;
}

export function parsePortfolioJson(text: string): PortfolioItem[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON");
  }
  if (!Array.isArray(data)) {
    throw new Error("Portfolio file must be a JSON array");
  }
  const out: PortfolioItem[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = validatePortfolioItem(data[i]);
    if (!item) {
      throw new Error(`Invalid portfolio entry at index ${i}`);
    }
    out.push(item);
  }
  return out;
}

function normalizeImagePaths(paths: string[]): string[] {
  const out: string[] = [];
  for (const raw of paths) {
    const t = raw.trim();
    if (!t) continue;
    out.push(t.startsWith("/") ? t : `/${t}`);
  }
  return out;
}

function validatePortfolioItem(row: unknown): PortfolioItem | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const imageSingle = typeof o.image === "string" ? o.image.trim() : "";
  const imgsRaw = o.images;
  let images: string[] = [];
  if (Array.isArray(imgsRaw)) {
    images = normalizeImagePaths(
      imgsRaw.filter((x): x is string => typeof x === "string")
    );
  }
  if (images.length === 0 && imageSingle) {
    images = normalizeImagePaths([imageSingle]);
  }
  if (images.length === 0) return null;

  const alt = typeof o.alt === "string" ? o.alt.trim() : "";
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const slug = typeof o.slug === "string" ? o.slug.trim() : "";
  const info = typeof o.info === "string" ? o.info.trim() : "";
  const Class = typeof o.Class === "string" ? o.Class.trim() : "md:mt-0";
  const description =
    typeof o.description === "string" ? o.description.trim() : "";
  const delRaw = o.deliverables;
  const deliverables = Array.isArray(delRaw)
    ? delRaw.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const category =
    typeof o.category === "string" ? o.category.trim().slice(0, 80) : "";
  const image = images[0]!;
  if (!title || !slug || !description) return null;
  return {
    image,
    images,
    alt: alt || title,
    title,
    slug,
    info: info || title,
    Class: Class || "md:mt-0",
    description,
    deliverables,
    ...(category ? { category } : {}),
  };
}

export function stringifyPortfolio(items: PortfolioItem[]): string {
  return `${JSON.stringify(items, null, 2)}\n`;
}

export function validateBodyItem(
  body: Record<string, unknown>
): PortfolioItem | null {
  return validatePortfolioItem(body);
}
