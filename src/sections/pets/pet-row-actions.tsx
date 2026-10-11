import { useMemo } from 'react';

import RowActions, { type RowAction } from 'src/components/row-actions';

/**
 * Row actions for the pets table.
 *
 * The per-pet sections (Consultas, Vacinas, Receitas, Anexos) are no longer
 * separate row destinations: they live as tabs inside the Prontuário, which is
 * now the single hub for one pet. So the row keeps just three actions —
 * Prontuário (the hub), Editar and Deletar.
 */
type PetRowActionsProps = {
  petId: string;
  onViewProntuario: (petId: string) => void;
  onEdit: () => void;
  onDelete: (petId: string) => void;
};

export default function PetRowActions({
  petId,
  onViewProntuario,
  onEdit,
  onDelete,
}: PetRowActionsProps) {
  const actions = useMemo<RowAction[]>(
    () => [
      {
        key: 'prontuario',
        label: 'Prontuário',
        icon: 'solar:clipboard-heart-bold',
        color: 'primary',
        onClick: () => onViewProntuario(petId),
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: 'solar:pen-bold',
        onClick: onEdit,
      },
      {
        key: 'delete',
        label: 'Deletar',
        icon: 'solar:trash-bin-trash-bold',
        destructive: true,
        onClick: () => onDelete(petId),
      },
    ],
    [petId, onViewProntuario, onEdit, onDelete]
  );

  return <RowActions actions={actions} maxInline={2} />;
}
