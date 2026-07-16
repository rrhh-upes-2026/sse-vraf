"use client";

import { createEntityHooks } from "./useEntity";
import { EmpleadosService } from "@/services/hr";
import type { Empleado } from "@/types/hr";

const { useList, useItem, useActions } = createEntityHooks<Empleado>("empleados", EmpleadosService);
export { useList as useEmpleados, useItem as useEmpleado, useActions as useEmpleadosActions };
