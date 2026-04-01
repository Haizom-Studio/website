"use client";

import React, { useState } from "react";

/** Prefer resolved location label; otherwise use IP so the map can still approximate. */
export function mapQueryFromGeo(
  location: string | null,
  ipAddress: string | null
): string | null {
  const loc = (location ?? "").trim();
  if (loc) return loc;
  const ip = (ipAddress ?? "").trim();
  return ip || null;
}

type Props = {
  location: string | null;
  ipAddress: string | null;
  /** When true, map loads behind a toggle (avoids many iframes on long tables). */
  collapsible?: boolean;
  className?: string;
};

export default function LocationMapEmbed({
  location,
  ipAddress,
  collapsible = false,
  className = "",
}: Props) {
  const q = mapQueryFromGeo(location, ipAddress);
  const [open, setOpen] = useState(!collapsible);

  if (!q) {
    return (
      <p className={`text-xs text-grey ${className}`.trim()}>No map — no location or IP.</p>
    );
  }

  const src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

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
        title={`Approximate location: ${q}`}
        src={src}
        className="w-full max-w-md h-48 rounded-sm border border-border dark:border-dark_border bg-white"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
