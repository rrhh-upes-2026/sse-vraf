// PME — Process Management Engine types

export type PMECatalogoTipo =
  | "tipoProceso"
  | "tipoProcedimiento"
  | "tipoActividad"
  | "unidadDuracion"
  | "periodicidad"
  | "estadoOperativo";

export interface PMECatalogo {
  id: string;
  wsId: string;
  tipo: PMECatalogoTipo;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PMEProceso {
  id: string;
  wsId: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  organizationalUnitId?: string;
  tipoProcesoId?: string;
  periodicidad?: string;
  objetivo?: string;
  responsiblePosition?: string;
  responsibleUser?: string;
  displayOrder?: number;
  version?: string;
  observations?: string;
  indicadorIds?: string;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PMEProcedimiento {
  id: string;
  wsId: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  procesoId: string;
  tipoProcedimientoId?: string;
  periodicidad?: string;
  objetivo?: string;
  responsiblePosition?: string;
  responsibleUser?: string;
  displayOrder?: number;
  version?: string;
  observations?: string;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PMEActividad {
  id: string;
  wsId: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  procesoId: string;
  procedimientoId: string;
  tipoActividadId?: string;
  estadoOperativoId?: string;
  periodicidad?: string;
  objetivo?: string;
  duracion?: string | number;
  unidadDuracionId?: string;
  responsiblePosition?: string;
  responsibleUser?: string;
  displayOrder?: number;
  version?: string;
  observations?: string;
  indicadorId?: string;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PMEHistorial {
  id: string;
  wsId: string;
  entidadTipo: "proceso" | "procedimiento" | "actividad";
  entidadId: string;
  accion:
    | "creado"
    | "actualizado"
    | "activado"
    | "archivado"
    | "duplicado"
    | "responsableCambiado"
    | "nombreCambiado"
    | "objetivoCambiado";
  usuario: string;
  detalle: string;
  createdAt: string;
}

export interface PMEEntityResumen {
  total: number;
  activos: number;
  archivados: number;
}

export interface PMEDashboardResumen {
  procesos: PMEEntityResumen;
  procedimientos: PMEEntityResumen;
  actividades: PMEEntityResumen;
}
