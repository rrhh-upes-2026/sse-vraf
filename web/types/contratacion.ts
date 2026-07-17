/**
 * Tipos para el Procedimiento de Reclutamiento, Selección y Contratación
 * PRO-TH-001 — Universidad Politécnica de El Salvador (UPES)
 *
 * 27 pasos, 9 documentos institucionales.
 */

// ── Ciclo de vida del proceso ─────────────────────────────────────────────────

export type EtapaContratacion =
  | 'identificacion_necesidad'  // pasos 1-7
  | 'requisicion'               // paso 8
  | 'estrategia_reclutamiento'  // paso 9
  | 'publicacion_vacante'       // pasos 10-11
  | 'recepcion_cv'              // paso 12
  | 'entrevista_preliminar'     // paso 13
  | 'pruebas'                   // paso 14
  | 'entrevista_rrhh'           // paso 15
  | 'conformacion_terna'        // paso 16
  | 'entrevista_final'          // paso 17
  | 'informe_seleccion'         // paso 18
  | 'validacion_rector'         // pasos 19-20
  | 'carta_oferta'              // pasos 21-22
  | 'creacion_expediente'       // paso 23
  | 'elaboracion_contrato'      // paso 24
  | 'firma_contrato'            // paso 25
  | 'comunicacion'              // paso 26
  | 'vinculacion_induccion'     // paso 27
  | 'completado'
  | 'rechazado'
  | 'suspendido';

export type TipoContratacion = 'permanente' | 'interino' | 'eventual';
export type TipoPlaza = 'nueva_plaza' | 'plaza_existente';
export type MotivoVacante =
  | 'retiro_voluntario'
  | 'terminacion_contrato'
  | 'cancelacion_contrato'
  | 'promocion_traslado'
  | 'permiso_licencia'
  | 'incapacidad_enfermedad'
  | 'incapacidad_maternidad'
  | 'otro';

export type EstrategiaReclutamiento = 'interna' | 'externa' | 'outsourcing';
export type ResultadoDecision = 'aprobado' | 'rechazado' | 'pendiente';

// ── Evento del historial ──────────────────────────────────────────────────────

export interface EventoContratacion {
  id: string;
  fecha: string;
  paso: number;
  etapa: EtapaContratacion;
  accion: string;
  responsable: string;
  resultado: ResultadoDecision | 'ejecutado';
  notas?: string;
}

// ── Proceso principal ─────────────────────────────────────────────────────────

export interface ProcesoContratacion {
  id: string;
  codigo: string; // e.g. "PROC-RH-26-001"
  tipoPuesto: TipoPlaza;
  nombrePuesto: string;
  unidadFacultad: string;
  jefeSolicitante: string;
  cargoSolicitante: string;
  tipoContratacion: TipoContratacion;
  motivoVacante?: MotivoVacante;
  motivoVacanteOtro?: string;
  etapaActual: EtapaContratacion;
  pasoActual: number;
  estrategiaReclutamiento?: EstrategiaReclutamiento;
  prioridad: 'urgente' | 'normal';
  // IDs de documentos vinculados
  requisicionId?: string;
  informeTecnicoId?: string;
  informeFinalId?: string;
  cartaOfertaId?: string;
  expedienteId?: string;
  contratoId?: string;
  fichaEmpleadoId?: string;
  // Candidatos
  candidatos: CandidatoCV[];
  terna: string[]; // IDs de candidatos seleccionados para terna
  candidatoSeleccionadoId?: string;
  opcionesOferta: string[]; // IDs ordenados para oferta (1.ª, 2.ª, 3.ª opción)
  ofertaAceptadaPor?: string;
  // Auditoría
  historial: EventoContratacion[];
  createdAt: string;
  updatedAt: string;
}

// ── Documento: Candidato / Hoja de Vida ──────────────────────────────────────

export interface CandidatoCV {
  id: string;
  procesoId: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  titulo: string;
  experienciaAnios: number;
  cvUrl?: string;
  // Evaluación
  cumplePerfilCV: boolean | null; // null = no evaluado aún
  notaEntrevistaPrelimininar?: number; // 0-100
  notaPruebaTecnica?: number;
  notaPruebaConductual?: number;
  notaEntrevistaRRHH?: number;
  notaEntrevistaFinal?: number;
  promedioGeneral?: number;
  enTerna: boolean;
  seleccionado: boolean;
  rechazado: boolean;
  motivoRechazo?: string;
  createdAt: string;
}

