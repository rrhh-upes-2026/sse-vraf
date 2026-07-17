/**
 * Tipos del motor de ejecución institucional — PRO-TH-001
 *
 * Define la especificación declarativa de los 27 pasos del procedimiento.
 * La capa de servicio consume esta spec para evaluar condiciones y ejecutar
 * transiciones automáticamente.
 */

import type { EtapaContratacion } from "./contratacion";

// ── Roles institucionales ─────────────────────────────────────────────────────

export type RolResponsable =
  | "jefe_area"
  | "rector"
  | "gestor_om"
  | "jefe_rrhh"
  | "comite_o_jefe_area"
  | "jefe_inmediato_o_comite"
  | "jefe_rrhh_o_jefe_area"
  | "candidato"
  | "empleado_y_rector"
  | "sistema";

export const ROL_LABEL: Record<RolResponsable, string> = {
  jefe_area:              "Jefe de Área",
  rector:                 "Rector",
  gestor_om:              "Gestor de O&M",
  jefe_rrhh:              "Jefe de Recursos Humanos",
  comite_o_jefe_area:     "Comité de Evaluación / Jefe de Área",
  jefe_inmediato_o_comite:"Jefe Inmediato / Comité",
  jefe_rrhh_o_jefe_area:  "Jefe de RR. HH. / Jefe de Área",
  candidato:              "Candidato",
  empleado_y_rector:      "Empleado / Rector",
  sistema:                "Sistema (automático)",
};

// ── Validaciones ──────────────────────────────────────────────────────────────

export type TipoValidacion =
  | "campo_requerido"      // a specific field in ProcesoContratacion must be filled
  | "documento_cargado"    // an EvidenciaArchivo must exist for this step
  | "aprobacion_registrada"// an EventoContratacion with resultado='aprobado' must exist
  | "candidatos_minimo"    // proceso.candidatos.length >= N
  | "terna_completa"       // proceso.terna.length === 3
  | "oferta_emitida"       // proceso.cartaOfertaId is set
  | "contrato_firmado";    // proceso.contratoId is set AND ambos firmados

export interface ValidacionPaso {
  id: string;
  descripcion: string;    // human-readable description shown in UI
  tipo: TipoValidacion;
  campo?: string;         // key in ProcesoContratacion for campo_requerido
  valor?: unknown;        // expected value (optional)
  obligatoria: boolean;   // if false, shows as warning not blocker
}

// ── Evidencias requeridas ─────────────────────────────────────────────────────

export interface EvidenciaRequerida {
  id: string;
  nombre: string;
  descripcion: string;
  obligatoria: boolean;
  tiposAceptados: string[]; // ['pdf', 'docx', 'jpg', 'png']
}

// ── Documentos generados ──────────────────────────────────────────────────────

export interface DocumentoGeneradoSpec {
  id: string;
  nombre: string;
  descripcion: string;
  automatico: boolean;  // true = system generates, false = user must upload
  plantilla?: string;   // template name for generation
}

// ── Transiciones ──────────────────────────────────────────────────────────────

export type CondicionTransicion =
  | "completado"            // step marked as done
  | "aprobado"              // explicitly approved
  | "rechazado"             // explicitly rejected
  | "decision_si"           // for decision steps: answer is yes
  | "decision_no"           // for decision steps: answer is no
  | "candidatos_disponibles"// at least one candidate passed profile check
  | "sin_candidatos";       // no candidates — go to external recruitment

export interface Transicion {
  condicion: CondicionTransicion;
  etiqueta: string;           // CTA label: "Aprobar y continuar", "Rechazar"
  descripcion: string;        // tooltip / secondary text
  pasoSiguiente: number | "completado" | "rechazado";
  etapaSiguiente: EtapaContratacion;
  notificarA: RolResponsable[];
  colorBoton: "primario" | "peligro" | "exito" | "secundario";
  requiereConfirmacion: boolean;
  requiereNotas: boolean;
}

// ── Escalación ────────────────────────────────────────────────────────────────

export interface ReglaEscalacion {
  diasSinActividad: number;
  notificarA: RolResponsable[];
  mensaje: string;
  accion: "notificar" | "reasignar" | "escalar_rector";
}

// ── Rollback ──────────────────────────────────────────────────────────────────

export interface ReglaRollback {
  condicion: string;          // human-readable description
  pasoDestino: number;
  requiereJustificacion: boolean;
  notificarA: RolResponsable[];
}

// ── Acciones automáticas al entrar al paso ────────────────────────────────────

export type TipoAccionAutomatica =
  | "crear_tarea"
  | "crear_carpeta_drive"
  | "crear_evento_calendario"
  | "enviar_notificacion"
  | "generar_documento"
  | "registrar_kpi";

export interface AccionAutomatica {
  tipo: TipoAccionAutomatica;
  descripcion: string;
  payload: Record<string, unknown>;
}

// ── Especificación de paso ────────────────────────────────────────────────────

export interface StepSpec {
  numero: number;
  actividad: string;
  instrucciones: string;       // detailed instructions shown to responsible party
  responsable: RolResponsable;
  duracionEstimadaDias: number;
  esDecision: boolean;
  precondiciones: string[];    // human-readable preconditions
  validaciones: ValidacionPaso[];
  evidenciasRequeridas: EvidenciaRequerida[];
  documentosGenerados: DocumentoGeneradoSpec[];
  transiciones: Transicion[];
  accionesAlEntrar: AccionAutomatica[];
  escalacion?: ReglaEscalacion;
  rollback?: ReglaRollback;
}
