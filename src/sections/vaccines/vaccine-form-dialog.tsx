import type { Vaccine } from 'src/types';

import * as yup from 'yup';

/**
 * Vaccine Form Dialog Component
 * Modal form for creating/editing vaccine records
 */
import { useGetPets } from 'src/hooks/usePetsQuery';
import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreateVaccine, useUpdateVaccine } from 'src/hooks/useVaccinesQuery';

import { RHFSelect, RHFTextField, FormDialogShell } from 'src/components/form';

// -----------------------------------------------------------------------

const vaccineSchema = yup.object({
  pet_id: yup.string().required('Pet é obrigatório'),
  vaccine_name: yup.string().required('Nome da vacina é obrigatório'),
  batch: yup.string(),
  manufacturer: yup.string(),
  date_applied: yup.string().required('Data de aplicação é obrigatória'),
  next_dose_date: yup.string(),
  notes: yup.string(),
});

interface VaccineFormValues {
  pet_id: string;
  vaccine_name: string;
  batch: string;
  manufacturer: string;
  date_applied: string;
  next_dose_date: string;
  notes: string;
}

interface VaccineFormDialogProps {
  open: boolean;
  onClose: () => void;
  vaccine?: Vaccine | null;
  onSuccess?: (message: string) => void;
  initialData?: { pet_id: string };
}

export default function VaccineFormDialog({
  open,
  onClose,
  vaccine,
  onSuccess,
  initialData,
}: VaccineFormDialogProps) {
  const createMutation = useCreateVaccine();
  const updateMutation = useUpdateVaccine();

  const fixedPetId = initialData?.pet_id;
  const needsPetPicker = !vaccine && !fixedPetId;
  const { data: pets } = useGetPets();

  const defaultValues: VaccineFormValues = {
    pet_id: fixedPetId ?? '',
    vaccine_name: '',
    batch: '',
    manufacturer: '',
    date_applied: new Date().toISOString().split('T')[0],
    next_dose_date: '',
    notes: '',
  };

  const { control, isLoading, isEdit, submitError, clearError, onSubmit } = useEntityForm<
    VaccineFormValues,
    ReturnType<typeof buildPayload>,
    Vaccine
  >({
    createMutation,
    updateMutation,
    schema: vaccineSchema,
    defaultValues,
    entity: vaccine,
    resetDeps: [initialData],
    toFormValues: (v) => ({
      pet_id: v.pet_id,
      vaccine_name: v.vaccine_name ?? '',
      batch: v.batch ?? '',
      manufacturer: v.manufacturer ?? '',
      date_applied: v.date_applied ? v.date_applied.split('T')[0] : '',
      next_dose_date: v.next_dose_date ? v.next_dose_date.split('T')[0] : '',
      notes: v.notes ?? '',
    }),
    beforeSubmit: (data) => {
      const petId = vaccine?.pet_id || initialData?.pet_id || data.pet_id;
      return petId ? undefined : 'Não foi possível identificar o pet desta vacinação.';
    },
    toPayload: (data) => buildPayload(data, vaccine, initialData),
    messages: {
      createSuccess: 'Vacinação criada com sucesso!',
      updateSuccess: 'Vacinação atualizada com sucesso!',
      createError: 'Erro ao criar vacinação',
      updateError: 'Erro ao atualizar vacinação',
    },
    onSuccess,
  });

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Vacinação' : 'Nova Vacinação'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
    >
      {needsPetPicker && (
        <RHFSelect
          name="pet_id"
          control={control}
          label="Pet"
          fullWidth
          options={(pets ?? []).map((p) => ({ value: p.id, label: p.name }))}
          emptyLabel="Nenhum pet cadastrado"
        />
      )}

      <RHFTextField name="vaccine_name" control={control} label="Nome da Vacina" fullWidth />

      <RHFTextField name="batch" control={control} label="Lote" fullWidth />

      <RHFTextField name="manufacturer" control={control} label="Fabricante" fullWidth />

      <RHFTextField
        name="date_applied"
        control={control}
        label="Data de Aplicação"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <RHFTextField
        name="next_dose_date"
        control={control}
        label="Próxima Dose"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <RHFTextField name="notes" control={control} label="Notas" fullWidth multiline rows={3} />
    </FormDialogShell>
  );
}

// -----------------------------------------------------------------------

function buildPayload(
  data: VaccineFormValues,
  vaccine: Vaccine | null | undefined,
  initialData?: { pet_id: string }
) {
  const petId = (vaccine?.pet_id || initialData?.pet_id || data.pet_id) as string;

  return {
    pet_id: petId,
    vaccine_name: data.vaccine_name,
    batch: data.batch,
    manufacturer: data.manufacturer,
    notes: data.notes,
    date_applied: new Date(data.date_applied).toISOString(),
    next_dose_date: data.next_dose_date ? new Date(data.next_dose_date).toISOString() : undefined,
  };
}
