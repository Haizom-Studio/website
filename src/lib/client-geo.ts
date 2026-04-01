/**
 * Resolve client IP and a short location label on Cloudflare (CF-Connecting-IP,
 * CF-IPCountry, and optional request.cf city/region). Outside Cloudflare,
 * location may be empty; IP may still come from X-Forwarded-For.
 */
type CfRequestProps = {
  city?: string;
  region?: string;
  country?: string;
};

export function getClientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "";
}

export function getLocationLabel(req: Request): string {
  const cf = (req as Request & { cf?: CfRequestProps }).cf;
  const headerCountry = req.headers.get("cf-ipcountry");
  const countryCode =
    headerCountry && headerCountry !== "XX" ? headerCountry : "";
  const countryName = (cf?.country ?? "").trim();
  const city = (cf?.city ?? "").trim();
  const region = (cf?.region ?? "").trim();

  if (city && (countryName || countryCode)) {
    return `${city}, ${countryName || countryCode}`;
  }
  if (region && (countryName || countryCode)) {
    return `${region}, ${countryName || countryCode}`;
  }
  if (countryName) return countryName;
  if (countryCode) return countryCode;
  return "";
}