// ── Documento 01: Formulario de Requisición de Personal ──────────────────────

export interface HabilidadRequisicion {
  nombre: string;
  requerida: boolean;
}

export interface MatrizCompetencias {
  // Análisis y Pensamiento Crítico
  comprensionVerbalEscrita: boolean;
  seguimientoProcedimientos: boolean;
  interpretacionNormativas: boolean;
  manejoInformacion: boolean;
  capacidadSintesis: boolean;
  // Liderazgo y Gestión
  manejoPersonalGrupos: boolean;
  tomaDecisionesBajoPresion: boolean;
  poderPersonal: boolean;
  negociacionMediacion: boolean;
  delegacionEfectiva: boolean;
  // Comunicación
  facilidadPalabra: boolean;
  dominioPúblico: boolean;
  redaccionTecnica: boolean;
  asertividad: boolean;
  empatiaServicio: boolean;
  // Planeación y Organización
  iniciativaProactividad: boolean;
  orientacionResultados: boolean;
  trabajoEquipo: boolean;
  adaptabilidadCambios: boolean;
  optimizacionTiempo: boolean;
  // Competencias Académicas
  planificacionDidactica: boolean;
  disenoInstrumentos: boolean;
  metodologiasInvestigacion: boolean;
  actualizacionConstante: boolean;
  eticaProfesional: boolean;
  // Competencias Digitales
  dominioOffice365: boolean;
  inteligenciaArtificial: boolean;
  baseDatos: boolean;
  ciberseguridad: boolean;
  manejoPlatformas: boolean;
}

export interface RequisicionPersonal {
  id: string;
  procesoId: string;
  // I. Datos del Área Solicitante
  unidadFacultad: string;
  nombreSolicitante: string;
  cargoSolicitante: string;
  fechaSolicitud: string;
  // II. Especificaciones de la Requisición
  tipoRequisicion: 'nueva_plaza' | 'cobertura_vacante';
  tipoContratacion: TipoContratacion;
  motivoVacante?: MotivoVacante;
  motivoVacanteOtro?: string;
  // III. Definición del Puesto
  nombrePuesto: string;
  areaDepartamento: string;
  ubicacionFisica: string;
  horarioJornada: string;
  // IV. Perfil Requerido
  escolaridadGradoAcademico: string;
  dominioIdiomas: string;
  manejeSistemas: string;
  experienciaFunciones: string;
  competencias: MatrizCompetencias;
  otrasHabilidades: string;
  // V. Firmas
  firmaSolicita: string;
  firmaAutoriza: string;
  fechaRecibidoRRHH?: string;
  periodoDesde?: string;
  periodoHasta?: string;
  notaRRHH?: string;
  // Estado
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada';
  createdAt: string;
  updatedAt: string;
}

// ── Documento 02: Informe Técnico de Selección ───────────────────────────────

export interface EvaluacionCriterio {
  criterio: string;
  candidato1: string;
  candidato2: string;
  candidato3: string;
}

export interface EvaluacionCandidatoTecnica {
  nombre: string;
  sintesisEstrategica: string;
  formacionAcademica: string;
  experienciaHabilidades: string;
  valoracionTecnica: string;
}

export interface InformeTecnicoSeleccion {
  id: string;
  procesoId: string;
  cargo: string;
  unidadFacultad: string;
  // 1. Antecedentes
  antecedentes: string;
  // 2. Objetivo del Cargo
  objetivoCargo: string;
  // 3. Terna
  terna: [string, string, string]; // nombres de los 3 candidatos
  // 4. Evaluación Integral
  evaluaciones: [EvaluacionCandidatoTecnica, EvaluacionCandidatoTecnica, EvaluacionCandidatoTecnica];
  // 5. Análisis Comparativo — matriz
  matrizComparativa: EvaluacionCriterio[];
  // 6. Conclusión
  conclusion: string;
  // 7. Recomendación
  recomendacion: string;
  candidatoRecomendado: string;
  // Firma
  firmaJefeRRHH: string;
  fechaInforme: string;
  estado: 'borrador' | 'emitido';
  createdAt: string;
}

// ── Documento 03: Informe de Selección Final ─────────────────────────────────

