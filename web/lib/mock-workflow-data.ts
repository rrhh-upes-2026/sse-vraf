/**
 * Mock blueprint and instance data for the Hiring workflow (BP-RRHH-001).
 * This represents the Golden Workflow executing through the Workflow Engine.
 * Replace with live data from the Apps Script backend once wired.
 */
import type { ProcessBlueprint, ProcessInstance } from "@/types/workflow";

// ─── Blueprint ────────────────────────────────────────────────────────────────

export const mockHiringBlueprint: ProcessBlueprint = {
  id: "BP-RRHH-001",
  nombre: "Proceso de Contratación",
  version: "1.0.0",
  unidadId: "rrhh",
  description: "Proceso completo de selección y contratación de personal institucional",
  category: "Recursos Humanos",
  initialStageId: "solicitud-plaza",
  createdAt: "2026-01-10T08:00:00.000Z",
  updatedAt: "2026-01-10T08:00:00.000Z",
  globalTransitions: [
    {
      id: "gt-cancel",
      type: "cancel",
      label: "Cancelar proceso",
      toStageId: null,
      requiredPermission: "hr.hiring.manage",
      requiresComment: true,
      confirmationMessage: "¿Está seguro que desea cancelar este proceso de contratación?",
      buttonVariant: "danger",
    },
  ],
  stages: [
    // ── Stage 1: Solicitud de Plaza ──────────────────────────────────────────
    {
      id: "solicitud-plaza",
      orden: 1,
      nombre: "Solicitud de Plaza",
      description: "Documentar y formalizar la necesidad de una nueva plaza",
      activities: [
        {
          id: "act-sol-form",
          label: "Completar formulario de solicitud de plaza",
          type: "form",
          required: true,
          formId: "FORM-SOL-PLAZA-001",
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 2,
        },
        {
          id: "act-sol-justif",
          label: "Adjuntar justificación presupuestaria",
          type: "evidence",
          required: true,
          evidenceCategory: "justificacion",
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 2,
        },
      ],
      validationRules: [
        { id: "vr-sol-1", label: "Formulario completado", type: "mandatory_form", formId: "FORM-SOL-PLAZA-001" },
        { id: "vr-sol-2", label: "Justificación adjunta", type: "min_evidence", count: 1 },
      ],
      transitions: [
        {
          id: "tr-sol-enviar",
          type: "approve",
          label: "Enviar solicitud a revisión",
          toStageId: "revision-requisitos",
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-sol-1", "vr-sol-2"],
          buttonVariant: "primary",
        },
      ],
    },

    // ── Stage 2: Revisión de Requisitos ──────────────────────────────────────
    {
      id: "revision-requisitos",
      orden: 2,
      nombre: "Revisión de Requisitos",
      description: "Validar la solicitud y definir el perfil del candidato",
      activities: [
        {
          id: "act-rev-revision",
          label: "Revisar requisitos de la plaza",
          type: "task",
          required: true,
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 3,
        },
        {
          id: "act-rev-aprobacion",
          label: "Aprobar requisitos",
          type: "approval",
          required: true,
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 3,
        },
      ],
      validationRules: [
        { id: "vr-rev-1", label: "Aprobación de jefatura", type: "required_approval", roleCode: "HEAD" },
        { id: "vr-rev-2", label: "Permiso de aprobación", type: "permission_required", permission: "hr.hiring.approve" },
      ],
      transitions: [
        {
          id: "tr-rev-aprobar",
          type: "approve",
          label: "Aprobar y publicar convocatoria",
          toStageId: "publicacion-convocatoria",
          requiredPermission: "hr.hiring.approve",
          validationRuleIds: ["vr-rev-1", "vr-rev-2"],
          buttonVariant: "success",
        },
        {
          id: "tr-rev-rechazar",
          type: "reject",
          label: "Rechazar solicitud",
          toStageId: null,
          requiredPermission: "hr.hiring.approve",
          requiresComment: true,
          buttonVariant: "danger",
        },
      ],
    },

    // ── Stage 3: Publicación de Convocatoria ─────────────────────────────────
    {
      id: "publicacion-convocatoria",
      orden: 3,
      nombre: "Publicación de Convocatoria",
      description: "Publicar la convocatoria en los medios institucionales",
      activities: [
        {
          id: "act-pub-aviso",
          label: "Redactar aviso de convocatoria",
          type: "task",
          required: true,
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 2,
        },
        {
          id: "act-pub-publicar",
          label: "Publicar en plataformas oficiales",
          type: "evidence",
          required: true,
          evidenceCategory: "publicacion",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 3,
        },
      ],
      validationRules: [
        { id: "vr-pub-1", label: "Comprobante de publicación", type: "min_evidence", count: 1 },
      ],
      transitions: [
        {
          id: "tr-pub-confirmar",
          type: "approve",
          label: "Confirmar publicación",
          toStageId: "recepcion-candidatos",
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-pub-1"],
          buttonVariant: "primary",
        },
      ],
    },

    // ── Stage 4: Recepción de Candidatos ─────────────────────────────────────
    {
      id: "recepcion-candidatos",
      orden: 4,
      nombre: "Recepción de Candidatos",
      description: "Período de recepción de aplicaciones y documentación",
      activities: [
        {
          id: "act-rec-expedientes",
          label: "Recibir y organizar expedientes",
          type: "task",
          required: true,
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 15,
        },
        {
          id: "act-rec-registro",
          label: "Registrar candidatos en sistema",
          type: "form",
          required: false,
          formId: "FORM-CANDIDATOS-001",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 15,
        },
      ],
      validationRules: [],
      transitions: [
        {
          id: "tr-rec-cerrar",
          type: "approve",
          label: "Cerrar convocatoria e iniciar evaluación",
          toStageId: "evaluacion-curricular",
          requiredPermission: "hr.hiring.manage",
          buttonVariant: "primary",
        },
      ],
    },

    // ── Stage 5: Evaluación Curricular (CURRENT) ──────────────────────────────
    {
      id: "evaluacion-curricular",
      orden: 5,
      nombre: "Evaluación Curricular",
      description: "Revisión y preselección de candidatos según perfil requerido",
      activities: [
        {
          id: "act-eval-revision",
          label: "Revisar CVs y documentación de candidatos",
          type: "task",
          required: true,
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 5,
        },
        {
          id: "act-eval-preseleccion",
          label: "Elaborar lista de preseleccionados",
          type: "evidence",
          required: true,
          evidenceCategory: "preseleccion",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 7,
        },
        {
          id: "act-eval-puntajes",
          label: "Completar tabla de puntajes",
          type: "form",
          required: false,
          formId: "FORM-PUNTAJES-001",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 7,
        },
      ],
      validationRules: [
        { id: "vr-eval-1", label: "Lista de preseleccionados adjunta", type: "min_evidence", count: 1 },
      ],
      transitions: [
        {
          id: "tr-eval-avanzar",
          type: "approve",
          label: "Avanzar a entrevistas",
          toStageId: "entrevistas",
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-eval-1"],
          buttonVariant: "success",
        },
        {
          id: "tr-eval-regresar",
          type: "return",
          label: "Regresar a recepción",
          toStageId: "recepcion-candidatos",
          requiredPermission: "hr.hiring.manage",
          requiresComment: true,
          buttonVariant: "warning",
        },
      ],
    },

    // ── Stage 6: Entrevistas ──────────────────────────────────────────────────
    {
      id: "entrevistas",
      orden: 6,
      nombre: "Entrevistas",
      description: "Proceso de entrevistas con candidatos preseleccionados",
      activities: [
        {
          id: "act-ent-citar",
          label: "Citar a candidatos preseleccionados",
          type: "task",
          required: true,
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 5,
        },
        {
          id: "act-ent-notas",
          label: "Registrar notas de entrevista",
          type: "form",
          required: true,
          formId: "FORM-ENTREVISTA-001",
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 10,
        },
      ],
      validationRules: [
        { id: "vr-ent-1", label: "Formulario de entrevista completado", type: "mandatory_form", formId: "FORM-ENTREVISTA-001" },
      ],
      transitions: [
        {
          id: "tr-ent-finalizar",
          type: "approve",
          label: "Finalizar entrevistas",
          toStageId: "evaluacion-psicologica",
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-ent-1"],
          buttonVariant: "primary",
        },
      ],
    },

    // ── Stage 7: Evaluación Psicológica ──────────────────────────────────────
    {
      id: "evaluacion-psicologica",
      orden: 7,
      nombre: "Evaluación Psicológica",
      description: "Aplicación y análisis de pruebas psicométricas",
      activities: [
        {
          id: "act-psi-programar",
          label: "Programar evaluaciones psicológicas",
          type: "task",
          required: true,
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 3,
        },
        {
          id: "act-psi-reporte",
          label: "Cargar reporte psicológico",
          type: "evidence",
          required: true,
          evidenceCategory: "evaluacion-psicologica",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 7,
        },
      ],
      validationRules: [
        { id: "vr-psi-1", label: "Reporte psicológico adjunto", type: "min_evidence", count: 1 },
      ],
      transitions: [
        {
          id: "tr-psi-avanzar",
          type: "approve",
          label: "Avanzar a selección final",
          toStageId: "seleccion-final",
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-psi-1"],
          buttonVariant: "primary",
        },
      ],
    },

    // ── Stage 8: Selección Final ──────────────────────────────────────────────
    {
      id: "seleccion-final",
      orden: 8,
      nombre: "Selección Final",
      description: "Decisión final sobre el candidato a contratar",
      activities: [
        {
          id: "act-sel-candidato",
          label: "Seleccionar candidato final",
          type: "task",
          required: true,
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 3,
        },
        {
          id: "act-sel-aprobacion",
          label: "Aprobación de selección por jefatura",
          type: "approval",
          required: true,
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 3,
        },
      ],
      validationRules: [
        { id: "vr-sel-1", label: "Aprobación de jefatura requerida", type: "required_approval", roleCode: "HEAD" },
        { id: "vr-sel-2", label: "Permiso de aprobación de contratación", type: "permission_required", permission: "hr.hiring.approve" },
      ],
      transitions: [
        {
          id: "tr-sel-aprobar",
          type: "approve",
          label: "Aprobar selección e iniciar contratación",
          toStageId: "contratacion",
          requiredPermission: "hr.hiring.approve",
          validationRuleIds: ["vr-sel-1", "vr-sel-2"],
          buttonVariant: "success",
        },
        {
          id: "tr-sel-rechazar",
          type: "reject",
          label: "Rechazar y reiniciar proceso",
          toStageId: "evaluacion-curricular",
          requiredPermission: "hr.hiring.approve",
          requiresComment: true,
          buttonVariant: "danger",
        },
      ],
    },

    // ── Stage 9: Contratación ──────────────────────────────────────────────────
    {
      id: "contratacion",
      orden: 9,
      nombre: "Contratación",
      description: "Formalización del contrato laboral",
      activities: [
        {
          id: "act-con-contrato",
          label: "Preparar contrato de trabajo",
          type: "form",
          required: true,
          formId: "FORM-CONTRATO-001",
          assigneeRole: "HEAD",
          dueDaysAfterStageStart: 5,
        },
        {
          id: "act-con-firma",
          label: "Cargar contrato firmado",
          type: "evidence",
          required: true,
          evidenceCategory: "contrato-firmado",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 7,
        },
      ],
      validationRules: [
        { id: "vr-con-1", label: "Formulario de contrato completado", type: "mandatory_form", formId: "FORM-CONTRATO-001" },
        { id: "vr-con-2", label: "Contrato firmado adjunto", type: "min_evidence", count: 1 },
        { id: "vr-con-3", label: "Etapa de selección completada", type: "previous_stage_completed", stageId: "seleccion-final" },
      ],
      transitions: [
        {
          id: "tr-con-completar",
          type: "approve",
          label: "Confirmar contratación",
          toStageId: "induccion",
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-con-1", "vr-con-2", "vr-con-3"],
          buttonVariant: "success",
        },
      ],
    },

    // ── Stage 10: Inducción ────────────────────────────────────────────────────
    {
      id: "induccion",
      orden: 10,
      nombre: "Inducción",
      description: "Proceso de bienvenida e integración del nuevo empleado",
      activities: [
        {
          id: "act-ind-orientacion",
          label: "Orientación institucional",
          type: "task",
          required: true,
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 3,
        },
        {
          id: "act-ind-accesos",
          label: "Configurar accesos y herramientas",
          type: "task",
          required: true,
          assigneeRole: "OPS",
          dueDaysAfterStageStart: 3,
        },
        {
          id: "act-ind-checklist",
          label: "Completar checklist de inducción",
          type: "form",
          required: true,
          formId: "FORM-INDUCCION-001",
          assigneeRole: "ANALYST",
          dueDaysAfterStageStart: 5,
        },
      ],
      validationRules: [
        { id: "vr-ind-1", label: "Checklist de inducción completado", type: "mandatory_form", formId: "FORM-INDUCCION-001" },
      ],
      transitions: [
        {
          id: "tr-ind-completar",
          type: "complete",
          label: "Completar proceso de contratación",
          toStageId: null,
          requiredPermission: "hr.hiring.manage",
          validationRuleIds: ["vr-ind-1"],
          buttonVariant: "success",
          confirmationMessage: "¿Confirma que el proceso de inducción ha sido completado satisfactoriamente?",
        },
      ],
    },
  ],
};

