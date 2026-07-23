/**
 * Contract between the frontend Services layer and the Backend-for-Frontend.
 * Every entity is a Google Sheet in production (one sheet per entity, never
 * one giant sheet) fronted by a Google Apps Script Web App; here it's just a
 * name. The UI/Services/Hooks layers never import Sheets/Drive/Apps Script
 * APIs directly — only this interface. Swapping MockAppsScriptAdapter for
 * HttpAppsScriptAdapter must not require touching anything above this file.
 */

export type EntityName =
  | "planes"
  | "objetivos"
  | "proyectos"
  | "procesos"
  | "actividades"
  | "evidencias"
  | "indicadores"
  | "formularios"
  | "solicitudes"
  | "usuarios"
  | "unidades"
  | "historial"
  // HR domain entities (Sprint 4)
  | "empleados"
  | "capacitaciones"
  | "evaluaciones"
  | "solicitudesContratacion"
  | "notificaciones"
  // Workflow Engine (Sprint 5)
  | "workflowBlueprints"
  | "workflowInstances"
  // Runtime Studio (Sprint 6)
  | "blueprintRegistry"
  | "instanceSummaries"
  // Compras domain entities
  | "comprasSolicitudes"
  | "comprasRequisiciones"
  | "comprasCotizaciones"
  | "comprasProveedores"
  | "comprasOrdenes"
  | "comprasRecepciones"
  | "comprasEvaluaciones"
  // Contabilidad domain entities
  | "contaCompromisos"
  | "contaRegistros"
  | "contaFacturas"
  | "contaPagos"
  | "contaConciliaciones"
  | "contaCuentasPagar"
  | "contaCuentasCobrar"
  // Mantenimiento domain entities
  | "mantoActivos"
  | "mantoUbicaciones"
  | "mantoPlanes"
  | "mantoSolicitudes"
  | "mantoOrdenesTrabajo"
  | "mantoInspecciones"
  | "mantoHistorial"
  | "mantoCostos"
  | "mantoInventarioTecnico"
  // SSO entities
  | "ssoIncidentes"
  | "ssoAccidentes"
  | "ssoInspecciones"
  | "ssoPeligros"
  | "ssoRiesgos"
  | "ssoAcciones"
  | "ssoEPP"
  | "ssoCapacitaciones"
  | "ssoComite"
  | "ssoAuditorias"
  | "ssoCumplimiento"
  // Workspace-admin entities (Sprint 13)
  | "wsBlueprints"
  | "wsKPIs"
  | "wsRequestTypes"
  | "wsAutomations"
  | "wsUsers"
  | "wsForms"
  | "wsDocuments"
  | "wsNotifRules"
  | "wsSettings"
  // IME — Indicator Management Engine
  | "imeIndicadores"
  | "imeCatalogos"
  | "imeHistorial"
  // PME — Process Management Engine
  | "pmeProcesos"
  | "pmeProcedimientos"
  | "pmeActividades"
  | "pmeCatalogos"
  | "pmeHistorial"
  // APE — Activity Planning Engine
  | "apePlanes"
  | "apeHistorial"
  // AEE — Activity Execution Engine
  | "aeeEjecuciones"
  | "aeeCatalogos"
  | "aeeHistorial"
  // EME — Evidence Management Engine
  | "emeEvidencias"
  | "emeCatalogos"
  | "emeHistorial";

/**
 * Query parameters for list operations.
 *
 * Reserved pagination/sort keys (prefixed with _) are stripped before filter
 * matching on the Apps Script side:
 *   _page      — page number (1-based); presence enables the pagination envelope
 *   _pageSize  — items per page (1–500, capped by server Config.maxPageSize)
 *   _sortBy    — field name to sort by
 *   _sortDir   — "asc" | "desc"
 *
 * All other keys are exact-match filters against entity fields.
 */
export interface ListQuery {
  _page?: number;
  _pageSize?: number;
  _sortBy?: string;
  _sortDir?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

export interface IAppsScriptClient {
  list<T>(entity: EntityName, query?: ListQuery): Promise<T[]>;
  get<T>(entity: EntityName, id: string): Promise<T | null>;
  create<T extends { id?: string }>(entity: EntityName, payload: Partial<T>): Promise<T>;
  update<T>(entity: EntityName, id: string, patch: Partial<T>): Promise<T>;
  remove(entity: EntityName, id: string): Promise<void>;
  /**
   * Execute an arbitrary action on an entity — used for workspace-admin
   * lifecycle verbs that don't map to the 5-verb CRUD interface.
   * action format: "<entity>.<verb>"  e.g. "wsBlueprints.publish"
   */
  call<T>(action: string, params?: Record<string, unknown>): Promise<T>;
}
