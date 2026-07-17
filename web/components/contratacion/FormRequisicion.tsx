"use client";

/**
 * Formulario de Requisición de Personal — PRO-TH-001 / Paso 8
 *
 * Cinco secciones exactamente como en el documento institucional:
 *   I.   Datos del Área Solicitante
 *   II.  Especificaciones de la Requisición
 *   III. Definición del Puesto
 *   IV.  Perfil Requerido (con Matriz de Competencias de 30 ítems en 6 categorías)
 *   V.   Firmas
 */

import { useState, useEffect } from "react";
import { useRequisicion, useGuardarRequisicion } from "@/hooks/useContratacion";
import type { RequisicionPersonal, MatrizCompetencias } from "@/types/contratacion";

// ── Matriz de competencias — 30 ítems en 6 categorías ────────────────────────

interface CompetenciaItem {
  key: keyof MatrizCompetencias;
  label: string;
}

interface CategoriaCompetencias {
  titulo: string;
  items: CompetenciaItem[];
}

const CATEGORIAS_COMPETENCIAS: CategoriaCompetencias[] = [
  {
    titulo: "Análisis y Pensamiento Crítico",
    items: [
      { key: "comprensionVerbalEscrita",   label: "Comprensión verbal y escrita" },
      { key: "seguimientoProcedimientos",   label: "Seguimiento a procedimientos" },
      { key: "interpretacionNormativas",    label: "Interpretación de normativas" },
      { key: "manejoInformacion",           label: "Manejo de información" },
      { key: "capacidadSintesis",           label: "Capacidad de síntesis" },
    ],
  },
  {
    titulo: "Liderazgo y Gestión",
    items: [
      { key: "manejoPersonalGrupos",        label: "Manejo de personal y grupos" },
      { key: "tomaDecisionesBajoPresion",   label: "Toma de decisiones bajo presión" },
      { key: "poderPersonal",               label: "Poder personal" },
      { key: "negociacionMediacion",        label: "Negociación y mediación" },
      { key: "delegacionEfectiva",          label: "Delegación efectiva" },
    ],
  },
  {
    titulo: "Comunicación",
    items: [
      { key: "facilidadPalabra",            label: "Facilidad de palabra" },
      { key: "dominioPúblico",              label: "Dominio público" },
      { key: "redaccionTecnica",            label: "Redacción técnica" },
      { key: "asertividad",                 label: "Asertividad" },
      { key: "empatiaServicio",             label: "Empatía y servicio" },
    ],
  },
  {
    titulo: "Planeación y Organización",
    items: [
      { key: "iniciativaProactividad",      label: "Iniciativa y proactividad" },
      { key: "orientacionResultados",       label: "Orientación a resultados" },
      { key: "trabajoEquipo",              label: "Trabajo en equipo" },
      { key: "adaptabilidadCambios",        label: "Adaptabilidad a cambios" },
      { key: "optimizacionTiempo",          label: "Optimización del tiempo" },
    ],
  },
  {
    titulo: "Competencias Académicas",
    items: [
      { key: "planificacionDidactica",      label: "Planificación didáctica" },
      { key: "disenoInstrumentos",          label: "Diseño de instrumentos" },
      { key: "metodologiasInvestigacion",   label: "Metodologías de investigación" },
      { key: "actualizacionConstante",      label: "Actualización constante" },
      { key: "eticaProfesional",            label: "Ética profesional" },
    ],
  },
  {
    titulo: "Competencias Digitales",
    items: [
      { key: "dominioOffice365",            label: "Dominio Office 365" },
      { key: "inteligenciaArtificial",      label: "Inteligencia artificial" },
      { key: "baseDatos",                   label: "Base de datos" },
      { key: "ciberseguridad",              label: "Ciberseguridad" },
      { key: "manejoPlatformas",            label: "Manejo de plataformas" },
    ],
  },
];

