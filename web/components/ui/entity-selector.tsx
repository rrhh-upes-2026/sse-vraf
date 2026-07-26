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
  /** Field used as the option label (default: "nombre") */
  labelKey?: string;
  /** Override the service lookup (for entity types not in SERVICE_MAP) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service?: EntityService<any>;
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
  labelKey = "nombre",
  service,
}: EntitySelectorProps) {
  const resolvedService = service ?? SERVICE_MAP[entityType];
  const { data, isLoading } = useEntityList(entityType, resolvedService, query);

  const options = [
    ...(allowEmpty ? [{ value: "", label: emptyLabel }] : []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(data ?? []).map((item: any) => ({
      value: item.id,
      label: (item[labelKey] as string) ?? item.nombre ?? item.id,
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
