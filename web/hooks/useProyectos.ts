"use client";

import { createEntityHooks } from "./useEntity";
import { ProyectosService } from "@/services";
import type { ProyectoEstrategico } from "@/types/entities";

const { useList, useItem, useActions } = createEntityHooks<ProyectoEstrategico>("proyectos", ProyectosService);
export { useList as useProyectos, useItem as useProyecto, useActions as useProyectosActions };
