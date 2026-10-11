import type { CatalogItem, CatalogItemType } from 'src/types';

import * as yup from 'yup';
/**
 * Catalog Form Dialog Component
 * Modal form for creating/editing a catalog item (service or product).
 */
import { Controller } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreateCatalogItem, useUpdateCatalogItem } from 'src/hooks/useCatalogQuery';

import { RHFSelect, RHFTextField, FormDialogShell } from 'src/components/form';

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

  const { control, watch, isLoading, isEdit, submitError, clearError, onSubmit } = useEntityForm<
    CatalogFormValues,
    ReturnType<typeof buildPayload>,
    CatalogItem
  >({
    createMutation,
    updateMutation,
    schema: catalogSchema,
    defaultValues: DEFAULTS,
    entity: item,
    resetOnSuccess: false,
    toFormValues: (it) => ({
      type: it.type,
      name: it.name,
      description: it.description ?? '',
      price: it.price ?? 0,
      unit: it.unit ?? 'un',
      stock_quantity: it.stock_quantity ?? 0,
      min_stock: it.min_stock ?? 0,
      active: it.active,
    }),
    toPayload: buildPayload,
    messages: {
      createSuccess: 'Item criado com sucesso!',
      updateSuccess: 'Item atualizado com sucesso!',
      createError: 'Erro ao criar item',
      updateError: 'Erro ao atualizar item',
    },
    onSuccess,
  });

  const type = watch('type');
  const isProduct = type === 'product';

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Item' : 'Novo Item'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
    >
      <RHFSelect
        name="type"
        control={control}
        label="Tipo"
        fullWidth
        options={[
          { value: 'service', label: 'Serviço' },
          { value: 'product', label: 'Produto' },
        ]}
      />

      <RHFTextField name="name" control={control} label="Nome" fullWidth />

      <RHFTextField name="description" control={control} label="Descrição" fullWidth multiline rows={2} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="price" control={control} label="Preço (R$)" type="number" fullWidth />
        <RHFTextField
          name="unit"
          control={control}
          label="Unidade"
          fullWidth
          placeholder="un, ml, cx..."
        />
      </Stack>

      {isProduct && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField
            name="stock_quantity"
            control={control}
            label="Estoque atual"
            type="number"
            fullWidth
          />
          <RHFTextField
            name="min_stock"
            control={control}
            label="Estoque mínimo"
            type="number"
            fullWidth
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
    </FormDialogShell>
  );
}

// -----------------------------------------------------------------------

function buildPayload(data: CatalogFormValues) {
  return {
    type: data.type,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    price: Number(data.price) || 0,
    unit: data.unit?.trim() || 'un',
    stock_quantity: data.type === 'product' ? Number(data.stock_quantity) || 0 : 0,
    min_stock: data.type === 'product' ? Number(data.min_stock) || 0 : 0,
    active: data.active,
  };
}
