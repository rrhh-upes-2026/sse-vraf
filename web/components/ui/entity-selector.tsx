"use client";

import { useEntityList } from "@/hooks/useEntity";
import {
  PlanesService,
  ObjetivosService,
  ProyectosService,
  ProcesosService,
  ActividadesService,
  UsuariosService,
  UnidadesService,
} from "@/services";
import { Select } from "@/components/ui/select";
import type { ListQuery } from "@/services/adapters/types";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { EntityService } from "@/services/entityService";

export type EntitySelectorType =
  | "usuarios"
  | "procesos"
  | "proyectos"
  | "planes"
  | "objetivos"
  | "actividades"
  | "unidades";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_MAP: Record<EntitySelectorType, EntityService<any>> = {
  usuarios:    UsuariosService,
  procesos:    ProcesosService,
  proyectos:   ProyectosService,
  planes:      PlanesService,
  objetivos:   ObjetivosService,
  actividades: ActividadesService,
  unidades:    UnidadesService,
};

export interface EntitySelectorProps {
  entityType: EntitySelectorType;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  query?: ListQuery;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function EntitySelector({
  entityType,
  value,
  onValueChange,
  placeholder = "Seleccionar…",
  query,
  disabled,
  allowEmpty,
  emptyLabel = "(ninguno)",
}: EntitySelectorProps) {
  const { data, isLoading } = useEntityList(entityType, SERVICE_MAP[entityType], query);

  const options = [
    ...(allowEmpty ? [{ value: "", label: emptyLabel }] : []),
    ...(data ?? []).map((item: { id: string; nombre: string }) => ({
      value: item.id,
      label: item.nombre,
    })),
  ];

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={isLoading ? "Cargando…" : options.length === 0 ? "Sin opciones" : placeholder}
      disabled={disabled || isLoading}
    />
  );
}
