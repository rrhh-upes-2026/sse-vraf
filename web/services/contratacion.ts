/**
 * Servicio de Reclutamiento, Selección y Contratación — PRO-TH-001
 * Universidad Politécnica de El Salvador (UPES)
 *
 * Patrón mock-first: cuando APPS_SCRIPT_WEB_APP_URL no está definida, todas las
 * operaciones resuelven desde los datos simulados con un retardo de ~200 ms para
 * emular latencia real. En producción, se delega al adaptador HTTP de Apps Script.
 */

import { getAppsScriptClient } from './adapters/getAppsScriptClient';
import type {
  ProcesoContratacion,
  CandidatoCV,
  EtapaContratacion,
  ResultadoDecision,
  RequisicionPersonal,
  InformeTecnicoSeleccion,
  InformeSeleccionFinal,
  CartaOferta,
  ExpedientePersonal,
  FichaEmpleado,
  FichaDocente,
  ContratoTrabajo,
  EventoContratacion,
} from '@/types/contratacion';
import {
  MOCK_PROCESOS,
  MOCK_REQUISICIONES,
  MOCK_INFORMES_TECNICOS,
  MOCK_INFORMES_FINALES,
  MOCK_CARTAS_OFERTA,
  MOCK_EXPEDIENTES,
  MOCK_CONTRATOS,
  MOCK_FICHAS_DOCENTE,
  MOCK_CANDIDATOS,
} from '@/lib/mock-contratacion';

// ── helpers ───────────────────────────────────────────────────────────────────

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

/** Avanza el proceso al siguiente estado lógico según la etapa actual. */
function siguienteEtapa(etapa: EtapaContratacion): EtapaContratacion {
  const flujo: EtapaContratacion[] = [
    'identificacion_necesidad',
    'requisicion',
    'estrategia_reclutamiento',
    'publicacion_vacante',
    'recepcion_cv',
    'entrevista_preliminar',
    'pruebas',
    'entrevista_rrhh',
    'conformacion_terna',
    'entrevista_final',
    'informe_seleccion',
    'validacion_rector',
    'carta_oferta',
    'creacion_expediente',
    'elaboracion_contrato',
    'firma_contrato',
    'comunicacion',
    'vinculacion_induccion',
    'completado',
  ];
  const idx = flujo.indexOf(etapa);
  return idx >= 0 && idx < flujo.length - 1 ? flujo[idx + 1] : 'completado';
}

function pasoDesdEtapa(etapa: EtapaContratacion): number {
  const mapa: Partial<Record<EtapaContratacion, number>> = {
    identificacion_necesidad: 1,
    requisicion: 8,
    estrategia_reclutamiento: 9,
    publicacion_vacante: 10,
    recepcion_cv: 12,
    entrevista_preliminar: 13,
    pruebas: 14,
    entrevista_rrhh: 15,
    conformacion_terna: 16,
    entrevista_final: 17,
    informe_seleccion: 18,
    validacion_rector: 19,
    carta_oferta: 21,
    creacion_expediente: 23,
    elaboracion_contrato: 24,
    firma_contrato: 25,
    comunicacion: 26,
    vinculacion_induccion: 27,
    completado: 27,
  };
  return mapa[etapa] ?? 1;
}

// ── estado mutable en memoria (solo para mock) ────────────────────────────────

// Clonamos en memoria para permitir mutaciones durante la sesión sin tocar los originales.
let _procesos: ProcesoContratacion[] = MOCK_PROCESOS.map((p) => ({
  ...p,
  candidatos: [...p.candidatos],
  terna: [...p.terna],
  opcionesOferta: [...p.opcionesOferta],
  historial: [...p.historial],
}));
let _requisiciones: RequisicionPersonal[] = [...MOCK_REQUISICIONES];
let _informesTecnicos: InformeTecnicoSeleccion[] = [...MOCK_INFORMES_TECNICOS];
let _informesFinales: InformeSeleccionFinal[] = [...MOCK_INFORMES_FINALES];
let _cartasOferta: CartaOferta[] = [...MOCK_CARTAS_OFERTA];
let _expedientes: ExpedientePersonal[] = [...MOCK_EXPEDIENTES];
let _contratos: ContratoTrabajo[] = [...MOCK_CONTRATOS];
let _fichasDocente: FichaDocente[] = [...MOCK_FICHAS_DOCENTE];
let _fichasEmpleado: FichaEmpleado[] = [];
let _candidatos: CandidatoCV[] = [...MOCK_CANDIDATOS];

