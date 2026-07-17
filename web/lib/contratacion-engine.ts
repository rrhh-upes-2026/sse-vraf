/**
 * Motor de ejecución institucional — PRO-TH-001 v2
 * Universidad Politécnica de El Salvador (UPES)
 *
 * Especificación completa de los 27 pasos del Procedimiento de
 * Reclutamiento, Selección y Contratación. Esta es la fuente única
 * de verdad para validaciones, transiciones y automatizaciones.
 */

import type { StepSpec } from "@/types/proceso-engine";

// ── Motor: 27 pasos ───────────────────────────────────────────────────────────

export const ENGINE_PRO_TH_001: StepSpec[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: IDENTIFICACIÓN DE NECESIDAD (pasos 1-7)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 1,
    actividad: "Identificar la necesidad de contratación y validar si corresponde a una plaza existente",
    instrucciones:
      "Revise el Manual de Organización y Funciones (MOF) vigente. Si la vacante corresponde a una plaza ya aprobada, seleccione 'Plaza existente' y avance directamente al Paso 8. Si requiere crear una nueva plaza, seleccione 'Nueva plaza' y continúe con los Pasos 2-7.",
    responsable: "jefe_area",
    duracionEstimadaDias: 2,
    esDecision: true,
    precondiciones: [],
    validaciones: [
      {
        id: "v1-tipo-puesto",
        descripcion: "Debe especificarse si es plaza existente o nueva plaza",
        tipo: "campo_requerido",
        campo: "tipoPuesto",
        obligatoria: true,
      },
      {
        id: "v1-nombre-puesto",
        descripcion: "Debe indicarse el nombre del puesto requerido",
        tipo: "campo_requerido",
        campo: "nombrePuesto",
        obligatoria: true,
      },
      {
        id: "v1-unidad",
        descripcion: "Debe indicarse la unidad o facultad solicitante",
        tipo: "campo_requerido",
        campo: "unidadFacultad",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev1-justificacion",
        nombre: "Memorándum de identificación de necesidad",
        descripcion: "Documento interno que justifica la necesidad de contratación",
        obligatoria: false,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "decision_si",
        etiqueta: "Plaza existente — continuar con Requisición",
        descripcion: "La vacante corresponde a una plaza aprobada en el MOF. El proceso avanza directamente al Paso 8.",
        pasoSiguiente: 8,
        etapaSiguiente: "requisicion",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
      {
        condicion: "decision_no",
        etiqueta: "Nueva plaza — iniciar proyecto de creación",
        descripcion: "Se requiere crear una nueva plaza. El proceso avanza al Paso 2 para elaborar el proyecto.",
        pasoSiguiente: 2,
        etapaSiguiente: "identificacion_necesidad",
        notificarA: ["rector"],
        colorBoton: "secundario",
        requiereConfirmacion: true,
        requiereNotas: true,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_carpeta_drive",
        descripcion: "Crear carpeta del proceso en Google Drive",
        payload: {
          ruta: "RRHH/Contratacion/{anio}/{codigo}",
          subCarpetas: ["Evidencias", "Documentos", "Expediente", "Correspondencia"],
        },
      },
      {
        tipo: "crear_tarea",
        descripcion: "Crear tarea de identificación de necesidad",
        payload: {
          titulo: "Identificar y documentar la necesidad de contratación",
          responsable: "jefe_area",
          diasVencimiento: 2,
        },
      },
    ],
    escalacion: {
      diasSinActividad: 3,
      notificarA: ["jefe_rrhh"],
      mensaje: "El Jefe de Área no ha registrado la necesidad de contratación en 3 días hábiles.",
      accion: "notificar",
    },
  },
  {
    numero: 2,
    actividad: "Elaborar Proyecto de Creación de Plaza",
    instrucciones:
      "Elabore el Proyecto de Creación de Plaza incluyendo: justificación técnica, impacto en la estructura organizacional, descripción de funciones, perfil requerido y estimación presupuestaria. Este documento será presentado a Rectoría.",
    responsable: "jefe_area",
    duracionEstimadaDias: 5,
    esDecision: false,
    precondiciones: ["El Paso 1 debe haber concluido con la decisión de crear una nueva plaza"],
    validaciones: [
      {
        id: "v2-proyecto-doc",
        descripcion: "Debe subirse el Proyecto de Creación de Plaza",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev2-proyecto-plaza",
        nombre: "Proyecto de Creación de Plaza",
        descripcion: "Documento con justificación, funciones, perfil y estimación presupuestaria",
        obligatoria: true,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [
      {
        id: "doc2-proyecto",
        nombre: "Proyecto de Creación de Plaza",
        descripcion: "Documento formal de solicitud de nueva plaza",
        automatico: false,
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Remitir a Rectoría",
        descripcion: "El proyecto está listo para ser enviado a Rectoría para revisión",
        pasoSiguiente: 3,
        etapaSiguiente: "identificacion_necesidad",
        notificarA: ["rector"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_tarea",
        descripcion: "Crear tarea de elaboración del proyecto",
        payload: {
          titulo: "Elaborar Proyecto de Creación de Plaza",
          responsable: "jefe_area",
          diasVencimiento: 5,
        },
      },
    ],
    escalacion: {
      diasSinActividad: 7,
      notificarA: ["rector"],
      mensaje: "El Jefe de Área no ha completado el Proyecto de Creación de Plaza en el plazo establecido.",
      accion: "notificar",
    },
  },
  {
    numero: 3,
    actividad: "Remitir el proyecto de nueva plaza a Rectoría",
    instrucciones:
      "Remita formalmente el proyecto de nueva plaza a Rectoría para su revisión técnica y presupuestaria. Incluya una carta de presentación firmada.",
    responsable: "jefe_area",
    duracionEstimadaDias: 1,
    esDecision: false,
    precondiciones: ["El Proyecto de Creación de Plaza del Paso 2 debe estar elaborado"],
    validaciones: [
      {
        id: "v3-carta-remision",
        descripcion: "Debe subirse la carta de remisión a Rectoría",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev3-carta-remision",
        nombre: "Carta de remisión a Rectoría",
        descripcion: "Carta formal de presentación del proyecto",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Proyecto remitido",
        descripcion: "El proyecto ha sido enviado formalmente a Rectoría",
        pasoSiguiente: 4,
        etapaSiguiente: "identificacion_necesidad",
        notificarA: ["rector"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "enviar_notificacion",
        descripcion: "Notificar al Rector que hay un proyecto de nueva plaza pendiente de revisión",
        payload: { destinatario: "rector", tipo: "aprobacion_requerida" },
      },
    ],
  },
  {
    numero: 4,
    actividad: "Evaluar el proyecto y presentar a la instancia competente para aprobación",
    instrucciones:
      "Revise técnica y presupuestariamente el proyecto de nueva plaza. Evalúe su viabilidad y preséntelo a la Asamblea General o Junta de Directores según corresponda. Registre la decisión tomada.",
    responsable: "rector",
    duracionEstimadaDias: 10,
    esDecision: false,
    precondiciones: ["El Proyecto de Creación de Plaza debe haber sido remitido formalmente por el Jefe de Área"],
    validaciones: [
      {
        id: "v4-acta-aprobacion",
        descripcion: "Debe subirse el acta de la sesión donde se aprobó la nueva plaza",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev4-acta",
        nombre: "Acta de aprobación de nueva plaza",
        descripcion: "Acta de la Asamblea General o Junta de Directores con la decisión",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "aprobado",
        etiqueta: "Plaza aprobada — solicitar Descriptor de Puesto",
        descripcion: "La plaza fue aprobada por la instancia competente",
        pasoSiguiente: 5,
        etapaSiguiente: "identificacion_necesidad",
        notificarA: ["jefe_area", "gestor_om"],
        colorBoton: "exito",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
      {
        condicion: "rechazado",
        etiqueta: "Proyecto rechazado",
        descripcion: "La instancia competente no aprobó la creación de la plaza",
        pasoSiguiente: "rechazado",
        etapaSiguiente: "rechazado",
        notificarA: ["jefe_area", "jefe_rrhh"],
        colorBoton: "peligro",
        requiereConfirmacion: true,
        requiereNotas: true,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_evento_calendario",
        descripcion: "Programar sesión de revisión de proyecto",
        payload: { tipo: "reunion", diasVencimiento: 10 },
      },
    ],
    escalacion: {
      diasSinActividad: 15,
      notificarA: ["jefe_area"],
      mensaje: "El Rector no ha registrado la decisión sobre el proyecto de nueva plaza.",
      accion: "notificar",
    },
  },
  {
    numero: 5,
    actividad: "Solicitar a O&M la elaboración o actualización del Descriptor de Puesto",
    instrucciones:
      "Una vez aprobada la nueva plaza, solicite formalmente al Gestor de O&M la elaboración o actualización del Descriptor de Puesto y los procedimientos asociados.",
    responsable: "rector",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["La nueva plaza debe haber sido aprobada en el Paso 4"],
    validaciones: [
      {
        id: "v5-solicitud-om",
        descripcion: "Debe registrarse la solicitud formal a O&M",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev5-solicitud-om",
        nombre: "Solicitud a O&M",
        descripcion: "Memorándum formal solicitando al Gestor de O&M el Descriptor de Puesto",
        obligatoria: true,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Solicitud enviada a O&M",
        descripcion: "La solicitud fue enviada al Gestor de O&M",
        pasoSiguiente: 6,
        etapaSiguiente: "identificacion_necesidad",
        notificarA: ["gestor_om"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "enviar_notificacion",
        descripcion: "Notificar al Gestor de O&M que debe elaborar el Descriptor de Puesto",
        payload: { destinatario: "gestor_om", tipo: "tarea_asignada" },
      },
    ],
  },
  {
    numero: 6,
    actividad: "Elaborar y validar el Descriptor del Perfil de Puesto",
    instrucciones:
      "Elabore el Descriptor del Perfil de Puesto y los procedimientos asociados conforme a la estructura del MOF. Coordine con el Jefe de Área solicitante para validar que el perfil responde a las necesidades reales del cargo.",
    responsable: "gestor_om",
    duracionEstimadaDias: 7,
    esDecision: false,
    precondiciones: ["Debe haberse recibido la solicitud formal del Rector (Paso 5)"],
    validaciones: [
      {
        id: "v6-descriptor",
        descripcion: "Debe subirse el Descriptor del Perfil de Puesto validado",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev6-descriptor",
        nombre: "Descriptor del Perfil de Puesto",
        descripcion: "Documento formal con objetivos, funciones, perfil y competencias del cargo",
        obligatoria: true,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [
      {
        id: "doc6-descriptor",
        nombre: "Descriptor del Perfil de Puesto",
        descripcion: "Descriptor institucional del nuevo cargo",
        automatico: false,
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Descriptor elaborado — actualizar MOF",
        descripcion: "El Descriptor está listo para ser incorporado al MOF",
        pasoSiguiente: 7,
        etapaSiguiente: "identificacion_necesidad",
        notificarA: ["rector"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [],
    escalacion: {
      diasSinActividad: 10,
      notificarA: ["rector"],
      mensaje: "El Gestor de O&M no ha completado el Descriptor de Puesto en el plazo establecido.",
      accion: "notificar",
    },
  },
  {
    numero: 7,
    actividad: "Actualizar el Manual de Organización y Funciones (MOF)",
    instrucciones:
      "Actualice el MOF incorporando la nueva plaza aprobada con su Descriptor de Puesto. Asegúrese de que la versión actualizada sea aprobada formalmente y distribuida a las instancias correspondientes.",
    responsable: "gestor_om",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["El Descriptor de Puesto del Paso 6 debe estar elaborado y validado"],
    validaciones: [
      {
        id: "v7-mof-actualizado",
        descripcion: "Debe subirse la versión actualizada del MOF",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev7-mof",
        nombre: "MOF actualizado",
        descripcion: "Manual de Organización y Funciones con la nueva plaza incorporada",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "MOF actualizado — iniciar Requisición",
        descripcion: "La plaza ya está en el MOF. El proceso avanza al Paso 8 (Requisición de Personal).",
        pasoSiguiente: 8,
        etapaSiguiente: "requisicion",
        notificarA: ["jefe_area", "jefe_rrhh"],
        colorBoton: "exito",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: REQUISICIÓN (paso 8)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 8,
    actividad: "Solicitar formalmente el inicio del proceso mediante el Formulario de Requisición de Personal",
    instrucciones:
      "Complete y envíe el Formulario de Requisición de Personal a RR. HH. El formulario debe incluir: datos del área solicitante, especificaciones de la requisición, definición del puesto, perfil requerido con la Matriz de Competencias, y firmas correspondientes.",
    responsable: "jefe_area",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: [
      "El Paso 1 debe haber concluido con la decisión de plaza existente, O",
      "Los Pasos 2-7 deben haber concluido con la aprobación y actualización del MOF",
    ],
    validaciones: [
      {
        id: "v8-formulario-completo",
        descripcion: "El Formulario de Requisición debe estar completado en todos sus campos obligatorios",
        tipo: "campo_requerido",
        campo: "requisicionId",
        obligatoria: true,
      },
      {
        id: "v8-firma-solicita",
        descripcion: "Debe registrarse la firma del solicitante",
        tipo: "campo_requerido",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev8-formulario-firmado",
        nombre: "Formulario de Requisición de Personal firmado",
        descripcion: "Copia del formulario con firma física del Jefe de Área",
        obligatoria: false,
        tiposAceptados: ["pdf", "jpg", "png"],
      },
    ],
    documentosGenerados: [
      {
        id: "doc8-requisicion",
        nombre: "Formulario de Requisición de Personal",
        descripcion: "Formulario institucional PRO-TH-001 diligenciado",
        automatico: true,
        plantilla: "FormularioRequisicion",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Enviar requisición a RR. HH.",
        descripcion: "El formulario está completo y será enviado a RR. HH. para su revisión",
        pasoSiguiente: 9,
        etapaSiguiente: "estrategia_reclutamiento",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de completar formulario de requisición",
        payload: { titulo: "Completar y enviar Formulario de Requisición de Personal", responsable: "jefe_area", diasVencimiento: 2 },
      },
      {
        tipo: "crear_evento_calendario",
        descripcion: "Recordatorio de vencimiento de requisición",
        payload: { tipo: "vencimiento", diasVencimiento: 2 },
      },
    ],
    escalacion: {
      diasSinActividad: 3,
      notificarA: ["jefe_rrhh"],
      mensaje: "El Jefe de Área no ha enviado la Requisición de Personal en el plazo establecido.",
      accion: "notificar",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: ESTRATEGIA DE RECLUTAMIENTO (paso 9)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 9,
    actividad: "Revisar la requisición, validar perfil y definir la estrategia de reclutamiento",
    instrucciones:
      "Revise el Formulario de Requisición de Personal recibido. Valide que el perfil descrito sea coherente con el Descriptor de Puesto del MOF. Defina la estrategia de reclutamiento: interno (dentro de la institución) o externo (publicación en medios). Registre su decisión.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 2,
    esDecision: true,
    precondiciones: ["El Formulario de Requisición de Personal del Paso 8 debe haber sido enviado y recibido"],
    validaciones: [
      {
        id: "v9-estrategia",
        descripcion: "Debe definirse la estrategia de reclutamiento (interna o externa)",
        tipo: "campo_requerido",
        campo: "estrategiaReclutamiento",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "decision_si",
        etiqueta: "Reclutamiento interno — publicar en medios institucionales",
        descripcion: "Se publicará la vacante en medios internos de la institución",
        pasoSiguiente: 10,
        etapaSiguiente: "publicacion_vacante",
        notificarA: ["jefe_area"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
      {
        condicion: "decision_no",
        etiqueta: "Reclutamiento externo / outsourcing",
        descripcion: "Se procederá con reclutamiento externo o a través de outsourcing",
        pasoSiguiente: 11,
        etapaSiguiente: "publicacion_vacante",
        notificarA: ["jefe_area"],
        colorBoton: "secundario",
        requiereConfirmacion: false,
        requiereNotas: true,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de revisión de requisición y definición de estrategia",
        payload: { titulo: "Revisar Requisición de Personal y definir estrategia de reclutamiento", responsable: "jefe_rrhh", diasVencimiento: 2 },
      },
    ],
    escalacion: {
      diasSinActividad: 3,
      notificarA: ["rector"],
      mensaje: "RR. HH. no ha definido la estrategia de reclutamiento en el plazo establecido.",
      accion: "notificar",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: PUBLICACIÓN DE VACANTE (pasos 10-11)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 10,
    actividad: "Publicar la vacante en medios institucionales, divulgación interna, redes sociales, bolsas de empleo y universidades",
    instrucciones:
      "Publique la convocatoria de la vacante en todos los canales definidos en la estrategia: portal web institucional, correo interno, redes sociales (LinkedIn, Facebook), bolsas de empleo (Indeed, Bumeran) y en universidades socias. Establezca fecha de cierre de recepción de currículos.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 5,
    esDecision: true,
    precondiciones: ["La estrategia de reclutamiento del Paso 9 debe ser 'interna' o incluir medios externos"],
    validaciones: [
      {
        id: "v10-publicacion",
        descripcion: "Debe subirse evidencia de la publicación en al menos un medio",
        tipo: "documento_cargado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev10-publicacion-web",
        nombre: "Captura de publicación en portal institucional",
        descripcion: "Pantallazo o PDF de la convocatoria publicada en el sitio web",
        obligatoria: true,
        tiposAceptados: ["pdf", "jpg", "png"],
      },
      {
        id: "ev10-publicacion-redes",
        nombre: "Captura de publicación en redes sociales",
        descripcion: "Evidencia de publicación en LinkedIn, Facebook u otras redes",
        obligatoria: false,
        tiposAceptados: ["jpg", "png", "pdf"],
      },
    ],
    documentosGenerados: [
      {
        id: "doc10-convocatoria",
        nombre: "Convocatoria de vacante",
        descripcion: "Documento oficial de convocatoria para publicación",
        automatico: true,
        plantilla: "Convocatoria",
      },
    ],
    transiciones: [
      {
        condicion: "candidatos_disponibles",
        etiqueta: "Se recibieron candidatos — continuar con evaluación de CV",
        descripcion: "Se recibieron currículos de candidatos que serán evaluados",
        pasoSiguiente: 12,
        etapaSiguiente: "recepcion_cv",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
      {
        condicion: "sin_candidatos",
        etiqueta: "Sin candidatos idóneos — reclutamiento externo",
        descripcion: "No se recibieron candidatos idóneos. Se procede con reclutamiento externo u outsourcing.",
        pasoSiguiente: 11,
        etapaSiguiente: "publicacion_vacante",
        notificarA: ["jefe_area"],
        colorBoton: "secundario",
        requiereConfirmacion: true,
        requiereNotas: true,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de publicación de convocatoria",
        payload: { titulo: "Publicar convocatoria de vacante en todos los medios definidos", responsable: "jefe_rrhh", diasVencimiento: 5 },
      },
      {
        tipo: "generar_documento",
        descripcion: "Generar borrador de convocatoria",
        payload: { documentoId: "doc10-convocatoria" },
      },
    ],
  },
  {
    numero: 11,
    actividad: "Reclutamiento externo / outsourcing",
    instrucciones:
      "Proceda con reclutamiento externo o a través de empresa de outsourcing cuando la plaza sea urgente, especializada o cuando no se hayan recibido postulantes idóneos en la convocatoria interna. Coordine con el proveedor externo y establezca plazos de entrega de candidatos.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 10,
    esDecision: false,
    precondiciones: [
      "La estrategia definida en el Paso 9 debe ser 'outsourcing', O",
      "La convocatoria del Paso 10 no generó candidatos idóneos",
    ],
    validaciones: [
      {
        id: "v11-candidatos",
        descripcion: "Debe registrarse al menos un candidato recibido del proceso externo",
        tipo: "candidatos_minimo",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev11-propuesta-outsourcing",
        nombre: "Propuesta / contrato con empresa de outsourcing",
        descripcion: "Documento de acuerdo con el proveedor externo de reclutamiento",
        obligatoria: false,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "candidatos_disponibles",
        etiqueta: "Candidatos recibidos — continuar con evaluación de CV",
        descripcion: "El proceso externo generó candidatos que serán evaluados",
        pasoSiguiente: 12,
        etapaSiguiente: "recepcion_cv",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [],
    escalacion: {
      diasSinActividad: 15,
      notificarA: ["rector"],
      mensaje: "El proceso de reclutamiento externo no ha generado candidatos en el plazo establecido.",
      accion: "escalar_rector",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: RECEPCIÓN DE CV (paso 12)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 12,
    actividad: "Recibir currículum de candidatos y realizar evaluación de idoneidad CV vs Perfil del Puesto",
    instrucciones:
      "Registre cada currículo recibido en el sistema. Evalúe la idoneidad de cada candidato comparando su perfil con los requisitos del puesto. Marque 'Cumple perfil' o 'No cumple' para cada CV. Solo los candidatos que cumplen el perfil avanzan a la entrevista preliminar.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["Se deben haber recibido currículos de candidatos (Pasos 10 u 11)"],
    validaciones: [
      {
        id: "v12-candidatos-registrados",
        descripcion: "Debe registrarse al menos un candidato que cumple el perfil",
        tipo: "candidatos_minimo",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev12-cvs",
        nombre: "Currículos de candidatos",
        descripcion: "Hojas de vida de todos los candidatos recibidos",
        obligatoria: true,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Evaluación de CV completada — convocar a entrevista preliminar",
        descripcion: "Los candidatos que cumplen el perfil serán convocados a entrevista",
        pasoSiguiente: 13,
        etapaSiguiente: "entrevista_preliminar",
        notificarA: ["jefe_area"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de evaluación de CV vs perfil",
        payload: { titulo: "Evaluar idoneidad de currículos recibidos vs Perfil del Puesto", responsable: "jefe_rrhh", diasVencimiento: 3 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: ENTREVISTA PRELIMINAR (paso 13)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 13,
    actividad: "Convocar a entrevista preliminar virtual a candidatos que cumplen el perfil",
    instrucciones:
      "Convoque a los candidatos que aprobaron la revisión de CV a una entrevista preliminar virtual (Teams, Zoom o similar). Registre la nota de entrevista (0-100) para cada candidato y marque si avanzan a la siguiente etapa.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 5,
    esDecision: false,
    precondiciones: ["Al menos un candidato debe haber sido marcado como 'Cumple perfil' en el Paso 12"],
    validaciones: [
      {
        id: "v13-notas-entrevista",
        descripcion: "Debe registrarse la nota de entrevista para al menos un candidato",
        tipo: "candidatos_minimo",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev13-cronograma",
        nombre: "Cronograma de entrevistas preliminares",
        descripcion: "Listado de candidatos convocados con fechas y horarios",
        obligatoria: false,
        tiposAceptados: ["pdf", "xlsx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Entrevistas completadas — aplicar pruebas",
        descripcion: "Los candidatos preseleccionados avanzan a la etapa de pruebas",
        pasoSiguiente: 14,
        etapaSiguiente: "pruebas",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_evento_calendario",
        descripcion: "Programar sesiones de entrevistas preliminares",
        payload: { tipo: "entrevistas", diasVencimiento: 5 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: PRUEBAS (paso 14)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 14,
    actividad: "Aplicar pruebas técnicas y conductuales según el perfil del puesto",
    instrucciones:
      "Aplique las pruebas técnicas y conductuales definidas en el Descriptor de Puesto. Registre la nota de prueba técnica (0-100) y la nota de prueba conductual (0-100) para cada candidato. Los candidatos que no alcancen el puntaje mínimo no avanzan.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["Las entrevistas preliminares del Paso 13 deben haber sido realizadas"],
    validaciones: [
      {
        id: "v14-pruebas-registradas",
        descripcion: "Deben registrarse las notas de pruebas para al menos un candidato",
        tipo: "candidatos_minimo",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev14-pruebas",
        nombre: "Resultados de pruebas técnicas y conductuales",
        descripcion: "Consolidado de resultados de todas las pruebas aplicadas",
        obligatoria: true,
        tiposAceptados: ["pdf", "xlsx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Pruebas aplicadas — realizar entrevista RR. HH.",
        descripcion: "Los candidatos con resultado satisfactorio avanzan a entrevista con RR. HH.",
        pasoSiguiente: 15,
        etapaSiguiente: "entrevista_rrhh",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: ENTREVISTA RR. HH. (paso 15)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 15,
    actividad: "Realizar entrevista de selección por parte de RR. HH.",
    instrucciones:
      "Realice la entrevista de selección por competencias con cada candidato preseleccionado. Evalúe alineación cultural, competencias conductuales e historial laboral. Registre la nota de entrevista RR. HH. (0-100) para cada candidato.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["Las pruebas del Paso 14 deben haberse aplicado"],
    validaciones: [
      {
        id: "v15-notas-entrevista-rrhh",
        descripcion: "Deben registrarse notas de entrevista RR. HH. para al menos un candidato",
        tipo: "candidatos_minimo",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev15-guia-entrevista",
        nombre: "Guía de entrevista por competencias",
        descripcion: "Instrumento utilizado en la entrevista de selección",
        obligatoria: false,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Entrevistas realizadas — conformar terna",
        descripcion: "Con los resultados de todas las etapas se conformará la terna de candidatos",
        pasoSiguiente: 16,
        etapaSiguiente: "conformacion_terna",
        notificarA: ["jefe_area"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: CONFORMACIÓN DE TERNA (paso 16)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 16,
    actividad: "Analizar resultados y conformar terna de candidatos idóneos, remitiendo Informe Técnico",
    instrucciones:
      "Analice los resultados de todas las etapas de evaluación. Seleccione los tres mejores candidatos para conformar la terna. Elabore el Informe Técnico de Selección con el análisis comparativo de la terna y la recomendación fundamentada. Remita el informe al Jefe de Área y al Rector.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["La entrevista RR. HH. del Paso 15 debe haberse realizado para al menos 3 candidatos"],
    validaciones: [
      {
        id: "v16-terna-completa",
        descripcion: "Deben seleccionarse exactamente 3 candidatos para la terna",
        tipo: "terna_completa",
        obligatoria: true,
      },
      {
        id: "v16-informe-tecnico",
        descripcion: "Debe generarse el Informe Técnico de Selección",
        tipo: "campo_requerido",
        campo: "informeTecnicoId",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [],
    documentosGenerados: [
      {
        id: "doc16-informe-tecnico",
        nombre: "Informe Técnico de Selección",
        descripcion: "Análisis comparativo de la terna con recomendación del candidato idóneo",
        automatico: false,
        plantilla: "InformeTecnicoSeleccion",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Terna conformada — realizar entrevista final",
        descripcion: "La terna está lista para la entrevista final con el Comité o Jefatura",
        pasoSiguiente: 17,
        etapaSiguiente: "entrevista_final",
        notificarA: ["jefe_area", "rector"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "generar_documento",
        descripcion: "Generar borrador del Informe Técnico de Selección",
        payload: { documentoId: "doc16-informe-tecnico" },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: ENTREVISTA FINAL (paso 17)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 17,
    actividad: "Realizar entrevista final por Comité de Evaluación (puestos estratégicos) o por jefatura inmediata (puestos no estratégicos)",
    instrucciones:
      "Convoque a los tres candidatos de la terna a la entrevista final. Para puestos estratégicos, la entrevista la realiza el Comité de Evaluación (Rector + Jefe de Área + Jefe de RR. HH.). Para puestos no estratégicos, la realiza el Jefe Inmediato. Registre la nota de entrevista final (0-100) para cada candidato.",
    responsable: "comite_o_jefe_area",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["La terna del Paso 16 debe estar conformada y el Informe Técnico emitido"],
    validaciones: [
      {
        id: "v17-notas-entrevista-final",
        descripcion: "Deben registrarse las notas de entrevista final para los 3 candidatos de la terna",
        tipo: "candidatos_minimo",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev17-acta-entrevista-final",
        nombre: "Acta de entrevista final",
        descripcion: "Registro de las entrevistas finales realizadas por el Comité o Jefatura",
        obligatoria: false,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Entrevistas finales realizadas — emitir Informe de Selección",
        descripcion: "Con todos los resultados se emitirá el Informe de Selección Final",
        pasoSiguiente: 18,
        etapaSiguiente: "informe_seleccion",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_evento_calendario",
        descripcion: "Programar entrevistas finales con la terna",
        payload: { tipo: "entrevista_final", diasVencimiento: 3 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: INFORME DE SELECCIÓN (paso 18)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 18,
    actividad: "Emitir Informe Técnico del candidato recomendado",
    instrucciones:
      "Con base en los resultados de todas las etapas de evaluación, elabore el Informe de Selección Final. Identifique claramente al candidato recomendado (1.ª opción), 2.ª opción y 3.ª opción. El informe debe estar firmado por el Jefe Inmediato o Comité y con visto bueno de RR. HH.",
    responsable: "jefe_inmediato_o_comite",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["Las entrevistas finales del Paso 17 deben haberse realizado para toda la terna"],
    validaciones: [
      {
        id: "v18-informe-final",
        descripcion: "Debe generarse el Informe de Selección Final",
        tipo: "campo_requerido",
        campo: "informeFinalId",
        obligatoria: true,
      },
      {
        id: "v18-candidato-seleccionado",
        descripcion: "Debe identificarse el candidato recomendado",
        tipo: "campo_requerido",
        campo: "candidatoSeleccionadoId",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [],
    documentosGenerados: [
      {
        id: "doc18-informe-final",
        nombre: "Informe de Selección Final",
        descripcion: "Informe con candidato recomendado, justificación y firmas",
        automatico: false,
        plantilla: "InformeSeleccionFinal",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Informe emitido — presentar a instancia superior",
        descripcion: "El informe será presentado al Rector para validación final",
        pasoSiguiente: 19,
        etapaSiguiente: "validacion_rector",
        notificarA: ["rector", "jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "generar_documento",
        descripcion: "Generar borrador del Informe de Selección Final",
        payload: { documentoId: "doc18-informe-final" },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: VALIDACIÓN DEL RECTOR (pasos 19-20)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 19,
    actividad: "Presentar candidato recomendado a la instancia superior para validación final",
    instrucciones:
      "Presente al Rector el Informe de Selección Final con el candidato recomendado y la terna completa. Incluya el Informe Técnico de Selección elaborado por RR. HH. Solicite la validación formal de la decisión.",
    responsable: "jefe_rrhh_o_jefe_area",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["El Informe de Selección Final del Paso 18 debe estar emitido y firmado"],
    validaciones: [
      {
        id: "v19-presentacion",
        descripcion: "Debe registrarse evidencia de la presentación al Rector",
        tipo: "documento_cargado",
        obligatoria: false,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev19-acta-presentacion",
        nombre: "Acta de presentación ante el Rector",
        descripcion: "Registro de la reunión de presentación del candidato recomendado",
        obligatoria: false,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Presentación realizada — esperar decisión del Rector",
        descripcion: "El Rector recibirá la información y notificará su decisión",
        pasoSiguiente: 20,
        etapaSiguiente: "validacion_rector",
        notificarA: ["rector"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_evento_calendario",
        descripcion: "Programar reunión de validación con el Rector",
        payload: { tipo: "validacion_rector", diasVencimiento: 2 },
      },
    ],
  },
  {
    numero: 20,
    actividad: "Notificar decisión final a RR. HH.",
    instrucciones:
      "Registre la decisión del Rector sobre el candidato recomendado. Si aprueba la selección, el proceso avanza a la emisión de la Carta Oferta. Si tiene observaciones, indíquelas en las notas para que RR. HH. tome las acciones correspondientes.",
    responsable: "rector",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["La presentación ante el Rector debe haberse realizado (Paso 19)"],
    validaciones: [
      {
        id: "v20-decision-rector",
        descripcion: "El Rector debe registrar su decisión (aprobado / rechazado)",
        tipo: "aprobacion_registrada",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "aprobado",
        etiqueta: "Selección aprobada — emitir Carta Oferta",
        descripcion: "El Rector aprobó la selección. Se procede a emitir la Carta Oferta.",
        pasoSiguiente: 21,
        etapaSiguiente: "carta_oferta",
        notificarA: ["jefe_rrhh", "jefe_area"],
        colorBoton: "exito",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
      {
        condicion: "rechazado",
        etiqueta: "Selección observada — reanudar proceso",
        descripcion: "El Rector tiene observaciones. El proceso regresa para revisión.",
        pasoSiguiente: 16,
        etapaSiguiente: "conformacion_terna",
        notificarA: ["jefe_rrhh", "jefe_area"],
        colorBoton: "peligro",
        requiereConfirmacion: true,
        requiereNotas: true,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "enviar_notificacion",
        descripcion: "Notificar al Rector que tiene una decisión pendiente",
        payload: { destinatario: "rector", tipo: "aprobacion_requerida" },
      },
    ],
    escalacion: {
      diasSinActividad: 3,
      notificarA: ["jefe_rrhh"],
      mensaje: "El Rector no ha notificado su decisión sobre la selección del candidato.",
      accion: "notificar",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: CARTA OFERTA (pasos 21-22)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 21,
    actividad: "Emitir Carta Oferta con condiciones (1.ª opción; 2.ª si la primera no acepta; 3.ª si ambas anteriores no aceptan)",
    instrucciones:
      "Elabore y envíe la Carta Oferta a la 1.ª opción de la terna. Detalle las condiciones laborales: cargo, salario, fecha de inicio, horario y beneficios. Establezca un plazo máximo de respuesta (48-72 horas). Si el candidato no acepta, proceda con la 2.ª opción, y así sucesivamente.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 3,
    esDecision: false,
    precondiciones: ["La selección del candidato debe haber sido validada por el Rector (Paso 20)"],
    validaciones: [
      {
        id: "v21-carta-emitida",
        descripcion: "Debe haberse generado y enviado la Carta Oferta",
        tipo: "oferta_emitida",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [],
    documentosGenerados: [
      {
        id: "doc21-carta-oferta",
        nombre: "Carta Oferta",
        descripcion: "Oferta formal de empleo con condiciones laborales",
        automatico: true,
        plantilla: "CartaOferta",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Carta Oferta enviada — esperar respuesta del candidato",
        descripcion: "La Carta Oferta fue enviada. Se espera la respuesta del candidato.",
        pasoSiguiente: 22,
        etapaSiguiente: "carta_oferta",
        notificarA: ["jefe_area"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "generar_documento",
        descripcion: "Generar Carta Oferta",
        payload: { documentoId: "doc21-carta-oferta", automatico: true },
      },
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de emisión de Carta Oferta",
        payload: { titulo: "Emitir y enviar Carta Oferta al candidato seleccionado", responsable: "jefe_rrhh", diasVencimiento: 1 },
      },
    ],
  },
  {
    numero: 22,
    actividad: "¿El candidato acepta la oferta laboral?",
    instrucciones:
      "Registre la respuesta del candidato a la Carta Oferta. Si acepta, el proceso avanza a la creación del expediente. Si rechaza, proceda con la siguiente opción de la terna. Si ninguna de las tres opciones acepta, el proceso regresa al Paso 8 para iniciar un nuevo reclutamiento.",
    responsable: "candidato",
    duracionEstimadaDias: 2,
    esDecision: true,
    precondiciones: ["La Carta Oferta del Paso 21 debe haber sido enviada al candidato"],
    validaciones: [
      {
        id: "v22-respuesta-registrada",
        descripcion: "Debe registrarse la respuesta del candidato a la Carta Oferta",
        tipo: "aprobacion_registrada",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev22-carta-aceptacion",
        nombre: "Carta de aceptación firmada",
        descripcion: "Confirmación escrita del candidato aceptando la oferta",
        obligatoria: false,
        tiposAceptados: ["pdf", "jpg"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "aprobado",
        etiqueta: "Oferta aceptada — crear expediente",
        descripcion: "El candidato aceptó la oferta. El proceso avanza a la creación del expediente.",
        pasoSiguiente: 23,
        etapaSiguiente: "creacion_expediente",
        notificarA: ["jefe_rrhh", "jefe_area", "rector"],
        colorBoton: "exito",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
      {
        condicion: "rechazado",
        etiqueta: "Oferta rechazada — ofrecer a siguiente opción",
        descripcion: "El candidato rechazó la oferta. Se procede con la siguiente opción de la terna.",
        pasoSiguiente: 21,
        etapaSiguiente: "carta_oferta",
        notificarA: ["jefe_rrhh"],
        colorBoton: "peligro",
        requiereConfirmacion: true,
        requiereNotas: true,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_evento_calendario",
        descripcion: "Registrar fecha límite de respuesta del candidato",
        payload: { tipo: "vencimiento_oferta", diasVencimiento: 2 },
      },
    ],
    escalacion: {
      diasSinActividad: 3,
      notificarA: ["jefe_rrhh"],
      mensaje: "El candidato no ha respondido la Carta Oferta en el plazo establecido.",
      accion: "notificar",
    },
    rollback: {
      condicion: "Las tres opciones de la terna rechazaron la oferta",
      pasoDestino: 8,
      requiereJustificacion: true,
      notificarA: ["rector", "jefe_area"],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: CREACIÓN DE EXPEDIENTE (paso 23)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 23,
    actividad: "Crear expediente físico y digital y solicitar documentación completa al candidato seleccionado",
    instrucciones:
      "Abra el expediente del nuevo colaborador en el sistema. Notifique al candidato seleccionado la lista completa de documentos requeridos para su incorporación. Verifique que cada documento recibido cumpla los requisitos de vigencia y autenticidad.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 5,
    esDecision: false,
    precondiciones: ["El candidato seleccionado debe haber aceptado la Carta Oferta (Paso 22)"],
    validaciones: [
      {
        id: "v23-expediente-creado",
        descripcion: "Debe abrirse el expediente del nuevo colaborador en el sistema",
        tipo: "campo_requerido",
        campo: "expedienteId",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev23-dui",
        nombre: "Fotocopia de DUI vigente",
        descripcion: "Documento Único de Identidad del nuevo colaborador",
        obligatoria: true,
        tiposAceptados: ["pdf", "jpg", "png"],
      },
      {
        id: "ev23-nit",
        nombre: "Fotocopia de NIT",
        descripcion: "Número de Identificación Tributaria",
        obligatoria: true,
        tiposAceptados: ["pdf", "jpg", "png"],
      },
      {
        id: "ev23-titulo",
        nombre: "Fotocopia de título universitario / técnico",
        descripcion: "Documento académico que acredita la formación requerida para el cargo",
        obligatoria: true,
        tiposAceptados: ["pdf", "jpg"],
      },
      {
        id: "ev23-antecedentes",
        nombre: "Constancia de antecedentes penales vigente",
        descripcion: "Constancia emitida por la PNC con vigencia no mayor a 3 meses",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
      {
        id: "ev23-salud",
        nombre: "Certificado médico de buena salud",
        descripcion: "Certificado emitido por médico colegiado",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [
      {
        id: "doc23-lista-verificacion",
        nombre: "Lista de Verificación de Expediente",
        descripcion: "Formulario de control de documentos del expediente personal",
        automatico: true,
        plantilla: "ListaVerificacionExpediente",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Expediente completo — elaborar contrato",
        descripcion: "El expediente está completo. Se procede a elaborar el contrato de trabajo.",
        pasoSiguiente: 24,
        etapaSiguiente: "elaboracion_contrato",
        notificarA: ["jefe_rrhh"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_carpeta_drive",
        descripcion: "Crear subcarpeta de Expediente Personal en Drive",
        payload: { subCarpeta: "Expediente", ruta: "{proceso}/Expediente" },
      },
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de recopilación de documentos del expediente",
        payload: { titulo: "Recopilar y verificar documentación del nuevo colaborador", responsable: "jefe_rrhh", diasVencimiento: 5 },
      },
      {
        tipo: "generar_documento",
        descripcion: "Generar Lista de Verificación de Expediente",
        payload: { documentoId: "doc23-lista-verificacion" },
      },
    ],
    escalacion: {
      diasSinActividad: 7,
      notificarA: ["rector"],
      mensaje: "El expediente del nuevo colaborador no ha sido completado en el plazo establecido.",
      accion: "notificar",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: ELABORACIÓN DE CONTRATO (paso 24)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 24,
    actividad: "Elaborar contrato en sistema conforme a normativa vigente",
    instrucciones:
      "Elabore el Contrato de Trabajo en el sistema utilizando los campos de combinación de correspondencia. Verifique que todos los datos del colaborador sean correctos. El contrato debe cumplir con el Código de Trabajo de El Salvador y las políticas institucionales de UPES.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["El expediente del Paso 23 debe estar completo con todos los documentos obligatorios"],
    validaciones: [
      {
        id: "v24-contrato-generado",
        descripcion: "Debe generarse el Contrato de Trabajo en el sistema",
        tipo: "campo_requerido",
        campo: "contratoId",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [],
    documentosGenerados: [
      {
        id: "doc24-contrato",
        nombre: "Contrato de Trabajo",
        descripcion: "Contrato generado con todos los campos de combinación completados",
        automatico: true,
        plantilla: "ContratoTrabajo",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Contrato elaborado — proceder a firma",
        descripcion: "El contrato está listo para ser firmado por el colaborador y el Rector",
        pasoSiguiente: 25,
        etapaSiguiente: "firma_contrato",
        notificarA: ["empleado_y_rector"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "generar_documento",
        descripcion: "Generar borrador del Contrato de Trabajo",
        payload: { documentoId: "doc24-contrato", automatico: true },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: FIRMA DE CONTRATO (paso 25)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 25,
    actividad: "Firma de contrato por empleado y autoridad institucional",
    instrucciones:
      "Coordine la firma del Contrato de Trabajo por parte del nuevo colaborador y por la autoridad institucional (Rector). Registre la fecha de firma de ambas partes. Digitalice el contrato firmado y guárdelo en el expediente.",
    responsable: "empleado_y_rector",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["El Contrato de Trabajo del Paso 24 debe estar elaborado y revisado"],
    validaciones: [
      {
        id: "v25-contrato-firmado",
        descripcion: "Debe registrarse la firma de ambas partes en el sistema",
        tipo: "contrato_firmado",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev25-contrato-firmado",
        nombre: "Contrato de trabajo firmado (digitalizado)",
        descripcion: "Copia digital del contrato con firmas de empleado y Rector",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "aprobado",
        etiqueta: "Contrato firmado — comunicar contratación",
        descripcion: "El contrato fue firmado por ambas partes. Se comunicará la nueva incorporación.",
        pasoSiguiente: 26,
        etapaSiguiente: "comunicacion",
        notificarA: ["jefe_area", "jefe_rrhh"],
        colorBoton: "exito",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_evento_calendario",
        descripcion: "Programar firma de contrato",
        payload: { tipo: "firma_contrato", diasVencimiento: 2 },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: COMUNICACIÓN (paso 26)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 26,
    actividad: "Anexar contrato al expediente y comunicar la contratación de manera institucional",
    instrucciones:
      "Anexe el contrato firmado al expediente digital del colaborador. Comunique la nueva incorporación a todas las instancias institucionales involucradas: unidad solicitante, TI (para creación de credenciales), Servicios Generales y cualquier otra dependencia relevante.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 2,
    esDecision: false,
    precondiciones: ["El Contrato de Trabajo del Paso 25 debe estar firmado por ambas partes"],
    validaciones: [
      {
        id: "v26-comunicacion-enviada",
        descripcion: "Debe registrarse evidencia de la comunicación institucional",
        tipo: "documento_cargado",
        obligatoria: false,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev26-circular",
        nombre: "Circular o memo de comunicación institucional",
        descripcion: "Comunicación oficial informando la nueva incorporación a las instancias involucradas",
        obligatoria: false,
        tiposAceptados: ["pdf", "docx"],
      },
    ],
    documentosGenerados: [],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Comunicación realizada — iniciar vinculación e inducción",
        descripcion: "La contratación fue comunicada. Se inicia el proceso de vinculación e inducción.",
        pasoSiguiente: 27,
        etapaSiguiente: "vinculacion_induccion",
        notificarA: ["jefe_rrhh", "jefe_area"],
        colorBoton: "primario",
        requiereConfirmacion: false,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "enviar_notificacion",
        descripcion: "Notificar a TI para creación de cuenta y credenciales del nuevo colaborador",
        payload: { destinatario: "sistema", tipo: "tarea_asignada", mensaje: "Crear credenciales del nuevo colaborador" },
      },
      {
        tipo: "registrar_kpi",
        descripcion: "Registrar KPI de tiempo total del proceso de reclutamiento",
        payload: { kpi: "tiempo_reclutamiento" },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA: VINCULACIÓN E INDUCCIÓN (paso 27)
  // ─────────────────────────────────────────────────────────────────────────
  {
    numero: 27,
    actividad: "Iniciar Procedimiento de Vinculación e Inducción",
    instrucciones:
      "Active el Procedimiento de Vinculación e Inducción del nuevo colaborador. Complete la Ficha de Empleado (o Ficha de Docente Hora Clase según corresponda). Configure los accesos institucionales (SIUPE, Office 365, correo). Registre la fecha de inicio de labores y cierre formalmente el proceso PRO-TH-001.",
    responsable: "jefe_rrhh",
    duracionEstimadaDias: 5,
    esDecision: false,
    precondiciones: ["El contrato debe estar firmado y la comunicación institucional enviada (Paso 26)"],
    validaciones: [
      {
        id: "v27-ficha-empleado",
        descripcion: "Debe completarse la Ficha de Empleado o Ficha de Docente según el tipo de contratación",
        tipo: "campo_requerido",
        campo: "fichaEmpleadoId",
        obligatoria: true,
      },
    ],
    evidenciasRequeridas: [
      {
        id: "ev27-acta-induccion",
        nombre: "Acta de inducción institucional",
        descripcion: "Registro de la inducción realizada con temas cubiertos y firma del colaborador",
        obligatoria: true,
        tiposAceptados: ["pdf"],
      },
    ],
    documentosGenerados: [
      {
        id: "doc27-ficha-empleado",
        nombre: "Ficha de Empleado",
        descripcion: "Ficha de registro del nuevo colaborador en UPES",
        automatico: false,
        plantilla: "FichaEmpleado",
      },
    ],
    transiciones: [
      {
        condicion: "completado",
        etiqueta: "Proceso completado — PRO-TH-001 cerrado",
        descripcion: "El proceso de reclutamiento, selección y contratación ha sido completado exitosamente.",
        pasoSiguiente: "completado",
        etapaSiguiente: "completado",
        notificarA: ["jefe_area", "rector"],
        colorBoton: "exito",
        requiereConfirmacion: true,
        requiereNotas: false,
      },
    ],
    accionesAlEntrar: [
      {
        tipo: "crear_tarea",
        descripcion: "Tarea de inducción institucional",
        payload: { titulo: "Realizar inducción institucional al nuevo colaborador", responsable: "jefe_rrhh", diasVencimiento: 5 },
      },
      {
        tipo: "registrar_kpi",
        descripcion: "Registrar KPI de cierre del proceso completo",
        payload: { kpi: "proceso_completado" },
      },
    ],
    escalacion: {
      diasSinActividad: 10,
      notificarA: ["rector"],
      mensaje: "El proceso de vinculación e inducción no ha sido completado en el plazo establecido.",
      accion: "notificar",
    },
  },
];

// ── Lookup por número de paso ─────────────────────────────────────────────────

export function getStepSpec(numero: number): StepSpec | undefined {
  return ENGINE_PRO_TH_001.find((s) => s.numero === numero);
}

// ── Cálculo de porcentaje de completitud ──────────────────────────────────────

export function calcularCompletitud(pasoActual: number, etapaActual: string): number {
  if (etapaActual === "completado") return 100;
  if (etapaActual === "rechazado" || etapaActual === "suspendido") return 0;
  return Math.round(((pasoActual - 1) / 27) * 100);
}

// ── Pasos completados vs total ────────────────────────────────────────────────

export function getPasosCompletados(pasoActual: number, etapaActual: string): number {
  if (etapaActual === "completado") return 27;
  return Math.max(0, pasoActual - 1);
}
