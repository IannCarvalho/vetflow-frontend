/**
 * Shared labels and colors for appointment types and statuses (pt-BR).
 */
import type { AppointmentType, AppointmentStatus } from 'src/types';

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: 'Consulta',
  vaccine: 'Vacinação',
  return: 'Retorno',
  surgery: 'Cirurgia',
  exam: 'Exame',
  grooming: 'Banho e Tosa',
  other: 'Outro',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

type ChipColor = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, ChipColor> = {
  scheduled: 'info',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'default',
  no_show: 'error',
};

export const APPOINTMENT_TYPE_OPTIONS = (
  Object.keys(APPOINTMENT_TYPE_LABELS) as AppointmentType[]
).map((value) => ({ value, label: APPOINTMENT_TYPE_LABELS[value] }));

export const APPOINTMENT_STATUS_OPTIONS = (
  Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]
).map((value) => ({ value, label: APPOINTMENT_STATUS_LABELS[value] }));
