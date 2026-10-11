import type { Client, Invoice, PaymentMethod, PaymentStatus } from 'src/types';

import * as yup from 'yup';
/**
 * Invoice Form Dialog Component
 * Modal form for creating/editing an invoice (financeiro) with a dynamic list
 * of billable items and a live total preview.
 */
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useEntityForm } from 'src/hooks/useEntityForm';
import { useGetClients } from 'src/hooks/useClientsQuery';
import { useCreateInvoice, useUpdateInvoice } from 'src/hooks/useInvoicesQuery';

import { toDateInput } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { RHFSelect, RHFTextField, FormDialogShell } from 'src/components/form';

import {
  formatBRL,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from './invoice-constants';

// -----------------------------------------------------------------------

const invoiceSchema = yup.object({
  client_id: yup.string().required('Selecione o cliente'),
  status: yup.string().required('Selecione o status'),
  method: yup.string(),
  issue_date: yup.string().required('Data de emissão é obrigatória'),
  due_date: yup.string(),
  discount: yup.number().min(0, 'Desconto não pode ser negativo').typeError('Informe um número'),
  notes: yup.string(),
  items: yup
    .array()
    .of(
      yup.object({
        description: yup.string().required('Descrição é obrigatória'),
        quantity: yup
          .number()
          .moreThan(0, 'Qtd deve ser maior que zero')
          .typeError('Informe um número'),
        unit_price: yup.number().min(0, 'Preço inválido').typeError('Informe um número'),
      })
    )
    .min(1, 'Adicione ao menos um item'),
});

const emptyItem = { description: '', quantity: 1, unit_price: 0 };

interface InvoiceFormValues {
  client_id: string;
  status: PaymentStatus;
  method: PaymentMethod;
  issue_date: string;
  due_date: string;
  discount: number;
  notes: string;
  items: Array<typeof emptyItem>;
}

interface InvoiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  onSuccess?: (message: string) => void;
  initialData?: { client_id?: string };
}

export default function InvoiceFormDialog({
  open,
  onClose,
  invoice,
  onSuccess,
  initialData,
}: InvoiceFormDialogProps) {
  const { data: clients } = useGetClients();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const defaultValues = useMemo<InvoiceFormValues>(
    () => ({
      client_id: initialData?.client_id ?? '',
      status: 'pending',
      method: '',
      issue_date: toDateInput(),
      due_date: '',
      discount: 0,
      notes: '',
      items: [{ ...emptyItem }],
    }),
    [initialData?.client_id]
  );

  const { control, watch, isLoading, isEdit, submitError, clearError, onSubmit, formState } =
    useEntityForm<InvoiceFormValues, ReturnType<typeof buildPayload>, Invoice>({
      createMutation,
      updateMutation,
      schema: invoiceSchema,
      defaultValues,
      entity: invoice,
      resetOnSuccess: false,
      resetDeps: [defaultValues, open],
      toFormValues: (inv) => ({
        client_id: inv.client_id,
        status: inv.status,
        method: inv.method ?? '',
        issue_date: toDateInput(inv.issue_date),
        due_date: inv.due_date ? toDateInput(inv.due_date) : '',
        discount: inv.discount ?? 0,
        notes: inv.notes ?? '',
        items:
          inv.items && inv.items.length > 0
            ? inv.items.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                unit_price: it.unit_price,
              }))
            : [{ ...emptyItem }],
      }),
      toPayload: buildPayload,
      messages: {
        createSuccess: 'Fatura criada com sucesso!',
        updateSuccess: 'Fatura atualizada com sucesso!',
        createError: 'Erro ao criar fatura',
        updateError: 'Erro ao atualizar fatura',
      },
      onSuccess,
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const { errors } = formState;

  // Live totals preview
  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');
  const { subtotal, total } = useMemo(() => {
    const sub = (watchedItems ?? []).reduce((acc, it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unit_price) || 0;
      return acc + qty * price;
    }, 0);
    const disc = Math.min(Math.max(Number(watchedDiscount) || 0, 0), sub);
    return { subtotal: sub, total: sub - disc };
  }, [watchedItems, watchedDiscount]);

  const clientOptions = useMemo(() => clients ?? [], [clients]);

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Fatura' : 'Nova Fatura'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
      maxWidth="md"
    >
      <RHFSelect
        name="client_id"
        control={control}
        label="Cliente"
        fullWidth
        emptyLabel="Nenhum cliente cadastrado"
        options={clientOptions.map((client: Client) => ({
          value: client.id,
          label: client.full_name,
        }))}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField
          name="issue_date"
          control={control}
          label="Emissão"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <RHFTextField
          name="due_date"
          control={control}
          label="Vencimento (opcional)"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFSelect
          name="status"
          control={control}
          label="Status"
          fullWidth
          options={PAYMENT_STATUS_OPTIONS}
        />
        <RHFSelect
          name="method"
          control={control}
          label="Forma de pagamento"
          fullWidth
          options={PAYMENT_METHOD_OPTIONS}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1">Itens</Typography>
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => append({ ...emptyItem })}
        >
          Adicionar item
        </Button>
      </Stack>

      {typeof errors.items?.message === 'string' && (
        <Alert severity="warning">{errors.items.message}</Alert>
      )}

      {fields.map((fieldItem, index) => (
        <Stack
          key={fieldItem.id}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems="flex-start"
        >
          <RHFTextField
            name={`items.${index}.description`}
            control={control}
            label="Descrição"
            fullWidth
          />
          <RHFTextField
            name={`items.${index}.quantity`}
            control={control}
            label="Qtd"
            type="number"
            sx={{ maxWidth: { sm: 100 } }}
          />
          <RHFTextField
            name={`items.${index}.unit_price`}
            control={control}
            label="Preço unit."
            type="number"
            sx={{ maxWidth: { sm: 140 } }}
          />
          <IconButton
            color="error"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            sx={{ mt: 0.5 }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Divider />

      <RHFTextField
        name="discount"
        control={control}
        label="Desconto (R$)"
        type="number"
        sx={{ maxWidth: 200 }}
      />

      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" color="text.secondary">
          Subtotal: {formatBRL(subtotal)}
        </Typography>
        <Typography variant="h6">Total: {formatBRL(total)}</Typography>
      </Box>

      <RHFTextField name="notes" control={control} label="Observações" fullWidth multiline rows={2} />
    </FormDialogShell>
  );
}

// -----------------------------------------------------------------------

function buildPayload(data: InvoiceFormValues) {
  return {
    client_id: data.client_id,
    status: data.status,
    method: data.method || undefined,
    issue_date: new Date(data.issue_date).toISOString(),
    due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
    discount: Number(data.discount) || 0,
    notes: data.notes?.trim() || '',
    // Totals are recomputed on the server; send 0 placeholders.
    subtotal: 0,
    total: 0,
    items: data.items.map((it) => ({
      description: it.description.trim(),
      quantity: Number(it.quantity) || 0,
      unit_price: Number(it.unit_price) || 0,
      total: 0,
    })),
  };
}
