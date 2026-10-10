/**
 * Prescriptions React Query Hooks
 *
 * Provides React Query hooks for prescription (receituário) data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as prescriptionsApi from '../api/prescriptionsApi';

import type { Prescription } from '../types';

const PRESCRIPTIONS_QUERY_KEY = ['prescriptions'] as const;

type CreatePrescriptionInput = Omit<Prescription, 'id' | 'created_at' | 'updated_at'>;

/**
 * Hook to fetch all prescriptions
 */
export const useGetPrescriptions = () =>
  useQuery({
    queryKey: PRESCRIPTIONS_QUERY_KEY,
    queryFn: prescriptionsApi.getPrescriptions,
  });

/**
 * Hook to fetch a single prescription by ID
 */
export const useGetPrescriptionById = (id: string | undefined) =>
  useQuery({
    queryKey: [...PRESCRIPTIONS_QUERY_KEY, id],
    queryFn: () => prescriptionsApi.getPrescriptionById(id!),
    enabled: !!id,
  });

/**
 * Hook to fetch all prescriptions for a specific pet
 */
export const useGetPrescriptionsByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [...PRESCRIPTIONS_QUERY_KEY, 'pet', petId],
    queryFn: () => prescriptionsApi.getPrescriptionsByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new prescription
 */
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePrescriptionInput) => prescriptionsApi.createPrescription(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PRESCRIPTIONS_QUERY_KEY, 'pet', created.pet_id],
      });
    },
  });
};

/**
 * Hook to update an existing prescription
 */
export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prescription> }) =>
      prescriptionsApi.updatePrescription(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRESCRIPTIONS_QUERY_KEY, updated.id] });
      queryClient.invalidateQueries({
        queryKey: [...PRESCRIPTIONS_QUERY_KEY, 'pet', updated.pet_id],
      });
    },
  });
};

/**
 * Hook to delete a prescription
 */
export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => prescriptionsApi.deletePrescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_QUERY_KEY });
    },
  });
};
