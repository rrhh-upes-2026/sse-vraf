/**
 * KPI Adapters — Phase 3.
 *
 * One adapter per organizational unit. Each adapter implements:
 *   { unitKey: string, getKPIs(wsId): KPIDefinicion[] }
 *
 * All 21 fields populated per KPI. Adapters call listEntities_() directly
 * (SheetRepository) — never call unit controllers.
 *
 * Registered with KPIEngine via bootstrapKPIAdapters_().
 */

// ─── Shared helpers ──────────────────────────────────────────────────────────

function _kpiCount_(wsId, entityName) {
  try {
    var r = listEntities_(entityName, { wsId: wsId, _pageSize: 1 });
    return r && r.pagination ? r.pagination.total : 0;
  } catch (e) { return 0; }
}

function _kpiCountWhere_(wsId, entityName, field, value) {
  try {
    var q = { wsId: wsId, _pageSize: 1000 };
    q[field] = value;
    var r = listEntities_(entityName, q);
    return r && r.items ? r.items.length : 0;
  } catch (e) { return 0; }
}

function _kpiSum_(wsId, entityName, field) {
  try {
    var r = listEntities_(entityName, { wsId: wsId, _pageSize: 1000 });
    if (!r || !r.items) return 0;
    var sum = 0;
    for (var i = 0; i < r.items.length; i++) {
      sum += (parseFloat(r.items[i][field]) || 0);
    }
    return Math.round(sum * 100) / 100;
  } catch (e) { return 0; }
}

function _kpiAvg_(wsId, entityName, field) {
  try {
    var r = listEntities_(entityName, { wsId: wsId, _pageSize: 1000 });
    if (!r || !r.items || !r.items.length) return 0;
    var sum = 0;
    for (var i = 0; i < r.items.length; i++) {
      sum += (parseFloat(r.items[i][field]) || 0);
    }
    return Math.round((sum / r.items.length) * 10) / 10;
  } catch (e) { return 0; }
}

function _kpiPct_(numerador, denominador) {
  if (!denominador || denominador === 0) return 0;
  return Math.round((numerador / denominador) * 100 * 10) / 10;
}

// ─── RRHH KPI Adapter ────────────────────────────────────────────────────────

