import type { Vaccine } from 'src/types';

import * as yup from 'yup';
/**
 * Vaccine Form Dialog Component
 * Modal form for creating/editing vaccine records
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useCreateVaccine, useUpdateVaccine } from 'src/hooks/useVaccinesQuery';

// -----------------------------------------------------------------------

const vaccineSchema = yup.object({
  vaccine_name: yup.string().required('Nome da vacina é obrigatório'),
  batch: yup.string(),
  manufacturer: yup.string(),
  date_applied: yup.string().required('Data de aplicação é obrigatória'),
  next_dose_date: yup.string(),
  notes: yup.string(),
});

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
  const createVaccineMutation = useCreateVaccine();
  const updateVaccineMutation = useUpdateVaccine();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vaccineSchema),
    defaultValues: {
      vaccine_name: '',
      batch: '',
      manufacturer: '',
      date_applied: new Date().toISOString().split('T')[0],
      next_dose_date: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (vaccine) {
      reset(vaccine);
    } else {
      reset({
        vaccine_name: '',
        batch: '',
        manufacturer: '',
        date_applied: new Date().toISOString().split('T')[0],
        next_dose_date: '',
        notes: '',
      });
    }
  }, [vaccine, reset]);

  const isLoading = createVaccineMutation.isPending || updateVaccineMutation.isPending;

  const onSubmit = handleSubmit((data: any) => {
    const petId = vaccine?.pet_id || initialData?.pet_id;

    if (!petId) {
      console.error('Pet ID is required');
      return;
    }

    const vaccineData = {
      ...data,
      pet_id: petId,
      date_applied: new Date(data.date_applied).toISOString(),
      next_dose_date: data.next_dose_date ? new Date(data.next_dose_date).toISOString() : undefined,
    };

    if (vaccine) {
      updateVaccineMutation.mutate(
        { id: vaccine.id, data: vaccineData },
        {
          onSuccess: () => {
            onSuccess?.('Vacinação atualizada com sucesso!');
            reset();
          },
        }
      );
    } else {
      createVaccineMutation.mutate(vaccineData, {
        onSuccess: () => {
          onSuccess?.('Vacinação criada com sucesso!');
          reset();
        },
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{vaccine ? 'Editar Vacinação' : 'Nova Vacinação'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="vaccine_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome da Vacina"
                  fullWidth
                  error={!!errors.vaccine_name}
                  helperText={errors.vaccine_name?.message}
                />
              )}
            />

            <Controller
              name="batch"
              control={control}
              render={({ field }) => <TextField {...field} label="Lote" fullWidth />}
            />

            <Controller
              name="manufacturer"
              control={control}
              render={({ field }) => <TextField {...field} label="Fabricante" fullWidth />}
            />

            <Controller
              name="date_applied"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data de Aplicação"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date_applied}
                  helperText={errors.date_applied?.message}
                />
              )}
            />

            <Controller
              name="next_dose_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Próxima Dose"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

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
          {vaccine ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