export interface PuntajeCandidato {
  nombre: string;
  puntajePromedio: number;
  resultadoGlobal: string;
}

export interface InformeSeleccionFinal {
  id: string;
  procesoId: string;
  // 1. Datos Generales
  fechaInforme: string;
  unidadFacultad: string;
  puestoCubrir: string;
  // 2. Terna
  terna: PuntajeCandidato[];
  // 3. Análisis
  competenciaTecnica: string;
  alineacionInstitucional: string;
  habilidadesBlandas: string;
  // 4. Candidato Seleccionado
  candidatoSeleccionado: string;
  // 5. Justificación
  justificacion: string;
  // Firmas
  firmaJefeInmediato: string;
  nombreJefeInmediato: string;
  vistoBuenoRRHH: string;
  estado: 'borrador' | 'emitido';
  createdAt: string;
}

// ── Documento 05: Carta Oferta ────────────────────────────────────────────────

export interface CartaOferta {
  id: string;
  procesoId: string;
  candidatoId: string;
  opcion: 1 | 2 | 3;
  // Datos
  ciudad: string;
  dia: number;
  mes: string;
  anio: number;
  profesionCandidato: string;
  nombreCandidato: string;
  cargoOfrecido: string;
  diaInicio: number;
  mesInicio: string;
  // Condiciones
  salarioMensual: number;
  horario: string;
  // Beneficios de Ley
  indemnizacion: boolean;
  vacaciones: boolean;
  afp: boolean;
  isss: boolean;
  aguinaldo: boolean;
  // Beneficios institucionales
  formacionContinua: boolean;
  seguroVida: boolean;
  desarrolloProfesional: boolean;
  // Aceptación
  nombreAceptante?: string;
  duiAceptante?: string;
  firmaAceptacion?: boolean;
  fechaAceptacion?: string;
  estado: 'emitida' | 'aceptada' | 'rechazada';
  createdAt: string;
}

// ── Documento 04: Lista de Verificación de Expediente ────────────────────────

export interface ItemVerificacion {
  numero: number;
  documento: string;
  presenta: boolean | null;
  vigente: boolean | null;
}

export interface ExpedientePersonal {
  id: string;
  procesoId: string;
  empleadoId?: string;
  // Información General
  nombreCompleto: string;
  numeroEmpleado: string;
  cargo: string;
  unidadDepartamento: string;
  tipoContratacion: TipoContratacion;
  fechaIngreso: string;
  responsableRevision: string;
  fechaRevision: string;
  // II. Documentos Personales (10 ítems)
  documentosPersonales: ItemVerificacion[];
  // III. Documentos Académicos (5 ítems)
  documentosAcademicos: ItemVerificacion[];
  // IV. Documentos Laborales (10 ítems)
  documentosLaborales: ItemVerificacion[];
  // V. Documentos Médicos (4 ítems)
  documentosMedicos: ItemVerificacion[];
  // VI. Documentos Administrativos (4 ítems)
  documentosAdministrativos: ItemVerificacion[];
  // VII. Resultado
  estadoExpediente: 'completo' | 'completo_con_observaciones' | 'incompleto';
  documentosPendientes: string;
  accionesRequeridas: string;
  // VIII. Firmas
  firmaRRHH: string;
  firmaColaborador: string;
  createdAt: string;
  updatedAt: string;
}

// ── Documento 06: Ficha de Empleado ──────────────────────────────────────────

export interface DependienteEconomico {
  parentesco: string;
  nombres: string;
  apellidos: string;
  sexo: 'M' | 'F';
  fechaNacimiento: string;
  porcentaje: number;
}

export interface ExperienciaLaboralPrevia {
  empresa: string;
  cargo: string;
  rubro: string;
  inicio: string;
  final: string;
}

export interface FormacionAcademica {
  institucion: string;
  gradoObtenido: string;
  inicio: string;
  final: string;
}

export interface IdiomaFicha {
  idioma: string;
  habla: boolean;
  lee: boolean;
  escribe: boolean;
}

export interface ExperienciaInternaUPES {
  puesto: string;
  unidadFacultad: string;
  jefeInmediato: string;
  inicio: string;
  final: string;
}

