import type { PortfolioItem } from "@/app/api/data";

/**
 * Concatenates only public portfolio fields (what visitors see on the site).
 * Intentionally excludes image URLs and layout classes so search stays
 * keyword-focused and does not depend on admin-only content.
 */
function searchableText(item: PortfolioItem): string {
  const slugWords = item.slug.replace(/-/g, " ");
  const deliverables = item.deliverables.join(" ");
  return [item.title, item.info, item.description, item.alt, item.slug, slugWords, deliverables]
    .join(" ")
    .toLowerCase();
}

export function parseSearchTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/**
 * All tokens must appear somewhere (AND). Returns a relevance score for sorting;
 * 0 means no match.
 */
function matchScore(item: PortfolioItem, tokens: string[]): number {
  const haystack = searchableText(item);
  const title = item.title.toLowerCase();
  const info = item.info.toLowerCase();
  const deliverables = item.deliverables.join(" ").toLowerCase();
  const slug = item.slug.toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (!haystack.includes(token)) {
      return 0;
    }
    if (title.includes(token)) score += 100;
    else if (slug.includes(token)) score += 45;
    else if (info.includes(token)) score += 40;
    else if (deliverables.includes(token)) score += 28;
    else if (item.alt.toLowerCase().includes(token)) score += 15;
    else score += 8;
  }
  return score;
}

export function filterAndSortPortfolio(items: PortfolioItem[], query: string): PortfolioItem[] {
  const tokens = parseSearchTokens(query);
  if (tokens.length === 0) {
    return items;
  }

  return [...items]
    .map((item) => ({ item, score: matchScore(item, tokens) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item);
}
