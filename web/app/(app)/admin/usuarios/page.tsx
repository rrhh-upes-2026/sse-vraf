import { PlaceholderScreen } from "@/components/shared/PlaceholderScreen";
import { ADMIN_TOOLS } from "@/config/nav";

export default function UsuariosPage() {
  const tool = ADMIN_TOOLS.find((t) => t.slug === "usuarios")!;
  return (
    <PlaceholderScreen
      eyebrow="Administración"
      title={tool.label}
      description={tool.description}
    />
  );
}
