import { WorkflowRunner } from "@/components/workflow/WorkflowRunner";

export default function ContratacionPage() {
  return (
    <WorkflowRunner
      instanceId="INST-RH-001"
      blueprintId="BP-RRHH-001"
    />
  );
}
