/**
 * Builder configuration types — Sprint 15.5 No-Code Builder Suite
 *
 * Every institutional object that can be configured through the browser
 * without writing code. All builder configs are versioned and auditable.
 */

// ── Shared base ───────────────────────────────────────────────────────────────

export type BuilderStatus = "draft" | "published" | "archived";

export interface BuilderBase {
  id: string;
  wsId: string;
  nombre: string;
  descripcion?: string;
  version: number;
  status: BuilderStatus;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ── 1. Process Builder ────────────────────────────────────────────────────────

export type TipoAccionEtapa =
  | "crear_tarea"
  | "enviar_notificacion"
  | "generar_documento"
  | "actualizar_campo"
  | "crear_evento_calendario"
  | "registrar_kpi";

export interface AccionEtapaConfig {
  id: string;
  tipo: TipoAccionEtapa;
  descripcion: string;
  payload: Record<string, unknown>;
}

export interface ValidacionEtapaConfig {
  id: string;
  campo: string;
  tipo: "requerido" | "minimo" | "maximo" | "regex" | "lista" | "custom";
  valor?: string | number;
  mensaje: string;
}

export interface EvidenciaEtapaConfig {
  id: string;
  nombre: string;
  descripcion: string;
  obligatoria: boolean;
  tiposAceptados: string[];
}

export interface DocumentoEtapaConfig {
  id: string;
  nombre: string;
  plantilla?: string;
  automatico: boolean;
}

export interface EtapaProceso {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  responsable: string;
  diasLimite: number;
  validaciones: ValidacionEtapaConfig[];
  evidencias: EvidenciaEtapaConfig[];
  documentos: DocumentoEtapaConfig[];
  acciones: AccionEtapaConfig[];
  esDecision: boolean;
  opcionSi?: string;
  opcionNo?: string;
  etapaSiguienteSi?: string;
  etapaSiguienteNo?: string;
}

export interface ProcessConfig extends BuilderBase {
  tipo: "process";
  etapas: EtapaProceso[];
  roles: string[];
  formularioId?: string;
  kpiIds: string[];
  notificacionIds: string[];
}

// ── 2. Procedure Builder ──────────────────────────────────────────────────────

export interface PasoMapeado {
  id: string;
  numeroPaso: number;
  titulo: string;
  etapaProcesoId?: string;
  observaciones?: string;
}

export interface ProcedureConfig extends BuilderBase {
  tipo: "procedure";
  procesoId?: string;
  documentoOficialUrl?: string;
  documentoOficialNombre?: string;
  versionInstitucional: string;
  vigente: boolean;
  pasosMapeados: PasoMapeado[];
}

// ── 3. Form Builder ───────────────────────────────────────────────────────────

export type TipoCampo =
  | "texto"
  | "textarea"
  | "numero"
  | "email"
  | "telefono"
  | "fecha"
  | "hora"
  | "select"
  | "radio"
  | "checkbox"
  | "archivo"
  | "firma"
  | "seccion_repetible"
  | "separador"
  | "titulo"
  | "instruccion";

export interface CondicionVisibilidad {
  campoId: string;
  operador: "igual" | "no_igual" | "contiene" | "mayor" | "menor" | "vacio" | "no_vacio";
  valor: string;
}

export interface ReglaCampo {
  tipo: "requerido" | "min_longitud" | "max_longitud" | "regex" | "min_valor" | "max_valor";
  valor?: string | number;
  mensaje: string;
}

export interface OpcionCampo {
  valor: string;
  etiqueta: string;
}

export interface CampoFormulario {
  id: string;
  tipo: TipoCampo;
  etiqueta: string;
  placeholder?: string;
  ayuda?: string;
  requerido: boolean;
  orden: number;
  opciones?: OpcionCampo[];
  reglas: ReglaCampo[];
  visibilidad?: CondicionVisibilidad;
  camposHijo?: CampoFormulario[]; // for seccion_repetible
  ancho: "full" | "half" | "third"; // grid width
}

export interface FormConfig extends BuilderBase {
  tipo: "form";
  campos: CampoFormulario[];
  permiteGuardadoParcial: boolean;
  requiereFirma: boolean;
  procesoId?: string;
}

// ── 4. KPI Builder ────────────────────────────────────────────────────────────

export type TipoKPI = "porcentaje" | "numero" | "tiempo" | "ratio" | "moneda";

export interface UmbralKPI {
  verde: { min: number; max: number };
  amarillo: { min: number; max: number };
  rojo: { min: number; max: number };
}

export interface VariableFormula {
  id: string;
  nombre: string;
  descripcion: string;
  fuente: "proceso" | "formulario" | "catalogo" | "manual";
  campoFuente?: string;
  tipo: "numero" | "conteo" | "suma" | "promedio";
}

export interface KPIConfig extends BuilderBase {
  tipo: "kpi";
  tipoKPI: TipoKPI;
  formula: string;
  variables: VariableFormula[];
  unidad: string;
  valorObjetivo: number;
  umbrales: UmbralKPI;
  frecuenciaCalculo: "diaria" | "semanal" | "mensual" | "manual";
  historico: { fecha: string; valor: number }[];
}

// ── 5. Dashboard Builder ──────────────────────────────────────────────────────

export type TipoWidget =
  | "kpi_card"
  | "grafico_barra"
  | "grafico_linea"
  | "grafico_pastel"
  | "tabla"
  | "calendario"
  | "timeline"
  | "alerta"
  | "texto"
  | "imagen";

export interface PosicionWidget {
  col: number;
  row: number;
  ancho: number;
  alto: number;
}

export interface WidgetConfig {
  id: string;
  tipo: TipoWidget;
  titulo: string;
  posicion: PosicionWidget;
  config: Record<string, unknown>; // type-specific config
}

export interface DashboardConfig extends BuilderBase {
  tipo: "dashboard";
  widgets: WidgetConfig[];
  columnas: number;
  rolesVisibles: string[];
}

// ── 6. Automation Builder ─────────────────────────────────────────────────────

export type TipoTrigger =
  | "proceso_etapa_cambia"
  | "campo_actualizado"
  | "formulario_enviado"
  | "fecha_limite_proxima"
  | "kpi_umbral"
  | "manual"
  | "calendario";

export type TipoAccionAuto =
  | "enviar_email"
  | "crear_tarea"
  | "notificar_inapp"
  | "actualizar_campo"
  | "crear_proceso"
  | "llamar_webhook"
  | "generar_documento";

export interface CondicionAutomation {
  id: string;
  campo: string;
  operador: "igual" | "no_igual" | "mayor" | "menor" | "contiene" | "vacio";
  valor: string;
  conector: "y" | "o";
}

export interface AccionAutomation {
  id: string;
  tipo: TipoAccionAuto;
  config: Record<string, unknown>;
  delayMinutos?: number;
}

export interface PoliticaReintento {
  maxIntentos: number;
  intervalosMinutos: number[];
  notificarFallo: boolean;
}

export interface AutomationConfig extends BuilderBase {
  tipo: "automation";
  trigger: TipoTrigger;
  triggerConfig: Record<string, unknown>;
  condiciones: CondicionAutomation[];
  acciones: AccionAutomation[];
  activa: boolean;
  politicaReintento: PoliticaReintento;
  ultimaEjecucion?: string;
  ultimoResultado?: "exitoso" | "fallido" | "saltado";
}

// ── 7. Permission Builder ─────────────────────────────────────────────────────

export interface RolConfig {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  permisos: string[];
}

export interface PermisoEtapa {
  etapaId: string;
  roles: string[];
  puedeCompletar: boolean;
  puedeRechazar: boolean;
  puedeEditar: boolean;
  puedeVerTodo: boolean;
}

export interface PermisoCampo {
  campoId: string;
  formId: string;
  roles: Record<string, "ver" | "editar" | "oculto">;
}

export interface PermissionConfig extends BuilderBase {
  tipo: "permission";
  roles: RolConfig[];
  permisosEtapa: PermisoEtapa[];
  permisosCampo: PermisoCampo[];
  permisosWorkspace: Record<string, string[]>; // permiso → roles[]
}

// ── 8. Catalog Builder ────────────────────────────────────────────────────────

export type TipoCatalogo =
  | "departamentos"
  | "puestos"
  | "competencias"
  | "contratos"
  | "tipos_documento"
  | "tipos_solicitud"
  | "estados"
  | "custom";

export interface EntradaCatalogo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  padreId?: string;
  activo: boolean;
  atributos: Record<string, string | number | boolean>;
  orden: number;
}