// ── feature flag ──────────────────────────────────────────────────────────────

const _isLive = typeof process !== 'undefined' && !!process.env.APPS_SCRIPT_WEB_APP_URL;
const _client = () => getAppsScriptClient();

// ── Servicio de Contratación ──────────────────────────────────────────────────

export const ContratacionService = {
  // ── Procesos ────────────────────────────────────────────────────────────────

  /**
   * Lista todos los procesos del workspace, con filtros opcionales por etapa y
   * prioridad. En mock, wsId se ignora (todos los procesos son del workspace rrhh).
   */
  listarProcesos: (
    _wsId: string,
    filtros?: { etapa?: EtapaContratacion; prioridad?: string },
  ): Promise<ProcesoContratacion[]> => {
    if (_isLive) {
      return _client().list<ProcesoContratacion>('procesos', {
        ...(filtros?.etapa && { etapaActual: filtros.etapa }),
        ...(filtros?.prioridad && { prioridad: filtros.prioridad }),
      });
    }
    let resultado = [..._procesos];
    if (filtros?.etapa) resultado = resultado.filter((p) => p.etapaActual === filtros.etapa);
    if (filtros?.prioridad) resultado = resultado.filter((p) => p.prioridad === filtros.prioridad);
    return delay(resultado);
  },

  /**
   * Obtiene un proceso por ID. Retorna null si no existe.
   */
  obtenerProceso: (id: string): Promise<ProcesoContratacion | null> => {
    if (_isLive) return _client().get<ProcesoContratacion>('procesos', id);
    return delay(_procesos.find((p) => p.id === id) ?? null);
  },

  /**
   * Crea un nuevo proceso de contratación en etapa inicial.
   */
  crearProceso: (payload: Partial<ProcesoContratacion>): Promise<ProcesoContratacion> => {
    if (_isLive) return _client().create<ProcesoContratacion>('procesos', payload);
    const ts = now();
    const nuevo: ProcesoContratacion = {
      id: uid('PROC-RH-26'),
      codigo: uid('PROC-RH-26'),
      tipoPuesto: 'plaza_existente',
      nombrePuesto: '',
      unidadFacultad: '',
      jefeSolicitante: '',
      cargoSolicitante: '',
      tipoContratacion: 'permanente',
      etapaActual: 'identificacion_necesidad',
      pasoActual: 1,
      prioridad: 'normal',
      candidatos: [],
      terna: [],
      opcionesOferta: [],
      historial: [
        {
          id: uid('EVT'),
          fecha: ts,
          paso: 1,
          etapa: 'identificacion_necesidad',
          accion: 'Proceso de contratación iniciado',
          responsable: payload.jefeSolicitante ?? 'Sistema',
          resultado: 'ejecutado',
        },
      ],
      createdAt: ts,
      updatedAt: ts,
      ...payload,
    };
    _procesos = [..._procesos, nuevo];
    return delay(nuevo);
  },

  /**
   * Registra una acción sobre el proceso y avanza a la siguiente etapa según
   * el resultado de la decisión. Si el resultado es 'rechazado', el proceso pasa
   * a estado 'rechazado'. Si es 'aprobado', avanza al siguiente paso del flujo.
   */
  avanzarEtapa: (
    id: string,
    accion: { resultado: ResultadoDecision; notas?: string; responsable: string },
  ): Promise<ProcesoContratacion> => {
    if (_isLive) {
      return _client().call<ProcesoContratacion>('procesos.avanzarEtapa', { id, ...accion });
    }
    const idx = _procesos.findIndex((p) => p.id === id);
    if (idx === -1) return Promise.reject(new Error(`Proceso ${id} no encontrado`));

    const proceso = { ..._procesos[idx] };
    const nuevaEtapa: EtapaContratacion =
      accion.resultado === 'rechazado' ? 'rechazado' : siguienteEtapa(proceso.etapaActual);

    const evento: EventoContratacion = {
      id: uid('EVT'),
      fecha: now(),
      paso: proceso.pasoActual,
      etapa: proceso.etapaActual,
      accion: accion.resultado === 'aprobado'
        ? `Etapa "${proceso.etapaActual}" aprobada — avanzando a "${nuevaEtapa}"`
        : accion.resultado === 'rechazado'
        ? `Proceso rechazado en etapa "${proceso.etapaActual}"`
        : `Acción registrada en etapa "${proceso.etapaActual}"`,
      responsable: accion.responsable,
      resultado: accion.resultado,
      notas: accion.notas,
    };

    const actualizado: ProcesoContratacion = {
      ...proceso,
      etapaActual: nuevaEtapa,
      pasoActual: pasoDesdEtapa(nuevaEtapa),
      historial: [...proceso.historial, evento],
      updatedAt: now(),
    };
    _procesos = _procesos.map((p) => (p.id === id ? actualizado : p));
    return delay(actualizado);
  },

  // ── Formulario de Requisición de Personal ───────────────────────────────────

  guardarRequisicion: (
    procesoId: string,
    data: Partial<RequisicionPersonal>,
  ): Promise<RequisicionPersonal> => {
    if (_isLive) {
      const existente = _requisiciones.find((r) => r.procesoId === procesoId);
      return existente
        ? _client().update<RequisicionPersonal>('solicitudes', existente.id, data)
        : _client().create<RequisicionPersonal>('solicitudes', { procesoId, ...data });
    }
    const ts = now();
    const existente = _requisiciones.find((r) => r.procesoId === procesoId);
    if (existente) {
      const actualizada = { ...existente, ...data, updatedAt: ts };
      _requisiciones = _requisiciones.map((r) => (r.procesoId === procesoId ? actualizada : r));
      return delay(actualizada);
    }
    const nueva: RequisicionPersonal = {
      id: uid('REQ-RH-26'),
      procesoId,
      unidadFacultad: '',
      nombreSolicitante: '',
      cargoSolicitante: '',
      fechaSolicitud: ts.slice(0, 10),
      tipoRequisicion: 'cobertura_vacante',
      tipoContratacion: 'permanente',
      nombrePuesto: '',
      areaDepartamento: '',
      ubicacionFisica: '',
      horarioJornada: '',
      escolaridadGradoAcademico: '',
      dominioIdiomas: '',
      manejeSistemas: '',
      experienciaFunciones: '',
      competencias: {
        comprensionVerbalEscrita: false,
        seguimientoProcedimientos: false,
        interpretacionNormativas: false,
        manejoInformacion: false,
        capacidadSintesis: false,
        manejoPersonalGrupos: false,
        tomaDecisionesBajoPresion: false,
        poderPersonal: false,
        negociacionMediacion: false,
        delegacionEfectiva: false,
        facilidadPalabra: false,
        dominioPúblico: false,
        redaccionTecnica: false,
        asertividad: false,
        empatiaServicio: false,
        iniciativaProactividad: false,
        orientacionResultados: false,
        trabajoEquipo: false,
        adaptabilidadCambios: false,
        optimizacionTiempo: false,
        planificacionDidactica: false,
        disenoInstrumentos: false,
        metodologiasInvestigacion: false,
        actualizacionConstante: false,
        eticaProfesional: false,
        dominioOffice365: false,
        inteligenciaArtificial: false,
        baseDatos: false,
        ciberseguridad: false,
        manejoPlatformas: false,
      },
      otrasHabilidades: '',
      firmaSolicita: '',
      firmaAutoriza: '',
      estado: 'borrador',
      createdAt: ts,
      updatedAt: ts,
      ...data,
    };
    _requisiciones = [..._requisiciones, nueva];
    // Vincular al proceso
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, requisicionId: nueva.id, updatedAt: ts } : p,
    );
    return delay(nueva);
  },

  obtenerRequisicion: (procesoId: string): Promise<RequisicionPersonal | null> => {
    if (_isLive) {
      return _client()
        .list<RequisicionPersonal>('solicitudes', { procesoId })
        .then((r) => r[0] ?? null);
    }
    return delay(_requisiciones.find((r) => r.procesoId === procesoId) ?? null);
  },

  // ── Informe Técnico de Selección ────────────────────────────────────────────

  guardarInformeTecnico: (
    procesoId: string,
    data: Partial<InformeTecnicoSeleccion>,
  ): Promise<InformeTecnicoSeleccion> => {
    if (_isLive) {
      const e = _informesTecnicos.find((i) => i.procesoId === procesoId);
      return e
        ? _client().update<InformeTecnicoSeleccion>('historial', e.id, data)
        : _client().create<InformeTecnicoSeleccion>('historial', { procesoId, ...data });
    }
    const ts = now();
    const existente = _informesTecnicos.find((i) => i.procesoId === procesoId);
    if (existente) {
      const actualizado = { ...existente, ...data };
      _informesTecnicos = _informesTecnicos.map((i) => (i.procesoId === procesoId ? actualizado : i));
      return delay(actualizado);
    }
    const proceso = _procesos.find((p) => p.id === procesoId);
    const nuevo: InformeTecnicoSeleccion = {
      id: uid('INF-TEC-RH-26'),
      procesoId,
      cargo: proceso?.nombrePuesto ?? '',
      unidadFacultad: proceso?.unidadFacultad ?? '',
      antecedentes: '',
      objetivoCargo: '',
      terna: ['', '', ''],
      evaluaciones: [
        { nombre: '', sintesisEstrategica: '', formacionAcademica: '', experienciaHabilidades: '', valoracionTecnica: '' },
        { nombre: '', sintesisEstrategica: '', formacionAcademica: '', experienciaHabilidades: '', valoracionTecnica: '' },
        { nombre: '', sintesisEstrategica: '', formacionAcademica: '', experienciaHabilidades: '', valoracionTecnica: '' },
      ],
      matrizComparativa: [],
      conclusion: '',
      recomendacion: '',
      candidatoRecomendado: '',
      firmaJefeRRHH: '',
      fechaInforme: ts.slice(0, 10),
      estado: 'borrador',
      createdAt: ts,
      ...data,
    };
    _informesTecnicos = [..._informesTecnicos, nuevo];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, informeTecnicoId: nuevo.id, updatedAt: ts } : p,
    );
    return delay(nuevo);
  },

  // ── Informe de Selección Final ───────────────────────────────────────────────

  guardarInformeFinal: (
    procesoId: string,
    data: Partial<InformeSeleccionFinal>,
  ): Promise<InformeSeleccionFinal> => {
    if (_isLive) {
      const e = _informesFinales.find((i) => i.procesoId === procesoId);
      return e
        ? _client().update<InformeSeleccionFinal>('historial', e.id, data)
        : _client().create<InformeSeleccionFinal>('historial', { procesoId, ...data });
    }
    const ts = now();
    const existente = _informesFinales.find((i) => i.procesoId === procesoId);
    if (existente) {
      const actualizado = { ...existente, ...data };
      _informesFinales = _informesFinales.map((i) => (i.procesoId === procesoId ? actualizado : i));
      return delay(actualizado);
    }
    const proceso = _procesos.find((p) => p.id === procesoId);
    const nuevo: InformeSeleccionFinal = {
      id: uid('INF-FIN-RH-26'),
      procesoId,
      fechaInforme: ts.slice(0, 10),
      unidadFacultad: proceso?.unidadFacultad ?? '',
      puestoCubrir: proceso?.nombrePuesto ?? '',
      terna: [],
      competenciaTecnica: '',
      alineacionInstitucional: '',
      habilidadesBlandas: '',
      candidatoSeleccionado: '',
      justificacion: '',
      firmaJefeInmediato: proceso?.jefeSolicitante ?? '',
      nombreJefeInmediato: proceso?.cargoSolicitante ?? '',
      vistoBuenoRRHH: '',
      estado: 'borrador',
      createdAt: ts,
      ...data,
    };
    _informesFinales = [..._informesFinales, nuevo];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, informeFinalId: nuevo.id, updatedAt: ts } : p,
    );
    return delay(nuevo);
  },

  // ── Carta Oferta ─────────────────────────────────────────────────────────────

  emitirCartaOferta: (
    procesoId: string,
    data: Partial<CartaOferta>,
  ): Promise<CartaOferta> => {
    if (_isLive) {
      return _client().create<CartaOferta>('formularios', { procesoId, estado: 'emitida', ...data });
    }
    const ts = now();
    const proceso = _procesos.find((p) => p.id === procesoId);
    const nueva: CartaOferta = {
      id: uid('CARTA-RH-26'),
      procesoId,
      candidatoId: data.candidatoId ?? proceso?.candidatoSeleccionadoId ?? '',
      opcion: 1,
      ciudad: 'San Salvador',
      dia: new Date().getDate(),
      mes: new Date().toLocaleString('es-SV', { month: 'long' }),
      anio: new Date().getFullYear(),
      profesionCandidato: '',
      nombreCandidato: '',
      cargoOfrecido: proceso?.nombrePuesto ?? '',
      diaInicio: 1,
      mesInicio: '',
      salarioMensual: 0,
      horario: 'Lunes a viernes, 8:00 a.m. – 5:00 p.m.',
      indemnizacion: true,
      vacaciones: true,
      afp: true,
      isss: true,
      aguinaldo: true,
      formacionContinua: true,
      seguroVida: false,
      desarrolloProfesional: true,
      estado: 'emitida',
      createdAt: ts,
      ...data,
    };
    _cartasOferta = [..._cartasOferta, nueva];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, cartaOfertaId: nueva.id, updatedAt: ts } : p,
    );
    return delay(nueva);
  },

  aceptarCartaOferta: (
    cartaId: string,
    aceptacion: { nombre: string; dui: string },
  ): Promise<CartaOferta> => {
    if (_isLive) {
      return _client().update<CartaOferta>('formularios', cartaId, {
        estado: 'aceptada',
        nombreAceptante: aceptacion.nombre,
        duiAceptante: aceptacion.dui,
        firmaAceptacion: true,
        fechaAceptacion: now().slice(0, 10),
      });
    }
    const carta = _cartasOferta.find((c) => c.id === cartaId);
    if (!carta) return Promise.reject(new Error(`Carta oferta ${cartaId} no encontrada`));
    const actualizada: CartaOferta = {
      ...carta,
      estado: 'aceptada',
      nombreAceptante: aceptacion.nombre,
      duiAceptante: aceptacion.dui,
      firmaAceptacion: true,
      fechaAceptacion: now().slice(0, 10),
    };
    _cartasOferta = _cartasOferta.map((c) => (c.id === cartaId ? actualizada : c));
    return delay(actualizada);
  },

  // ── Expediente de Personal ────────────────────────────────────────────────────

  guardarExpediente: (
    procesoId: string,
    data: Partial<ExpedientePersonal>,
  ): Promise<ExpedientePersonal> => {
    if (_isLive) {
      const e = _expedientes.find((x) => x.procesoId === procesoId);
      return e
        ? _client().update<ExpedientePersonal>('evidencias', e.id, data)
        : _client().create<ExpedientePersonal>('evidencias', { procesoId, ...data });
    }
    const ts = now();
    const existente = _expedientes.find((x) => x.procesoId === procesoId);
    if (existente) {
      const actualizado = { ...existente, ...data, updatedAt: ts };
      _expedientes = _expedientes.map((x) => (x.procesoId === procesoId ? actualizado : x));
      return delay(actualizado);
    }
    const nuevo: ExpedientePersonal = {
      id: uid('EXP-RH-26'),
      procesoId,
      nombreCompleto: '',
      numeroEmpleado: uid('EMP-26'),
      cargo: '',
      unidadDepartamento: '',
      tipoContratacion: 'permanente',
      fechaIngreso: ts.slice(0, 10),
      responsableRevision: '',
      fechaRevision: ts.slice(0, 10),
      documentosPersonales: [],
      documentosAcademicos: [],
      documentosLaborales: [],
      documentosMedicos: [],
      documentosAdministrativos: [],
      estadoExpediente: 'incompleto',
      documentosPendientes: '',
      accionesRequeridas: '',
      firmaRRHH: '',
      firmaColaborador: '',
      createdAt: ts,
      updatedAt: ts,
      ...data,
    };
    _expedientes = [..._expedientes, nuevo];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, expedienteId: nuevo.id, updatedAt: ts } : p,
    );
    return delay(nuevo);
  },

  // ── Ficha de Empleado ─────────────────────────────────────────────────────────

  guardarFichaEmpleado: (
    procesoId: string,
    data: Partial<FichaEmpleado>,
  ): Promise<FichaEmpleado> => {
    if (_isLive) {
      const e = _fichasEmpleado.find((f) => f.procesoId === procesoId);
      return e
        ? _client().update<FichaEmpleado>('usuarios', e.id, data)
        : _client().create<FichaEmpleado>('usuarios', { procesoId, ...data });
    }
    const ts = now();
    const existente = _fichasEmpleado.find((f) => f.procesoId === procesoId);
    if (existente) {
      const actualizada = { ...existente, ...data, updatedAt: ts };
      _fichasEmpleado = _fichasEmpleado.map((f) => (f.procesoId === procesoId ? actualizada : f));
      return delay(actualizada);
    }
    const nueva: FichaEmpleado = {
      id: uid('FICHA-EMP-RH-26'),
      procesoId,
      cargo: '',
      area: '',
      unidad: '',
      nivelFuncionalMOF: '',
      primerApellido: '',
      segundoApellido: '',
      nombres: '',
      estadoFamiliar: '',
      cantidadHijos: 0,
      lugarNacimiento: '',
      telCelular: '',
      noDUI: '',
      noNIT: '',
      fechaNacimiento: '',
      nacionalidad: 'Salvadoreña',
      direccionResidencia: '',
      fechaIngreso: ts.slice(0, 10),
      tipoContrato: 'permanente',
      salario: 0,
      correoPersonal: '',
      afpNUP: '',
      correoInstitucional: '',
      noISSS: '',
      telefonoOficina: '',
      noExpediente: '',
      telefonoCasa: '',
      medicamentos: 'Ninguno',
      discapacidad: false,
      alergico: false,
      contactoEmergencia: '',
      parentescoEmergencia: '',
      telefonoEmergencia: '',
      dependientes: [],
      experienciaLaboral: [],
      formacionAcademica: [],
      idiomas: [],
      experienciaUPES: [],
      createdAt: ts,
      updatedAt: ts,
      ...data,
    };
    _fichasEmpleado = [..._fichasEmpleado, nueva];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, fichaEmpleadoId: nueva.id, updatedAt: ts } : p,
    );
    return delay(nueva);
  },

  // ── Ficha de Docente Hora Clase ───────────────────────────────────────────────

  guardarFichaDocente: (
    procesoId: string,
    data: Partial<FichaDocente>,
  ): Promise<FichaDocente> => {
    if (_isLive) {
      const e = _fichasDocente.find((f) => f.procesoId === procesoId);
      return e
        ? _client().update<FichaDocente>('usuarios', e.id, data)
        : _client().create<FichaDocente>('usuarios', { procesoId, ...data });
    }
    const ts = now();
    const existente = _fichasDocente.find((f) => f.procesoId === procesoId);
    if (existente) {
      const actualizada = { ...existente, ...data };
      _fichasDocente = _fichasDocente.map((f) => (f.procesoId === procesoId ? actualizada : f));
      return delay(actualizada);
    }
    const nueva: FichaDocente = {
      id: uid('FICHA-DOC-RH-26'),
      procesoId,
      nombre: '',
      domicilio: '',
      telefono: '',
      correoPersonal: '',
      noDUI: '',
      noNIT: '',
      requeridoSujetoExcluido: false,
      lugarFechaNacimiento: '',
      fechaIngreso: ts.slice(0, 10),
      correoUPES: '',
      cuentaDavivienda: '',
      numeroCuenta: '',
      nacionalidad: 'Salvadoreña',
      facultad: '',
      carrera: '',
      nombreEmergencia: '',
      parentescoEmergencia: '',
      telefonoEmergencia: '',
      formacion: [],
      experienciaDocente: [],
      experienciaLaboral: [],
      idiomas: [],
      gremiales: [],
      referencias: [],
      createdAt: ts,
      ...data,
    };
    _fichasDocente = [..._fichasDocente, nueva];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, fichaEmpleadoId: nueva.id, updatedAt: ts } : p,
    );
    return delay(nueva);
  },

  // ── Contrato de Trabajo ───────────────────────────────────────────────────────

  generarContrato: (
    procesoId: string,
    data: Partial<ContratoTrabajo>,
  ): Promise<ContratoTrabajo> => {
    if (_isLive) {
      const e = _contratos.find((c) => c.procesoId === procesoId);
      return e
        ? _client().update<ContratoTrabajo>('formularios', e.id, data)
        : _client().create<ContratoTrabajo>('formularios', { procesoId, ...data });
    }
    const ts = now();
    const existente = _contratos.find((c) => c.procesoId === procesoId);
    if (existente) {
      const actualizado = { ...existente, ...data };
      _contratos = _contratos.map((c) => (c.procesoId === procesoId ? actualizado : c));
      return delay(actualizado);
    }
    const nuevo: ContratoTrabajo = {
      id: uid('CONT-RH-26'),
      procesoId,
      nombreEmpleado: '',
      profesionSegunDUI: '',
      estadoCivil: '',
      distrito: 'San Salvador',
      municipio: 'San Salvador',
      departamento: 'San Salvador',
      duiParaContrato: '',
      cargo: '',
      salarioEnLetras: '',
      salario: 0,
      personasQueDependen: 'ninguna',
      fechaInicioContrato: 'uno de agosto',
      fechaFinContrato: 'treinta y uno de diciembre del año dos mil veintiséis',
      anioContrato: new Date().getFullYear(),
      fechaElaboracion: ts.slice(0, 10),
      firmadoPorEmpleado: false,
      firmadoPorRector: false,
      estado: 'borrador',
      createdAt: ts,
      ...data,
    };
    _contratos = [..._contratos, nuevo];
    _procesos = _procesos.map((p) =>
      p.id === procesoId ? { ...p, contratoId: nuevo.id, updatedAt: ts } : p,
    );
    return delay(nuevo);
  },

  // ── Candidatos ────────────────────────────────────────────────────────────────

  /**
   * Agrega un candidato al proceso y lo vincula en el array interno del proceso.
   */
  agregarCandidato: (
    procesoId: string,
    cv: Partial<CandidatoCV>,
  ): Promise<CandidatoCV> => {
    if (_isLive) {
      return _client().create<CandidatoCV>('evidencias', { procesoId, ...cv });
    }
    const ts = now();
    const nuevo: CandidatoCV = {
      id: uid('CAND-RH-26'),
      procesoId,
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      titulo: '',
      experienciaAnios: 0,
      cumplePerfilCV: null,
      enTerna: false,
      seleccionado: false,
      rechazado: false,
      createdAt: ts,
      ...cv,
    };
    _candidatos = [..._candidatos, nuevo];
    _procesos = _procesos.map((p) =>
      p.id === procesoId
        ? { ...p, candidatos: [...p.candidatos, nuevo], updatedAt: ts }
        : p,
    );
    return delay(nuevo);
  },

  /**
   * Actualiza los campos de evaluación de un candidato y recalcula el promedio
   * general a partir de las notas disponibles.
   */
  evaluarCandidato: (
    candidatoId: string,
    evaluacion: Partial<CandidatoCV>,
  ): Promise<CandidatoCV> => {
    if (_isLive) {
      return _client().update<CandidatoCV>('evidencias', candidatoId, evaluacion);
    }
    const candidato = _candidatos.find((c) => c.id === candidatoId);
    if (!candidato) return Promise.reject(new Error(`Candidato ${candidatoId} no encontrado`));

    const merged: CandidatoCV = { ...candidato, ...evaluacion };

    // Recalcular promedio con las notas disponibles
    const notas = [
      merged.notaEntrevistaPrelimininar,
      merged.notaPruebaTecnica,
      merged.notaPruebaConductual,
      merged.notaEntrevistaRRHH,
      merged.notaEntrevistaFinal,
    ].filter((n): n is number => typeof n === 'number');

    if (notas.length > 0) {
      merged.promedioGeneral = Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10;
    }

    _candidatos = _candidatos.map((c) => (c.id === candidatoId ? merged : c));

    // Sincronizar dentro del array embebido del proceso
    _procesos = _procesos.map((p) =>
      p.id === merged.procesoId
        ? {
            ...p,
            candidatos: p.candidatos.map((c) => (c.id === candidatoId ? merged : c)),
            updatedAt: now(),
          }
        : p,
    );

    return delay(merged);
  },
};
