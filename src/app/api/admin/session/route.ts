import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-session";

export const runtime = "edge";

export async function GET() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  return NextResponse.json({ ok });
}
