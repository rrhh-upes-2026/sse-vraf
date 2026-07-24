// OIM — Official Indicator Migration

export type OIMRowStatus = "preview" | "valid" | "conflict" | "imported" | "rejected";

export interface OIMPreviewRow {
  seq:           number;
  codigoPropuesto: string;
  nombre:        string;
  descripcion:   string;
  dimension:     string;
  unidadMedida:  string;
  frecuencia:    string;
  formula:       string;
  polaridad:     string;
  meta:          number;
  herramienta:   string;
  fuente:        string;
}

export interface OIMRowResult {
  seq:           number;
  nombre:        string;
  status:        OIMRowStatus;
  codigoGenerado?: string;
  indicadorId?:  string;
  conflictos:    string[];
  warnings:      string[];
  catalogRefs: {
    objetivoId?:   string;
    dimensionId?:  string;
    formulaId?:    string;
    rangoId?:      string;
    unidadId?:     string;
    frecuenciaId?: string;
  };
}

export interface OIMConflict {
  seq:       number;
  nombre:    string;
  tipo:      string;
  detalle:   string;
  accion:    "omitir" | "revisar";
}

export interface OIMMigrationReport {
  sprintId:    string;
  fuente:      string;
  runAt:       string;
  runBy:       string;
  total:       number;
  imported:    number;
  rejected:    number;
  warnings:    number;
  conflictos:  number;
  catalogLog:  Record<string, number>;
  rows:        OIMRowResult[];
  conflictList: OIMConflict[];
  warningList: Array<{ seq: number; nombre: string; mensaje: string }>;
  recomendaciones: string[];
}

export interface OIMImportHistory {
  id:         string;
  runAt:      string;
  runBy:      string;
  sprintId:   string;
  total:      number;
  imported:   number;
  rejected:   number;
  conflictos: number;
  warnings:   number;
  status:     "success" | "partial" | "failed";
  reportJson: string;
}

export interface OIMRunParams {
  responsibleId: string;
  unidadId:      string;
}
