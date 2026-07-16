import { BlueprintDetail } from "@/components/studio/BlueprintDetail";

export default async function BlueprintDetailPage({
  params,
}: {
  params: Promise<{ blueprintId: string }>;
}) {
  const { blueprintId } = await params;
  return <BlueprintDetail blueprintId={blueprintId} />;
}
