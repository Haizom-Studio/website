import SensitiveAdminGate from "@/components/Admin/SensitiveAdminGate";

export default function ContactsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SensitiveAdminGate scope="contacts">{children}</SensitiveAdminGate>;
}
