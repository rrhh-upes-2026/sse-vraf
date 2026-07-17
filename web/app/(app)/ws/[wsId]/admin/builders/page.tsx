import { BuilderHub } from "@/components/builders/BuilderHub";

export default async function BuildersPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <BuilderHub wsId={wsId} />;
}