var RRHHKPIAdapter = {
  unitKey: "rrhh",

  getKPIs: function (wsId) {
    var empleados       = _kpiCount_(wsId, "empleados");
    var activos         = _kpiCountWhere_(wsId, "empleados", "estado", "activo");
    var enProceso       = _kpiCountWhere_(wsId, "contrataciones", "estado", "en_proceso");
    var contrataciones  = _kpiCount_(wsId, "contrataciones");
    var evaluaciones    = _kpiCount_(wsId, "evaluaciones");
    var evalCompletadas = _kpiCountWhere_(wsId, "evaluaciones", "estado", "completada");
    var capacitaciones  = _kpiCount_(wsId, "capacitaciones");
    var capCompletadas  = _kpiCountWhere_(wsId, "capacitaciones", "estado", "completada");
    var vacaciones      = _kpiCountWhere_(wsId, "vacaciones", "estado", "aprobada");
    var rotacion        = empleados > 0 ? _kpiPct_(_kpiCountWhere_(wsId, "empleados", "estado", "inactivo"), empleados) : 0;
    var tasaEval        = _kpiPct_(evalCompletadas, evaluaciones);
    var tasaCap         = _kpiPct_(capCompletadas, capacitaciones);

    return [
      {
        id: "rrhh_plantilla_total", nombre: "Plantilla Total",
        descripcion: "Total de empleados registrados en el sistema",
        unidad: "empleados", categoria: "personal", grupo: "fuerza_laboral",
        origen: "sheets", adaptador: "rrhh", consulta: "empleados",
        formula: "COUNT(empleados)", tipo: "numero",
        meta: 0, valorActual: empleados, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "RRHH",
        dashboard: "ejecutivo", visible: true, orden: 10,
      },
      {
        id: "rrhh_empleados_activos", nombre: "Empleados Activos",
        descripcion: "Empleados con estado activo",
        unidad: "empleados", categoria: "personal", grupo: "fuerza_laboral",
        origen: "sheets", adaptador: "rrhh", consulta: "empleados[estado=activo]",
        formula: "COUNT(empleados WHERE estado='activo')", tipo: "numero",
        meta: empleados, valorActual: activos, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: _kpiPct_(activos, empleados) >= 90 ? "verde" : "amarillo",
        frecuencia: "diaria", responsable: "RRHH",
        dashboard: "ejecutivo", visible: true, orden: 11,
      },
      {
        id: "rrhh_rotacion", nombre: "Tasa de Rotación",
        descripcion: "Porcentaje de empleados inactivos respecto al total",
        unidad: "%", categoria: "personal", grupo: "retención",
        origen: "sheets", adaptador: "rrhh", consulta: "empleados[estado=inactivo]",
        formula: "COUNT(inactivos)/COUNT(total)*100", tipo: "porcentaje",
        meta: 10, valorActual: rotacion, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: rotacion <= 5 ? "verde" : rotacion <= 10 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "mensual", responsable: "RRHH",
        dashboard: "ejecutivo", visible: true, orden: 12,
      },
      {
        id: "rrhh_contrataciones_abiertas", nombre: "Contrataciones en Proceso",
        descripcion: "Procesos de contratación activos actualmente",
        unidad: "procesos", categoria: "reclutamiento", grupo: "adquisicion_talento",
        origen: "sheets", adaptador: "rrhh", consulta: "contrataciones[estado=en_proceso]",
        formula: "COUNT(contrataciones WHERE estado='en_proceso')", tipo: "numero",
        meta: 0, valorActual: enProceso, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "semanal", responsable: "RRHH",
        dashboard: "ejecutivo", visible: true, orden: 13,
      },
      {
        id: "rrhh_tasa_evaluacion", nombre: "Tasa de Evaluación",
        descripcion: "Porcentaje de evaluaciones de desempeño completadas",
        unidad: "%", categoria: "desempeño", grupo: "gestion_desempeno",
        origen: "sheets", adaptador: "rrhh", consulta: "evaluaciones[estado=completada]",
        formula: "COUNT(completadas)/COUNT(total)*100", tipo: "porcentaje",
        meta: 90, valorActual: tasaEval, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaEval >= 90 ? "verde" : tasaEval >= 70 ? "amarillo" : "rojo",
        frecuencia: "trimestral", responsable: "RRHH",
        dashboard: "ejecutivo", visible: true, orden: 14,
      },
      {
        id: "rrhh_tasa_capacitacion", nombre: "Tasa de Capacitación",
        descripcion: "Porcentaje de capacitaciones completadas",
        unidad: "%", categoria: "desarrollo", grupo: "capacitacion",
        origen: "sheets", adaptador: "rrhh", consulta: "capacitaciones[estado=completada]",
        formula: "COUNT(completadas)/COUNT(total)*100", tipo: "porcentaje",
        meta: 85, valorActual: tasaCap, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaCap >= 85 ? "verde" : tasaCap >= 70 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "RRHH",
        dashboard: "ejecutivo", visible: true, orden: 15,
      },
    ];
  },
};

// ─── VRAF KPI Adapter ─────────────────────────────────────────────────────────

