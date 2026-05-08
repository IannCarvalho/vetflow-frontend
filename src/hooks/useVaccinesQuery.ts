/**
 * Vaccines React Query Hooks
 *
 * Provides React Query hooks for vaccine data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as vaccinesApi from '../api/vaccinesApi';

import type { Vaccine } from '../types';

const VACCINES_QUERY_KEY = ['vaccines'] as const;

/**
 * Hook to fetch all vaccines
 */
export const useGetVaccines = () =>
  useQuery({
    queryKey: VACCINES_QUERY_KEY,
    queryFn: vaccinesApi.getVaccines,
  });

/**
 * Hook to fetch a single vaccine by ID
 */
export const useGetVaccineById = (id: string | undefined) =>
  useQuery({
    queryKey: [VACCINES_QUERY_KEY, id],
    queryFn: () => vaccinesApi.getVaccineById(id!),
    enabled: !!id,
  });

/**
 * Hook to fetch all vaccines for a specific pet
 */
export const useGetVaccinesByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [VACCINES_QUERY_KEY, 'pet', petId],
    queryFn: () => vaccinesApi.getVaccinesByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new vaccine record
 */
export const useCreateVaccine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Vaccine, 'id' | 'created_at'>) => vaccinesApi.createVaccine(data),
    onSuccess: (newVaccine) => {
      queryClient.invalidateQueries({ queryKey: VACCINES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [VACCINES_QUERY_KEY, 'pet', newVaccine.pet_id],
      });
    },
  });
};

/**
 * Hook to update an existing vaccine record
 */
export const useUpdateVaccine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vaccine> }) =>
      vaccinesApi.updateVaccine(id, data),
    onSuccess: (updatedVaccine) => {
      queryClient.invalidateQueries({ queryKey: VACCINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [VACCINES_QUERY_KEY, updatedVaccine.id] });
      queryClient.invalidateQueries({
        queryKey: [VACCINES_QUERY_KEY, 'pet', updatedVaccine.pet_id],
      });
    },
  });
};

/**
 * Hook to delete a vaccine record
 */
export const useDeleteVaccine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vaccinesApi.deleteVaccine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VACCINES_QUERY_KEY });
    },
  });
};
