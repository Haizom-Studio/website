import SensitiveAdminGate from "@/components/Admin/SensitiveAdminGate";

export default function InventoryAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SensitiveAdminGate scope="inventory">{children}</SensitiveAdminGate>;
}