var VRAFKPIAdapter = {
  unitKey: "vraf",

  getKPIs: function (wsId) {
    var objetivos       = _kpiCount_(wsId, "objetivos");
    var objCumplidos    = _kpiCountWhere_(wsId, "objetivos", "estado", "cumplido");
    var proyectos       = _kpiCount_(wsId, "proyectos");
    var proyActivos     = _kpiCountWhere_(wsId, "proyectos", "estado", "en_ejecucion");
    var indicadores     = _kpiCount_(wsId, "indicadores");
    var evidencias      = _kpiCount_(wsId, "evidencias");
    var tasaObj         = _kpiPct_(objCumplidos, objetivos);
    var avanceProy      = _kpiAvg_(wsId, "proyectos", "avancePct");
    var pctEvidenciados = _kpiPct_(evidencias, indicadores);

    return [
      {
        id: "vraf_objetivos_cumplidos", nombre: "Objetivos Cumplidos",
        descripcion: "Porcentaje de objetivos estratégicos en estado cumplido",
        unidad: "%", categoria: "estrategia", grupo: "planificacion",
        origen: "sheets", adaptador: "vraf", consulta: "objetivos[estado=cumplido]",
        formula: "COUNT(cumplidos)/COUNT(total)*100", tipo: "porcentaje",
        meta: 80, valorActual: tasaObj, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaObj >= 80 ? "verde" : tasaObj >= 60 ? "amarillo" : "rojo",
        frecuencia: "trimestral", responsable: "VRAF",
        dashboard: "ejecutivo", visible: true, orden: 20,
      },
      {
        id: "vraf_proyectos_activos", nombre: "Proyectos en Ejecución",
        descripcion: "Proyectos actualmente en ejecución",
        unidad: "proyectos", categoria: "proyectos", grupo: "gestion_proyectos",
        origen: "sheets", adaptador: "vraf", consulta: "proyectos[estado=en_ejecucion]",
        formula: "COUNT(proyectos WHERE estado='en_ejecucion')", tipo: "numero",
        meta: 0, valorActual: proyActivos, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "VRAF",
        dashboard: "ejecutivo", visible: true, orden: 21,
      },
      {
        id: "vraf_avance_proyectos", nombre: "Avance Promedio Proyectos",
        descripcion: "Porcentaje de avance promedio de todos los proyectos",
        unidad: "%", categoria: "proyectos", grupo: "avance",
        origen: "sheets", adaptador: "vraf", consulta: "proyectos[avancePct]",
        formula: "AVG(proyectos.avancePct)", tipo: "porcentaje",
        meta: 75, valorActual: avanceProy, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: avanceProy >= 75 ? "verde" : avanceProy >= 50 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "VRAF",
        dashboard: "ejecutivo", visible: true, orden: 22,
      },
      {
        id: "vraf_indicadores_total", nombre: "Indicadores Registrados",
        descripcion: "Total de indicadores estratégicos en seguimiento",
        unidad: "indicadores", categoria: "estrategia", grupo: "seguimiento",
        origen: "sheets", adaptador: "vraf", consulta: "indicadores",
        formula: "COUNT(indicadores)", tipo: "numero",
        meta: 0, valorActual: indicadores, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "VRAF",
        dashboard: "ejecutivo", visible: true, orden: 23,
      },
      {
        id: "vraf_evidencias_cumplimiento", nombre: "Cobertura de Evidencias",
        descripcion: "Porcentaje de indicadores con evidencias registradas",
        unidad: "%", categoria: "cumplimiento", grupo: "evidencias",
        origen: "sheets", adaptador: "vraf", consulta: "evidencias vs indicadores",
        formula: "COUNT(evidencias)/COUNT(indicadores)*100", tipo: "porcentaje",
        meta: 90, valorActual: pctEvidenciados, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: pctEvidenciados >= 90 ? "verde" : pctEvidenciados >= 70 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "VRAF",
        dashboard: "ejecutivo", visible: true, orden: 24,
      },
    ];
  },
};

// ─── Compras KPI Adapter ──────────────────────────────────────────────────────

