import type { PortfolioItem } from "@/app/api/data";

/** Suggested categories shown in the admin "Category" field (free text is still allowed). */
export const PORTFOLIO_CATEGORY_SUGGESTIONS = [
  "Consumer Electronics",
  "Power Electronics",
  "Embedded Systems",
  "Internet of Things (IoT)",
  "Industrial Electronics",
  "Robotics",
  "Medical & Wearables",
  "Audio Electronics",
  "Low Power Electronics",
  "Web Development",
  "Software & AI",
] as const;

/** Category used for filtering: explicit `category`, else the card subtitle (`info`). */
export function portfolioCategory(item: Pick<PortfolioItem, "category" | "info">): string {
  return (item.category ?? "").trim() || item.info.trim();
}

/** Unique categories, most-used first, then alphabetical. */
export function portfolioCategoryCounts(
  items: Pick<PortfolioItem, "category" | "info">[]
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = portfolioCategory(item);
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
