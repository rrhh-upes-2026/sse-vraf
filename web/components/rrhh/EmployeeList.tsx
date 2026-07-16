"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useEmpleados } from "@/hooks/useEmpleados";
import { usePermissions } from "@/hooks/usePermissions";
import type { Empleado, EmpleadoEstado, EmpleadoCategoria } from "@/types/hr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIA_COLOR: Record<EmpleadoCategoria, string> = {
  ejecutivo:     "#2E6BE6",
  profesional:   "#E5A100",
  tecnico:       "#0F8A8A",
  administrativo:"#5B4FD0",
  operativo:     "#12A150",
};

const CATEGORIA_LABEL: Record<EmpleadoCategoria, string> = {
  ejecutivo:      "Ejecutivo",
  profesional:    "Profesional",
  tecnico:        "Técnico",
  administrativo: "Administrativo",
  operativo:      "Operativo",
};

const CONTRATO_LABEL: Record<string, string> = {
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

// Search icon path
const SEARCH_ICON = "M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z";
const PERSON_ICON = "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a6 6 0 0 1 12 0v1H3v-1Z";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = "todos" | "activos" | "inactivos" | "plazo_fijo";

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "todos",      label: "Todos" },
  { key: "activos",    label: "Activos" },
  { key: "inactivos",  label: "Inactivos" },
  { key: "plazo_fijo", label: "Plazo fijo" },
];

function applyFilter(empleados: Empleado[], filter: FilterKey): Empleado[] {
  switch (filter) {
    case "activos":    return empleados.filter((e) => e.estado === "activo");
    case "inactivos":  return empleados.filter((e) => e.estado === "inactivo");
    case "plazo_fijo": return empleados.filter((e) => e.tipoContrato === "plazo_fijo");
    default:           return empleados;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function yearsAtInstitution(fechaIngreso: string): string {
  const ingreso = new Date(fechaIngreso);
  const now = new Date();
  const diffMs = now.getTime() - ingreso.getTime();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  if (years === 0) {
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    return months <= 1 ? "Menos de 1 mes" : `${months} meses`;
  }
  return years === 1 ? "1 año" : `${years} años`;
}

function getInitials(empleado: Empleado): string {
  if (empleado.avatarInitials) return empleado.avatarInitials;
  const first = empleado.nombres.trim()[0] ?? "";
  const last  = empleado.apellidos.trim()[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

// ─── Employee Card ────────────────────────────────────────────────────────────

function EmployeeCard({ empleado }: { empleado: Empleado }) {
  const color    = CATEGORIA_COLOR[empleado.categoria];
  const initials = getInitials(empleado);

  return (
    <Link href={`/ws/rrhh/empleados/${empleado.id}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md hover:border-sse-primary/40 cursor-pointer">
        <CardContent className="p-4 flex flex-col gap-3">
          {/* Avatar + name row */}
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-sse-ink leading-tight truncate group-hover:text-sse-primary transition-colors">
                {empleado.nombres} {empleado.apellidos}
              </p>
              <p className="text-[11px] text-sse-muted truncate mt-0.5">{empleado.cargo}</p>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info">{CATEGORIA_LABEL[empleado.categoria]}</Badge>
            <Badge variant="gray">{CONTRATO_LABEL[empleado.tipoContrato] ?? empleado.tipoContrato}</Badge>
            <Badge variant={ESTADO_BADGE[empleado.estado]}>{ESTADO_LABEL[empleado.estado]}</Badge>
          </div>

          {/* Metrics row */}
          <div className="border-t border-sse-border pt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-sse-muted">Antigüedad</p>
              <p className="font-medium text-sse-ink mt-0.5">{yearsAtInstitution(empleado.fechaIngreso)}</p>
            </div>

            {empleado.diasVacacionesPendientes !== undefined && (
              <div>
                <p className="text-sse-muted">Vacaciones</p>
                <p className="font-medium text-sse-ink mt-0.5">
                  {empleado.diasVacacionesPendientes} día{empleado.diasVacacionesPendientes !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {empleado.evaluacionUltimaPuntuacion !== undefined && (
              <div className="col-span-2">
                <p className="text-sse-muted">Última evaluación</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1.5 rounded-full bg-sse-border overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${empleado.evaluacionUltimaPuntuacion}%`,
                        backgroundColor:
                          empleado.evaluacionUltimaPuntuacion >= 75
                            ? "var(--sse-sem-green-fg)"
                            : empleado.evaluacionUltimaPuntuacion >= 50
                            ? "#E5A100"
                            : "var(--sse-sem-red-fg)",
                      }}
                    />
                  </div>
                  <span className="font-semibold text-sse-ink w-6 text-right">
                    {empleado.evaluacionUltimaPuntuacion}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EmployeeList() {
  const { data: empleados = [], isLoading } = useEmpleados();
  const { hasPermission } = usePermissions();
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<FilterKey>("todos");

  const filtered = useMemo(() => {
    let list = applyFilter(empleados, filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.nombres.toLowerCase().includes(q) ||
          e.apellidos.toLowerCase().includes(q) ||
          e.cargo.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [empleados, filter, search]);

  const canCreate = hasPermission("hr.employee.create");

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Empleados</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            {isLoading ? "Cargando..." : `${empleados.length} empleado${empleados.length !== 1 ? "s" : ""} en total`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-56">
            <Input
              icon={SEARCH_ICON}
              placeholder="Buscar empleados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canCreate && (
            <Link href="/ws/rrhh/empleados/nuevo">
              <Button variant="primary" size="md">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d={PERSON_ICON} />
                </svg>
                Nuevo empleado
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 border-b border-sse-border">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-3 py-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors",
              filter === tab.key
                ? "border-sse-primary text-sse-primary"
                : "border-transparent text-sse-muted hover:text-sse-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          title="No se encontraron empleados"
          description={
            search
              ? `No hay resultados para "${search}". Intenta con otro término.`
              : "No hay empleados que coincidan con el filtro seleccionado."
          }
          action={
            search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                Limpiar búsqueda
              </Button>
            ) : undefined
          }
        />
      )}

      {/* ── Employee grid ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} empleado={emp} />
          ))}
        </div>
      )}
    </div>
  );
}
