"use client";

import { createEntityHooks } from "./useEntity";
import { ActividadesService } from "@/services";
import type { Actividad } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<Actividad>("actividades", ActividadesService);
export { useList as useActividades, useItem as useActividad, useActions as useActividadesActions };
