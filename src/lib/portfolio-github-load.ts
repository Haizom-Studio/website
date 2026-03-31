import bundled from "@/data/portfolio.json";
import type { PortfolioItem } from "@/app/api/data";
import {
  GITHUB_PORTFOLIO_PATH,
  githubGetTextFileOptional,
} from "@/lib/github";
import { parsePortfolioJson } from "@/lib/portfolio-store";

type GithubRepoRef = {
  owner: string;
  repo: string;
  token: string;
  branch: string;
};

/**
 * Loads portfolio JSON from GitHub. If the file is not in the repo yet (404),
 * returns the same data shipped with the app so admin can list/edit and the
 * first save creates `src/data/portfolio.json` on the branch.
 */
export async function loadPortfolioItemsFromGithubOrBundled(
  ref: GithubRepoRef
): Promise<PortfolioItem[]> {
  const got = await githubGetTextFileOptional({
    owner: ref.owner,
    repo: ref.repo,
    path: GITHUB_PORTFOLIO_PATH,
    token: ref.token,
    branch: ref.branch,
  });
  if (!got) {
    return parsePortfolioJson(JSON.stringify(bundled));
  }
  return parsePortfolioJson(got.text);
}
