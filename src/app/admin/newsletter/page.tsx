"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import LocationMapEmbed from "@/components/Admin/LocationMapEmbed";

type Row = {
  email: string;
  created_at: string;
  ip_address: string | null;
  location: string | null;
  map_lat: number | null;
  map_lng: number | null;
};

function dash(s: string | null | undefined) {
  const t = (s ?? "").trim();
  return t || "—";
}

export default function AdminNewsletterPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter", { credentials: "include" });
      const data = (await res.json()) as Row[] | { error?: string };
      if (!res.ok) {
        toast.error(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Failed to load subscribers"
        );
        setRows([]);
        return;
      }
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(email: string) {
    if (!confirm(`Remove ${email} from the list?`)) return;
    const res = await fetch("/api/admin/newsletter", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Subscriber removed");
    void load();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Newsletter subscribers
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-8 max-w-2xl">
        Emails captured from the site footer. Location is inferred from the
        visitor IP (country / city; map uses approximate coordinates when available).
      </p>

      {loading ? (
        <p className="text-midnight_text dark:text-white">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-grey">
          No subscribers yet (or D1 not connected / migration not applied).
        </p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border dark:border-dark_border">
          <table className="w-full text-sm text-left">
            <thead className="bg-section dark:bg-darklight text-midnight_text dark:text-white">
              <tr>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">Subscribed</th>
                <th className="px-3 py-2 font-medium w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark_border bg-white dark:bg-darklight">
              {rows.map((row) => (
                <tr key={row.email}>
                  <td className="px-3 py-2 text-midnight_text dark:text-white font-medium">
                    {row.email}
                  </td>
                  <td className="px-3 py-2 text-grey align-top min-w-[12rem] max-w-md">
                    <div className="max-w-[14rem]">{dash(row.location)}</div>
                    <LocationMapEmbed
                      location={row.location}
                      ipAddress={row.ip_address}
                      mapLat={row.map_lat}
                      mapLng={row.map_lng}
                      collapsible
                      className="mt-2"
                    />
                  </td>
                  <td className="px-3 py-2 text-grey font-mono text-xs">
                    {dash(row.ip_address)}
                  </td>
                  <td className="px-3 py-2 text-grey whitespace-nowrap">
                    {dash(row.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => void remove(row.email)}
                      className="text-grey text-xs hover:text-red-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
