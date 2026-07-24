"use client";

import { useState, useCallback } from "react";

/**
 * Reusable two-step delete confirmation pattern.
 * First click sets the id; second click (Confirmar) triggers onDelete.
 *
 * Usage:
 *   const { confirmId, requestDelete, cancelDelete, confirmDelete } =
 *     useDeleteConfirm((id) => actions.remove.mutateAsync(id));
 */
export function useDeleteConfirm(onDelete: (id: string) => Promise<unknown> | void) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const requestDelete = useCallback((id: string) => {
    setConfirmId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setConfirmId(null);
  }, []);

  const confirmDelete = useCallback(async (id: string) => {
    await onDelete(id);
    setConfirmId(null);
  }, [onDelete]);

  return { confirmId, requestDelete, cancelDelete, confirmDelete };
}
