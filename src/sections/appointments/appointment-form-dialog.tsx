import type { Pet, Appointment, AppointmentType, AppointmentStatus } from 'src/types';

import * as yup from 'yup';
/**
 * Appointment Form Dialog Component
 * Modal form for creating/editing agenda appointments.
 */
import { useMemo } from 'react';

import Stack from '@mui/material/Stack';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreateAppointment, useUpdateAppointment } from 'src/hooks/useAppointmentsQuery';

import { defaultStart, toLocalInputValue } from 'src/utils/format-time';

import { RHFSelect, RHFTextField, FormDialogShell } from 'src/components/form';

import { APPOINTMENT_TYPE_OPTIONS, APPOINTMENT_STATUS_OPTIONS } from './appointment-constants';

// -----------------------------------------------------------------------

const appointmentSchema = yup.object({
  pet_id: yup.string().required('Selecione o pet'),
  title: yup.string(),
  type: yup.string().required('Selecione o tipo'),
  status: yup.string().required('Selecione o status'),
  start_time: yup.string().required('Data e hora de início são obrigatórias'),
  end_time: yup.string(),
  notes: yup.string(),
});

interface AppointmentFormValues {
  pet_id: string;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  start_time: string;
  end_time: string;
  notes: string;
}

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  onSuccess?: (message: string) => void;
  /** Prefill values, e.g. a selected pet or a clicked calendar slot. */
  initialData?: { pet_id?: string; start_time?: string };
}

export default function AppointmentFormDialog({
  open,
  onClose,
  appointment,
  onSuccess,
  initialData,
}: AppointmentFormDialogProps) {
  const { data: pets } = useGetPets();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  const emptyValues = useMemo<AppointmentFormValues>(
    () => ({
      pet_id: initialData?.pet_id ?? '',
      title: '',
      type: 'consultation',
      status: 'scheduled',
      start_time: initialData?.start_time
        ? toLocalInputValue(initialData.start_time)
        : defaultStart(),
      end_time: '',
      notes: '',
    }),
    [initialData?.pet_id, initialData?.start_time]
  );

  const petOptions = useMemo(() => pets ?? [], [pets]);
  const ownerByPetId = useMemo(() => {
    const map = new Map<string, string>();
    petOptions.forEach((p: Pet) => map.set(p.id, p.owner_id));
    return map;
  }, [petOptions]);

  const { control, isLoading, isEdit, submitError, clearError, onSubmit } = useEntityForm<
    AppointmentFormValues,
    ReturnType<typeof buildPayload>,
    Appointment
  >({
    createMutation,
    updateMutation,
    schema: appointmentSchema,
    defaultValues: emptyValues,
    entity: appointment,
    resetDeps: [emptyValues],
    toFormValues: (a) => ({
      pet_id: a.pet_id,
      title: a.title ?? '',
      type: a.type,
      status: a.status,
      start_time: toLocalInputValue(a.start_time),
      end_time: toLocalInputValue(a.end_time),
      notes: a.notes ?? '',
    }),
    toPayload: (data) => buildPayload(data, ownerByPetId),
    messages: {
      createSuccess: 'Agendamento criado com sucesso!',
      updateSuccess: 'Agendamento atualizado com sucesso!',
      createError: 'Erro ao criar agendamento',
      updateError: 'Erro ao atualizar agendamento',
    },
    onSuccess,
  });

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
    >
      <RHFSelect
        name="pet_id"
        control={control}
        label="Pet"
        fullWidth
        emptyLabel="Nenhum pet cadastrado"
        options={petOptions.map((pet: Pet) => ({ value: pet.id, label: pet.name }))}
      />

      <RHFTextField name="title" control={control} label="Título (opcional)" fullWidth />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFSelect
          name="type"
          control={control}
          label="Tipo"
          fullWidth
          options={APPOINTMENT_TYPE_OPTIONS}
        />
        <RHFSelect
          name="status"
          control={control}
          label="Status"
          fullWidth
          options={APPOINTMENT_STATUS_OPTIONS}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField
          name="start_time"
          control={control}
          label="Início"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <RHFTextField
          name="end_time"
          control={control}
          label="Término (opcional)"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <RHFTextField name="notes" control={control} label="Notas" fullWidth multiline rows={3} />
    </FormDialogShell>
  );
}

// -----------------------------------------------------------------------

function buildPayload(data: AppointmentFormValues, ownerByPetId: Map<string, string>) {
  return {
    pet_id: data.pet_id,
    client_id: ownerByPetId.get(data.pet_id) || undefined,
    title: data.title?.trim() || '',
    type: data.type,
    status: data.status,
    start_time: new Date(data.start_time).toISOString(),
    end_time: data.end_time ? new Date(data.end_time).toISOString() : undefined,
    notes: data.notes?.trim() || '',
  };
}
