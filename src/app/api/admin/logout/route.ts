import { NextResponse } from "next/server";
import {
  ADMIN_CONTACTS_SESSION_COOKIE,
  ADMIN_INVENTORY_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-session";

export const runtime = "edge";

const clearCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", clearCookie);
  res.cookies.set(ADMIN_CONTACTS_SESSION_COOKIE, "", clearCookie);
  res.cookies.set(ADMIN_INVENTORY_SESSION_COOKIE, "", clearCookie);
  return res;
}
