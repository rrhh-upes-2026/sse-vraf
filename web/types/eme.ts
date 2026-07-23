// ── Status & catalog value types ──────────────────────────────────────────────

export type EMEStatus =
  | "Pendiente"
  | "Cargada"
  | "En validación"
  | "Validada"
  | "Rechazada"
  | "Archivada";

export type EMEValidationStatus = "aprobada" | "rechazada" | "pendiente";

export type EMEConfidentialityLevel = "publica" | "interna" | "confidencial" | "restringida";

export type EMEStorageProvider =
  | "google-drive"
  | "onedrive"
  | "sharepoint"
  | "local"
  | "aws-s3"
  | "azure-blob";

// State machine (mirrored from backend)
export const EME_VALID_TRANSITIONS: Record<EMEStatus, EMEStatus[]> = {
  "Pendiente":     ["Cargada", "Archivada"],
  "Cargada":       ["En validación", "Archivada"],
  "En validación": ["Validada", "Rechazada"],
  "Validada":      ["Archivada"],
  "Rechazada":     ["Cargada", "Archivada"],
  "Archivada":     [],
};

// ── Core entity ───────────────────────────────────────────────────────────────

export interface EMEEvidence {
  id:                   string;
  wsId:                 string;
  // AEE reference
  executionId:          string;
  // PME / APE denormalized
  planId:               string;
  activityId:           string;
  procedureId:          string;
  processId:            string;
  organizationalUnitId: string;
  // Metadata
  title:                string;
  description:          string;
  evidenceType:         string;
  // Storage
  storageProvider:      EMEStorageProvider | string;
  storageReference:     string;
  fileName:             string;
  originalFileName:     string;
  extension:            string;
  mimeType:             string;
  fileSize:             number | string;
  checksum:             string;
  // Versioning
  version:              string;
  // Lifecycle
  status:               EMEStatus;
  uploadedBy:           string;
  uploadedAt:           string;
  // Validation
  validatedBy:          string;
  validatedAt:          string;
  validationStatus:     EMEValidationStatus | string;
  validationComments:   string;
  // Classification
  isRequired:           boolean | string;
  isConfidential:       boolean | string;
  confidentialityLevel: EMEConfidentialityLevel | string;
  expirationDate:       string;
  tags:                 string; // JSON array stored as string
  notes:                string;
  // Audit
  createdBy:            string;
  createdAt:            string;
  updatedBy:            string;
  updatedAt:            string;
  deletedAt:            string;
}

// ── History entity ─────────────────────────────────────────────────────────────

export interface EMEEvidenceHistory {
  id:              string;
  wsId:            string;
  evidenciaId:     string;
  accion:          string;
  estadoAnterior:  string;
  estadoNuevo:     string;
  versionAnterior: string;
  versionNueva:    string;
  usuario:         string;
  detalle:         string; // JSON string
  createdAt:       string;
}

// ── Catalog entity ─────────────────────────────────────────────────────────────

export interface EMECatalogo {
  id:        string;
  wsId:      string;
  tipo:      EMECatalogoTipo;
  valor:     string;
  etiqueta:  string;
  activo:    boolean | string;
  orden:     number | string;
  createdAt: string;
  updatedAt: string;
}

export type EMECatalogoTipo =
  | "tipoEvidencia"
  | "estadoEvidencia"
  | "proveedorAlmacenamiento"
  | "nivelConfidencialidad";

// ── Dashboard ──────────────────────────────────────────────────────────────────

export interface EMEDashboard {
  total:     number;
  pending:   number;
  uploaded:  number;
  inReview:  number;
  validated: number;
  rejected:  number;
  archived:  number;
  today:     number;
  totalSize: number;
  byStatus:  { status: EMEStatus; count: number }[];
  byType:    { type: string; count: number }[];
  byUnit:    { unitId: string; count: number }[];
  byUser:    { userId: string; count: number }[];
  recentEvidences: EMEEvidence[];
  todayEvidences:  EMEEvidence[];
}

// ── Mis evidencias ─────────────────────────────────────────────────────────────

export interface EMEMisEvidencias {
  total: number;
  items: EMEEvidence[];
}

// ── Create / update params ─────────────────────────────────────────────────────

export interface EMECreateParams {
  executionId:          string;
  planId?:              string;
  activityId?:          string;
  procedureId?:         string;
  processId?:           string;
  organizationalUnitId?:string;
  title:                string;
  description?:         string;
  evidenceType:         string;
  storageProvider?:     EMEStorageProvider | string;
  storageReference?:    string;
  fileName?:            string;
  originalFileName?:    string;
  extension?:           string;
  mimeType?:            string;
  fileSize?:            number | string;
  checksum?:            string;
  isRequired?:          boolean;
  isConfidential?:      boolean;
  confidentialityLevel?:EMEConfidentialityLevel | string;
  expirationDate?:      string;
  tags?:                string[];
  notes?:               string;
  uploadedBy:           string;
}

export interface EMENuevaVersionParams {
  id:                string;
  uploadedBy:        string;
  storageReference?: string;
  storageProvider?:  EMEStorageProvider | string;
  fileName?:         string;
  originalFileName?: string;
  extension?:        string;
  mimeType?:         string;
  fileSize?:         number | string;
  checksum?:         string;
  description?:      string;
  tags?:             string[];
  notes?:            string;
  confidentialityLevel?: EMEConfidentialityLevel | string;
  expirationDate?:   string;
}

export interface EMEValidarParams {
  id:                 string;
  userId:             string;
  validationStatus:   EMEValidationStatus;
  validationComments?:string;
}
