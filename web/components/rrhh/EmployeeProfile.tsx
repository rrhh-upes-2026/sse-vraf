"use client";

import { useEmpleado } from "@/hooks/useEmpleados";
import { useCapacitaciones } from "@/hooks/useCapacitaciones";
import { useEvaluaciones } from "@/hooks/useEvaluaciones";
import type { Empleado, EmpleadoEstado, EmpleadoCategoria, TipoContrato, CapacitacionEmpleado, EvaluacionDesempeno, EvaluacionNivel } from "@/types/hr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtDate } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIA_COLOR: Record<EmpleadoCategoria, string> = {
  ejecutivo:      "#2E6BE6",
  profesional:    "#E5A100",
  tecnico:        "#0F8A8A",
  administrativo: "#5B4FD0",
  operativo:      "#12A150",
};

const CATEGORIA_LABEL: Record<EmpleadoCategoria, string> = {
  ejecutivo:      "Ejecutivo",
  profesional:    "Profesional",
  tecnico:        "Técnico",
  administrativo: "Administrativo",
  operativo:      "Operativo",
};

const CONTRATO_LABEL: Record<TipoContrato, string> = {
  indefinido:  "Indefinido",
  plazo_fijo:  "Plazo fijo",
  eventual:    "Eventual",
  honorarios:  "Honorarios",
};

const ESTADO_BADGE: Record<EmpleadoEstado, BadgeVariant> = {
  activo:    "success",
  inactivo:  "gray",
  suspendido:"warning",
  retirado:  "danger",
};

const ESTADO_LABEL: Record<EmpleadoEstado, string> = {
  activo:    "Activo",
  inactivo:  "Inactivo",
  suspendido:"Suspendido",
  retirado:  "Retirado",
};

const CAPACITACION_TIPO_BADGE: Record<CapacitacionEmpleado["tipo"], BadgeVariant> = {
  interna:      "info",
  externa:      "purple",
  virtual:      "default",
  certificacion:"success",
};

const CAPACITACION_TIPO_LABEL: Record<CapacitacionEmpleado["tipo"], string> = {
  interna:      "Interna",
  externa:      "Externa",
  virtual:      "Virtual",
  certificacion:"Certificación",
};

const CAPACITACION_ESTADO_BADGE: Record<CapacitacionEmpleado["estado"], BadgeVariant> = {
  programada:  "default",
  en_progreso: "info",
  completada:  "success",
  cancelada:   "danger",
};

const CAPACITACION_ESTADO_LABEL: Record<CapacitacionEmpleado["estado"], string> = {
  programada:  "Programada",
  en_progreso: "En progreso",
  completada:  "Completada",
  cancelada:   "Cancelada",
};

const NIVEL_BADGE: Record<EvaluacionNivel, BadgeVariant> = {
  excelente: "success",
  bueno:     "info",
  aceptable: "warning",
  deficiente:"danger",
};

