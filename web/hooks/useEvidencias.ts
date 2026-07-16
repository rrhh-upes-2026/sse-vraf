"use client";

import { createEntityHooks } from "./useEntity";
import { EvidenciasService } from "@/services";
import type { Evidencia } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<Evidencia>("evidencias", EvidenciasService);
export { useList as useEvidencias, useItem as useEvidencia, useActions as useEvidenciasActions };
