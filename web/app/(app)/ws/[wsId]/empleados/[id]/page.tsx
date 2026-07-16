import { EmployeeProfile } from "@/components/rrhh/EmployeeProfile";

export default async function EmpleadoDetailPage({
  params,
}: {
  params: Promise<{ wsId: string; id: string }>;
}) {
  const { id } = await params;
  return <EmployeeProfile empleadoId={id} />;
}
