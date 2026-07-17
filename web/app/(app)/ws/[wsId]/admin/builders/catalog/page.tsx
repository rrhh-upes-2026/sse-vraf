import { CatalogBuilder } from "@/components/builders/CatalogBuilder";

export default async function CatalogBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <CatalogBuilder wsId={wsId} />;
}