var ComprasKPIAdapter = {
  unitKey: "compras",

  getKPIs: function (wsId) {
    var requisiciones   = _kpiCount_(wsId, "requisiciones");
    var reqPendientes   = _kpiCountWhere_(wsId, "requisiciones", "estado", "pendiente");
    var ordenes         = _kpiCount_(wsId, "ordenes");
    var ordenesAbiertas = _kpiCountWhere_(wsId, "ordenes", "estado", "emitida");
    var cotizaciones    = _kpiCount_(wsId, "cotizaciones");
    var contratos       = _kpiCount_(wsId, "contratos");
    var proveedores     = _kpiCount_(wsId, "proveedores");
    var montoTotal      = _kpiSum_(wsId, "ordenes", "montoTotal");
    var tasaAtencion    = _kpiPct_(requisiciones - reqPendientes, requisiciones);

    return [
      {
        id: "compras_requisiciones_pendientes", nombre: "Requisiciones Pendientes",
        descripcion: "Requisiciones en espera de aprobación o proceso",
        unidad: "requisiciones", categoria: "compras", grupo: "proceso_compra",
        origen: "sheets", adaptador: "compras", consulta: "requisiciones[estado=pendiente]",
        formula: "COUNT(requisiciones WHERE estado='pendiente')", tipo: "numero",
        meta: 5, valorActual: reqPendientes, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: reqPendientes <= 5 ? "verde" : reqPendientes <= 10 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "diaria", responsable: "Compras",
        dashboard: "ejecutivo", visible: true, orden: 30,
      },
      {
        id: "compras_tasa_atencion", nombre: "Tasa de Atención",
        descripcion: "Porcentaje de requisiciones atendidas",
        unidad: "%", categoria: "compras", grupo: "eficiencia",
        origen: "sheets", adaptador: "compras", consulta: "requisiciones atendidas",
        formula: "(total-pendientes)/total*100", tipo: "porcentaje",
        meta: 90, valorActual: tasaAtencion, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaAtencion >= 90 ? "verde" : tasaAtencion >= 70 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "Compras",
        dashboard: "ejecutivo", visible: true, orden: 31,
      },
      {
        id: "compras_ordenes_abiertas", nombre: "Órdenes de Compra Abiertas",
        descripcion: "Órdenes de compra emitidas pendientes de recepción",
        unidad: "órdenes", categoria: "compras", grupo: "proceso_compra",
        origen: "sheets", adaptador: "compras", consulta: "ordenes[estado=emitida]",
        formula: "COUNT(ordenes WHERE estado='emitida')", tipo: "numero",
        meta: 20, valorActual: ordenesAbiertas, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: ordenesAbiertas <= 20 ? "verde" : ordenesAbiertas <= 40 ? "amarillo" : "rojo",
        frecuencia: "diaria", responsable: "Compras",
        dashboard: "ejecutivo", visible: true, orden: 32,
      },
      {
        id: "compras_monto_comprometido", nombre: "Monto Comprometido",
        descripcion: "Valor total de órdenes de compra emitidas",
        unidad: "USD", categoria: "financiero", grupo: "presupuesto",
        origen: "sheets", adaptador: "compras", consulta: "ordenes[montoTotal]",
        formula: "SUM(ordenes.montoTotal)", tipo: "moneda",
        meta: 0, valorActual: montoTotal, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Compras",
        dashboard: "ejecutivo", visible: true, orden: 33,
      },
      {
        id: "compras_proveedores_activos", nombre: "Proveedores Activos",
        descripcion: "Total de proveedores registrados en el catálogo",
        unidad: "proveedores", categoria: "proveedores", grupo: "catalogo",
        origen: "sheets", adaptador: "compras", consulta: "proveedores",
        formula: "COUNT(proveedores)", tipo: "numero",
        meta: 0, valorActual: proveedores, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Compras",
        dashboard: "ejecutivo", visible: false, orden: 34,
      },
      {
        id: "compras_contratos_vigentes", nombre: "Contratos Vigentes",
        descripcion: "Contratos con proveedores actualmente vigentes",
        unidad: "contratos", categoria: "proveedores", grupo: "contratos",
        origen: "sheets", adaptador: "compras", consulta: "contratos",
        formula: "COUNT(contratos)", tipo: "numero",
        meta: 0, valorActual: contratos, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Compras",
        dashboard: "ejecutivo", visible: true, orden: 35,
      },
    ];
  },
};

// ─── Contabilidad KPI Adapter ─────────────────────────────────────────────────

