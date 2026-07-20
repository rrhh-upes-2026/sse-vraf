"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSolicitudesCompra } from "./useCompras";
import { cambiarEstadoSolicitud } from "@/services/compras";
import type { ComprasSolicitud } from "@/types/entities";
import type { ListQuery } from "@/services/adapters/types";

export function useSolicitudesCompraFiltradas(
  wsId: string,
  filters?: { estado?: ComprasSolicitud["estado"]; prioridad?: string },
) {
  const query: ListQuery = { wsId, ...filters };
  return useSolicitudesCompra(query);
}

export function useCambiarEstadoSolicitud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      estado,
      etapaActual,
    }: {
      id: string;
      estado: ComprasSolicitud["estado"];
      etapaActual?: string;
    }) => cambiarEstadoSolicitud(id, estado, etapaActual),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comprasSolicitudes"] });
      queryClient.invalidateQueries({ queryKey: ["compras", "dashboard"] });
    },
  });
}
