import { getLocationLabel } from "@/lib/client-geo";

type CfGeo = {
  latitude?: string | number;
  longitude?: string | number;
};

function parseCoord(v: string | number | undefined): number | null {
  if (v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/**
 * Cloudflare may attach approximate lat/lng to the request (see IncomingRequestCfProperties).
 */
export function getCfLatLng(req: Request): { lat: number; lng: number } | null {
  const cf = (req as Request & { cf?: CfGeo }).cf;
  if (!cf) return null;
  const lat = parseCoord(cf.latitude);
  const lng = parseCoord(cf.longitude);
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Block obvious non-public / SSRF targets for outbound IP lookup. */
export function isPlausiblePublicIp(ip: string): boolean {
  const t = ip.trim();
  if (!t) return false;
  if (t === "127.0.0.1" || t === "::1") return false;
  if (t.startsWith("10.")) return false;
  if (t.startsWith("192.168.")) return false;
  if (t.startsWith("169.254.")) return false;
  if (t === "0.0.0.0") return false;
  if (t.startsWith("172.")) {
    const second = parseInt(t.split(".")[1] ?? "", 10);
    if (!Number.isNaN(second) && second >= 16 && second <= 31) return false;
  }
  if (/^fc/i.test(t) || /^fd/i.test(t)) return false;
  return true;
}

type IpWhoJson = {
  success?: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
};

/**
 * HTTPS IP geolocation (city-level when available). Used when CF does not provide coordinates.
 */
export async function fetchIpWhoLocation(ip: string): Promise<{
  lat: number;
  lng: number;
  label?: string;
} | null> {
  if (!isPlausiblePublicIp(ip)) return null;
  const url = `https://ipwho.is/${encodeURIComponent(ip)}`;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoJson;
    if (!data.success) return null;
    const lat = data.latitude;
    const lng = data.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const parts: string[] = [];
    if (data.city) parts.push(data.city);
    if (data.region && data.region !== data.city) parts.push(data.region);
    const country = (data.country ?? data.country_code ?? "").trim();
    if (country) parts.push(country);
    const label = parts.length > 0 ? parts.join(", ") : undefined;
    return { lat, lng, label };
  } catch {
    return null;
  } finally {
    clearTimeout(tid);
  }
}

function isWeakLocationLabel(label: string): boolean {
  const t = label.trim();
  if (!t) return true;
  if (/^[A-Za-z]{2}$/.test(t)) return true;
  return false;
}

/**
 * Prefer Cloudflare coordinates; otherwise resolve via public IP lookup for map + richer label.
 */
export async function resolveVisitorGeo(
  req: Request,
  ip: string
): Promise<{
  locationLabel: string;
  mapLat: number | null;
  mapLng: number | null;
}> {
  const base = getLocationLabel(req);
  const cfCoords = getCfLatLng(req);
  if (cfCoords) {
    return {
      locationLabel: base,
      mapLat: cfCoords.lat,
      mapLng: cfCoords.lng,
    };
  }
  if (!ip || !isPlausiblePublicIp(ip)) {
    return { locationLabel: base, mapLat: null, mapLng: null };
  }
  const remote = await fetchIpWhoLocation(ip);
  if (!remote) {
    return { locationLabel: base, mapLat: null, mapLng: null };
  }
  let locationLabel = base;
  if (remote.label && isWeakLocationLabel(base)) {
    locationLabel = remote.label;
  }
  return {
    locationLabel,
    mapLat: remote.lat,
    mapLng: remote.lng,
  };
}