var ContabilidadKPIAdapter = {
  unitKey: "contabilidad",

  getKPIs: function (wsId) {
    var porCobrar       = _kpiSum_(wsId, "cuentasCobrar", "monto");
    var porPagar        = _kpiSum_(wsId, "cuentasPagar", "monto");
    var compromisos     = _kpiCount_(wsId, "compromisos");
    var compromisosEj   = _kpiCountWhere_(wsId, "compromisos", "estado", "ejecutado");
    var asientosMes     = _kpiCount_(wsId, "asientos");
    var liquidaciones   = _kpiCount_(wsId, "liquidaciones");
    var liqAprobadas    = _kpiCountWhere_(wsId, "liquidaciones", "estado", "aprobada");
    var tasaLiquidacion = _kpiPct_(liqAprobadas, liquidaciones);
    var tasaCompromisos = _kpiPct_(compromisosEj, compromisos);
    var saldoNeto       = porCobrar - porPagar;

    return [
      {
        id: "cont_cuentas_cobrar", nombre: "Cuentas por Cobrar",
        descripcion: "Saldo total de cuentas por cobrar pendientes",
        unidad: "USD", categoria: "financiero", grupo: "liquidez",
        origen: "sheets", adaptador: "contabilidad", consulta: "cuentasCobrar[monto]",
        formula: "SUM(cuentasCobrar.monto)", tipo: "moneda",
        meta: 0, valorActual: porCobrar, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Contabilidad",
        dashboard: "ejecutivo", visible: true, orden: 40,
      },
      {
        id: "cont_cuentas_pagar", nombre: "Cuentas por Pagar",
        descripcion: "Saldo total de cuentas por pagar pendientes",
        unidad: "USD", categoria: "financiero", grupo: "liquidez",
        origen: "sheets", adaptador: "contabilidad", consulta: "cuentasPagar[monto]",
        formula: "SUM(cuentasPagar.monto)", tipo: "moneda",
        meta: 0, valorActual: porPagar, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Contabilidad",
        dashboard: "ejecutivo", visible: true, orden: 41,
      },
      {
        id: "cont_saldo_neto", nombre: "Saldo Neto (C×C - C×P)",
        descripcion: "Diferencia entre cuentas por cobrar y cuentas por pagar",
        unidad: "USD", categoria: "financiero", grupo: "liquidez",
        origen: "sheets", adaptador: "contabilidad", consulta: "cuentasCobrar - cuentasPagar",
        formula: "SUM(cobrar) - SUM(pagar)", tipo: "moneda",
        meta: 0, valorActual: saldoNeto, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: saldoNeto >= 0 ? "verde" : saldoNeto >= -5000 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "Contabilidad",
        dashboard: "ejecutivo", visible: true, orden: 42,
      },
      {
        id: "cont_compromisos_ejecutados", nombre: "Ejecución de Compromisos",
        descripcion: "Porcentaje de compromisos presupuestarios ejecutados",
        unidad: "%", categoria: "presupuesto", grupo: "ejecucion",
        origen: "sheets", adaptador: "contabilidad", consulta: "compromisos[estado=ejecutado]",
        formula: "COUNT(ejecutados)/COUNT(total)*100", tipo: "porcentaje",
        meta: 80, valorActual: tasaCompromisos, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaCompromisos >= 80 ? "verde" : tasaCompromisos >= 60 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "Contabilidad",
        dashboard: "ejecutivo", visible: true, orden: 43,
      },
      {
        id: "cont_asientos_mes", nombre: "Asientos Contables (mes)",
        descripcion: "Total de asientos contables registrados en el período",
        unidad: "asientos", categoria: "contabilidad", grupo: "operacion",
        origen: "sheets", adaptador: "contabilidad", consulta: "asientos",
        formula: "COUNT(asientos)", tipo: "numero",
        meta: 0, valorActual: asientosMes, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Contabilidad",
        dashboard: "ejecutivo", visible: false, orden: 44,
      },
      {
        id: "cont_tasa_liquidacion", nombre: "Tasa de Liquidación",
        descripcion: "Porcentaje de liquidaciones aprobadas respecto al total",
        unidad: "%", categoria: "contabilidad", grupo: "liquidacion",
        origen: "sheets", adaptador: "contabilidad", consulta: "liquidaciones[estado=aprobada]",
        formula: "COUNT(aprobadas)/COUNT(total)*100", tipo: "porcentaje",
        meta: 90, valorActual: tasaLiquidacion, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaLiquidacion >= 90 ? "verde" : tasaLiquidacion >= 70 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "Contabilidad",
        dashboard: "ejecutivo", visible: true, orden: 45,
      },
    ];
  },
};

