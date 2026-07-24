/**
 * EntityActionButtons — standard Editar / Eliminar / Confirmar / Cancelar
 * inline row used by all workspace list items.
 */

interface EntityActionButtonsProps {
  id: string;
  onEdit: () => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

export function EntityActionButtons({
  id,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
}: EntityActionButtonsProps) {
  const isConfirming = confirmDeleteId === id;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
      >
        Editar
      </button>
      {isConfirming ? (
        <>
          <button
            onClick={() => onConfirmDelete(id)}
            className="px-2 py-0.5 rounded text-[11px] text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
          >
            Confirmar
          </button>
          <button
            onClick={onCancelDelete}
            className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:bg-sse-shell-canvas"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          onClick={() => onDelete(id)}
          className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
