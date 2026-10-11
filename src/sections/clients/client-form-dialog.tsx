import type { Client } from 'src/types';

import * as yup from 'yup';
/**
 * Client Form Dialog Component
 * Modal form for creating/editing clients
 */
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreateClient, useUpdateClient } from 'src/hooks/useClientsQuery';

import { lookupCep } from 'src/utils/viacep';
import { maskCEP, maskCPF, maskPhone, isValidCEP, isValidCPF, isValidPhone } from 'src/utils/masks';

import { RHFTextField, FormDialogShell } from 'src/components/form';

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

interface ClientFormValues {
  full_name: string;
  cpf: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement: string;
    zip_code: string;
  };
}

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess?: (message: string) => void;
}

const DEFAULTS: ClientFormValues = {
  full_name: '',
  cpf: '',
  phone: '',
  address: {
    street: '',
    number: '',
    complement: '',
    zip_code: '',
  },
};

export default function ClientFormDialog({
  open,
  onClose,
  client,
  onSuccess,
}: ClientFormDialogProps) {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [cepLoading, setCepLoading] = useState(false);

  const { control, setValue, formState, isLoading, isEdit, submitError, clearError, onSubmit } =
    useEntityForm<ClientFormValues, ClientFormValues, Client>({
      createMutation,
      updateMutation,
      schema: clientSchema,
      defaultValues: DEFAULTS,
      entity: client,
      // Carrega a entidade inteira no modo edição, idêntico ao `reset(client)`.
      toFormValues: (c) => c as unknown as ClientFormValues,
      // Payload idêntico: os valores validados são enviados tal como estão.
      toPayload: (data) => data,
      messages: {
        createSuccess: 'Cliente criado com sucesso!',
        updateSuccess: 'Cliente atualizado com sucesso!',
        createError: 'Erro ao criar cliente',
        updateError: 'Erro ao atualizar cliente',
      },
      onSuccess,
    });

  const { errors } = formState;

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

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
    >
      <RHFTextField name="full_name" control={control} label="Nome Completo" fullWidth />

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
          <RHFTextField name="address.street" control={control} label="Rua" fullWidth />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <RHFTextField name="address.number" control={control} label="Número" fullWidth />
        </Grid>
      </Grid>

      <RHFTextField name="address.complement" control={control} label="Complemento" fullWidth />

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
            helperText={
              errors.address?.zip_code?.message ?? (cepLoading ? 'Buscando endereço...' : undefined)
            }
            InputProps={{
              endAdornment: cepLoading ? <CircularProgress size={18} /> : undefined,
            }}
          />
        )}
      />
    </FormDialogShell>
  );
}
