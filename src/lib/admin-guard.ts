import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_CONTACTS_SESSION_COOKIE,
  ADMIN_INVENTORY_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyScopedSessionToken,
  verifySessionToken,
} from "@/lib/admin-session";

/** Returns a 401 JSON response if the user is not signed in, otherwise null. */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const store = await cookies();
  const session = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Contact requests API — requires `ADMIN_CONTACTS_PASSWORD` session. */
export async function requireContactsSession(): Promise<NextResponse | null> {
  const store = await cookies();
  const session = store.get(ADMIN_CONTACTS_SESSION_COOKIE)?.value;
  if (!(await verifyScopedSessionToken(session, "contacts"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Map / geo helpers — allowed from main admin or contacts-scoped admin. */
export async function requireAdminOrContactsSession(): Promise<NextResponse | null> {
  const store = await cookies();
  const admin = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifySessionToken(admin)) return null;
  const contacts = store.get(ADMIN_CONTACTS_SESSION_COOKIE)?.value;
  if (await verifyScopedSessionToken(contacts, "contacts")) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Inventory API — requires `ADMIN_INVENTORY_PASSWORD` session. */
export async function requireInventorySession(): Promise<NextResponse | null> {
  const store = await cookies();
  const session = store.get(ADMIN_INVENTORY_SESSION_COOKIE)?.value;
  if (!(await verifyScopedSessionToken(session, "inventory"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