export interface CatalogConfig extends BuilderBase {
  tipo: "catalog";
  tipoCatalogo: TipoCatalogo;
  nombrePersonalizado?: string;
  entradas: EntradaCatalogo[];
  tieneJerarquia: boolean;
  atributosPersonalizados: { nombre: string; tipo: "texto" | "numero" | "booleano" }[];
}

// ── 9. Notification Builder ───────────────────────────────────────────────────

export type CanalNotificacion = "email" | "inapp" | "ambos";

export interface VariableNotificacion {
  nombre: string;
  descripcion: string;
  ejemplo: string;
}

export interface NotificationConfig extends BuilderBase {
  tipo: "notification";
  canal: CanalNotificacion;
  asunto: string;
  cuerpoHtml: string;
  cuerpoTexto: string;
  variables: VariableNotificacion[];
  destinatarios: string[]; // roles
  destinatariosAdicionales?: string[]; // emails literales
  triggerAutomationId?: string;
}

// ── 10. Report Builder ────────────────────────────────────────────────────────

export type EntidadReporte =
  | "procesos"
  | "candidatos"
  | "formularios"
  | "indicadores"
  | "usuarios"
  | "tareas"
  | "documentos";

export type TipoGraficoReporte = "barra" | "linea" | "pastel" | "tabla" | "ninguno";

