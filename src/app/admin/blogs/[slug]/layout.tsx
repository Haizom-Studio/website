/** @cloudflare/next-on-pages requires Edge on dynamic routes; parent admin layout also sets edge. */
export const runtime = "edge";

export default function AdminBlogEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
