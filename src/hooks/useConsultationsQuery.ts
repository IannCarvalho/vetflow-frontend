/**
 * Consultations React Query Hooks
 *
 * Provides React Query hooks for consultation data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as consultationsApi from '../api/consultationsApi';

import type { Consultation } from '../types';

const CONSULTATIONS_QUERY_KEY = ['consultations'] as const;

/**
 * Hook to fetch all consultations
 */
export const useGetConsultations = () =>
  useQuery({
    queryKey: CONSULTATIONS_QUERY_KEY,
    queryFn: consultationsApi.getConsultations,
  });

/**
 * Hook to fetch a single consultation by ID
 */
export const useGetConsultationById = (id: string | undefined) =>
  useQuery({
    queryKey: [CONSULTATIONS_QUERY_KEY, id],
    queryFn: () => consultationsApi.getConsultationById(id!),
    enabled: !!id,
  });

/**
 * Hook to fetch all consultations for a specific pet
 */
export const useGetConsultationsByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [CONSULTATIONS_QUERY_KEY, 'pet', petId],
    queryFn: () => consultationsApi.getConsultationsByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new consultation
 */
export const useCreateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Consultation, 'id' | 'created_at'>) =>
      consultationsApi.createConsultation(data),
    onSuccess: (newConsultation) => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [CONSULTATIONS_QUERY_KEY, 'pet', newConsultation.pet_id],
      });
    },
  });
};

/**
 * Hook to update an existing consultation
 */
export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Consultation> }) =>
      consultationsApi.updateConsultation(id, data),
    onSuccess: (updatedConsultation) => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [CONSULTATIONS_QUERY_KEY, updatedConsultation.id],
      });
      queryClient.invalidateQueries({
        queryKey: [CONSULTATIONS_QUERY_KEY, 'pet', updatedConsultation.pet_id],
      });
    },
  });
};

/**
 * Hook to delete a consultation
 */
export const useDeleteConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => consultationsApi.deleteConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEY });
    },
  });
};
