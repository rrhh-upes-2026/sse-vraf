import { PlaceholderScreen } from "@/components/shared/PlaceholderScreen";
import { ADMIN_TOOLS } from "@/config/nav";

export default function DashboardEjecutivoPage() {
  const tool = ADMIN_TOOLS.find((t) => t.slug === "dashboard-ejecutivo")!;
  return (
    <PlaceholderScreen
      eyebrow="Administración"
      title={tool.label}
      description={tool.description}
    />
  );
}
