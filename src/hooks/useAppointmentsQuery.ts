/**
 * Appointments React Query Hooks
 *
 * Provides React Query hooks for appointment (agenda) data fetching and mutations.
 */
import { useQuery } from '@tanstack/react-query';

import { createEntityHooks } from './createEntityHooks';
import * as appointmentsApi from '../api/appointmentsApi';

import type { Appointment } from '../types';

const APPOINTMENTS_QUERY_KEY = ['appointments'] as const;

type CreateAppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;

const appointmentHooks = createEntityHooks<Appointment, CreateAppointmentInput>({
  queryKey: APPOINTMENTS_QUERY_KEY,
  // Chave de detalhe espalhada (default): [...QUERY_KEY, id].
  detailKey: (id) => [...APPOINTMENTS_QUERY_KEY, id],
  // Comportamento histórico: mutations invalidam apenas a chave base.
  invalidateDetailOnUpdate: false,
  api: {
    getAll: appointmentsApi.getAppointments,
    getById: appointmentsApi.getAppointmentById,
    create: appointmentsApi.createAppointment,
    update: appointmentsApi.updateAppointment,
    remove: appointmentsApi.deleteAppointment,
  },
});

/**
 * Hook to fetch all appointments
 */
export const useGetAppointments = appointmentHooks.useGetAll;

/**
 * Hook to fetch appointments within a date range (calendar view)
 */
export const useGetAppointmentsInRange = (start: string | undefined, end: string | undefined) =>
  useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, 'range', start, end],
    queryFn: () => appointmentsApi.getAppointmentsInRange(start!, end!),
    enabled: !!start && !!end,
  });

/**
 * Hook to fetch a single appointment by ID
 */
export const useGetAppointmentById = appointmentHooks.useGetById;

/**
 * Hook to fetch all appointments for a specific pet
 */
export const useGetAppointmentsByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, 'pet', petId],
    queryFn: () => appointmentsApi.getAppointmentsByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new appointment
 */
export const useCreateAppointment = appointmentHooks.useCreate;

/**
 * Hook to update an existing appointment
 */
export const useUpdateAppointment = appointmentHooks.useUpdate;

/**
 * Hook to delete an appointment
 */
export const useDeleteAppointment = appointmentHooks.useDelete;
