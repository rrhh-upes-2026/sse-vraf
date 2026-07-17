import { ListaProcesos } from "@/components/contratacion/ListaProcesos";

export default async function ContratacionPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return <ListaProcesos wsId={wsId} />;
}