// ─── Mantenimiento KPI Adapter ────────────────────────────────────────────────

var MantenimientoKPIAdapter = {
  unitKey: "mantenimiento",

  getKPIs: function (wsId) {
    var activos         = _kpiCount_(wsId, "activos");
    var activosOp       = _kpiCountWhere_(wsId, "activos", "estado", "operativo");
    var ordenes         = _kpiCount_(wsId, "ordenes");
    var ordAbiertas     = _kpiCountWhere_(wsId, "ordenes", "estado", "abierta");
    var solicitudes     = _kpiCount_(wsId, "solicitudes");
    var solicPend       = _kpiCountWhere_(wsId, "solicitudes", "estado", "pendiente");
    var inventario      = _kpiCount_(wsId, "inventario");
    var inventarioBajo  = _kpiCountWhere_(wsId, "inventario", "estadoStock", "bajo");
    var disponibilidad  = _kpiPct_(activosOp, activos);
    var tasaAtencion    = _kpiPct_(ordenes - ordAbiertas, ordenes);
    var tasaStock       = activos > 0 ? _kpiPct_(inventario - inventarioBajo, inventario) : 100;

    return [
      {
        id: "manto_disponibilidad_activos", nombre: "Disponibilidad de Activos",
        descripcion: "Porcentaje de activos en estado operativo",
        unidad: "%", categoria: "activos", grupo: "disponibilidad",
        origen: "sheets", adaptador: "mantenimiento", consulta: "activos[estado=operativo]",
        formula: "COUNT(operativos)/COUNT(total)*100", tipo: "porcentaje",
        meta: 95, valorActual: disponibilidad, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: disponibilidad >= 95 ? "verde" : disponibilidad >= 80 ? "amarillo" : "rojo",
        frecuencia: "diaria", responsable: "Mantenimiento",
        dashboard: "ejecutivo", visible: true, orden: 50,
      },
      {
        id: "manto_ordenes_abiertas", nombre: "Órdenes de Trabajo Abiertas",
        descripcion: "Órdenes de mantenimiento sin completar",
        unidad: "órdenes", categoria: "mantenimiento", grupo: "operacion",
        origen: "sheets", adaptador: "mantenimiento", consulta: "ordenes[estado=abierta]",
        formula: "COUNT(ordenes WHERE estado='abierta')", tipo: "numero",
        meta: 10, valorActual: ordAbiertas, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: ordAbiertas <= 10 ? "verde" : ordAbiertas <= 20 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "diaria", responsable: "Mantenimiento",
        dashboard: "ejecutivo", visible: true, orden: 51,
      },
      {
        id: "manto_solicitudes_pendientes", nombre: "Solicitudes Pendientes",
        descripcion: "Solicitudes de mantenimiento en espera de atención",
        unidad: "solicitudes", categoria: "mantenimiento", grupo: "operacion",
        origen: "sheets", adaptador: "mantenimiento", consulta: "solicitudes[estado=pendiente]",
        formula: "COUNT(solicitudes WHERE estado='pendiente')", tipo: "numero",
        meta: 5, valorActual: solicPend, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: solicPend <= 5 ? "verde" : solicPend <= 15 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "diaria", responsable: "Mantenimiento",
        dashboard: "ejecutivo", visible: true, orden: 52,
      },
      {
        id: "manto_tasa_atencion", nombre: "Tasa de Atención OT",
        descripcion: "Porcentaje de órdenes de trabajo completadas",
        unidad: "%", categoria: "mantenimiento", grupo: "eficiencia",
        origen: "sheets", adaptador: "mantenimiento", consulta: "ordenes completadas vs total",
        formula: "(total-abiertas)/total*100", tipo: "porcentaje",
        meta: 85, valorActual: tasaAtencion, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaAtencion >= 85 ? "verde" : tasaAtencion >= 70 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "Mantenimiento",
        dashboard: "ejecutivo", visible: true, orden: 53,
      },
      {
        id: "manto_stock_critico", nombre: "Ítems con Stock Bajo",
        descripcion: "Número de ítems de inventario con stock por debajo del mínimo",
        unidad: "ítems", categoria: "inventario", grupo: "stock",
        origen: "sheets", adaptador: "mantenimiento", consulta: "inventario[estadoStock=bajo]",
        formula: "COUNT(inventario WHERE estadoStock='bajo')", tipo: "numero",
        meta: 0, valorActual: inventarioBajo, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: inventarioBajo === 0 ? "verde" : inventarioBajo <= 3 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "semanal", responsable: "Mantenimiento",
        dashboard: "ejecutivo", visible: true, orden: 54,
      },
      {
        id: "manto_activos_total", nombre: "Activos Registrados",
        descripcion: "Total de activos bajo gestión de mantenimiento",
        unidad: "activos", categoria: "activos", grupo: "inventario",
        origen: "sheets", adaptador: "mantenimiento", consulta: "activos",
        formula: "COUNT(activos)", tipo: "numero",
        meta: 0, valorActual: activos, valorAnterior: 0,
        variacion: 0, tendencia: "estable", semaforo: "verde",
        frecuencia: "mensual", responsable: "Mantenimiento",
        dashboard: "ejecutivo", visible: false, orden: 55,
      },
    ];
  },
};

