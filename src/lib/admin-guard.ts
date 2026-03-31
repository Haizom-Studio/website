import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-session";

/** Returns a 401 JSON response if the user is not signed in, otherwise null. */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const store = await cookies();
  const session = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
