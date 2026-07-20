"use client";

import { createEntityHooks } from "./useEntity";
import { PlanesVRAFService } from "@/services/vraf";
import type { PlanEstrategico } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<PlanEstrategico>("planes", PlanesVRAFService);
export { useList as usePlanes, useItem as usePlan, useActions as usePlanesActions };
