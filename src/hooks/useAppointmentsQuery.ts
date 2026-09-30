/**
 * Appointments React Query Hooks
 *
 * Provides React Query hooks for appointment (agenda) data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as appointmentsApi from '../api/appointmentsApi';

import type { Appointment } from '../types';

const APPOINTMENTS_QUERY_KEY = ['appointments'] as const;

type CreateAppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;

/**
 * Hook to fetch all appointments
 */
export const useGetAppointments = () =>
  useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: appointmentsApi.getAppointments,
  });

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
export const useGetAppointmentById = (id: string | undefined) =>
  useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => appointmentsApi.getAppointmentById(id!),
    enabled: !!id,
  });

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
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentInput) => appointmentsApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });
};

/**
 * Hook to update an existing appointment
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      appointmentsApi.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });
};

/**
 * Hook to delete an appointment
 */
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
  });
};
