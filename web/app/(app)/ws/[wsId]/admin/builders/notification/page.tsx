import { NotificationBuilder } from "@/components/builders/NotificationBuilder";

export default async function NotificationBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <NotificationBuilder wsId={wsId} />;
}
