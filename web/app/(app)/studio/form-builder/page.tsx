import { PlaceholderScreen } from "@/components/shared/PlaceholderScreen";
import { STUDIO_TOOLS } from "@/config/nav";

export default function FormBuilderPage() {
  const tool = STUDIO_TOOLS.find((t) => t.slug === "form-builder")!;
  return (
    <PlaceholderScreen
      eyebrow="Studio"
      title={tool.label}
      description={tool.description + " — este builder se implementa en un sprint dedicado, según §05 del MASTER HANDOFF."}
    />
  );
}
