import type { Metadata } from "next";
import AdminShell from "@/components/Admin/AdminShell";

/** Required for @cloudflare/next-on-pages (all admin routes must use Edge). */
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
