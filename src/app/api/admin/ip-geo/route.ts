import { NextResponse } from "next/server";
import { requireAdminOrContactsSession } from "@/lib/admin-guard";
import { fetchIpWhoLocation, isPlausiblePublicIp } from "@/lib/ip-geo";

export const runtime = "edge";

/**
 * Resolve approximate lat/lng for a visitor IP (for admin map embeds when DB has no stored coords).
 * Always geocodes the `ip` query — not the admin's connection (that would be wrong here).
 * GET ?ip=1.2.3.4
 */
export async function GET(req: Request) {
  const denied = await requireAdminOrContactsSession();
  if (denied) return denied;

  const url = new URL(req.url);
  const ip = (url.searchParams.get("ip") ?? "").trim();
  if (!ip || !isPlausiblePublicIp(ip)) {
    return NextResponse.json(
      { error: "Valid public IP required" },
      { status: 400 }
    );
  }

  const geo = await fetchIpWhoLocation(ip);
  if (!geo) {
    return NextResponse.json(
      { error: "Could not resolve location for this IP" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    lat: geo.lat,
    lng: geo.lng,
    label: geo.label,
  });
}
