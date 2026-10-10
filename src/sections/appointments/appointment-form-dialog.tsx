import type { Pet, Appointment, AppointmentType, AppointmentStatus } from 'src/types';

import * as yup from 'yup';
/**
 * Appointment Form Dialog Component
 * Modal form for creating/editing agenda appointments.
 */
import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useCreateAppointment, useUpdateAppointment } from 'src/hooks/useAppointmentsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

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

/**
 * Convert an ISO timestamp to the `YYYY-MM-DDTHH:mm` value expected by
 * <input type="datetime-local"> in the user's local timezone.
 */
function toLocalInputValue(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** Default: next round hour, one hour long. */
function defaultStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalInputValue(d.toISOString());
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

  const [submitError, setSubmitError] = useState('');

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: yupResolver(appointmentSchema) as any,
    defaultValues: emptyValues,
  });

  useEffect(() => {
    setSubmitError('');
    if (appointment) {
      reset({
        pet_id: appointment.pet_id,
        title: appointment.title ?? '',
        type: appointment.type,
        status: appointment.status,
        start_time: toLocalInputValue(appointment.start_time),
        end_time: toLocalInputValue(appointment.end_time),
        notes: appointment.notes ?? '',
      });
    } else {
      reset(emptyValues);
    }
  }, [appointment, reset, emptyValues]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const petOptions = useMemo(() => pets ?? [], [pets]);
  const ownerByPetId = useMemo(() => {
    const map = new Map<string, string>();
    petOptions.forEach((p: Pet) => map.set(p.id, p.owner_id));
    return map;
  }, [petOptions]);

  const onSubmit = handleSubmit((data) => {
    setSubmitError('');

    const payload = {
      pet_id: data.pet_id,
      client_id: ownerByPetId.get(data.pet_id) || undefined,
      title: data.title?.trim() || '',
      type: data.type,
      status: data.status,
      start_time: new Date(data.start_time).toISOString(),
      end_time: data.end_time ? new Date(data.end_time).toISOString() : undefined,
      notes: data.notes?.trim() || '',
    };

    if (appointment) {
      updateMutation.mutate(
        { id: appointment.id, data: payload },
        {
          onSuccess: () => {
            onSuccess?.('Agendamento atualizado com sucesso!');
            reset(emptyValues);
          },
          onError: (error) =>
            setSubmitError(getApiErrorMessage(error, 'Erro ao atualizar agendamento')),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.('Agendamento criado com sucesso!');
          reset(emptyValues);
        },
        onError: (error) =>
          setSubmitError(getApiErrorMessage(error, 'Erro ao criar agendamento')),
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}

            <Controller
              name="pet_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Pet"
                  fullWidth
                  error={!!errors.pet_id}
                  helperText={errors.pet_id?.message}
                >
                  {petOptions.length === 0 ? (
                    <MenuItem value="" disabled>
                      Nenhum pet cadastrado
                    </MenuItem>
                  ) : (
                    petOptions.map((pet: Pet) => (
                      <MenuItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Título (opcional)" fullWidth />
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo"
                    fullWidth
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    {APPOINTMENT_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    {APPOINTMENT_STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Início"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.start_time}
                    helperText={errors.start_time?.message}
                  />
                )}
              />

              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Término (opcional)"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Stack>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Notas" fullWidth multiline rows={3} />
              )}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {appointment ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
