"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/blog", label: "New post" },
  { href: "/admin/blogs", label: "Posts" },
  { href: "/admin/inventory", label: "Inventory" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/admin/session", { credentials: "include" });
    const data = (await res.json()) as { ok?: boolean };
    setSessionOk(!!data.ok);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
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
      toast.success("Signed in");
      setPassword("");
      await refreshSession();
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setSessionOk(false);
    toast.success("Signed out");
  }

  if (sessionOk === null) {
    return (
      <section className="pt-32 pb-24 dark:bg-darkmode min-h-[50vh]">
        <div className="container mx-auto max-w-lg px-4 text-center text-midnight_text dark:text-white">
          Checking session…
        </div>
      </section>
    );
  }

  if (!sessionOk) {
    return (
      <>
        <Toaster position="top-center" />
        <section className="pt-32 pb-24 dark:bg-darkmode min-h-[70vh]">
          <div className="container mx-auto max-w-md px-4">
            <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
              Haizom admin
            </h1>
            <p className="text-grey dark:text-SereneGray mb-8 text-sm">
              Sign in with the team password.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-4 py-3 text-midnight_text dark:text-white placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Password"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-sm bg-primary text-white font-medium py-3 hover:opacity-90 disabled:opacity-60">
                {loginLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="pt-28 pb-16 dark:bg-darkmode min-h-[70vh]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col lg:flex-row gap-10">
            <aside className="lg:w-52 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-grey mb-3">
                Admin
              </p>
              <nav className="flex flex-col gap-1">
                {nav.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-midnight_text dark:text-white hover:bg-section dark:hover:bg-darklight"
                      }`}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="mt-6 text-sm text-grey hover:text-primary dark:text-SereneGray">
                Sign out
              </button>
            </aside>
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
