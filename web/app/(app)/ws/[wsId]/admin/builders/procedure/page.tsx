import { ProcedureBuilder } from "@/components/builders/ProcedureBuilder";

export default async function ProcedureBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <ProcedureBuilder wsId={wsId} />;
}
