"use client";

import { createEntityHooks } from "@/hooks/useEntity";
import { UsuariosService } from "@/services";
import type { Usuario } from "@/types/entities";

const hooks = createEntityHooks<Usuario>("usuarios", UsuariosService);

export const useUsuarios = hooks.useList;
export const useUsuario = hooks.useItem;
export const useUsuariosActions = hooks.useActions;
