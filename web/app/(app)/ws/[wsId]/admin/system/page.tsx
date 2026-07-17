import { SystemHealth } from "@/components/workspace/admin/SystemHealth";

export default function SystemHealthPage({ params }: { params: { wsId: string } }) {
  return <SystemHealth wsId={params.wsId} isLive={!!process.env.APPS_SCRIPT_WEB_APP_URL} />;
}
