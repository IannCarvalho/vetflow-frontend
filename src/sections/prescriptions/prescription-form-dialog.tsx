import type { Prescription } from 'src/types';

import * as yup from 'yup';
/**
 * Prescription Form Dialog Component
 * Modal form for creating/editing a prescription (receituário) with a dynamic
 * list of medication items.
 */
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useCreatePrescription, useUpdatePrescription } from 'src/hooks/usePrescriptionsQuery';

import { toDateInput } from 'src/utils/format-time';
import { getApiErrorMessage } from 'src/utils/api-error';

import { Iconify } from 'src/components/iconify';

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

  const [submitError, setSubmitError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: yupResolver(prescriptionSchema) as any,
    defaultValues: {
      date: toDateInput(),
      general_notes: '',
      items: [{ ...emptyItem }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    setSubmitError('');
    if (prescription) {
      reset({
        date: toDateInput(prescription.date),
        general_notes: prescription.general_notes ?? '',
        items:
          prescription.items && prescription.items.length > 0
            ? prescription.items.map((item) => ({ ...emptyItem, ...item }))
            : [{ ...emptyItem }],
      });
    } else {
      reset({
        date: toDateInput(),
        general_notes: '',
        items: [{ ...emptyItem }],
      });
    }
  }, [prescription, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit((data) => {
    setSubmitError('');
    const petId = prescription?.pet_id || initialData?.pet_id;

    if (!petId) {
      setSubmitError('Não foi possível identificar o pet deste receituário.');
      return;
    }

    const payload = {
      pet_id: petId,
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

    if (prescription) {
      updateMutation.mutate(
        { id: prescription.id, data: payload },
        {
          onSuccess: () => {
            onSuccess?.('Receituário atualizado com sucesso!');
          },
          onError: (error) =>
            setSubmitError(getApiErrorMessage(error, 'Erro ao atualizar receituário')),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.('Receituário criado com sucesso!');
        },
        onError: (error) =>
          setSubmitError(getApiErrorMessage(error, 'Erro ao criar receituário')),
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{prescription ? 'Editar Receituário' : 'Novo Receituário'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                  sx={{ maxWidth: 220 }}
                />
              )}
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

            {typeof errors.items?.message === 'string' && (
              <Alert severity="warning">{errors.items.message}</Alert>
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
                  <Controller
                    name={`items.${index}.medication`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Medicamento"
                        fullWidth
                        error={!!errors.items?.[index]?.medication}
                        helperText={errors.items?.[index]?.medication?.message}
                      />
                    )}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name={`items.${index}.dosage`}
                      control={control}
                      render={({ field }) => <TextField {...field} label="Dose" fullWidth />}
                    />
                    <Controller
                      name={`items.${index}.route`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Via (oral, tópica...)" fullWidth />
                      )}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name={`items.${index}.frequency`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Frequência (ex: 2x ao dia)" fullWidth />
                      )}
                    />
                    <Controller
                      name={`items.${index}.duration`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Duração (ex: 7 dias)" fullWidth />
                      )}
                    />
                  </Stack>

                  <Controller
                    name={`items.${index}.instructions`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Instruções" fullWidth multiline rows={2} />
                    )}
                  />
                </Stack>
              </Box>
            ))}

            <Divider />

            <Controller
              name="general_notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Observações gerais" fullWidth multiline rows={3} />
              )}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {prescription ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
