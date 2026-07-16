export type NotificacionCategoria =
  | "proceso"
  | "actividad"
  | "evidencia"
  | "indicador"
  | "solicitud"
  | "rrhh"
  | "sistema";

export type NotificacionPrioridad = "alta" | "media" | "baja";

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  categoria: NotificacionCategoria;
  prioridad: NotificacionPrioridad;
  leida: boolean;
  accionUrl?: string;
  entidadTipo?: string;
  entidadId?: string;
  creadoEn: string;
}
