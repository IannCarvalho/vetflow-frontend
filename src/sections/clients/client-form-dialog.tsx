import type { Client } from 'src/types';

import * as yup from 'yup';
/**
 * Client Form Dialog Component
 * Modal form for creating/editing clients
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useCreateClient, useUpdateClient } from 'src/hooks/useClientsQuery';

// -----------------------------------------------------------------------

const clientSchema = yup.object({
  full_name: yup.string().required('Nome completo é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  address: yup.object({
    street: yup.string().required('Rua é obrigatória'),
    number: yup.string().required('Número é obrigatório'),
    complement: yup.string(),
    zip_code: yup.string().required('CEP é obrigatório'),
  }),
});

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess?: (message: string) => void;
}

export default function ClientFormDialog({
  open,
  onClose,
  client,
  onSuccess,
}: ClientFormDialogProps) {
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      full_name: '',
      cpf: '',
      phone: '',
      address: {
        street: '',
        number: '',
        complement: '',
        zip_code: '',
      },
    },
  });

  useEffect(() => {
    if (client) {
      reset(client);
    } else {
      reset({
        full_name: '',
        cpf: '',
        phone: '',
        address: {
          street: '',
          number: '',
          complement: '',
          zip_code: '',
        },
      });
    }
  }, [client, reset]);

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending;

  const onSubmit = handleSubmit((data: any) => {
    if (client) {
      updateClientMutation.mutate(
        { id: client.id, data },
        {
          onSuccess: () => {
            onSuccess?.('Cliente atualizado com sucesso!');
            reset();
          },
        }
      );
    } else {
      createClientMutation.mutate(data, {
        onSuccess: () => {
          onSuccess?.('Cliente criado com sucesso!');
          reset();
        },
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome Completo"
                  fullWidth
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message}
                />
              )}
            />

            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CPF"
                  fullWidth
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telefone"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Endereço
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rua"
                      fullWidth
                      error={!!errors.address?.street}
                      helperText={errors.address?.street?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="address.number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Número"
                      fullWidth
                      error={!!errors.address?.number}
                      helperText={errors.address?.number?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="address.complement"
              control={control}
              render={({ field }) => <TextField {...field} label="Complemento" fullWidth />}
            />

            <Controller
              name="address.zip_code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CEP"
                  fullWidth
                  error={!!errors.address?.zip_code}
                  helperText={errors.address?.zip_code?.message}
                />
              )}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {client ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
