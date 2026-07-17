import { KpiBuilder } from "@/components/builders/KpiBuilder";

export default async function KpiBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <KpiBuilder wsId={wsId} />;
}
