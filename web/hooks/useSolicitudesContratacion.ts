"use client";

import { createEntityHooks } from "./useEntity";
import { SolicitudesContratacionService } from "@/services/hr";
import type { SolicitudContratacion } from "@/types/hr";

const { useList, useItem, useActions } = createEntityHooks<SolicitudContratacion>("solicitudesContratacion", SolicitudesContratacionService);
export { useList as useSolicitudesContratacion, useItem as useSolicitudContratacion, useActions as useSolicitudesContratacionActions };
