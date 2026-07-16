"use client";

import { createEntityHooks } from "./useEntity";
import { CapacitacionesService } from "@/services/hr";
import type { CapacitacionEmpleado } from "@/types/hr";

const { useList, useItem, useActions } = createEntityHooks<CapacitacionEmpleado>("capacitaciones", CapacitacionesService);
export { useList as useCapacitaciones, useItem as useCapacitacion, useActions as useCapacitacionesActions };
