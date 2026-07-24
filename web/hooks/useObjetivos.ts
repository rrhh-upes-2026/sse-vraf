"use client";

import { createEntityHooks } from "./useEntity";
import { ObjetivosService } from "@/services";
import type { ObjetivoEstrategico } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<ObjetivoEstrategico>("objetivos", ObjetivosService);
export { useList as useObjetivos, useItem as useObjetivo, useActions as useObjetivosActions };
