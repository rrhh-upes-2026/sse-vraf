"use client";

import { createEntityHooks } from "./useEntity";
import { EvaluacionesService } from "@/services/hr";
import type { EvaluacionDesempeno } from "@/types/hr";

const { useList, useItem, useActions } = createEntityHooks<EvaluacionDesempeno>("evaluaciones", EvaluacionesService);
export { useList as useEvaluaciones, useItem as useEvaluacion, useActions as useEvaluacionesActions };
