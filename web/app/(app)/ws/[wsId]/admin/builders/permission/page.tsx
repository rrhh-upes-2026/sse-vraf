import { PermissionBuilder } from "@/components/builders/PermissionBuilder";

export default async function PermissionBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <PermissionBuilder wsId={wsId} />;
}
