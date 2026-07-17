import { ReportBuilder } from "@/components/builders/ReportBuilder";

export default async function ReportBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <ReportBuilder wsId={wsId} />;
}
