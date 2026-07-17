import { AutomationBuilder } from "@/components/builders/AutomationBuilder";

export default async function AutomationBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <AutomationBuilder wsId={wsId} />;
}
