import type { Client, Invoice, PaymentMethod, PaymentStatus } from 'src/types';

import * as yup from 'yup';
/**
 * Invoice Form Dialog Component
 * Modal form for creating/editing an invoice (financeiro) with a dynamic list
 * of billable items and a live total preview.
 */
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetClients } from 'src/hooks/useClientsQuery';
import { useCreateInvoice, useUpdateInvoice } from 'src/hooks/useInvoicesQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { Iconify } from 'src/components/iconify';

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

function toDateInput(iso?: string): string {
  if (!iso) return new Date().toISOString().split('T')[0];
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? new Date().toISOString().split('T')[0]
    : d.toISOString().split('T')[0];
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

  const [submitError, setSubmitError] = useState('');

  const buildDefaults = (): InvoiceFormValues => ({
    client_id: initialData?.client_id ?? '',
    status: 'pending',
    method: '',
    issue_date: toDateInput(),
    due_date: '',
    discount: 0,
    notes: '',
    items: [{ ...emptyItem }],
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: yupResolver(invoiceSchema) as any,
    defaultValues: buildDefaults(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    setSubmitError('');
    if (invoice) {
      reset({
        client_id: invoice.client_id,
        status: invoice.status,
        method: invoice.method ?? '',
        issue_date: toDateInput(invoice.issue_date),
        due_date: invoice.due_date ? toDateInput(invoice.due_date) : '',
        discount: invoice.discount ?? 0,
        notes: invoice.notes ?? '',
        items:
          invoice.items && invoice.items.length > 0
            ? invoice.items.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                unit_price: it.unit_price,
              }))
            : [{ ...emptyItem }],
      });
    } else {
      reset(buildDefaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, reset, open]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

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

  const onSubmit = handleSubmit((data) => {
    setSubmitError('');

    const payload = {
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

    if (invoice) {
      updateMutation.mutate(
        { id: invoice.id, data: payload },
        {
          onSuccess: () => onSuccess?.('Fatura atualizada com sucesso!'),
          onError: (error) => setSubmitError(getApiErrorMessage(error, 'Erro ao atualizar fatura')),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess?.('Fatura criada com sucesso!'),
        onError: (error) => setSubmitError(getApiErrorMessage(error, 'Erro ao criar fatura')),
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{invoice ? 'Editar Fatura' : 'Nova Fatura'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}

            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Cliente"
                  fullWidth
                  error={!!errors.client_id}
                  helperText={errors.client_id?.message}
                >
                  {clientOptions.length === 0 ? (
                    <MenuItem value="" disabled>
                      Nenhum cliente cadastrado
                    </MenuItem>
                  ) : (
                    clientOptions.map((client: Client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.full_name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="issue_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Emissão"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.issue_date}
                    helperText={errors.issue_date?.message}
                  />
                )}
              />
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Vencimento (opcional)"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Forma de pagamento" fullWidth>
                    {PAYMENT_METHOD_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
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
                <Controller
                  name={`items.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição"
                      fullWidth
                      error={!!errors.items?.[index]?.description}
                      helperText={errors.items?.[index]?.description?.message}
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Qtd"
                      type="number"
                      sx={{ maxWidth: { sm: 100 } }}
                      error={!!errors.items?.[index]?.quantity}
                      helperText={errors.items?.[index]?.quantity?.message}
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.unit_price`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Preço unit."
                      type="number"
                      sx={{ maxWidth: { sm: 140 } }}
                      error={!!errors.items?.[index]?.unit_price}
                      helperText={errors.items?.[index]?.unit_price?.message}
                    />
                  )}
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

            <Controller
              name="discount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Desconto (R$)"
                  type="number"
                  sx={{ maxWidth: 200 }}
                  error={!!errors.discount}
                  helperText={errors.discount?.message}
                />
              )}
            />

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal: {formatBRL(subtotal)}
              </Typography>
              <Typography variant="h6">Total: {formatBRL(total)}</Typography>
            </Box>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Observações" fullWidth multiline rows={2} />
              )}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {invoice ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
