const GITHUB_API = "https://api.github.com";

export const GITHUB_BLOG_DIR = "markdown/Blog";

export function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** Decode GitHub API base64 file content (UTF-8). */
export function decodeGithubBase64ToUtf8(b64: string): string {
  const clean = b64.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

type GhContentItem = {
  name: string;
  path: string;
  sha: string;
  type: string;
};

export async function githubListMdxSlugs(params: {
  owner: string;
  repo: string;
  token: string;
  branch: string;
  directoryPath: string;
}): Promise<{ slug: string; name: string; path: string; sha: string }[]> {
  const { owner, repo, token, branch, directoryPath } = params;
  const encodedPath = directoryPath.split("/").map(encodeURIComponent).join("/");
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub list ${directoryPath}: ${res.status} ${err}`);
  }
  const data = (await res.json()) as GhContentItem[] | GhContentItem;
  const items = Array.isArray(data) ? data : [data];
  return items
    .filter((f) => f.type === "file" && f.name.endsWith(".mdx"))
    .map((f) => ({
      slug: f.name.replace(/\.mdx$/i, ""),
      name: f.name,
      path: f.path,
      sha: f.sha,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function githubGetTextFile(params: {
  owner: string;
  repo: string;
  path: string;
  token: string;
  branch: string;
}): Promise<{ sha: string; text: string }> {
  const { owner, repo, path, token, branch } = params;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub GET ${path}: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    sha: string;
    content: string;
    encoding: string;
  };
  if (data.encoding !== "base64" || !data.content) {
    throw new Error("Unexpected GitHub content response");
  }
  return { sha: data.sha, text: decodeGithubBase64ToUtf8(data.content) };
}

export async function githubDeleteFile(params: {
  owner: string;
  repo: string;
  path: string;
  sha: string;
  message: string;
  branch: string;
  token: string;
}): Promise<void> {
  const { owner, repo, path, sha, message, branch, token } = params;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub DELETE ${path}: ${res.status} ${err}`);
  }
}

type PutContentBody = {
  message: string;
  content: string;
  branch?: string;
  sha?: string;
};

/** Edge-safe base64 (no Node Buffer). */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export async function githubPutFile(params: {
  owner: string;
  repo: string;
  path: string;
  contentBytes: Uint8Array;
  message: string;
  branch: string;
  token: string;
}): Promise<{ commitSha?: string }> {
  const { owner, repo, path, contentBytes, message, branch, token } = params;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}`;

  const existing = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  let sha: string | undefined;
  if (existing.ok) {
    const data = (await existing.json()) as { sha?: string };
    sha = data.sha;
  } else if (existing.status !== 404) {
    const err = await existing.text();
    throw new Error(`GitHub GET ${path}: ${existing.status} ${err}`);
  }

  const body: PutContentBody = {
    message,
    content: uint8ArrayToBase64(contentBytes),
    branch,
    ...(sha ? { sha } : {}),
  };

  const put = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!put.ok) {
    const err = await put.text();
    throw new Error(`GitHub PUT ${path}: ${put.status} ${err}`);
  }

  const result = (await put.json()) as { commit?: { sha?: string } };
  return { commitSha: result.commit?.sha };
}

export function parseGithubRepo(repo: string): { owner: string; name: string } {
  const parts = repo.trim().split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error('GITHUB_REPO must be "owner/repo"');
  }
  return { owner: parts[0], name: parts[1] };
}
