import type { Prescription } from 'src/types';

import * as yup from 'yup';
/**
 * Prescription Form Dialog Component
 * Modal form for creating/editing a prescription (receituário) with a dynamic
 * list of medication items.
 */
import { useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreatePrescription, useUpdatePrescription } from 'src/hooks/usePrescriptionsQuery';

import { toDateInput } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { RHFTextField, FormDialogShell } from 'src/components/form';

// -----------------------------------------------------------------------

const prescriptionSchema = yup.object({
  date: yup.string().required('Data é obrigatória'),
  general_notes: yup.string(),
  items: yup
    .array()
    .of(
      yup.object({
        medication: yup.string().required('Medicamento é obrigatório'),
        dosage: yup.string(),
        route: yup.string(),
        frequency: yup.string(),
        duration: yup.string(),
        instructions: yup.string(),
      })
    )
    .min(1, 'Adicione ao menos um medicamento'),
});

const emptyItem = {
  medication: '',
  dosage: '',
  route: '',
  frequency: '',
  duration: '',
  instructions: '',
};

interface PrescriptionFormValues {
  date: string;
  general_notes: string;
  items: Array<typeof emptyItem>;
}

interface PrescriptionFormDialogProps {
  open: boolean;
  onClose: () => void;
  prescription?: Prescription | null;
  onSuccess?: (message: string) => void;
  initialData?: { pet_id: string; consultation_id?: string };
}

export default function PrescriptionFormDialog({
  open,
  onClose,
  prescription,
  onSuccess,
  initialData,
}: PrescriptionFormDialogProps) {
  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();

  const defaultValues: PrescriptionFormValues = {
    date: toDateInput(),
    general_notes: '',
    items: [{ ...emptyItem }],
  };

  const { control, isLoading, isEdit, submitError, clearError, onSubmit, formState } =
    useEntityForm<
      PrescriptionFormValues,
      ReturnType<typeof buildPayload>,
      Prescription
    >({
    createMutation,
    updateMutation,
    schema: prescriptionSchema,
    defaultValues,
    entity: prescription,
    resetOnSuccess: false,
    toFormValues: (p) => ({
      date: toDateInput(p.date),
      general_notes: p.general_notes ?? '',
      items:
        p.items && p.items.length > 0
          ? p.items.map((item) => ({ ...emptyItem, ...item }))
          : [{ ...emptyItem }],
    }),
    beforeSubmit: () => {
      const petId = prescription?.pet_id || initialData?.pet_id;
      return petId ? undefined : 'Não foi possível identificar o pet deste receituário.';
    },
    toPayload: (data) => buildPayload(data, prescription, initialData),
    messages: {
      createSuccess: 'Receituário criado com sucesso!',
      updateSuccess: 'Receituário atualizado com sucesso!',
      createError: 'Erro ao criar receituário',
      updateError: 'Erro ao atualizar receituário',
    },
    onSuccess,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Receituário' : 'Novo Receituário'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
      maxWidth="md"
    >
      <RHFTextField
        name="date"
        control={control}
        label="Data"
        type="date"
        InputLabelProps={{ shrink: true }}
        sx={{ maxWidth: 220 }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1">Medicamentos</Typography>
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => append({ ...emptyItem })}
        >
          Adicionar medicamento
        </Button>
      </Stack>

      {typeof formState.errors.items?.message === 'string' && (
        <Alert severity="warning">{formState.errors.items.message}</Alert>
      )}

      {fields.map((fieldItem, index) => (
        <Box
          key={fieldItem.id}
          sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Medicamento {index + 1}</Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            <RHFTextField
              name={`items.${index}.medication`}
              control={control}
              label="Medicamento"
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFTextField name={`items.${index}.dosage`} control={control} label="Dose" fullWidth />
              <RHFTextField
                name={`items.${index}.route`}
                control={control}
                label="Via (oral, tópica...)"
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFTextField
                name={`items.${index}.frequency`}
                control={control}
                label="Frequência (ex: 2x ao dia)"
                fullWidth
              />
              <RHFTextField
                name={`items.${index}.duration`}
                control={control}
                label="Duração (ex: 7 dias)"
                fullWidth
              />
            </Stack>

            <RHFTextField
              name={`items.${index}.instructions`}
              control={control}
              label="Instruções"
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </Box>
      ))}

      <Divider />

      <RHFTextField
        name="general_notes"
        control={control}
        label="Observações gerais"
        fullWidth
        multiline
        rows={3}
      />
    </FormDialogShell>
  );
}

// -----------------------------------------------------------------------

function buildPayload(
  data: PrescriptionFormValues,
  prescription: Prescription | null | undefined,
  initialData?: { pet_id: string; consultation_id?: string }
) {
  const petId = prescription?.pet_id || initialData?.pet_id;

  return {
    pet_id: petId as string,
    consultation_id: prescription?.consultation_id ?? initialData?.consultation_id,
    date: new Date(data.date).toISOString(),
    general_notes: data.general_notes?.trim() || '',
    items: data.items.map((item) => ({
      medication: item.medication.trim(),
      dosage: item.dosage?.trim() || '',
      route: item.route?.trim() || '',
      frequency: item.frequency?.trim() || '',
      duration: item.duration?.trim() || '',
      instructions: item.instructions?.trim() || '',
    })),
  };
}
