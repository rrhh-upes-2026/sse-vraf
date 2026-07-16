import { PlaceholderScreen } from "@/components/shared/PlaceholderScreen";
import { STUDIO_TOOLS } from "@/config/nav";

export default function ReportBuilderPage() {
  const tool = STUDIO_TOOLS.find((t) => t.slug === "report-builder")!;
  return (
    <PlaceholderScreen
      eyebrow="Studio"
      title={tool.label}
      description={tool.description + " — este builder se implementa en un sprint dedicado, según §05 del MASTER HANDOFF."}
    />
  );
}
