"use client";

import { createEntityHooks } from "./useEntity";
import { ProcesosService } from "@/services";
import type { ProcesoInstitucional } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<ProcesoInstitucional>("procesos", ProcesosService);
export { useList as useProcesos, useItem as useProceso, useActions as useProcesosActions };
