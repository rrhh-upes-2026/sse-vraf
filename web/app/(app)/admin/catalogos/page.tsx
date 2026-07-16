import { PlaceholderScreen } from "@/components/shared/PlaceholderScreen";
import { ADMIN_TOOLS } from "@/config/nav";

export default function CatalogosPage() {
  const tool = ADMIN_TOOLS.find((t) => t.slug === "catalogos")!;
  return (
    <PlaceholderScreen
      eyebrow="Administración"
      title={tool.label}
      description={tool.description}
    />
  );
}