export interface FichaEmpleado {
  id: string;
  procesoId: string;
  // I. Información General
  cargo: string;
  area: string;
  unidad: string;
  nivelFuncionalMOF: string;
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  estadoFamiliar: string;
  cantidadHijos: number;
  lugarNacimiento: string;
  telCelular: string;
  noDUI: string;
  noNIT: string;
  fechaNacimiento: string;
  nacionalidad: string;
  // II. Dirección y Datos Contractuales
  direccionResidencia: string;
  fechaIngreso: string;
  tipoContrato: TipoContratacion;
  salario: number;
  correoPersonal: string;
  afpNUP: string;
  correoInstitucional: string;
  noISSS: string;
  telefonoOficina: string;
  noExpediente: string;
  telefonoCasa: string;
  // III. Información Médica y Emergencia
  medicamentos: string;
  discapacidad: boolean;
  cualDiscapacidad?: string;
  alergico: boolean;
  aQueAlergico?: string;
  contactoEmergencia: string;
  parentescoEmergencia: string;
  telefonoEmergencia: string;
  otroContacto?: string;
  // IV. Dependientes Económicos
  dependientes: DependienteEconomico[];
  // V. Información Laboral Previa
  experienciaLaboral: ExperienciaLaboralPrevia[];
  // VI. Formación Académica
  formacionAcademica: FormacionAcademica[];
  idiomas: IdiomaFicha[];
  // VII. Experiencia dentro de UPES
  experienciaUPES: ExperienciaInternaUPES[];
  createdAt: string;
  updatedAt: string;
}

// ── Documento 07: Ficha de Docente Hora Clase ─────────────────────────────────

export interface FormacionDocente {
  numero: number;
  centroEstudios: string;
  gradoAcademico: string;
  temaGraduacion: string;
  anio: number;
  esPosgrado?: boolean;
}

export interface ExperienciaDocente {
  asignatura: string;
  centroEstudios: string;
  anio: number;
}

export interface ExperienciaLaboralDocente {
  cargo: string;
  empresa: string;
  desde: string;
  hasta: string;
}

export interface ReferenciaPersonal {
  nombre: string;
  telefono: string;
}

export interface FichaDocente {
  id: string;
  procesoId: string;
  // Datos Personales
  nombre: string;
  domicilio: string;
  telefono: string;
  correoPersonal: string;
  noDUI: string;
  noNIT: string;
  requeridoSujetoExcluido: boolean;
  lugarFechaNacimiento: string;
  fechaIngreso: string;
  correoUPES: string;
  cuentaDavivienda: string;
  otroBanco?: string;
  numeroCuenta: string;
  nacionalidad: string;
  facultad: string;
  carrera: string;
  fotoUrl?: string;
  // Contacto Emergencia
  nombreEmergencia: string;
  parentescoEmergencia: string;
  telefonoEmergencia: string;
  // Formación Académica (3 grados + posgrado)
  formacion: FormacionDocente[];
  // Experiencia Docente
  experienciaDocente: ExperienciaDocente[];
  // Experiencia Laboral No Docente (últimas 3)
  experienciaLaboral: ExperienciaLaboralDocente[];
  // Idiomas
  idiomas: IdiomaFicha[];
  // Gremiales
  gremiales: string[];
  // Referencias Personales
  referencias: ReferenciaPersonal[];
  createdAt: string;
}

// ── Documento 08: Contrato de Trabajo ─────────────────────────────────────────

export interface ContratoTrabajo {
  id: string;
  procesoId: string;
  empleadoId?: string;
  // Campos de combinación de correspondencia
  nombreEmpleado: string;
  profesionSegunDUI: string;
  estadoCivil: string;
  distrito: string;
  municipio: string;
  departamento: string;
  duiParaContrato: string;
  cargo: string;
  salarioEnLetras: string;
  salario: number;
  personasQueDependen: string;
  // Calculados desde plantilla
  fechaInicioContrato: string; // ej. "uno de enero"
  fechaFinContrato: string;    // ej. "treinta y uno de diciembre del año dos mil veintiséis"
  anioContrato: number;
  // Estado
  fechaElaboracion: string;
  firmadoPorEmpleado: boolean;
  firmadoPorRector: boolean;
  fechaFirmaEmpleado?: string;
  fechaFirmaRector?: string;
  estado: 'borrador' | 'enviado' | 'firmado_empleado' | 'firmado_ambos' | 'vigente';
  createdAt: string;
}
