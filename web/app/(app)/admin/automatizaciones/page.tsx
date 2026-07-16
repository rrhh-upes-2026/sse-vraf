import { PlaceholderScreen } from "@/components/shared/PlaceholderScreen";
import { ADMIN_TOOLS } from "@/config/nav";

export default function AutomatizacionesPage() {
  const tool = ADMIN_TOOLS.find((t) => t.slug === "automatizaciones")!;
  return (
    <PlaceholderScreen
      eyebrow="Administración"
      title={tool.label}
      description={tool.description}
    />
  );
}
