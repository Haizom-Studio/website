"use client";

import React, { useEffect, useState } from "react";

/**
 * Google Maps search for two-letter codes like "ID" is ambiguous (e.g. Idaho) and
 * embeds may fall back to the viewer's current location. Expand ISO 3166-1
 * alpha-2 codes to English region names for a stable map center.
 */
function mapQueryFromLocationLabel(label: string): string {
  const t = label.trim();
  if (!/^[A-Za-z]{2}$/.test(t)) return t;
  const code = t.toUpperCase();
  if (code === "XX") return t;
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    if (name && name !== code) return name;
  } catch {
    // ignore
  }
  return t;
}

/** Prefer resolved location label; otherwise use IP so the map can still approximate. */
export function mapQueryFromGeo(
  location: string | null,
  ipAddress: string | null
): string | null {
  const loc = (location ?? "").trim();
  if (loc) return mapQueryFromLocationLabel(loc);
  const ip = (ipAddress ?? "").trim();
  return ip || null;
}

function coordsFromProps(
  mapLat: number | null | undefined,
  mapLng: number | null | undefined
): { lat: number; lng: number } | null {
  if (mapLat == null || mapLng == null) return null;
  const lat = Number(mapLat);
  const lng = Number(mapLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

type Props = {
  location: string | null;
  ipAddress: string | null;
  /** From DB: IP-derived approximate coordinates at submit time (or Cloudflare edge). */
  mapLat?: number | null;
  mapLng?: number | null;
  collapsible?: boolean;
  className?: string;
};

export default function LocationMapEmbed({
  location,
  ipAddress,
  mapLat,
  mapLng,
  collapsible = false,
  className = "",
}: Props) {
  const stored = coordsFromProps(mapLat, mapLng);
  const [fetched, setFetched] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [open, setOpen] = useState(!collapsible);

  useEffect(() => {
    setFetched(null);
    setFetchFailed(false);
  }, [mapLat, mapLng, ipAddress, location]);

  const effective = stored ?? fetched;
  const textQuery = mapQueryFromGeo(location, ipAddress);

  useEffect(() => {
    if (stored || fetched) return;
    const ip = (ipAddress ?? "").trim();
    if (!ip || fetchFailed) return;
    if (collapsible && !open) return;

    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/ip-geo?ip=${encodeURIComponent(ip)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("geo failed");
        return res.json() as Promise<{ lat?: number; lng?: number }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (typeof data.lat === "number" && typeof data.lng === "number") {
          setFetched({ lat: data.lat, lng: data.lng });
        } else {
          setFetchFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stored, fetched, ipAddress, open, collapsible, fetchFailed, mapLat, mapLng, location]);

  if (!textQuery && !effective && !loading) {
    return (
      <p className={`text-xs text-grey ${className}`.trim()}>
        No map — no location or IP.
      </p>
    );
  }

  if (collapsible && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs font-medium text-primary hover:underline ${className}`.trim()}>
        Show map
      </button>
    );
  }

  if (!effective && loading) {
    return (
      <div className={className}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-grey mb-2 hover:text-midnight_text dark:hover:text-white">
            Hide map
          </button>
        ) : null}
        <p className="text-xs text-grey">Resolving IP location…</p>
      </div>
    );
  }

  const src = effective
    ? `https://www.google.com/maps?q=${effective.lat},${effective.lng}&z=11&output=embed`
    : textQuery
      ? `https://www.google.com/maps?q=${encodeURIComponent(textQuery)}&output=embed`
      : null;

  if (!src) {
    return (
      <p className={`text-xs text-grey ${className}`.trim()}>
        Could not place this IP on the map.
      </p>
    );
  }

  const titleBits = effective
    ? `${effective.lat.toFixed(4)}, ${effective.lng.toFixed(4)} (approx.)`
    : textQuery ?? "Location";

  return (
    <div className={className}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-grey mb-2 hover:text-midnight_text dark:hover:text-white">
          Hide map
        </button>
      ) : null}
      <iframe
        title={`Approximate location: ${titleBits}`}
        src={src}
        className="w-full max-w-md h-48 rounded-sm border border-border dark:border-dark_border bg-white"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
