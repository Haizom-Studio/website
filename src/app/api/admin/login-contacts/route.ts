import { NextResponse } from "next/server";
import {
  ADMIN_CONTACTS_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createScopedSessionToken,
  timingSafePasswordEqual,
} from "@/lib/admin-session";

export const runtime = "edge";

export async function POST(req: Request) {
  const password = process.env.ADMIN_CONTACTS_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "Contact requests login is not configured (ADMIN_CONTACTS_PASSWORD)" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submitted = body.password ?? "";
  if (!timingSafePasswordEqual(submitted, password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createScopedSessionToken("contacts");
  } catch {
    return NextResponse.json(
      { error: "Session signing is not configured" },
      { status: 503 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_CONTACTS_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
