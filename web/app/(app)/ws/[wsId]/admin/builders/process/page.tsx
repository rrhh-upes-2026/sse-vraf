import { ProcessBuilder } from "@/components/builders/ProcessBuilder";

export default async function ProcessBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <ProcessBuilder wsId={wsId} />;
}
