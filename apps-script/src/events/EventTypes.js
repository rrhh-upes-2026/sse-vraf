/**
 * All 16 institutional event types defined in MASTER HANDOFF §09.
 * These are the wire-level names used by EventDispatcher — every emit()
 * call and every on() registration uses one of these constants.
 *
 * Adding an event type here does not wire any handler — handlers are
 * registered in the sprint that owns the consuming logic (notifications,
 * automations, indicator recalculation, etc.).
 */
var EVENT_TYPES = {
  // Strategic plan hierarchy
  PLAN_CREADO:             "plan.creado",
  OBJETIVO_CREADO:         "objetivo.creado",

  // Projects
  PROYECTO_CREADO:         "proyecto.creado",
  PROYECTO_ACTUALIZADO:    "proyecto.actualizado",

  // Processes — the institutional nucleus (§04)
  PROCESO_CREADO:          "proceso.creado",
  PROCESO_ACTUALIZADO:     "proceso.actualizado",
  PROCESO_COMPLETADO:      "proceso.completado",
  PROCESO_VENCIDO:         "proceso.vencido",

  // Activities
  ACTIVIDAD_COMPLETADA:    "actividad.completada",

  // Evidence (§08)
  EVIDENCIA_CARGADA:       "evidencia.cargada",
  EVIDENCIA_APROBADA:      "evidencia.aprobada",
  EVIDENCIA_RECHAZADA:     "evidencia.rechazada",

  // Indicators
  INDICADOR_ACTUALIZADO:   "indicador.actualizado",
  INDICADOR_ALERTA:        "indicador.alerta",

  // Service requests
  SOLICITUD_CREADA:        "solicitud.creada",
  SOLICITUD_RESUELTA:      "solicitud.resuelta",
};