// ─── Instance (currently at evaluacion-curricular, stages 1-4 completed) ────

const T = (d: string) => `2026-${d}`;

export const mockHiringInstance: ProcessInstance = {
  id: "INST-RH-001",
  blueprintId: "BP-RRHH-001",
  blueprintVersion: "1.0.0",
  blueprintName: "Proceso de Contratación",
  unidadId: "rrhh",
  nombre: "Contratación Docente — Plaza Ing. Industrial 2026",
  estado: "in_progress",
  currentStageId: "evaluacion-curricular",
  createdAt: T("06-01T08:00:00.000Z"),
  createdBy: "USR-RH-012",
  createdByName: "J. Ramírez",
  updatedAt: T("07-05T14:30:00.000Z"),
  evidencias: ["ev-preseleccion-001"],
  contextData: { plazaId: "PLAZA-ING-2026", departamento: "Ingeniería Industrial" },
  assignedUsers: [
    { userId: "USR-RH-012", userName: "J. Ramírez", roleInWorkflow: "Responsable", assignedAt: T("06-01T08:00:00.000Z") },
    { userId: "USR-VRAF-001", userName: "M. Villalta", roleInWorkflow: "Aprobador", assignedAt: T("06-01T08:00:00.000Z") },
  ],
  stages: [
    // ── Stage 1: Completada ────────────────────────────────────────────────
    {
      defId: "solicitud-plaza",
      label: "Solicitud de Plaza",
      orden: 1,
      estado: "completada",
      startedAt: T("06-01T08:00:00.000Z"),
      completedAt: T("06-02T16:30:00.000Z"),
      approvedBy: "USR-RH-012",
      activities: [
        {
          defId: "act-sol-form",
          label: "Completar formulario de solicitud de plaza",
          type: "form",
          required: true,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          formId: "FORM-SOL-PLAZA-001",
          formSubmission: { plaza: "Docente Ing. Industrial", justificacion: "Plaza vacante por retiro", nivelSalarial: "B3" },
          startedAt: T("06-01T08:00:00.000Z"),
          completedAt: T("06-01T14:00:00.000Z"),
          completedBy: "USR-RH-012",
        },
        {
          defId: "act-sol-justif",
          label: "Adjuntar justificación presupuestaria",
          type: "evidence",
          required: true,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          evidenceCategory: "justificacion",
          attachments: ["ev-justif-presup-001.pdf"],
          startedAt: T("06-01T14:00:00.000Z"),
          completedAt: T("06-02T10:00:00.000Z"),
          completedBy: "USR-RH-012",
        },
      ],
    },

    // ── Stage 2: Completada ────────────────────────────────────────────────
    {
      defId: "revision-requisitos",
      label: "Revisión de Requisitos",
      orden: 2,
      estado: "completada",
      startedAt: T("06-02T16:30:00.000Z"),
      completedAt: T("06-05T11:00:00.000Z"),
      approvedBy: "USR-VRAF-001",
      activities: [
        {
          defId: "act-rev-revision",
          label: "Revisar requisitos de la plaza",
          type: "task",
          required: true,
          estado: "completada",
          assigneeId: "USR-VRAF-001",
          assigneeName: "M. Villalta",
          startedAt: T("06-02T16:30:00.000Z"),
          completedAt: T("06-04T09:00:00.000Z"),
          completedBy: "USR-VRAF-001",
        },
        {
          defId: "act-rev-aprobacion",
          label: "Aprobar requisitos",
          type: "approval",
          required: true,
          estado: "completada",
          assigneeId: "USR-VRAF-001",
          assigneeName: "M. Villalta",
          startedAt: T("06-04T09:00:00.000Z"),
          completedAt: T("06-05T11:00:00.000Z"),
          completedBy: "USR-VRAF-001",
        },
      ],
    },

    // ── Stage 3: Completada ────────────────────────────────────────────────
    {
      defId: "publicacion-convocatoria",
      label: "Publicación de Convocatoria",
      orden: 3,
      estado: "completada",
      startedAt: T("06-05T11:00:00.000Z"),
      completedAt: T("06-08T17:00:00.000Z"),
      approvedBy: "USR-RH-012",
      activities: [
        {
          defId: "act-pub-aviso",
          label: "Redactar aviso de convocatoria",
          type: "task",
          required: true,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          startedAt: T("06-05T11:00:00.000Z"),
          completedAt: T("06-06T15:00:00.000Z"),
          completedBy: "USR-RH-012",
        },
        {
          defId: "act-pub-publicar",
          label: "Publicar en plataformas oficiales",
          type: "evidence",
          required: true,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          evidenceCategory: "publicacion",
          attachments: ["ev-publicacion-web-001.pdf", "ev-publicacion-cartelera-001.jpg"],
          startedAt: T("06-06T15:00:00.000Z"),
          completedAt: T("06-08T17:00:00.000Z"),
          completedBy: "USR-RH-012",
        },
      ],
    },

    // ── Stage 4: Completada ────────────────────────────────────────────────
    {
      defId: "recepcion-candidatos",
      label: "Recepción de Candidatos",
      orden: 4,
      estado: "completada",
      startedAt: T("06-08T17:00:00.000Z"),
      completedAt: T("07-01T17:00:00.000Z"),
      approvedBy: "USR-RH-012",
      activities: [
        {
          defId: "act-rec-expedientes",
          label: "Recibir y organizar expedientes",
          type: "task",
          required: true,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          startedAt: T("06-08T17:00:00.000Z"),
          completedAt: T("07-01T16:00:00.000Z"),
          completedBy: "USR-RH-012",
          comments: [
            {
              id: "cmt-001",
              authorId: "USR-RH-012",
              authorName: "J. Ramírez",
              texto: "Se recibieron 14 expedientes. Todos fueron digitalizados y clasificados.",
              creadoEn: T("07-01T16:00:00.000Z"),
            },
          ],
        },
        {
          defId: "act-rec-registro",
          label: "Registrar candidatos en sistema",
          type: "form",
          required: false,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          formId: "FORM-CANDIDATOS-001",
          formSubmission: { totalCandidatos: 14, aptosPerfil: 9 },
          startedAt: T("07-01T16:00:00.000Z"),
          completedAt: T("07-01T17:00:00.000Z"),
          completedBy: "USR-RH-012",
        },
      ],
    },

    // ── Stage 5: ACTIVE (current) ──────────────────────────────────────────
    {
      defId: "evaluacion-curricular",
      label: "Evaluación Curricular",
      orden: 5,
      estado: "activa",
      startedAt: T("07-01T17:00:00.000Z"),
      activities: [
        {
          defId: "act-eval-revision",
          label: "Revisar CVs y documentación de candidatos",
          type: "task",
          required: true,
          estado: "completada",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          startedAt: T("07-02T08:00:00.000Z"),
          completedAt: T("07-04T17:00:00.000Z"),
          completedBy: "USR-RH-012",
          comments: [
            {
              id: "cmt-002",
              authorId: "USR-RH-012",
              authorName: "J. Ramírez",
              texto: "Revisados 9 expedientes. 6 cumplen perfil mínimo requerido.",
              creadoEn: T("07-04T17:00:00.000Z"),
            },
          ],
        },
        {
          defId: "act-eval-preseleccion",
          label: "Elaborar lista de preseleccionados",
          type: "evidence",
          required: true,
          estado: "en_progreso",
          assigneeId: "USR-RH-012",
          assigneeName: "J. Ramírez",
          evidenceCategory: "preseleccion",
          startedAt: T("07-05T08:00:00.000Z"),
          dueDate: T("07-08T17:00:00.000Z"),
        },
        {
          defId: "act-eval-puntajes",
          label: "Completar tabla de puntajes",
          type: "form",
          required: false,
          estado: "pendiente",
          formId: "FORM-PUNTAJES-001",
          dueDate: T("07-08T17:00:00.000Z"),
        },
      ],
    },

    // ── Stages 6–10: Pendientes ────────────────────────────────────────────
    {
      defId: "entrevistas",
      label: "Entrevistas",
      orden: 6,
      estado: "pendiente",
      activities: [
        { defId: "act-ent-citar", label: "Citar a candidatos preseleccionados", type: "task", required: true, estado: "pendiente" },
        { defId: "act-ent-notas", label: "Registrar notas de entrevista", type: "form", required: true, estado: "pendiente", formId: "FORM-ENTREVISTA-001" },
      ],
    },
    {
      defId: "evaluacion-psicologica",
      label: "Evaluación Psicológica",
      orden: 7,
      estado: "pendiente",
      activities: [
        { defId: "act-psi-programar", label: "Programar evaluaciones psicológicas", type: "task", required: true, estado: "pendiente" },
        { defId: "act-psi-reporte", label: "Cargar reporte psicológico", type: "evidence", required: true, estado: "pendiente", evidenceCategory: "evaluacion-psicologica" },
      ],
    },
    {
      defId: "seleccion-final",
      label: "Selección Final",
      orden: 8,
      estado: "pendiente",
      activities: [
        { defId: "act-sel-candidato", label: "Seleccionar candidato final", type: "task", required: true, estado: "pendiente" },
        { defId: "act-sel-aprobacion", label: "Aprobación de selección por jefatura", type: "approval", required: true, estado: "pendiente" },
      ],
    },
    {
      defId: "contratacion",
      label: "Contratación",
      orden: 9,
      estado: "pendiente",
      activities: [
        { defId: "act-con-contrato", label: "Preparar contrato de trabajo", type: "form", required: true, estado: "pendiente", formId: "FORM-CONTRATO-001" },
        { defId: "act-con-firma", label: "Cargar contrato firmado", type: "evidence", required: true, estado: "pendiente", evidenceCategory: "contrato-firmado" },
      ],
    },
    {
      defId: "induccion",
      label: "Inducción",
      orden: 10,
      estado: "pendiente",
      activities: [
        { defId: "act-ind-orientacion", label: "Orientación institucional", type: "task", required: true, estado: "pendiente" },
        { defId: "act-ind-accesos", label: "Configurar accesos y herramientas", type: "task", required: true, estado: "pendiente" },
        { defId: "act-ind-checklist", label: "Completar checklist de inducción", type: "form", required: true, estado: "pendiente", formId: "FORM-INDUCCION-001" },
      ],
    },
  ],
  auditLog: [
    { id: "evt-001", instanceId: "INST-RH-001", type: "WorkflowCreated", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { nombre: "Contratación Docente — Plaza Ing. Industrial 2026", blueprintId: "BP-RRHH-001" }, occurredAt: T("06-01T08:00:00.000Z") },
    { id: "evt-002", instanceId: "INST-RH-001", type: "WorkflowStarted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: {}, occurredAt: T("06-01T08:00:00.000Z") },
    { id: "evt-003", instanceId: "INST-RH-001", type: "StageStarted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageId: "solicitud-plaza", stageLabel: "Solicitud de Plaza" }, occurredAt: T("06-01T08:00:00.000Z") },
    { id: "evt-004", instanceId: "INST-RH-001", type: "ActivityAssigned", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { activityLabel: "Completar formulario de solicitud de plaza", assigneeName: "J. Ramírez" }, occurredAt: T("06-01T08:05:00.000Z") },
    { id: "evt-005", instanceId: "INST-RH-001", type: "FormSubmitted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { formLabel: "Solicitud de Plaza", formId: "FORM-SOL-PLAZA-001" }, occurredAt: T("06-01T14:00:00.000Z") },
    { id: "evt-006", instanceId: "INST-RH-001", type: "EvidenceValidated", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { fileName: "ev-justif-presup-001.pdf" }, occurredAt: T("06-02T10:00:00.000Z") },
    { id: "evt-007", instanceId: "INST-RH-001", type: "TransitionExecuted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { transitionLabel: "Enviar solicitud a revisión", transitionType: "approve" }, occurredAt: T("06-02T16:30:00.000Z") },
    { id: "evt-008", instanceId: "INST-RH-001", type: "StageCompleted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageLabel: "Solicitud de Plaza" }, occurredAt: T("06-02T16:30:00.000Z") },
    { id: "evt-009", instanceId: "INST-RH-001", type: "StageStarted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageId: "revision-requisitos", stageLabel: "Revisión de Requisitos" }, occurredAt: T("06-02T16:30:00.000Z") },
    { id: "evt-010", instanceId: "INST-RH-001", type: "ApprovalGranted", actorId: "USR-VRAF-001", actorName: "M. Villalta", payload: { approverName: "M. Villalta" }, occurredAt: T("06-05T11:00:00.000Z") },
    { id: "evt-011", instanceId: "INST-RH-001", type: "TransitionExecuted", actorId: "USR-VRAF-001", actorName: "M. Villalta", payload: { transitionLabel: "Aprobar y publicar convocatoria", transitionType: "approve" }, occurredAt: T("06-05T11:00:00.000Z") },
    { id: "evt-012", instanceId: "INST-RH-001", type: "StageCompleted", actorId: "USR-VRAF-001", actorName: "M. Villalta", payload: { stageLabel: "Revisión de Requisitos" }, occurredAt: T("06-05T11:00:00.000Z") },
    { id: "evt-013", instanceId: "INST-RH-001", type: "StageStarted", actorId: "USR-VRAF-001", actorName: "M. Villalta", payload: { stageId: "publicacion-convocatoria", stageLabel: "Publicación de Convocatoria" }, occurredAt: T("06-05T11:00:00.000Z") },
    { id: "evt-014", instanceId: "INST-RH-001", type: "EvidenceValidated", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { fileName: "ev-publicacion-web-001.pdf" }, occurredAt: T("06-08T17:00:00.000Z") },
    { id: "evt-015", instanceId: "INST-RH-001", type: "TransitionExecuted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { transitionLabel: "Confirmar publicación", transitionType: "approve" }, occurredAt: T("06-08T17:00:00.000Z") },
    { id: "evt-016", instanceId: "INST-RH-001", type: "StageCompleted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageLabel: "Publicación de Convocatoria" }, occurredAt: T("06-08T17:00:00.000Z") },
    { id: "evt-017", instanceId: "INST-RH-001", type: "StageStarted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageId: "recepcion-candidatos", stageLabel: "Recepción de Candidatos" }, occurredAt: T("06-08T17:00:00.000Z") },
    { id: "evt-018", instanceId: "INST-RH-001", type: "CommentAdded", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { authorName: "J. Ramírez", texto: "Se recibieron 14 expedientes." }, occurredAt: T("07-01T16:00:00.000Z") },
    { id: "evt-019", instanceId: "INST-RH-001", type: "TransitionExecuted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { transitionLabel: "Cerrar convocatoria e iniciar evaluación", transitionType: "approve" }, occurredAt: T("07-01T17:00:00.000Z") },
    { id: "evt-020", instanceId: "INST-RH-001", type: "StageCompleted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageLabel: "Recepción de Candidatos" }, occurredAt: T("07-01T17:00:00.000Z") },
    { id: "evt-021", instanceId: "INST-RH-001", type: "StageStarted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { stageId: "evaluacion-curricular", stageLabel: "Evaluación Curricular" }, occurredAt: T("07-01T17:00:00.000Z") },
    { id: "evt-022", instanceId: "INST-RH-001", type: "ActivityCompleted", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { activityLabel: "Revisar CVs y documentación de candidatos" }, occurredAt: T("07-04T17:00:00.000Z") },
    { id: "evt-023", instanceId: "INST-RH-001", type: "CommentAdded", actorId: "USR-RH-012", actorName: "J. Ramírez", payload: { authorName: "J. Ramírez", texto: "Revisados 9 expedientes. 6 cumplen perfil mínimo requerido." }, occurredAt: T("07-04T17:00:00.000Z") },
  ],
  timeline: [
    { id: "evt-001-tl", eventType: "WorkflowCreated", title: "Workflow creado: Contratación Docente — Plaza Ing. Industrial 2026", actorName: "J. Ramírez", timestamp: T("06-01T08:00:00.000Z"), color: "#2E6BE6", iconPath: "M12 4v16m8-8H4" },
    { id: "evt-002-tl", eventType: "WorkflowStarted", title: "Proceso iniciado", actorName: "J. Ramírez", timestamp: T("06-01T08:00:00.000Z"), color: "#2E6BE6", iconPath: "M5 12l7-7 7 7M5 12l7 7 7-7" },
    { id: "evt-003-tl", eventType: "StageStarted", title: "Etapa iniciada: Solicitud de Plaza", actorName: "J. Ramírez", timestamp: T("06-01T08:00:00.000Z"), color: "#0F8A8A", iconPath: "M9 5l7 7-7 7" },
    { id: "evt-005-tl", eventType: "FormSubmitted", title: "Formulario completado: Solicitud de Plaza", actorName: "J. Ramírez", timestamp: T("06-01T14:00:00.000Z"), color: "#5B4FD0", iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { id: "evt-006-tl", eventType: "EvidenceValidated", title: "Evidencia validada: ev-justif-presup-001.pdf", actorName: "J. Ramírez", timestamp: T("06-02T10:00:00.000Z"), color: "#12A150", iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { id: "evt-007-tl", eventType: "TransitionExecuted", title: "Transición ejecutada: Enviar solicitud a revisión", actorName: "J. Ramírez", timestamp: T("06-02T16:30:00.000Z"), color: "#2E6BE6", iconPath: "M13 5l7 7-7 7M5 5l7 7-7 7" },
    { id: "evt-008-tl", eventType: "StageCompleted", title: "Etapa completada: Solicitud de Plaza", actorName: "J. Ramírez", timestamp: T("06-02T16:30:00.000Z"), color: "#12A150", iconPath: "M5 13l4 4L19 7" },
    { id: "evt-009-tl", eventType: "StageStarted", title: "Etapa iniciada: Revisión de Requisitos", actorName: "J. Ramírez", timestamp: T("06-02T16:30:00.000Z"), color: "#0F8A8A", iconPath: "M9 5l7 7-7 7" },
    { id: "evt-010-tl", eventType: "ApprovalGranted", title: "Aprobación concedida por M. Villalta", actorName: "M. Villalta", timestamp: T("06-05T11:00:00.000Z"), color: "#12A150", iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" },
    { id: "evt-011-tl", eventType: "TransitionExecuted", title: "Transición ejecutada: Aprobar y publicar convocatoria", actorName: "M. Villalta", timestamp: T("06-05T11:00:00.000Z"), color: "#2E6BE6", iconPath: "M13 5l7 7-7 7M5 5l7 7-7 7" },
    { id: "evt-012-tl", eventType: "StageCompleted", title: "Etapa completada: Revisión de Requisitos", actorName: "M. Villalta", timestamp: T("06-05T11:00:00.000Z"), color: "#12A150", iconPath: "M5 13l4 4L19 7" },
    { id: "evt-013-tl", eventType: "StageStarted", title: "Etapa iniciada: Publicación de Convocatoria", actorName: "M. Villalta", timestamp: T("06-05T11:00:00.000Z"), color: "#0F8A8A", iconPath: "M9 5l7 7-7 7" },
    { id: "evt-014-tl", eventType: "EvidenceValidated", title: "Evidencia validada: ev-publicacion-web-001.pdf", actorName: "J. Ramírez", timestamp: T("06-08T17:00:00.000Z"), color: "#12A150", iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { id: "evt-015-tl", eventType: "TransitionExecuted", title: "Transición ejecutada: Confirmar publicación", actorName: "J. Ramírez", timestamp: T("06-08T17:00:00.000Z"), color: "#2E6BE6", iconPath: "M13 5l7 7-7 7M5 5l7 7-7 7" },
    { id: "evt-016-tl", eventType: "StageCompleted", title: "Etapa completada: Publicación de Convocatoria", actorName: "J. Ramírez", timestamp: T("06-08T17:00:00.000Z"), color: "#12A150", iconPath: "M5 13l4 4L19 7" },
    { id: "evt-017-tl", eventType: "StageStarted", title: "Etapa iniciada: Recepción de Candidatos", actorName: "J. Ramírez", timestamp: T("06-08T17:00:00.000Z"), color: "#0F8A8A", iconPath: "M9 5l7 7-7 7" },
    { id: "evt-018-tl", eventType: "CommentAdded", title: "Comentario de J. Ramírez", actorName: "J. Ramírez", timestamp: T("07-01T16:00:00.000Z"), color: "#718096", iconPath: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { id: "evt-019-tl", eventType: "TransitionExecuted", title: "Transición ejecutada: Cerrar convocatoria e iniciar evaluación", actorName: "J. Ramírez", timestamp: T("07-01T17:00:00.000Z"), color: "#2E6BE6", iconPath: "M13 5l7 7-7 7M5 5l7 7-7 7" },
    { id: "evt-020-tl", eventType: "StageCompleted", title: "Etapa completada: Recepción de Candidatos", actorName: "J. Ramírez", timestamp: T("07-01T17:00:00.000Z"), color: "#12A150", iconPath: "M5 13l4 4L19 7" },
    { id: "evt-021-tl", eventType: "StageStarted", title: "Etapa iniciada: Evaluación Curricular", actorName: "J. Ramírez", timestamp: T("07-01T17:00:00.000Z"), color: "#0F8A8A", iconPath: "M9 5l7 7-7 7" },
    { id: "evt-022-tl", eventType: "ActivityCompleted", title: "Actividad completada: Revisar CVs y documentación de candidatos", actorName: "J. Ramírez", timestamp: T("07-04T17:00:00.000Z"), color: "#12A150", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "evt-023-tl", eventType: "CommentAdded", title: "Comentario de J. Ramírez", actorName: "J. Ramírez", timestamp: T("07-04T17:00:00.000Z"), color: "#718096", iconPath: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  ],
};

export const mockWorkflowBlueprints: ProcessBlueprint[] = [mockHiringBlueprint];
export const mockWorkflowInstances: ProcessInstance[] = [mockHiringInstance];
