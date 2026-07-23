import { GWPCalendar } from "@/components/workspace/gwp/Calendar";

export default async function GWPCalendarPage({
  params,
}: {
  params: Promise<{ wsId: string }>;
}) {
  const { wsId } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Google Calendar</h1>
      <p className="text-[13px] text-sse-muted">
        Gestión de eventos: listado, creación, edición, eliminación y consulta de disponibilidad FreeBusy.
      </p>
      <GWPCalendar wsId={wsId} />
    </div>
  );
}
