import { createEntityService } from "./entityService";
import type {
  Empleado,
  CapacitacionEmpleado,
  EvaluacionDesempeno,
  SolicitudContratacion,
} from "@/types/hr";

export const EmpleadosService               = createEntityService<Empleado>("empleados");
export const CapacitacionesService          = createEntityService<CapacitacionEmpleado>("capacitaciones");
export const EvaluacionesService            = createEntityService<EvaluacionDesempeno>("evaluaciones");
export const SolicitudesContratacionService = createEntityService<SolicitudContratacion>("solicitudesContratacion");
