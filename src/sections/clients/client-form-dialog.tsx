import type { Client } from 'src/types';

import * as yup from 'yup';
/**
 * Client Form Dialog Component
 * Modal form for creating/editing clients
 */
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
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

import { lookupCep } from 'src/utils/viacep';
import { getApiErrorMessage } from 'src/utils/api-error';
import { maskCEP, maskCPF, maskPhone, isValidCEP, isValidCPF, isValidPhone } from 'src/utils/masks';

// -----------------------------------------------------------------------

const clientSchema = yup.object({
  full_name: yup.string().trim().required('Nome completo é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('valid-cpf', 'CPF inválido', (value) => isValidCPF(value ?? '')),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .test('valid-phone', 'Telefone inválido', (value) => isValidPhone(value ?? '')),
  address: yup.object({
    street: yup.string().trim().required('Rua é obrigatória'),
    number: yup.string().trim().required('Número é obrigatório'),
    complement: yup.string(),
    zip_code: yup
      .string()
      .required('CEP é obrigatório')
      .test('valid-cep', 'CEP inválido', (value) => isValidCEP(value ?? '')),
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

  const [submitError, setSubmitError] = useState('');

  const [cepLoading, setCepLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
    setSubmitError('');
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

  // Mask the CEP and, once it has 8 digits, look up the address via ViaCEP and
  // auto-fill the street. Failures are silently ignored (best-effort).
  const handleCepChange = async (raw: string, onChange: (v: string) => void) => {
    const masked = maskCEP(raw);
    onChange(masked);

    if (isValidCEP(masked)) {
      setCepLoading(true);
      const address = await lookupCep(masked);
      setCepLoading(false);
      if (address?.street) {
        setValue('address.street', address.street, { shouldValidate: true });
      }
    }
  };

  const onSubmit = handleSubmit((data: any) => {
    setSubmitError('');
    if (client) {
      updateClientMutation.mutate(
        { id: client.id, data },
        {
          onSuccess: () => {
            onSuccess?.('Cliente atualizado com sucesso!');
            reset();
          },
          onError: (error) =>
            setSubmitError(getApiErrorMessage(error, 'Erro ao atualizar cliente')),
        }
      );
    } else {
      createClientMutation.mutate(data, {
        onSuccess: () => {
          onSuccess?.('Cliente criado com sucesso!');
          reset();
        },
        onError: (error) => setSubmitError(getApiErrorMessage(error, 'Erro ao criar cliente')),
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}
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
                  onChange={(e) => field.onChange(maskCPF(e.target.value))}
                  label="CPF"
                  placeholder="000.000.000-00"
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
                  onChange={(e) => field.onChange(maskPhone(e.target.value))}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
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
                  onChange={(e) => handleCepChange(e.target.value, field.onChange)}
                  label="CEP"
                  placeholder="00000-000"
                  fullWidth
                  error={!!errors.address?.zip_code}
                  helperText={errors.address?.zip_code?.message ?? (cepLoading ? 'Buscando endereço...' : undefined)}
                  InputProps={{
                    endAdornment: cepLoading ? <CircularProgress size={18} /> : undefined,
                  }}
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