// ─── SSO KPI Adapter ──────────────────────────────────────────────────────────

var SSOKPIAdapter = {
  unitKey: "sso",

  getKPIs: function (wsId) {
    var incidentes      = _kpiCount_(wsId, "ssoIncidentes");
    var incAbiertos     = _kpiCountWhere_(wsId, "ssoIncidentes", "estado", "abierto");
    var accidentes      = _kpiCount_(wsId, "ssoAccidentes");
    var riesgos         = _kpiCount_(wsId, "ssoRiesgos");
    var riesgoCriticos  = _kpiCountWhere_(wsId, "ssoRiesgos", "clasificacion", "critico");
    var acciones        = _kpiCount_(wsId, "ssoAcciones");
    var accionesVenc    = _kpiCountWhere_(wsId, "ssoAcciones", "estado", "vencida");
    var accionesCerrad  = _kpiCountWhere_(wsId, "ssoAcciones", "estado", "cerrada");
    var cumplLegal      = _kpiCount_(wsId, "ssoCumplimiento");
    var cumplCumplido   = _kpiCountWhere_(wsId, "ssoCumplimiento", "estado", "cumplido");
    var tasaCumpl       = _kpiPct_(cumplCumplido, cumplLegal);
    var tasaAcciones    = _kpiPct_(accionesCerrad, acciones);

    return [
      {
        id: "sso_incidentes_abiertos", nombre: "Incidentes Abiertos",
        descripcion: "Incidentes SSO sin cerrar pendientes de investigación",
        unidad: "incidentes", categoria: "seguridad", grupo: "incidentes",
        origen: "sheets", adaptador: "sso", consulta: "ssoIncidentes[estado=abierto]",
        formula: "COUNT(incidentes WHERE estado='abierto')", tipo: "numero",
        meta: 0, valorActual: incAbiertos, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: incAbiertos === 0 ? "verde" : incAbiertos <= 2 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "diaria", responsable: "SSO",
        dashboard: "ejecutivo", visible: true, orden: 60,
      },
      {
        id: "sso_accidentes_mes", nombre: "Accidentes Registrados",
        descripcion: "Total de accidentes laborales registrados en el período",
        unidad: "accidentes", categoria: "seguridad", grupo: "accidentes",
        origen: "sheets", adaptador: "sso", consulta: "ssoAccidentes",
        formula: "COUNT(accidentes)", tipo: "numero",
        meta: 0, valorActual: accidentes, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: accidentes === 0 ? "verde" : accidentes <= 1 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "mensual", responsable: "SSO",
        dashboard: "ejecutivo", visible: true, orden: 61,
      },
      {
        id: "sso_riesgos_criticos", nombre: "Riesgos Críticos",
        descripcion: "Riesgos identificados con clasificación crítica en matriz IPER",
        unidad: "riesgos", categoria: "seguridad", grupo: "riesgos",
        origen: "sheets", adaptador: "sso", consulta: "ssoRiesgos[clasificacion=critico]",
        formula: "COUNT(riesgos WHERE clasificacion='critico')", tipo: "numero",
        meta: 0, valorActual: riesgoCriticos, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: riesgoCriticos === 0 ? "verde" : riesgoCriticos <= 2 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "mensual", responsable: "SSO",
        dashboard: "ejecutivo", visible: true, orden: 62,
      },
      {
        id: "sso_acciones_vencidas", nombre: "Acciones CAPA Vencidas",
        descripcion: "Acciones correctivas/preventivas vencidas sin completar",
        unidad: "acciones", categoria: "seguridad", grupo: "acciones_capa",
        origen: "sheets", adaptador: "sso", consulta: "ssoAcciones[estado=vencida]",
        formula: "COUNT(acciones WHERE estado='vencida')", tipo: "numero",
        meta: 0, valorActual: accionesVenc, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: accionesVenc === 0 ? "verde" : accionesVenc <= 3 ? "amarillo" : "rojo",
        inverso: true,
        frecuencia: "semanal", responsable: "SSO",
        dashboard: "ejecutivo", visible: true, orden: 63,
      },
      {
        id: "sso_tasa_acciones", nombre: "Efectividad CAPA",
        descripcion: "Porcentaje de acciones correctivas/preventivas cerradas",
        unidad: "%", categoria: "seguridad", grupo: "acciones_capa",
        origen: "sheets", adaptador: "sso", consulta: "ssoAcciones[estado=cerrada]",
        formula: "COUNT(cerradas)/COUNT(total)*100", tipo: "porcentaje",
        meta: 85, valorActual: tasaAcciones, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaAcciones >= 85 ? "verde" : tasaAcciones >= 70 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "SSO",
        dashboard: "ejecutivo", visible: true, orden: 64,
      },
      {
        id: "sso_cumplimiento_legal", nombre: "Cumplimiento Legal SSO",
        descripcion: "Porcentaje de requisitos legales SSO en cumplimiento",
        unidad: "%", categoria: "cumplimiento", grupo: "legal",
        origen: "sheets", adaptador: "sso", consulta: "ssoCumplimiento[estado=cumplido]",
        formula: "COUNT(cumplidos)/COUNT(total)*100", tipo: "porcentaje",
        meta: 95, valorActual: tasaCumpl, valorAnterior: 0,
        variacion: 0, tendencia: "estable",
        semaforo: tasaCumpl >= 95 ? "verde" : tasaCumpl >= 80 ? "amarillo" : "rojo",
        frecuencia: "mensual", responsable: "SSO",
        dashboard: "ejecutivo", visible: true, orden: 65,
      },
    ];
  },
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function bootstrapKPIAdapters_() {
  KPIEngine.register(RRHHKPIAdapter);
  KPIEngine.register(VRAFKPIAdapter);
  KPIEngine.register(ComprasKPIAdapter);
  KPIEngine.register(ContabilidadKPIAdapter);
  KPIEngine.register(MantenimientoKPIAdapter);
  KPIEngine.register(SSOKPIAdapter);
  AppLogger.info("KPIAdapters: all 6 adapters registered");
}