const COMPETENCIAS_VACIAS: MatrizCompetencias = {
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
};

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function SectionTitle({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        marginTop: 28,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "rgba(46,107,230,0.18)",
          color: "#2E6BE6",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {numero}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>
        {titulo}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function Campo({
  label,
  required,
  children,
  ancho = "100%",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  ancho?: string;
}) {
  return (
    <div style={{ width: ancho, marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 5,
          letterSpacing: "0.02em",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 11px",
  borderRadius: 7,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 72,
  fontFamily: "inherit",
  lineHeight: 1.5,
};

// ── Componente principal ──────────────────────────────────────────────────────

interface FormRequisicionProps {
  procesoId: string;
  requisicionId?: string;
  wsId: string;
  soloLectura?: boolean;
}

export function FormRequisicion({ procesoId, wsId, soloLectura = false }: FormRequisicionProps) {
  const { data: requisicion, isLoading } = useRequisicion(procesoId);
  const guardar = useGuardarRequisicion(procesoId);

  const [form, setForm] = useState<Partial<RequisicionPersonal>>({
    procesoId,
    estado: "borrador",
    competencias: { ...COMPETENCIAS_VACIAS },
  });

  const [guardado, setGuardado] = useState(false);

  // Poblar desde datos existentes cuando llegan
  useEffect(() => {
    if (requisicion) {
      setForm(requisicion);
    }
  }, [requisicion]);

  function setField<K extends keyof RequisicionPersonal>(key: K, value: RequisicionPersonal[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setGuardado(false);
  }

  function toggleCompetencia(key: keyof MatrizCompetencias) {
    setForm((prev) => ({
      ...prev,
      competencias: {
        ...COMPETENCIAS_VACIAS,
        ...prev.competencias,
        [key]: !prev.competencias?.[key],
      },
    }));
    setGuardado(false);
  }

  async function handleGuardar(estado: "borrador" | "enviada") {
    await guardar.mutateAsync({ ...form, estado });
    setGuardado(true);
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
        Cargando formulario…
      </div>
    );
  }

  const disabled = soloLectura || guardar.isPending;
  const competencias = form.competencias ?? COMPETENCIAS_VACIAS;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 780 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>
          Formulario de Requisición de Personal
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          PRO-TH-001 · Paso 8 — Formulario institucional de solicitud de contratación
        </div>
      </div>

      {/* ── I. Datos del Área Solicitante ── */}
      <SectionTitle numero="I" titulo="Datos del Área Solicitante" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Campo label="Unidad / Facultad" required ancho="100%">
          <input
            style={inputStyle}
            value={form.unidadFacultad ?? ""}
            onChange={(e) => setField("unidadFacultad", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Facultad de Ingeniería"
          />
        </Campo>
        <Campo label="Nombre del solicitante" required ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.nombreSolicitante ?? ""}
            onChange={(e) => setField("nombreSolicitante", e.target.value)}
            disabled={disabled}
          />
        </Campo>
        <Campo label="Cargo del solicitante" required ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.cargoSolicitante ?? ""}
            onChange={(e) => setField("cargoSolicitante", e.target.value)}
            disabled={disabled}
          />
        </Campo>
        <Campo label="Fecha de solicitud" required ancho="calc(33% - 8px)">
          <input
            type="date"
            style={inputStyle}
            value={form.fechaSolicitud ?? ""}
            onChange={(e) => setField("fechaSolicitud", e.target.value)}
            disabled={disabled}
          />
        </Campo>
        <Campo label="Período desde" ancho="calc(33% - 8px)">
          <input
            type="date"
            style={inputStyle}
            value={form.periodoDesde ?? ""}
            onChange={(e) => setField("periodoDesde", e.target.value)}
            disabled={disabled}
          />
        </Campo>
        <Campo label="Período hasta" ancho="calc(33% - 8px)">
          <input
            type="date"
            style={inputStyle}
            value={form.periodoHasta ?? ""}
            onChange={(e) => setField("periodoHasta", e.target.value)}
            disabled={disabled}
          />
        </Campo>
      </div>

      {/* ── II. Especificaciones de la Requisición ── */}
      <SectionTitle numero="II" titulo="Especificaciones de la Requisición" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Campo label="Tipo de requisición" required ancho="calc(50% - 6px)">
          <select
            style={selectStyle}
            value={form.tipoRequisicion ?? ""}
            onChange={(e) => setField("tipoRequisicion", e.target.value as RequisicionPersonal["tipoRequisicion"])}
            disabled={disabled}
          >
            <option value="">Seleccionar…</option>
            <option value="nueva_plaza">Nueva plaza</option>
            <option value="cobertura_vacante">Cobertura de vacante</option>
          </select>
        </Campo>
        <Campo label="Tipo de contratación" required ancho="calc(50% - 6px)">
          <select
            style={selectStyle}
            value={form.tipoContratacion ?? ""}
            onChange={(e) => setField("tipoContratacion", e.target.value as RequisicionPersonal["tipoContratacion"])}
            disabled={disabled}
          >
            <option value="">Seleccionar…</option>
            <option value="permanente">Permanente</option>
            <option value="interino">Interino</option>
            <option value="eventual">Eventual</option>
          </select>
        </Campo>
        <Campo label="Motivo de la vacante" ancho="calc(50% - 6px)">
          <select
            style={selectStyle}
            value={form.motivoVacante ?? ""}
            onChange={(e) => setField("motivoVacante", e.target.value as RequisicionPersonal["motivoVacante"])}
            disabled={disabled}
          >
            <option value="">Seleccionar…</option>
            <option value="retiro_voluntario">Retiro voluntario</option>
            <option value="terminacion_contrato">Terminación de contrato</option>
            <option value="cancelacion_contrato">Cancelación de contrato</option>
            <option value="promocion_traslado">Promoción / traslado</option>
            <option value="permiso_licencia">Permiso / licencia</option>
            <option value="incapacidad_enfermedad">Incapacidad por enfermedad</option>
            <option value="incapacidad_maternidad">Incapacidad por maternidad</option>
            <option value="otro">Otro</option>
          </select>
        </Campo>
        {form.motivoVacante === "otro" && (
          <Campo label="Especifique el motivo" ancho="calc(50% - 6px)">
            <input
              style={inputStyle}
              value={form.motivoVacanteOtro ?? ""}
              onChange={(e) => setField("motivoVacanteOtro", e.target.value)}
              disabled={disabled}
            />
          </Campo>
        )}
      </div>

      {/* ── III. Definición del Puesto ── */}
      <SectionTitle numero="III" titulo="Definición del Puesto" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Campo label="Nombre del puesto" required ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.nombrePuesto ?? ""}
            onChange={(e) => setField("nombrePuesto", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Técnico de Soporte IT"
          />
        </Campo>
        <Campo label="Área / Departamento" required ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.areaDepartamento ?? ""}
            onChange={(e) => setField("areaDepartamento", e.target.value)}
            disabled={disabled}
          />
        </Campo>
        <Campo label="Ubicación física" ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.ubicacionFisica ?? ""}
            onChange={(e) => setField("ubicacionFisica", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Edificio A, 2.° piso"
          />
        </Campo>
        <Campo label="Horario / jornada" ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.horarioJornada ?? ""}
            onChange={(e) => setField("horarioJornada", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Lunes a viernes 8:00 a.m. – 5:00 p.m."
          />
        </Campo>
      </div>

      {/* ── IV. Perfil Requerido ── */}
      <SectionTitle numero="IV" titulo="Perfil Requerido" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <Campo label="Escolaridad / Grado académico requerido" required ancho="100%">
          <input
            style={inputStyle}
            value={form.escolaridadGradoAcademico ?? ""}
            onChange={(e) => setField("escolaridadGradoAcademico", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Licenciatura en Ingeniería en Sistemas"
          />
        </Campo>
        <Campo label="Dominio de idiomas" ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.dominioIdiomas ?? ""}
            onChange={(e) => setField("dominioIdiomas", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Inglés técnico (lectura)"
          />
        </Campo>
        <Campo label="Manejo de sistemas / software" ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.manejeSistemas ?? ""}
            onChange={(e) => setField("manejeSistemas", e.target.value)}
            disabled={disabled}
            placeholder="Ej. Office 365, SAP, SIUPE"
          />
        </Campo>
        <Campo label="Experiencia y funciones clave" ancho="100%">
          <textarea
            style={textareaStyle}
            value={form.experienciaFunciones ?? ""}
            onChange={(e) => setField("experienciaFunciones", e.target.value)}
            disabled={disabled}
            placeholder="Describa la experiencia mínima requerida y las principales funciones a desempeñar…"
          />
        </Campo>
      </div>

      {/* Matriz de Competencias */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
          }}
        >
          MATRIZ DE COMPETENCIAS REQUERIDAS
        </div>

        {CATEGORIAS_COMPETENCIAS.map((cat) => (
          <div key={cat.titulo} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              style={{
                padding: "8px 16px",
                fontSize: 11,
                fontWeight: 700,
                color: "#2E6BE6",
                letterSpacing: "0.03em",
                background: "rgba(46,107,230,0.06)",
              }}
            >
              {cat.titulo}
            </div>
            <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {cat.items.map((item) => {
                const checked = competencias[item.key] === true;
                return (
                  <label
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "5px 8px",
                      borderRadius: 6,
                      cursor: disabled ? "default" : "pointer",
                      background: checked ? "rgba(46,107,230,0.1)" : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => !disabled && toggleCompetencia(item.key)}
                      disabled={disabled}
                      style={{ width: 14, height: 14, accentColor: "#2E6BE6", cursor: disabled ? "default" : "pointer" }}
                    />
                    <span style={{ fontSize: 12, color: checked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)" }}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Campo label="Otras habilidades o requisitos específicos">
        <textarea
          style={textareaStyle}
          value={form.otrasHabilidades ?? ""}
          onChange={(e) => setField("otrasHabilidades", e.target.value)}
          disabled={disabled}
          placeholder="Especifique cualquier otro requisito no contemplado en la matriz…"
        />
      </Campo>

      {/* ── V. Firmas ── */}
      <SectionTitle numero="V" titulo="Firmas" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Campo label="Firma: Solicita" ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.firmaSolicita ?? ""}
            onChange={(e) => setField("firmaSolicita", e.target.value)}
            disabled={disabled}
            placeholder="Nombre completo del jefe de área"
          />
        </Campo>
        <Campo label="Firma: Autoriza (RR. HH.)" ancho="calc(50% - 6px)">
          <input
            style={inputStyle}
            value={form.firmaAutoriza ?? ""}
            onChange={(e) => setField("firmaAutoriza", e.target.value)}
            disabled={disabled}
            placeholder="Nombre del Jefe de Recursos Humanos"
          />
        </Campo>
        <Campo label="Nota RR. HH." ancho="100%">
          <textarea
            style={{ ...textareaStyle, minHeight: 56 }}
            value={form.notaRRHH ?? ""}
            onChange={(e) => setField("notaRRHH", e.target.value)}
            disabled={disabled}
            placeholder="Observaciones del departamento de Recursos Humanos…"
          />
        </Campo>
      </div>

      {/* ── Acciones ── */}
      {!soloLectura && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => handleGuardar("borrador")}
            disabled={guardar.isPending}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: 500,
              cursor: guardar.isPending ? "not-allowed" : "pointer",
            }}
          >
            Guardar borrador
          </button>
          <button
            onClick={() => handleGuardar("enviada")}
            disabled={guardar.isPending}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              background: "#2E6BE6",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: guardar.isPending ? "not-allowed" : "pointer",
              opacity: guardar.isPending ? 0.7 : 1,
            }}
          >
            {guardar.isPending ? "Enviando…" : "Enviar requisición"}
          </button>

          {guardado && (
            <span style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <path d="M20 6 9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Guardado
            </span>
          )}

          {guardar.isError && (
            <span style={{ fontSize: 12, color: "#ef4444" }}>
              Error al guardar. Intente de nuevo.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
