export const ADMIN_SESSION_COOKIE = "blog_admin_session";

/** Scoped sessions for routes that must not use the marketing team password. */
export const ADMIN_CONTACTS_SESSION_COOKIE = "admin_contacts_session";
export const ADMIN_INVENTORY_SESSION_COOKIE = "admin_inventory_session";

export type AdminScopedArea = "contacts" | "inventory";

/** Admin cookie + signed token lifetime (1 day). */
export const ADMIN_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return s;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_MS;
  const secret = getSecret();
  const payload = String(exp);
  const sig = await hmacSha256Hex(secret, payload);
  return `${payload}.${sig}`;
}

/** Signed token bound to a single sensitive area (contacts or inventory). */
export async function createScopedSessionToken(
  area: AdminScopedArea
): Promise<string> {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_MS;
  const secret = getSecret();
  const payload = `${area}:${exp}`;
  const sig = await hmacSha256Hex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (expStr.includes(":")) return false;
  const exp = parseInt(expStr, 10);
  if (Number.isNaN(exp) || Date.now() > exp) return false;
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  const expected = await hmacSha256Hex(secret, expStr);
  return timingSafeEqualHex(sig, expected);
}

export async function verifyScopedSessionToken(
  token: string | undefined,
  area: AdminScopedArea
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const colon = payload.indexOf(":");
  if (colon <= 0) return false;
  const tokenArea = payload.slice(0, colon) as AdminScopedArea;
  const expStr = payload.slice(colon + 1);
  if (tokenArea !== area) return false;
  const exp = parseInt(expStr, 10);
  if (Number.isNaN(exp) || Date.now() > exp) return false;
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  const expected = await hmacSha256Hex(secret, payload);
  return timingSafeEqualHex(sig, expected);
}

export function timingSafePasswordEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
