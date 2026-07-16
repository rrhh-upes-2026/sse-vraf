// Populate the module registry before any server component renders.
import "@/modules/_registry";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
