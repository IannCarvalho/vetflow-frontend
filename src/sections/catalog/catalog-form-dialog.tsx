import type { CatalogItem, CatalogItemType } from 'src/types';

import * as yup from 'yup';
/**
 * Catalog Form Dialog Component
 * Modal form for creating/editing a catalog item (service or product).
 */
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useCreateCatalogItem, useUpdateCatalogItem } from 'src/hooks/useCatalogQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

// -----------------------------------------------------------------------

const catalogSchema = yup.object({
  type: yup.string().required('Selecione o tipo'),
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string(),
  price: yup.number().min(0, 'Preço inválido').typeError('Informe um número'),
  unit: yup.string(),
  stock_quantity: yup.number().min(0, 'Estoque inválido').typeError('Informe um número'),
  min_stock: yup.number().min(0, 'Estoque mínimo inválido').typeError('Informe um número'),
  active: yup.boolean(),
});

interface CatalogFormValues {
  type: CatalogItemType;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock_quantity: number;
  min_stock: number;
  active: boolean;
}

interface CatalogFormDialogProps {
  open: boolean;
  onClose: () => void;
  item?: CatalogItem | null;
  onSuccess?: (message: string) => void;
}

const DEFAULTS: CatalogFormValues = {
  type: 'service',
  name: '',
  description: '',
  price: 0,
  unit: 'un',
  stock_quantity: 0,
  min_stock: 0,
  active: true,
};

export default function CatalogFormDialog({
  open,
  onClose,
  item,
  onSuccess,
}: CatalogFormDialogProps) {
  const createMutation = useCreateCatalogItem();
  const updateMutation = useUpdateCatalogItem();

  const [submitError, setSubmitError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CatalogFormValues>({
    resolver: yupResolver(catalogSchema) as any,
    defaultValues: DEFAULTS,
  });

  const type = watch('type');
  const isProduct = type === 'product';

  useEffect(() => {
    setSubmitError('');
    if (item) {
      reset({
        type: item.type,
        name: item.name,
        description: item.description ?? '',
        price: item.price ?? 0,
        unit: item.unit ?? 'un',
        stock_quantity: item.stock_quantity ?? 0,
        min_stock: item.min_stock ?? 0,
        active: item.active,
      });
    } else {
      reset(DEFAULTS);
    }
  }, [item, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit((data) => {
    setSubmitError('');

    const payload = {
      type: data.type,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      price: Number(data.price) || 0,
      unit: data.unit?.trim() || 'un',
      stock_quantity: data.type === 'product' ? Number(data.stock_quantity) || 0 : 0,
      min_stock: data.type === 'product' ? Number(data.min_stock) || 0 : 0,
      active: data.active,
    };

    if (item) {
      updateMutation.mutate(
        { id: item.id, data: payload },
        {
          onSuccess: () => onSuccess?.('Item atualizado com sucesso!'),
          onError: (error) => setSubmitError(getApiErrorMessage(error, 'Erro ao atualizar item')),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess?.('Item criado com sucesso!'),
        onError: (error) => setSubmitError(getApiErrorMessage(error, 'Erro ao criar item')),
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? 'Editar Item' : 'Novo Item'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Tipo" fullWidth>
                  <MenuItem value="service">Serviço</MenuItem>
                  <MenuItem value="product">Produto</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Descrição" fullWidth multiline rows={2} />
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preço (R$)"
                    type="number"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Unidade" fullWidth placeholder="un, ml, cx..." />
                )}
              />
            </Stack>

            {isProduct && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="stock_quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Estoque atual"
                      type="number"
                      fullWidth
                      error={!!errors.stock_quantity}
                      helperText={errors.stock_quantity?.message}
                    />
                  )}
                />
                <Controller
                  name="min_stock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Estoque mínimo"
                      type="number"
                      fullWidth
                      error={!!errors.min_stock}
                      helperText={errors.min_stock?.message}
                    />
                  )}
                />
              </Stack>
            )}

            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Ativo"
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
          {item ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
