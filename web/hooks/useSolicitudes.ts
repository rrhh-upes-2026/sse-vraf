"use client";

import { createEntityHooks } from "./useEntity";
import { SolicitudesService } from "@/services";
import type { Solicitud } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<Solicitud>("solicitudes", SolicitudesService);
export { useList as useSolicitudes, useItem as useSolicitud, useActions as useSolicitudesActions };