export interface FiltroReporte {
  id: string;
  campo: string;
  operador: "igual" | "contiene" | "mayor" | "menor" | "entre" | "en_lista";
  valor: string;
  conector: "y" | "o";
}

export interface ColumnaReporte {
  campo: string;
  etiqueta: string;
  tipo: "texto" | "numero" | "fecha" | "estado";
  visible: boolean;
  orden: number;
}

export interface ReportConfig extends BuilderBase {
  tipo: "report";
  entidad: EntidadReporte;
  columnas: ColumnaReporte[];
  filtros: FiltroReporte[];
  agruparPor?: string;
  tipoGrafico: TipoGraficoReporte;
  campoGraficoX?: string;
  campoGraficoY?: string;
  ordenarPor?: string;
  ordenDireccion: "asc" | "desc";
  exportarPDF: boolean;
  exportarExcel: boolean;
}

// ── Union type ────────────────────────────────────────────────────────────────

export type BuilderConfig =
  | ProcessConfig
  | ProcedureConfig
  | FormConfig
  | KPIConfig
  | DashboardConfig
  | AutomationConfig
  | PermissionConfig
  | CatalogConfig
  | NotificationConfig
  | ReportConfig;

export type BuilderTipo = BuilderConfig["tipo"];

// ── Builder registry metadata ─────────────────────────────────────────────────

export interface BuilderMeta {
  tipo: BuilderTipo;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  ruta: string;
}

export const BUILDER_REGISTRY: BuilderMeta[] = [
  {
    tipo: "process",
    nombre: "Constructor de Procesos",
    descripcion: "Diseña flujos de trabajo institucionales con etapas, responsables y transiciones.",
    icono: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
    color: "#2E6BE6",
    ruta: "process",
  },
  {
    tipo: "procedure",
    nombre: "Constructor de Procedimientos",
    descripcion: "Vincula procedimientos oficiales a procesos y mapea cada paso institucional.",
    icono: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "#5B4FD0",
    ruta: "procedure",
  },
  {
    tipo: "form",
    nombre: "Constructor de Formularios",
    descripcion: "Diseña formularios digitales con campos condicionales, validaciones y firmas.",
    icono: "M8 3h6l4 4v14H6V5a2 2 0 012-2zM14 3v4h4M9 13h6M9 9h2",
    color: "#0F8A8A",
    ruta: "form",
  },
  {
    tipo: "kpi",
    nombre: "Constructor de KPIs",
    descripcion: "Define indicadores de desempeño con fórmulas, metas y umbrales de alerta.",
    icono: "M4 20a8 8 0 1 1 16 0M12 14l4-4",
    color: "#12A150",
    ruta: "kpi",
  },
  {
    tipo: "dashboard",
    nombre: "Constructor de Dashboards",
    descripcion: "Crea paneles de control con widgets, gráficos y KPIs en cuadrícula.",
    icono: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z",
    color: "#E5A100",
    ruta: "dashboard",
  },
  {
    tipo: "automation",
    nombre: "Constructor de Automatizaciones",
    descripcion: "Configura disparadores, condiciones y acciones para automatizar flujos.",
    icono: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#ef4444",
    ruta: "automation",
  },
  {
    tipo: "permission",
    nombre: "Constructor de Permisos",
    descripcion: "Define roles, permisos de acceso, etapa y campo para cada workspace.",
    icono: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    color: "#7C3AED",
    ruta: "permission",
  },
  {
    tipo: "catalog",
    nombre: "Constructor de Catálogos",
    descripcion: "Administra departamentos, puestos, competencias y tipos de documento.",
    icono: "M4 6h16M4 10h16M4 14h10",
    color: "#64748b",
    ruta: "catalog",
  },
  {
    tipo: "notification",
    nombre: "Constructor de Notificaciones",
    descripcion: "Diseña plantillas de email e in-app con variables dinámicas y vista previa.",
    icono: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    color: "#0ea5e9",
    ruta: "notification",
  },
  {
    tipo: "report",
    nombre: "Constructor de Reportes",
    descripcion: "Crea reportes personalizados con filtros, agrupaciones y exportación.",
    icono: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "#f59e0b",
    ruta: "report",
  },
];
