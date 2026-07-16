"use client";

import { createEntityHooks } from "./useEntity";
import { IndicadoresService } from "@/services";
import type { Indicador } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<Indicador>("indicadores", IndicadoresService);
export { useList as useIndicadores, useItem as useIndicador, useActions as useIndicadoresActions };