const NIVEL_LABEL: Record<EvaluacionNivel, string> = {
  excelente: "Excelente",
  bueno:     "Bueno",
  aceptable: "Aceptable",
  deficiente:"Deficiente",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-SV", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

function yearsAtInstitution(fechaIngreso: string): string {
  const diffMs = Date.now() - new Date(fechaIngreso).getTime();
  const years  = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  if (years === 0) {
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    return months <= 1 ? "Menos de 1 mes" : `${months} meses`;
  }
  return years === 1 ? "1 año" : `${years} años`;
}

function maskSalary(salario: number): string {
  const thousands = Math.floor(salario / 1000);
  return `$${thousands},XXX`;
}

function getInitials(empleado: Empleado): string {
  if (empleado.avatarInitials) return empleado.avatarInitials;
  return `${empleado.nombres.trim()[0] ?? ""}${empleado.apellidos.trim()[0] ?? ""}`.toUpperCase();
}

// ─── Data field ───────────────────────────────────────────────────────────────

function DataField({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">{label}</p>
      <div className="mt-1 text-[13px] text-sse-ink font-medium">{value ?? "—"}</div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── General tab ─────────────────────────────────────────────────────────────

function GeneralTab({ empleado }: { empleado: Empleado }) {
  return (
    <div className="space-y-5">
      {/* Personal data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DataField label="DUI" value={empleado.dui ?? "—"} />
          <DataField label="Correo electrónico" value={
            <a href={`mailto:${empleado.email}`} className="text-sse-primary hover:underline">
              {empleado.email}
            </a>
          } />
          <DataField label="Teléfono" value={empleado.telefono ?? "—"} />
          {empleado.fechaNacimiento && (
            <DataField label="Fecha de nacimiento" value={formatDate(empleado.fechaNacimiento)} />
          )}
        </CardContent>
      </Card>

      {/* Employment summary */}
      <Card>
        <CardHeader>
          <CardTitle>Datos laborales</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DataField label="Cargo" value={empleado.cargo} />
          <DataField label="Categoría" value={CATEGORIA_LABEL[empleado.categoria]} />
          <DataField label="Tipo de contrato" value={CONTRATO_LABEL[empleado.tipoContrato]} />
          <DataField label="Salario" value={maskSalary(empleado.salario)} />
          <DataField label="Fecha de ingreso" value={formatDate(empleado.fechaIngreso)} />
          <DataField label="Antigüedad" value={yearsAtInstitution(empleado.fechaIngreso)} />
          {empleado.diasVacacionesPendientes !== undefined && (
            <DataField
              label="Vacaciones pendientes"
              value={`${empleado.diasVacacionesPendientes} día${empleado.diasVacacionesPendientes !== 1 ? "s" : ""}`}
            />
          )}
          {empleado.capacitacionesCompletas !== undefined && (
            <DataField
              label="Capacitaciones completas"
              value={`${empleado.capacitacionesCompletas}`}
            />
          )}
          {empleado.fechaEgreso && (
            <DataField label="Fecha de egreso" value={formatDate(empleado.fechaEgreso)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Capacitaciones tab ───────────────────────────────────────────────────────

function CapacitacionesTab({ empleadoId }: { empleadoId: string }) {
  const { data: capacitaciones = [], isLoading } = useCapacitaciones({ empleadoId });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (capacitaciones.length === 0) {
    return (
      <EmptyState
        icon="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.63 48.63 0 0 1 12 20.904a48.63 48.63 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
        title="Sin capacitaciones registradas"
        description="No se han registrado capacitaciones para este empleado."
      />
    );
  }

  return (
    <div className="space-y-3">
      {capacitaciones.map((cap) => (
        <Card key={cap.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-sse-ink leading-snug">{cap.nombre}</p>
                  {cap.certificado && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sse-sem-green-fg bg-sse-sem-green-bg px-1.5 py-0.5 rounded-sm">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M8 1a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM4.5 4.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0ZM6.75 7.75a.75.75 0 0 1 1.5 0v1.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l.72.72V7.75Z" clipRule="evenodd" />
                      </svg>
                      Certificado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-sse-muted mt-0.5">{cap.proveedor}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={CAPACITACION_TIPO_BADGE[cap.tipo]}>
                  {CAPACITACION_TIPO_LABEL[cap.tipo]}
                </Badge>
                <Badge variant={CAPACITACION_ESTADO_BADGE[cap.estado]}>
                  {CAPACITACION_ESTADO_LABEL[cap.estado]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-sse-border text-[11px]">
              <div>
                <p className="text-sse-muted">Inicio</p>
                <p className="font-medium text-sse-ink mt-0.5">{fmtDate(cap.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-sse-muted">Fin</p>
                <p className="font-medium text-sse-ink mt-0.5">{fmtDate(cap.fechaFin)}</p>
              </div>
              <div>
                <p className="text-sse-muted">Duración</p>
                <p className="font-medium text-sse-ink mt-0.5">{cap.duracionHoras}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Evaluaciones tab ─────────────────────────────────────────────────────────

function EvaluacionesTab({ empleadoId }: { empleadoId: string }) {
  const { data: evaluaciones = [], isLoading } = useEvaluaciones({ empleadoId });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <EmptyState
        icon="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        title="Sin evaluaciones registradas"
        description="No se han registrado evaluaciones de desempeño para este empleado."
      />
    );
  }

  return (
    <div className="space-y-3">
      {evaluaciones.map((eva) => (
        <Card key={eva.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-sse-ink">{eva.periodo}</p>
                <p className="text-[11px] text-sse-muted mt-0.5">{fmtDate(eva.fecha)}</p>
              </div>
              <Badge variant={NIVEL_BADGE[eva.nivel]}>{NIVEL_LABEL[eva.nivel]}</Badge>
            </div>

            {/* Score bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-sse-muted">Puntuación</span>
                <span className="text-[13px] font-bold text-sse-ink">{eva.puntuacion}/100</span>
              </div>
              <Progress
                value={eva.puntuacion}
                color={
                  eva.puntuacion >= 75
                    ? "success"
                    : eva.puntuacion >= 50
                    ? "warning"
                    : "danger"
                }
              />
            </div>

            {(eva.fortalezas || eva.areasOportunidad) && (
              <div className="mt-3 pt-3 border-t border-sse-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                {eva.fortalezas && (
                  <div>
                    <p className="font-medium text-sse-sem-green-fg mb-1">Fortalezas</p>
                    <p className="text-sse-muted leading-relaxed">{eva.fortalezas}</p>
                  </div>
                )}
                {eva.areasOportunidad && (
                  <div>
                    <p className="font-medium text-sse-sem-amber-fg mb-1">Áreas de oportunidad</p>
                    <p className="text-sse-muted leading-relaxed">{eva.areasOportunidad}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface EmployeeProfileProps {
  empleadoId: string;
}

export function EmployeeProfile({ empleadoId }: EmployeeProfileProps) {
  const { data: empleado, isLoading } = useEmpleado(empleadoId);

  if (isLoading) return <ProfileSkeleton />;

  if (!empleado) {
    return (
      <EmptyState
        icon="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        title="Empleado no encontrado"
        description="No se pudo encontrar la información de este empleado."
      />
    );
  }

  const color    = CATEGORIA_COLOR[empleado.categoria];
  const initials = getInitials(empleado);

  const tabs = [
    { id: "general",       label: "General" },
    { id: "capacitaciones",label: "Capacitaciones" },
    { id: "evaluaciones",  label: "Evaluaciones" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Header card ── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4 flex-wrap">
            {/* Large avatar */}
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {initials}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[18px] font-bold text-sse-ink">
                  {empleado.nombres} {empleado.apellidos}
                </h2>
                <Badge variant={ESTADO_BADGE[empleado.estado]}>
                  {ESTADO_LABEL[empleado.estado]}
                </Badge>
              </div>
              <p className="text-[13px] text-sse-muted mt-0.5">{empleado.cargo}</p>

              <div className="flex flex-wrap gap-4 mt-3 text-[12px]">
                <span className="flex items-center gap-1.5 text-sse-muted">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                  </svg>
                  {empleado.email}
                </span>

                {empleado.telefono && (
                  <span className="flex items-center gap-1.5 text-sse-muted">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 16.352V17.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
                    </svg>
                    {empleado.telefono}
                  </span>
                )}

                <span className="flex items-center gap-1.5 text-sse-muted">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
                    <path d="M3 15.055v-.188a9.916 9.916 0 0 0 5 1.186 9.916 9.916 0 0 0 5-1.186v.188C13 16.625 11.657 18 10 18s-3-1.375-3-2.945Z" />
                  </svg>
                  {CONTRATO_LABEL[empleado.tipoContrato]}
                </span>

                <span className="flex items-center gap-1.5 text-sse-muted">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                  </svg>
                  Desde {new Date(empleado.fechaIngreso).toLocaleDateString("es-SV", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Salary pill */}
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-sse-muted uppercase tracking-wide">Salario</p>
              <p className="text-[20px] font-bold text-sse-ink font-mono">{maskSalary(empleado.salario)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs tabs={tabs} defaultTab="general">
        {(activeTab) => (
          <div>
            {activeTab === "general"        && <GeneralTab empleado={empleado} />}
            {activeTab === "capacitaciones" && <CapacitacionesTab empleadoId={empleadoId} />}
            {activeTab === "evaluaciones"   && <EvaluacionesTab  empleadoId={empleadoId} />}
          </div>
        )}
      </Tabs>
    </div>
  );
}
