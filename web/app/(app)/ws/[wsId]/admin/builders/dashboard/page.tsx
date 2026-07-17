import { DashboardBuilder } from "@/components/builders/DashboardBuilder";

export default async function DashboardBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <DashboardBuilder wsId={wsId} />;
}
