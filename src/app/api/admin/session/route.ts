import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_CONTACTS_SESSION_COOKIE,
  ADMIN_INVENTORY_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyScopedSessionToken,
  verifySessionToken,
} from "@/lib/admin-session";

export const runtime = "edge";

export async function GET() {
  const store = await cookies();
  const main = store.get(ADMIN_SESSION_COOKIE)?.value;
  const contacts = store.get(ADMIN_CONTACTS_SESSION_COOKIE)?.value;
  const inventory = store.get(ADMIN_INVENTORY_SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(main);
  const contactsOk = await verifyScopedSessionToken(contacts, "contacts");
  const inventoryOk = await verifyScopedSessionToken(inventory, "inventory");
  return NextResponse.json({ ok, contacts: contactsOk, inventory: inventoryOk });
}
