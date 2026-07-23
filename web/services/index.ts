import { createEntityService } from "./entityService";
import type {
  Actividad,
  Evidencia,
  Formulario,
  HistorialAudit,
  Indicador,
  ObjetivoEstrategico,
  PlanEstrategico,
  ProcesoInstitucional,
  ProyectoEstrategico,
  Solicitud,
  Unidad,
  Usuario,
} from "@/types/entities";

// Core platform services
export const PlanesService      = createEntityService<PlanEstrategico>("planes");
export const ObjetivosService   = createEntityService<ObjetivoEstrategico>("objetivos");
export const ProyectosService   = createEntityService<ProyectoEstrategico>("proyectos");
export const ProcesosService    = createEntityService<ProcesoInstitucional>("procesos");
export const ActividadesService = createEntityService<Actividad>("actividades");
export const EvidenciasService  = createEntityService<Evidencia>("evidencias");
export const IndicadoresService = createEntityService<Indicador>("indicadores");
export const FormulariosService = createEntityService<Formulario>("formularios");
export const SolicitudesService = createEntityService<Solicitud>("solicitudes");
export const UsuariosService    = createEntityService<Usuario>("usuarios");
export const UnidadesService    = createEntityService<Unidad>("unidades");
export const HistorialService   = createEntityService<HistorialAudit>("historial");

// Domain service re-exports — import from these slices in domain hooks/components
export * from "./hr";
export * from "./workflow";
export * from "./studio";
export * from "./vraf";
export * from "./compras";
export * from "./contabilidad";
export * from "./mantenimiento";
export * from "./sso";
export * from "./executiveDashboard";
export * from "./ime";
export * from "./pme";
export * from "./ape";
export * from "./aee";
