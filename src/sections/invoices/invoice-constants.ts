/**
 * Shared labels and colors for invoice payment status and method (pt-BR).
 */
import type { PaymentMethod, PaymentStatus } from 'src/types';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  partial: 'Parcial',
  overdue: 'Vencido',
  canceled: 'Cancelado',
};

type ChipColor = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, ChipColor> = {
  pending: 'warning',
  paid: 'success',
  partial: 'info',
  overdue: 'error',
  canceled: 'default',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  '': 'Não informado',
  cash: 'Dinheiro',
  card: 'Cartão',
  pix: 'Pix',
  transfer: 'Transferência',
  boleto: 'Boleto',
};

export const PAYMENT_STATUS_OPTIONS = (
  Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]
).map((value) => ({ value, label: PAYMENT_STATUS_LABELS[value] }));

export const PAYMENT_METHOD_OPTIONS = (
  Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
).map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }));

/** Format a numeric amount as Brazilian Real. Re-exported from the shared util. */
export { formatBRL } from 'src/utils/format-number';
