/**
 * WorkspaceTemplateInstaller — seed RRHH (and future) module templates.
 *
 * All writes use createEntity_() so IdGen.forEntity() assigns proper prefixed
 * IDs (BP-26-XXXXXX, KPI-26-XXXXXX, etc.).  The installer is idempotent:
 * it checks for an existing RRHH blueprint before seeding — if any RRHH
 * blueprint exists, the whole install is skipped to prevent duplicates.
 */

var WorkspaceTemplateInstaller = (function () {

  function now_() { return new Date().toISOString(); }

  // ── Internal check ────────────────────────────────────────────────────────

  function isRRHHInstalled_() {
    try {
      var result = listEntities_('wsBlueprints', { wsId: 'rrhh' });
      return result && result.items && result.items.length > 0;
    } catch (_) {
      return false;
    }
  }

  // ── Blueprints (Processes) ────────────────────────────────────────────────

  function installBlueprints_(userId) {
    var defs = [
      {
        nombre:       'Reclutamiento y Selección de Personal',
        descripcion:  'Proceso para identificar, atraer y seleccionar candidatos idóneos para cubrir vacantes institucionales.',
        tipo:         'misional',
        objetivo:     'Incorporar talento humano calificado alineado a los requerimientos institucionales.',
        alcance:      'Desde la publicación de la vacante hasta la aceptación de la oferta laboral.',
        responsableRol: 'HEAD',
        slaDias:      30,
        prioridad:    'alta',
        frecuencia:   'puntual',
      },
      {
        nombre:       'Inducción y Onboarding',
        descripcion:  'Proceso de integración del nuevo colaborador a la institución, cultura y funciones del cargo.',
        tipo:         'apoyo',
        objetivo:     'Acelerar la productividad y adaptación del nuevo empleado.',
        alcance:      'Desde la firma del contrato hasta la finalización del período de prueba.',
        responsableRol: 'HEAD',
        slaDias:      15,
        prioridad:    'alta',
        frecuencia:   'puntual',
      },
      {
        nombre:       'Evaluación de Desempeño',
        descripcion:  'Proceso periódico de evaluación del cumplimiento de metas y competencias del personal.',
        tipo:         'control',
        objetivo:     'Medir el desempeño individual y apoyar el desarrollo profesional.',
        alcance:      'Todo el personal activo de la institución.',
        responsableRol: 'HEAD',
        slaDias:      20,
        prioridad:    'alta',
        frecuencia:   'semestral',
      },
      {
        nombre:       'Capacitación y Desarrollo',
        descripcion:  'Proceso de planificación, ejecución y evaluación de programas de formación del personal.',
        tipo:         'apoyo',
        objetivo:     'Fortalecer las competencias del talento humano para mejorar el desempeño institucional.',
        alcance:      'Personal identificado con brechas de competencia o requerimientos de actualización.',
        responsableRol: 'HEAD',
        slaDias:      10,
        prioridad:    'media',
        frecuencia:   'trimestral',
      },
      {
        nombre:       'Gestión de Nómina',
        descripcion:  'Proceso de cálculo, validación y pago de salarios, beneficios y deducciones del personal.',
        tipo:         'apoyo',
        objetivo:     'Garantizar el pago oportuno y preciso de la compensación del personal.',
        alcance:      'Todo el personal activo y jubilados con beneficio activo.',
        responsableRol: 'ANALYST',
        slaDias:      5,
        prioridad:    'alta',
        frecuencia:   'mensual',
      },
      {
        nombre:       'Control de Asistencia y Permisos',
        descripcion:  'Proceso de registro, validación y gestión de asistencia, permisos y ausencias del personal.',
        tipo:         'control',
        objetivo:     'Garantizar el cumplimiento de jornadas laborales y gestionar eficientemente los permisos.',
        alcance:      'Todo el personal activo de la institución.',
        responsableRol: 'ANALYST',
        slaDias:      3,
        prioridad:    'media',
        frecuencia:   'diaria',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsBlueprints', {
        wsId:          'rrhh',
        nombre:        d.nombre,
        descripcion:   d.descripcion,
        tipo:          d.tipo,
        objetivo:      d.objetivo,
        alcance:       d.alcance,
        responsableRol: d.responsableRol,
        slaDias:       String(d.slaDias),
        prioridad:     d.prioridad,
        frecuencia:    d.frecuencia,
        lifecycle:     'published',
        version:       '1.0',
        createdBy:     userId,
        createdAt:     now_(),
        updatedAt:     now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────

  function installKPIs_(userId) {
    var defs = [
      {
        nombre:     'Índice de Rotación de Personal',
        descripcion:'Porcentaje de empleados que abandonan la organización en un período dado.',
        formula:    '(Bajas / Promedio empleados) × 100',
        unidad:     '%',
        frecuencia: 'mensual',
        metaValor:  '5',
        semaforo:   { verde: '0-5', amarillo: '5-10', rojo: '>10' },
      },
      {
        nombre:     'Tasa de Ausentismo',
        descripcion:'Porcentaje de horas no trabajadas respecto al total de horas programadas.',
        formula:    '(Horas ausentes / Horas programadas) × 100',
        unidad:     '%',
        frecuencia: 'mensual',
        metaValor:  '3',
        semaforo:   { verde: '0-3', amarillo: '3-6', rojo: '>6' },
      },
      {
        nombre:     'Tiempo Promedio de Reclutamiento',
        descripcion:'Días promedio desde la apertura de la vacante hasta la contratación.',
        formula:    'Suma(días por vacante) / Número de contrataciones',
        unidad:     'días',
        frecuencia: 'trimestral',
        metaValor:  '25',
        semaforo:   { verde: '<25', amarillo: '25-40', rojo: '>40' },
      },
      {
        nombre:     'Costo por Contratación',
        descripcion:'Costo promedio incurrido en el proceso de reclutamiento y selección.',
        formula:    'Costos totales reclutamiento / Número de contrataciones',
        unidad:     'USD',
        frecuencia: 'trimestral',
        metaValor:  '500',
        semaforo:   { verde: '<500', amarillo: '500-800', rojo: '>800' },
      },
      {
        nombre:     'Satisfacción del Empleado (eNPS)',
        descripcion:'Índice de satisfacción y lealtad del empleado hacia la institución.',
        formula:    '% promotores - % detractores',
        unidad:     'puntos',
        frecuencia: 'semestral',
        metaValor:  '30',
        semaforo:   { verde: '>30', amarillo: '0-30', rojo: '<0' },
      },
      {
        nombre:     'Cobertura de Capacitación',
        descripcion:'Porcentaje del personal que completó al menos una capacitación en el período.',
        formula:    '(Empleados capacitados / Total empleados) × 100',
        unidad:     '%',
        frecuencia: 'trimestral',
        metaValor:  '80',
        semaforo:   { verde: '>80', amarillo: '60-80', rojo: '<60' },
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsKPIs', {
        wsId:          'rrhh',
        nombre:        d.nombre,
        descripcion:   d.descripcion,
        formula:       d.formula,
        unidad:        d.unidad,
        frecuencia:    d.frecuencia,
        metaValor:     d.metaValor,
        valorActual:   '0',
        semaforo:      JSON.stringify(d.semaforo),
        semaforoActual:'verde',
        lifecycle:     'published',
        createdBy:     userId,
        createdAt:     now_(),
        updatedAt:     now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Forms ─────────────────────────────────────────────────────────────────

  function installForms_(userId) {
    var defs = [
      {
        nombre:      'Solicitud de Empleo',
        descripcion: 'Formulario de aplicación para candidatos a puestos vacantes.',
        campos:      ['nombre', 'apellido', 'email', 'telefono', 'cargo_solicitado', 'experiencia', 'cv_url'],
      },
      {
        nombre:      'Evaluación de Desempeño 360°',
        descripcion: 'Formulario de evaluación de competencias y resultados del período.',
        campos:      ['empleado_id', 'evaluador_id', 'periodo', 'competencias', 'metas', 'comentarios'],
      },
      {
        nombre:      'Solicitud de Permiso',
        descripcion: 'Solicitud formal de permiso o ausencia laboral.',
        campos:      ['empleado_id', 'tipo_permiso', 'fecha_inicio', 'fecha_fin', 'motivo', 'respaldo'],
      },
      {
        nombre:      'Reporte de Incidente Laboral',
        descripcion: 'Registro de incidentes, accidentes o situaciones de riesgo en el trabajo.',
        campos:      ['empleado_id', 'fecha', 'lugar', 'descripcion', 'testigos', 'medidas_tomadas'],
      },
      {
        nombre:      'Plan Individual de Desarrollo',
        descripcion: 'Plan de crecimiento profesional y formación personalizado por empleado.',
        campos:      ['empleado_id', 'fortalezas', 'areas_mejora', 'actividades', 'fechas', 'responsable'],
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsForms', {
        wsId:        'rrhh',
        nombre:      d.nombre,
        descripcion: d.descripcion,
        campos:      JSON.stringify(d.campos),
        lifecycle:   'published',
        version:     '1.0',
        createdBy:   userId,
        createdAt:   now_(),
        updatedAt:   now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Request Types ──────────────────────────────────────────────────────────

  function installRequestTypes_(userId) {
    var defs = [
      {
        nombre:       'Solicitud de Vacaciones',
        descripcion:  'Solicitud formal de días de vacaciones anuales del empleado.',
        slaDias:      3,
        aprobadores:  'HEAD',
        formulario:   'Solicitud de Permiso',
        notificar:    'empleado,head,rrhh',
      },
      {
        nombre:       'Solicitud de Permiso Personal',
        descripcion:  'Permiso de ausencia por razones personales o familiares.',
        slaDias:      1,
        aprobadores:  'HEAD',
        formulario:   'Solicitud de Permiso',
        notificar:    'empleado,head',
      },
      {
        nombre:       'Solicitud de Certificado Laboral',
        descripcion:  'Emisión de constancia o certificado de trabajo.',
        slaDias:      5,
        aprobadores:  'ANALYST',
        formulario:   'Solicitud de Empleo',
        notificar:    'empleado',
      },
      {
        nombre:       'Solicitud de Actualización de Datos',
        descripcion:  'Modificación de información personal o laboral del empleado.',
        slaDias:      5,
        aprobadores:  'ANALYST',
        formulario:   'Solicitud de Permiso',
        notificar:    'empleado,rrhh',
      },
      {
        nombre:       'Solicitud de Capacitación',
        descripcion:  'Inscripción a programa de formación o capacitación.',
        slaDias:      7,
        aprobadores:  'HEAD',
        formulario:   'Plan Individual de Desarrollo',
        notificar:    'empleado,head,rrhh',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsRequestTypes', {
        wsId:        'rrhh',
        nombre:      d.nombre,
        descripcion: d.descripcion,
        slaDias:     String(d.slaDias),
        aprobadores: d.aprobadores,
        formulario:  d.formulario,
        notificar:   d.notificar,
        lifecycle:   'published',
        activo:      'true',
        createdBy:   userId,
        createdAt:   now_(),
        updatedAt:   now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Automations ───────────────────────────────────────────────────────────

  function installAutomations_(userId) {
    var defs = [
      {
        nombre:      'Alerta de Vencimiento de Contrato',
        descripcion: 'Notifica 30 días antes del vencimiento del contrato de un empleado.',
        trigger:     'schedule.daily',
        condicion:   'empleado.fechaFinContrato <= hoy + 30',
        accion:      'notificar [HEAD, RRHH] con mensaje de alerta',
        activo:      'true',
      },
      {
        nombre:      'Bienvenida a Nuevo Empleado',
        descripcion: 'Envía mensaje de bienvenida cuando se activa un nuevo empleado.',
        trigger:     'empleado.created',
        condicion:   'empleado.activo == true',
        accion:      'notificar [empleado] con plantilla de bienvenida',
        activo:      'true',
      },
      {
        nombre:      'Recordatorio de Evaluación de Desempeño',
        descripcion: 'Recuerda al supervisor completar la evaluación del período.',
        trigger:     'schedule.monthly.last5days',
        condicion:   'evaluacion.pendiente == true',
        accion:      'notificar [HEAD] con enlace a formulario de evaluación',
        activo:      'true',
      },
      {
        nombre:      'Alerta de Ausentismo Elevado',
        descripcion: 'Notifica cuando la tasa de ausentismo supera el 6%.',
        trigger:     'kpi.semaforo.changed',
        condicion:   'kpi.nombre == "Tasa de Ausentismo" AND kpi.semaforo == "rojo"',
        accion:      'notificar [HEAD, ADMIN] con reporte de ausentismo',
        activo:      'true',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsAutomations', {
        wsId:          'rrhh',
        nombre:        d.nombre,
        descripcion:   d.descripcion,
        trigger:       d.trigger,
        condicion:     d.condicion,
        accion:        d.accion,
        lifecycle:     'published',
        activo:        d.activo,
        executionCount: '0',
        lastStatus:    '',
        createdBy:     userId,
        createdAt:     now_(),
        updatedAt:     now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Notification Rules ────────────────────────────────────────────────────

  function installNotifRules_(userId) {
    var defs = [
      {
        nombre:       'Notificar Solicitud Recibida',
        descripcion:  'Confirma al solicitante que su solicitud fue recibida.',
        evento:       'solicitud.created',
        plantilla:    'Tu solicitud {{nombre}} fue recibida con número {{id}}. Te notificaremos el resultado.',
        roles:        'OPS',
        canal:        'inApp,email',
        activo:       'true',
      },
      {
        nombre:       'Notificar Aprobación de Solicitud',
        descripcion:  'Informa al empleado que su solicitud fue aprobada.',
        evento:       'solicitud.aprobada',
        plantilla:    'Tu solicitud {{nombre}} fue aprobada. {{comentarios}}',
        roles:        'OPS',
        canal:        'inApp,email',
        activo:       'true',
      },
      {
        nombre:       'Notificar Rechazo de Solicitud',
        descripcion:  'Informa al empleado que su solicitud fue rechazada con motivo.',
        evento:       'solicitud.rechazada',
        plantilla:    'Tu solicitud {{nombre}} fue rechazada. Motivo: {{motivo}}',
        roles:        'OPS',
        canal:        'inApp',
        activo:       'true',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsNotifRules', {
        wsId:        'rrhh',
        nombre:      d.nombre,
        descripcion: d.descripcion,
        evento:      d.evento,
        plantilla:   d.plantilla,
        roles:       d.roles,
        canal:       d.canal,
        lifecycle:   'published',
        activo:      d.activo,
        createdBy:   userId,
        createdAt:   now_(),
        updatedAt:   now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Install the full RRHH module seed data.
   * Idempotent — skips if any RRHH blueprint already exists.
   *
   * @param {string} userId
   * @returns {{
   *   skipped: boolean,
   *   blueprints: number,
   *   kpis: number,
   *   forms: number,
   *   requestTypes: number,
   *   automations: number,
   *   notifRules: number,
   *   logs: Array
   * }}
   */
  function installRRHH(userId) {
    var logs = [];

    function log_(level, message) {
      logs.push({ level: level, message: message, timestamp: new Date().toISOString() });
      AppLogger[level === 'error' ? 'error' : 'info']('WorkspaceTemplateInstaller', { message: message });
    }

    if (isRRHHInstalled_()) {
      log_('info', 'Módulo RRHH ya instalado — saltando instalación');
      return { skipped: true, blueprints: 0, kpis: 0, forms: 0, requestTypes: 0, automations: 0, notifRules: 0, logs: logs };
    }

    log_('info', 'Instalando procesos RRHH...');
    var bpIds = installBlueprints_(userId);
    log_('success', bpIds.length + ' procesos instalados');

    log_('info', 'Instalando indicadores KPI...');
    var kpiIds = installKPIs_(userId);
    log_('success', kpiIds.length + ' indicadores instalados');

    log_('info', 'Instalando formularios...');
    var formIds = installForms_(userId);
    log_('success', formIds.length + ' formularios instalados');

    log_('info', 'Instalando tipos de solicitud...');
    var rtIds = installRequestTypes_(userId);
    log_('success', rtIds.length + ' tipos de solicitud instalados');

    log_('info', 'Instalando automatizaciones...');
    var autoIds = installAutomations_(userId);
    log_('success', autoIds.length + ' automatizaciones instaladas');

    log_('info', 'Instalando reglas de notificación...');
    var nrIds = installNotifRules_(userId);
    log_('success', nrIds.length + ' reglas de notificación instaladas');

    log_('success',
      'Módulo RRHH instalado: ' +
      bpIds.length + ' procesos, ' +
      kpiIds.length + ' KPIs, ' +
      formIds.length + ' formularios, ' +
      rtIds.length + ' tipos de solicitud, ' +
      autoIds.length + ' automatizaciones, ' +
      nrIds.length + ' reglas'
    );

    return {
      skipped:      false,
      blueprints:   bpIds.length,
      kpis:         kpiIds.length,
      forms:        formIds.length,
      requestTypes: rtIds.length,
      automations:  autoIds.length,
      notifRules:   nrIds.length,
      logs:         logs,
    };
  }

  return { installRRHH: installRRHH };

})();
