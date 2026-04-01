"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Scope = "contacts" | "inventory";

type SessionPayload = {
  ok?: boolean;
  contacts?: boolean;
  inventory?: boolean;
};

function scopeOk(data: SessionPayload, scope: Scope): boolean {
  if (scope === "contacts") return !!data.contacts;
  return !!data.inventory;
}

function loginPath(scope: Scope): string {
  return scope === "contacts"
    ? "/api/admin/login-contacts"
    : "/api/admin/login-inventory";
}

function titleForScope(scope: Scope): string {
  return scope === "contacts"
    ? "Contact requests"
    : "Inventory";
}

export default function SensitiveAdminGate({
  scope,
  children,
}: {
  scope: Scope;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/session", { credentials: "include" });
    const data = (await res.json()) as SessionPayload;
    setReady(scopeOk(data, scope));
  }, [scope]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(loginPath(scope), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success("Access granted");
      setPassword("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  if (ready === null) {
    return (
      <p className="text-midnight_text dark:text-white text-sm">
        Checking access…
      </p>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-md">
          <h2 className="text-xl font-semibold text-midnight_text dark:text-white mb-2">
            {titleForScope(scope)}
          </h2>
          <p className="text-grey dark:text-SereneGray text-sm mb-6">
            This area uses a separate password from the main dashboard (for
            operations / engineering). Enter it to view and manage{" "}
            {scope === "contacts" ? "contact bookings" : "parts inventory"}.
          </p>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`${titleForScope(scope)} password`}
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="rounded-sm bg-primary text-white font-medium px-4 py-2.5 hover:opacity-90 disabled:opacity-60">
              {loading ? "Signing in…" : "Unlock"}
            </button>
          </form>
        </div>
    );
  }

  return <>{children}</>;
}
