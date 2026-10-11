import { useMemo } from 'react';

import RowActions, { type RowAction } from 'src/components/row-actions';

/**
 * Row actions for the pets table.
 *
 * Thin wrapper over the generic {@link RowActions}: keeps Prontuário and Editar
 * inline and folds Consultas/Vacinas/Receitas/Anexos plus Deletar into the
 * overflow kebab menu.
 */
type PetRowActionsProps = {
  petId: string;
  onViewProntuario: (petId: string) => void;
  onEdit: () => void;
  onViewConsultations: (petId: string) => void;
  onViewVaccines: (petId: string) => void;
  onViewPrescriptions: (petId: string) => void;
  onViewAttachments: (petId: string) => void;
  onDelete: (petId: string) => void;
};

export default function PetRowActions({
  petId,
  onViewProntuario,
  onEdit,
  onViewConsultations,
  onViewVaccines,
  onViewPrescriptions,
  onViewAttachments,
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
        key: 'consultas',
        label: 'Ver consultas',
        icon: 'solar:medical-visit-bold',
        onClick: () => onViewConsultations(petId),
      },
      {
        key: 'vacinas',
        label: 'Ver vacinas',
        icon: 'solar:vaccine-bold',
        onClick: () => onViewVaccines(petId),
      },
      {
        key: 'receitas',
        label: 'Ver receitas',
        icon: 'solar:document-text-bold',
        onClick: () => onViewPrescriptions(petId),
      },
      {
        key: 'anexos',
        label: 'Ver anexos',
        icon: 'solar:paperclip-bold',
        onClick: () => onViewAttachments(petId),
      },
      {
        key: 'delete',
        label: 'Deletar',
        icon: 'solar:trash-bin-trash-bold',
        destructive: true,
        onClick: () => onDelete(petId),
      },
    ],
    [
      petId,
      onViewProntuario,
      onEdit,
      onViewConsultations,
      onViewVaccines,
      onViewPrescriptions,
      onViewAttachments,
      onDelete,
    ]
  );

  return <RowActions actions={actions} maxInline={2} />;
}
