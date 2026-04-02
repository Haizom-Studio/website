import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

/** Minimal D1 statement surface used by inventory routes. */
export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
  first: <T = Record<string, unknown>>(colName?: string) => Promise<T | null>;
  run: () => Promise<unknown>;
};

export type D1Binding = {
  prepare: (query: string) => D1Statement;
  batch: (statements: D1Statement[]) => Promise<unknown>;
};

type EnvWithDb = { DB?: D1Binding };

/** D1 binding must be named `DB` in Cloudflare Pages → Settings → Functions → D1 bindings. */
export function getD1Database(): D1Binding | null {
  const ctx = getOptionalRequestContext();
  if (!ctx) return null;
  return (ctx.env as EnvWithDb).DB ?? null;
}
